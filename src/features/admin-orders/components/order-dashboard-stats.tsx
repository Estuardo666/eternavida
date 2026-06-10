"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ADMIN_INSET_CARD_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { cx } from "@/lib/utils";

import type { OrderDashboardStatsData } from "./order-admin-types";

const STATUS_COLORS: Record<string, string> = {
  pending: "#b99d38",
  confirmed: "#4d8f5e",
  processing: "#b8741b",
  shipped: "#4a78ba",
  delivered: "#2f7a58",
  cancelled: "#c55a5a",
  refunded: "#7b5ac7",
};

const PAYMENT_COLORS = ["#163c31", "#2f6d44", "#0B5D1E", "#c8d7ef", "#ead6bb"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDelta(current: number, previous: number) {
  const delta = current - previous;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toLocaleString("es-EC")}`;
}

function RevenueTooltip(props: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!props.active || !props.payload?.length) return null;

  return (
    <div className="rounded-2xl border border-[#d8e3d4] bg-white px-3 py-2 text-caption text-text-secondary">
      <p>{props.label}</p>
      <p className="mt-1 text-label-sm font-semibold text-text-primary">
        {formatCurrency(props.payload[0]?.value ?? 0)}
      </p>
    </div>
  );
}

export interface OrderDashboardStatsProps {
  stats: OrderDashboardStatsData | null;
  isLoading: boolean;
}

export function OrderDashboardStats(props: OrderDashboardStatsProps) {
  const { stats, isLoading } = props;

  if (isLoading && !stats) {
    return (
      <div className={cx(ADMIN_PANEL_SURFACE_CLASS_NAME, "min-h-[220px]")}>Cargando KPIs...</div>
    );
  }

  if (!stats) {
    return (
      <div className={cx(ADMIN_PANEL_SURFACE_CLASS_NAME, "min-h-[220px] text-text-secondary")}>No hay datos para el dashboard.</div>
    );
  }

  const statusChartData = Object.entries(stats.statusBreakdown).map(([status, count]) => ({
    status,
    count,
    label: status,
  }));

  const paymentData = stats.paymentMethodBreakdown.map((item, index) => ({
    ...item,
    fill: PAYMENT_COLORS[index % PAYMENT_COLORS.length],
  }));

  const summaryCards = [
    {
      label: "Hoy",
      summary: stats.today,
      tone: "text-[#163c31]",
    },
    {
      label: "Esta semana",
      summary: stats.week,
      tone: "text-[#2f6d44]",
    },
    {
      label: "Este mes",
      summary: stats.month,
      tone: "text-[#2d5fa7]",
    },
    {
      label: "Pendientes",
      summary: {
        count: (stats.statusBreakdown.pending ?? 0) + (stats.statusBreakdown.processing ?? 0),
        revenue: stats.today.revenue,
        previous: { count: 0, revenue: 0 },
      },
      tone: "text-[#8b5a1e]",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <section key={card.label} className={cx(ADMIN_PANEL_SURFACE_CLASS_NAME, "space-y-3")}> 
            <p className="text-caption uppercase tracking-[0.12em] text-text-muted">{card.label}</p>
            <div className="space-y-1">
              <p className={cx("text-section-md font-semibold", card.tone)}>{card.summary.count}</p>
              <p className="text-body-sm text-text-secondary">{formatCurrency(card.summary.revenue)}</p>
            </div>
            {card.label !== "Pendientes" ? (
              <p className="text-caption text-text-muted">
                vs periodo anterior: {formatDelta(card.summary.count, card.summary.previous.count)} pedidos
              </p>
            ) : (
              <p className="text-caption text-text-muted">Pendientes + en proceso ultimos 30 dias</p>
            )}
          </section>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
        <section className={cx(ADMIN_PANEL_SURFACE_CLASS_NAME, "space-y-4")}> 
          <div>
            <h2 className="text-label-md font-semibold text-text-primary">Ingresos diarios</h2>
            <p className="mt-1 text-body-sm text-text-secondary">Ultimos 7 dias</p>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyRevenue}>
                <defs>
                  <linearGradient id="ordersRevenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B5D1E" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#0B5D1E" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#edf2eb" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#6b776d", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: "#6b776d", fontSize: 11 }} axisLine={false} tickLine={false} width={56} />
                <Tooltip content={<RevenueTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#0B5D1E" strokeWidth={2.5} fill="url(#ordersRevenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={cx(ADMIN_PANEL_SURFACE_CLASS_NAME, "space-y-4")}> 
          <div>
            <h2 className="text-label-md font-semibold text-text-primary">Metodos de pago</h2>
            <p className="mt-1 text-body-sm text-text-secondary">Top 5 ultimos 30 dias</p>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-1">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentData} dataKey="count" nameKey="paymentMethodName" innerRadius={52} outerRadius={76} paddingAngle={2}>
                    {paymentData.map((entry) => (
                      <Cell key={entry.paymentMethodName} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<RevenueTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {paymentData.map((item) => (
                <div key={item.paymentMethodName} className={cx(ADMIN_INSET_CARD_CLASS_NAME, "flex items-center justify-between gap-3 px-3 py-2.5")}> 
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="truncate text-body-sm text-text-primary">{item.paymentMethodName}</span>
                  </div>
                  <span className="text-caption text-text-secondary">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className={cx(ADMIN_PANEL_SURFACE_CLASS_NAME, "space-y-4")}> 
        <div>
          <h2 className="text-label-md font-semibold text-text-primary">Pedidos por estado</h2>
          <p className="mt-1 text-body-sm text-text-secondary">Distribucion ultimos 30 dias</p>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusChartData}>
              <CartesianGrid stroke="#edf2eb" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#6b776d", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b776d", fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip />
              <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                {statusChartData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#0B5D1E"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
