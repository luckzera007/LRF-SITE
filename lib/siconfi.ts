const SICONFI_URL =
  "https://apidatalake.tesouro.gov.br/ords/siconfi/tt/rgf";

export type RegistroRGF = {
  exercicio: number;
  periodo: number;
  periodicidade: string;
  instituicao: string;
  cod_ibge: number;
  uf: string;
  co_poder: string;
  populacao: number;
  anexo: string;
  esfera: string;
  rotulo: string;
  coluna: string;
  cod_conta: string;
  conta: string;
  valor: number;
};

/**
 * Busca os registros brutos do RGF-Anexo 01 para um município/ano/período.
 * Retorna lista vazia em caso de erro (não lança exceção), para permitir
 * consultas em lote (ex: vários anos) sem interromper as demais.
 */
export async function buscarRegistrosRGF(
  idEnte: string,
  ano: number,
  periodo: number
): Promise<RegistroRGF[]> {
  try {
    const params = new URLSearchParams({
      an_exercicio: String(ano),
      in_periodicidade: "Q",
      nr_periodo: String(periodo),
      co_tipo_demonstrativo: "RGF",
      no_anexo: "RGF-Anexo 01",
      co_esfera: "M",
      co_poder: "E",
      id_ente: idEnte,
    });

    const resposta = await fetch(
      `${SICONFI_URL}?${params.toString()}`,
      {
        cache: "no-store",
      }
    );

    if (!resposta.ok) {
      return [];
    }

    const dados = await resposta.json();

    return dados.items || [];
  } catch {
    return [];
  }
}

/**
 * Procura o valor de uma conta específica dentro dos registros do RGF.
 */
export function buscarValorConta(
  registros: RegistroRGF[],
  codConta: string,
  coluna = "Valor"
): number | null {
  const registro = registros.find(
    (item) =>
      item.cod_conta === codConta && item.coluna === coluna
  );

  return registro?.valor ?? null;
}
