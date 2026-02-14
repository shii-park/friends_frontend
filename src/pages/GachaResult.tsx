import React from 'react';
import { useNavigate } from 'react-router-dom';

const GachaResult: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="gacha-result-page">
      <header className="gacha-result-header">
        <h1>ガチャ結果</h1>
      </header>

      <main className="gacha-result-content">
        <div className="result-grid">
          {/* 結果の表示（モック） */}
          <div className="empty-result" style={{ padding: '50px', background: 'white', borderRadius: '16px', color: '#333' }}>
            <p>結果を表示するには、ガチャ実行ロジックの実装が必要です。</p>
          </div>
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
