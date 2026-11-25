import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ size = 'md' }) => {
  const iconDim = size === 'sm' ? 30 : size === 'lg' ? 42 : 34;
  const textClass =
    size === 'sm'
      ? 'text-base'
      : size === 'lg'
        ? 'text-2xl'
        : 'text-xl';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      <svg
        width={iconDim}
        height={iconDim}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="ismanGoldGrad" x1="4" y1="4" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="ismanSlateGrad" x1="6" y1="6" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1B2230" />
            <stop offset="100%" stopColor="#0C1018" />
          </linearGradient>
        </defs>
        {/* Outer octagonal gaming shield */}
        <path
          d="M22 2.5L36.5 8.5L41.5 22L36.5 35.5L22 41.5L7.5 35.5L2.5 22L7.5 8.5L22 2.5Z"
          fill="url(#ismanSlateGrad)"
          stroke="url(#ismanGoldGrad)"
          strokeWidth="2"
        />
        {/* Inner precision geometric frame */}
        <path
          d="M22 6.5L33.5 11.2L37.5 22L33.5 32.8L22 37.5L10.5 32.8L6.5 22L10.5 11.2L22 6.5Z"
          stroke="#F59E0B"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
        {/* Stylized geometric crown / lightning crest */}
        <path
          d="M22 10.5L27 16H23.5L26 22.5L17.5 15.5H21L22 10.5Z"
          fill="url(#ismanGoldGrad)"
        />
        {/* Crisp "212" monogram */}
        <text
          x="22"
          y="32.5"
          textAnchor="middle"
          fill="#F8FAFC"
          fontFamily="Outfit, sans-serif"
          fontWeight="800"
          fontSize="10.5"
          letterSpacing="0.8"
        >
          212
        </text>
      </svg>
      <span className={`font-display font-bold tracking-tight text-slate-50 ${textClass}`}>
        ismanstore<span className="text-amber-400">212</span>
      </span>
    </span>
  );
};
