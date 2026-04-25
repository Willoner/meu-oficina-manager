import React from "react";

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-48 h-auto", ...props }) => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative overflow-hidden rounded-full border-0 bg-[#1A1F2C]">
        <img
          src="/logo.png"
          alt="Oficina em Ordem Logo"
          className={`${className} scale-[1.25]`} // Ajuste de escala final para perfeição
          style={{ clipPath: "circle(40.5%)" }} // Corte de precisão cirúrgica
          {...props}
        />
      </div>
    </div>
  );
};

export default Logo;
