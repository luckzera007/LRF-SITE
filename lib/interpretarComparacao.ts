import { Municipio } from "./interpretarConsulta";

export type ComparacaoInterpretada = {
  municipioA: Municipio | null;
  municipioB: Municipio | null;
  anoA: string;
  anoB: string;
  periodoA: string;
  periodoB: string;
  indicador: string;
};

function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function encontrarMunicipioNoTexto(
  texto: string,
  municipios: Municipio[]
) {
  const textoNormalizado = normalizarTexto(texto);

  const ordenados = [...municipios].sort(
    (a, b) => b.nome.length - a.nome.length
  );

  for (const municipio of ordenados) {
    const nomeNormalizado = normalizarTexto(
      municipio.nome
    );

    if (textoNormalizado.includes(nomeNormalizado)) {
      return municipio;
    }
  }

  return null;
}

function encontrarDoisMunicipios(
  texto: string,
  municipios: Municipio[]
) {
  const textoNormalizado = normalizarTexto(texto);

  /*
    Tenta encontrar primeiro palavras que normalmente
    separam os dois lados da comparação.

    Exemplos:
    "curitiba com sao paulo"
    "curitiba e sao paulo"
    "curitiba versus sao paulo"
    "curitiba x sao paulo"
  */

  const separadores = [
    " com ",
    " e ",
    " versus ",
    " vs ",
    " x ",
    " contra ",
  ];

  for (const separador of separadores) {
    const partes = textoNormalizado.split(
      separador
    );

    if (partes.length >= 2) {
      const parteA = partes[0];
      const parteB = partes
        .slice(1)
        .join(separador);

      const municipioA =
        encontrarMunicipioNoTexto(
          parteA,
          municipios
        );

      const municipioB =
        encontrarMunicipioNoTexto(
          parteB,
          municipios
        );

      if (municipioA && municipioB) {
        return {
          municipioA,
          municipioB,
        };
      }
    }
  }

  /*
    Caso não tenha encontrado pelo separador,
    procura todos os municípios presentes no texto.
  */

  const encontrados: Municipio[] = [];

  const ordenados = [...municipios].sort(
    (a, b) => b.nome.length - a.nome.length
  );

  for (const municipio of ordenados) {
    const nomeNormalizado = normalizarTexto(
      municipio.nome
    );

    if (
      textoNormalizado.includes(
        nomeNormalizado
      )
    ) {
      const jaExiste =
        encontrados.some(
          (item) =>
            item.ibge === municipio.ibge
        );

      if (!jaExiste) {
        encontrados.push(municipio);
      }

      if (encontrados.length === 2) {
        break;
      }
    }
  }

  return {
    municipioA: encontrados[0] || null,
    municipioB: encontrados[1] || null,
  };
}

function encontrarAnos(texto: string) {
  const anos = texto.match(/\b20\d{2}\b/g) || [];

  return anos.slice(0, 2);
}

function encontrarPeriodo(
  texto: string
) {
  const textoNormalizado =
    normalizarTexto(texto);

  if (
    textoNormalizado.includes(
      "1 quadrimestre"
    ) ||
    textoNormalizado.includes(
      "1o quadrimestre"
    ) ||
    textoNormalizado.includes(
      "primeiro quadrimestre"
    )
  ) {
    return "1";
  }

  if (
    textoNormalizado.includes(
      "2 quadrimestre"
    ) ||
    textoNormalizado.includes(
      "2o quadrimestre"
    ) ||
    textoNormalizado.includes(
      "segundo quadrimestre"
    )
  ) {
    return "2";
  }

  if (
    textoNormalizado.includes(
      "3 quadrimestre"
    ) ||
    textoNormalizado.includes(
      "3o quadrimestre"
    ) ||
    textoNormalizado.includes(
      "terceiro quadrimestre"
    )
  ) {
    return "3";
  }

  return "3";
}

function encontrarIndicador(
  texto: string
) {
  const textoNormalizado =
    normalizarTexto(texto);

  if (
    textoNormalizado.includes(
      "despesa com pessoal"
    ) ||
    textoNormalizado.includes(
      "gasto com pessoal"
    ) ||
    textoNormalizado.includes(
      "despesa de pessoal"
    ) ||
    textoNormalizado.includes(
      "pessoal"
    )
  ) {
    return "despesa_pessoal";
  }

  if (
    textoNormalizado.includes(
      "receita corrente liquida"
    ) ||
    textoNormalizado.includes(
      "rcl"
    )
  ) {
    return "rcl";
  }

  return "despesa_pessoal";
}

export function interpretarComparacao(
  texto: string,
  municipios: Municipio[]
): ComparacaoInterpretada {
  const { municipioA, municipioB } =
    encontrarDoisMunicipios(
      texto,
      municipios
    );

  const anos = encontrarAnos(texto);

  const periodo = encontrarPeriodo(
    texto
  );

  return {
    municipioA,
    municipioB,

    anoA: anos[0] || "2020",

    anoB: anos[1] || "2025",

    periodoA: periodo,
    periodoB: periodo,

    indicador:
      encontrarIndicador(texto),
  };
} 