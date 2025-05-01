import { pgTable, text, serial, timestamp, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Chat consultation related tables
export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  issueCategory: text("issue_category").notNull(),
  issueSpecifics: text("issue_specifics"),
  painDuration: text("pain_duration"),
  painSeverity: text("pain_severity"),
  additionalInfo: text("additional_info"),
  previousTreatment: text("previous_treatment"),
  transferredToWhatsApp: text("transferred_to_whatsapp"),
  hasImage: text("has_image"),
  imageAnalysis: json("image_analysis").$type<{
    condition: string,
    severity: string,
    recommendations: string[],
    disclaimer: string
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  conversationLog: json("conversation_log").$type<{step: string, response: string}[]>(),
});

export const insertConsultationSchema = createInsertSchema(consultations, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  phone: (schema) => schema.min(10, "Phone number must be at least 10 digits"),
  email: (schema) => schema.email("Please provide a valid email address"),
});

export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type Consultation = typeof consultations.$inferSelect;

// Validation schemas for specific input types
export const nameSchema = z.string().min(2, "Name must be at least 2 characters");
export const phoneSchema = z.string().min(10, "Phone number must be at least 10 digits").regex(/^\d{10,15}$/, "Please enter a valid phone number (10-15 digits)");
export const emailSchema = z.string().email("Please provide a valid email address");
