/*
 * Combina o estado de várias stores numa única tripla loading/error/retry.
 *
 * Substitui `useMockResource`, que fabricava um `setTimeout` de 400 ms sobre
 * dados já em memória e devolvia "carregado" mesmo quando a consulta ao banco
 * tinha falhado. Toda tela que o usava mostrava um esqueleto por 400 ms e
 * depois uma lista vazia — indistinguível de "não há registros". Um erro de
 * sessão ou de rede aparecia como base vazia.
 *
 * Função pura, não hook: as stores já publicam seu estado por
 * `useSyncExternalStore`, então aqui não há nada para memorizar. `retry` sai
 * com identidade nova a cada render de propósito — vai para `onClick`, nunca
 * para lista de dependências.
 *
 * Regra da combinação:
 * - `isLoading`: verdadeiro enquanto QUALQUER fonte ainda carrega. A tela só
 *   mostra conteúdo quando tudo que ela cruza chegou; senão a primeira
 *   renderização exibiria totais calculados sobre metade dos dados.
 * - `error`: o PRIMEIRO erro. Empilhar três mensagens numa caixa não ajuda
 *   quem lê — a causa costuma ser a mesma (sessão, rede).
 * - `retry`: dispara o de todas, inclusive as que deram certo. É idempotente,
 *   e evita ter que rastrear qual delas falhou.
 */

export interface EstadoConsulta {
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

export interface FonteDeDados {
  estado: { isLoading: boolean; error: Error | null };
  retry: () => void | Promise<void>;
}

export function combinarEstados(...fontes: FonteDeDados[]): EstadoConsulta {
  return {
    isLoading: fontes.some((f) => f.estado.isLoading),
    error: fontes.find((f) => f.estado.error)?.estado.error ?? null,
    retry: () => {
      for (const f of fontes) {
        // `void promessa` não trata rejeição — geraria unhandled rejection se
        // uma das stores falhasse ao recarregar. O erro já volta pela própria
        // store (que o publica no seu estado), então aqui basta não estourar.
        Promise.resolve(f.retry()).catch(() => {});
      }
    },
  };
}
