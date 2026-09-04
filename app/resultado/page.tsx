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

export default function Resultado() {
  const searchParams = useSearchParams();

  const consulta =
    searchParams.get("consulta") ||
    "Nenhuma consulta informada";

  const idEnte =
    searchParams.get("id_ente") || "4106902";

  const exercicio =
    searchParams.get("exercicio") || "2025";

  const periodo =
    searchParams.get("periodo") || "3";

  const [dados, setDados] =
    useState<ResumoRGF | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState<string | null>(null);

  useEffect(() => {
    async function buscarDados() {
      try {
        setCarregando(true);
        setErro(null);

        const url =
          `/api/siconfi/rgf/resumo` +
          `?exercicio=${exercicio}` +
          `&periodo=${periodo}` +
          `&id_ente=${idEnte}`;

        const resposta = await fetch(url);

        if (!resposta.ok) {
          throw new Error(
            "Não foi possível buscar os dados."
          );
        }

        const resultado =
          await resposta.json();

        if (resultado.erro) {
          throw new Error(resultado.erro);
        }

        setDados(resultado);
      } catch (error) {
        console.error(error);

        setErro(
          error instanceof Error
            ? error.message
            : "Erro desconhecido."
        );
      } finally {
        setCarregando(false);
      }
    }

    buscarDados();
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

    return `${valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}%`;
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
                Exercício {dados.exercicio} •
                Período {dados.periodo} •
                Código IBGE {dados.codIbge}
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

                <p className="text-gray-400">
                  Receita Corrente Líquida Ajustada
                </p>

                <h2 className="text-2xl font-bold mt-2">
                  {formatarMoeda(
                    dados.receitaCorrenteLiquidaAjustada
                  )}
                </h2>

              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

                <p className="text-gray-400">
                  Despesa Total com Pessoal
                </p>

                <h2 className="text-2xl font-bold mt-2">
                  {formatarMoeda(
                    dados.despesaTotalComPessoal
                  )}
                </h2>

              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

                <p className="text-gray-400">
                  DTP sobre RCL Ajustada
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {formatarPercentual(
                    dados.percentualDespesaComPessoal
                  )}
                </h2>

              </div>

            </div>

            <div className="mt-8 bg-gray-900 border border-gray-800 rounded-2xl p-6">

              <h2 className="text-xl font-bold">
                Limites da Despesa com Pessoal
              </h2>

              <p className="text-gray-400 mt-1 mb-6">
                Comparação com os limites previstos
                na LRF.
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

            <div className="mt-8 bg-gray-900 border border-gray-800 rounded-2xl p-6">

              <h2 className="text-xl font-bold">
                Indicador atual
              </h2>

              <p className="text-gray-400 mt-1 mb-6">
                Despesa Total com Pessoal sobre
                a RCL Ajustada
              </p>

              <Chart
                valor={
                  dados.percentualDespesaComPessoal ?? 0
                }
                limiteAlerta={
                  dados.percentualLimiteAlerta ?? 0
                }
                limitePrudencial={
                  dados.percentualLimitePrudencial ?? 0
                }
                limiteMaximo={
                  dados.percentualLimiteMaximo ?? 0
                }
              />

            </div>
          </>
        )}

      </div>

    </main>
  );
}