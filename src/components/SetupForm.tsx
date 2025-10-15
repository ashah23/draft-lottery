import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { useDraftStore } from '../store/useDraftStore';
import { Team, DraftConfig } from '../types';
import { validateDraftConfig } from '../utils/randomize';
import { motion } from 'framer-motion';

export default function SetupForm() {
    const { setConfig, setCurrentStep } = useDraftStore();
    const [totalTeams, setTotalTeams] = useState(12);
    const [lotteryTeams, setLotteryTeams] = useState(6);
    const [teams, setTeams] = useState<Team[]>([]);
    const [errors, setErrors] = useState<string[]>([]);

    // Initialize teams when totalTeams or lotteryTeams changes
    useEffect(() => {
        const newTeams: Team[] = [];

        // Create lottery teams
        for (let i = 0; i < lotteryTeams; i++) {
            newTeams.push({
                id: i + 1,
                name: `Team ${i + 1}`,
                percentage: 12, // Default equal distribution
                isLottery: true
            });
        }

        // Create playoff teams
        for (let i = lotteryTeams; i < totalTeams; i++) {
            newTeams.push({
                id: i + 1,
                name: `Team ${i + 1}`,
                isLottery: false
            });
        }

        setTeams(newTeams);
    }, [totalTeams, lotteryTeams]);

    const updateTeamName = (id: number, name: string) => {
        setTeams(prev => prev.map(team =>
            team.id === id ? { ...team, name } : team
        ));
    };

    const updateTeamPercentage = (id: number, percentage: number) => {
        setTeams(prev => prev.map(team =>
            team.id === id ? { ...team, percentage } : team
        ));
    };

    const calculateTotalPercentage = () => {
        return teams
            .filter(team => team.isLottery)
            .reduce((sum, team) => sum + (team.percentage || 0), 0);
    };

    const handleStartLottery = () => {
        const config: DraftConfig = {
            totalTeams,
            lotteryTeams,
            teams
        };

        const validation = validateDraftConfig(config);

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setErrors([]);
        setConfig(config);
        setCurrentStep('animating');
    };

    const lotteryTeamsList = teams.filter(team => team.isLottery);
    const playoffTeamsList = teams.filter(team => !team.isLottery);
    const totalPercentage = calculateTotalPercentage();

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
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
                            <span className="text-2xl">🏈</span>
                        </motion.div>
                        <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            League Configuration
                        </CardTitle>
                        <CardDescription className="text-lg text-muted-foreground mt-2">
                            Set up your league settings and configure team lottery percentages
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 px-8 pb-8">
                        {/* League Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div
                                className="space-y-3"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <label className="text-sm font-semibold text-foreground flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                                    <span>Total Teams</span>
                                </label>
                                <Input
                                    type="number"
                                    min="2"
                                    max="32"
                                    value={totalTeams}
                                    onChange={(e) => setTotalTeams(parseInt(e.target.value) || 2)}
                                    className="h-12 text-lg font-medium"
                                />
                            </motion.div>
                            <motion.div
                                className="space-y-3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <label className="text-sm font-semibold text-foreground flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                                    <span>Lottery Teams</span>
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    max={totalTeams - 1}
                                    value={lotteryTeams}
                                    onChange={(e) => setLotteryTeams(parseInt(e.target.value) || 1)}
                                    className="h-12 text-lg font-medium"
                                />
                            </motion.div>
                        </div>

                        {/* Lottery Teams */}
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-foreground flex items-center space-x-2">
                                    <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
                                    <span>Lottery Teams</span>
                                </h3>
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-semibold text-muted-foreground">
                                        Total: {totalPercentage}%
                                    </span>
                                    <div className="w-32">
                                        <Progress
                                            value={totalPercentage}
                                            className="h-3"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {lotteryTeamsList.map((team, index) => (
                                    <motion.div
                                        key={team.id}
                                        className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                    >
                                        <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                            {index + 1}
                                        </div>
                                        <Input
                                            placeholder="Enter team name"
                                            value={team.name}
                                            onChange={(e) => updateTeamName(team.id, e.target.value)}
                                            className="flex-1 h-10 text-base font-medium border-0 bg-transparent focus:ring-0"
                                        />
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={team.percentage || 0}
                                                onChange={(e) => updateTeamPercentage(team.id, parseFloat(e.target.value) || 0)}
                                                className="w-20 h-10 text-center font-bold border-0 bg-transparent focus:ring-0"
                                            />
                                            <span className="text-sm font-semibold text-muted-foreground">%</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Playoff Teams */}
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <h3 className="text-xl font-bold text-foreground flex items-center space-x-2">
                                <span className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></span>
                                <span>Playoff Teams</span>
                            </h3>
                            <div className="space-y-2">
                                {playoffTeamsList.map((team, index) => (
                                    <motion.div
                                        key={team.id}
                                        className="flex items-center space-x-4 p-3 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 + index * 0.1 }}
                                    >
                                        <div className="w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                            {lotteryTeams + index + 1}
                                        </div>
                                        <Input
                                            placeholder="Enter team name"
                                            value={team.name}
                                            onChange={(e) => updateTeamName(team.id, e.target.value)}
                                            className="flex-1 h-10 text-base font-medium border-0 bg-transparent focus:ring-0"
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Errors */}
                        {errors.length > 0 && (
                            <motion.div
                                className="bg-destructive/10 border border-destructive/20 rounded-xl p-6"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h4 className="font-semibold text-destructive mb-3 flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-destructive rounded-full"></span>
                                    <span>Please fix the following errors:</span>
                                </h4>
                                <ul className="text-sm text-destructive space-y-2">
                                    {errors.map((error, index) => (
                                        <li key={index} className="flex items-center space-x-2">
                                            <span className="w-1 h-1 bg-destructive rounded-full"></span>
                                            <span>{error}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}

                        {/* Start Button */}
                        <motion.div
                            className="flex justify-center pt-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <Button
                                onClick={handleStartLottery}
                                size="lg"
                                className="px-12 py-4 text-xl font-bold h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                                disabled={totalPercentage > 100}
                            >
                                <span className="mr-2">🎲</span>
                                Start Lottery Drawing
                            </Button>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
