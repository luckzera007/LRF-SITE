export type IndicadorConfig = {
    codigo: string;
    nome: string;
    codConta: string;
    coluna: string;
    percentualConta?: string;
    percentualColuna?: string;
  };
  
  export const indicadores: Record<
    string,
    IndicadorConfig
  > = {
    despesa_pessoal: {
      codigo: "despesa_pessoal",
      nome: "Despesa Total com Pessoal",
      codConta: "DespesaComPessoalTotal",
      coluna: "Valor",
      percentualConta: "DespesaComPessoalTotal",
      percentualColuna:
        "% sobre a RCL Ajustada",
    },
  
    rcl: {
      codigo: "rcl",
      nome: "Receita Corrente Líquida Ajustada",
      codConta:
        "ReceitaCorrenteLiquidaAjustada",
      coluna: "Valor",
    },
  };
  