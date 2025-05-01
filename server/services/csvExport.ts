import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import fs from 'fs';
import { Consultation } from '@shared/schema';

// Ensure the exports directory exists
const exportDir = path.join(process.cwd(), 'exports');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

/**
 * Export consultations to a CSV file
 * @param consultations Array of consultation data to export
 * @returns Path to the generated CSV file
 */
export async function exportConsultationsToCSV(consultations: Consultation[]): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(exportDir, `consultations-${timestamp}.csv`);
  
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'createdAt', title: 'Date Created' },
      { id: 'name', title: 'Patient Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'preferredClinic', title: 'Clinic Location' },
      { id: 'issueCategory', title: 'Issue Category' },
      { id: 'issueSpecifics', title: 'Issue Details' },
      { id: 'painDuration', title: 'Pain Duration' },
      { id: 'painSeverity', title: 'Pain Level' },
      { id: 'previousTreatment', title: 'Previous Treatments' },
      { id: 'additionalInfo', title: 'Additional Information' },
      { id: 'imageAnalysis', title: 'Image Analysis Results' },
      { id: 'symptomDescription', title: 'Symptom Description' },
      { id: 'symptomAnalysis', title: 'Symptom Analysis Results' },
      { id: 'transferredToWhatsApp', title: 'Transferred to WhatsApp' }
    ]
  });
  
  // Format data for CSV export
  const records = consultations.map(consultation => {
    return {
      ...consultation,
      createdAt: consultation.createdAt ? new Date(consultation.createdAt).toLocaleString() : '',
      transferredToWhatsApp: consultation.transferredToWhatsApp === 'yes' ? 'Yes' : 'No',
      // Format JSON fields for CSV
      imageAnalysis: consultation.imageAnalysis 
        ? (typeof consultation.imageAnalysis === 'string' 
            ? consultation.imageAnalysis 
            : JSON.stringify(consultation.imageAnalysis))
        : '',
      symptomAnalysis: consultation.symptomAnalysis
        ? (typeof consultation.symptomAnalysis === 'string'
            ? consultation.symptomAnalysis
            : JSON.stringify(consultation.symptomAnalysis))
        : ''
    };
  });
  
  await csvWriter.writeRecords(records);
  return filePath;
}

/**
 * Export a single consultation to a CSV file
 * @param consultation Consultation data to export
 * @returns Path to the generated CSV file
 */
export async function exportSingleConsultationToCSV(consultation: Consultation): Promise<string> {
  return exportConsultationsToCSV([consultation]);
}