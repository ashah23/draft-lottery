import { motion } from 'framer-motion';
import type { Team } from '@/types';

interface LotteryBallProps {
    team: Team;
    isSelected?: boolean;
    isRemoved?: boolean;
    delay?: number;
}

export function LotteryBall({ team, isSelected, isRemoved, delay = 0 }: LotteryBallProps) {
    const colors = [
        'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
        'bg-teal-500', 'bg-cyan-500', 'bg-lime-500', 'bg-rose-500'
    ];

    const colorClass = colors[team.id % colors.length];

    if (isRemoved) return null;

    return (
        <motion.div
            className={`w-20 h-20 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-sm shadow-xl relative`}
            animate={{
                y: isSelected ? [-100, -200] : [0, -10, 0],
                scale: isSelected ? [1, 1.3, 1.6] : [1, 1.1, 1],
                rotate: isSelected ? [0, 360] : [0, 5, -5, 0],
            }}
            transition={{
                duration: isSelected ? 2 : 3,
                delay,
                repeat: isSelected ? 0 : Infinity,
                ease: "easeInOut"
            }}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
        >
            <span className="text-sm text-center leading-tight font-bold">
                {team.name.length > 8 ? team.name.substring(0, 6) + '...' : team.name}
            </span>
            {isSelected && (
                <motion.div
                    className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                    animate={{ scale: [1, 1.5, 1], rotate: [0, 360] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                >
                    ⭐
                </motion.div>
            )}
        </motion.div>
    );
}