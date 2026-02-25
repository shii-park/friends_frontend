import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import type { Chara, Equip } from '../types/game';

interface GameCardProps {
  card: Chara | Equip;
  onClick?: () => void;
  isMini?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ card, onClick, isMini = false }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  const springConfig = { damping: 20, stiffness: 150 };
  const springX = useSpring(rotateX, springConfig);
  const springY = useSpring(rotateY, springConfig);

  const holoX = useTransform(x, [-100, 100], ["0%", "100%"]);
  const holoY = useTransform(y, [-100, 100], ["0%", "100%"]);
  const holoOpacity = useTransform(x, [-100, 0, 100], [0.4, 0.1, 0.4]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
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

  const isSSR = card.rarity === 'SSR';
  const isChara = 'charaId' in card;

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      C: '#a7b0a0', UC: '#baed82', R: '#11c9c3', SR: '#004ef5', SSR: '#f369ce',
    };
    return colors[rarity] || '#ccc';
  };

  const rarityColor = getRarityColor(card.rarity);

  const getImageUrl = (url: string) => {
    return new URL(`../assets/${url}`, import.meta.url).href;
  };

  return (
    <motion.div
      className={`game-card-wrapper ${isMini ? 'mini' : ''} ${isSSR ? 'ssr-wrapper' : ''}`}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <motion.div
        className={`storage-card ${isSSR ? 'ssr-card' : ''} ${isChara ? 'chara-card' : 'equip-card'}`}
        style={{
          rotateX: springX,
          rotateY: springY,
          transformStyle: "preserve-3d",
          borderColor: rarityColor,
          '--rarity-color': rarityColor,
        } as any}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div style={{ transform: "translateZ(30px)", position: 'relative', zIndex: 2 }}>
          <div className="card-image-container">
            {card.cardIconUrl ? (
              <img src={getImageUrl(card.cardIconUrl)} alt={card.name} className="card-icon" />
            ) : (
              <div className="card-image-placeholder">
                {isChara ? 'Chara' : 'Equip'}
              </div>
            )}
          </div>
          <div className="card-info">
            <div className="card-name">{card.name}</div>
            <div className="card-level">Lv.{card.level}</div>
            <div className="card-stats">
              {isChara ? (
                <>
                  <span>HP: {(card as Chara).hp}</span>
                  <span>ATK: {(card as Chara).atk}</span>
                  <span>TECH: {(card as Chara).tech}</span>
                </>
              ) : (
                <>
                  <span>HP: +{(card as Equip).bonusHp}</span>
                  <span>ATK: +{(card as Equip).bonusAtk}</span>
                  <span>TECH: +{(card as Equip).bonusTech}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {isSSR && (
          <motion.div 
            className="ssr-hologram"
            style={{
              backgroundPosition: useTransform(() => `${holoX.get()} ${holoY.get()}`),
              opacity: holoOpacity,
            }}
          />
        )}
        <div className="card-glare" />
      </motion.div>
    </motion.div>
  );
};

export default GameCard;
