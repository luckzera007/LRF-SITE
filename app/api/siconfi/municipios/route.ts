import { NextResponse } from "next/server";

const SICONFI_URL =
  "https://apidatalake.tesouro.gov.br/ords/siconfi/tt/entes";

type EnteSiconfi = {
  cod_ibge?: number;
  id_ente?: number;
  nome?: string;
  ente?: string;
  uf?: string;
};

export async function GET() {
  try {
    const resposta = await fetch(SICONFI_URL, {
      cache: "no-store",
    });

    if (!resposta.ok) {
      const erro = await resposta.text();

      return NextResponse.json(
        {
          erro: "Erro ao consultar os municípios.",
          status: resposta.status,
          detalhes: erro,
        },
        {
          status: resposta.status,
        }
      );
    }

    const dados = await resposta.json();

    const itens: EnteSiconfi[] = dados.items || [];

    const municipios = itens
      .map((item) => ({
        nome:
          item.nome ||
          item.ente ||
          "Município não identificado",

        ibge:
          String(
            item.cod_ibge ||
            item.id_ente ||
            ""
          ),

        uf: item.uf || "",
      }))
      .filter(
        (item) =>
          item.ibge !== "" &&
          item.nome !== "Município não identificado"
      );

    return NextResponse.json({
      municipios,
      total: municipios.length,
    });
  } catch (erro) {
    console.error(
      "ERRO AO BUSCAR MUNICÍPIOS:",
      erro
    );

    return NextResponse.json(
      {
        erro:
          "Não foi possível consultar os municípios do SICONFI.",
      },
      {
        status: 500,
      }
    );
  }
}
