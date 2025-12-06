import React from 'react';

import './LogoLoader.css';

const LogoLoader = ({ className = "w-16 h-16" }: { className?: string }) => {
  return (
    <svg
      className={`logo-loader-container ${className}`}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Square 1: Top-Left, Solid */}
      <path
        className="logo-square-solid"
        d="M4 4H20V20H4V4Z"
        fill="#4F46E5"
      />

      {/* Square 2: Bottom-Right, Transparent */}
      <path
        className="logo-square-transparent"
        d="M12 12H28V28H12V12Z"
        fill="#4F46E5"
      />
    </svg>
  );
};

export default LogoLoader;

