import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { useDraftStore } from '@/store/useDraftStore';
import type { Team, DraftConfig, SleeperUser } from '@/types';
import { validateDraftConfig } from '@/utils/randomize';
import { Download, Loader2, ChevronDown } from 'lucide-react';
import { TeamInput } from './TeamInput';

export default function SetupForm() {
    const { setConfig, setCurrentStep } = useDraftStore();
    const [totalTeams, setTotalTeams] = useState(12);
    const [lotteryTeams, setLotteryTeams] = useState(6);
    const [teams, setTeams] = useState<Team[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [sleeperLeagueId, setSleeperLeagueId] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState('');
    const [isImportSectionOpen, setIsImportSectionOpen] = useState(false);

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

            if (!Array.isArray(data)) {
                throw new Error('Invalid data received from Sleeper API');
            }
            console.log('Sleeper API response:', data); // For debugging

            // Extract team names from the API response
            const teamNames: string[] = [];
            data.forEach((user: SleeperUser) => {
                // Use display_name if team_name is not available
                if (user.metadata && user.metadata.team_name) {
                    const teamName = user.metadata?.team_name
                        ? `${user.metadata.team_name} - ${user.display_name}`
                        : user.display_name;
                    teamNames.push(teamName);
                }
            });

            if (teamNames.length === 0) {
                throw new Error('No teams found in this league. Please check the League ID.');
            }

            console.log('Imported teams:', teamNames); // For debugging

            // Update total teams to match imported teams
            setTotalTeams(teamNames.length);

            // Create new teams array with imported names
            const newTeams: Team[] = [];
            const defaultPercentage = Math.floor(100 / Math.min(lotteryTeams, teamNames.length));

            // Create lottery teams
            for (let i = 0; i < Math.min(lotteryTeams, teamNames.length); i++) {
                newTeams.push({
                    id: i + 1,
                    name: teamNames[i],
                    percentage: defaultPercentage,
                    isLottery: true
                });
            }

            // Create playoff teams
            for (let i = lotteryTeams; i < teamNames.length; i++) {
                newTeams.push({
                    id: i + 1,
                    name: teamNames[i],
                    isLottery: false
                });
            }

            setTeams(newTeams);
            setSleeperLeagueId('');

            // Force close the import section after successful import
            setIsImportSectionOpen(false);

        } catch (error) {
            console.error('Import error:', error); // For debugging
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
                <Card className="border-0 shadow-xl bg-background/90 backdrop-blur supports-backdrop-filter:backdrop-blur-xl">
                    <CardHeader className="text-center pb-8">
                        <motion.div
                            className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-primary to-primary/60 rounded-2xl mb-4 shadow-lg"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <span className="text-2xl">🏈</span>
                        </motion.div>
                        <CardTitle className="text-4xl font-bold bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
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
                            <div className="bg-linear-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
                                <button
                                    onClick={() => setIsImportSectionOpen(!isImportSectionOpen)}
                                    className="w-full flex items-center justify-between text-left focus:outline-none"
                                    aria-expanded={isImportSectionOpen}
                                    aria-controls="sleeper-import-section"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-linear-to-r from-primary to-primary/60 rounded-lg flex items-center justify-center">
                                            <Download className="w-4 h-4 text-primary-foreground" />
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground">Import from Sleeper</h3>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: isImportSectionOpen ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                    </motion.div>
                                </button>

                                <AnimatePresence>
                                    {isImportSectionOpen && (
                                        <motion.div
                                            id="sleeper-import-section"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-4 space-y-4">
                                                <p className="text-sm text-muted-foreground">
                                                    Import team names directly from your Sleeper league using the League ID
                                                </p>
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <Input
                                                        placeholder="Enter Sleeper League ID (e.g., 1180639804763353088)"
                                                        value={sleeperLeagueId}
                                                        onChange={(e) => setSleeperLeagueId(e.target.value)}
                                                        className="flex-1 h-10"
                                                    />
                                                    <Button
                                                        onClick={importFromSleeper}
                                                        disabled={isImporting || !sleeperLeagueId.trim()}
                                                        className="h-10 px-6 whitespace-nowrap"
                                                    >
                                                        {isImporting ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                <span className="hidden sm:inline">Importing...</span>
                                                                <span className="sm:hidden">Import</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Download className="w-4 h-4 mr-2" />
                                                                <span className="hidden sm:inline">Import Teams</span>
                                                                <span className="sm:hidden">Import</span>
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                                {importError && (
                                                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                                                        <p className="text-sm text-destructive">{importError}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
                                    <span className="w-3 h-3 bg-linear-to-r from-primary to-primary/60 rounded-full"></span>
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
                                    <TeamInput
                                        key={team.id}
                                        team={team}
                                        index={index}
                                        isLottery={true}
                                        lotteryTeams={lotteryTeams}
                                        updateTeamName={updateTeamName}
                                        updateTeamPercentage={updateTeamPercentage}
                                    />
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
                                <span className="w-3 h-3 bg-linear-to-r from-primary/80 to-primary/40 rounded-full"></span>
                                <span>Playoff Teams</span>
                            </h3>
                            <div className="space-y-2">
                                {playoffTeamsList.map((team, index) => (
                                    <TeamInput
                                        key={team.id}
                                        team={team}
                                        index={index}
                                        isLottery={false}
                                        lotteryTeams={lotteryTeams}
                                        updateTeamName={updateTeamName}
                                    />
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
                                className="px-12 py-4 text-xl font-bold h-14 bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
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