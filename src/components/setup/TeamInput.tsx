import { motion } from 'framer-motion';
import { Input } from '../ui/input';
import type { Team } from '@/types';

interface TeamInputProps {
    team: Team;
    index: number;
    isLottery: boolean;
    lotteryTeams: number;
    updateTeamName: (id: number, name: string) => void;
    updateTeamPercentage?: (id: number, percentage: number) => void;
}

export function TeamInput({ team, index, isLottery, lotteryTeams, updateTeamName, updateTeamPercentage }: TeamInputProps) {
    return (
        <motion.div
            key={team.id}
            className={`flex items-center space-x-4 p-3 ${isLottery
                    ? 'bg-muted/30 hover:bg-muted/50'
                    : 'bg-muted/20 hover:bg-muted/40'
                } rounded-lg transition-colors`}
            initial={{ opacity: 0, x: isLottery ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (isLottery ? 0.5 : 0.7) + index * 0.1 }}
        >
            <div className={`w-7 h-7 ${isLottery
                    ? 'bg-linear-to-r from-primary to-primary/60'
                    : 'bg-primary/80'
                } text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs`}>
                {isLottery ? index + 1 : lotteryTeams + index + 1}
            </div>
            <Input
                placeholder="Enter team name"
                value={team.name}
                onChange={(e) => updateTeamName(team.id, e.target.value)}
                className="flex-1 h-10 text-base font-medium border-0 bg-transparent focus:ring-0"
            />
            {isLottery && updateTeamPercentage && (
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
            )}
        </motion.div>
    );
}