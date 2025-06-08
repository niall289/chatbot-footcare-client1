import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/use-chat";
import ChatMessage from "./ChatMessage";
import ChatOptions from "./ChatOptions";
import UserInput from "./UserInput";
import ImageUploader from "./ImageUploader";
import { Button } from "@/components/ui/button";
import NurseAvatar from "./NurseAvatar";
import PatientJourneyTracker from "./PatientJourneyTracker";
import AnalysisResults from "./AnalysisResults";
import { CalendarEmbed } from "./CalendarEmbed";
import type { Consultation } from "@shared/schema";

interface ChatInterfaceProps {
  consultationId: number | null;
  consultation: Consultation | undefined;
  onCreateConsultation: (data: Partial<Consultation>) => void;
  onUpdateConsultation: (data: Partial<Consultation>) => void;
  onTransferToWhatsApp: () => void;
  isTransferring: boolean;
  // Theme props
  primaryColor?: string;
  botName?: string;
  avatarUrl?: string;
  welcomeMessage?: string; // Note: Welcome message is currently handled by useChat hook
}

const DEFAULT_PRIMARY_COLOR = "hsl(186, 100%, 30%)"; // Default teal color
const DEFAULT_BOT_NAME = "Fiona";
const DEFAULT_AVATAR_URL = ""; // Let NurseAvatar handle default if empty

export default function ChatInterface({
  consultationId,
  consultation,
  onCreateConsultation,
  onUpdateConsultation,
  onTransferToWhatsApp,
  isTransferring,
  primaryColor = DEFAULT_PRIMARY_COLOR,
  botName = DEFAULT_BOT_NAME,
  avatarUrl = DEFAULT_AVATAR_URL,
  // welcomeMessage prop is available but not directly used here yet
}: ChatInterfaceProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showWhatsAppButton, setShowWhatsAppButton] = useState(false);

  // Use a stable chat hook instance
  const {
    messages,
    options,
    inputType,
    showImageUpload,
    currentData,
    isInputDisabled,
    isWaitingForResponse,
    handleUserInput,
    handleOptionSelect,
    handleImageUpload,
    handleSymptomAnalysis,
    validate,
    currentStep
  } = useChat({
    consultationId,
    onSaveData: (data, isComplete) => {
      if (isComplete && !consultationId) {
        onCreateConsultation(data);
      } else if (consultationId) {
        onUpdateConsultation(data);
      }

      if (currentStep === "whatsapp_handoff") {
        setShowWhatsAppButton(true);
      }
    },
    onImageUpload: async (file) => {
      // Convert the file to a base64 string
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          // The image will be stored as base64 for now
          // In a production environment, you'd likely upload this to a server
          resolve(base64String);
        };
        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };
        reader.readAsDataURL(file);
      });
    }
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, options]);

  return (
    <div
      className="w-full md:max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col
                 h-screen md:h-[700px] md:max-h-[90vh] fixed md:static bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-auto" // Responsive sizing
      style={{ fontFamily: "'Inter', sans-serif" }} // Apply modern font
    >
      {/* Chat Header */}
      <div
        className="px-6 py-4 flex items-center shadow-md"
        style={{ backgroundColor: primaryColor }}
      >
        <NurseAvatar size="md" avatarUrl={avatarUrl} />
        <div className="ml-3">
          <h2 className="text-white font-semibold text-lg">{botName}</h2>
          <p className="text-white opacity-80 text-sm">FootCare Clinic Assistant</p> {/* Adjusted text color for better contrast */}
        </div>
        <div className="ml-auto">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Online
          </span>
        </div>
      </div>

      {/* Patient Journey Tracker */}
      {currentStep && currentStep !== 'welcome' && (
        <PatientJourneyTracker
          currentChatStep={currentStep}
          className="mx-2 mt-2 md:mx-4 md:mt-3" // Adjusted margins
          primaryColor={primaryColor} // Pass primaryColor
        />
      )}

      {/* Chat Messages Container */}
      <div 
        ref={chatContainerRef}
        className="chat-container flex-1 overflow-y-auto p-4 bg-gradient-to-br from-white to-slate-50" // Light gradient background
        style={{ paddingBottom: '1rem' }} // Ensure padding at the very bottom
      >
        <div className="space-y-3"> {/* Adjusted spacing between messages */}
          {messages.map((message, index) => (
            <ChatMessage 
              key={index}
              message={message.text}
              type={message.type}
              isTyping={message.isTyping}
              primaryColor={primaryColor} // Pass primaryColor
            />
          ))}

          {options && options.length > 0 && (
            <ChatOptions options={options} onSelect={handleOptionSelect} primaryColor={primaryColor} /> // Pass primaryColor
          )}

          {/* Display AnalysisResults when foot image analysis is available */}
          {currentData && currentData.footAnalysis && 
            (currentStep === "image_analysis_results" || currentStep === "image_analysis_confirmation") && (
            <div className="mt-4">
              <AnalysisResults 
                analysis={currentData.footAnalysis}
                className="animate-fadeIn"
              />
            </div>
          )}
        </div>
      </div>

      {/* User Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {showImageUpload ? (
          <ImageUploader
            onImageUpload={handleImageUpload}
            disabled={isWaitingForResponse}
          />
        ) : (
          <UserInput
            type={inputType}
            disabled={isInputDisabled}
            isWaiting={isWaitingForResponse}
            onSubmit={currentStep === "symptom_description" ? handleSymptomAnalysis : handleUserInput}
            validate={validate}
            currentData={currentData}
            primaryColor={primaryColor} // Pass primaryColor
          />
        )}

        {/* WhatsApp Transfer button */}
        {showWhatsAppButton && (
          <div className="mt-4">
            <Button 
              onClick={onTransferToWhatsApp}
              disabled={isTransferring}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-medium py-6 px-4 rounded-lg flex items-center justify-center transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Continue on WhatsApp
            </Button>
          </div>
        )}
      </div>
       {/* Special component rendering */}
        {currentStep === "image_analysis_results" && currentData.footAnalysis && (
          <AnalysisResults analysis={currentData.footAnalysis} />
        )}

        {currentStep === "calendar_booking" && (
          <CalendarEmbed />
        )}
    </div>
  );
}