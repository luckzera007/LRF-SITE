import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url =
      "https://apidatalake.tesouro.gov.br/ords/siconfi/tt/extrato_entregas";

    const resposta = await fetch(url, {
      cache: "no-store",
    });

    const texto = await resposta.text();

    console.log("STATUS:", resposta.status);
    console.log("RESPOSTA:", texto);

    return new NextResponse(texto, {
      status: resposta.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (erro) {
    console.error("ERRO:", erro);

    return NextResponse.json(
      {
        erro: "Erro ao conectar com o Tesouro Nacional.",
      },
      {
        status: 500,
      }
    );
  }
}