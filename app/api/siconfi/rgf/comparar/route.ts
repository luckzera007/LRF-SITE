import { NextRequest, NextResponse } from "next/server";
import { indicadores } from "@/lib/indicadores";

const SICONFI_URL =
  "https://apidatalake.tesouro.gov.br/ords/siconfi/tt/rgf";

type RegistroRGF = {
  cod_conta: string;
  coluna: string;
  valor: number;
  instituicao: string;
  cod_ibge: number;
  uf: string;
};

async function buscarIndicador(
  idEnte: string,
  ano: string,
  periodo: string,
  indicadorCodigo: string
) {
  const indicador =
    indicadores[indicadorCodigo];

  if (!indicador) {
    return null;
  }

  const params = new URLSearchParams({
    an_exercicio: ano,
    in_periodicidade: "Q",
    nr_periodo: periodo,
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
    return null;
  }

  const dados = await resposta.json();

  const registros: RegistroRGF[] =
    dados.items || [];

  const registro = registros.find(
    (item) =>
      item.cod_conta ===
        indicador.codConta &&
      item.coluna === indicador.coluna
  );

  if (!registro) {
    return null;
  }

  let percentual:
    | number
    | null = null;

  if (
    indicador.percentualConta &&
    indicador.percentualColuna
  ) {
    const registroPercentual =
      registros.find(
        (item) =>
          item.cod_conta ===
            indicador.percentualConta &&
          item.coluna ===
            indicador.percentualColuna
      );

    percentual =
      registroPercentual?.valor ??
      null;
  }

  return {
    nome: registro.instituicao,
    ibge: registro.cod_ibge,
    uf: registro.uf,
    valor: registro.valor,
    percentual,
    indicadorNome:
      indicador.nome,
  };
}

export async function GET(
  request: NextRequest
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const idEnteA =
      searchParams.get("id_ente_a");

    const idEnteB =
      searchParams.get("id_ente_b");

    const anoA =
      searchParams.get("ano_a");

    const anoB =
      searchParams.get("ano_b");

    const periodoA =
      searchParams.get("periodo_a") ||
      "3";

    const periodoB =
      searchParams.get("periodo_b") ||
      "3";

    const indicadorCodigo =
      searchParams.get("indicador") ||
      "despesa_pessoal";

    if (
      !idEnteA ||
      !idEnteB ||
      !anoA ||
      !anoB
    ) {
      return NextResponse.json(
        {
          erro:
            "Informe os dois municípios e os dois anos.",
        },
        {
          status: 400,
        }
      );
    }

    if (!indicadores[indicadorCodigo]) {
      return NextResponse.json(
        {
          erro:
            "Indicador não encontrado.",
          indicadoresDisponiveis:
            Object.keys(indicadores),
        },
        {
          status: 400,
        }
      );
    }

    const [
      resultadoA,
      resultadoB,
    ] = await Promise.all([
      buscarIndicador(
        idEnteA,
        anoA,
        periodoA,
        indicadorCodigo
      ),

      buscarIndicador(
        idEnteB,
        anoB,
        periodoB,
        indicadorCodigo
      ),
    ]);

    if (!resultadoA) {
      return NextResponse.json(
        {
          erro:
            `Não foram encontrados dados para o Período A em ${anoA}.`,
        },
        {
          status: 404,
        }
      );
    }

    if (!resultadoB) {
      return NextResponse.json(
        {
          erro:
            `Não foram encontrados dados para o Período B em ${anoB}.`,
        },
        {
          status: 404,
        }
      );
    }

    const diferenca =
      resultadoA.valor -
      resultadoB.valor;

    const diferencaPercentual =
      resultadoB.valor !== 0
        ? (diferenca /
            resultadoB.valor) *
          100
        : 0;

    return NextResponse.json({
      indicador:
        indicadorCodigo,

      indicadorNome:
        resultadoA.indicadorNome,

      municipioA: {
        nome: resultadoA.nome,
        ibge: resultadoA.ibge,
        uf: resultadoA.uf,
        ano: Number(anoA),
        periodo: Number(periodoA),
        valor: resultadoA.valor,
        percentual:
          resultadoA.percentual,
      },

      municipioB: {
        nome: resultadoB.nome,
        ibge: resultadoB.ibge,
        uf: resultadoB.uf,
        ano: Number(anoB),
        periodo: Number(periodoB),
        valor: resultadoB.valor,
        percentual:
          resultadoB.percentual,
      },

      diferenca,
      diferencaPercentual,
    });
  } catch (erro) {
    console.error(
      "ERRO AO COMPARAR:",
      erro
    );

    return NextResponse.json(
      {
        erro:
          "Erro ao realizar a comparação.",
      },
      {
        status: 500,
      }
    );
  }
}