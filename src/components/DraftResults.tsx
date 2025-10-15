import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useDraftStore } from '../store/useDraftStore';
import { Trophy, Copy, Download, RotateCcw } from 'lucide-react';

export default function DraftResults() {
    const { result, config, reset, setCurrentStep } = useDraftStore();

    if (!result || !config) return null;

    const lotteryPicks = result.order.slice(0, config.lotteryTeams);
    const playoffPicks = result.order.slice(config.lotteryTeams);

    const copyResults = () => {
        const text = result.order.map((team, index) =>
            `Pick #${index + 1}: ${team.name}${team.percentage ? ` (${team.percentage}% chance)` : ''}`
        ).join('\n');

        navigator.clipboard.writeText(text);
    };

    const downloadCSV = () => {
        const csvContent = [
            'Pick,Team Name,Type,Percentage',
            ...result.order.map((team, index) => [
                index + 1,
                team.name,
                team.isLottery ? 'Lottery' : 'Playoff',
                team.percentage || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `draft-lottery-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const runNewLottery = () => {
        reset();
        setCurrentStep('setup');
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-3xl text-center flex items-center justify-center gap-2">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        Draft Order Results
                    </CardTitle>
                    <CardDescription className="text-center">
                        Final draft order determined by lottery
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Lottery Picks */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-center text-primary">
                            Lottery Picks (Picks 1-{config.lotteryTeams})
                        </h3>
                        <div className="space-y-3">
                            {lotteryPicks.map((team, index) => (
                                <motion.div
                                    key={team.id}
                                    className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">{team.name}</div>
                                            {team.percentage && (
                                                <div className="text-sm text-muted-foreground">
                                                    {team.percentage}% chance
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-2xl">🏈</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Playoff Picks */}
                    {playoffPicks.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-center text-secondary-foreground">
                                Playoff Picks (Picks {config.lotteryTeams + 1}-{config.totalTeams})
                            </h3>
                            <div className="space-y-2">
                                {playoffPicks.map((team, index) => (
                                    <motion.div
                                        key={team.id}
                                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: (lotteryPicks.length + index) * 0.1 }}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-muted-foreground text-muted rounded-full flex items-center justify-center font-bold text-sm">
                                                {config.lotteryTeams + index + 1}
                                            </div>
                                            <span className="font-semibold">{team.name}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap justify-center gap-4 pt-6">
                        <Button onClick={copyResults} variant="outline" size="lg">
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Results
                        </Button>
                        <Button onClick={downloadCSV} variant="outline" size="lg">
                            <Download className="w-4 h-4 mr-2" />
                            Download CSV
                        </Button>
                        <Button onClick={runNewLottery} size="lg" className="px-8">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Run New Lottery
                        </Button>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{config.totalTeams}</div>
                            <div className="text-sm text-muted-foreground">Total Teams</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{config.lotteryTeams}</div>
                            <div className="text-sm text-muted-foreground">Lottery Teams</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                                {new Date(result.timestamp).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Drawn On</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
