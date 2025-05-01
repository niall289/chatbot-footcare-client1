import { useState, useEffect, useCallback, useRef } from "react";
import { chatFlow, chatStepToField, type ChatOption } from "@/lib/chatFlow";
import { nameSchema, phoneSchema, emailSchema } from "@shared/schema";

interface Message {
  text: string;
  type: "bot" | "user";
  isTyping?: boolean;
}

interface UseChatProps {
  onSaveData: (data: Record<string, any>, isComplete: boolean) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export function useChat({ onSaveData, onImageUpload }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState("welcome");
  const [options, setOptions] = useState<ChatOption[] | null>(null);
  const [inputType, setInputType] = useState<'text' | 'tel' | 'email' | 'textarea' | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [userData, setUserData] = useState<Record<string, any>>({});
  const [conversationLog, setConversationLog] = useState<{step: string, response: string}[]>([]);
  
  // Add a message to the chat with duplicate prevention
  const addMessage = useCallback((text: string, type: "bot" | "user", isTyping = false) => {
    // Don't add duplicate messages - especially important for bot messages
    setMessages(prev => {
      // Check if this exact message (same text and type) already exists
      const isDuplicate = prev.some(msg => 
        msg.text === text && 
        msg.type === type && 
        !msg.isTyping
      );
      
      if (isDuplicate) {
        console.log(`Prevented duplicate message: "${text.substring(0, 20)}..."`);
        return prev; // Return unchanged array if duplicate
      }
      
      return [...prev, { text, type, isTyping }];
    });
  }, []);
  
  // Forward declaration for processStep using useRef
  const processStepRef = useRef<(stepId: string) => void>(() => {});
  
  // Update user data and save to parent component
  const updateUserData = useCallback((step: string, value: string, displayValue: string) => {
    // Map step to database field
    const field = chatStepToField[step];
    
    // Make a fresh copy of userData to avoid reference issues
    const updatedData = { ...userData };
    if (field) {
      updatedData[field] = value;
    }
    
    // Update conversation log
    const updatedLog = [...conversationLog, { step, response: value }];
    setConversationLog(updatedLog);
    
    // Update the userData state
    setUserData(updatedData);
    
    // Determine if this is a complete submission point
    const isComplete = step === "previous_treatment" || step === "transfer_whatsapp";
    
    // Call parent callback with data
    onSaveData({ 
      ...updatedData, 
      conversationLog: updatedLog 
    }, isComplete);
  }, [userData, conversationLog, onSaveData]);

  // Handle setup for the current step's input type
  const setupStepInput = useCallback((step: any) => {
    setShowImageUpload(!!step.imageUpload);
    
    if (step.options) {
      setOptions(step.options);
      setInputType(null);
    } else if (step.input) {
      setInputType(step.input);
      setOptions(null);
    } else if (!step.imageUpload) {
      setOptions(null);
      setInputType(null);
      const nextStepId = typeof step.next === 'function' ? step.next("") : step.next;
      if (nextStepId) processStepRef.current(nextStepId);
    }
    
    setIsWaitingForResponse(false);
  }, [processStepRef]);
  
  // Process a step in the chat flow
  const processStep = useCallback((stepId: string) => {
    // Safety check - prevent going back to asking name if we already have it
    let safeStepId = stepId;
    
    // Strict prevention of duplicate steps
    if (stepId === "name" && userData.name) {
      console.log("Prevented duplicate name request in processStep - redirecting to phone step");
      safeStepId = "phone";
    }
    
    // Also prevent phone number being asked twice
    if (stepId === "phone" && userData.phone) {
      console.log("Prevented duplicate phone request in processStep - redirecting to email step");
      safeStepId = "email";
    }
    
    // Detect if we're about to show the same message again 
    // This happens when chat is reinitialized or when there are duplicate steps
    const msgText = chatFlow[safeStepId]?.message;
    if (msgText && messages.some(m => m.text === msgText && m.type === "bot")) {
      console.log(`Message "${msgText.substring(0, 20)}..." already displayed, skipping.`);
      return; // Skip if this exact message has already been shown
    }
    
    const step = chatFlow[safeStepId];
    if (!step) return;
    
    // Clear any previous typing indicators first
    setMessages(prev => prev.map(msg => ({...msg, isTyping: false})));
    
    setCurrentStep(safeStepId);
    
    // Custom handling for image analysis results
    if (safeStepId === "image_analysis_results" && userData.footAnalysis) {
      const analysis = userData.footAnalysis;
      
      // Show bot message
      addMessage(step.message, "bot");
      
      // Display the analysis results after a short delay
      setTimeout(() => {
        const analysisMessage = `
Based on my analysis, it appears you may have ${analysis.condition} 
(${analysis.severity} severity).

Recommendations:
${analysis.recommendations.map((rec: string) => `• ${rec}`).join('\n')}

${analysis.disclaimer}
        `;
        
        addMessage(analysisMessage.trim(), "bot");
        
        // Move to the next step
        if (step.delay) {
          setTimeout(() => {
            setupStepInput(step);
          }, step.delay);
        } else {
          setupStepInput(step);
        }
      }, 1000);
      
      return;
    }
    
    // Custom handling for symptom analysis results
    if (stepId === "symptom_analysis_results" && userData.symptomAnalysisResults) {
      const analysis = userData.symptomAnalysisResults;
      
      // Show bot message
      addMessage(step.message, "bot");
      
      // Display the analysis results after a short delay
      setTimeout(() => {
        const conditionsText = analysis.potentialConditions.length > 1 
          ? `Based on your symptoms, you may have one of the following conditions: ${analysis.potentialConditions.join(", ")}`
          : `Based on your symptoms, you may have ${analysis.potentialConditions[0]}`;
        
        const analysisMessage = `
${conditionsText} 
(${analysis.severity} severity, ${analysis.urgency} priority).

${analysis.recommendation}

Next steps:
${analysis.nextSteps.map((step: string) => `• ${step}`).join('\n')}

${analysis.disclaimer}
        `;
        
        addMessage(analysisMessage, "bot");
        
        // Handle next steps
        if (step.delay) {
          setTimeout(() => {
            setupStepInput(step);
          }, step.delay);
        } else {
          setupStepInput(step);
        }
      }, 1000);
      
      return;
    }
    
    // Standard message handling
    addMessage(step.message, "bot");
    
    // Handle next steps after a short delay
    setTimeout(() => {
      if (step.end) {
        setOptions(null);
        setInputType(null);
        return;
      }
      
      if (step.delay) {
        setTimeout(() => {
          setupStepInput(step);
        }, step.delay);
      } else {
        setupStepInput(step);
      }
    }, 500);
  }, [addMessage, setupStepInput, userData]);
  
  // Update the ref to the actual processStep function
  useEffect(() => {
    processStepRef.current = processStep;
  }, [processStep]);
  
  // Start the conversation - run only ONCE at initialization
  useEffect(() => {
    // Only start the conversation when there are no messages
    // This prevents the chat from restarting on re-renders
    if (messages.length === 0) {
      processStep("welcome");
    }
  }, []);
  
  // Handle user selecting an option
  const handleOptionSelect = useCallback((option: ChatOption) => {
    const step = chatFlow[currentStep];
    
    // Show user selection
    addMessage(option.text, "user");
    
    // Save response
    updateUserData(currentStep, option.value, option.text);
    
    // Clear options
    setOptions(null);
    setIsWaitingForResponse(true);
    
    // Move to next step
    setTimeout(() => {
      // Get the next step ID but validate it's not asking for the name again
      let nextStepId = typeof step.next === 'function' ? step.next(option.value) : step.next;
      
      // Special validation: prevent going back to asking name or phone after we have it
      if (nextStepId === "name" && userData.name) {
        console.log("Prevented duplicate name request in options - redirecting to phone step");
        nextStepId = "phone";
      }
      
      // Prevent phone being asked twice
      if (nextStepId === "phone" && userData.phone) {
        console.log("Prevented duplicate phone request in options - redirecting to email step");
        nextStepId = "email";
      }
      
      if (nextStepId) processStep(nextStepId);
    }, 500);
  }, [currentStep, addMessage, processStep, updateUserData, userData]);
  
  // Handle user submitting input
  const handleUserInput = useCallback((value: string) => {
    const step = chatFlow[currentStep];
    
    // Show user message
    addMessage(value, "user");
    
    // Save response
    updateUserData(currentStep, value, value);
    
    // Clear input
    setInputType(null);
    setIsWaitingForResponse(true);
    
    // Move to next step
    setTimeout(() => {
      // Get the next step ID but validate it's not asking for the name again
      let nextStepId = typeof step.next === 'function' ? step.next(value) : step.next;
      
      // Special validation: prevent going back to asking name after we have it
      if (nextStepId === "name" && userData.name) {
        console.log("Prevented duplicate name request - redirecting to phone step");
        nextStepId = "phone";
      }
      
      // Prevent phone being asked twice
      if (nextStepId === "phone" && userData.phone) {
        console.log("Prevented duplicate phone request - redirecting to email step");
        nextStepId = "email";
      }
      
      if (nextStepId) processStep(nextStepId);
    }, 500);
  }, [currentStep, addMessage, processStep, updateUserData, userData]);
  
  // Validation function for form inputs
  const validate = useCallback((value: string) => {
    if (!inputType) return { isValid: true };
    
    const step = chatFlow[currentStep];
    if (step.validation) {
      const isValid = step.validation(value);
      return { 
        isValid, 
        errorMessage: isValid ? undefined : step.errorMessage 
      };
    }
    
    if (inputType === 'text' && currentStep === 'name') {
      const result = nameSchema.safeParse(value);
      return {
        isValid: result.success,
        errorMessage: result.success ? undefined : "Name must be at least 2 characters"
      };
    }
    
    if (inputType === 'tel') {
      const result = phoneSchema.safeParse(value);
      return {
        isValid: result.success,
        errorMessage: result.success ? undefined : "Please enter a valid phone number (10-15 digits)"
      };
    }
    
    if (inputType === 'email') {
      const result = emailSchema.safeParse(value);
      return {
        isValid: result.success,
        errorMessage: result.success ? undefined : "Please enter a valid email address"
      };
    }
    
    return { isValid: true };
  }, [currentStep, inputType]);
  
  // Handle image uploads
  const handleImageUpload = useCallback(async (file: File) => {
    if (!onImageUpload) {
      console.error("Image upload not supported");
      return;
    }

    setIsWaitingForResponse(true);
    
    try {
      // Upload the image and get the base64 string
      const imageData = await onImageUpload(file);
      
      // Add a confirmation message
      addMessage("Image uploaded successfully", "user");
      
      // Show analysis message
      addMessage("Analyzing your foot image...", "bot");
      
      // Send the image for analysis
      const response = await fetch('/api/analyze-foot-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: imageData,
          consultationId: userData.id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Image analysis failed');
      }
      
      const analysisResult = await response.json();
      
      // Update user data with analysis results
      const updatedData = { 
        ...userData,
        hasImage: "yes",
        imagePath: imageData,
        imageAnalysis: JSON.stringify(analysisResult)
      };
      setUserData(updatedData);
      
      // Store the analysis results for later use
      const analysisData = {
        condition: analysisResult.condition,
        severity: analysisResult.severity,
        recommendations: analysisResult.recommendations,
        disclaimer: analysisResult.disclaimer
      };
      
      // Save the analysis data for later use in the conversation
      // We'll show the detailed analysis when we reach the "image_analysis_results" step
      const currentUserData = { ...userData };
      currentUserData.footAnalysis = analysisData;
      setUserData(currentUserData);
      
      // Move to next step to show the confirmation
      const step = chatFlow[currentStep];
      const nextStepId = typeof step.next === 'function' ? step.next("") : step.next;
      if (nextStepId) processStep(nextStepId);
      
    } catch (error) {
      console.error("Error analyzing image:", error);
      addMessage("I couldn't properly analyze your image. Let's continue with the consultation anyway.", "bot");
      
      // Still move to next step even if analysis fails
      const step = chatFlow[currentStep];
      setTimeout(() => {
        const nextStepId = typeof step.next === 'function' ? step.next("") : step.next;
        if (nextStepId) processStep(nextStepId);
      }, 1500);
    } finally {
      setShowImageUpload(false);
      setIsWaitingForResponse(false);
    }
  }, [currentStep, userData, onImageUpload, addMessage, processStep]);

  // Handle symptom analysis
  const handleSymptomAnalysis = useCallback(async (symptoms: string) => {
    setIsWaitingForResponse(true);
    
    try {
      // Show analysis message
      addMessage("Analyzing your symptoms...", "bot");
      
      // Send the symptoms for analysis
      const response = await fetch('/api/analyze-symptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms,
          consultationId: userData.id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Symptom analysis failed');
      }
      
      const analysisResult = await response.json();
      
      // Update user data with analysis results
      const updatedData = { 
        ...userData,
        hasSymptomDescription: "yes",
        symptomDescription: symptoms,
        symptomAnalysis: JSON.stringify(analysisResult)
      };
      setUserData(updatedData);
      
      // Store the analysis results for later use
      const analysisData = {
        potentialConditions: analysisResult.potentialConditions,
        severity: analysisResult.severity,
        urgency: analysisResult.urgency,
        recommendation: analysisResult.recommendation,
        nextSteps: analysisResult.nextSteps,
        disclaimer: analysisResult.disclaimer
      };
      
      // Save the analysis data for later use in the conversation
      const currentUserData = { ...userData };
      currentUserData.symptomAnalysisResults = analysisData;
      setUserData(currentUserData);
      
      // Move to next step to show the analysis
      const step = chatFlow[currentStep];
      const nextStepId = typeof step.next === 'function' ? step.next("") : step.next;
      if (nextStepId) processStep(nextStepId);
      
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      addMessage("I couldn't properly analyze your symptoms. Let's continue with the consultation anyway.", "bot");
      
      // Still move to next step even if analysis fails
      const step = chatFlow[currentStep];
      setTimeout(() => {
        const nextStepId = typeof step.next === 'function' ? step.next("") : step.next;
        if (nextStepId) processStep(nextStepId);
      }, 1500);
    } finally {
      setIsWaitingForResponse(false);
    }
  }, [currentStep, userData, addMessage, processStep]);

  return {
    messages,
    options,
    inputType,
    showImageUpload,
    currentData: userData,
    isInputDisabled: isWaitingForResponse || inputType === null,
    isWaitingForResponse,
    handleUserInput,
    handleOptionSelect,
    handleImageUpload,
    handleSymptomAnalysis,
    validate,
    currentStep
  };
}