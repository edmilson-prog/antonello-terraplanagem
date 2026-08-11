/*
 * Service worker do app de campo (PRD-020).
 *
 * Faz UMA coisa: receber Web Push e levar o operador ao lugar certo. De
 * propósito não intercepta `fetch` — o app não tem shell offline, e um cache
 * de assets mal calibrado serviria build velha para quem está em campo, que é
 * pior do que não ter cache. O offline das notificações é resolvido no cliente
 * (localStorage, em features/notificacoes/notificacoes-store.ts).
 *
 * Arquivo estático servido de /sw.js: o vite.config.ts proíbe plugins novos,
 * então não passa por bundler. Escrever em JS simples, sem imports.
 */

const ICONE = "/icon-192.png";
const TAG_PADRAO = "antonello-notificacao";

self.addEventListener("install", () => {
  // Sem shell para pré-cachear: pode assumir na hora.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let dados = {};
  try {
    dados = event.data ? event.data.json() : {};
  } catch {
    dados = {};
  }

  const titulo = dados.titulo || "Antonello Campo";
  const url = dados.url || "/app/notificacoes";

  const opcoes = {
    body: dados.mensagem || "",
    icon: ICONE,
    badge: ICONE,
    // Uma tag por notificação: dois avisos diferentes não se sobrepõem, mas o
    // mesmo aviso reentregue também não duplica.
    tag: dados.id ? `${TAG_PADRAO}-${dados.id}` : TAG_PADRAO,
    // Em campo, com o celular no bolso: vibrar importa mais que o som.
    vibrate: [180, 80, 180],
    data: { url, id: dados.id || null },
  };

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(titulo, opcoes);
      // Se o app estiver aberto, o sino atualiza sem esperar a próxima reconsulta.
      const abas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const aba of abas) {
        aba.postMessage({ tipo: "notificacao-recebida", id: dados.id || null });
      }
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destino = (event.notification.data && event.notification.data.url) || "/app/notificacoes";

  event.waitUntil(
    (async () => {
      const abas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });

      // Reaproveita uma aba do app se já houver uma — abrir outra deixaria o
      // operador com duas sessões do mesmo app na mão.
      for (const aba of abas) {
        const caminho = new URL(aba.url).pathname;
        if (caminho.startsWith("/app")) {
          await aba.focus();
          if ("navigate" in aba) {
            try {
              await aba.navigate(destino);
            } catch {
              aba.postMessage({ tipo: "navegar", url: destino });
            }
          } else {
            aba.postMessage({ tipo: "navegar", url: destino });
          }
          return;
        }
      }

      await self.clients.openWindow(destino);
    })(),
  );
});
