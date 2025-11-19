"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

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

interface AreaChartExampleProps {
    data: any[];
    config: {
        title?: string;
        description?: string;
        dataKey: string;
        categoryKey?: string;
        color?: string;
    };
}

export function AreaChartExample({ data, config }: AreaChartExampleProps) {
    const chartConfig = {
        [config.dataKey]: {
            label: config.title || "Value",
            color: config.color || "var(--chart-1)",
        },
    } satisfies ChartConfig;

    if (!data.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{config.title || "Area Chart"}</CardTitle>
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
        <Card>
            <CardHeader>
                <CardTitle>{config.title || "Area Chart"}</CardTitle>
                {config.description && (
                    <CardDescription>{config.description}</CardDescription>
                )}
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-64 w-full">
                    <AreaChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey={config.categoryKey || "name"}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => {
                                if (typeof value === 'string' && value.length > 8) {
                                    return value.slice(0, 8) + '...';
                                }
                                return String(value);
                            }}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <defs>
                            <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor={`var(--color-${config.dataKey})`}
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor={`var(--color-${config.dataKey})`}
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey={config.dataKey}
                            type="natural"
                            fill="url(#fillGradient)"
                            fillOpacity={0.4}
                            stroke={`var(--color-${config.dataKey})`}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}