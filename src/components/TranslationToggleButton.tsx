import { Button } from "@/components/ui/button";
import { Languages, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type TranslationToggleButtonProps = {
  active: boolean;
  loading?: boolean;
  onTranslate: () => void;
  onToggle: () => void;
  className?: string;
  dataTestId: string;
};

export function TranslationToggleButton({
  active,
  loading = false,
  onTranslate,
  onToggle,
  className,
  dataTestId,
}: TranslationToggleButtonProps) {
  return (
    <Button
      type="button"
      variant="glass"
      className={cn("rounded-full text-white", active ? "border-primary/60 text-primary" : "", className)}
      onClick={active ? onToggle : onTranslate}
      data-testid={dataTestId}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
      {loading ? "Traduction..." : active ? "Version française active" : "Traduire en français"}
    </Button>
  );
}
