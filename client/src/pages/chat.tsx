import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import ChatInterface from "@/components/ChatInterface";
import type { Consultation } from "@shared/schema";

export default function Chat() {
  const [consultationId, setConsultationId] = useState<number | null>(null);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [botConfig, setBotConfig] = useState({
    botName: 'Fiona',
    avatarUrl: '', // Default empty, NurseAvatar will use its internal default
    welcomeMessage: '', // Default empty, useChat hook handles initial message
    primaryColor: 'hsl(186, 100%, 30%)', // Default teal
    clinicLocation: 'all',
    allowImageUpload: true,
    // 'theme' is effectively replaced by primaryColor for more direct control
  });

  // Check if the chat is being embedded in an iframe on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const embedded = urlParams.get('embedded');

    if (embedded === 'true') {
      setIsEmbedded(true);

      // Get configuration from URL parameters
      const name = urlParams.get('botName');
      const avatar = urlParams.get('avatarUrl');
      const welcome = urlParams.get('welcomeMessage');
      const color = urlParams.get('primaryColor');
      const location = urlParams.get('clinicLocation');
      const imageUpload = urlParams.get('allowImageUpload');

      setBotConfig(prevConfig => ({
        ...prevConfig,
        botName: name || prevConfig.botName,
        avatarUrl: avatar || prevConfig.avatarUrl,
        welcomeMessage: welcome || prevConfig.welcomeMessage,
        primaryColor: color || prevConfig.primaryColor,
        clinicLocation: location || prevConfig.clinicLocation,
        allowImageUpload: imageUpload !== 'false',
      }));
    }
  }, []);
  
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
  const { data: consultation } = useQuery<Consultation>({
    queryKey: ['/api/consultations', consultationId],
    queryFn: async () => {
      if (!consultationId) return undefined;
      const res = await apiRequest("GET", `/api/consultations/${consultationId}`);
      return res.json();
    },
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
    <div className={`${isEmbedded ? 'bg-transparent' : 'bg-gray-100 min-h-screen'} flex flex-col justify-center items-center ${isEmbedded ? 'p-0' : 'p-4 md:p-0'}`}>
      <ChatInterface
        consultationId={consultationId}
        consultation={consultation}
        onCreateConsultation={(data) => {
          // If embedded, add the clinic location from configuration
          if (isEmbedded && botConfig.clinicLocation !== 'all') {
            handleCreateConsultation({
              ...data,
              preferredClinic: botConfig.clinicLocation
            });
          } else {
            handleCreateConsultation(data);
          }
        }}
        onUpdateConsultation={handleUpdateConsultation}
        onTransferToWhatsApp={handleTransferToWhatsApp}
        isTransferring={transferToWhatsApp.isPending}
        // Pass theme props
        botName={botConfig.botName}
        avatarUrl={botConfig.avatarUrl}
        welcomeMessage={botConfig.welcomeMessage}
        primaryColor={botConfig.primaryColor}
      />
    </div>
  );
}
