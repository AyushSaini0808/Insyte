// components/ChartBuilder.tsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { IconSparkles, IconPlus } from "@tabler/icons-react";

type ChartType =
    | "number-card"
    | "bar-chart"
    | "line-chart"
    | "pie-chart"
    | "area-chart"
    | "donut-chart"
    | "radial-chart"
    | "table";

interface ChartBuilderProps {
    onChartCreated: (chartData: any) => void;
}

export function ChartBuilder({ onChartCreated }: ChartBuilderProps) {
    const [query, setQuery] = useState("");
    const [chartType, setChartType] = useState<ChartType | "auto">("auto");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [preview, setPreview] = useState<any>(null);

    const chartTypes = [
        { value: "auto", label: "Auto (Let AI decide)", icon: "✨" },
        { value: "number-card", label: "Number Card", icon: "🔢" },
        { value: "bar-chart", label: "Bar Chart", icon: "📊" },
        { value: "line-chart", label: "Line Chart", icon: "📈" },
        { value: "area-chart", label: "Area Chart", icon: "📉" },
        { value: "pie-chart", label: "Pie Chart", icon: "🥧" },
        { value: "donut-chart", label: "Donut Chart", icon: "🍩" },
        { value: "radial-chart", label: "Radial Chart", icon: "⭕" },
        { value: "table", label: "Table", icon: "📋" },
    ];

    const handleGenerate = async () => {
        if (!query.trim()) return;

        try {
            setLoading(true);
            setError("");
            setPreview(null);

            const response = await fetch('/api/generate-chart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    chartType: chartType === "auto" ? undefined : chartType
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate chart');
            }

            const result = await response.json();
            setPreview(result);
        } catch (err: any) {
            setError(err.message || "Error generating chart");
        } finally {
            setLoading(false);
        }
    };

    const handleAddToDashboard = () => {
        if (preview) {
            onChartCreated(preview);
            setQuery("");
            setPreview(null);
            setChartType("auto");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerate();
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconSparkles className="w-5 h-5" />
                        Create Chart
                    </CardTitle>
                    <CardDescription>
                        Ask a question about your data and obtain the perfect visualization
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="query">What do you want to visualize?</Label>
                        <Input
                            id="query"
                            placeholder="e.g., Show total revenue by category"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="chart-type">Chart Type</Label>
                        <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType | "auto")}>
                            <SelectTrigger id="chart-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {chartTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        <span className="flex items-center gap-2">
                                            <span>{type.icon}</span>
                                            <span>{type.label}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={loading || !query.trim()}
                        className="w-full"
                    >
                        {loading ? "Generating..." : "Generate Chart"}
                    </Button>

                    {error && (
                        <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                            {error}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Preview Section */}
            {preview && (
                <Card>
                    <CardHeader>
                        <CardTitle>Preview</CardTitle>
                        <CardDescription>
                            {preview.chartConfig.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Display chart config */}
                        <div className="p-4 bg-muted rounded-lg space-y-2">
                            <div className="text-sm">
                                <span className="font-medium">Chart Type:</span>{" "}
                                <span className="capitalize">{preview.chartConfig.type.replace('-', ' ')}</span>
                            </div>
                            <div className="text-sm">
                                <span className="font-medium">Title:</span>{" "}
                                {preview.chartConfig.title}
                            </div>
                            <div className="text-sm">
                                <span className="font-medium">SQL Query:</span>
                                <code className="block mt-1 p-2 bg-background rounded text-xs">
                                    {preview.sqlQuery}
                                </code>
                            </div>
                            <div className="text-sm">
                                <span className="font-medium">Data Points:</span>{" "}
                                {preview.data.length} rows
                            </div>
                        </div>

                        {/* Simple data preview */}
                        <div className="max-h-40 overflow-auto border rounded-lg p-3">
                            <pre className="text-xs">
                                {JSON.stringify(preview.data.slice(0, 3), null, 2)}
                                {preview.data.length > 3 && '\n...'}
                            </pre>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleAddToDashboard} className="flex-1">
                                <IconPlus className="w-4 h-4 mr-2" />
                                Add to Dashboard
                            </Button>
                            <Button variant="outline" onClick={() => setPreview(null)}>
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}