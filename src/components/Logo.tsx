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
          className={`${className} scale-[1.15] translate-y-[1%]`} // Aumenta escala e ajusta posição para centralizar o círculo real
          style={{ clipPath: "circle(44%)" }} // Corte mais agressivo para eliminar resquícios do fundo
          {...props}
        />
      </div>
    </div>
  );
};

export default Logo;
