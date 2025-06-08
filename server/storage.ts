import { db } from "@db"; // db can be null
import { consultations } from "../../../FootCarePortal-1/shared/schema"; 
import { eq, desc } from "drizzle-orm";
import type { InsertConsultation, Consultation } from "../../../FootCarePortal-1/shared/schema"; 

const DB_UNAVAILABLE_WARNING_CHATBOT = "Chatbot DB not available. Operating in mock/limited mode. Data will not be persisted.";

const logMockWarningChatbot = (methodName: string, data?: any) => {
  console.warn(`[Chatbot Storage - ${methodName}] ${DB_UNAVAILABLE_WARNING_CHATBOT}`);
  if (data) {
    console.log(`[Chatbot Storage - ${methodName}] Mock operation with data:`, JSON.stringify(data, null, 2));
  }
};

const formatConversationLogForDb = (log: any): { step: string; response: string }[] => {
  if (Array.isArray(log)) {
    return log.filter(item => typeof item === 'object' && item !== null && 'step' in item && 'response' in item)
              .map(item => ({ step: String(item.step || 'unknown'), response: String(item.response || '') }));
  }
  return [];
};

const formatJsonFieldForDb = (field: any): string | null => {
  if (field === undefined || field === null) return null;
  if (typeof field === 'string' && (field.trim().startsWith('{') || field.trim().startsWith('['))) {
    return field; 
  }
  try {
    return JSON.stringify(field);
  } catch (e) {
    console.error("Error stringifying JSON field for DB:", e);
    return null;
  }
};

