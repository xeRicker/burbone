"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { RevenueData } from "@/types/stats";

ChartJS.register(ArcElement, Tooltip, Legend);

interface RevenuePieChartProps {
  data: RevenueData;
}

export function RevenuePieChart({ data }: RevenuePieChartProps) {
  const chartData = {
    labels: data.byLocation.map(loc => loc.name),
    datasets: [
      {
        label: "Utarg",
        data: data.byLocation.map(loc => loc.total),
        backgroundColor: [
          "rgba(255, 176, 119, 0.8)", // Primary
          "rgba(226, 191, 167, 0.8)", // Secondary
          "rgba(194, 203, 148, 0.8)", // Tertiary
        ],
        borderColor: [
          "hsl(27, 100%, 72%)",
          "hsl(27, 48%, 77%)",
          "hsl(70, 36%, 69%)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
            color: 'hsl(25, 33%, 89%)', // on-surface
            font: {
                family: 'Inter, sans-serif'
            }
        }
      },
    },
  };

  return (
    <div className="bg-surface-container p-6 rounded-lg h-96">
        <h3 className="text-lg font-medium text-on-surface mb-4">Podział utargu wg. lokalizacji</h3>
        <Pie data={chartData} options={options} />
    </div>
  )
}
