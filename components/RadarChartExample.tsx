"use client"
import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

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

export const description = "A radar chart with dots"

const chartData = [
    { skill: "DevOps", employees: 186 },
    { skill: "JavaScript", employees: 305 },
    { skill: "UI/UX", employees: 237 },
    { skill: "Testing", employees: 273 },
    { skill: "Vue", employees: 209 },
    { skill: "React", employees: 314 },
]

const chartConfig = {
    employees: {
        label: "Employees",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export function ChartRadarDots() {
    return (
        <Card>
            <CardHeader className="items-center">
                <CardTitle>Skills Assessment</CardTitle>
                <CardDescription>
                    Comprehensive skill evaluation
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <RadarChart data={chartData}>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <PolarAngleAxis dataKey="skill" />
                        <PolarGrid />
                        <Radar
                            dataKey="employees"
                            fill="var(--color-employees)"
                            fillOpacity={0.6}
                            dot={{
                                r: 4,
                                fillOpacity: 1,
                            }}
                        />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                   Top performance in front-end technologies
                </div>
            </CardFooter>
        </Card>
    )
}
