import React from "react";

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-40 h-auto", ...props }) => {
  return (
    <div className="flex items-center justify-center">
      <img
        src="/logo.png"
        alt="Oficina em Ordem Logo"
        className={className}
        {...props}
      />
    </div>
  );
};

export default Logo;
