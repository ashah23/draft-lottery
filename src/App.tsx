import { useDraftStore } from './store/useDraftStore';
import SetupForm from './components/SetupForm';
import LotteryMachine from './components/LotteryMachine';
import DraftResults from './components/DraftResults';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Zap } from 'lucide-react';

function App() {
  const { currentStep } = useDraftStore();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'setup':
        return <SetupForm />;
      case 'animating':
        return <LotteryMachine />;
      case 'results':
        return <DraftResults />;
      default:
        return <SetupForm />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-orange-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-cyan-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <motion.header
        className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center space-x-4">
            <motion.div
              className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-2xl">🏈</span>
            </motion.div>
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Draft Lottery Generator
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Create fair and exciting draft lotteries for your fantasy league
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Progress Indicator */}
      <motion.div
        className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-b border-border/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 'setup', label: 'Setup', icon: <Zap className="w-4 h-4" /> },
              { step: 'animating', label: 'Drawing', icon: <Sparkles className="w-4 h-4" /> },
              { step: 'results', label: 'Results', icon: <Trophy className="w-4 h-4" /> }
            ].map((item, index) => {
              const isActive = currentStep === item.step;
              const isCompleted = ['setup', 'animating', 'results'].indexOf(currentStep) > index;

              return (
                <div key={item.step} className="flex items-center space-x-2">
                  <motion.div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-110'
                      : isCompleted
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-muted text-muted-foreground border-muted'
                      }`}
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                  >
                    {isCompleted ? '✓' : item.icon}
                  </motion.div>
                  <span className={`text-sm font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                    }`}>
                    {item.label}
                  </span>
                  {index < 2 && (
                    <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-muted'
                      }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="relative py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative"
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <motion.footer
        className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-t border-border/50 mt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <span>Built with</span>
              <motion.span
                className="font-semibold text-primary"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                React
              </motion.span>
              <span>•</span>
              <motion.span
                className="font-semibold text-primary"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                TypeScript
              </motion.span>
              <span>•</span>
              <motion.span
                className="font-semibold text-primary"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                Framer Motion
              </motion.span>
              <span>•</span>
              <motion.span
                className="font-semibold text-primary"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              >
                Tailwind CSS
              </motion.span>
            </div>
            <p className="text-sm text-muted-foreground">
              Create fair and exciting draft lotteries for your league
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default App;