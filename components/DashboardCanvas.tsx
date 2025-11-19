// components/DashboardCanvas.tsx
"use client";
import React from "react";
import { DndContext, closestCenter, DragEndEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { IconGripVertical, IconTrash, IconRefresh } from "@tabler/icons-react";
import {AreaChartExample} from "@/components/AreaChartExample1";
import {BarChartExample} from "@/components/BarChartExample1";
import {PieChartExample} from "@/components/PieChartExample1";
import {LineChartExample} from "@/components/LineChartExample1";


interface DashboardCard {
    id: string;
    chartConfig: {
        type: string;
        title: string;
        description?: string;
        dataKey: string;
        categoryKey?: string;
        color?: string;
    };
    data: any[];
    sqlQuery: string;
}

interface DashboardCanvasProps {
    cards: DashboardCard[];
    onCardsChange: (cards: DashboardCard[]) => void;
}

function DraggableCard({ card, onRemove, onRefresh }: {
    card: DashboardCard;
    onRemove: () => void;
    onRefresh: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: card.id
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const renderChart = () => {
        const { type } = card.chartConfig;

        switch (type) {
            case "area-chart":
                return <AreaChartExample data={card.data} config={card.chartConfig} />;
            case "bar-chart":
                return <BarChartExample data={card.data} config={card.chartConfig} />;
            case "line-chart":
                return <LineChartExample data={card.data} config={card.chartConfig} />;
            case "pie-chart":
            case "donut-chart":
                return <PieChartExample data={card.data} config={card.chartConfig} />;
            case "number-card":
                return <NumberCard data={card.data} config={card.chartConfig} />;
            case "table":
                return <DataTable data={card.data} config={card.chartConfig} />;
            default:
                return <div className="text-muted-foreground text-center py-8">Unsupported chart type</div>;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative group"
        >
            {/* Action buttons overlay */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 cursor-grab active:cursor-grabbing bg-background/80 backdrop-blur-sm"
                    {...attributes}
                    {...listeners}
                >
                    <IconGripVertical className="h-4 w-4" />
                </Button>
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                    onClick={onRefresh}
                >
                    <IconRefresh className="h-4 w-4" />
                </Button>
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-background/80 backdrop-blur-sm text-red-500 hover:text-red-600"
                    onClick={onRemove}
                >
                    <IconTrash className="h-4 w-4" />
                </Button>
            </div>

            {/* Chart component (includes its own Card) */}
            {renderChart()}
        </div>
    );
}

// Simple components for number cards and tables (they'll need Cards too)
function NumberCard({ data, config }: { data: any[]; config: any }) {
    const value = data[0]?.[config.dataKey] || 0;
    return (
        <div className="bg-card border rounded-lg p-6 shadow-sm">
            <div className="flex flex-col items-center justify-center h-40">
                <div className="text-5xl font-bold">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                {config.title && (
                    <div className="text-muted-foreground mt-2">{config.title}</div>
                )}
            </div>
        </div>
    );
}

function DataTable({ data, config }: { data: any[]; config: any }) {
    if (!data.length) {
        return (
            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                    No data available
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border rounded-lg p-6 shadow-sm">
            <div className="overflow-auto max-h-64">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b">
                        {Object.keys(data[0] || {}).map((key) => (
                            <th key={key} className="text-left p-2 font-medium">
                                {key}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((row, idx) => (
                        <tr key={idx} className="border-b">
                            {Object.values(row).map((val: any, i) => (
                                <td key={i} className="p-2">{val}</td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function DashboardCanvas({ cards, onCardsChange }: DashboardCanvasProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = cards.findIndex((card) => card.id === active.id);
            const newIndex = cards.findIndex((card) => card.id === over.id);
            onCardsChange(arrayMove(cards, oldIndex, newIndex));
        }
    };

    const handleRemoveCard = (id: string) => {
        onCardsChange(cards.filter((card) => card.id !== id));
    };

    const handleRefreshCard = async (id: string) => {
        console.log("Refresh card:", id);
    };

    if (cards.length === 0) {
        return (
            <div className="border-2 border-dashed rounded-lg p-12 text-center">
                <p className="text-muted-primary">
                    No charts yet.Create your first chart to get started!
                </p>
            </div>
        );
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={cards.map((c) => c.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card) => (
                        <DraggableCard
                            key={card.id}
                            card={card}
                            onRemove={() => handleRemoveCard(card.id)}
                            onRefresh={() => handleRefreshCard(card.id)}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}