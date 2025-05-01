import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as schema from "@shared/schema";
import { z } from "zod";
import { generateNurseImage } from "./services/imageGeneration";

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
        transferredToWhatsApp: "yes"
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

  const httpServer = createServer(app);

  return httpServer;
}
