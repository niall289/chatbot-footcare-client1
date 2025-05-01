// Define the conversation flow for the Nail Surgery Clinic
const conversationFlow = {
  'welcome': {
    message: "👋 Hello! I'm Niamh from Nail Surgery Clinic. I'd like to gather some information about your nail concerns. What's your name?",
    nextStep: 'name'
  },
  'name': {
    message: "Great! Now, could you please provide your phone number?",
    nextStep: 'phone',
    saveAs: 'name'
  },
  'phone': {
    message: "Thank you! Please share your email address:",
    nextStep: 'email',
    saveAs: 'phone',
    // Simple validation for phone numbers
    validate: (input) => {
      const phoneRegex = /^\d{10,15}$/;
      return phoneRegex.test(input.replace(/\D/g, ''));
    },
    errorMessage: "Please provide a valid phone number (10-15 digits)"
  },
  'email': {
    message: "What type of nail concern brings you to our clinic today? Please reply with one of the following numbers:\n1 - Ingrown toenail\n2 - Fungal nail infection\n3 - Thickened/deformed nail\n4 - Pincer nail\n5 - Nail trauma/injury\n6 - Other nail issue",
    nextStep: 'issue_category',
    saveAs: 'email',
    // Simple validation for email
    validate: (input) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(input);
    },
    errorMessage: "Please provide a valid email address"
  },
  'issue_category': {
    message: (input) => {
      // Map numeric selections to categories
      const categories = {
        '1': 'ingrown',
        '2': 'fungal',
        '3': 'thickened',
        '4': 'pincer',
        '5': 'trauma',
        '6': 'other'
      };
      
      const category = categories[input] || 'unknown';
      
      // Different follow-up questions based on selection
      if (category === 'ingrown') {
        return "Where is the ingrown toenail located? Reply with one of these options:\n1 - Big toe (left foot)\n2 - Big toe (right foot)\n3 - Big toes (both feet)\n4 - Other toe";
      } else if (category === 'fungal') {
        return "How many nails are affected by the fungal infection? Reply with one of these options:\n1 - Just one nail\n2 - 2-3 nails\n3 - 4 or more nails\n4 - All/most of my toenails";
      } else if (category === 'thickened') {
        return "Which toenails are thickened or deformed? Reply with one of these options:\n1 - Big toenail(s)\n2 - Several toenails\n3 - All toenails";
      } else if (category === 'pincer') {
        return "Which toenail is affected by the pincer nail condition? Reply with one of these options:\n1 - Big toe (left foot)\n2 - Big toe (right foot)\n3 - Big toes (both feet)\n4 - Other toe(s)";
      } else if (category === 'trauma') {
        return "What type of trauma or injury has affected your nail? Reply with one of these options:\n1 - Impact injury/stubbing\n2 - Crushing injury\n3 - Torn nail\n4 - Other trauma";
      } else if (category === 'other') {
        return "Please briefly describe your nail concern:";
      } else {
        return "I didn't understand your selection. Please reply with a number from 1-6 to indicate your nail concern.";
      }
    },
    nextStep: (input) => {
      // Map numeric selections to the appropriate next step
      const categories = {
        '1': 'ingrown_specifics',
        '2': 'fungal_specifics',
        '3': 'thickened_specifics',
        '4': 'pincer_specifics',
        '5': 'trauma_specifics',
        '6': 'other_specifics'
      };
      
      return categories[input] || 'issue_category'; // If invalid, repeat the question
    },
    saveAs: 'issueCategory'
  },
  'ingrown_specifics': {
    message: "How would you describe the severity of your ingrown toenail? Reply with one of these options:\n1 - Mild - some pain/discomfort\n2 - Moderate - painful with redness\n3 - Severe - very painful with infection",
    nextStep: 'ingrown_severity',
    saveAs: 'ingrowLocation'
  },
  'ingrown_severity': {
    message: "How long have you been experiencing this issue? Reply with one of these options:\n1 - Less than a week\n2 - 1-4 weeks\n3 - 1-3 months\n4 - More than 3 months",
    nextStep: 'ingrown_duration',
    saveAs: 'issueSeverity'
  },
  'ingrown_duration': {
    message: "On a scale from 1-10, how would you rate your pain? Reply with one of these options:\n1 - 0 (No pain)\n2 - 1-3 (Mild)\n3 - 4-6 (Moderate)\n4 - 7-10 (Severe)",
    nextStep: 'pain_level',
    saveAs: 'issueDuration'
  },
  'fungal_specifics': {
    message: "How long have you noticed the fungal infection? Reply with one of these options:\n1 - Less than 1 month\n2 - 1-6 months\n3 - 6-12 months\n4 - More than a year",
    nextStep: 'fungal_duration',
    saveAs: 'fungalExtent'
  },
  'fungal_duration': {
    message: "Have you previously received treatment for this nail condition? Reply with one of these options:\n1 - Yes, from a podiatrist\n2 - Yes, from a GP/doctor\n3 - Yes, self-treatment only\n4 - No, never treated",
    nextStep: 'treatment_history',
    saveAs: 'issueDuration'
  },
  'thickened_specifics': {
    message: "On a scale from 1-10, how would you rate your pain? Reply with one of these options:\n1 - 0 (No pain)\n2 - 1-3 (Mild)\n3 - 4-6 (Moderate)\n4 - 7-10 (Severe)",
    nextStep: 'pain_level',
    saveAs: 'thickenedLocation'
  },
  'pincer_specifics': {
    message: "How severe would you say your pincer nail condition is? Reply with one of these options:\n1 - Mild - slightly curved\n2 - Moderate - noticeably curved\n3 - Severe - extremely curved/painful",
    nextStep: 'pincer_severity',
    saveAs: 'pincerLocation'
  },
  'pincer_severity': {
    message: "On a scale from 1-10, how would you rate your pain? Reply with one of these options:\n1 - 0 (No pain)\n2 - 1-3 (Mild)\n3 - 4-6 (Moderate)\n4 - 7-10 (Severe)",
    nextStep: 'pain_level',
    saveAs: 'issueSeverity'
  },
  'trauma_specifics': {
    message: "When did this injury occur? Reply with one of these options:\n1 - Within last 24 hours\n2 - 1-7 days ago\n3 - 1-4 weeks ago\n4 - More than a month ago",
    nextStep: 'trauma_time',
    saveAs: 'traumaType'
  },
  'trauma_time': {
    message: "On a scale from 1-10, how would you rate your pain? Reply with one of these options:\n1 - 0 (No pain)\n2 - 1-3 (Mild)\n3 - 4-6 (Moderate)\n4 - 7-10 (Severe)",
    nextStep: 'pain_level',
    saveAs: 'traumaTime'
  },
  'other_specifics': {
    message: "On a scale from 1-10, how would you rate your pain? Reply with one of these options:\n1 - 0 (No pain)\n2 - 1-3 (Mild)\n3 - 4-6 (Moderate)\n4 - 7-10 (Severe)",
    nextStep: 'pain_level',
    saveAs: 'otherDetails'
  },
  'pain_level': {
    message: "Have you previously received treatment for this nail condition? Reply with one of these options:\n1 - Yes, from a podiatrist\n2 - Yes, from a GP/doctor\n3 - Yes, self-treatment only\n4 - No, never treated",
    nextStep: 'treatment_history',
    saveAs: 'painLevel'
  },
  'treatment_history': {
    message: "Do you have any of the following medical conditions? Reply with one of these options:\n1 - Diabetes\n2 - Poor circulation\n3 - Immune system issues\n4 - None of the above",
    nextStep: 'medical_history',
    saveAs: 'treatmentHistory'
  },
  'medical_history': {
    message: "Is there anything else you'd like to share about your condition? If not, just reply 'no'.",
    nextStep: 'additional_info',
    saveAs: 'medicalHistory'
  },
  'additional_info': {
    message: "Would you like to describe your symptoms in your own words? This will help our specialists prepare for your consultation. Reply with 'yes' or 'no'.",
    nextStep: (input) => {
      return input.toLowerCase() === 'yes' ? 'symptom_description' : 'surgery_explanation';
    },
    saveAs: 'additionalInfo'
  },
  'symptom_description': {
    message: "Please describe your symptoms in detail. Include when they started, any triggers, and how they affect your daily life:",
    nextStep: 'analyzing_symptoms',
    saveAs: 'symptomDescription'
  },
  'analyzing_symptoms': {
    message: "Thank you for describing your symptoms. I'll pass this information to our specialists...",
    nextStep: 'symptom_analysis_handoff'
  },
  'symptom_analysis_handoff': {
    message: "Our nail surgery specialists will review your symptom description during your appointment to provide a thorough assessment. This information helps us prepare for your visit.",
    nextStep: 'surgery_explanation'
  },
  'surgery_explanation': {
    message: "Based on your description, you may benefit from a consultation at our Nail Surgery Clinic. Our specialist will examine your nail and discuss potential treatment options, which may include minor surgical procedures performed under local anesthetic.",
    nextStep: 'surgery_questions'
  },
  'surgery_questions': {
    message: "Do you have any specific questions or concerns about nail surgery procedures? If not, just reply 'no'.",
    nextStep: 'prepare_transfer',
    saveAs: 'surgeryQuestions'
  },
  'prepare_transfer': {
    message: "Thank you for providing this information. Based on what you've shared, I'd like to connect you with our specialist for a more detailed consultation.",
    nextStep: 'transfer_whatsapp'
  },
  'transfer_whatsapp': {
    message: "Would you like me to have one of our specialists reach out to you directly to discuss your case in more detail? Reply with 'yes' or 'no'.",
    nextStep: (input) => {
      return input.toLowerCase() === 'yes' ? 'handoff_confirmation' : 'provide_phone';
    },
    saveAs: 'wantsSpecialistCallback'
  },
  'handoff_confirmation': {
    message: "Great! One of our specialists will contact you within one business day to discuss your case in more detail. Your information has been saved securely.",
    nextStep: 'appointment_scheduling_prompt',
    saveAs: 'handoffConfirmed'
  },
  'appointment_scheduling_prompt': {
    message: "Would you like me to help you schedule an appointment now? Reply with 'yes' or 'no'.",
    nextStep: (input) => {
      return input.toLowerCase() === 'yes' ? 'schedule_appointment' : 'end';
    }
  },
  'schedule_appointment': {
    message: "To schedule an appointment, please let me know your preferred day of the week (Monday-Friday) and time of day (morning, afternoon, or evening).",
    nextStep: 'appointment_preferences',
    saveAs: 'wantsAppointment'
  },
  'appointment_preferences': {
    message: "Thank you for your preferences. A member of our team will contact you shortly to confirm your appointment. Is there anything else I can help you with today?",
    nextStep: (input) => {
      // Almost any response will go to end
      return 'end';
    },
    saveAs: 'appointmentPreferences'
  },
  'provide_phone': {
    message: "You can reach our Nail Surgery Clinic at 01 851 4444 during our operating hours: Monday-Friday 9am-5pm. Thank you for contacting Nail Surgery Clinic!",
    nextStep: 'end'
  },
  'end': {
    message: "Is there anything else I can help you with today? Reply with 'yes' if you have other questions, or 'no' if we've addressed all your concerns.",
    nextStep: (input) => {
      return input.toLowerCase() === 'yes' ? 'restart_prompt' : 'goodbye';
    }
  },
  'restart_prompt': {
    message: "What other information can I help you with? Please choose:\n1 - Ask about our services\n2 - Discuss a different nail issue\n3 - Ask about costs\n4 - Find our location\n5 - Other question",
    nextStep: (input) => {
      // Here you could direct to different information flows
      return 'other_info';
    }
  },
  'other_info': {
    message: "Please go ahead and ask your question, and I'll do my best to help.",
    nextStep: 'final_response',
    saveAs: 'otherQuestion'
  },
  'final_response': {
    message: "Thank you for your question. I've added this to your information and one of our specialists will address this when they contact you. Is there anything else you'd like to know?",
    nextStep: (input) => {
      return 'goodbye';
    }
  },
  'goodbye': {
    message: "Thank you for contacting Nail Surgery Clinic! We look forward to helping you feel better soon. Goodbye! 👋",
    nextStep: 'end_conversation'
  },
  'end_conversation': {
    message: "If you need to speak with us again, simply send a new message to this number. Have a great day!",
    nextStep: 'welcome',
    isEndpoint: true
  }
};

// Get response based on current step
function getResponseForCurrentStep(userSession, message) {
  const currentStep = userSession.current_step || 'welcome';
  const stepConfig = conversationFlow[currentStep];
  
  // For steps that need validation
  if (stepConfig.validate && !stepConfig.validate(message)) {
    return {
      message: stepConfig.errorMessage || "Please provide a valid response.",
      nextStep: currentStep // Stay on the same step if validation fails
    };
  }
  
  // Determine next step (could involve logic based on the message)
  let nextStep = stepConfig.nextStep;
  if (typeof nextStep === 'function') {
    nextStep = nextStep(message);
  }
  
  // Get the message for the next step
  let nextMessage = conversationFlow[nextStep].message;
  if (typeof nextMessage === 'function') {
    nextMessage = nextMessage(message);
  }
  
  return {
    message: nextMessage,
    nextStep: nextStep
  };
}

module.exports = {
  conversationFlow,
  getResponseForCurrentStep
};