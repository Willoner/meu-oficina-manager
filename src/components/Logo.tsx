import React from "react";

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-40 h-auto", ...props }) => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative overflow-hidden rounded-full border-0">
        <img
          src="/logo.png"
          alt="Oficina em Ordem Logo"
          className={`${className} scale-[1.02]`} // Pequeno ajuste de escala para garantir que a borda fique limpa
          style={{ clipPath: "circle(48.5%)" }} // Corta exatamente no limite do badge circular
          {...props}
        />
      </div>
    </div>
  );
};

export default Logo;
