import { DraftConfig, Team } from '../types';

/**
 * Weighted random selection algorithm
 * @param teams Array of teams with percentages
 * @returns Selected team
 */
export function weightedRandomSelect(teams: Team[]): Team {
    const lotteryTeams = teams.filter(team => team.isLottery && team.percentage);

    if (lotteryTeams.length === 0) {
        throw new Error('No lottery teams with percentages found');
    }

    // Calculate total weight
    const totalWeight = lotteryTeams.reduce((sum, team) => sum + (team.percentage || 0), 0);

    if (totalWeight === 0) {
        throw new Error('Total percentage weight is 0');
    }

    // Generate random number between 0 and totalWeight
    const random = Math.random() * totalWeight;

    // Find the team that corresponds to this random number
    let currentWeight = 0;
    for (const team of lotteryTeams) {
        currentWeight += team.percentage || 0;
        if (random <= currentWeight) {
            return team;
        }
    }

    // Fallback to last team (should never happen)
    return lotteryTeams[lotteryTeams.length - 1];
}

/**
 * Generate complete draft order
 * @param config Draft configuration
 * @returns Array of teams in draft order
 */
export function generateDraftOrder(config: DraftConfig): Team[] {
    const { teams, lotteryTeams } = config;

    // Separate lottery and playoff teams
    const lotteryTeamsList = teams.filter(team => team.isLottery);
    const playoffTeams = teams.filter(team => !team.isLottery);

    // Generate lottery picks
    const lotteryPicks: Team[] = [];
    const remainingLotteryTeams = [...lotteryTeamsList];

    for (let i = 0; i < lotteryTeams; i++) {
        if (remainingLotteryTeams.length === 0) break;

        const selectedTeam = weightedRandomSelect(remainingLotteryTeams);
        lotteryPicks.push(selectedTeam);

        // Remove selected team from remaining teams
        const index = remainingLotteryTeams.findIndex(team => team.id === selectedTeam.id);
        if (index > -1) {
            remainingLotteryTeams.splice(index, 1);
        }
    }

    // Add playoff teams
    const playoffPicks = [...playoffTeams];

    return [...lotteryPicks, ...playoffPicks];
}

/**
 * Validate draft configuration
 * @param config Draft configuration
 * @returns Validation result with errors
 */
export function validateDraftConfig(config: DraftConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.totalTeams < 2) {
        errors.push('Must have at least 2 teams');
    }

    if (config.lotteryTeams < 1) {
        errors.push('Must have at least 1 lottery team');
    }

    if (config.lotteryTeams >= config.totalTeams) {
        errors.push('Lottery teams must be less than total teams');
    }

    const lotteryTeams = config.teams.filter(team => team.isLottery);
    const playoffTeams = config.teams.filter(team => !team.isLottery);

    if (lotteryTeams.length !== config.lotteryTeams) {
        errors.push(`Expected ${config.lotteryTeams} lottery teams, found ${lotteryTeams.length}`);
    }

    if (playoffTeams.length !== (config.totalTeams - config.lotteryTeams)) {
        errors.push(`Expected ${config.totalTeams - config.lotteryTeams} playoff teams, found ${playoffTeams.length}`);
    }

    // Check for duplicate team names
    const teamNames = config.teams.map(team => team.name.toLowerCase());
    const uniqueNames = new Set(teamNames);
    if (teamNames.length !== uniqueNames.size) {
        errors.push('Team names must be unique');
    }

    // Check lottery percentages
    const totalPercentage = lotteryTeams.reduce((sum, team) => sum + (team.percentage || 0), 0);
    if (totalPercentage > 100) {
        errors.push(`Total lottery percentage (${totalPercentage}%) cannot exceed 100%`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
