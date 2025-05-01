-- WhatsApp bot database schema

-- Table to store WhatsApp session data
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  current_step TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index on phone_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_phone ON whatsapp_sessions(phone_number);

-- Table to store completed consultations
CREATE TABLE IF NOT EXISTS consultations (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL,
  name TEXT,
  email TEXT,
  issue_category TEXT,
  issue_specifics TEXT,
  issue_severity TEXT,
  issue_duration TEXT,
  trauma_time TEXT,
  pain_level TEXT,
  treatment_history TEXT,
  medical_history TEXT,
  symptom_description TEXT,
  surgery_questions TEXT,
  appointment_preferences TEXT,
  wants_specialist_callback BOOLEAN DEFAULT FALSE,
  additional_info TEXT,
  conversation_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index on phone_number for consultations
CREATE INDEX IF NOT EXISTS idx_consultations_phone ON consultations(phone_number);