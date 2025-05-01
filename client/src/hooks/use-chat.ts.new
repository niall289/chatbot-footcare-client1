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
  
  // Add a message to the chat
  const addMessage = useCallback((text: string, type: "bot" | "user", isTyping = false) => {
    setMessages(prev => [...prev, { text, type, isTyping }]);
  }, []);
  
  // Forward declaration for processStep using useRef
  const processStepRef = useRef<(stepId: string) => void>(() => {});
  
  // Update user data and save to parent component
  const updateUserData = useCallback((step: string, value: string, displayValue: string) => {
    // Map step to database field
    const field = chatStepToField[step];
    
    // Create a new object with the updated data
    const updatedData = { ...userData };
    if (field) {
      updatedData[field] = value;
      console.log(`Updated ${field} with value: ${value}`);
    }
    
    // Update conversation log
    const updatedLog = [...conversationLog, { step, response: value }];
    setConversationLog(updatedLog);
    
    // Update state with new data
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
    const step = chatFlow[stepId];
    if (!step) return;
    
    // Clear any previous typing indicators before adding new messages
    setMessages(prev => prev.map(msg => ({ ...msg, isTyping: false })));
    
    setCurrentStep(stepId);
    
    // Custom handling for image analysis results
    if (stepId === "image_analysis_results" && userData.footAnalysis) {
      const analysis = userData.footAnalysis;
      
      // Show bot message with typing indicator
      addMessage(step.message, "bot", true);
      
      // Replace with actual message after delay
      setTimeout(() => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (lastIndex >= 0 && newMessages[lastIndex].isTyping) {
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              isTyping: false
            };
          }
          return newMessages;
        });
        
        // Display the analysis results
        const analysisMessage = `
Based on my analysis, it appears you may have ${analysis.condition} 
(${analysis.severity} severity).

Recommendations:
${analysis.recommendations.map((rec: string) => `• ${rec}`).join('\n')}

${analysis.disclaimer}
        `;
        
        // Add the analysis message after a short delay
        setTimeout(() => {
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
      }, 1500);
      
      return;
    }
    
    // Custom handling for symptom analysis results
    if (stepId === "symptom_analysis_results" && userData.symptomAnalysisResults) {
      const analysis = userData.symptomAnalysisResults;
      
      // Show bot message with typing indicator
      addMessage(step.message, "bot", true);
      
      // Replace with actual message after delay
      setTimeout(() => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (lastIndex >= 0 && newMessages[lastIndex].isTyping) {
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              isTyping: false
            };
          }
          return newMessages;
        });
        
        // Display the analysis results
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
        
        // Add the analysis message after a short delay
        setTimeout(() => {
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
      }, 1500);
      
      return;
    }
    
    // Standard message handling with auto-complete typing
    const typingTimeoutMS = 1500; // Default typing animation time
    
    // Add a message with typing indicator
    addMessage(step.message, "bot", true);
    
    // Replace with actual message after typing delay
    setTimeout(() => {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (lastIndex >= 0 && newMessages[lastIndex].isTyping) {
          newMessages[lastIndex] = {
            text: step.message,
            type: "bot",
            isTyping: false
          };
        }
        return newMessages;
      });
      
      // Handle next steps
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
    }, 1500);
  }, [addMessage, setupStepInput, userData]);
  
  // Update the ref to the actual processStep function
  useEffect(() => {
    processStepRef.current = processStep;
  }, [processStep]);
  
  // Start the conversation
  useEffect(() => {
    processStep("welcome");
  }, [processStep]);
  
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
      const nextStepId = typeof step.next === 'function' ? step.next(option.value) : step.next;
      if (nextStepId) processStep(nextStepId);
    }, 500);
  }, [currentStep, addMessage, processStep, updateUserData]);
  
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
      const nextStepId = typeof step.next === 'function' ? step.next(value) : step.next;
      if (nextStepId) processStep(nextStepId);
    }, 500);
  }, [currentStep, addMessage, processStep, updateUserData]);
  
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