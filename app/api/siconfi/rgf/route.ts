import { NextRequest, NextResponse } from "next/server";

const SICONFI_URL =
  "https://apidatalake.tesouro.gov.br/ords/siconfi/tt/rgf";

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

    return NextResponse.json(dados);
  } catch (erro) {
    console.error("ERRO SICONFI:", erro);

    return NextResponse.json(
      {
        erro: "Erro ao consultar o SICONFI.",
      },
      {
        status: 500,
      }
    );
  }
}