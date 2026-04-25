import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
  showText?: boolean;
  asLink?: boolean;
}

export const Logo = ({ variant = "dark", className = "", showText = true, asLink = true }: LogoProps) => {
  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden ${
          variant === "light" ? "bg-white" : "bg-white/95 ring-1 ring-primary/10"
        }`}
      >
        <img src={logo} alt="Лояльность — юридическая компания" className="h-9 w-9 object-contain" />
      </span>
      {showText && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-display text-lg font-bold tracking-tight ${
              variant === "light" ? "text-primary-foreground" : "text-primary"
            }`}
          >
            Лояльность
          </span>
          <span
            className={`text-[10px] uppercase tracking-[0.18em] mt-0.5 ${
              variant === "light" ? "text-primary-foreground/60" : "text-muted-foreground"
            }`}
          >
            юридическая компания
          </span>
        </span>
      )}
    </span>
  );

  if (!asLink) return content;
  return (
    <Link to="/" aria-label="Лояльность — на главную">
      {content}
    </Link>
  );
};