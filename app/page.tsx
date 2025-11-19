"use client";

import { NavbarImplementation } from "@/components/Navbar";
import { ChartPieInteractive } from "@/components/PieChartExample";
import { ChartBarLabel } from "@/components/BarChartExample";
import { ChartAreaGradient } from "@/components/AreaChartExample";
import { motion } from "framer-motion";
import {ChartLineInteractive} from "@/components/LineChartExample";
import {ChartRadarDots} from "@/components/RadarChartExample";
import {NavbarButton} from "@/components/ui/resizable-navbar";
import Aurora from "@/components/Aurora";

export default function Home() {
    return (
        <div className="relative min-h-screen">
            {/* Aurora Background - Fixed to cover entire viewport */}
            <div className="fixed inset-0 z-0">
                <Aurora
                    colorStops={["#3A29FF", "#9bc9bd", "#FF3232"]}
                    blend={0.5}
                    amplitude={1.0}
                    speed={0.5}
                />
            </div>

            {/* Content wrapper with relative positioning */}
            <div className="relative z-10">
                {/* Navbar */}
                <nav className="flex flex-row mt-3 items-center justify-between px-8">
                    <NavbarImplementation />
                </nav>

                {/* Charts grid directly under navbar */}
                <div className="mt-8 grid grid-cols-3 gap-3 px-5">
                    <motion.div
                        initial={{ opacity: 0.3 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex items-center justify-center"
                    >
                        <div className="w-full max-w-lg aspect-[16/9]">
                            <ChartPieInteractive />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0.3 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex items-center justify-center"
                    >
                        <div className="w-full max-w-lg aspect-[16/9]">
                            <ChartBarLabel />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0.3 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex items-center justify-center"
                    >
                        <div className="w-full max-w-lg aspect-[16/9]">
                            <ChartAreaGradient />
                        </div>
                    </motion.div>
                </div>

                {/* Foreground text near bottom */}
                <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-20 text-center px-6 max-w-3xl">
                    {/* Radial blur background */}
                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                        <div className="w-[600px] h-[600px] rounded-full bg-black/90 blur-3xl" />
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-4xl md:text-5xl font-bold text-white"
                    >
                        Insyte - AI Native <br /> Business Intelligence
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                        className="text-lg dark:background mt-6"
                    >
                        With Insyte, you can use natural language to generate dashboards,
                        reports, insights, and beautiful charts in seconds.<br/> No SQL required.<br/>

                        <NavbarButton
                            variant="primary"
                            className="w-xs mt-10 bg-slate-50/85"
                        >
                            Sign Up
                        </NavbarButton>
                    </motion.p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 px-5 w-full">
                    <motion.div
                        initial={{ opacity: 0.3 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex items-center justify-center col-span-2"
                    >
                        <div className="w-full">
                            <ChartLineInteractive />
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0.3 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex items-center justify-center col-span-1"
                    >
                        <div className="w-full">
                            <ChartRadarDots/>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}