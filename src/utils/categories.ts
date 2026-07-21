export const CATEGORIES = [
  "Backup",
  "Limpeza de disco",
  "Remocao de virus",
  "Atualizacao de drivers",
  "Formatacao"
] as const

export type Category = keyof typeof CATEGORIES