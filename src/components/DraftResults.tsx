import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useDraftStore } from '@/store/useDraftStore';
import { Trophy, RotateCcw } from 'lucide-react';

export default function DraftResults() {
    const { result, reset } = useDraftStore();

    const handleReset = () => {
        reset();
    };

    if (!result) return null;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Card className="border-0 shadow-xl bg-background/90 backdrop-blur supports-backdrop-filter:backdrop-blur-xl">
                    <CardHeader className="text-center pb-8">
                        <motion.div
                            className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-primary to-primary/60 rounded-2xl mb-4 shadow-lg"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Trophy className="w-8 h-8 text-primary-foreground" />
                        </motion.div>
                        <CardTitle className="text-4xl font-bold bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                            Draft Results
                        </CardTitle>
                        <CardDescription className="text-lg text-muted-foreground mt-2">
                            Here's your final draft order
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 px-8 pb-8">
                        {/* Draft Order */}
                        <motion.div
                            className="space-y-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="grid gap-3">
                                {result.order.map((team, index) => (
                                    <motion.div
                                        key={team.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`flex items-center space-x-4 p-4 rounded-lg ${team.isLottery
                                                ? 'bg-linear-to-r from-primary/10 to-primary/5 border border-primary/20'
                                                : 'bg-muted/30 border border-border/50'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${team.isLottery
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted-foreground/30 text-muted-foreground'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-lg">{team.name}</div>
                                            {team.isLottery && (
                                                <div className="text-sm text-muted-foreground">
                                                    Original Chance: {team.percentage}%
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-2xl">
                                            {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏈'}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Actions */}
                        <motion.div
                            className="flex justify-center pt-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <Button
                                onClick={handleReset}
                                size="lg"
                                className="px-12 py-4 text-xl font-bold h-14 bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <RotateCcw className="w-5 h-5 mr-2" />
                                New Draft Lottery
                            </Button>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}