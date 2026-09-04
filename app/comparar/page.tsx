"use client";

import { useState } from "react";
import { valores } from "./dados";

type Indicador = keyof typeof valores;
type Municipio = keyof typeof valores["Despesa com pessoal"];
type Ano = keyof typeof valores["Despesa com pessoal"]["Curitiba"];

export default function Comparar() {
  const [municipio, setMunicipio] =
    useState<Municipio>("Curitiba");

  const [indicador, setIndicador] =
    useState<Indicador>("Despesa com pessoal");

  const [anoInicial, setAnoInicial] =
    useState<Ano>("2020");

  const [anoFinal, setAnoFinal] =
    useState<Ano>("2025");

  const [resultado, setResultado] = useState<{
    inicial: number;
    final: number;
    diferenca: number;
    variacao: number;
  } | null>(null);

  function comparar() {
    const inicial = valores[indicador][municipio][anoInicial];

    const final = valores[indicador][municipio][anoFinal];

    const diferenca = final - inicial;

    const variacao = (diferenca / inicial) * 100;

    setResultado({
      inicial,
      final,
      diferenca,
      variacao,
    });
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold">
          Comparar períodos
        </h1>

        <p className="text-gray-400 mt-2 mb-8">
          Compare os dados fiscais entre dois períodos.
        </p>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* MUNICÍPIO */}
            <div>
              <label className="block text-gray-400 mb-2">
                Município
              </label>

              <select
                value={municipio}
                onChange={(e) => {
                  setMunicipio(e.target.value as Municipio);
                  setResultado(null);
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 outline-none"
              >
                <option value="Curitiba">
                  Curitiba
                </option>

                <option value="São Paulo">
                  São Paulo
                </option>

                <option value="Londrina">
                  Londrina
                </option>
              </select>
            </div>

            {/* INDICADOR */}
            <div>
              <label className="block text-gray-400 mb-2">
                Indicador
              </label>

              <select
                value={indicador}
                onChange={(e) => {
                  setIndicador(e.target.value as Indicador);
                  setResultado(null);
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 outline-none"
              >
                <option value="Despesa com pessoal">
                  Despesa com pessoal
                </option>

                <option value="Receita">
                  Receita
                </option>

                <option value="Dívida">
                  Dívida
                </option>
              </select>
            </div>

            {/* ANO INICIAL */}
            <div>
              <label className="block text-gray-400 mb-2">
                Período inicial
              </label>

              <select
                value={anoInicial}
                onChange={(e) => {
                  setAnoInicial(e.target.value as Ano);
                  setResultado(null);
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 outline-none"
              >
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>

            {/* ANO FINAL */}
            <div>
              <label className="block text-gray-400 mb-2">
                Período final
              </label>

              <select
                value={anoFinal}
                onChange={(e) => {
                  setAnoFinal(e.target.value as Ano);
                  setResultado(null);
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 outline-none"
              >
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>

          </div>

          <button
            onClick={comparar}
            className="mt-6 bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            Comparar
          </button>

        </div>

        {/* RESULTADO */}
        {resultado && (
          <div className="mt-8">

            <div className="mb-6">

              <h2 className="text-2xl font-bold">
                Resultado
              </h2>

              <p className="text-gray-400 mt-1">
                {municipio} • {indicador}
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* VALOR INICIAL */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

                <p className="text-gray-400">
                  Valor inicial
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  R${" "}
                  {resultado.inicial.toLocaleString("pt-BR")}{" "}
                  mi
                </h2>

                <p className="text-gray-500 mt-1">
                  {anoInicial}
                </p>

              </div>

              {/* VALOR FINAL */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

                <p className="text-gray-400">
                  Valor final
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  R${" "}
                  {resultado.final.toLocaleString("pt-BR")}{" "}
                  mi
                </h2>

                <p className="text-gray-500 mt-1">
                  {anoFinal}
                </p>

              </div>

              {/* VARIAÇÃO */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

                <p className="text-gray-400">
                  Variação
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {resultado.variacao >= 0 ? "+" : ""}
                  {resultado.variacao.toFixed(2)}%
                </h2>

                <p className="text-gray-500 mt-1">
                  Diferença:{" "}
                  {resultado.diferenca >= 0 ? "+" : ""}
                  R${" "}
                  {resultado.diferenca.toLocaleString(
                    "pt-BR"
                  )}{" "}
                  mi
                </p>

              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}
