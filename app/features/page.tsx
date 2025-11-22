"use client";

import {NavbarImplementation} from "@/components/Navbar";
import PrismaticBurst from "@/components/PrismaticBurst";
import {IconChartBar, IconSparkles} from "@tabler/icons-react";
import Image from "next/image";
import {motion} from "framer-motion";
import {ChartBarLabel} from "@/components/BarChartExample";

export default function Features() {
    const fadeInUp = {
        initial: { opacity: 0, y: 60 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-100px" },
        transition: { duration: 0.6, ease: "easeOut" }
    };

    const fadeIn = {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true, margin: "-100px" },
        transition: { duration: 0.8, ease: "easeOut" }
    };

    const staggerContainer = {
        initial: {},
        whileInView: {},
        viewport: { once: true, margin: "-100px" }
    };

    const staggerItem = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    return (
        <>
            <div className="w-full h-[800px] relative">
                {/* Background layer */}
                <div className="absolute top-0 left-0 w-full h-full z-0">
                    <PrismaticBurst
                        animationType="rotate3d"
                        intensity={2}
                        speed={0.5}
                        distort={1.0}
                        paused={false}
                        offset={{x: 0, y: 0}}
                        hoverDampness={0.25}
                        rayCount={24}
                        mixBlendMode="lighten"
                        colors={['#0004ff', '#3dffdb', '#ffffff']}
                    />
                </div>

                {/* Bottom blur/fade overlay */}
                <div
                    className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-black via-black/50 to-transparent z-5 pointer-events-none"></div>

                {/* Navbar */}
                <div className="relative z-10">
                    <NavbarImplementation/>
                </div>

                {/* Content layer */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center z-10 pointer-events-none">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Your AI Data Analyst
                    </h1>
                    <p className="text-xl text-gray-200">
                        Insyte agent allows you to make data based decisions
                    </p>
                </motion.div>
            </div>

            {/* Comparison Section */}
            <div className="w-full bg-black py-20 px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        {/* Traditional Analytics */}
                        <motion.div {...fadeInUp}>
                            <h2 className="text-2xl font-bold text-white mb-4">Traditional data analytics</h2>
                            <p className="text-gray-400 mb-6">
                                With other BI tools or even modern MCP workflows, only technical teammates can get data
                                insights.
                            </p>
                            <motion.ul
                                className="space-y-2 text-gray-500"
                                variants={staggerContainer}
                                initial="initial"
                                whileInView="whileInView"
                                viewport={{ once: true }}
                            >
                                {['Bottlenecks', 'Slow turnaround', 'Last minute requests', 'Old data',
                                    'Floating csvs and exports', 'Conflicting reports', 'Multiple data tools', 'Security gaps'].map((item, i) => (
                                    <motion.li
                                        key={i}
                                        variants={staggerItem}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        {item}
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </motion.div>

                        {/* Insyte Agent */}
                        <motion.div {...fadeInUp} transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}>
                            <h2 className="text-2xl font-bold text-white mb-4">Insyte agent</h2>
                            <p className="text-gray-400 mb-6">
                                Insyte agent allows everyone to ask data questions. Engineers can shift from answering
                                tickets and ad-hoc requests to being data advisors, managing complex pipelines, and work
                                on production code.
                            </p>
                            <motion.ul
                                className="space-y-2 text-gray-300"
                                variants={staggerContainer}
                                initial="initial"
                                whileInView="whileInView"
                                viewport={{ once: true }}
                            >
                                {['Self-serve', 'Instant', 'Collaborative', 'Single source of truth',
                                    'Real-time', 'Shared reports'].map((item, i) => (
                                    <motion.li
                                        key={i}
                                        variants={staggerItem}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        {item}
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </motion.div>
                    </div>

                    {/* Deep Thinking Section */}
                    <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* Content */}
                        <motion.div {...fadeInUp}>
                            <div className="flex flex-row items-center">
                                <IconSparkles className="h-8 w-8 text-white"/>
                                <h1 className="ml-2 text-2xl text-white font-bold">Deep Thinking</h1>
                            </div>
                            <p className="mt-3 text-gray-400">
                                Insyte isn't just a chat to SQL app. It's a deep reasoning platform that takes your schema,
                                business, and workspace into account and digs into the data for you.
                            </p>
                        </motion.div>

                        {/* Video */}
                        <motion.div {...fadeIn} transition={{ duration: 0.8, delay: 0.2 }}>
                            <video
                                className="w-full rounded-lg"
                                controls
                                autoPlay
                                muted
                                loop
                            >
                                <source src="/chart_generator_video.mov" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </motion.div>
                    </div>

                    {/* Generate Charts Section */}
                    <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* Image */}
                        <motion.div
                            className="w-full"
                            {...fadeIn}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <ChartBarLabel/>
                        </motion.div>

                        {/* Content */}
                        <motion.div {...fadeInUp}>
                            <div className="flex flex-row items-center">
                                <IconChartBar className="h-8 w-8 text-white"/>
                                <h1 className="ml-2 text-2xl text-white font-bold">Generate Charts</h1>
                            </div>
                            <p className="mt-3 text-gray-400">
                                Insyte agent allows everyone to ask data questions. Engineers can shift from answering
                                tickets and ad-hoc requests to being data advisors, managing complex pipelines, and work
                                on production code.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
}