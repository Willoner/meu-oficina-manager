import React from "react";

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-32 h-auto", ...props }) => {
  return (
    <img
      src="/logo.svg"
      alt="Oficina em Ordem Logo"
      className={className}
      {...props}
    />
  );
};

export default Logo;
