import { FC } from "react";

interface Option {
  text: string;
  value: string;
}

interface ChatOptionsProps {
  options: Option[];
  onSelect: (option: Option) => void;
}

const ChatOptions: FC<ChatOptionsProps> = ({ options, onSelect }) => {
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
      <div className="ml-3 w-full max-w-[90%]">
        <div className="chat-options grid grid-cols-1 gap-2">
          {options.map((option, index) => (
            <button 
              key={index}
              className="text-left bg-white hover:bg-gray-50 text-gray-800 font-medium py-2 px-4 border border-gray-300 rounded-lg shadow-sm transition-all duration-200"
              onClick={() => onSelect(option)}
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatOptions;
