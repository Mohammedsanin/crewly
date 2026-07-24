import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  src?: string;
  name: string;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ src, name, className = 'w-10 h-10 rounded-2xl' }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  const initial = (name || 'U').trim().charAt(0).toUpperCase() || 'U';

  const avatarStyles = [
    'bg-indigo-600 text-white',
    'bg-violet-600 text-white',
    'bg-emerald-600 text-white',
    'bg-amber-600 text-white',
    'bg-rose-600 text-white',
  ];
  const index = Math.abs((name || 'A').charCodeAt(0)) % avatarStyles.length;
  const styleClass = avatarStyles[index];

  const isSmall = className.includes('w-8') || className.includes('w-6') || className.includes('h-8') || className.includes('h-6');
  const sizeClass = isSmall ? 'text-[10px]' : 'text-base';

  if (!src || imageError || src.trim() === '') {
    return (
      <div className={`${className} ${styleClass} flex items-center justify-center font-black shadow-md shrink-0 select-none`}>
        <span className={`${sizeClass} font-extrabold tracking-wider leading-none`}>{initial}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setImageError(true)}
      className={`${className} object-cover shrink-0`}
    />
  );
};
