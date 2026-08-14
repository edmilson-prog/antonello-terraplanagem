/*
 * Nomes de eventos de window usados para avisar mudanças que não têm um canal
 * próprio. Módulo sem imports de propósito: quem emite e quem escuta podem
 * depender daqui sem fechar um ciclo entre si.
 */

// Emitido por operador-session ao gravar/encerrar a sessão por PIN. Ouvido por
// lib/credencial, que não pode ser importado de dentro de operador-session.
export const EVENTO_CREDENCIAL_OPERADOR = "antonello:credencial-operador";
