import { nameSchema, phoneSchema, emailSchema } from "@shared/schema";

export interface ChatOption {
  text: string;
  value: string;
}

export type ChatStep = {
  message: string;
  delay?: number;
  input?: 'text' | 'tel' | 'email' | 'textarea';
  imageUpload?: boolean;
  validation?: (value: string) => boolean;
  errorMessage?: string;
  options?: ChatOption[];
  optional?: boolean;
  showWhatsApp?: boolean;
} & (
  | { end: true; next?: string | ((value: string) => string) }
  | { end?: false; next: string | ((value: string) => string) }
);

export interface ChatFlow {
  [key: string]: ChatStep;
}

export const chatFlow: ChatFlow = {
  welcome: {
    message: "👋 Hello! I'm Fiona, your FootCare Clinic virtual assistant. I'll help gather some information about your foot concerns and connect you with our specialists.",
    next: "intro"
  },
  intro: {
    message: "Before we begin, I'll need to collect some basic information. Rest assured, your data is kept private and secure.",
    next: "name",
    delay: 1000
  },
  name: {
    message: "What's your name?",
    input: "text",
    validation: (value) => nameSchema.safeParse(value).success,
    errorMessage: "Please enter your name (at least 2 characters)",
    next: "phone"
  },
  phone: {
    message: "Great! Now, could you please provide your phone number?",
    input: "tel",
    validation: (value) => phoneSchema.safeParse(value).success,
    errorMessage: "Please enter a valid phone number (10-15 digits)",
    next: "email"
  },
  email: {
    message: "Thank you! Please share your email address:",
    input: "email",
    validation: (value) => emailSchema.safeParse(value).success,
    errorMessage: "Please enter a valid email address",
    next: "preferred_clinic"
  },
  preferred_clinic: {
    message: "Which of our locations would you prefer to visit?",
    options: [
      { text: "Dublin City Centre", value: "dublin_city" },
      { text: "Dundrum", value: "dundrum" },
      { text: "Sandyford", value: "sandyford" },
      { text: "Not sure yet", value: "undecided" }
    ],
    next: "upload_image_prompt"
  },
  upload_image_prompt: {
    message: "Would you like to upload a photo of your foot concern? This can help us provide a more accurate assessment.",
    options: [
      { text: "Yes, I'll upload an image", value: "yes" },
      { text: "No, I prefer not to", value: "no" }
    ],
    next: (value) => {
      if (value === "yes") return "image_upload_instructions";
      return "issue_category";
    }
  },
  image_upload_instructions: {
    message: "Great! Please upload a clear photo of your foot concern. The image should be well-lit and show the affected area clearly. For privacy, avoid including any identifiable features or personal information in the photo.",
    imageUpload: true,
    next: "image_upload_confirmation",
    delay: 1000
  },
  image_upload_confirmation: {
    message: "Thank you for uploading your image. Our AI system is analyzing your foot condition to provide better insights for your consultation. This usually takes a few seconds...",
    next: "image_analysis_results",
    delay: 2000
  },
  image_analysis_results: {
    message: "I've analyzed your foot image, and here's what I can see:",
    next: "image_analysis_recommendations",
    delay: 1500
  },
  image_analysis_recommendations: {
    message: "Based on this analysis, I recommend discussing this with our specialists when you visit. The information you've provided will help them prepare for your appointment.",
    next: "issue_category",
    delay: 1500
  },
  issue_category: {
    message: "What type of foot concern brings you to our clinic today?",
    options: [
      { text: "Pain or discomfort", value: "pain" },
      { text: "Skin issues", value: "skin" },
      { text: "Nail problems", value: "nail" },
      { text: "Structural concerns", value: "structural" },
      { text: "Other concern", value: "other" }
    ],
    next: (value) => {
      if (value === "pain") return "pain_specifics";
      if (value === "skin") return "skin_specifics";
      if (value === "nail") return "nail_specifics";
      if (value === "structural") return "structural_specifics";
      return "other_specifics";
    }
  },
  pain_specifics: {
    message: "Where are you experiencing foot pain?",
    options: [
      { text: "Heel", value: "heel" },
      { text: "Arch", value: "arch" },
      { text: "Ball of foot", value: "ball" },
      { text: "Toes", value: "toes" },
      { text: "Ankle", value: "ankle" },
      { text: "Entire foot", value: "entire" }
    ],
    next: "pain_duration"
  },
  pain_duration: {
    message: "How long have you been experiencing this pain?",
    options: [
      { text: "Less than a week", value: "acute" },
      { text: "1-4 weeks", value: "subacute" },
      { text: "1-3 months", value: "chronic_recent" },
      { text: "More than 3 months", value: "chronic_long" }
    ],
    next: "pain_severity"
  },
  pain_severity: {
    message: "On a scale from 1-10, how would you rate your pain?",
    options: [
      { text: "1-3 (Mild)", value: "mild" },
      { text: "4-6 (Moderate)", value: "moderate" },
      { text: "7-10 (Severe)", value: "severe" }
    ],
    next: "additional_info"
  },
  skin_specifics: {
    message: "What skin issue are you experiencing?",
    options: [
      { text: "Dry/cracked skin", value: "dry" },
      { text: "Calluses/corns", value: "callus" },
      { text: "Warts", value: "warts" },
      { text: "Rash/itching", value: "rash" },
      { text: "Athlete's foot", value: "athletes_foot" },
      { text: "Other skin issue", value: "other_skin" }
    ],
    next: "additional_info"
  },
  nail_specifics: {
    message: "What nail problem are you experiencing?",
    options: [
      { text: "Ingrown toenail", value: "ingrown" },
      { text: "Fungal infection", value: "fungal" },
      { text: "Thickened nails", value: "thick" },
      { text: "Discolored nails", value: "discolored" },
      { text: "Other nail issue", value: "other_nail" }
    ],
    next: "additional_info"
  },
  structural_specifics: {
    message: "What structural concern do you have?",
    options: [
      { text: "Bunions", value: "bunions" },
      { text: "Hammertoes", value: "hammertoes" },
      { text: "Flat feet", value: "flat_feet" },
      { text: "High arches", value: "high_arches" },
      { text: "Other structural issue", value: "other_structural" }
    ],
    next: "additional_info"
  },
  other_specifics: {
    message: "Please briefly describe your foot concern:",
    input: "text",
    validation: (value) => value.trim().length > 0,
    errorMessage: "Please provide a brief description",
    next: "additional_info"
  },
  additional_info: {
    message: "Is there anything else you'd like to share about your condition?",
    input: "textarea",
    optional: true,
    next: "previous_treatment"
  },
  previous_treatment: {
    message: "Have you previously received treatment for this condition?",
    options: [
      { text: "Yes", value: "yes" },
      { text: "No", value: "no" }
    ],
    next: "prepare_transfer"
  },
  prepare_transfer: {
    message: "Thank you for providing this information. Based on what you've shared, I'd like to connect you with our specialist for a more detailed consultation.",
    next: "transfer_whatsapp",
    delay: 1500
  },
  transfer_whatsapp: {
    message: "I can transfer you to our clinic's WhatsApp for a direct conversation with our foot care specialist. Would you like to continue there?",
    options: [
      { text: "Yes, transfer to WhatsApp", value: "transfer" },
      { text: "No, I'll call the clinic", value: "call" }
    ],
    next: (value) => {
      if (value === "transfer") return "whatsapp_handoff";
      return "provide_phone";
    }
  },
  whatsapp_handoff: {
    message: "Great! Click the WhatsApp button below to continue your conversation with our specialist. Your information will be transferred securely.",
    showWhatsApp: true,
    next: "end"
  },
  provide_phone: {
    message: "You can reach our clinic at (555) 123-4567 during our operating hours: Monday-Friday 9am-5pm. Thank you for contacting FootCare Clinic!",
    next: "end"
  },
  end: {
    message: "Is there anything else I can help you with today?",
    options: [
      { text: "No, that's all for now", value: "goodbye" },
      { text: "Yes, I have another question", value: "restart" }
    ],
    next: (value) => {
      if (value === "restart") return "issue_category";
      return "goodbye";
    }
  },
  goodbye: {
    message: "Thank you for contacting FootCare Clinic! We look forward to helping you feel better soon. Goodbye! 👋",
    end: true,
    next: "goodbye" // Adding this to fix TypeScript error, though it won't be used due to end=true
  }
};

export const chatStepToField: Record<string, string> = {
  name: "name",
  phone: "phone",
  email: "email",
  preferred_clinic: "preferredClinic",
  upload_image_prompt: "hasImage",
  issue_category: "issueCategory",
  pain_specifics: "issueSpecifics",
  skin_specifics: "issueSpecifics",
  nail_specifics: "issueSpecifics",
  structural_specifics: "issueSpecifics",
  other_specifics: "issueSpecifics",
  pain_duration: "painDuration",
  pain_severity: "painSeverity",
  additional_info: "additionalInfo",
  previous_treatment: "previousTreatment",
  transfer_whatsapp: "transferredToWhatsApp"
};
