import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Chara, Equip } from '../types/game';

const GachaResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const results: (Chara | Equip)[] = location.state?.results || [];

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      C: '#a7b0a0', UC: '#baed82', R: '#11c9c3', SR: '#004ef5', SSR: '#f369ce',
    };
    return colors[rarity] || '#ccc';
  };

  return (
    <div className="gacha-result-page">
      <header className="gacha-result-header">
        <h1>ガチャ結果</h1>
      </header>

      <main className="gacha-result-content">
        <div className="result-grid">
          {results.length > 0 ? (
            results.map((item, index) => (
              <div 
                key={item.cardId + index} 
                className="storage-card"
                style={{ borderColor: getRarityColor(item.rarity) }}
              >
                <div className="card-image-placeholder">
                  {'charaId' in item ? 'Chara' : 'Equip'}
                </div>
                <div className="card-info">
                  <div className="card-name">{item.name}</div>
                  <div className="card-level">Lv.{item.level}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-result" style={{ padding: '50px', background: 'white', borderRadius: '16px', color: '#333' }}>
              <p>結果が見つかりませんでした。</p>
            </div>
          )}
        </div>

        <div className="result-actions">
          <button className="back-to-home" onClick={() => navigate('/home')}>
            ホームに戻る
          </button>
          <button className="back-to-gacha" onClick={() => navigate('/gacha')}>
            もう一度引く
          </button>
        </div>
      </main>
    </div>
  );
};

export default GachaResult;
