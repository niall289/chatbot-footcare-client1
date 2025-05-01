import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface NurseAvatarProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function NurseAvatar({ size = 'md' }: NurseAvatarProps) {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Determine size class
  const sizeClass = size === 'sm' ? 'h-8 w-8' : size === 'md' ? 'h-10 w-10' : 'h-12 w-12';

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<{ imageBase64: string }>({ 
          url: '/api/nurse-image',
          method: 'GET'
        });
        
        if (response?.imageBase64) {
          setImageBase64(response.imageBase64);
        } else {
          throw new Error('No image data received');
        }
      } catch (error) {
        console.error('Failed to load nurse image:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, []);

  // Fallback icon if image is loading or errored
  if (loading || error || !imageBase64) {
    return (
      <div className={`${sizeClass} rounded-full bg-primary flex items-center justify-center`}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 text-white" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5}
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" 
          />
        </svg>
      </div>
    );
  }

  // Display the nurse image
  return (
    <div className={`${sizeClass} rounded-full overflow-hidden bg-white flex items-center justify-center shadow-inner`}>
      <img 
        src={`data:image/png;base64,${imageBase64}`} 
        alt="Fiona - FootCare Clinic Nurse" 
        className="object-cover w-full h-full"
      />
    </div>
  );
}