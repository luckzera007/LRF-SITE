"use client";

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

type ChartProps = {
  valor: number;
  limiteAlerta: number;
  limitePrudencial: number;
  limiteMaximo: number;
};

export default function Chart({
  valor,
  limiteAlerta,
  limitePrudencial,
  limiteMaximo,
}: ChartProps) {
  const dados = [
    {
      nome: "DTP",
      valor: valor,
    },
    {
      nome: "Alerta",
      valor: limiteAlerta,
    },
    {
      nome: "Prudencial",
      valor: limitePrudencial,
    },
    {
      nome: "Máximo",
      valor: limiteMaximo,
    },
  ];

  return (
    <div className="w-full h-96">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart data={dados}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="nome" />

          <YAxis
            unit="%"
            domain={[0, 60]}
          />

          <Tooltip
            formatter={(valor) => [
              `${Number(valor).toLocaleString(
                "pt-BR",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}%`,
              "Percentual",
            ]}
          />

          <Legend />

          <Bar
            dataKey="valor"
            name="Percentual"
          />

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}