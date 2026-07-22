import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <div className={cn("css-reveal", className)} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}
