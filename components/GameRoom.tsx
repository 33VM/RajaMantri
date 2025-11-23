import React from 'react';
import { motion } from 'framer-motion';
import { Player, GameState, GamePhase, Role } from '../types';
import { Card } from './Card';
import { MessageSquare, RefreshCw, Trophy } from 'lucide-react';

interface GameRoomProps {
  gameState: GameState;
  myId: string;
  isHost: boolean;
  onAction: (type: any, payload?: any) => void;
  onNextPhase: () => void;
}

export const GameRoom: React.FC<GameRoomProps> = ({ gameState, myId, isHost, onAction, onNextPhase }) => {
  const me = gameState.players.find(p => p.id === myId);
  const mantri = gameState.players.find(p => p.role === Role.MANTRI);
  const raja = gameState.players.find(p => p.role === Role.RAJA);

  const getCardDisplayRole = (player: Player) => {
     // If Result phase, show everything
     if (gameState.phase === GamePhase.RESULT) return player.role;
     
     // If I am this player, show my role
     if (player.id === myId) return player.role;
     
     // Everyone sees Raja
     if (player.role === Role.RAJA) return Role.RAJA;
     
     // In Guess phase, everyone usually knows who Mantri is (because Raja asked them)
     if (gameState.phase === GamePhase.GUESS && player.role === Role.MANTRI) return Role.MANTRI;
     
     // Otherwise hidden
     return null;
  };

  const handleCardClick = (player: Player) => {
    // Only Mantri can click during Guess phase
    if (gameState.phase === GamePhase.GUESS && me?.role === Role.MANTRI) {
        // Can't click self or Raja
        if (player.role !== Role.RAJA && player.role !== Role.MANTRI) {
             onAction('GUESS', { suspectId: player.id });
        }
    }
  };

  const isMyTurn = gameState.phase === GamePhase.GUESS && me?.role === Role.MANTRI;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
       
       {/* PHASE INDICATOR */}
       <div className="mb-8 text-center">
         {gameState.phase === GamePhase.REVEAL && (
             <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-3xl font-royal text-white mb-2">Check Your Role</h2>
                <p className="text-slate-400">Wait for the <span className="text-amber-400">Raja</span> to open court.</p>
                {isHost && (
                    <button 
                      onClick={onNextPhase}
                      className="mt-4 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-lg transition-all"
                    >
                        Open Court (Start Guessing)
                    </button>
                )}
             </motion.div>
         )}

         {gameState.phase === GamePhase.GUESS && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-3xl font-royal text-amber-100 mb-2">The Court is Open</h2>
                {isMyTurn ? (
                    <p className="text-xl text-indigo-400 font-bold animate-pulse">Select the CHOR!</p>
                ) : (
                    <p className="text-lg text-slate-300">
                        <span className="font-bold text-blue-400">{mantri?.name}</span> is identifying the Chor...
                    </p>
                )}
             </motion.div>
         )}

         {gameState.phase === GamePhase.RESULT && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 backdrop-blur-md shadow-2xl max-w-2xl mb-6">
                    {gameState.commentary ? (
                        <div className="flex gap-4 items-start">
                            <div className="p-3 bg-indigo-900/50 rounded-full mt-1">
                                <MessageSquare size={24} className="text-indigo-400"/>
                            </div>
                            <p className="text-lg italic text-slate-200 text-left">"{gameState.commentary}"</p>
                        </div>
                    ) : (
                         <div className="flex items-center gap-3 text-indigo-300">
                             <RefreshCw className="animate-spin" />
                             <span>Consulting the Royal Scribe...</span>
                         </div>
                    )}
                </div>
                {isHost && (
                    <button 
                      onClick={onNextPhase}
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg hover:shadow-indigo-500/30 transition-all"
                    >
                        Next Round
                    </button>
                )}
            </motion.div>
         )}
       </div>

       {/* CARD GRID */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-12">
          {gameState.players.map((p) => {
             const displayRole = getCardDisplayRole(p);
             const isRevealed = displayRole !== null;
             const isSelectable = isMyTurn && p.id !== myId && p.role !== Role.RAJA;
             
             return (
               <div key={p.id} className="flex flex-col items-center gap-4 relative">
                  <div className="relative">
                      <Card 
                        role={isRevealed ? p.role : null}
                        isRevealed={isRevealed}
                        playerName={p.name}
                        size="md"
                        selectable={isSelectable}
                        onClick={() => handleCardClick(p)}
                      />
                       {/* ME INDICATOR */}
                       {p.id === myId && (
                           <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg z-10">
                               YOU
                           </div>
                       )}
                       {/* RAJA INDICATOR (Always visible) */}
                       {p.role === Role.RAJA && gameState.phase !== GamePhase.LOBBY && (
                           <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-400 animate-bounce">
                               <Trophy size={20} fill="currentColor" />
                           </div>
                       )}
                  </div>
                  
                  {/* Status Badges */}
                  {isSelectable && (
                      <div className="text-xs font-bold text-indigo-300 bg-indigo-900/30 px-2 py-1 rounded border border-indigo-500/30">
                          Suspect
                      </div>
                  )}
               </div>
             );
          })}
       </div>

    </div>
  );
};