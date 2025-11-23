import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Scroll, Ghost, Shield, User } from 'lucide-react';
import { Role } from '../types';

interface CardProps {
  role?: Role | null;
  isRevealed: boolean;
  onClick?: () => void;
  playerName: string;
  size?: 'sm' | 'md' | 'lg';
  selectable?: boolean;
}

const RoleConfig = {
  [Role.RAJA]: {
    color: 'from-amber-400 to-yellow-600',
    icon: Crown,
    label: 'Raja',
    textColor: 'text-amber-100',
    description: '+1000 Points',
  },
  [Role.MANTRI]: {
    color: 'from-blue-500 to-indigo-700',
    icon: Scroll,
    label: 'Mantri',
    textColor: 'text-blue-100',
    description: 'Find the Chor!',
  },
  [Role.SIPAHI]: {
    color: 'from-green-500 to-emerald-700',
    icon: Shield,
    label: 'Sipahi',
    textColor: 'text-green-100',
    description: '+500 Points',
  },
  [Role.CHOR]: {
    color: 'from-rose-500 to-red-800',
    icon: Ghost,
    label: 'Chor',
    textColor: 'text-rose-100',
    description: 'Don\'t get caught!',
  },
};

export const Card: React.FC<CardProps> = ({ role, isRevealed, onClick, playerName, size = 'lg', selectable = false }) => {
  const config = role ? RoleConfig[role] : null;
  const Icon = config ? config.icon : User;

  const sizeClasses = size === 'lg' ? 'w-48 h-72' : size === 'md' ? 'w-32 h-48' : 'w-24 h-36';
  const iconSize = size === 'lg' ? 64 : size === 'md' ? 40 : 24;

  return (
    <div className={`relative ${sizeClasses} perspective-1000 cursor-pointer group`} onClick={onClick}>
      <motion.div
        className={`w-full h-full relative preserve-3d transition-transform duration-500`}
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Back of Card (Hidden) */}
        <div className={`absolute w-full h-full backface-hidden rounded-xl shadow-2xl bg-gradient-to-br from-slate-700 to-slate-900 border-4 border-slate-600 flex flex-col items-center justify-center p-4 ${selectable ? 'group-hover:border-indigo-400 group-hover:shadow-indigo-500/50' : ''}`}>
          <div className="w-full h-full border-2 border-slate-500 border-dashed rounded-lg flex flex-col items-center justify-center opacity-50 overflow-hidden">
             {/* Large initial as placeholder */}
             <span className="font-royal text-6xl text-slate-600 font-bold opacity-20 select-none">
                {playerName.charAt(0).toUpperCase()}
             </span>
          </div>
          <div className="absolute bottom-6 font-bold text-white font-royal truncate max-w-full px-2 text-lg drop-shadow-md">
            {playerName}
          </div>
        </div>

        {/* Front of Card (Revealed) */}
        <div 
          className={`absolute w-full h-full backface-hidden rounded-xl shadow-2xl bg-gradient-to-br ${config?.color || 'from-gray-700 to-gray-900'} flex flex-col items-center justify-center p-4 text-white rotate-y-180 border-4 border-white/20`}
          style={{ transform: 'rotateY(180deg)' }}
        >
           <div className="absolute top-2 left-2 opacity-50">
             <Icon size={20} />
           </div>
           <div className="absolute bottom-2 right-2 opacity-50 rotate-180">
             <Icon size={20} />
           </div>

           <div className="flex flex-col items-center gap-4">
             <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm shadow-inner">
                <Icon size={iconSize} className="drop-shadow-lg" />
             </div>
             <div className="text-center">
               <h3 className="font-royal font-bold text-xl md:text-2xl drop-shadow-md">{config?.label}</h3>
               {size !== 'sm' && (
                 <div className="mt-2">
                    <p className={`text-xs font-medium opacity-90 ${config?.textColor}`}>
                        {config?.description}
                    </p>
                    <p className="text-sm font-bold mt-2 text-white border-t border-white/20 pt-1">
                        {playerName}
                    </p>
                 </div>
               )}
             </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
};