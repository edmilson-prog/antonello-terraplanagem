import { createFileRoute } from "@tanstack/react-router";
import { ChatbotConfigPage } from "@/features/ia/components/chatbot-config-page";

export const Route = createFileRoute("/admin/ia/chatbot")({
  head: () => ({
    meta: [
      { title: "Chatbot WhatsApp (IA) · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ChatbotConfigPage,
});
