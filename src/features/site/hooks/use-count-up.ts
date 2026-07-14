import { useEffect, useRef, useState } from "react";

export function useCountUp(alvo: number, ativo: boolean, duracaoMs = 1500): number {
  const [valor, setValor] = useState(0);
  const jaAnimouRef = useRef(false);

  useEffect(() => {
    if (!ativo || jaAnimouRef.current) return;
    jaAnimouRef.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValor(alvo);
      return;
    }

    let frame: number;
    const inicio = performance.now();

    function tick(agora: number) {
      const progresso = Math.min(1, (agora - inicio) / duracaoMs);
      const suavizado = 1 - Math.pow(1 - progresso, 3);
      setValor(Math.round(alvo * suavizado));
      if (progresso < 1) {
        frame = requestAnimationFrame(tick);
      }
    }
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [ativo, alvo, duracaoMs]);

  return valor;
}
