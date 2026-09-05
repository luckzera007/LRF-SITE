"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { indicadores } from "@/lib/indicadores";

type Municipio = {
  nome: string;
  ibge: string;
  uf: string;
};

type ResultadoComparacao = {
  indicador: string;
  indicadorNome: string;

  municipioA: {
    nome: string;
    ibge: number;
    uf: string;
    ano: number;
    periodo: number;
    valor: number;
    percentual: number | null;
  };

  municipioB: {
    nome: string;
    ibge: number;
    uf: string;
    ano: number;
    periodo: number;
    valor: number;
    percentual: number | null;
  };

  diferenca: number;
  diferencaPercentual: number;
};

const periodos = [
  {
    valor: "1",
    nome: "1º Quadrimestre",
  },
  {
    valor: "2",
    nome: "2º Quadrimestre",
  },
  {
    valor: "3",
    nome: "3º Quadrimestre",
  },
];

function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function Comparar() {
  const [municipios, setMunicipios] =
    useState<Municipio[]>([]);

  const [carregandoMunicipios, setCarregandoMunicipios] =
    useState(true);

  const [erroMunicipios, setErroMunicipios] =
    useState<string | null>(null);

  const [buscaA, setBuscaA] =
    useState("");

  const [buscaB, setBuscaB] =
    useState("");

  const [resultadosA, setResultadosA] =
    useState<Municipio[]>([]);

  const [resultadosB, setResultadosB] =
    useState<Municipio[]>([]);

  const [selecionadoA, setSelecionadoA] =
    useState<Municipio | null>(null);

  const [selecionadoB, setSelecionadoB] =
    useState<Municipio | null>(null);

  const [anoA, setAnoA] =
    useState("2020");

  const [anoB, setAnoB] =
    useState("2025");

  const [periodoA, setPeriodoA] =
    useState("3");

  const [periodoB, setPeriodoB] =
    useState("3");

  const [indicador, setIndicador] =
    useState("despesa_pessoal");

  const [resultado, setResultado] =
    useState<ResultadoComparacao | null>(null);

  const [carregando, setCarregando] =
    useState(false);

  const [erro, setErro] =
    useState<string | null>(null);

  const listaIndicadores =
    Object.values(indicadores);

  useEffect(() => {
    async function carregarMunicipios() {
      try {
        setCarregandoMunicipios(true);
        setErroMunicipios(null);

        const resposta = await fetch(
          "/api/siconfi/municipios"
        );

        if (!resposta.ok) {
          throw new Error(
            "Não foi possível carregar os municípios."
          );
        }

        const dados =
          await resposta.json();

        if (
          !Array.isArray(
            dados.municipios
          )
        ) {
          throw new Error(
            "A API não retornou uma lista válida de municípios."
          );
        }

        setMunicipios(
          dados.municipios
        );
      } catch (error) {
        console.error(error);

        setErroMunicipios(
          error instanceof Error
            ? error.message
            : "Erro ao carregar municípios."
        );
      } finally {
        setCarregandoMunicipios(
          false
        );
      }
    }

    carregarMunicipios();
  }, []);

  useEffect(() => {
    const termo =
      normalizarTexto(buscaA);

    if (
      !termo ||
      selecionadoA
    ) {
      setResultadosA([]);
      return;
    }

    const encontrados =
      municipios
        .filter((municipio) =>
          normalizarTexto(
            municipio.nome
          ).includes(termo)
        )
        .slice(0, 10);

    setResultadosA(
      encontrados
    );
  }, [
    buscaA,
    municipios,
    selecionadoA,
  ]);

  useEffect(() => {
    const termo =
      normalizarTexto(buscaB);

    if (
      !termo ||
      selecionadoB
    ) {
      setResultadosB([]);
      return;
    }

    const encontrados =
      municipios
        .filter((municipio) =>
          normalizarTexto(
            municipio.nome
          ).includes(termo)
        )
        .slice(0, 10);

    setResultadosB(
      encontrados
    );
  }, [
    buscaB,
    municipios,
    selecionadoB,
  ]);

  function selecionarA(
    municipio: Municipio
  ) {
    setSelecionadoA(municipio);
    setBuscaA(municipio.nome);
    setResultadosA([]);
    setResultado(null);
    setErro(null);
  }

  function selecionarB(
    municipio: Municipio
  ) {
    setSelecionadoB(municipio);
    setBuscaB(municipio.nome);
    setResultadosB([]);
    setResultado(null);
    setErro(null);
  }

  function formatarMoeda(
    valor: number
  ) {
    return valor.toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 2,
      }
    );
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

  async function comparar() {
    setErro(null);
    setResultado(null);

    if (!selecionadoA) {
      setErro(
        "Selecione o Município A."
      );
      return;
    }

    if (!selecionadoB) {
      setErro(
        "Selecione o Município B."
      );
      return;
    }

    if (!anoA.trim()) {
      setErro(
        "Informe o ano do Período A."
      );
      return;
    }

    if (!anoB.trim()) {
      setErro(
        "Informe o ano do Período B."
      );
      return;
    }

    setCarregando(true);

    try {
      const params =
        new URLSearchParams({
          id_ente_a:
            selecionadoA.ibge,

          id_ente_b:
            selecionadoB.ibge,

          ano_a:
            anoA,

          ano_b:
            anoB,

          periodo_a:
            periodoA,

          periodo_b:
            periodoB,

          indicador:
            indicador,
        });

      const resposta =
        await fetch(
          `/api/siconfi/rgf/comparar?${params.toString()}`
        );

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro ||
            "Não foi possível realizar a comparação."
        );
      }

      setResultado(
        dados
      );
    } catch (error) {
      console.error(error);

      setErro(
        error instanceof Error
          ? error.message
          : "Erro desconhecido."
      );
    } finally {
      setCarregando(
        false
      );
    }
  }

  const dadosGrafico =
    resultado
      ? [
          {
            nome:
              `${resultado.municipioA.nome} (${resultado.municipioA.ano})`,
            valor:
              resultado.municipioA.valor,
          },
          {
            nome:
              `${resultado.municipioB.nome} (${resultado.municipioB.ano})`,
            valor:
              resultado.municipioB.valor,
          },
        ]
      : [];

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold">
          Comparar períodos
        </h1>

        <p className="text-gray-400 mt-2 mb-8">
          Compare municípios, anos,
          períodos e indicadores
          usando dados reais.
        </p>

        {erroMunicipios && (
          <div className="mb-6 bg-red-950 border border-red-900 rounded-2xl p-6">

            <h2 className="text-xl font-bold">
              Erro
            </h2>

            <p className="text-red-300 mt-2">
              {erroMunicipios}
            </p>

          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">

          <label className="block text-gray-400 mb-2">
            Indicador
          </label>

          <select
            value={indicador}
            onChange={(e) => {
              setIndicador(
                e.target.value
              );
              setResultado(null);
              setErro(null);
            }}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 outline-none"
          >

            {listaIndicadores.map(
              (item) => (
                <option
                  key={item.codigo}
                  value={item.codigo}
                >
                  {item.nome}
                </option>
              )
            )}

          </select>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* PERÍODO A */}

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

            <h2 className="text-xl font-bold mb-6">
              Período A
            </h2>

            <label className="block text-gray-400 mb-2">
              Município
            </label>

            <input
              type="text"
              value={buscaA}
              onChange={(e) => {
                setBuscaA(
                  e.target.value
                );

                setSelecionadoA(
                  null
                );

                setResultado(
                  null
                );

                setErro(null);
              }}
              placeholder={
                carregandoMunicipios
                  ? "Carregando municípios..."
                  : "Digite o município"
              }
              disabled={
                carregandoMunicipios
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 outline-none"
            />

            {resultadosA.length >
              0 && (
              <div className="mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">

                {resultadosA.map(
                  (municipio) => (
                    <button
                      key={
                        municipio.ibge
                      }
                      type="button"
                      onClick={() =>
                        selecionarA(
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

                      <span className="text-gray-400 ml-2">
                        (
                        {
                          municipio.uf
                        }
                        )
                      </span>

                    </button>
                  )
                )}

              </div>
            )}

            {selecionadoA && (
              <p className="text-sm text-gray-400 mt-2">

                Selecionado:{" "}

                <span className="text-white">
                  {
                    selecionadoA.nome
                  }
                </span>

              </p>
            )}

            <label className="block text-gray-400 mt-5 mb-2">
              Ano
            </label>

            <input
              type="number"
              value={anoA}
              onChange={(e) => {
                setAnoA(
                  e.target.value
                );
                setResultado(
                  null
                );
              }}
              min="1900"
              max="2100"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 outline-none"
            />

            <label className="block text-gray-400 mt-5 mb-2">
              Período
            </label>

            <select
              value={periodoA}
              onChange={(e) => {
                setPeriodoA(
                  e.target.value
                );
                setResultado(
                  null
                );
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 outline-none"
            >

              {periodos.map(
                (periodo) => (
                  <option
                    key={
                      periodo.valor
                    }
                    value={
                      periodo.valor
                    }
                  >
                    {periodo.nome}
                  </option>
                )
              )}

            </select>

          </div>

          {/* PERÍODO B */}

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

            <h2 className="text-xl font-bold mb-6">
              Período B
            </h2>

            <label className="block text-gray-400 mb-2">
              Município
            </label>

            <input
              type="text"
              value={buscaB}
              onChange={(e) => {
                setBuscaB(
                  e.target.value
                );

                setSelecionadoB(
                  null
                );

                setResultado(
                  null
                );

                setErro(null);
              }}
              placeholder={
                carregandoMunicipios
                  ? "Carregando municípios..."
                  : "Digite o município"
              }
              disabled={
                carregandoMunicipios
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 outline-none"
            />

            {resultadosB.length >
              0 && (
              <div className="mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">

                {resultadosB.map(
                  (municipio) => (
                    <button
                      key={
                        municipio.ibge
                      }
                      type="button"
                      onClick={() =>
                        selecionarB(
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

                      <span className="text-gray-400 ml-2">
                        (
                        {
                          municipio.uf
                        }
                        )
                      </span>

                    </button>
                  )
                )}

              </div>
            )}

            {selecionadoB && (
              <p className="text-sm text-gray-400 mt-2">

                Selecionado:{" "}

                <span className="text-white">
                  {
                    selecionadoB.nome
                  }
                </span>

              </p>
            )}

            <label className="block text-gray-400 mt-5 mb-2">
              Ano
            </label>

            <input
              type="number"
              value={anoB}
              onChange={(e) => {
                setAnoB(
                  e.target.value
                );
                setResultado(
                  null
                );
              }}
              min="1900"
              max="2100"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 outline-none"
            />

            <label className="block text-gray-400 mt-5 mb-2">
              Período
            </label>

            <select
              value={periodoB}
              onChange={(e) => {
                setPeriodoB(
                  e.target.value
                );
                setResultado(
                  null
                );
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 outline-none"
            >

              {periodos.map(
                (periodo) => (
                  <option
                    key={
                      periodo.valor
                    }
                    value={
                      periodo.valor
                    }
                  >
                    {periodo.nome}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

        <button
          onClick={comparar}
          disabled={
            carregando ||
            carregandoMunicipios
          }
          className="mt-6 bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition disabled:opacity-50"
        >
          {carregando
            ? "Consultando SICONFI..."
            : "Comparar"}
        </button>

        {erro && (
          <div className="mt-8 bg-red-950 border border-red-900 rounded-2xl p-6">

            <h2 className="text-xl font-bold">
              Erro
            </h2>

            <p className="text-red-300 mt-2">
              {erro}
            </p>

          </div>
        )}

        {resultado && (
          <div className="mt-8">

            <h2 className="text-2xl font-bold">
              Resultado da comparação
            </h2>

            <p className="text-gray-400 mt-2">
              {resultado.indicadorNome}
            </p>

            <p className="text-gray-500 mt-1">
              {resultado.municipioA.nome}{" "}
              ({resultado.municipioA.ano})
              {" × "}
              {resultado.municipioB.nome}{" "}
              ({resultado.municipioB.ano})
            </p>

            {/* GRÁFICO */}

            <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-6">

              <h3 className="text-xl font-bold">
                Comparação visual
              </h3>

              <div className="w-full h-96 mt-6">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={
                      dadosGrafico
                    }
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="nome"
                    />

                    <YAxis
                      tickFormatter={(valor) =>
                        `R$ ${(
                          Number(
                            valor
                          ) / 1000000
                        ).toFixed(0)} mi`
                      }
                    />

                    <Tooltip
                      formatter={(valor) => [
                        Number(
                          valor
                        ).toLocaleString(
                          "pt-BR",
                          {
                            style:
                              "currency",
                            currency:
                              "BRL",
                            maximumFractionDigits:
                              2,
                          }
                        ),
                        resultado.indicadorNome,
                      ]}
                    />

                    <Legend />

                    <Bar
                      dataKey="valor"
                      name={
                        resultado.indicadorNome
                      }
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>

            {/* VALORES */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

                <p className="text-gray-400">
                  Período A
                </p>

                <h3 className="text-xl font-bold mt-2">
                  {
                    resultado
                      .municipioA
                      .nome
                  }
                </h3>

                <p className="text-gray-500 mt-1">
                  {
                    resultado
                      .municipioA
                      .ano
                  }
                  {" • "}
                  {
                    resultado
                      .municipioA
                      .periodo
                  }º quadrimestre
                </p>

                <p className="text-3xl font-bold mt-5">
                  {formatarMoeda(
                    resultado
                      .municipioA
                      .valor
                  )}
                </p>

                {resultado.indicador ===
                  "despesa_pessoal" && (
                  <p className="text-gray-400 mt-2">
                    {formatarPercentual(
                      resultado
                        .municipioA
                        .percentual
                    )}{" "}
                    da RCL Ajustada
                  </p>
                )}

              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

                <p className="text-gray-400">
                  Período B
                </p>

                <h3 className="text-xl font-bold mt-2">
                  {
                    resultado
                      .municipioB
                      .nome
                  }
                </h3>

                <p className="text-gray-500 mt-1">
                  {
                    resultado
                      .municipioB
                      .ano
                  }
                  {" • "}
                  {
                    resultado
                      .municipioB
                      .periodo
                  }º quadrimestre
                </p>

                <p className="text-3xl font-bold mt-5">
                  {formatarMoeda(
                    resultado
                      .municipioB
                      .valor
                  )}
                </p>

                {resultado.indicador ===
                  "despesa_pessoal" && (
                  <p className="text-gray-400 mt-2">
                    {formatarPercentual(
                      resultado
                        .municipioB
                        .percentual
                    )}{" "}
                    da RCL Ajustada
                  </p>
                )}

              </div>

            </div>

            {/* DIFERENÇAS */}

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

                <p className="text-gray-400">
                  Diferença absoluta
                </p>

                <h3 className="text-3xl font-bold mt-2">
                  {formatarMoeda(
                    Math.abs(
                      resultado.diferenca
                    )
                  )}
                </h3>

                <p className="text-gray-400 mt-3">

                  {resultado.diferenca >
                  0
                    ? `${resultado.municipioA.nome} possui o maior valor.`
                    : resultado.diferenca <
                        0
                      ? `${resultado.municipioB.nome} possui o maior valor.`
                      : "Os valores são iguais."}

                </p>

              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

                <p className="text-gray-400">
                  Diferença percentual
                </p>

                <h3 className="text-3xl font-bold mt-2">

                  {resultado.diferencaPercentual >=
                  0
                    ? "+"
                    : ""}

                  {resultado.diferencaPercentual.toLocaleString(
                    "pt-BR",
                    {
                      minimumFractionDigits:
                        2,
                      maximumFractionDigits:
                        2,
                    }
                  )}

                  %

                </h3>

                <p className="text-gray-500 mt-2">
                  O Período B é usado
                  como referência.
                </p>

              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}