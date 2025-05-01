const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { conversationFlow, getResponseForCurrentStep } = require('./conversationFlow');
const { pool, saveConsultation, isSessionComplete } = require('./db-utils');
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Database connection is initialized in db-utils.js

// WhatsApp API configuration
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0/';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Handle incoming messages from WhatsApp
app.post('/webhook', async (req, res) => {
  try {
    // Verify webhook
    if (req.body.object) {
      if (
        req.body.entry &&
        req.body.entry[0].changes &&
        req.body.entry[0].changes[0] &&
        req.body.entry[0].changes[0].value.messages &&
        req.body.entry[0].changes[0].value.messages[0]
      ) {
        const phoneNumberId = req.body.entry[0].changes[0].value.metadata.phone_number_id;
        const from = req.body.entry[0].changes[0].value.messages[0].from;
        const msgBody = req.body.entry[0].changes[0].value.messages[0].text.body;
        
        console.log(`Received message from ${from}: ${msgBody}`);
        
        // Process the message and get a response
        const response = await processMessage(from, msgBody);
        
        // Send response back to user
        await sendWhatsAppMessage(phoneNumberId, from, response);
      }
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.sendStatus(500);
  }
});

// Webhook verification (required by WhatsApp Business API)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      console.log('Webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('WhatsApp Bot is running');
});

// Process incoming messages and determine response
async function processMessage(from, message) {
  try {
    // Get or create user session
    const userSession = await getUserSession(from);
    
    // Determine which step in the conversation flow
    const nextResponse = getResponseForCurrentStep(userSession, message);
    
    // Update user session with new state
    await updateUserSession(from, nextResponse.nextStep, message);
    
    return nextResponse.message;
  } catch (error) {
    console.error('Error processing message:', error);
    return "I'm sorry, I'm having trouble processing your request. Please try again later.";
  }
}

// Send message using WhatsApp API
async function sendWhatsAppMessage(phoneNumberId, to, message) {
  try {
    console.log(`Sending message to ${to}: ${message}`);
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

// Get or create a session for a user
async function getUserSession(phoneNumber) {
  try {
    const result = await pool.query(
      'SELECT * FROM whatsapp_sessions WHERE phone_number = $1',
      [phoneNumber]
    );
    
    if (result.rows.length > 0) {
      return result.rows[0];
    }
    
    // Create new session
    const newSession = await pool.query(
      'INSERT INTO whatsapp_sessions (phone_number, current_step, data) VALUES ($1, $2, $3) RETURNING *',
      [phoneNumber, 'welcome', {}]
    );
    
    return newSession.rows[0];
  } catch (error) {
    console.error('Error getting user session:', error);
    throw error;
  }
}

// Update user session with new data
async function updateUserSession(phoneNumber, nextStep, message = null) {
  try {
    const session = await getUserSession(phoneNumber);
    const currentStep = session.current_step;
    
    // Update session data if this step saves information
    let data = session.data || {};
    if (conversationFlow[currentStep] && conversationFlow[currentStep].saveAs && message) {
      data[conversationFlow[currentStep].saveAs] = message;
    }
    
    // Update the session in the database
    await pool.query(
      'UPDATE whatsapp_sessions SET current_step = $1, data = $2, updated_at = NOW() WHERE phone_number = $3',
      [nextStep, JSON.stringify(data), phoneNumber]
    );
    
    // If the session has reached a completion point, save as a consultation
    if (isSessionComplete(nextStep)) {
      console.log(`Session reached completion step: ${nextStep}. Saving consultation.`);
      try {
        await saveConsultation(data, phoneNumber);
      } catch (saveError) {
        console.error('Error saving consultation:', saveError);
        // Continue even if saving the consultation fails
      }
    }
  } catch (error) {
    console.error('Error updating user session:', error);
    throw error;
  }
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`WhatsApp bot server running on port ${PORT}`);
});

module.exports = app;