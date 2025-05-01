import { FC } from "react";

interface ChatMessageProps {
  message: string;
  type: "bot" | "user";
  isTyping?: boolean;
}

const ChatMessage: FC<ChatMessageProps> = ({ message, type, isTyping = false }) => {
  if (type === "bot") {
    return (
      <div className="flex items-start mb-4">
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5}
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" 
            />
          </svg>
        </div>
        <div className="ml-3 bg-white rounded-lg py-2 px-4 max-w-[80%] shadow-sm bounce-in">
          {isTyping ? (
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
