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
