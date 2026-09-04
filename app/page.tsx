"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  interpretarConsulta,
  Municipio,
} from "@/lib/interpretarConsulta";

export default function Home() {
  const router = useRouter();

  const [consulta, setConsulta] =
    useState("");

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

        const dados =
          await resposta.json();

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
    const termo =
      buscaMunicipio
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (!termo) {
      setMunicipiosFiltrados([]);
      return;
    }

    const resultados =
      municipios
        .filter((municipio) => {
          const nome =
            municipio.nome
              .toLowerCase()
              .normalize("NFD")
              .replace(
                /[\u0300-\u036f]/g,
                ""
              );

          return nome.includes(termo);
        })
        .slice(0, 10);

    setMunicipiosFiltrados(
      resultados
    );
  }, [buscaMunicipio, municipios]);

  function selecionarMunicipio(
    municipio: Municipio
  ) {
    setMunicipioSelecionado(
      municipio
    );

    setBuscaMunicipio(
      municipio.nome
    );

    setMunicipiosFiltrados([]);
  }

  function realizarConsulta() {
    if (!consulta.trim()) {
      alert(
        "Digite o que você deseja consultar."
      );
      return;
    }

    const interpretacao =
      interpretarConsulta(
        consulta,
        municipios
      );

    const idEnte =
      municipioSelecionado?.ibge ||
      interpretacao.idEnte;

    if (!idEnte) {
      alert(
        "Não consegui identificar o município. Digite o nome do município na consulta ou selecione um município."
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
            onChange={(e) =>
              setConsulta(
                e.target.value
              )
            }
            placeholder="Ex: Quero ver a despesa com pessoal de Curitiba em 2025"
            className="w-full h-32 bg-gray-800 border border-gray-700 rounded-xl p-4 text-white outline-none resize-none"
          />

          <div className="mt-6">

            <label className="block text-gray-400 mb-2">
              Município
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
            onClick={
              realizarConsulta
            }
            className="mt-6 bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            Consultar
          </button>

        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">

          <button
            onClick={() =>
              router.push(
                "/comparar"
              )
            }
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-left hover:border-gray-600 transition"
          >
            <h2 className="text-xl font-bold">
              Comparar
            </h2>

            <p className="text-gray-400 mt-2">
              Compare indicadores entre
              diferentes períodos.
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