import { useCallback, useEffect, useState } from "react";

// Envelope que simula um fetch assíncrono sobre dados já em memória, só para
// exercitar os estados de tela (loading / error / success) na fase mockada.
// As mutações continuam indo direto ao store; este hook só governa o estado
// de carregamento inicial e o retry.

interface Options {
  delayMs?: number;
  forceError?: boolean;
}

interface Resource<T> {
  data: T;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

export function useMockResource<T>(data: T, opts: Options = {}): Resource<T> {
  const { delayMs = 400, forceError = false } = opts;
  const [fase, setFase] = useState<"loading" | "ready" | "error">("loading");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    setFase("loading");
    const timer = setTimeout(() => {
      setFase(forceError ? "error" : "ready");
    }, delayMs);
    return () => clearTimeout(timer);
  }, [delayMs, forceError, nonce]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);

  return {
    data,
    isLoading: fase === "loading",
    error: fase === "error" ? new Error("Falha ao carregar os dados.") : null,
    retry,
  };
}
