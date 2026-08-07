import { cn } from "@/lib/utils";

interface PlaceholderImageProps {
  label: string;
  gradient?: string;
  aspect?: string;
  className?: string;
}

const PlaceholderImage = ({
  label,
  gradient = "from-primary/30 via-primary/10 to-background",
  aspect = "aspect-video",
  className,
}: PlaceholderImageProps) => {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center rounded-[2rem] border border-dashed border-border bg-gradient-to-br p-6 text-center text-foreground/70",
        gradient,
        aspect,
        className,
      )}
    >
      <span className="max-w-xs text-sm font-medium">{label}</span>
    </div>
  );
};

export default PlaceholderImage;
