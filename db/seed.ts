import { db } from "./index";
import * as schema from "@shared/schema";

async function seed() {
  try {
    // Check if any consultations exist
    const existingConsultations = await db.query.consultations.findMany({
      limit: 1,
    });

    // Only seed if the consultations table is empty
    if (existingConsultations.length === 0) {
      console.log("Seeding consultations data...");
      
      // Sample consultations for testing purposes
      const sampleConsultations = [
        {
          name: "John Smith",
          phone: "5551234567",
          email: "john.smith@example.com",
          issueCategory: "pain",
          issueSpecifics: "heel",
          painDuration: "chronic_long",
          painSeverity: "moderate",
          additionalInfo: "Pain is worse in the morning",
          previousTreatment: "yes",
          transferredToWhatsApp: "yes",
          conversationLog: [
            { step: "welcome", response: "next" },
            { step: "name", response: "John Smith" },
            { step: "phone", response: "5551234567" },
            { step: "email", response: "john.smith@example.com" },
            { step: "issue_category", response: "pain" },
            { step: "pain_specifics", response: "heel" },
            { step: "pain_duration", response: "chronic_long" },
            { step: "pain_severity", response: "moderate" },
            { step: "additional_info", response: "Pain is worse in the morning" },
            { step: "previous_treatment", response: "yes" },
            { step: "transfer_whatsapp", response: "transfer" }
          ]
        },
        {
          name: "Maria Garcia",
          phone: "5559876543",
          email: "maria.garcia@example.com",
          issueCategory: "nail",
          issueSpecifics: "ingrown",
          additionalInfo: "Toe is red and tender",
          previousTreatment: "no",
          transferredToWhatsApp: "yes",
          conversationLog: [
            { step: "welcome", response: "next" },
            { step: "name", response: "Maria Garcia" },
            { step: "phone", response: "5559876543" },
            { step: "email", response: "maria.garcia@example.com" },
            { step: "issue_category", response: "nail" },
            { step: "nail_specifics", response: "ingrown" },
            { step: "additional_info", response: "Toe is red and tender" },
            { step: "previous_treatment", response: "no" },
            { step: "transfer_whatsapp", response: "transfer" }
          ]
        }
      ];

      // Insert sample consultations
      for (const consultation of sampleConsultations) {
        await db.insert(schema.consultations).values(consultation);
      }

      console.log("Seed data inserted successfully!");
    } else {
      console.log("Consultations table already has data, skipping seed");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
