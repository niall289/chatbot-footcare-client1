import { useState, useEffect, useCallback, useRef } from "react";
import { chatFlow, chatStepToField, type ChatOption } from "@/lib/chatFlow";
import { nameSchema, phoneSchema, emailSchema, insertConsultationSchema, InsertConsultation } from "@shared/schema";

interface Message {
  text: string;
  type: "bot" | "user";
  isTyping?: boolean;
}

interface UseChatProps {
  onSaveData: (data: Record<string, any>, isComplete: boolean) => void;
  onImageUpload?: (file: File) => Promise<string>;
  consultationId?: number | null;
}

export function useChat({ onSaveData, onImageUpload, consultationId }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState("welcome");
  const [options, setOptions] = useState<ChatOption[] | null>(null);
  const [inputType, setInputType] = useState<'text' | 'tel' | 'email' | 'textarea' | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [userData, setUserData] = useState<Record<string, any>>({});
  const [conversationLog, setConversationLog] = useState<{step: string, response: string}[]>([]);

  const addMessage = useCallback((text: string, type: "bot" | "user", isTyping = false) => {
    setMessages((prev: Message[]) => {
      const isDuplicate = prev.some((msg: Message) =>
        msg.text === text && msg.type === type && !msg.isTyping
      );
      if (isDuplicate) {
        console.log(`Prevented duplicate message: "${text.substring(0, 20)}..."`);
        return prev;
      }
      return [...prev, { text, type, isTyping }];
    });
  }, []);

  const processStepRef = useRef<(stepId: string) => void>(() => {});

  const updateUserData = useCallback((step: string, value: string, displayValue: string) => {
    const field = chatStepToField[step];
    const updatedData = { ...userData };
    if (field) updatedData[field] = value;

    const updatedLog = [...conversationLog, { step, response: value }];
    setConversationLog(updatedLog);
    setUserData(updatedData);

    const isComplete = false;
    onSaveData({
      ...updatedData,
      conversationLog: updatedLog
    }, isComplete);

    const stepConfig = chatFlow[step];
    if (stepConfig?.syncToPortal) {
      sendToAdminPortal({ ...updatedData, conversationLog: updatedLog });
    }
  }, [userData, conversationLog, onSaveData]);

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
  }, []);

  const sendToAdminPortal = useCallback(async (conversationData: Record<string, any>) => {
    try {
      console.log("Sending conversation data to admin portal...");
      const validated = insertConsultationSchema.safeParse(conversationData);
      if (!validated.success) {
        console.error("Validation failed:", validated.error);
        return;
      }

      const response = await fetch("http://localhost:5003/api/webhook/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated.data)
      });

      if (response.ok) {
        console.log("Successfully sent conversation data to admin portal");
      } else {
        console.error("Failed to send data to admin portal:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error sending data to admin portal:", error);
    }
  }, []);

  const processStep = useCallback((stepId: string) => {
    let safeStepId = stepId;
    if (stepId === "name" && userData.name) safeStepId = "phone";
    if (stepId === "phone" && userData.phone) safeStepId = "email";

    const step = chatFlow[safeStepId];
    if (!step) return;

    let resolvedMessageText: string = typeof step.message === 'function' ? step.message(userData) : step.message;
    if (messages.some((m: Message) => m.text === resolvedMessageText && m.type === "bot")) return;

    setMessages((prev: Message[]) => prev.map((msg: Message) => ({...msg, isTyping: false})));
    setCurrentStep(safeStepId);

    addMessage(resolvedMessageText, "bot");

    setTimeout(() => {
      if (step.end) {
        setOptions(null);
        setInputType(null);
        return;
      }
      step.delay ? setTimeout(() => setupStepInput(step), step.delay) : setupStepInput(step);
    }, 500);
  }, [addMessage, setupStepInput, userData, conversationLog, sendToAdminPortal]);

  useEffect(() => { processStepRef.current = processStep; }, [processStep]);
  useEffect(() => { if (messages.length === 0) processStep("welcome"); }, []);

  const handleOptionSelect = useCallback((option: ChatOption) => {
    const step = chatFlow[currentStep];
    addMessage(option.text, "user");
    updateUserData(currentStep, option.value, option.text);
    setOptions(null);
    setIsWaitingForResponse(true);

    setTimeout(() => {
      let nextStepId = typeof step.next === 'function' ? step.next(option.value) : step.next;
      if (nextStepId === "name" && userData.name) nextStepId = "phone";
      if (nextStepId === "phone" && userData.phone) nextStepId = "email";
      if (nextStepId) processStep(nextStepId);
    }, 500);
  }, [currentStep, addMessage, processStep, updateUserData, userData]);

  const handleUserInput = useCallback((value: string) => {
    const step = chatFlow[currentStep];
    addMessage(value, "user");
    updateUserData(currentStep, value, value);
    setInputType(null);
    setIsWaitingForResponse(true);

    setTimeout(() => {
      let nextStepId = typeof step.next === 'function' ? step.next(value) : step.next;
      if (nextStepId === "name" && userData.name) nextStepId = "phone";
      if (nextStepId === "phone" && userData.phone) nextStepId = "email";
      if (nextStepId) processStep(nextStepId);
    }, 500);
  }, [currentStep, addMessage, processStep, updateUserData, userData]);

  const validate = useCallback((value: string) => {
    if (!inputType) return { isValid: true };
    const step = chatFlow[currentStep];
    if (step.validation) {
      const isValid = step.validation(value);
      return { isValid, errorMessage: isValid ? undefined : step.errorMessage };
    }

    if (inputType === 'text' && currentStep === 'name') {
      const result = nameSchema.safeParse(value);
      return { isValid: result.success, errorMessage: result.success ? undefined : "Name must be at least 2 characters" };
    }
    if (inputType === 'tel') {
      const result = phoneSchema.safeParse(value);
      return { isValid: result.success, errorMessage: result.success ? undefined : "Please enter a valid phone number (10-15 digits)" };
    }
    if (inputType === 'email') {
      const result = emailSchema.safeParse(value);
      return { isValid: result.success, errorMessage: result.success ? undefined : "Please enter a valid email address" };
    }
    return { isValid: true };
  }, [currentStep, inputType]);

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
    validate,
    currentStep
  };
}
