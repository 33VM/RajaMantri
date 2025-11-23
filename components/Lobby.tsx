import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Play, Copy, Wifi } from 'lucide-react';
import { GameState } from '../types';

interface LobbyProps {
  onCreate: (name: string) => void;
  onJoin: (name: string, code: string) => void;
  gameState: GameState;
  roomCode: string;
  isHost: boolean;
  myId: string;
}

export const Lobby: React.FC<LobbyProps> = ({ onCreate, onJoin, gameState, roomCode, isHost, myId }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'join'>('menu');

  const joined = gameState.players.some(p => p.id === myId) || (isHost && gameState.players.length > 0);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
  };

  if (joined) {
    // WAITING ROOM
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-royal text-amber-100">Royal Lobby</h2>
          {roomCode && (
             <div className="mt-4 flex flex-col items-center">
                <span className="text-xs text-slate-400 uppercase tracking-widest">Room Code</span>
                <div 
                  onClick={copyCode}
                  className="flex items-center gap-2 bg-indigo-900/50 px-6 py-2 rounded-lg border border-indigo-500/30 cursor-pointer hover:bg-indigo-900/80 transition-colors mt-1"
                >
                    <span className="text-3xl font-mono font-bold text-white tracking-widest">{roomCode}</span>
                    <Copy size={16} className="text-indigo-400" />
                </div>
             </div>
          )}
        </div>

        <div className="space-y-3 mb-8">
           <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase px-2">
              <span>Players ({gameState.players.length}/4)</span>
              <span>Status</span>
           </div>
           {gameState.players.map((p) => (
             <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={p.id} 
                className={`flex items-center justify-between p-3 rounded-lg ${p.id === myId ? 'bg-indigo-600/20 border border-indigo-500/50' : 'bg-slate-700/50'}`}
             >
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-xs font-bold">
                     {p.name.charAt(0)}
                   </div>
                   <span className={p.id === myId ? 'text-indigo-200 font-bold' : 'text-slate-200'}>
                     {p.name} {p.id === myId && '(You)'}
                   </span>
                </div>
                {p.isHost && <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded">HOST</span>}
             </motion.div>
           ))}
           {Array.from({ length: 4 - gameState.players.length }).map((_, i) => (
              <div key={`empty-${i}`} className="p-3 rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-sm">
                 Waiting for player...
              </div>
           ))}
        </div>

        {isHost ? (
             <button
                onClick={() => onCreate('')} // Trigger start game (reusing prop for simplicity, logic handled in parent)
                disabled={gameState.players.length !== 4}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    gameState.players.length === 4
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
            >
                Start Game
            </button>
        ) : (
            <div className="text-center text-slate-400 animate-pulse">
                Waiting for host to start...
            </div>
        )}
      </div>
    );
  }

  // MENU
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-slate-700"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 bg-indigo-600 rounded-lg shadow-lg">
             <Wifi size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-royal text-white">Online Play</h2>
        </div>

        <div className="space-y-4">
             <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wider">Your Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
             </div>

             {mode === 'join' && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wider mt-2">Room Code</label>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="ABCD"
                        maxLength={4}
                        className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-4 py-3 text-white font-mono tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                    />
                 </motion.div>
             )}

             <div className="pt-4 space-y-3">
                 {mode === 'menu' ? (
                     <>
                        <button
                            onClick={() => { if(name) onCreate(name); }}
                            disabled={!name}
                            className={`w-full py-3 rounded-lg font-bold transition-all ${name ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-700 text-slate-500'}`}
                        >
                            Create Room
                        </button>
                        <button
                            onClick={() => setMode('join')}
                            className="w-full py-3 rounded-lg font-bold bg-slate-700 hover:bg-slate-600 text-slate-200 transition-all"
                        >
                            Join Room
                        </button>
                     </>
                 ) : (
                    <>
                        <button
                            onClick={() => { if(name && code) onJoin(name, code); }}
                            disabled={!name || code.length !== 4}
                            className={`w-full py-3 rounded-lg font-bold transition-all ${name && code.length === 4 ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-700 text-slate-500'}`}
                        >
                            Enter Room
                        </button>
                        <button
                             onClick={() => setMode('menu')}
                             className="w-full py-2 text-sm text-slate-400 hover:text-white"
                        >
                            Back
                        </button>
                    </>
                 )}
             </div>
        </div>
      </motion.div>
    </div>
  );
};