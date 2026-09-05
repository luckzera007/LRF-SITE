import { NextRequest, NextResponse } from "next/server";
import { indicadores } from "@/lib/indicadores";

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

export async function GET(
  request: NextRequest
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const idEnte =
      searchParams.get("id_ente") ||
      "4106902";

    const anoInicial = Number(
      searchParams.get(
        "anoInicial"
      ) || "2020"
    );

    const anoFinal = Number(
      searchParams.get(
        "anoFinal"
      ) || "2025"
    );

    const periodo = Number(
      searchParams.get(
        "periodo"
      ) || "3"
    );

    const indicadorCodigo =
      searchParams.get(
        "indicador"
      ) || "despesa_pessoal";

    const indicador =
      indicadores[indicadorCodigo];

    if (!indicador) {
      return NextResponse.json(
        {
          erro:
            "Indicador não encontrado.",
          indicadoresDisponiveis:
            Object.keys(
              indicadores
            ),
        },
        {
          status: 400,
        }
      );
    }

    const anos: number[] = [];

    for (
      let ano = anoInicial;
      ano <= anoFinal;
      ano++
    ) {
      anos.push(ano);
    }

    const resultados =
      await Promise.all(
        anos.map(
          async (ano) => {
            try {
              const params =
                new URLSearchParams({
                  an_exercicio:
                    String(ano),

                  in_periodicidade:
                    "Q",

                  nr_periodo:
                    String(periodo),

                  co_tipo_demonstrativo:
                    "RGF",

                  no_anexo:
                    "RGF-Anexo 01",

                  co_esfera:
                    "M",

                  co_poder:
                    "E",

                  id_ente:
                    idEnte,
                });

              const resposta =
                await fetch(
                  `${SICONFI_URL}?${params.toString()}`,
                  {
                    cache:
                      "no-store",
                  }
                );

              if (
                !resposta.ok
              ) {
                return {
                  ano,
                  valor:
                    null,
                  percentual:
                    null,
                };
              }

              const dados =
                await resposta.json();

              const registros:
                RegistroRGF[] =
                dados.items ||
                [];

              const valor =
                registros.find(
                  (item) =>
                    item.cod_conta ===
                      indicador.codConta &&
                    item.coluna ===
                      indicador.coluna
                )?.valor ??
                null;

              let percentual:
                number | null =
                null;

              if (
                indicador.percentualConta &&
                indicador.percentualColuna
              ) {
                percentual =
                  registros.find(
                    (item) =>
                      item.cod_conta ===
                        indicador.percentualConta &&
                      item.coluna ===
                        indicador.percentualColuna
                  )?.valor ??
                  null;
              }

              return {
                ano,
                valor,
                percentual,
              };
            } catch {
              return {
                ano,
                valor: null,
                percentual: null,
              };
            }
          }
        )
      );

    return NextResponse.json({
      indicador:
        indicadorCodigo,

      indicadorNome:
        indicador.nome,

      idEnte,
      periodo,
      anoInicial,
      anoFinal,

      historico:
        resultados,
    });
  } catch (erro) {
    console.error(
      "ERRO AO BUSCAR HISTÓRICO:",
      erro
    );

    return NextResponse.json(
      {
        erro:
          "Erro ao consultar o histórico do SICONFI.",
      },
      {
        status: 500,
      }
    );
  }
}