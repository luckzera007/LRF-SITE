import { NextResponse } from "next/server";

const SICONFI_URL =
  "https://apidatalake.tesouro.gov.br/ords/siconfi/tt/entes";

export async function GET() {
  try {
    const resposta = await fetch(SICONFI_URL, {
      cache: "no-store",
    });

    if (!resposta.ok) {
      const erro = await resposta.text();

      return NextResponse.json(
        {
          erro: "Erro ao consultar os entes do SICONFI.",
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
    console.error("ERRO:", erro);

    return NextResponse.json(
      {
        erro: "Não foi possível conectar ao SICONFI.",
      },
      {
        status: 500,
      }
    );
  }
}
