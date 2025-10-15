import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { useDraftStore } from '../store/useDraftStore';
import { Team, DraftConfig, SleeperUser } from '../types';
import { validateDraftConfig } from '../utils/randomize';
import { motion } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';

export default function SetupForm() {
    const { setConfig, setCurrentStep } = useDraftStore();
    const [totalTeams, setTotalTeams] = useState(12);
    const [lotteryTeams, setLotteryTeams] = useState(6);
    const [teams, setTeams] = useState<Team[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [sleeperLeagueId, setSleeperLeagueId] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState('');

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

    const importFromSleeper = async () => {
        if (!sleeperLeagueId.trim()) {
            setImportError('Please enter a Sleeper League ID');
            return;
        }

        setIsImporting(true);
        setImportError('');

        try {
            const response = await fetch(`https://api.sleeper.app/v1/league/${sleeperLeagueId}/users`);

            if (!response.ok) {
                throw new Error('Failed to fetch league data. Please check the League ID.');
            }

            const data = await response.json();
            console.log(data);

            // Extract team names from the API response
            const teamNames: string[] = [];
            data.forEach((user: SleeperUser) => {
                if (user.metadata && user.metadata.team_name) {
                    teamNames.push(user.metadata.team_name + ' - ' + user.display_name);
                }
            });

            if (teamNames.length === 0) {
                throw new Error('No team names found in this league');
            }

            // Update total teams to match imported teams
            setTotalTeams(teamNames.length);

            // Create new teams array with imported names
            const newTeams: Team[] = [];

            // Create lottery teams
            for (let i = 0; i < Math.min(lotteryTeams, teamNames.length); i++) {
                newTeams.push({
                    id: i + 1,
                    name: teamNames[i] || `Team ${i + 1}`,
                    percentage: Math.floor(100 / Math.min(lotteryTeams, teamNames.length)),
                    isLottery: true
                });
            }

            // Create playoff teams
            for (let i = lotteryTeams; i < teamNames.length; i++) {
                newTeams.push({
                    id: i + 1,
                    name: teamNames[i] || `Team ${i + 1}`,
                    isLottery: false
                });
            }

            setTeams(newTeams);
            setSleeperLeagueId('');
        } catch (error) {
            setImportError(error instanceof Error ? error.message : 'Failed to import teams');
        } finally {
            setIsImporting(false);
        }
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

                        {/* Sleeper Import Section */}
                        <motion.div
                            className="space-y-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                        <Download className="w-4 h-4 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">Import from Sleeper</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Import team names directly from your Sleeper league using the League ID
                                </p>
                                <div className="flex space-x-3">
                                    <Input
                                        placeholder="Enter Sleeper League ID (e.g., 1180639804763353088)"
                                        value={sleeperLeagueId}
                                        onChange={(e) => setSleeperLeagueId(e.target.value)}
                                        className="flex-1 h-10"
                                    />
                                    <Button
                                        onClick={importFromSleeper}
                                        disabled={isImporting || !sleeperLeagueId.trim()}
                                        className="h-10 px-6"
                                    >
                                        {isImporting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Importing...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4 mr-2" />
                                                Import Teams
                                            </>
                                        )}
                                    </Button>
                                </div>
                                {importError && (
                                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <p className="text-sm text-red-600 dark:text-red-400">{importError}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

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
