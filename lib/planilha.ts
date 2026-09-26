import path from "path";
import ExcelJS from "exceljs";

import { indicadores } from "./indicadores";
import { buscarRegistrosRGF, buscarValorConta } from "./siconfi";

const CAMINHO_MODELO = path.join(
  process.cwd(),
  "public",
  "templates",
  "analise-financeira-modelo.xlsx"
);

const NOME_ABA = "Módulo 1 - Análise Financeira";

// Coluna de cada ano na planilha (B=2019 ... H=2025).
// Se o modelo ganhar novas colunas de anos no futuro, basta estender aqui.
const COLUNA_POR_ANO: Record<number, number> = {
  2019: 2,
  2020: 3,
  2021: 4,
  2022: 5,
  2023: 6,
  2024: 7,
  2025: 8,
};

const LINHA_RCL = 6;
const LINHA_DESPESA_PESSOAL = 9;

export type ResultadoPlanilha = {
  workbook: ExcelJS.Workbook;
  municipio: string | null;
  uf: string | null;
  anosPreenchidos: number[];
  anosSemDados: number[];
};

/**
 * Carrega o modelo de planilha (Módulo 1 - Análise Financeira) e preenche
 * as linhas de RCL Ajustada e Despesa Total com Pessoal com os valores reais
 * retornados pelo SICONFI, para cada ano do intervalo informado que exista
 * como coluna no modelo. Fórmulas e formatação do modelo são preservadas —
 * apenas o valor das células de entrada é sobrescrito.
 */
export async function gerarPlanilhaPreenchida(
  idEnte: string,
  anoInicial: number,
  anoFinal: number,
  periodo: number
): Promise<ResultadoPlanilha> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(CAMINHO_MODELO);

  const aba = workbook.getWorksheet(NOME_ABA);

  if (!aba) {
    throw new Error(
      `Aba "${NOME_ABA}" não encontrada no modelo de planilha.`
    );
  }

  let municipio: string | null = null;
  let uf: string | null = null;

  const anosPreenchidos: number[] = [];
  const anosSemDados: number[] = [];

  for (let ano = anoInicial; ano <= anoFinal; ano++) {
    const coluna = COLUNA_POR_ANO[ano];

    // Ano fora do intervalo de colunas do modelo (ex: antes de 2019): ignora.
    if (!coluna) {
      continue;
    }

    const registros = await buscarRegistrosRGF(
      idEnte,
      ano,
      periodo
    );

    if (registros.length === 0) {
      anosSemDados.push(ano);
      continue;
    }

    if (!municipio) {
      municipio = registros[0]?.instituicao || null;
      uf = registros[0]?.uf || null;
    }

    const rcl = buscarValorConta(
      registros,
      indicadores.rcl.codConta,
      indicadores.rcl.coluna
    );

    const despesaPessoal = buscarValorConta(
      registros,
      indicadores.despesa_pessoal.codConta,
      indicadores.despesa_pessoal.coluna
    );

    let algumValorEncontrado = false;

    if (rcl !== null) {
      aba.getRow(LINHA_RCL).getCell(coluna).value = rcl;
      algumValorEncontrado = true;
    }

    if (despesaPessoal !== null) {
      aba
        .getRow(LINHA_DESPESA_PESSOAL)
        .getCell(coluna).value = despesaPessoal;
      algumValorEncontrado = true;
    }

    if (algumValorEncontrado) {
      anosPreenchidos.push(ano);
    } else {
      anosSemDados.push(ano);
    }
  }

  if (municipio) {
    aba.getCell("A3").value =
      `MUNICÍPIO: ${municipio}${
        uf ? " / " + uf : ""
      }  (edite esta célula com o nome do município)`;
  }

  // Garante que Excel/LibreOffice recalculem as fórmulas de evolução (%)
  // ao abrir o arquivo, já que só escrevemos os valores brutos.
  workbook.calcProperties.fullCalcOnLoad = true;

  return {
    workbook,
    municipio,
    uf,
    anosPreenchidos,
    anosSemDados,
  };
}
