import Link from "next/link";
import { cn } from "@/lib/utils";
import LogoMark from "./LogoMark";

interface LogoProps {
  className?: string;
}

const Logo = ({ className }: LogoProps) => {
  return (
    <Link href="/" className="flex w-fit shrink-0 items-center gap-2">
      <LogoMark className="h-6 w-6 sm:h-7 sm:w-7" />
      <span
        className={cn(
          "font-logo text-xl font-semibold italic tracking-tight text-brand transition-opacity hover:opacity-80 sm:text-3xl",
          className,
        )}
      >
        LapisArchive
      </span>
    </Link>
  );
};

export default Logo;
