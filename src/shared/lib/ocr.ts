// Compatibilidade: a leitura de horímetro por foto agora vive na camada de
// IA plugável (PRD-019, A1). Este arquivo só reexporta para não quebrar
// horimetro-capture.tsx nem os pontos que ainda importam daqui.
export { IA_HABILITADA as OCR_HABILITADO } from "@/features/ia/delay";
export { lerHorimetro as lerHorimetroDaFoto, IA_HORIMETRO_VALOR_SIMULADO as OCR_VALOR_SIMULADO } from "@/features/ia/mock/captura";
