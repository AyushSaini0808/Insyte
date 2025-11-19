"use client";
import React, { useState, useEffect } from "react";
import TableSection from "@/components/SidebarTable";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartBuilder } from "@/components/ChartBuilder";
import { IconPlus, IconDownload, IconDeviceFloppy } from "@tabler/icons-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {DashboardCanvas} from "@/components/DashboardCanvas";
import PixelBlast from "@/components/PixelBlast";

interface DashboardCard {
    id: string;
    chartConfig: any;
    data: any[];
    sqlQuery: string;
}

export default function Create() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>([]);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);

    // Load saved dashboard from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('dashboard-cards');
        if (saved) {
            try {
                setDashboardCards(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load dashboard:', e);
            }
        }
    }, []);

    // Save dashboard to localStorage whenever it changes
    const handleCardsChange = (newCards: DashboardCard[]) => {
        setDashboardCards(newCards);
        localStorage.setItem('dashboard-cards', JSON.stringify(newCards));
    };

    const handleChartCreated = (chartData: any) => {
        const newCard: DashboardCard = {
            id: `chart-${Date.now()}`,
            chartConfig: chartData.chartConfig,
            data: chartData.data,
            sqlQuery: chartData.sqlQuery,
        };

        handleCardsChange([...dashboardCards, newCard]);
        setIsBuilderOpen(false);
    };

    const handleSaveDashboard = () => {
        // Additional save logic (e.g., save to database)
        const blob = new Blob([JSON.stringify(dashboardCards, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClearDashboard = () => {
        if (confirm('Are you sure you want to clear the dashboard?')) {
            handleCardsChange([]);
        }
    };

    return (
        <div className="relative flex h-screen flex-col">
            {/* Beams Background - Fixed to cover entire viewport */}
            <div className="fixed inset-0 z-0">
                <PixelBlast
                    beamWidth={2}
                    beamHeight={15}
                    beamNumber={12}
                    lightColor="#ffffff"
                    speed={2}
                    noiseIntensity={1.75}
                    scale={0.2}
                    rotation={0}
                />
            </div>

            {/* Content wrapper with relative positioning */}
            <div className="relative z-10 flex h-screen flex-col">
                {/* Header */}
                <div className="border-b flex items-center justify-between px-6 py-3 bg-background/80 backdrop-blur-sm">
                    <Link
                        href="/"
                        className="flex items-center space-x-2 text-2xl font-medium text-black dark:text-white"
                    >
                        <Image
                            src={"/favicon.png"}
                            alt={"logo"}
                            width={40}
                            height={40}
                        />
                        <span className="font-medium">Insyte</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {activeTab === "dashboard" && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSaveDashboard}
                                    disabled={dashboardCards.length === 0}
                                >
                                    <IconDownload className="w-4 h-4 mr-2" />
                                    Export
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearDashboard}
                                    disabled={dashboardCards.length === 0}
                                >
                                    Clear
                                </Button>
                            </>
                        )}
                        <Button className="text-sm px-5 py-2">Add Data Source</Button>
                    </div>
                </div>

                {/* Tabs Section */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <div className="border-b px-6 flex justify-center bg-background/80 backdrop-blur-sm">
                        <TabsList className="h-12 bg-transparent">
                            <TabsTrigger
                                value="dashboard"
                                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                            >
                                Dashboard
                            </TabsTrigger>
                            <TabsTrigger
                                value="data-source"
                                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                            >
                                Data Source
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Dashboard Content */}
                    <TabsContent value="dashboard" className="flex-1 overflow-auto m-0 p-6">
                        <div className="space-y-6">
                            {/* Action Bar */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-semibold">My Dashboard</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {dashboardCards.length} {dashboardCards.length === 1 ? 'chart' : 'charts'}
                                    </p>
                                </div>

                                <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <IconPlus className="w-4 h-4 mr-2" />
                                            Add Chart
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Create New Chart</DialogTitle>
                                            <DialogDescription>
                                                Ask a question about your data to create a visualization
                                            </DialogDescription>
                                        </DialogHeader>
                                        <ChartBuilder onChartCreated={handleChartCreated} />
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* Dashboard Canvas */}
                            <DashboardCanvas
                                cards={dashboardCards}
                                onCardsChange={handleCardsChange}
                            />
                        </div>
                    </TabsContent>

                    {/* Data Source Content */}
                    <TabsContent value="data-source" className="flex-1 overflow-auto m-0">
                        <TableSection />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}