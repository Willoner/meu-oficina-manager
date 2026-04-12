import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-32 h-auto", ...props }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');
          .logo-text-1 {
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
            font-size: 32px;
            fill: #2563EB;
          }
          .logo-text-2 {
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
            font-size: 32px;
            fill: #10B981;
          }
        `}
      </style>

      {/* Ícone: Mão segurando a chave de boca (#2563EB) */}
      <g transform="translate(68, 10) scale(1.1)">
        {/* Haste da chave de boca */}
        <path
          d="M38 12 L22 42 A 4 4 0 0 1 15 40 L31 10 A 4 4 0 0 1 38 12 Z"
          fill="#2563EB"
        />
        {/* Cabeça superior da chave */}
        <path
          d="M35 15 C 45 5, 52 12, 45 22 L 39 18 C 39 12, 33 10, 31 12 Z"
          fill="#2563EB"
        />
        {/* Mão / Punho cerrado */}
        {/* Base da mão */}
        <rect x="18" y="22" width="22" height="18" rx="4" fill="#2563EB" transform="rotate(-30 29 31)" />
        {/* Dedos envolventes */}
        <rect x="16" y="20" width="24" height="5" rx="2" fill="#2563EB" transform="rotate(-30 28 22)" />
        <rect x="16" y="26" width="24" height="5" rx="2" fill="#2563EB" transform="rotate(-30 28 28)" />
        <rect x="16" y="32" width="24" height="5" rx="2" fill="#2563EB" transform="rotate(-30 28 34)" />
        <rect x="16" y="38" width="24" height="5" rx="2" fill="#2563EB" transform="rotate(-30 28 40)" />
        {/* Polegar */}
        <rect x="28" y="16" width="8" height="12" rx="3" fill="#2563EB" transform="rotate(-60 32 22)" />
      </g>

      {/* Texto: OFICINA (Azul) e EM ORDEM (Verde) */}
      <text x="100" y="140" textAnchor="middle" className="logo-text-1">
        OFICINA
      </text>
      <text x="100" y="174" textAnchor="middle" className="logo-text-2">
        EM ORDEM
      </text>
    </svg>
  );
};

export default Logo;
