import { FC, useEffect, useState } from "react";
import NurseAvatar from "./NurseAvatar";

interface ChatMessageProps {
  message: string;
  type: "bot" | "user";
  isTyping?: boolean;
}

const ChatMessage: FC<ChatMessageProps> = ({ message, type, isTyping = false }) => {
  // To prevent persistent typing indicators, let's add a timeout
  const [isStillTyping, setIsStillTyping] = useState(isTyping);

  useEffect(() => {
    setIsStillTyping(isTyping);

    // If it's typing, set a maximum timeout to prevent it getting stuck
    if (isTyping) {
      const timer = setTimeout(() => {
        setIsStillTyping(false);
      }, 5000); // Max 5 seconds of typing animation

      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  if (type === "bot") {
    return (
      <div className="flex items-start mb-4">
        <NurseAvatar size="sm" />
        <div className="ml-3 bg-white rounded-lg py-2 px-4 max-w-[80%] shadow-sm bounce-in">
          {isStillTyping ? (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <p className="text-sm text-gray-800">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-end mb-4">
      <div className="mr-3 bg-primary text-white rounded-lg py-2 px-4 max-w-[80%] shadow-sm bounce-in">
        <p className="text-sm">{message}</p>
      </div>
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 text-gray-600" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
          />
        </svg>
      </div>
    </div>
  );
};

export default ChatMessage;