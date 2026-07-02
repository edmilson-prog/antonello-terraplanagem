import { useRef } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

interface Props {
  onChange: (dataUrl: string | null) => void;
  className?: string;
}

// Assinatura em tela via canvas nativo + Pointer Events (mouse/toque/caneta
// uniformes). Coordenadas escaladas pela razão bitmap/CSS porque o canvas usa
// width/height fixos (resolução interna) enquanto o CSS estica com w-full.
export function SignaturePad({ onChange, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const desenhando = useRef(false);
  const temTraco = useRef(false);

  function posicao(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function iniciar(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(e.pointerId);
    desenhando.current = true;
    const { x, y } = posicao(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function mover(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!desenhando.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = posicao(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1B1912";
    ctx.lineTo(x, y);
    ctx.stroke();
    temTraco.current = true;
  }

  function finalizar() {
    if (!desenhando.current) return;
    desenhando.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(temTraco.current ? canvas.toDataURL("image/png") : null);
  }

  function limpar() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    temTraco.current = false;
    onChange(null);
  }

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        width={480}
        height={180}
        className="w-full touch-none rounded-lg border bg-white"
        onPointerDown={iniciar}
        onPointerMove={mover}
        onPointerUp={finalizar}
        onPointerLeave={finalizar}
      />
      <div className="mt-2 flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={limpar} className="gap-1.5">
          <Icon icon="lucide:eraser" className="h-3.5 w-3.5" />
          Refazer
        </Button>
      </div>
    </div>
  );
}
