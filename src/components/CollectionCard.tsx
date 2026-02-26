import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import type { CollectionEntry } from '../types/collection';

interface CollectionCardProps {
  entry: CollectionEntry;
  onClick?: () => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ entry, onClick }) => {
  const { card, state } = entry;
  const { base } = card;
  const isObtained = state === 'get';
  const isFound = state === 'find';
  const isUnknown = state === 'notFound';
  const isSSR = base.rarity === 'SSR';

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 15]);

  const springConfig = { damping: 20, stiffness: 150 };
  const springX = useSpring(rotateX, springConfig);
  const springY = useSpring(rotateY, springConfig);

  const holoX = useTransform(x, [-100, 100], ["0%", "100%"]);
  const holoY = useTransform(y, [-100, 100], ["0%", "100%"]);
  const holoOpacity = useTransform(x, [-100, 0, 100], [0.4, 0.1, 0.4]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isUnknown) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      C: '#a7b0a0', UC: '#baed82', R: '#11c9c3', SR: '#004ef5', SSR: '#f369ce',
    };
    return colors[rarity] || '#ccc';
  };

  const getImageUrl = (url: string) => {
    return new URL(`../assets/${url}`, import.meta.url).href;
  };

  return (
    <motion.div 
      className={`storage-card collection-card ${isUnknown ? 'unknown' : ''} ${!isObtained ? 'not-obtained' : ''} ${isSSR && isObtained ? 'ssr-card' : ''}`}
      style={{ 
        borderColor: !isObtained ? '#444' : getRarityColor(base.rarity),
        cursor: isUnknown ? 'default' : 'pointer',
        opacity: isUnknown ? 0.6 : 1,
        rotateX: springX,
        rotateY: springY,
        transformStyle: "preserve-3d",
        '--rarity-color': isObtained ? getRarityColor(base.rarity) : '#444',
      } as any}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={isUnknown ? undefined : onClick}
      whileHover={isUnknown ? {} : { scale: 1.05 }}
    >
      <div style={{ transform: "translateZ(20px)", position: 'relative', zIndex: 2 }}>
        <div className="card-image-container" style={{ position: 'relative' }}>
          {base.cardIcon ? (
            <img 
              src={getImageUrl(base.cardIcon)} 
              alt={base.cardName} 
              className="card-icon" 
              style={{ 
                filter: isObtained ? 'none' : 'brightness(0) contrast(1.2)',
                transition: 'filter 0.3s ease'
              }}
            />
          ) : (
            <div className="card-image-placeholder">?</div>
          )}
          {!isObtained && isFound && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center',
              background: 'rgba(0,0,0,0.4)', color: 'white', fontWeight: 900, fontSize: '0.8rem'
            }}>
              FIND
            </div>
          )}
        </div>
        <div className="card-info">
          <div className="card-name" style={{ color: !isObtained ? '#666' : 'inherit' }}>
            {!isObtained ? '???' : base.cardName}
          </div>
          {!isUnknown && (
            <div className="card-stats" style={{ fontSize: '0.7rem', color: '#888' }}>
              {base.rarity} | {base.cardKind === 1 ? 'Chara' : 'Equip'}
            </div>
          )}
        </div>
      </div>

      {isSSR && isObtained && (
        <motion.div 
          className="ssr-hologram"
          style={{
            backgroundPosition: useTransform(() => `${holoX.get()} ${holoY.get()}`),
            opacity: holoOpacity,
          }}
        />
      )}
      {isObtained && <div className="card-glare" />}
    </motion.div>
  );
};

export default CollectionCard;
