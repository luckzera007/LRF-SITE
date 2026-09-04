import { NextRequest, NextResponse } from "next/server";

const SICONFI_URL =
  "https://apidatalake.tesouro.gov.br/ords/siconfi/tt/rgf";

type RegistroRGF = {
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const exercicio =
      searchParams.get("exercicio") || "2025";

    const periodo =
      searchParams.get("periodo") || "3";

    const idEnte =
      searchParams.get("id_ente") || "4106902";

    const params = new URLSearchParams({
      an_exercicio: exercicio,
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
      const erro = await resposta.text();

      return NextResponse.json(
        {
          erro: "Erro retornado pelo SICONFI.",
          status: resposta.status,
          detalhes: erro,
        },
        {
          status: resposta.status,
        }
      );
    }

    const dados = await resposta.json();

    const registros: RegistroRGF[] = dados.items || [];

    function buscarValor(
      codConta: string,
      coluna = "Valor"
    ) {
      const registro = registros.find(
        (item) =>
          item.cod_conta === codConta &&
          item.coluna === coluna
      );

      return registro?.valor ?? null;
    }

    const resumo = {
      exercicio: Number(exercicio),
      periodo: Number(periodo),
      ente: registros[0]?.instituicao || null,
      codIbge: registros[0]?.cod_ibge || Number(idEnte),
      uf: registros[0]?.uf || null,
      populacao: registros[0]?.populacao || null,

      receitaCorrenteLiquida: buscarValor(
        "ReceitaCorrenteLiquida"
      ),

      receitaCorrenteLiquidaAjustada: buscarValor(
        "ReceitaCorrenteLiquidaAjustada"
      ),

      despesaTotalComPessoal: buscarValor(
        "DespesaComPessoalTotal"
      ),

      percentualDespesaComPessoal:
        buscarValor(
          "DespesaComPessoalTotal",
          "% sobre a RCL Ajustada"
        ),

      limiteMaximo: buscarValor(
        "LimiteMaximoDespesaComPessoalTotal"
      ),

      percentualLimiteMaximo:
        buscarValor(
          "LimiteMaximoDespesaComPessoalTotal",
          "% sobre a RCL Ajustada"
        ),

      limitePrudencial: buscarValor(
        "LimitePrudencialDespesaComPessoalTotal"
      ),

      percentualLimitePrudencial:
        buscarValor(
          "LimitePrudencialDespesaComPessoalTotal",
          "% sobre a RCL Ajustada"
        ),

      limiteAlerta: buscarValor(
        "LimiteDeAlertaDespesaComPessoalTotal"
      ),

      percentualLimiteAlerta:
        buscarValor(
          "LimiteDeAlertaDespesaComPessoalTotal",
          "% sobre a RCL Ajustada"
        ),
    };

    return NextResponse.json(resumo);
  } catch (erro) {
    console.error("ERRO NO RESUMO RGF:", erro);

    return NextResponse.json(
      {
        erro: "Erro ao processar os dados do RGF.",
      },
      {
        status: 500,
      }
    );
  }
}