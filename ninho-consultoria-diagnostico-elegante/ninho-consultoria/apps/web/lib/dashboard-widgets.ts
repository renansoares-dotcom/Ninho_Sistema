export type WidgetId = "receita" | "funil" | "atividades" | "produtividade";

export const catalogoWidgets: { id: WidgetId; label: string }[] = [
  { id: "receita", label: "Evolução da receita" },
  { id: "funil", label: "Funil de conversão" },
  { id: "atividades", label: "Atividades recentes" },
  { id: "produtividade", label: "Produtividade dos consultores" },
];
