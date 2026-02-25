import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GameCard from '../components/GameCard';
import type { Chara, Equip } from '../types/game';

const GachaResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const results: (Chara | Equip)[] = location.state?.results || [];

  return (
    <div className="gacha-result-page">
      <header className="gacha-result-header">
        <h1>ガチャ結果</h1>
      </header>

      <main className="gacha-result-content">
        <div className="result-grid">
          {results.length > 0 ? (
            results.map((item, index) => (
              <GameCard key={item.cardId + index} card={item} />
            ))
          ) : (
            <div className="empty-result" style={{ padding: '50px', background: 'white', borderRadius: '16px', color: '#333' }}>
              <p>結果が見つかりませんでした。</p>
            </div>
          )}
        </div>

        <div className="result-actions">
          <button className="back-to-home" onClick={() => navigate('/home', { state: { from: '/gacha-result' } })}>
            ホームに戻る
          </button>
          <button className="back-to-gacha" onClick={() => navigate('/gacha', { state: { from: '/gacha-result' } })}>
            もう一度引く
          </button>
        </div>
      </main>
    </div>
  );
};

export default GachaResult;
