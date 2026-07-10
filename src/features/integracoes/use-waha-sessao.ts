import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type StatusSessaoWaha = "STOPPED" | "STARTING" | "SCAN_QR_CODE" | "WORKING" | "FAILED";

interface RespostaStatus {
  status: StatusSessaoWaha;
  numero: string | null;
}

interface RespostaQr {
  qr: string;
}

export function useWahaSessao() {
  const [status, setStatus] = useState<StatusSessaoWaha>("STOPPED");
  const [numero, setNumero] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const buscarStatus = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke<RespostaStatus>("waha-sessao", {
      method: "GET",
    });
    if (error || !data) {
      setErro(error?.message ?? "Não foi possível consultar a sessão.");
      setCarregando(false);
      return;
    }
    setStatus(data.status);
    setNumero(data.numero);
    if (data.status === "WORKING") setQr(null);
    setErro(null);
    setCarregando(false);
  }, []);

  useEffect(() => {
    buscarStatus();
  }, [buscarStatus]);

  useEffect(() => {
    if (status === "WORKING") return;
    const id = setInterval(buscarStatus, 3000);
    return () => clearInterval(id);
  }, [status, buscarStatus]);

  const conectar = useCallback(async () => {
    await supabase.functions.invoke("waha-sessao", { body: { action: "start" } });
    const { data } = await supabase.functions.invoke<RespostaQr>("waha-sessao?qr=1", {
      method: "GET",
    });
    if (data) setQr(data.qr);
    await buscarStatus();
  }, [buscarStatus]);

  const desconectar = useCallback(async () => {
    await supabase.functions.invoke("waha-sessao", { body: { action: "logout" } });
    setQr(null);
    await buscarStatus();
  }, [buscarStatus]);

  return { status, numero, qr, carregando, erro, conectar, desconectar };
}
