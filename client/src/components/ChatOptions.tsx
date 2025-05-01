import { FC } from "react";
import NurseAvatar from "./NurseAvatar";

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
      <NurseAvatar size="sm" />
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