export const storage = {
  async createConsultation(data: InsertConsultation): Promise<Consultation> {
    if (!db) {
      logMockWarningChatbot('createConsultation', data);
      const now = new Date();
      // Mock using camelCase properties to match Consultation type
      const mockConsultation: Consultation = {
        id: Date.now(),
        name: data.name || 'Mock User',
        email: data.email, 
        phone: data.phone, 
        preferredClinic: data.preferredClinic || null,
        issueCategory: data.issueCategory || 'general', 
        issueSpecifics: data.issueSpecifics || null,
        painDuration: data.painDuration || null,
        painSeverity: data.painSeverity || null,
        additionalInfo: data.additionalInfo || null,
        previousTreatment: data.previousTreatment || null,
        hasImage: data.hasImage || null, 
        imagePath: data.imagePath || null,
        imageAnalysis: formatJsonFieldForDb(data.imageAnalysis),
        symptomDescription: data.symptomDescription || null,
        symptomAnalysis: formatJsonFieldForDb(data.symptomAnalysis),
        conversationLog: formatConversationLogForDb(data.conversationLog),
        createdAt: data.createdAt || now,
        // transferredToWhatsApp: null, // Removed as per user feedback
      };
      return Promise.resolve(mockConsultation);
    }
    
    // Data for Drizzle should match InsertConsultation (camelCase)
    const dbData: InsertConsultation = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        preferredClinic: data.preferredClinic,
        issueCategory: data.issueCategory || 'general',
        issueSpecifics: data.issueSpecifics,
        painDuration: data.painDuration,
        painSeverity: data.painSeverity,
        additionalInfo: data.additionalInfo,
        previousTreatment: data.previousTreatment,
        hasImage: data.hasImage,
        imagePath: data.imagePath,
        imageAnalysis: formatJsonFieldForDb(data.imageAnalysis),
        symptomDescription: data.symptomDescription,
        symptomAnalysis: formatJsonFieldForDb(data.symptomAnalysis),
        conversationLog: data.conversationLog || [], 
        createdAt: data.createdAt || new Date(),
    };

    const [newConsultation] = await db.insert(consultations)
      .values(dbData) 
      .returning();
    
    return newConsultation;
  },

  async getConsultationById(id: number): Promise<Consultation | undefined> {
    if (!db || !db.query || !db.query.consultations) { 
      logMockWarningChatbot('getConsultationById', { id });
      return Promise.resolve(undefined);
    }
    // @ts-ignore 
    const consultationResult = await db.query.consultations.findFirst({
      where: eq(consultations.id, id)
    });
    
    return consultationResult;
  },

  async updateConsultation(id: number, data: Partial<InsertConsultation>): Promise<Consultation> {
    if (!db) {
      logMockWarningChatbot('updateConsultation', { id, ...data });
      const now = new Date();
      const existingMock = await this.getConsultationById(id); 
      
      const baseMock: Consultation = existingMock || {
        id: id, name: 'Mock User', email: 'mock@example.com', phone: '0000000000',
        preferredClinic: null, issueCategory: 'general', issueSpecifics: null,
        painDuration: null, painSeverity: null, additionalInfo: null, previousTreatment: null,
        hasImage: null, imagePath: null, imageAnalysis: null, symptomDescription: null,
        symptomAnalysis: null, conversationLog: [], createdAt: now,
        // transferredToWhatsApp: null, // Removed
      };

      // Construct mock with camelCase properties
      const mockUpdatedConsultation: Consultation = {
        id: baseMock.id,
        name: data.name !== undefined ? data.name : baseMock.name,
        email: data.email !== undefined ? data.email : baseMock.email,
        phone: data.phone !== undefined ? data.phone : baseMock.phone,
        preferredClinic: data.preferredClinic !== undefined ? data.preferredClinic : baseMock.preferredClinic,
        issueCategory: data.issueCategory !== undefined ? (data.issueCategory || 'general') : baseMock.issueCategory,
        issueSpecifics: data.issueSpecifics !== undefined ? data.issueSpecifics : baseMock.issueSpecifics,
        painDuration: data.painDuration !== undefined ? data.painDuration : baseMock.painDuration,
        painSeverity: data.painSeverity !== undefined ? data.painSeverity : baseMock.painSeverity,
        additionalInfo: data.additionalInfo !== undefined ? data.additionalInfo : baseMock.additionalInfo,
        previousTreatment: data.previousTreatment !== undefined ? data.previousTreatment : baseMock.previousTreatment,
        hasImage: data.hasImage !== undefined ? data.hasImage : baseMock.hasImage,
        imagePath: data.imagePath !== undefined ? data.imagePath : baseMock.imagePath,
        imageAnalysis: data.imageAnalysis !== undefined ? formatJsonFieldForDb(data.imageAnalysis) : baseMock.imageAnalysis,
        symptomDescription: data.symptomDescription !== undefined ? data.symptomDescription : baseMock.symptomDescription,
        symptomAnalysis: data.symptomAnalysis !== undefined ? formatJsonFieldForDb(data.symptomAnalysis) : baseMock.symptomAnalysis,
        conversationLog: data.conversationLog !== undefined ? formatConversationLogForDb(data.conversationLog) : baseMock.conversationLog,
        createdAt: data.createdAt !== undefined ? data.createdAt : baseMock.createdAt, 
        // transferredToWhatsApp: data.transferredToWhatsApp !== undefined ? data.transferredToWhatsApp : baseMock.transferredToWhatsApp,
      };
      return Promise.resolve(mockUpdatedConsultation);
    }

    // Prepare dbData with camelCase properties for Drizzle
    const dbData: Partial<InsertConsultation> = {};
    if (data.name !== undefined) dbData.name = data.name;
    if (data.email !== undefined) dbData.email = data.email;
    if (data.phone !== undefined) dbData.phone = data.phone;
    if (data.preferredClinic !== undefined) dbData.preferredClinic = data.preferredClinic;
    if (data.issueCategory !== undefined) dbData.issueCategory = data.issueCategory || 'general';
    if (data.issueSpecifics !== undefined) dbData.issueSpecifics = data.issueSpecifics;
    if (data.painDuration !== undefined) dbData.painDuration = data.painDuration;
    if (data.painSeverity !== undefined) dbData.painSeverity = data.painSeverity;
    if (data.additionalInfo !== undefined) dbData.additionalInfo = data.additionalInfo;
    if (data.previousTreatment !== undefined) dbData.previousTreatment = data.previousTreatment;
    if (data.hasImage !== undefined) dbData.hasImage = data.hasImage;
    if (data.imagePath !== undefined) dbData.imagePath = data.imagePath;
    if (data.imageAnalysis !== undefined) dbData.imageAnalysis = formatJsonFieldForDb(data.imageAnalysis);
    if (data.symptomDescription !== undefined) dbData.symptomDescription = data.symptomDescription;
    if (data.symptomAnalysis !== undefined) dbData.symptomAnalysis = formatJsonFieldForDb(data.symptomAnalysis);
    if (data.conversationLog !== undefined) dbData.conversationLog = data.conversationLog || [];
    // createdAt is usually not updated directly
    
    const [updatedConsultation] = await db
      .update(consultations)
      .set(dbData) 
      .where(eq(consultations.id, id))
      .returning();
    
    return updatedConsultation;
  },

  async getAllConsultations(page = 1, limit = 10): Promise<Consultation[]> {
    if (!db || !db.query || !db.query.consultations) { 
      logMockWarningChatbot('getAllConsultations', { page, limit });
      return Promise.resolve([]);
    }
    // @ts-ignore
    const consultationList = await db.query.consultations.findMany({
      limit,
      offset: (page - 1) * limit,
      orderBy: [desc(consultations.createdAt)] 
    });
    
    return consultationList;
  }
};
