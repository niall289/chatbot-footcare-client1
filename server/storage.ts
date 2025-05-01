import { db } from "@db";
import { consultations } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { InsertConsultation, Consultation } from "@shared/schema";

export const storage = {
  // Create a new consultation
  async createConsultation(data: InsertConsultation): Promise<Consultation> {
    const [newConsultation] = await db.insert(consultations)
      .values(data)
      .returning();
    
    return newConsultation;
  },

  // Get a consultation by ID
  async getConsultationById(id: number): Promise<Consultation | undefined> {
    const consultation = await db.query.consultations.findFirst({
      where: eq(consultations.id, id)
    });
    
    return consultation || undefined;
  },

  // Update an existing consultation
  async updateConsultation(id: number, data: Partial<InsertConsultation>): Promise<Consultation> {
    const [updatedConsultation] = await db
      .update(consultations)
      .set(data)
      .where(eq(consultations.id, id))
      .returning();
    
    return updatedConsultation;
  },

  // Get all consultations (with optional pagination)
  async getAllConsultations(page = 1, limit = 10): Promise<Consultation[]> {
    const consultationList = await db.query.consultations.findMany({
      limit,
      offset: (page - 1) * limit,
      orderBy: consultations.createdAt
    });
    
    return consultationList;
  }
};
