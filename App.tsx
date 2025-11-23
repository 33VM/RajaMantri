import React from 'react';
import { GamePhase } from './types';
import { ScoreBoard } from './components/ScoreBoard';
import { Lobby } from './components/Lobby';
import { GameRoom } from './components/GameRoom';
import { useMultiplayer } from './hooks/useMultiplayer';

export default function App() {
  const { 
    createRoom, 
    joinRoom, 
    gameState, 
    myId, 
    isHost, 
    roomCode, 
    error,
    startGame, // Used by Lobby start
    nextPhase,
    sendAction
  } = useMultiplayer();

  const handleLobbyStart = () => {
      // In the multiplayer hook, startGame distributes roles and sets phase to REVEAL
      sendAction('START_GAME');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      
      {/* Header */}
      <header className="p-4 md:p-6 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-50 backdrop-blur-md flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-3xl font-royal font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
            Raja Mantri
          </h1>
          <p className="text-xs text-slate-500 tracking-widest uppercase">Online Multiplayer</p>
        </div>
        {gameState.phase !== GamePhase.LOBBY && (
            <div className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-400 font-mono">
                Room: {roomCode}
            </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
           <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-900/30 rounded-full blur-3xl"></div>
           <div className="absolute top-40 -left-20 w-72 h-72 bg-violet-900/20 rounded-full blur-3xl"></div>
        </div>

        {error && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-xl z-50">
                {error}
            </div>
        )}

        {gameState.phase === GamePhase.LOBBY ? (
            <Lobby 
                onCreate={createRoom}
                onJoin={joinRoom}
                gameState={gameState}
                roomCode={roomCode}
                isHost={isHost}
                myId={myId}
                // Hook 'startGame' is called here via onCreate if Host and ready, 
                // but Lobby component needs to trigger it. 
                // We passed a modified onCreate to Lobby in App logic? No.
                // Let's modify Lobby usage slightly.
            />
        ) : (
            <GameRoom 
                gameState={gameState}
                myId={myId}
                isHost={isHost}
                onAction={sendAction}
                onNextPhase={nextPhase}
            />
        )}
      </main>

      {/* Scoreboard Footer */}
      {(gameState.phase !== GamePhase.LOBBY) && <ScoreBoard players={gameState.players} />}
    </div>
  );
}