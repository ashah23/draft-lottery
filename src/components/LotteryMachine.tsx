import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useDraftStore } from '../store/useDraftStore';
import { generateDraftOrder } from '../utils/randomize';
import { Team } from '../types';
import { Play, SkipForward, Trophy } from 'lucide-react';

interface LotteryBallProps {
    team: Team;
    isSelected?: boolean;
    isRemoved?: boolean;
    delay?: number;
}

function LotteryBall({ team, isSelected, isRemoved, delay = 0 }: LotteryBallProps) {
    const colors = [
        'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
        'bg-teal-500', 'bg-cyan-500', 'bg-lime-500', 'bg-rose-500'
    ];

    const colorClass = colors[team.id % colors.length];

    if (isRemoved) return null;

    return (
        <motion.div
            className={`w-20 h-20 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-sm shadow-xl relative`}
            animate={{
                y: isSelected ? [-100, -200] : [0, -10, 0],
                scale: isSelected ? [1, 1.3, 1.6] : [1, 1.1, 1],
                rotate: isSelected ? [0, 360] : [0, 5, -5, 0],
            }}
            transition={{
                duration: isSelected ? 2 : 3,
                delay,
                repeat: isSelected ? 0 : Infinity,
                ease: "easeInOut"
            }}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
        >
            <span className="text-sm text-center leading-tight font-bold">
                {team.name.length > 8 ? team.name.substring(0, 6) + '...' : team.name}
            </span>
            {isSelected && (
                <motion.div
                    className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                    animate={{ scale: [1, 1.5, 1], rotate: [0, 360] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                >
                    ⭐
                </motion.div>
            )}
        </motion.div>
    );
}

export default function LotteryMachine() {
    const { config, setResult, setCurrentStep, setIsAnimating } = useDraftStore();
    const [currentPick, setCurrentPick] = useState(0);
    const [draftOrder, setDraftOrder] = useState<Team[]>([]);
    const [selectedBalls, setSelectedBalls] = useState<Set<number>>(new Set());
    const [isDrawing, setIsDrawing] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const lotteryTeams = config?.teams.filter(team => team.isLottery) || [];
    const remainingBalls = lotteryTeams.filter(team => !selectedBalls.has(team.id));

    useEffect(() => {
        if (config) {
            const order = generateDraftOrder(config);
            setDraftOrder(order);
        }
    }, [config]);

    const startDrawing = () => {
        setIsDrawing(true);
        setIsAnimating(true);
        setCurrentPick(0);
        setSelectedBalls(new Set());
        setShowResults(false);
    };

    const drawNextPick = () => {
        if (currentPick >= (config?.lotteryTeams || 0)) {
            finishLottery();
            return;
        }

        const currentTeam = draftOrder[currentPick];
        if (currentTeam) {
            setSelectedBalls(prev => new Set([...prev, currentTeam.id]));
            setCurrentPick(prev => prev + 1);
        }
    };

    const finishLottery = () => {
        setTimeout(() => {
            setShowResults(true);
            setIsDrawing(false);
            setIsAnimating(false);

            if (config) {
                setResult({
                    order: draftOrder,
                    timestamp: new Date().toISOString()
                });
                setCurrentStep('results');
            }
        }, 2000);
    };

    const skipAnimation = () => {
        if (config) {
            setResult({
                order: draftOrder,
                timestamp: new Date().toISOString()
            });
            setCurrentStep('results');
        }
    };

    // Auto-draw picks with delay
    useEffect(() => {
        if (isDrawing && currentPick < (config?.lotteryTeams || 0)) {
            const timer = setTimeout(() => {
                drawNextPick();
            }, 3000); // 3 second delay between picks

            return () => clearTimeout(timer);
        } else if (isDrawing && currentPick >= (config?.lotteryTeams || 0)) {
            finishLottery();
        }
    }, [isDrawing, currentPick, config?.lotteryTeams]);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
                    <CardHeader className="text-center pb-8">
                        <motion.div
                            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <span className="text-2xl">🎲</span>
                        </motion.div>
                        <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Lottery Drawing
                        </CardTitle>
                        <CardDescription className="text-lg text-muted-foreground mt-2">
                            Watch as the lottery balls determine the draft order
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        {/* Main Drawing Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            {/* Lottery Machine - Left Side */}
                            <div className="lg:col-span-2 flex justify-center">
                                <div className="relative">
                                    {/* Dome Container */}
                                    <div className="w-80 h-80 rounded-full border-4 border-primary/20 bg-gradient-to-b from-primary/10 to-transparent flex items-center justify-center relative overflow-hidden shadow-2xl">
                                        {/* Bouncing Balls */}
                                        <div className="grid grid-cols-3 gap-4 p-8">
                                            <AnimatePresence>
                                                {lotteryTeams.map((team, index) => (
                                                    <LotteryBall
                                                        key={team.id}
                                                        team={team}
                                                        isSelected={selectedBalls.has(team.id)}
                                                        isRemoved={selectedBalls.has(team.id) && currentPick > 0}
                                                        delay={index * 0.1}
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </div>

                                        {/* Spinning Effect */}
                                        {isDrawing && (
                                            <motion.div
                                                className="absolute inset-0 border-4 border-yellow-400 rounded-full opacity-50"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Selected Teams - Right Side */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold text-primary mb-2">Draft Order</h3>
                                    <p className="text-muted-foreground">Teams selected so far</p>
                                </div>

                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {currentPick > 0 ? (
                                        draftOrder.slice(0, currentPick).map((team, index) => (
                                            <motion.div
                                                key={team.id}
                                                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20"
                                                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                            >
                                                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-lg text-primary">{team.name}</div>
                                                    {team.percentage && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {team.percentage}% chance
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-2xl">🏈</div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <div className="text-4xl mb-2">⏳</div>
                                            <p>Waiting for first pick...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Current Pick Display */}
                        {isDrawing && (
                            <motion.div
                                className="text-center space-y-6 mt-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
                                    <h3 className="text-2xl font-bold text-primary mb-2">
                                        Drawing Pick #{currentPick + 1}
                                    </h3>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <motion.div
                                            className="bg-primary h-2 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((currentPick + 1) / (config?.lotteryTeams || 1)) * 100}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                    <p className="text-muted-foreground mt-2">
                                        {currentPick + 1} of {config?.lotteryTeams} picks completed
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Results Preview */}
                        {showResults && (
                            <motion.div
                                className="space-y-6 mt-8"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="text-center">
                                    <h3 className="text-3xl font-bold text-primary mb-2">🎉 Lottery Complete!</h3>
                                    <p className="text-muted-foreground">All lottery picks have been determined</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Controls */}
                        <div className="flex justify-center space-x-4 mt-8">
                            {!isDrawing && !showResults && (
                                <Button
                                    onClick={startDrawing}
                                    size="lg"
                                    className="px-12 py-4 text-xl font-bold h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <Play className="w-5 h-5 mr-2" />
                                    Start Lottery Drawing
                                </Button>
                            )}

                            {isDrawing && (
                                <Button
                                    onClick={skipAnimation}
                                    variant="outline"
                                    size="lg"
                                    className="px-8 py-4 h-12"
                                >
                                    <SkipForward className="w-4 h-4 mr-2" />
                                    Skip Animation
                                </Button>
                            )}

                            {showResults && (
                                <Button
                                    onClick={() => setCurrentStep('results')}
                                    size="lg"
                                    className="px-12 py-4 text-xl font-bold h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <Trophy className="w-5 h-5 mr-2" />
                                    View Full Results
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
