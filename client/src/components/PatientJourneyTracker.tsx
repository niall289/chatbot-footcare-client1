import React from 'react';
import { cn } from '@/lib/utils';

// Define the journey steps for visualization
const journeySteps = [
  { id: 'patient_info', label: 'Personal Info', description: 'Basic contact details' },
  { id: 'symptoms', label: 'Symptoms', description: 'Describe your foot condition' },
  { id: 'photo', label: 'Photos', description: 'Provide images if available' },
  { id: 'analysis', label: 'Analysis', description: 'AI analysis of your condition' },
  { id: 'recommendation', label: 'Recommendations', description: 'Next steps & care plan' },
  { id: 'followup', label: 'Follow-up', description: 'Appointment booking & WhatsApp' }
];

// Map chat flow steps to journey steps for progress tracking
const chatStepToJourneyMap: Record<string, string> = {
  // Personal info steps
  'welcome': 'patient_info',
  'name': 'patient_info',
  'phone': 'patient_info',
  'email': 'patient_info',
  
  // Symptoms steps
  'issue_category': 'symptoms',
  'pain_level': 'symptoms',
  'duration': 'symptoms',
  'symptom_description': 'symptoms',
  'symptom_analysis_results': 'symptoms',
  
  // Photo steps
  'photo_question': 'photo',
  'photo_upload': 'photo',
  'image_analysis_results': 'photo',
  
  // Analysis steps
  'analysis_summary': 'analysis',
  
  // Recommendation steps
  'treatment_options': 'recommendation',
  'preferred_clinic': 'recommendation',
  
  // Follow-up steps
  'appointment_preference': 'followup',
  'previous_treatment': 'followup',
  'transfer_whatsapp': 'followup',
  'whatsapp_handoff': 'followup'
};

interface PatientJourneyTrackerProps {
  currentChatStep: string;
  className?: string;
}

export default function PatientJourneyTracker({ 
  currentChatStep,
  className
}: PatientJourneyTrackerProps) {
  // Determine the current journey step
  const currentJourneyStep = chatStepToJourneyMap[currentChatStep] || 'patient_info';
  
  // Find the index of the current journey step
  const currentIndex = journeySteps.findIndex(step => step.id === currentJourneyStep);
  
  return (
    <div className={cn("w-full px-4 py-3 bg-gray-50 rounded-lg", className)}>
      <h3 className="text-sm font-medium text-primary mb-2">Your Consultation Journey</h3>
      
      {/* Progress bar */}
      <div className="relative h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${Math.max(5, ((currentIndex + 1) / journeySteps.length) * 100)}%` }}
        />
      </div>
      
      {/* Steps visualization */}
      <div className="flex flex-wrap gap-2 justify-between">
        {journeySteps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          
          return (
            <div 
              key={step.id}
              className={cn(
                "flex flex-col items-center transition-all",
                isActive ? "scale-110" : "",
                index > currentIndex + 1 ? "opacity-40" : ""
              )}
            >
              {/* Step indicator */}
              <div 
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full mb-1 text-xs font-medium border-2",
                  isCompleted ? "bg-primary text-white border-primary" : 
                  isActive ? "border-primary text-primary" : 
                  "border-gray-300 text-gray-500 bg-white"
                )}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              
              {/* Step label - only show for current and adjacent steps on mobile */}
              <span 
                className={cn(
                  "text-xs font-medium text-center",
                  isActive ? "text-primary" : "text-gray-600",
                  (index < currentIndex - 1 || index > currentIndex + 1) ? "hidden sm:block" : ""
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Current step description */}
      <div className="mt-3 text-center">
        <span className="text-xs text-gray-500">
          {currentIndex >= 0 && `Currently: ${journeySteps[currentIndex].description}`}
        </span>
      </div>
    </div>
  );
}