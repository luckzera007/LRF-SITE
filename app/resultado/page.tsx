"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Chart from "./chart";

type ResumoRGF = {
  exercicio: number;
  periodo: number;
  ente: string | null;
  codIbge: number;
  uf: string | null;
  populacao: number | null;

  receitaCorrenteLiquida: number | null;
  receitaCorrenteLiquidaAjustada: number | null;

  despesaTotalComPessoal: number | null;
  percentualDespesaComPessoal: number | null;

  limiteMaximo: number | null;
  percentualLimiteMaximo: number | null;

  limitePrudencial: number | null;
  percentualLimitePrudencial: number | null;

  limiteAlerta: number | null;
  percentualLimiteAlerta: number | null;
};

type HistoricoItem = {
  ano: number;
  valor: number | null;
  percentual: number | null;
};

export default function Resultado() {
  const searchParams = useSearchParams();

  const consulta =
    searchParams.get("consulta") ||
    "Nenhuma consulta informada";

  const idEnte =
    searchParams.get("id_ente") ||
    "4106902";

  const exercicio =
    searchParams.get("exercicio") ||
    "2025";

  const periodo =
    searchParams.get("periodo") ||
    "3";

  const indicador =
    searchParams.get("indicador") ||
    "despesa_pessoal";

  const [dados, setDados] =
    useState<ResumoRGF | null>(null);

  const [historico, setHistorico] =
    useState<HistoricoItem[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState<string | null>(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro(null);

        const resumoUrl =
          `/api/siconfi/rgf/resumo` +
          `?exercicio=${encodeURIComponent(
            exercicio
          )}` +
          `&periodo=${encodeURIComponent(
            periodo
          )}` +
          `&id_ente=${encodeURIComponent(
            idEnte
          )}`;

          const historicoUrl =
          `/api/siconfi/rgf/historico` +
          `?id_ente=${encodeURIComponent(
            idEnte
          )}` +
          `&anoInicial=2020` +
          `&anoFinal=${encodeURIComponent(
            exercicio
          )}` +
          `&periodo=${encodeURIComponent(
            periodo
          )}` +
          `&indicador=${encodeURIComponent(
            indicador
          )}`;
          
        const [
          respostaResumo,
          respostaHistorico,
        ] = await Promise.all([
          fetch(resumoUrl),
          fetch(historicoUrl),
        ]);

        if (!respostaResumo.ok) {
          throw new Error(
            "Não foi possível carregar o resumo."
          );
        }

        if (!respostaHistorico.ok) {
          throw new Error(
            "Não foi possível carregar o histórico."
          );
        }

        const resultadoResumo =
          await respostaResumo.json();

        const resultadoHistorico =
          await respostaHistorico.json();

        if (resultadoResumo.erro) {
          throw new Error(
            resultadoResumo.erro
          );
        }

        if (resultadoHistorico.erro) {
          throw new Error(
            resultadoHistorico.erro
          );
        }

        setDados(resultadoResumo);

        setHistorico(
          resultadoHistorico.historico ||
            []
        );
      } catch (error) {
        console.error(error);

        setErro(
          error instanceof Error
            ? error.message
            : "Erro ao carregar os dados."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [idEnte, exercicio, periodo]);

  function formatarMoeda(
    valor: number | null
  ) {
    if (valor === null) {
      return "Não disponível";
    }

    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 2,
    });
  }

  function formatarPercentual(
    valor: number | null
  ) {
    if (valor === null) {
      return "Não disponível";
    }

    return `${valor.toLocaleString(
      "pt-BR",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}%`;
  }

  function nomeIndicador() {
    switch (indicador) {
      case "rcl":
        return "Receita Corrente Líquida Ajustada";

      case "despesa_pessoal":
      default:
        return "Despesa Total com Pessoal";
    }
  }

  function valorAtual() {
    if (!dados) {
      return null;
    }

    switch (indicador) {
      case "rcl":
        return dados.receitaCorrenteLiquidaAjustada;

      case "despesa_pessoal":
      default:
        return dados.despesaTotalComPessoal;
    }
  }

  function percentualAtual() {
    if (!dados) {
      return null;
    }

    switch (indicador) {
      case "despesa_pessoal":
        return dados.percentualDespesaComPessoal;

      case "rcl":
      default:
        return null;
    }
  }

  function interpretarSituacao() {
    if (!dados) {
      return null;
    }

    if (
      indicador !== "despesa_pessoal" ||
      dados.percentualDespesaComPessoal === null
    ) {
      return null;
    }

    const atual =
      dados.percentualDespesaComPessoal;

    if (
      dados.percentualLimiteMaximo !== null &&
      atual >= dados.percentualLimiteMaximo
    ) {
      return "Acima do limite máximo";
    }

    if (
      dados.percentualLimitePrudencial !== null &&
      atual >= dados.percentualLimitePrudencial
    ) {
      return "Acima do limite prudencial";
    }

    if (
      dados.percentualLimiteAlerta !== null &&
      atual >= dados.percentualLimiteAlerta
    ) {
      return "Acima do limite de alerta";
    }

    return "Abaixo do limite de alerta";
  }

  function valorHistorico() {
    return historico.filter(
      (item) => item.valor !== null
    );
  }

  const historicoValido =
    valorHistorico();

  let analiseVariacao: {
    inicial: number;
    final: number;
    diferenca: number;
    variacao: number;
    anoInicial: number;
    anoFinal: number;
  } | null = null;

  if (historicoValido.length >= 2) {
    const primeiro =
      historicoValido[0];

    const ultimo =
      historicoValido[
        historicoValido.length - 1
      ];

    const inicial = primeiro.valor!;
    const final = ultimo.valor!;

    const diferenca =
      final - inicial;

    const variacao =
      inicial !== 0
        ? (diferenca / inicial) * 100
        : 0;

    analiseVariacao = {
      inicial,
      final,
      diferenca,
      variacao,
      anoInicial: primeiro.ano,
      anoFinal: ultimo.ano,
    };
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold">
          Resultado da consulta
        </h1>

        <p className="text-gray-400 mt-2 mb-8">
          Consulta: {consulta}
        </p>

        {carregando && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <p className="text-gray-400">
              Consultando os dados do SICONFI...
            </p>
          </div>
        )}

        {erro && (
          <div className="bg-red-950 border border-red-900 rounded-2xl p-6">

            <h2 className="text-xl font-bold">
              Erro
            </h2>

            <p className="text-red-300 mt-2">
              {erro}
            </p>

          </div>
        )}

        {dados && (
          <>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">

              <p className="text-gray-400">
                Município
              </p>

              <h2 className="text-2xl font-bold mt-1">
                {dados.ente}
              </h2>

              <p className="text-gray-500 mt-2">
                Exercício {dados.exercicio}
                {" • "}
                Período {dados.periodo}º quadrimestre
                {" • "}
                Código IBGE {dados.codIbge}
              </p>

            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">

              <p className="text-gray-400">
                Indicador consultado
              </p>

              <h2 className="text-2xl font-bold mt-1">
                {nomeIndicador()}
              </h2>

              <p className="text-3xl font-bold mt-5">
                {formatarMoeda(
                  valorAtual()
                )}
              </p>

              {percentualAtual() !== null && (
                <p className="text-gray-400 mt-2">
                  {formatarPercentual(
                    percentualAtual()
                  )}{" "}
                  da RCL Ajustada
                </p>
              )}

            </div>

            <div className="mt-8 bg-gray-900 border border-gray-800 rounded-2xl p-6">

              <h2 className="text-xl font-bold">
                Histórico
              </h2>

              <p className="text-gray-400 mt-1 mb-6">
                Evolução de{" "}
                {nomeIndicador()} entre 2020 e{" "}
                {dados.exercicio}.
              </p>

              <Chart
                historico={historico}
              />

            </div>

            <div className="mt-8 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

              <div className="p-6">

                <h2 className="text-xl font-bold">
                  Histórico detalhado
                </h2>

                <p className="text-gray-400 mt-1">
                  Dados retornados pelo SICONFI.
                </p>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-800">

                    <tr>

                      <th className="text-left p-4">
                        Ano
                      </th>

                      <th className="text-left p-4">
                        Valor
                      </th>

                      {indicador ===
                        "despesa_pessoal" && (
                        <th className="text-left p-4">
                          % da RCL Ajustada
                        </th>
                      )}

                    </tr>

                  </thead>

                  <tbody>

                    {historico.map(
                      (item) => (
                        <tr
                          key={item.ano}
                          className="border-t border-gray-800"
                        >

                          <td className="p-4">
                            {item.ano}
                          </td>

                          <td className="p-4">
                            {formatarMoeda(
                              item.valor
                            )}
                          </td>

                          {indicador ===
                            "despesa_pessoal" && (
                            <td className="p-4">
                              {formatarPercentual(
                                item.percentual
                              )}
                            </td>
                          )}

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {analiseVariacao && (
              <div className="mt-8">

                <h2 className="text-2xl font-bold mb-4">
                  Análise da evolução
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

                    <p className="text-gray-400">
                      Valor inicial
                    </p>

                    <h3 className="text-2xl font-bold mt-2">
                      {formatarMoeda(
                        analiseVariacao.inicial
                      )}
                    </h3>

                    <p className="text-gray-500 mt-1">
                      {analiseVariacao.anoInicial}
                    </p>

                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

                    <p className="text-gray-400">
                      Valor final
                    </p>

                    <h3 className="text-2xl font-bold mt-2">
                      {formatarMoeda(
                        analiseVariacao.final
                      )}
                    </h3>

                    <p className="text-gray-500 mt-1">
                      {analiseVariacao.anoFinal}
                    </p>

                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

                    <p className="text-gray-400">
                      Variação
                    </p>

                    <h3 className="text-2xl font-bold mt-2">

                      {analiseVariacao.variacao >=
                      0
                        ? "+"
                        : ""}

                      {analiseVariacao.variacao.toLocaleString(
                        "pt-BR",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}

                      %

                    </h3>

                    <p className="text-gray-500 mt-1">
                      Diferença de{" "}
                      {formatarMoeda(
                        analiseVariacao.diferenca
                      )}
                    </p>

                  </div>

                </div>

                <div className="mt-4 bg-gray-900 border border-gray-800 rounded-2xl p-6">

                  <h3 className="text-lg font-bold">
                    Interpretação
                  </h3>

                  <p className="text-gray-400 mt-2">

                    Entre{" "}
                    {analiseVariacao.anoInicial}
                    {" "}e{" "}
                    {analiseVariacao.anoFinal},
                    {" "}
                    {nomeIndicador()}{" "}

                    {analiseVariacao.variacao > 0
                      ? "aumentou"
                      : analiseVariacao.variacao < 0
                        ? "diminuiu"
                        : "permaneceu estável"}

                    {" "}
                    {Math.abs(
                      analiseVariacao.variacao
                    ).toLocaleString(
                      "pt-BR",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}

                    %.

                  </p>

                </div>

              </div>
            )}

            {indicador ===
              "despesa_pessoal" && (
              <>
                <div className="mt-8 bg-gray-900 border border-gray-800 rounded-2xl p-6">

                  <h2 className="text-xl font-bold">
                    Situação perante os limites
                  </h2>

                  <p className="text-gray-400 mt-1 mb-5">
                    Análise da Despesa Total com
                    Pessoal em relação aos limites
                    da LRF.
                  </p>

                  <h3 className="text-2xl font-bold">
                    {interpretarSituacao()}
                  </h3>

                  <p className="text-gray-400 mt-3">
                    DTP atual:{" "}
                    <span className="text-white">
                      {formatarPercentual(
                        dados.percentualDespesaComPessoal
                      )}
                    </span>
                  </p>

                </div>

                <div className="mt-8 bg-gray-900 border border-gray-800 rounded-2xl p-6">

                  <h2 className="text-xl font-bold">
                    Limites da Despesa com Pessoal
                  </h2>

                  <p className="text-gray-400 mt-1 mb-6">
                    Limites apresentados pelo RGF.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="bg-gray-800 rounded-xl p-5">

                      <p className="text-gray-400">
                        Limite de alerta
                      </p>

                      <h3 className="text-xl font-bold mt-2">
                        {formatarPercentual(
                          dados.percentualLimiteAlerta
                        )}
                      </h3>

                      <p className="text-gray-500 mt-2">
                        {formatarMoeda(
                          dados.limiteAlerta
                        )}
                      </p>

                    </div>

                    <div className="bg-gray-800 rounded-xl p-5">

                      <p className="text-gray-400">
                        Limite prudencial
                      </p>

                      <h3 className="text-xl font-bold mt-2">
                        {formatarPercentual(
                          dados.percentualLimitePrudencial
                        )}
                      </h3>

                      <p className="text-gray-500 mt-2">
                        {formatarMoeda(
                          dados.limitePrudencial
                        )}
                      </p>

                    </div>

                    <div className="bg-gray-800 rounded-xl p-5">

                      <p className="text-gray-400">
                        Limite máximo
                      </p>

                      <h3 className="text-xl font-bold mt-2">
                        {formatarPercentual(
                          dados.percentualLimiteMaximo
                        )}
                      </h3>

                      <p className="text-gray-500 mt-2">
                        {formatarMoeda(
                          dados.limiteMaximo
                        )}
                      </p>

                    </div>

                  </div>

                </div>
              </>
            )}

          </>
        )}

      </div>

    </main>
  );
}