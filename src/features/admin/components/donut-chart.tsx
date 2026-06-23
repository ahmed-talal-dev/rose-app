"use client";

import { PieChart, Pie, Cell } from "recharts";
import { useTranslations } from "next-intl";
import { ORDER_STATUS } from "../constants/dashboard";
import { ChartConfig, ChartContainer } from "@/shared/ui/chart";

// ─── Chart config ─────────────────────────────────────────────────────────────

const chartConfig = {
    completed: { label: "Completed", color: "var(--color-green-500)" },
    inProgress: { label: "In progress", color: "var(--color-blue-500)" },
    canceled: { label: "Canceled", color: "var(--color-red-600)" },
} satisfies ChartConfig;

const FILL_MAP: Record<string, string> = {
    "Completed": "var(--color-completed)",
    "In progress": "var(--color-inProgress)",
    "Canceled": "var(--color-canceled)",
};

// ─── Legend row ───────────────────────────────────────────────────────────────

function LegendRow({ color, label, value, pct }: {
    color: string; label: string; value: number; pct: number;
}) {
    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.25">
                <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                />
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    {label}
                </span>
            </div>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                {value} ({pct}%)
            </span>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DonutChart() {
    const t = useTranslations("admin.overview");
    const completed = ORDER_STATUS.find((s) => s.name === "Completed") ?? { value: 216, pct: 33, color: "#00BC7D" };
    const inProgress = ORDER_STATUS.find((s) => s.name === "In progress") ?? { value: 513, pct: 57, color: "#2B7FFF" };
    const canceled = ORDER_STATUS.find((s) => s.name === "Canceled") ?? { value: 19, pct: 10, color: "#DC2626" };

    const chartData = [
        { name: "Canceled", value: canceled.value, fill: FILL_MAP["Canceled"] },
        { name: "In progress", value: inProgress.value, fill: FILL_MAP["In progress"] },
        { name: "Completed", value: completed.value, fill: FILL_MAP["Completed"] },
    ];

    return (
        <div className="w-full h-full flex flex-col items-center justify-between py-6 px-6 gap-6">

            {/* Donut + badges */}
            <div className="relative flex items-center justify-center mt-10" style={{ width: "200px", height: "200px" }}>

                {/* Donut chart */}
                <ChartContainer config={chartConfig} className="w-full h-full aspect-square">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={95}
                            paddingAngle={0}
                            dataKey="value"
                            startAngle={61.2}
                            endAngle={-298.8}
                            label={false}
                            labelLine={false}
                        >
                            {chartData.map((entry) => (
                                <Cell key={entry.name} fill={entry.fill} stroke="none" />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>

                {/* Completed % badge */}
                <div
                    className="absolute w-[31.5px] h-[31.5px] bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center z-10 select-none"
                    style={{
                        top: "18px",
                        left: "10px",
                        boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
                    }}
                >
                    <span className="font-bold text-[10px] leading-3 text-zinc-800 dark:text-zinc-200">
                        {completed.pct}%
                    </span>
                </div>

                {/* Canceled % badge */}
                <div
                    className="absolute w-[31.5px] h-[31.5px] bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center z-10 select-none"
                    style={{
                        top: "18px",
                        right: "10px",
                        boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
                    }}
                >
                    <span className="font-bold text-[10px] leading-3 text-zinc-800 dark:text-zinc-200">
                        {canceled.pct}%
                    </span>
                </div>

                {/* In progress % badge */}
                <div
                    className="absolute w-[31.5px] h-[31.5px] bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center z-10 select-none"
                    style={{
                        bottom: "18px",
                        left: "18px",
                        boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
                    }}
                >
                    <span className="font-bold text-[10px] leading-3 text-zinc-800 dark:text-zinc-200">
                        {inProgress.pct}%
                    </span>
                </div>
            </div>

            {/* Legend */}
            <div className="w-full flex flex-col gap-3.5">
                <LegendRow color={completed.color} label={t("completed")} value={completed.value} pct={completed.pct} />
                <LegendRow color={inProgress.color} label={t("inProgress")} value={inProgress.value} pct={inProgress.pct} />
                <LegendRow color={canceled.color} label={t("canceled")} value={canceled.value} pct={canceled.pct} />
            </div>
        </div>
    );
}