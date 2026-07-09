// Cria contas demo de retaguarda (recepção/proprietário) via Admin API.
// NUNCA rodar isto no browser — usa a service_role key.
// Rodar com: SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-usuarios-retaguarda.ts

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente antes de rodar.");
}

const admin = createClient(supabaseUrl, serviceRoleKey);

const CONTAS = [
  { email: "recepcao@antonello.com.br", nome: "Ana Recepção", perfil: "recepcao" as const },
  { email: "proprietario@antonello.com.br", nome: "Sr. Antonello", perfil: "proprietario" as const },
];

const SENHA_TEMPORARIA = "TrocarNoPrimeiroAcesso123!";

async function main() {
  for (const conta of CONTAS) {
    const { data, error } = await admin.auth.admin.createUser({
      email: conta.email,
      password: SENHA_TEMPORARIA,
      email_confirm: true,
    });

    if (error || !data.user) {
      console.error(`Falha ao criar ${conta.email}:`, error?.message);
      continue;
    }

    const { error: perfilError } = await admin
      .from("usuarios_retaguarda")
      .insert({ id: data.user.id, nome: conta.nome, perfil: conta.perfil });

    if (perfilError) {
      console.error(`Usuário criado mas falha ao inserir perfil de ${conta.email}:`, perfilError.message);
      continue;
    }

    console.log(`Conta criada: ${conta.email} (${conta.perfil}) — senha temporária: ${SENHA_TEMPORARIA}`);
  }
}

main();
