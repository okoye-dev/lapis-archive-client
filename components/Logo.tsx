import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

const Logo = ({ className }: LogoProps) => {
  return (
    <Link href="/" className="block w-fit shrink-0">
      <span
        className={cn(
          "font-logo text-lg font-bold tracking-tight transition-opacity hover:opacity-80 sm:text-2xl",
          className,
        )}
      >
        <span className="text-brand">Lapis</span>
        <span className="text-primary">Archive</span>
      </span>
    </Link>
  );
};

export default Logo;
