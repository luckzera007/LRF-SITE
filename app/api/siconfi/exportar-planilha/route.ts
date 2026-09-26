import { NextRequest, NextResponse } from "next/server";
import { gerarPlanilhaPreenchida } from "@/lib/planilha";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const idEnte =
      searchParams.get("id_ente") || "4106902";

    const anoInicial = Number(
      searchParams.get("anoInicial") || "2019"
    );

    const anoFinal = Number(
      searchParams.get("anoFinal") || "2025"
    );

    const periodo = Number(
      searchParams.get("periodo") || "3"
    );

    const resultado = await gerarPlanilhaPreenchida(
      idEnte,
      anoInicial,
      anoFinal,
      periodo
    );

    if (resultado.anosPreenchidos.length === 0) {
      return NextResponse.json(
        {
          erro:
            "Não foi encontrado nenhum dado do SICONFI para o período informado.",
        },
        {
          status: 404,
        }
      );
    }

    const buffer =
      await resultado.workbook.xlsx.writeBuffer();

    const nomeArquivo = resultado.municipio
      ? `analise-financeira-${resultado.municipio
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")}.xlsx`
      : `analise-financeira-${idEnte}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
      },
    });
  } catch (erro) {
    console.error(
      "ERRO AO GERAR PLANILHA:",
      erro
    );

    return NextResponse.json(
      {
        erro: "Erro ao gerar a planilha.",
      },
      {
        status: 500,
      }
    );
  }
}
