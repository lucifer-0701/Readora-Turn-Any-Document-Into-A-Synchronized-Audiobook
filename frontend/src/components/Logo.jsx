import React from 'react';

const Logo = React.memo(function Logo({ className = "h-5 w-5", strokeWidth = 2 }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Left Page of open book */}
      <path d="M12 17.5C10 16 6 16 2 17.5V4.5C6 3 10 3 12 4.5" />
      
      {/* Right Page of open book */}
      <path d="M12 17.5C14 16 18 16 22 17.5V4.5C18 3 14 3 12 4.5" />
      
      {/* Microphone in the center fold */}
      <g strokeWidth={strokeWidth * 0.7} fill="currentColor">
        {/* Microphone capsule */}
        <rect x="10.8" y="5.2" width="2.4" height="4.2" rx="1.2" stroke="none" />
        
        {/* Microphone stand U-mount */}
        <path d="M9.8 7.3v0.4a2.2 2.2 0 0 0 4.4 0V7.3" fill="none" />
        
        {/* Stand vertical neck */}
        <line x1="12" y1="9.9" x2="12" y2="13.5" fill="none" />
        
        {/* Stand base plate */}
        <line x1="10" y1="13.5" x2="14" y2="13.5" fill="none" />
      </g>
    </svg>
  );
});

export default Logo;
