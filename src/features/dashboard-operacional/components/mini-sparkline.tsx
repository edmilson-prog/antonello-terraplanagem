import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

interface MiniSparklineProps {
  dados: { data: string; valor: number }[];
  formatar: (valor: number) => string;
  cor?: string;
  /** false quando `dados` é uma série decorativa — evita mostrar um valor exato "fake" no hover. */
  mostrarTooltip?: boolean;
}

export function MiniSparkline({
  dados,
  formatar,
  cor = "var(--color-primary)",
  mostrarTooltip = true,
}: MiniSparklineProps) {
  const gradientId = useId();

  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={dados} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cor} stopOpacity={0.35} />
            <stop offset="100%" stopColor={cor} stopOpacity={0} />
          </linearGradient>
        </defs>
        {mostrarTooltip ? (
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              color: "var(--color-card-foreground)",
              fontSize: 12,
            }}
            formatter={(valor: number) => [formatar(valor), ""]}
          />
        ) : null}
        <Area type="monotone" dataKey="valor" stroke={cor} strokeWidth={2} fill={`url(#${gradientId})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
