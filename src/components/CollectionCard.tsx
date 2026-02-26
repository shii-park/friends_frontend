import React from 'react';
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
    <div 
      className={`storage-card collection-card ${isUnknown ? 'unknown' : ''} ${!isObtained ? 'not-obtained' : ''}`}
      style={{ 
        borderColor: !isObtained ? '#444' : getRarityColor(base.rarity),
        cursor: isUnknown ? 'default' : 'pointer',
        opacity: isUnknown ? 0.6 : 1
      }}
      onClick={isUnknown ? undefined : onClick}
    >
      <div className="card-image-container" style={{ position: 'relative' }}>
        {base.cardIcon ? (
          <img 
            src={getImageUrl(base.cardIcon)} 
            alt={base.cardName} 
            className="card-icon" 
            style={{ 
              filter: isObtained ? 'none' : 'brightness(0) contrast(1.2)', // 取得してなければシルエット
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
  );
};

export default CollectionCard;
