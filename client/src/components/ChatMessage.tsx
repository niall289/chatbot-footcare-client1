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
            className="h-4 w-4 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
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
