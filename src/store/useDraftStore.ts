import { create } from 'zustand';
import { DraftState, DraftConfig, DraftResult } from '../types';

export const useDraftStore = create<DraftState>((set) => ({
    config: null,
    result: null,
    currentStep: 'setup',
    isAnimating: false,

    setConfig: (config: DraftConfig) => set({ config }),

    setResult: (result: DraftResult) => set({ result }),

    setCurrentStep: (step: 'setup' | 'animating' | 'results') => set({ currentStep: step }),

    setIsAnimating: (isAnimating: boolean) => set({ isAnimating }),

    reset: () => set({
        config: null,
        result: null,
        currentStep: 'setup',
        isAnimating: false
    })
}));
