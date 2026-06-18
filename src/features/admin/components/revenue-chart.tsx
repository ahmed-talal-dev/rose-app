import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    ReferenceDot,
} from "recharts";
import { CHART_COLORS, MONTHLY_REVENUE, WEEKLY_REVENUE } from "../constants/dashboard";
import { RevenueFilter } from "../types/dashboard";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/ui/chart";

interface RevenueChartProps {
    filter: RevenueFilter;
}

const chartConfig = {
    value: {
        label: "Revenue",
        color: CHART_COLORS.primaryStroke,
    },
} satisfies ChartConfig;

export function RevenueChart({ filter }: RevenueChartProps) {
    const data = filter === "monthly" ? MONTHLY_REVENUE : WEEKLY_REVENUE;

    return (
        <div className="h-full w-full">
            <ChartContainer config={chartConfig} className="w-full h-full aspect-auto">
                <AreaChart data={data} margin={{ top: 20, right: 10, left: -24, bottom: 0 }}>
                    <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={CHART_COLORS.primaryStroke} stopOpacity={0.25} />
                            <stop offset="100%" stopColor={CHART_COLORS.primaryStroke} stopOpacity={0.02} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(161, 161, 170, 0.2)"
                        vertical={true}
                    />

                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fill: "#27272A", fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        ticks={[0, 1000, 2000, 3000, 4000, 5000]}
                        domain={[0, 5000]}
                        tick={{ fontSize: 10, fill: "#27272A", fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <ChartTooltip
                        content={
                            <ChartTooltipContent
                                formatter={(v: unknown) => `${(Number(v) || 0).toLocaleString()} EGP`}
                            />
                        }
                    />

                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={CHART_COLORS.primaryStroke}
                        strokeWidth={1.5}
                        fill="url(#revenueGrad)"
                        dot={{ r: 0 }}
                        activeDot={{ r: 5 }}
                    />

                    {filter === "monthly" && (
                        <ReferenceDot
                            x="Jun"
                            y={4500}
                            r={5}
                            fill={CHART_COLORS.primaryStroke}
                            stroke="#ffffff"
                            strokeWidth={3}
                            label={{
                                value: "4500 EGP",
                                position: "top",
                                fill: CHART_COLORS.primaryStroke,
                                fontSize: 12,
                                fontWeight: 700,
                                offset: 8,
                            }}
                        />
                    )}
                </AreaChart>
            </ChartContainer>
        </div>
    );
}
