import { FC } from 'react';

interface NurseAvatarProps {
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Fiona nurse avatar component
 * Uses a stylized SVG nurse icon with the application's color scheme
 */
const NurseAvatar: FC<NurseAvatarProps> = ({ size = 'md' }) => {
  // Determine size class
  const sizeClass = size === 'sm' ? 'h-8 w-8' : size === 'md' ? 'h-10 w-10' : 'h-12 w-12';

  return (
    <div className={`${sizeClass} rounded-full bg-primary flex items-center justify-center overflow-hidden`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 64 64" 
        className="w-full h-full"
      >
        {/* Background */}
        <circle cx="32" cy="32" r="32" fill="#19b8a6" />
        
        {/* Nurse face */}
        <circle cx="32" cy="26" r="14" fill="#ffe0b2" />
        
        {/* Nurse cap */}
        <path d="M18 23a14 14 0 0 1 28 0" fill="#ffffff" />
        <path d="M18 23a14 14 0 0 1 28 0" stroke="#138676" strokeWidth="1.5" fill="none" />
        <path d="M20 19h24" stroke="#138676" strokeWidth="2" fill="none" />
        
        {/* Red cross symbol */}
        <rect x="28" y="14" width="8" height="2" fill="#e74c3c" />
        <rect x="31" y="11" width="2" height="8" fill="#e74c3c" />
        
        {/* Hair (red) */}
        <path d="M22 26c-1-5 2-10 6-12" stroke="#d35f5f" strokeWidth="4" fill="none" />
        <path d="M42 26c1-5-2-10-6-12" stroke="#d35f5f" strokeWidth="4" fill="none" />
        
        {/* Eyes */}
        <circle cx="26" cy="25" r="1.5" fill="#333" />
        <circle cx="38" cy="25" r="1.5" fill="#333" />
        
        {/* Smile */}
        <path d="M26 30q6 5 12 0" stroke="#333" strokeWidth="1" fill="none" />
        
        {/* Nurse uniform */}
        <path d="M18 40v-8c0-8 6-14 14-14s14 6 14 14v8" fill="#ffffff" />
        <path d="M18 40v-8c0-8 6-14 14-14s14 6 14 14v8" stroke="#138676" strokeWidth="0.75" fill="none" />
        
        {/* Collar */}
        <path d="M24 26v8h16v-8" stroke="#138676" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  );
};

export default NurseAvatar;