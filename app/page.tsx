"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  interpretarConsulta,
  Municipio,
  ConsultaInterpretada,
} from "@/lib/interpretarConsulta";

import {
  interpretarComparacao,
  ComparacaoInterpretada,
} from "@/lib/interpretarComparacao";

import { indicadores } from "@/lib/indicadores";

export default function Home() {
  const router = useRouter();

  const [consulta, setConsulta] = useState("");

  const [municipios, setMunicipios] =
    useState<Municipio[]>([]);

  const [municipiosFiltrados, setMunicipiosFiltrados] =
    useState<Municipio[]>([]);

  const [buscaMunicipio, setBuscaMunicipio] =
    useState("");

  const [municipioSelecionado, setMunicipioSelecionado] =
    useState<Municipio | null>(null);

  const [carregandoMunicipios, setCarregandoMunicipios] =
    useState(true);

  const [interpretacao, setInterpretacao] =
    useState<ConsultaInterpretada | null>(null);

  const [comparacao, setComparacao] =
    useState<ComparacaoInterpretada | null>(null);

  useEffect(() => {
    async function carregarMunicipios() {
      try {
        const resposta = await fetch(
          "/api/siconfi/municipios"
        );

        if (!resposta.ok) {
          throw new Error(
            "Erro ao carregar municípios."
          );
        }

        const dados = await resposta.json();

        setMunicipios(
          dados.municipios || []
        );
      } catch (erro) {
        console.error(erro);
      } finally {
        setCarregandoMunicipios(false);
      }
    }

    carregarMunicipios();
  }, []);

  useEffect(() => {
    const termo = buscaMunicipio
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (!termo) {
      setMunicipiosFiltrados([]);
      return;
    }

    const resultados = municipios
      .filter((municipio) => {
        const nome = municipio.nome
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        return nome.includes(termo);
      })
      .slice(0, 10);

    setMunicipiosFiltrados(
      resultados
    );
  }, [
    buscaMunicipio,
    municipios,
  ]);

  function selecionarMunicipio(
    municipio: Municipio
  ) {
    setMunicipioSelecionado(municipio);
    setBuscaMunicipio(municipio.nome);
    setMunicipiosFiltrados([]);
  }

  function ehComparacao(
    texto: string
  ) {
    const textoNormalizado =
      texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    return (
      textoNormalizado.includes(
        "compare"
      ) ||
      textoNormalizado.includes(
        "comparar"
      ) ||
      textoNormalizado.includes(
        "comparacao"
      ) ||
      textoNormalizado.includes(
        "comparar entre"
      )
    );
  }

  function interpretar() {
    if (!consulta.trim()) {
      alert(
        "Digite o que você deseja consultar."
      );
      return;
    }

    setInterpretacao(null);
    setComparacao(null);

    if (ehComparacao(consulta)) {
      const resultado =
        interpretarComparacao(
          consulta,
          municipios
        );

      setComparacao(resultado);
      return;
    }

    const resultado =
      interpretarConsulta(
        consulta,
        municipios
      );

    setInterpretacao(resultado);
  }

  function confirmarConsulta() {
    if (!interpretacao) {
      return;
    }

    const idEnte =
      municipioSelecionado?.ibge ||
      interpretacao.idEnte;

    if (!idEnte) {
      alert(
        "Não consegui identificar o município."
      );
      return;
    }

    const params =
      new URLSearchParams({
        consulta,
        id_ente: idEnte,
        exercicio:
          interpretacao.exercicio,
        periodo:
          interpretacao.periodo,
        indicador:
          interpretacao.indicador,
      });

    router.push(
      `/resultado?${params.toString()}`
    );
  }

  function confirmarComparacao() {
    if (!comparacao) {
      return;
    }

    if (
      !comparacao.municipioA ||
      !comparacao.municipioB
    ) {
      alert(
        "Não consegui identificar os dois municípios da comparação."
      );
      return;
    }

    const params =
      new URLSearchParams({
        consulta,

        id_ente_a:
          comparacao.municipioA.ibge,

        id_ente_b:
          comparacao.municipioB.ibge,

        ano_a:
          comparacao.anoA,

        ano_b:
          comparacao.anoB,

        periodo_a:
          comparacao.periodoA,

        periodo_b:
          comparacao.periodoB,

        indicador:
          comparacao.indicador,
      });

    router.push(
      `/comparar?${params.toString()}`
    );
  }

  function nomeIndicador(
    indicador: string
  ) {
    return (
      indicadores[indicador]?.nome ||
      indicador
    );
  }

  function nomePeriodo(
    periodo: string
  ) {
    if (periodo === "1") {
      return "1º quadrimestre";
    }

    if (periodo === "2") {
      return "2º quadrimestre";
    }

    return "3º quadrimestre";
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-20">

        <div className="text-center">
          <h1 className="text-5xl font-bold">
            LRF
          </h1>

          <p className="text-gray-400 mt-4 text-lg">
            Consulte e analise informações
            fiscais de forma simples.
          </p>
        </div>

        <div className="mt-12 bg-gray-900 border border-gray-800 rounded-2xl p-6">

          <label className="block text-gray-400 mb-3">
            O que você deseja consultar?
          </label>

          <textarea
            value={consulta}
            onChange={(e) => {
              setConsulta(
                e.target.value
              );

              setInterpretacao(null);
              setComparacao(null);
            }}
            placeholder="Ex: Compare Curitiba em 2020 com São Paulo em 2025"
            className="w-full h-32 bg-gray-800 border border-gray-700 rounded-xl p-4 text-white outline-none resize-none"
          />

          <div className="mt-6">
            <label className="block text-gray-400 mb-2">
              Município
              <span className="text-gray-600 ml-2">
                opcional para comparações
              </span>
            </label>

            <input
              type="text"
              value={buscaMunicipio}
              onChange={(e) => {
                setBuscaMunicipio(
                  e.target.value
                );

                setMunicipioSelecionado(
                  null
                );

                setInterpretacao(null);
                setComparacao(null);
              }}
              placeholder={
                carregandoMunicipios
                  ? "Carregando municípios..."
                  : "Digite o nome do município"
              }
              disabled={
                carregandoMunicipios
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 outline-none"
            />

            {municipiosFiltrados.length >
              0 && (
              <div className="mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">

                {municipiosFiltrados.map(
                  (municipio) => (
                    <button
                      key={
                        municipio.ibge
                      }
                      type="button"
                      onClick={() =>
                        selecionarMunicipio(
                          municipio
                        )
                      }
                      className="w-full text-left px-4 py-3 hover:bg-gray-700 transition border-b border-gray-700 last:border-b-0"
                    >
                      <span className="font-medium">
                        {
                          municipio.nome
                        }
                      </span>

                      {municipio.uf && (
                        <span className="text-gray-400 ml-2">
                          (
                          {
                            municipio.uf
                          }
                          )
                        </span>
                      )}
                    </button>
                  )
                )}

              </div>
            )}
          </div>

          {municipioSelecionado && (
            <div className="mt-3 text-sm text-gray-400">
              Município selecionado:{" "}
              <span className="text-white">
                {
                  municipioSelecionado.nome
                }
              </span>
            </div>
          )}

          <button
            onClick={interpretar}
            className="mt-6 bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            Interpretar consulta
          </button>

          {interpretacao && (
            <div className="mt-6 bg-gray-800 border border-gray-700 rounded-2xl p-5">

              <h2 className="text-lg font-bold">
                Entendi sua consulta como:
              </h2>

              <div className="mt-4 space-y-3">

                <div>
                  <span className="text-gray-400">
                    Município:
                  </span>

                  <span className="ml-2">
                    {
                      interpretacao.municipio ||
                      municipioSelecionado?.nome ||
                      "Não identificado"
                    }
                  </span>
                </div>

                <div>
                  <span className="text-gray-400">
                    Ano:
                  </span>

                  <span className="ml-2">
                    {
                      interpretacao.exercicio
                    }
                  </span>
                </div>

                <div>
                  <span className="text-gray-400">
                    Período:
                  </span>

                  <span className="ml-2">
                    {nomePeriodo(
                      interpretacao.periodo
                    )}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400">
                    Indicador:
                  </span>

                  <span className="ml-2">
                    {nomeIndicador(
                      interpretacao.indicador
                    )}
                  </span>
                </div>

              </div>

              <div className="mt-5 flex gap-3">

                <button
                  onClick={
                    confirmarConsulta
                  }
                  className="bg-white text-black px-5 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Confirmar e consultar
                </button>

                <button
                  onClick={() =>
                    setInterpretacao(null)
                  }
                  className="bg-gray-700 text-white px-5 py-3 rounded-xl font-medium hover:bg-gray-600 transition"
                >
                  Corrigir
                </button>

              </div>
            </div>
          )}

          {comparacao && (
            <div className="mt-6 bg-gray-800 border border-gray-700 rounded-2xl p-5">

              <h2 className="text-lg font-bold">
                Entendi sua comparação como:
              </h2>

              <div className="mt-4 space-y-3">

                <div>
                  <span className="text-gray-400">
                    Município A:
                  </span>

                  <span className="ml-2">
                    {
                      comparacao
                        .municipioA
                        ?.nome ||
                      "Não identificado"
                    }
                  </span>
                </div>

                <div>
                  <span className="text-gray-400">
                    Ano A:
                  </span>

                  <span className="ml-2">
                    {comparacao.anoA}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400">
                    Município B:
                  </span>

                  <span className="ml-2">
                    {
                      comparacao
                        .municipioB
                        ?.nome ||
                      "Não identificado"
                    }
                  </span>
                </div>

                <div>
                  <span className="text-gray-400">
                    Ano B:
                  </span>

                  <span className="ml-2">
                    {comparacao.anoB}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400">
                    Período A:
                  </span>

                  <span className="ml-2">
                    {nomePeriodo(
                      comparacao.periodoA
                    )}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400">
                    Período B:
                  </span>

                  <span className="ml-2">
                    {nomePeriodo(
                      comparacao.periodoB
                    )}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400">
                    Indicador:
                  </span>

                  <span className="ml-2">
                    {nomeIndicador(
                      comparacao.indicador
                    )}
                  </span>
                </div>

              </div>

              <div className="mt-5 flex gap-3">

                <button
                  onClick={
                    confirmarComparacao
                  }
                  className="bg-white text-black px-5 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Confirmar comparação
                </button>

                <button
                  onClick={() =>
                    setComparacao(null)
                  }
                  className="bg-gray-700 text-white px-5 py-3 rounded-xl font-medium hover:bg-gray-600 transition"
                >
                  Corrigir
                </button>

              </div>
            </div>
          )}

        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">

          <button
            onClick={() =>
              router.push("/comparar")
            }
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-left hover:border-gray-600 transition"
          >
            <h2 className="text-xl font-bold">
              Comparar
            </h2>

            <p className="text-gray-400 mt-2">
              Compare indicadores entre
              diferentes períodos ou municípios.
            </p>
          </button>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold">
              Indicadores
            </h2>

            <p className="text-gray-400 mt-2">
              Consulte informações fiscais
              de forma simplificada.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold">
              Análises
            </h2>

            <p className="text-gray-400 mt-2">
              Encontre diferenças e
              variações nos dados.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}