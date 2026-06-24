import { cn } from "@/lib/utils";

interface HazardStripeProps {
  className?: string;
}

/** Faixa de sinalização de canteiro — assinatura visual da marca. */
export function HazardStripe({ className }: HazardStripeProps) {
  return <div aria-hidden className={cn("hazard-stripe h-2 w-full", className)} />;
}
