"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartStyle,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface PieChartExampleProps {
    data: any[];
    config: {
        title?: string;
        description?: string;
        dataKey: string;
        categoryKey?: string;
        color?: string;
    };
}

export function PieChartExample({ data, config }: PieChartExampleProps) {
    const id = "pie-interactive"

    const chartData = React.useMemo(() => {
        if (!data.length) return [];

        const categoryKey = config.categoryKey || "name";
        const dataKey = config.dataKey;

        const COLORS = [
            "var(--chart-1)",
            "var(--chart-2)",
            "var(--chart-3)",
            "var(--chart-4)",
            "var(--chart-5)",
        ];

        return data.map((item, index) => ({
            [categoryKey]: item[categoryKey],
            [dataKey]: item[dataKey],
            fill: COLORS[index % COLORS.length]
        }));
    }, [data, config]);

    const chartConfig = React.useMemo(() => {
        const baseConfig: ChartConfig = {
            [config.dataKey]: {
                label: "Value",
            }
        };

        chartData.forEach((item, index) => {
            const category = item[config.categoryKey || "name"];
            baseConfig[category] = {
                label: String(category),
                color: `var(--chart-${(index % 5) + 1})`,
            };
        });

        return baseConfig;
    }, [chartData, config]);

    const [activeCategory, setActiveCategory] = React.useState(
        chartData[0]?.[config.categoryKey || "name"] || ""
    );

    const activeIndex = React.useMemo(
        () => chartData.findIndex((item) => item[config.categoryKey || "name"] === activeCategory),
        [activeCategory, chartData, config.categoryKey]
    );

    const categories = React.useMemo(() =>
            chartData.map((item) => item[config.categoryKey || "name"]),
        [chartData, config.categoryKey]
    );

    if (!chartData.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{config.title || "Pie Chart"}</CardTitle>
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
        <Card data-chart={id} className="flex flex-col">
            <ChartStyle id={id} config={chartConfig} />
            <CardHeader className="flex-row items-start space-y-0 pb-0">
                <div className="grid gap-1">
                    <CardTitle>{config.title || "Pie Chart"}</CardTitle>
                    {config.description && (
                        <CardDescription>{config.description}</CardDescription>
                    )}
                </div>
                <Select value={activeCategory} onValueChange={setActiveCategory}>
                    <SelectTrigger
                        className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
                        aria-label="Select a category"
                    >
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl">
                        {categories.map((category) => {
                            const configItem = chartConfig[category as keyof typeof chartConfig];

                            if (!configItem) {
                                return null;
                            }

                            return (
                                <SelectItem
                                    key={category}
                                    value={category}
                                    className="rounded-lg [&_span]:flex"
                                >
                                    <div className="flex items-center gap-2 text-xs">
                                        <span
                                            className="flex h-3 w-3 shrink-0 rounded-xs"
                                            style={{
                                                backgroundColor: configItem.color,
                                            }}
                                        />
                                        {configItem?.label}
                                    </div>
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="flex flex-1 justify-center pb-0">
                <ChartContainer
                    id={id}
                    config={chartConfig}
                    className="mx-auto aspect-square w-full max-w-[300px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey={config.dataKey}
                            nameKey={config.categoryKey || "name"}
                            innerRadius={60}
                            strokeWidth={5}
                            activeIndex={activeIndex}
                            activeShape={({
                                              outerRadius = 0,
                                              ...props
                                          }: PieSectorDataItem) => (
                                <g>
                                    <Sector {...props} outerRadius={outerRadius + 10} />
                                    <Sector
                                        {...props}
                                        outerRadius={outerRadius + 25}
                                        innerRadius={outerRadius + 12}
                                    />
                                </g>
                            )}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox && chartData[activeIndex]) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {chartData[activeIndex][config.dataKey].toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    {config.dataKey}
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}