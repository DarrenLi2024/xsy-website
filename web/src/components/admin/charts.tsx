"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const chartColors = {
  blue: "rgba(6, 182, 212, 0.8)",
  blueLight: "rgba(6, 182, 212, 0.15)",
  emerald: "rgba(16, 185, 129, 0.8)",
  emeraldLight: "rgba(16, 185, 129, 0.15)",
  amber: "rgba(245, 158, 11, 0.8)",
  purple: "rgba(139, 92, 246, 0.8)",
  rose: "rgba(244, 63, 94, 0.8)",
};

const doughnutColors = [
  "rgba(6, 182, 212, 0.85)",
  "rgba(16, 185, 129, 0.85)",
  "rgba(245, 158, 11, 0.85)",
  "rgba(139, 92, 246, 0.85)",
  "rgba(244, 63, 94, 0.85)",
  "rgba(59, 130, 246, 0.85)",
  "rgba(236, 72, 153, 0.85)",
  "rgba(168, 85, 247, 0.85)",
];

function useChartData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { data, loading };
}

function baseOptions(title: string) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: {
        ticks: { color: "rgba(148, 163, 184, 0.7)", font: { size: 11 } },
        grid: { color: "rgba(255, 255, 255, 0.05)" },
      },
      y: {
        ticks: { color: "rgba(148, 163, 184, 0.7)", font: { size: 11 } },
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        beginAtZero: true,
      },
    },
  };
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <h3 className="mb-4 text-sm font-semibold text-slate-300">{title}</h3>
      <div className="h-[260px]">{children}</div>
    </div>
  );
}

export function ArticleTrendChart() {
  const { data, loading } = useChartData();

  if (loading) {
    return (
      <Card title="文章发布趋势">
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      </Card>
    );
  }

  if (!data?.articleTrend) return null;

  const chartData = {
    labels: data.articleTrend.map((d: any) => d.label),
    datasets: [
      {
        data: data.articleTrend.map((d: any) => d.count),
        borderColor: chartColors.blue,
        backgroundColor: chartColors.blueLight,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: chartColors.blue,
        borderWidth: 2,
      },
    ],
  };

  return (
    <Card title="文章发布趋势（近12个月）">
      <Line data={chartData} options={baseOptions("")} />
    </Card>
  );
}

export function CompanyTrendChart() {
  const { data, loading } = useChartData();

  if (loading) {
    return (
      <Card title="企业入驻趋势">
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      </Card>
    );
  }

  if (!data?.companyTrend) return null;

  const chartData = {
    labels: data.companyTrend.map((d: any) => d.label),
    datasets: [
      {
        data: data.companyTrend.map((d: any) => d.count),
        backgroundColor: chartColors.emerald,
        borderRadius: 4,
        borderWidth: 0,
        maxBarThickness: 32,
      },
    ],
  };

  return (
    <Card title="企业入驻趋势（近12个月）">
      <Bar data={chartData} options={baseOptions("")} />
    </Card>
  );
}

export function IndustryDistributionChart() {
  const { data, loading } = useChartData();

  if (loading) {
    return (
      <Card title="行业分布">
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      </Card>
    );
  }

  if (!data?.industries) return null;

  const chartData = {
    labels: data.industries.map((d: any) => d.name),
    datasets: [
      {
        data: data.industries.map((d: any) => d.count),
        backgroundColor: doughnutColors.slice(0, data.industries.length),
        borderColor: "rgb(15, 23, 42)",
        borderWidth: 3,
      },
    ],
  };

  return (
    <Card title="企业行业分布">
      <Doughnut
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "rgba(148, 163, 184, 0.7)",
                padding: 16,
                font: { size: 11 },
                usePointStyle: true,
                pointStyleWidth: 8,
              },
            },
          },
        }}
      />
    </Card>
  );
}

export function ContentStatusChart() {
  const { data, loading } = useChartData();

  if (loading) {
    return (
      <Card title="文章发布状态">
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      </Card>
    );
  }

  if (!data?.articleStatuses) return null;

  const statusLabels: Record<string, string> = {
    DRAFT: "草稿",
    PENDING_REVIEW: "待审核",
    APPROVED: "已通过",
    REJECTED: "已驳回",
    PUBLISHED: "已发布",
    ARCHIVED: "已归档",
  };

  const chartData = {
    labels: data.articleStatuses.map((d: any) => statusLabels[d.status] || d.status),
    datasets: [
      {
        data: data.articleStatuses.map((d: any) => d.count),
        backgroundColor: [
          "rgba(148, 163, 184, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(6, 182, 212, 0.8)",
          "rgba(244, 63, 94, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(100, 116, 139, 0.8)",
        ],
        borderColor: "rgb(15, 23, 42)",
        borderWidth: 3,
      },
    ],
  };

  return (
    <Card title="文章状态分布">
      <Doughnut
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "rgba(148, 163, 184, 0.7)",
                padding: 16,
                font: { size: 11 },
                usePointStyle: true,
                pointStyleWidth: 8,
              },
            },
          },
        }}
      />
    </Card>
  );
}
