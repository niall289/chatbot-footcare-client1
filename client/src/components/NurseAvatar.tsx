import React from 'react';

interface NurseAvatarProps {
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Fiona nurse avatar component
 * Uses an image of a woman with red hair to represent the Irish nurse character
 */
const NurseAvatar: React.FC<NurseAvatarProps> = ({ size = 'md' }) => {
  // Determine size class
  const sizeClass = size === 'sm' ? 'h-8 w-8' : size === 'md' ? 'h-10 w-10' : 'h-16 w-16';
  
  return (
    <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0 bg-primary flex items-center justify-center border-2 border-white`}>
      <img 
        src="https://cdn-icons-png.flaticon.com/512/4874/4874878.png"
        alt="Nurse Fiona Avatar"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default NurseAvatar;