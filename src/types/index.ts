export interface Team {
    id: number;
    name: string;
    percentage?: number; // only for lottery teams
    isLottery: boolean;
}

export interface DraftConfig {
    totalTeams: number;
    lotteryTeams: number;
    teams: Team[];
}

export interface DraftResult {
    order: Team[];
    timestamp: string;
}

export interface DraftState {
    config: DraftConfig | null;
    result: DraftResult | null;
    currentStep: 'setup' | 'animating' | 'results';
    isAnimating: boolean;
    setConfig: (config: DraftConfig) => void;
    setResult: (result: DraftResult) => void;
    setCurrentStep: (step: 'setup' | 'animating' | 'results') => void;
    setIsAnimating: (isAnimating: boolean) => void;
    reset: () => void;
}
