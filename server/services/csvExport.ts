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
      { id: 'updatedAt', title: 'Last Updated' },
      { id: 'patientName', title: 'Patient Name' },
      { id: 'patientEmail', title: 'Email' },
      { id: 'patientPhone', title: 'Phone' },
      { id: 'clinicLocation', title: 'Clinic Location' },
      { id: 'symptoms', title: 'Symptoms' },
      { id: 'symptomDuration', title: 'Symptom Duration' },
      { id: 'painLevel', title: 'Pain Level' },
      { id: 'previousTreatments', title: 'Previous Treatments' },
      { id: 'imageAnalysisResults', title: 'Image Analysis Results' },
      { id: 'symptomAnalysisResults', title: 'Symptom Analysis Results' },
      { id: 'appointmentPreference', title: 'Appointment Preference' },
      { id: 'isComplete', title: 'Consultation Complete' },
      { id: 'transferredToWhatsApp', title: 'Transferred to WhatsApp' }
    ]
  });
  
  // Format data for CSV export
  const records = consultations.map(consultation => {
    return {
      ...consultation,
      createdAt: consultation.createdAt ? new Date(consultation.createdAt).toLocaleString() : '',
      updatedAt: consultation.updatedAt ? new Date(consultation.updatedAt).toLocaleString() : '',
      isComplete: consultation.isComplete ? 'Yes' : 'No',
      transferredToWhatsApp: consultation.transferredToWhatsApp ? 'Yes' : 'No',
      // Parse JSON fields if they're stored as strings
      imageAnalysisResults: typeof consultation.imageAnalysisResults === 'string' 
        ? consultation.imageAnalysisResults 
        : JSON.stringify(consultation.imageAnalysisResults),
      symptomAnalysisResults: typeof consultation.symptomAnalysisResults === 'string'
        ? consultation.symptomAnalysisResults
        : JSON.stringify(consultation.symptomAnalysisResults)
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