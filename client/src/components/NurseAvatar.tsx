import React from 'react';

interface NurseAvatarProps {
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Fiona nurse avatar component
 * Uses an image of an Irish nurse with red hair and teal scrubs
 */
const NurseAvatar: React.FC<NurseAvatarProps> = ({ size = 'md' }) => {
  // Determine size class
  const sizeClass = size === 'sm' ? 'h-8 w-8' : size === 'md' ? 'h-12 w-12' : 'h-16 w-16';
  
  return (
    <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0 bg-white flex items-center justify-center border-2 border-primary shadow-md`}>
      <img 
        src="/assets/images/nurse-fiona.png"
        alt="Nurse Fiona Avatar"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default NurseAvatar;