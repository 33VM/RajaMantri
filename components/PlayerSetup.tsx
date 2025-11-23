import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Play } from 'lucide-react';

interface PlayerSetupProps {
  onStart: (names: string[]) => void;
}

export const PlayerSetup: React.FC<PlayerSetupProps> = ({ onStart }) => {
  const [names, setNames] = useState<string[]>(['', '', '', '']);

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const isReady = names.every((n) => n.trim().length > 0);

  const placeholders = ["Player 1 (e.g., Aarav)", "Player 2 (e.g., Vihaan)", "Player 3 (e.g., Diya)", "Player 4 (e.g., Ananya)"];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-md mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-slate-700"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 bg-indigo-600 rounded-lg shadow-lg">
             <Users size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-royal text-white">Enter Players</h2>
        </div>

        <div className="space-y-4">
          {names.map((name, index) => (
            <div key={index} className="relative group">
               <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wider">Player {index + 1}</label>
               <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                placeholder={placeholders[index]}
                className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
               />
            </div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!isReady}
          onClick={() => isReady && onStart(names)}
          className={`w-full mt-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
            isReady 
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/25' 
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Play size={20} fill={isReady ? "currentColor" : "none"} />
          Start Game
        </motion.button>
      </motion.div>
    </div>
  );
};