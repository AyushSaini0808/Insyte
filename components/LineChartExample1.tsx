"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { TrendingUp, TrendingDown, Minus, Zap, Target } from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

interface LineChartInteractiveProps {
    data: any[];
    config: {
        title?: string;
        description?: string;
        dataKey: string;
        categoryKey?: string;
        color?: string;
    };
}

export function LineChartExample({ data, config }: LineChartInteractiveProps) {
    // Create chart config dynamically
    const chartConfig = {
        [config.dataKey]: {
            label: config.title || "Value",
            color: config.color || "var(--chart-1)",
        },
    } satisfies ChartConfig

    const [activeChart, setActiveChart] = React.useState(config.dataKey)

    // Calculate totals and insights
    const insights = React.useMemo(() => {
        if (!data.length) return null;

        const values = data.map(item => item[config.dataKey]);
        const total = values.reduce((acc, curr) => acc + curr, 0);
        const average = total / values.length;

        // Calculate trend analysis
        let trend: 'up' | 'down' | 'stable' = 'stable';
        let trendPercentage = 0;
        let momentum = 0;
        let volatility = 0;

        if (data.length >= 3) {
            // Overall trend (first vs last)
            const first = data[0][config.dataKey];
            const last = data[data.length - 1][config.dataKey];
            trendPercentage = ((last - first) / first) * 100;

            // Momentum (recent 3-point trend)
            const recent = values.slice(-3);
            momentum = ((recent[2] - recent[0]) / recent[0]) * 100;

            // Volatility (standard deviation)
            const squaredDiffs = values.map(value => Math.pow(value - average, 2));
            const variance = squaredDiffs.reduce((sum, sq) => sum + sq, 0) / values.length;
            volatility = Math.sqrt(variance) / average * 100;

            if (Math.abs(trendPercentage) > 5) {
                trend = trendPercentage > 0 ? 'up' : 'down';
            }
        }

        const currentValue = data[data.length - 1]?.[config.dataKey] || 0;
        const peakValue = Math.max(...values);
        const troughValue = Math.min(...values);
        const peakItem = data.find(item => item[config.dataKey] === peakValue);
        const troughItem = data.find(item => item[config.dataKey] === troughValue);

        return {
            total,
            average,
            currentValue,
            peakValue,
            troughValue,
            peakItem,
            troughItem,
            trend,
            trendPercentage: Math.abs(trendPercentage),
            momentum: Math.abs(momentum),
            isMomentumPositive: momentum > 0,
            volatility: Math.abs(volatility),
            dataPoints: data.length
        };
    }, [data, config.dataKey]);

    if (!data.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{config.title || "Interactive Line Chart"}</CardTitle>
                    {config.description && (
                        <CardDescription>{config.description}</CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                        No data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="py-4 sm:py-0">
            <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
                    <CardTitle>{config.title || "Interactive Chart"}</CardTitle>
                    <CardDescription>
                        {config.description || "Data visualization with interactive controls"}
                    </CardDescription>
                </div>
                <div className="flex">
                    <button
                        data-active={true}
                        className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                    >
                        <span className="text-muted-foreground text-xs">
                            {chartConfig[config.dataKey].label}
                        </span>
                        <span className="text-lg leading-none font-bold sm:text-3xl">
                            {insights.total.toLocaleString()}
                        </span>
                    </button>
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <LineChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false}/>
                        <XAxis
                            dataKey={config.categoryKey || "date"}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                // Smart date formatting
                                if (typeof value === 'string' && value.includes('-')) {
                                    try {
                                        const date = new Date(value)
                                        return date.toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    } catch {
                                        return String(value).slice(0, 8);
                                    }
                                }
                                return String(value).length > 8 ? String(value).slice(0, 8) + '...' : String(value);
                            }}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    nameKey={config.dataKey}
                                    labelFormatter={(value) => {
                                        if (typeof value === 'string' && value.includes('-')) {
                                            try {
                                                return new Date(value).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })
                                            } catch {
                                                return value;
                                            }
                                        }
                                        return value;
                                    }}
                                />
                            }
                        />
                        <Line
                            dataKey={config.dataKey}
                            type="monotone"
                            stroke={`var(--color-${config.dataKey})`}
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}