import { useEffect, useState, useRef, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { Player, GameState, GamePhase, NetworkMessage, Role, POINTS, MessageType } from '../types';
import { generateGameCommentary } from '../services/geminiService';

const APP_PREFIX = 'rmcs-game-v1-';

export const useMultiplayer = () => {
  const [myId, setMyId] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    phase: GamePhase.LOBBY,
    players: [],
    mantriId: '',
    commentary: '',
    winner: null,
  });
  const [roomCode, setRoomCode] = useState<string>('');
  const [error, setError] = useState<string>('');

  const peerRef = useRef<Peer | null>(null);
  const hostConnRef = useRef<DataConnection | null>(null);

  // --- Initialization ---

  const initializePeer = useCallback((id?: string) => {
    const peer = new Peer(id);
    
    peer.on('open', (newId) => {
      setMyId(newId);
      if (id) {
         // If we provided an ID, we are likely the host trying to create a specific room
         setRoomCode(id.replace(APP_PREFIX, ''));
      }
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      if (err.type === 'unavailable-id') {
        setError('Room code taken. Try another.');
      } else {
        setError('Connection error. Please refresh.');
      }
    });

    peerRef.current = peer;
    return peer;
  }, []);

  const createRoom = (name: string) => {
    // Generate a short 4-char code
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    const fullId = `${APP_PREFIX}${code}`;
    
    const peer = initializePeer(fullId);
    setIsHost(true);
    
    // Add self to players
    setGameState(prev => ({
      ...prev,
      players: [{
        id: fullId,
        name,
        role: null,
        score: 0,
        avatarSeed: Math.random().toString(36),
        isHost: true
      }]
    }));

    peer.on('connection', (conn) => {
      conn.on('open', () => {
        setupHostConnection(conn);
      });
    });
  };

  const joinRoom = (name: string, code: string) => {
    const peer = initializePeer(); // Let PeerJS assign a random ID for client
    const hostId = `${APP_PREFIX}${code.toUpperCase()}`;
    
    peer.on('open', (myPeerId) => {
        const conn = peer.connect(hostId);
        
        conn.on('open', () => {
            hostConnRef.current = conn;
            // Send JOIN message
            conn.send({
                type: 'JOIN',
                payload: { name, id: myPeerId }
            } as NetworkMessage);
        });

        conn.on('data', (data: any) => {
            handleClientMessage(data as NetworkMessage);
        });

        conn.on('close', () => {
           setError("Host disconnected");
        });

        conn.on('error', () => {
            setError("Could not connect to host");
        });
    });
  };

  // --- Host Logic ---

  const setupHostConnection = (conn: DataConnection) => {
    setConnections(prev => [...prev, conn]);

    conn.on('data', (data: any) => {
      const msg = data as NetworkMessage;
      handleHostMessage(msg, conn);
    });
    
    conn.on('close', () => {
       // Remove player
       setConnections(prev => prev.filter(c => c.peer !== conn.peer));
       setGameState(prev => {
         const newPlayers = prev.players.filter(p => p.id !== conn.peer);
         const newState = { ...prev, players: newPlayers };
         broadcastState(newState);
         return newState;
       });
    });
  };

  const handleHostMessage = (msg: NetworkMessage, conn: DataConnection) => {
    if (msg.type === 'JOIN') {
      const { name, id } = msg.payload;
      setGameState(prev => {
        if (prev.players.find(p => p.id === id)) return prev; // Already joined
        if (prev.players.length >= 4) {
            // Room full (Optional: send error back)
            return prev; 
        }
        
        const newPlayer: Player = {
            id,
            name,
            role: null,
            score: 0,
            avatarSeed: Math.random().toString(36),
            isHost: false
        };
        const newState = { ...prev, players: [...prev.players, newPlayer] };
        broadcastState(newState); // Send full state to everyone
        return newState;
      });
    } else if (msg.type === 'GUESS') {
       processGuess(msg.payload.suspectId);
    } else if (msg.type === 'RESTART') {
        startGame(); // Client requested restart (if allowed)
    }
  };

  const broadcastState = (state: GameState) => {
    const msg: NetworkMessage = { type: 'STATE_UPDATE', payload: state };
    // Send to all clients
    connections.forEach(conn => {
        if(conn.open) conn.send(msg);
    });
    // Ensure host updates local state if called from outside setState
    setGameState(state);
  };

  const startGame = () => {
    if (gameState.players.length !== 4) return;

    const roles = [Role.RAJA, Role.MANTRI, Role.CHOR, Role.SIPAHI]
        .sort(() => Math.random() - 0.5);

    const newPlayers = gameState.players.map((p, i) => ({
        ...p,
        role: roles[i]
    }));
    
    const mantri = newPlayers.find(p => p.role === Role.MANTRI);

    const newState: GameState = {
        ...gameState,
        phase: GamePhase.REVEAL,
        players: newPlayers,
        mantriId: mantri ? mantri.id : '',
        commentary: '',
        winner: null,
    };

    broadcastState(newState);

    // Auto transition to GUESS after a delay to let people see their cards
    // Or let Raja/Host click "Start Guessing"
    // For simplicity, let's auto transition after 5 seconds or add a button?
    // Let's add a button for Host to "Open Court"
  };
  
  const nextPhase = () => {
      if (gameState.phase === GamePhase.REVEAL) {
          const newState = { ...gameState, phase: GamePhase.GUESS };
          broadcastState(newState);
      } else if (gameState.phase === GamePhase.RESULT) {
          startGame();
      }
  }

  const processGuess = async (suspectId: string) => {
     const suspect = gameState.players.find(p => p.id === suspectId);
     const mantri = gameState.players.find(p => p.role === Role.MANTRI);
     const chor = gameState.players.find(p => p.role === Role.CHOR);

     if (!suspect || !mantri || !chor) return;

     const isCorrect = suspect.role === Role.CHOR;
     const winnerRole = isCorrect ? Role.MANTRI : Role.CHOR;

     // Update Scores
     const updatedPlayers = gameState.players.map(p => {
         let roundScore = 0;
         if (p.role === Role.RAJA) roundScore = POINTS[Role.RAJA];
         if (p.role === Role.SIPAHI) roundScore = POINTS[Role.SIPAHI];
         if (p.role === Role.MANTRI) roundScore = isCorrect ? POINTS[Role.MANTRI] : 0;
         if (p.role === Role.CHOR) roundScore = isCorrect ? POINTS[Role.CHOR] : 800;
         return { ...p, score: p.score + roundScore };
     });

     // Optimistic update
     const processingState: GameState = {
         ...gameState,
         players: updatedPlayers,
         phase: GamePhase.RESULT,
         winner: winnerRole,
         commentary: "The Royal Scribe is observing..."
     };
     broadcastState(processingState);

     // Get AI Commentary
     const commentary = await generateGameCommentary(updatedPlayers, winnerRole, mantri.name, chor.name);
     
     const finalState = {
         ...processingState,
         commentary
     };
     broadcastState(finalState);
  };


  // --- Client Logic ---

  const handleClientMessage = (msg: NetworkMessage) => {
      if (msg.type === 'STATE_UPDATE') {
          setGameState(msg.payload);
      }
  };

  const sendAction = (type: MessageType, payload?: any) => {
      if (isHost) {
          // If host performs action locally
          if (type === 'GUESS') processGuess(payload.suspectId);
          if (type === 'RESTART') startGame();
          if (type === 'START_GAME') startGame();
      } else {
          hostConnRef.current?.send({ type, payload } as NetworkMessage);
      }
  };

  return {
    createRoom,
    joinRoom,
    gameState,
    myId,
    isHost,
    roomCode,
    error,
    startGame,
    nextPhase,
    sendAction
  };
};