import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useDraftStore } from '@/store/useDraftStore';
import { Layers, CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';
import type { DraftStep } from '@/types';

export default function DraftSteps() {
    const { currentStep, setCurrentStep, reset } = useDraftStore();

    const steps: { id: DraftStep; label: string; description: string; }[] = [
        { id: 'setup', label: 'Setup Teams', description: 'Configure lottery and playoff teams' },
        { id: 'probability', label: 'Set Probabilities', description: 'Assign lottery chances' },
        { id: 'results', label: 'View Results', description: 'See final draft order' }
    ];

    const currentStepIndex = steps.findIndex(step => step.id === currentStep);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    const goToStep = (stepId: DraftStep) => {
        if (stepId === 'setup') {
            reset();
        }
        setCurrentStep(stepId);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card className="border-0 shadow-xl bg-background/90 backdrop-blur supports-backdrop-filter:backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-3xl text-center flex items-center justify-center gap-2">
                        <Layers className="w-8 h-8 text-primary" />
                        Draft Progress
                    </CardTitle>
                    <CardDescription className="text-center">
                        Track your progress through the draft lottery process
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <p className="text-sm text-muted-foreground text-center">
                            Step {currentStepIndex + 1} of {steps.length}
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="space-y-4">
                        {steps.map((step, index) => {
                            const isComplete = index < currentStepIndex;
                            const isCurrent = index === currentStepIndex;

                            return (
                                <motion.div
                                    key={step.id}
                                    className={`flex items-center justify-between p-4 rounded-lg ${isCurrent
                                        ? 'bg-linear-to-r from-primary/10 to-primary/5 border border-primary/20'
                                        : isComplete
                                            ? 'bg-muted/80 border border-muted-foreground/20'
                                            : 'bg-muted/50 border border-muted-foreground/10'
                                        }`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${isCurrent
                                                ? 'bg-primary text-primary-foreground'
                                                : isComplete
                                                    ? 'bg-muted-foreground/80 text-background'
                                                    : 'bg-muted-foreground/40 text-background/90'
                                                }`}
                                        >
                                            {isComplete ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : (
                                                <span className="font-bold">{index + 1}</span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold">{step.label}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {step.description}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant={isCurrent ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => goToStep(step.id)}
                                        disabled={index > currentStepIndex}
                                    >
                                        {isComplete ? (
                                            <>
                                                Review
                                                <RotateCcw className="w-4 h-4 ml-2" />
                                            </>
                                        ) : isCurrent ? (
                                            <>
                                                Continue
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        ) : (
                                            'Not Available'
                                        )}
                                    </Button>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Summary */}
                    <div className="pt-6 border-t">
                        <p className="text-center text-sm text-muted-foreground">
                            {currentStep === 'setup'
                                ? 'Start by configuring your teams'
                                : currentStep === 'probability'
                                    ? 'Set the lottery probabilities for each team'
                                    : 'Review your final draft order'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}