import type { Parametros } from "@/shared/types";
import { CAMPOS_POR_CHAVE, SECOES, type ChaveParametro } from "./campos";

// Conversões entre o registro do banco (números, "HH:MM:SS") e o formulário
// (tudo string, com vírgula decimal como o resto da retaguarda). Fica fora dos
// componentes para poder ser testado sem renderizar nada.

export type ValorFormulario = string | boolean;
export type FormularioParametros = Record<string, ValorFormulario>;

/** Chaves que o formulário edita — as de controle (id, versão…) ficam de fora. */
export const CHAVES_EDITAVEIS: ChaveParametro[] = SECOES.flatMap((s) => [
  ...s.campos.map((c) => c.chave),
  ...s.toggles.map((t) => t.chave),
]);

const ehBooleano = (chave: ChaveParametro) => CAMPOS_POR_CHAVE.get(chave)?.booleano === true;

const ehNumerico = (chave: ChaveParametro) => CAMPOS_POR_CHAVE.get(chave)?.campo?.tipo === "numero";

/** "20:00:00" → "20:00" (o kit mostra sem os segundos). */
export function formatarHora(valor: string): string {
  return valor.slice(0, 5);
}

/** 8 → "8,0" · 62.5 → "62,50" · mantém as casas que o valor tem, mínimo 1. */
function numeroParaTexto(valor: number): string {
  const casas = Math.max(1, (String(valor).split(".")[1] ?? "").length);
  return valor.toFixed(casas).replace(".", ",");
}

/** "8,5" → 8.5 · "" → null (entrada inválida não vira 0 silenciosamente). */
export function textoParaNumero(texto: string): number | null {
  const limpo = texto.trim().replace(",", ".");
  if (limpo === "") return null;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}

export function paraFormulario(parametros: Parametros): FormularioParametros {
  const form: FormularioParametros = {};
  for (const chave of CHAVES_EDITAVEIS) {
    const valor = parametros[chave];
    if (typeof valor === "boolean") form[chave] = valor;
    else if (typeof valor === "number") form[chave] = numeroParaTexto(valor);
    else if (chave === "fechamento_dia") form[chave] = formatarHora(String(valor));
    else form[chave] = String(valor ?? "");
  }
  return form;
}

export function chavesAlteradas(
  form: FormularioParametros,
  base: FormularioParametros,
): ChaveParametro[] {
  return CHAVES_EDITAVEIS.filter((chave) => form[chave] !== base[chave]);
}

/** Campos numéricos vazios ou não-numéricos, que impediriam o salvamento. */
export function chavesInvalidas(form: FormularioParametros): ChaveParametro[] {
  return CHAVES_EDITAVEIS.filter(
    (chave) => ehNumerico(chave) && textoParaNumero(String(form[chave])) === null,
  );
}

/** Só o que mudou, já no formato que o banco espera. */
export function paraPatch(
  form: FormularioParametros,
  base: FormularioParametros,
): Partial<Parametros> {
  const patch: Record<string, unknown> = {};
  for (const chave of chavesAlteradas(form, base)) {
    const valor = form[chave];
    if (ehBooleano(chave)) patch[chave] = valor;
    else if (ehNumerico(chave)) patch[chave] = textoParaNumero(String(valor));
    else if (chave === "fechamento_dia") patch[chave] = `${String(valor)}:00`;
    else patch[chave] = String(valor);
  }
  return patch as Partial<Parametros>;
}

/**
 * Valor legível de um parâmetro — usado no diff de alterações pendentes e no
 * histórico. Traduz opção de select para o rótulo, booleano para
 * ativado/desativado e acrescenta a unidade quando houver.
 */
export function formatarValor(chave: ChaveParametro, valor: ValorFormulario | null): string {
  const meta = CAMPOS_POR_CHAVE.get(chave);
  if (!meta) return String(valor ?? "");

  if (meta.booleano) {
    const ligado = valor === true || valor === "true";
    return ligado ? "ativado" : "desativado";
  }

  const texto = String(valor ?? "").trim();
  if (texto === "") return "vazio";

  const opcao = meta.campo?.opcoes?.find((o) => o.valor === texto);
  if (opcao) return opcao.rotulo;

  if (meta.campo?.tipo === "hora") return formatarHora(texto);

  return meta.unidade ? `${texto} ${meta.unidade}` : texto;
}

/** Rótulo humano de uma chave — o histórico guarda o nome da coluna. */
export function rotuloDoCampo(chave: string): string {
  return CAMPOS_POR_CHAVE.get(chave as ChaveParametro)?.rotulo ?? chave;
}

/** Quantos campos sujos cada seção tem, para o contador da navegação. */
export function sujosPorSecao(alteradas: ChaveParametro[]): Record<string, number> {
  const conta: Record<string, number> = {};
  for (const secao of SECOES) {
    const chaves = new Set<ChaveParametro>([
      ...secao.campos.map((c) => c.chave),
      ...secao.toggles.map((t) => t.chave),
    ]);
    conta[secao.id] = alteradas.filter((c) => chaves.has(c)).length;
  }
  return conta;
}
