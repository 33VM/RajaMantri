import React from 'react';
import { Player } from '../types';
import { Trophy } from 'lucide-react';

interface ScoreBoardProps {
  players: Player[];
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ players }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full bg-slate-800/50 border-t border-slate-700 backdrop-blur-md p-4 mt-auto">
       <div className="max-w-4xl mx-auto">
         <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} className="text-amber-400" />
            <h3 className="font-royal text-sm uppercase tracking-widest text-slate-400">Leaderboard</h3>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {sortedPlayers.map((p, i) => (
             <div key={p.id} className="bg-slate-700/50 rounded-lg p-3 flex flex-col relative overflow-hidden border border-slate-600/50">
               {i === 0 && <div className="absolute top-0 right-0 p-1 bg-amber-500 text-amber-900 rounded-bl-lg"><Trophy size={12}/></div>}
               <span className="text-xs text-slate-400 font-bold uppercase truncate">{p.name}</span>
               <span className="text-xl font-royal text-indigo-300">{p.score}</span>
             </div>
           ))}
         </div>
       </div>
    </div>
  );
};