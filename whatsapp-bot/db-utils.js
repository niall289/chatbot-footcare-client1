const { Pool } = require('pg');

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

/**
 * Function to save a completed consultation to the database
 * @param {Object} sessionData - The data collected during the WhatsApp conversation
 * @param {String} phoneNumber - The user's phone number
 */
async function saveConsultation(sessionData, phoneNumber) {
  try {
    const {
      name,
      email,
      issueCategory,
      issueSpecifics,
      issueSeverity,
      issueDuration,
      traumaTime,
      painLevel,
      treatmentHistory,
      medicalHistory,
      symptomDescription,
      surgeryQuestions,
      appointmentPreferences,
      wantsSpecialistCallback,
      additionalInfo
    } = sessionData;

    // Insert into consultations table
    const result = await pool.query(
      `INSERT INTO consultations (
        phone_number, 
        name, 
        email, 
        issue_category, 
        issue_specifics, 
        issue_severity, 
        issue_duration, 
        trauma_time, 
        pain_level, 
        treatment_history, 
        medical_history, 
        symptom_description, 
        surgery_questions, 
        appointment_preferences, 
        wants_specialist_callback, 
        additional_info, 
        conversation_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING id`,
      [
        phoneNumber,
        name || null,
        email || null,
        issueCategory || null,
        issueSpecifics || null,
        issueSeverity || null,
        issueDuration || null,
        traumaTime || null,
        painLevel || null,
        treatmentHistory || null,
        medicalHistory || null,
        symptomDescription || null,
        surgeryQuestions || null,
        appointmentPreferences || null,
        wantsSpecialistCallback === 'yes' || false,
        additionalInfo || null,
        JSON.stringify(sessionData)
      ]
    );

    console.log(`Saved consultation with ID: ${result.rows[0].id}`);
    return result.rows[0].id;
  } catch (error) {
    console.error('Error saving consultation:', error);
    throw error;
  }
}

/**
 * Function to check if a session is complete and should be saved as a consultation
 * @param {String} currentStep - The current step in the conversation flow
 * @returns {Boolean} - Whether the session is complete
 */
function isSessionComplete(currentStep) {
  // Define steps that indicate the end of a meaningful consultation
  const completionSteps = [
    'handoff_confirmation',
    'provide_phone',
    'appointment_preferences',
    'goodbye'
  ];
  
  return completionSteps.includes(currentStep);
}

/**
 * Query to find all consultations for a specific phone number
 * @param {String} phoneNumber - The user's phone number
 * @returns {Array} - Array of consultation objects
 */
async function getConsultationsByPhone(phoneNumber) {
  try {
    const result = await pool.query(
      'SELECT * FROM consultations WHERE phone_number = $1 ORDER BY created_at DESC',
      [phoneNumber]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error getting consultations:', error);
    throw error;
  }
}

module.exports = {
  pool,
  saveConsultation,
  isSessionComplete,
  getConsultationsByPhone
};