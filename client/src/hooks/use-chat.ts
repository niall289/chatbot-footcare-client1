import { useState, useEffect, useCallback } from "react";
import { chatFlow, chatStepToField, type ChatOption } from "@/lib/chatFlow";
import { nameSchema, phoneSchema, emailSchema } from "@shared/schema";

interface Message {
  text: string;
  type: "bot" | "user";
  isTyping?: boolean;
}

interface UseChatProps {
  onSaveData: (data: Record<string, any>, isComplete: boolean) => void;
}

export function useChat({ onSaveData }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState("welcome");
  const [options, setOptions] = useState<ChatOption[] | null>(null);
  const [inputType, setInputType] = useState<'text' | 'tel' | 'email' | 'textarea' | null>(null);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [userData, setUserData] = useState<Record<string, any>>({});
  const [conversationLog, setConversationLog] = useState<{step: string, response: string}[]>([]);
  
  const addMessage = useCallback((text: string, type: "bot" | "user", isTyping = false) => {
    setMessages(prev => [...prev, { text, type, isTyping }]);
  }, []);
  
  const processStep = useCallback((stepId: string) => {
    const step = chatFlow[stepId];
    if (!step) return;
    
    setCurrentStep(stepId);
    
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
  }, [addMessage]);
  
  const setupStepInput = useCallback((step: any) => {
    if (step.options) {
      setOptions(step.options);
      setInputType(null);
    } else if (step.input) {
      setInputType(step.input);
      setOptions(null);
    } else {
      setOptions(null);
      setInputType(null);
      const nextStepId = typeof step.next === 'function' ? step.next("") : step.next;
      processStep(nextStepId);
    }
    
    setIsWaitingForResponse(false);
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
      processStep(nextStepId);
    }, 500);
  }, [currentStep, addMessage, processStep]);
  
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
      processStep(nextStepId);
    }, 500);
  }, [currentStep, addMessage, processStep]);
  
  // Update user data and save to parent component
  const updateUserData = useCallback((step: string, value: string, displayValue: string) => {
    // Map step to database field
    const field = chatStepToField[step];
    
    const updatedData = { ...userData };
    if (field) {
      updatedData[field] = value;
    }
    
    // Update conversation log
    const updatedLog = [...conversationLog, { step, response: value }];
    setConversationLog(updatedLog);
    
    setUserData(updatedData);
    
    // Determine if this is a complete submission point
    const isComplete = step === "previous_treatment" || step === "transfer_whatsapp";
    
    // Call parent callback with data
    onSaveData({ 
      ...updatedData, 
      conversationLog: updatedLog 
    }, isComplete);
  }, [userData, conversationLog, onSaveData]);
  
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
  
  return {
    messages,
    options,
    inputType,
    currentData: userData,
    isInputDisabled: isWaitingForResponse || inputType === null,
    isWaitingForResponse,
    handleUserInput,
    handleOptionSelect,
    validate,
    currentStep
  };
}
