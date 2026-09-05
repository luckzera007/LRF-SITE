"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type HistoricoItem = {
  ano: number;
  valor: number | null;
  percentual: number | null;
};

type ChartProps = {
  historico: HistoricoItem[];
};

export default function Chart({
  historico,
}: ChartProps) {
  const dados = historico
    .filter(
      (item) =>
        item.valor !== null
    )
    .map((item) => ({
      ano: item.ano,
      valor: item.valor,
    }));

  return (
    <div className="w-full h-96">

      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart data={dados}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="ano"
          />

          <YAxis
            tickFormatter={(valor) =>
              `R$ ${(Number(valor) / 1_000_000).toFixed(0)} mi`
            }
          />

          <Tooltip
            formatter={(valor) => [
              Number(valor).toLocaleString(
                "pt-BR",
                {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 2,
                }
              ),
              "Despesa com pessoal",
            ]}
          />

          <Line
            type="monotone"
            dataKey="valor"
            stroke="currentColor"
            strokeWidth={3}
            dot
          />

        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}