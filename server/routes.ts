import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as schema from "../../../FootCarePortal-1/shared/schema"; // Corrected relative path
import { z } from "zod";
import { generateNurseImage } from "./services/imageGeneration";
import { analyzeFootImage } from "./services/openai";
import { analyzeSymptoms } from "./services/symptomAnalysis";
import { exportConsultationsToCSV, exportSingleConsultationToCSV } from "./services/csvExport";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for the chatbot
  const apiPrefix = "/api";
  
  // Nurse image endpoint - returns AI-generated image of Fiona
  app.get(`${apiPrefix}/nurse-image`, async (_req, res) => {
    try {
      const imageBase64 = await generateNurseImage();
      res.json({ imageBase64 });
    } catch (error) {
      console.error("Error serving nurse image:", error);
      res.status(500).json({ error: "Failed to generate nurse image" });
    }
  });

  // Create a new consultation
  app.post(`${apiPrefix}/consultations`, async (req, res) => {
    try {
      const validatedData = schema.insertConsultationSchema.parse(req.body);
      const newConsultation = await storage.createConsultation(validatedData);
      return res.status(201).json(newConsultation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating consultation:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update an existing consultation
  app.patch(`${apiPrefix}/consultations/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      const consultation = await storage.getConsultationById(id);
      if (!consultation) {
        return res.status(404).json({ error: 'Consultation not found' });
      }

      const updatedConsultation = await storage.updateConsultation(id, req.body);
      return res.status(200).json(updatedConsultation);
    } catch (error) {
      console.error('Error updating consultation:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get all consultations with pagination
  app.get(`${apiPrefix}/consultations`, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const consultations = await storage.getAllConsultations(page, limit);
      return res.status(200).json(consultations);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get a consultation by ID
  app.get(`${apiPrefix}/consultations/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      const consultation = await storage.getConsultationById(id);
      if (!consultation) {
        return res.status(404).json({ error: 'Consultation not found' });
      }

      return res.status(200).json(consultation);
    } catch (error) {
      console.error('Error fetching consultation:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Analyze foot image using OpenAI
  app.post(`${apiPrefix}/analyze-foot-image`, async (req, res) => {
    // Set a timeout for the request (30 seconds - longer timeout for image analysis)
    const TIMEOUT_MS = 30000;
    let isResponseSent = false;
    
    // Create timeout handler
    const timeoutId = setTimeout(() => {
      if (!isResponseSent) {
        isResponseSent = true;
        console.log('Image analysis timed out after', TIMEOUT_MS, 'ms');
        return res.status(408).json({ 
          error: 'Request timeout', 
          message: 'Image analysis took too long to complete',
          fallback: {
            condition: "Unable to analyze image at this time",
            severity: "unknown",
            recommendations: [
              "Continue with the consultation",
              "Describe your symptoms in detail",
              "Visit a clinic for in-person assessment"
            ],
            disclaimer: "This is a fallback response due to a timeout. Please visit the clinic for proper assessment."
          }
        });
      }
    }, TIMEOUT_MS);
    
    try {
      console.log("=== Starting foot image analysis ===");
      
      // Validate request body
      if (!req.body || !req.body.imageBase64) {
        clearTimeout(timeoutId);
        isResponseSent = true;
        console.error("Missing imageBase64 in request body");
        return res.status(400).json({ error: "Image data is required" });
      }

      // Check if the API key is available
      if (!process.env.OPENAI_API_KEY) {
        console.error("OPENAI_API_KEY is not set in the environment");
        clearTimeout(timeoutId);
        isResponseSent = true;
        return res.status(500).json({ 
          error: 'Configuration error', 
          message: 'OpenAI API key is not configured',
          fallback: {
            condition: "System configuration error",
            severity: "unknown",
            recommendations: [
              "Please contact support to resolve this issue",
              "Continue with the consultation without image analysis",
              "Visit a clinic for in-person assessment"
            ],
            disclaimer: "This is a fallback response due to a configuration error. Please visit the clinic for proper assessment."
          }
        });
      }

      const imageBase64 = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const consultationId = req.body.consultationId;
      
      // Verify the image is properly encoded base64
      try {
        Buffer.from(imageBase64, 'base64');
        console.log("Image validation successful - valid base64 encoding");
      } catch (e) {
        console.error("Invalid base64 encoding in image data", e);
        clearTimeout(timeoutId);
        isResponseSent = true;
        return res.status(400).json({ error: "Invalid image data" });
      }
      
      console.log("Calling OpenAI API for image analysis...");
      
      // Analyze the image using OpenAI
      const analysis = await analyzeFootImage(imageBase64);
      
      console.log("Image analysis successful:", analysis);
      
      // If a consultation ID is provided, save the analysis to the consultation
      if (consultationId) {
        const id = parseInt(consultationId);
        if (!isNaN(id)) {
          const consultation = await storage.getConsultationById(id);
          if (consultation) {
            await storage.updateConsultation(id, {
              image_analysis: JSON.stringify(analysis) // Use snake_case to match schema column
            });
            console.log("Saved analysis to consultation ID:", id);
          }
        }
      }
      
      // Clear the timeout as we're responding now
      clearTimeout(timeoutId);
      
      if (!isResponseSent) {
        isResponseSent = true;
        console.log("=== Foot image analysis completed successfully ===");
        return res.status(200).json(analysis);
      }
    } catch (error) {
      // Enhanced error logging
      console.error('Error analyzing foot image:');
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        if ('status' in error) {
          console.error('OpenAI API Error Status:', (error as any).status);
          
          if ((error as any).status === 429) {
            console.error("RATE LIMIT ERROR: You've exceeded your current quota");
          } else if ((error as any).status === 400) {
            console.error("BAD REQUEST: Invalid parameters or format");
          }
        }
      } else {
        console.error('Unknown error object:', error);
      }
      
      // Clear the timeout since we're responding with an error
      clearTimeout(timeoutId);
      
      if (!isResponseSent) {
        isResponseSent = true;
        console.log("=== Foot image analysis failed ===");
        return res.status(500).json({ 
          error: 'Failed to analyze image', 
          message: error instanceof Error ? error.message : 'Unknown error',
          fallback: {
            condition: "Unable to analyze image at this time",
            severity: "unknown",
            recommendations: [
              "Continue with the consultation",
              "Describe your symptoms in detail",
              "Visit a clinic for in-person assessment"
            ],
            disclaimer: "This is a fallback response due to an API error. Please visit the clinic for proper assessment."
          }
        });
      }
    }
  });

  // Analyze symptoms using AI
  app.post(`${apiPrefix}/analyze-symptoms`, async (req, res) => {
    // Set a timeout for the request (15 seconds)
    const TIMEOUT_MS = 15000;
    let isResponseSent = false;
    
    // Create timeout handler
    const timeoutId = setTimeout(() => {
      if (!isResponseSent) {
        isResponseSent = true;
        console.log('Symptom analysis timed out after', TIMEOUT_MS, 'ms');
        return res.status(408).json({ 
          error: 'Request timeout', 
          message: 'Symptom analysis took too long to complete',
          fallback: {
            potentialConditions: ["Unable to analyze symptoms at this time"],
            severity: "unknown",
            urgency: "unknown",
            recommendation: "Please continue the consultation and visit the clinic for a thorough assessment",
            nextSteps: [
              "Provide detailed symptom information",
              "Book an appointment with a specialist",
              "Avoid self-diagnosis"
            ],
            disclaimer: "This is a fallback response due to a timeout. Please visit the clinic for proper assessment."
          }
        });
      }
    }, TIMEOUT_MS);
    
    try {
      // Validate request body
      if (!req.body || !req.body.symptoms) {
        clearTimeout(timeoutId);
        isResponseSent = true;
        return res.status(400).json({ error: "Symptom description is required" });
      }

      const symptoms = req.body.symptoms;
      const consultationId = req.body.consultationId;
      
      // Analyze the symptoms using AI
      const analysis = await analyzeSymptoms(symptoms);
      
      // If a consultation ID is provided, save the analysis to the consultation
      if (consultationId) {
        const id = parseInt(consultationId);
        if (!isNaN(id)) {
          const consultation = await storage.getConsultationById(id);
          if (consultation) {
            await storage.updateConsultation(id, {
              symptom_analysis: JSON.stringify(analysis) // Use snake_case to match schema column
            });
          }
        }
      }
      
      // Clear the timeout as we're responding now
      clearTimeout(timeoutId);
      
      if (!isResponseSent) {
        isResponseSent = true;
        return res.status(200).json(analysis);
      }
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      
      // Clear the timeout since we're responding with an error
      clearTimeout(timeoutId);
      
      if (!isResponseSent) {
        isResponseSent = true;
        return res.status(500).json({ 
          error: 'Failed to analyze symptoms', 
          message: error instanceof Error ? error.message : 'Unknown error',
          fallback: {
            potentialConditions: ["Unable to analyze symptoms at this time"],
            severity: "unknown",
            urgency: "unknown",
            recommendation: "Please continue the consultation and visit the clinic for a thorough assessment",
            nextSteps: [
              "Provide detailed symptom information", 
              "Book an appointment with a specialist",
              "Avoid self-diagnosis"
            ],
            disclaimer: "This is a fallback response due to an API error. Please visit the clinic for proper assessment."
          }
        });
      }
    }
  });

  // Export all consultations to CSV
  app.get(`${apiPrefix}/consultations/export/csv`, async (_req, res) => {
    try {
      const consultations = await storage.getAllConsultations();
      if (!consultations || consultations.length === 0) {
        return res.status(404).json({ error: 'No consultations found' });
      }

      const csvFilePath = await exportConsultationsToCSV(consultations);
      
      // Send the file for download
      return res.download(csvFilePath, path.basename(csvFilePath), (err) => {
        if (err) {
          console.error('Error sending CSV file:', err);
          return res.status(500).json({ error: 'Failed to download CSV file' });
        }
        
        // Clean up the file after sending (optional)
        // fs.unlinkSync(csvFilePath);
      });
    } catch (error) {
      console.error('Error exporting consultations to CSV:', error);
      return res.status(500).json({ error: 'Failed to export consultations' });
    }
  });

  // Transfer conversation to WhatsApp
  app.post(`${apiPrefix}/consultations/:id/transfer-to-whatsapp`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      const consultation = await storage.getConsultationById(id);
      if (!consultation) {
        return res.status(404).json({ error: 'Consultation not found' });
      }

      const updatedConsultation = await storage.updateConsultation(id, {
        // transferredToWhatsApp: "yes" // Removed as per user feedback
      });

      // In a real-world implementation, this is where we would integrate with WhatsApp
      // Business API to initiate the conversation transfer

      return res.status(200).json({
        success: true,
        message: "Consultation transferred to WhatsApp",
        consultation: updatedConsultation,
        whatsappLink: `https://wa.me/1234567890?text=${encodeURIComponent(`Hi, I'm ${consultation.name}. I contacted the FootCare Clinic about my foot issue.`)}`
      });
    } catch (error) {
      console.error('Error transferring to WhatsApp:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Export a single consultation to CSV
  app.get(`${apiPrefix}/consultations/:id/export/csv`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      const consultation = await storage.getConsultationById(id);
      if (!consultation) {
        return res.status(404).json({ error: 'Consultation not found' });
      }

      const csvFilePath = await exportSingleConsultationToCSV(consultation);
      
      // Send the file for download
      return res.download(csvFilePath, path.basename(csvFilePath), (err) => {
        if (err) {
          console.error('Error sending CSV file:', err);
          return res.status(500).json({ error: 'Failed to download CSV file' });
        }
        
        // Clean up the file after sending (optional)
        // fs.unlinkSync(csvFilePath);
      });
    } catch (error) {
      console.error('Error exporting consultation to CSV:', error);
      return res.status(500).json({ error: 'Failed to export consultation' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
