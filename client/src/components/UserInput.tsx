import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface UserInputProps {
  type?: 'text' | 'email' | 'tel' | 'textarea' | null;
  disabled?: boolean;
  isWaiting?: boolean;
  onSubmit: (value: string) => void;
  validate?: (value: string) => { isValid: boolean; errorMessage?: string };
  currentData?: Record<string, any>;
}

export default function UserInput({ 
  type, 
  disabled = false, 
  isWaiting = false,
  onSubmit,
  validate,
  currentData 
}: UserInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Reset value when type changes
  useEffect(() => {
    setValue("");
    setError(undefined);
  }, [type]);
  
  // Focus input when it becomes enabled
  useEffect(() => {
    if (!disabled && type) {
      if (type === 'textarea' && textareaRef.current) {
        textareaRef.current.focus();
      } else if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [disabled, type]);
  
  const handleSubmit = () => {
    if (disabled || !type) return;
    
    if (validate && value.trim().length > 0) {
      const result = validate(value);
      if (!result.isValid) {
        setError(result.errorMessage);
        return;
      }
    }
    
    onSubmit(value);
    setValue("");
    setError(undefined);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (type !== 'textarea') {
        e.preventDefault();
        handleSubmit();
      }
    }
  };
  
  const handleTextareaKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && type === 'textarea') {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  if (!type || (type !== 'textarea' && type !== 'text' && type !== 'email' && type !== 'tel')) {
    // Standard input is hidden or disabled
    return (
      <div className="flex items-center space-x-2">
        <Input 
          type="text" 
          disabled={true}
          placeholder="Waiting for options..."
          className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <Button 
          disabled={true}
          className="bg-primary hover:bg-primary-dark text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-primary-light disabled:opacity-50"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
            />
          </svg>
        </Button>
      </div>
    );
  }
  
  if (type === 'textarea') {
    return (
      <div>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleTextareaKeyPress}
          disabled={disabled || isWaiting}
          placeholder="Type your message..."
          className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-24 resize-none"
        />
        {error && (
          <div className="flex items-center mt-1 text-destructive text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            <span>{error}</span>
          </div>
        )}
        <div className="flex justify-end space-x-2 mt-2">
          <Button 
            variant="outline"
            onClick={() => onSubmit("(Skipped)")}
            disabled={disabled || isWaiting}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Skip
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={disabled || isWaiting}
            className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
          >
            Submit
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center space-x-2">
        <Input 
          ref={inputRef}
          type={type} 
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={disabled || isWaiting}
          placeholder={`Type your ${type === "tel" ? "phone number" : type === "email" ? "email" : "message"}...`}
          className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <Button 
          onClick={handleSubmit}
          disabled={disabled || isWaiting}
          className="bg-primary hover:bg-primary-dark text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-primary-light disabled:opacity-50"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
            />
          </svg>
        </Button>
      </div>
      {error && (
        <div className="flex items-center mt-1 text-destructive text-xs ml-4">
          <AlertCircle className="h-3 w-3 mr-1" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
