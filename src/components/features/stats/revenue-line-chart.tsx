"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { RevenueData } from "@/types/stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface RevenueLineChartProps {
  data: RevenueData;
}

export function RevenueLineChart({ data }: RevenueLineChartProps) {
  const labels = data.byDate.map((item) => format(new Date(item.date), "dd.MM"));
  const datasets = [
    {
      label: "Całkowity utarg",
      data: data.byDate.map((item) => item.total),
      borderColor: "#FF8C42", // Primary color
      backgroundColor: "rgba(255, 140, 66, 0.2)",
      tension: 0.3,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: "#FF8C42",
      pointBorderColor: "#1A0800",
      pointHoverRadius: 6,
      pointHoverBackgroundColor: "#FFA060",
    },
  ];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "var(--color-text-secondary)",
          font: {
            family: "Inter, sans-serif",
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: "var(--color-text-muted)",
        },
        grid: {
          color: "var(--color-border-subtle)",
        },
        border: {
            color: "var(--color-border-default)"
        }
      },
      y: {
        ticks: {
          color: "var(--color-text-muted)",
          callback: function (value: string | number) {
            return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(Number(value));
          },
        },
        grid: {
          color: "var(--color-border-subtle)",
        },
        border: {
            color: "var(--color-border-default)"
        }
      },
    },
  };

  return (
    <Card className="h-96">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-text-primary">Trendy Utargu</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-72px)]">
        <Line data={{ labels, datasets }} options={options} />
      </CardContent>
    </Card>
  );
}
