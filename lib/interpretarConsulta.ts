export type Municipio = {
  nome: string;
  ibge: string;
  uf: string;
};

export type ConsultaInterpretada = {
  municipio: string | null;
  idEnte: string | null;
  exercicio: string;
  periodo: string;
  indicador: string;
};

function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function encontrarMunicipio(
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

function encontrarAno(texto: string) {
  const resultado = texto.match(/\b(20\d{2})\b/);

  return resultado?.[1] || "2025";
}

function encontrarPeriodo(texto: string) {
  const textoNormalizado = normalizarTexto(texto);

  if (
    textoNormalizado.includes("1 quadrimestre") ||
    textoNormalizado.includes("1o quadrimestre") ||
    textoNormalizado.includes("primeiro quadrimestre")
  ) {
    return "1";
  }

  if (
    textoNormalizado.includes("2 quadrimestre") ||
    textoNormalizado.includes("2o quadrimestre") ||
    textoNormalizado.includes("segundo quadrimestre")
  ) {
    return "2";
  }

  if (
    textoNormalizado.includes("3 quadrimestre") ||
    textoNormalizado.includes("3o quadrimestre") ||
    textoNormalizado.includes("terceiro quadrimestre")
  ) {
    return "3";
  }

  return "3";
}

function encontrarIndicador(texto: string) {
  const textoNormalizado = normalizarTexto(texto);

  if (
    textoNormalizado.includes("despesa com pessoal") ||
    textoNormalizado.includes("gasto com pessoal") ||
    textoNormalizado.includes("despesa de pessoal") ||
    textoNormalizado.includes("pessoal")
  ) {
    return "despesa_pessoal";
  }

  if (
    textoNormalizado.includes("receita corrente liquida") ||
    textoNormalizado.includes("rcl")
  ) {
    return "rcl";
  }

  return "despesa_pessoal";
}

export function interpretarConsulta(
  texto: string,
  municipios: Municipio[]
): ConsultaInterpretada {
  const municipioEncontrado = encontrarMunicipio(
    texto,
    municipios
  );

  return {
    municipio: municipioEncontrado?.nome || null,
    idEnte: municipioEncontrado?.ibge || null,
    exercicio: encontrarAno(texto),
    periodo: encontrarPeriodo(texto),
    indicador: encontrarIndicador(texto),
  };
}