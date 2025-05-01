import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import ChatInterface from "@/components/ChatInterface";
import type { Consultation } from "@shared/schema";

export default function Chat() {
  const [consultationId, setConsultationId] = useState<number | null>(null);
  
  // Create a new consultation when needed
  const createConsultation = useMutation({
    mutationFn: async (data: Partial<Consultation>) => {
      const res = await apiRequest("POST", "/api/consultations", data);
      return res.json();
    },
    onSuccess: (data) => {
      setConsultationId(data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/consultations'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create consultation: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Update existing consultation
  const updateConsultation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Consultation> }) => {
      const res = await apiRequest("PATCH", `/api/consultations/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/consultations', consultationId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update consultation: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Transfer to WhatsApp
  const transferToWhatsApp = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/consultations/${id}/transfer-to-whatsapp`, {});
      return res.json();
    },
    onSuccess: (data) => {
      // Open WhatsApp in a new tab
      window.open(data.whatsappLink, "_blank");
      
      toast({
        title: "WhatsApp Transfer",
        description: "You've been transferred to WhatsApp to continue your conversation",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to transfer to WhatsApp: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Fetch consultation data if ID exists
  const { data: consultation } = useQuery({
    queryKey: ['/api/consultations', consultationId],
    enabled: !!consultationId,
  });
  
  // Handlers for the chat interface
  const handleCreateConsultation = (data: Partial<Consultation>) => {
    createConsultation.mutate(data);
  };
  
  const handleUpdateConsultation = (data: Partial<Consultation>) => {
    if (consultationId) {
      updateConsultation.mutate({ id: consultationId, data });
    }
  };
  
  const handleTransferToWhatsApp = () => {
    if (consultationId) {
      transferToWhatsApp.mutate(consultationId);
    }
  };
  
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col justify-center items-center p-4 md:p-0">
      <ChatInterface
        consultationId={consultationId}
        consultation={consultation}
        onCreateConsultation={handleCreateConsultation}
        onUpdateConsultation={handleUpdateConsultation}
        onTransferToWhatsApp={handleTransferToWhatsApp}
        isTransferring={transferToWhatsApp.isPending}
      />
    </div>
  );
}
