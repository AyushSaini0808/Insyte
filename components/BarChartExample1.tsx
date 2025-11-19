"use client"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

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

interface BarChartExampleProps {
    data: any[];
    config: {
        title?: string;
        description?: string;
        dataKey: string;
        categoryKey?: string;
        color?: string;
    };
}

export function BarChartExample({ data, config }: BarChartExampleProps) {
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
                    <CardTitle>{config.title || "Bar Chart"}</CardTitle>
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
                <CardTitle>{config.title || "Bar Chart"}</CardTitle>
                {config.description && (
                    <CardDescription>{config.description}</CardDescription>
                )}
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-64 w-full">
                    <BarChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            top: 20,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey={config.categoryKey || "name"}
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => {
                                if (typeof value === 'string' && value.length > 8) {
                                    return value.slice(0, 8) + '...';
                                }
                                return String(value);
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar
                            dataKey={config.dataKey}
                            fill={`var(--color-${config.dataKey})`}
                            radius={8}
                        >
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                                formatter={(value: number) => value.toLocaleString()}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}