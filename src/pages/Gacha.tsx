import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

const Gacha: React.FC = () => {
  const navigate = useNavigate();
  const { user, gachaStones, drawGacha } = useUser();

  if (!user) return null;

  const handleGacha = (count: number) => {
    if (gachaStones < count) {
      alert('石が足りません');
      return;
    }
    
    // ガチャ実行
    const results = drawGacha(count);
    
    // 演出画面へ遷移（結果データを渡す）
    navigate('/gacha-effect', { state: { count, results } });
  };

  return (
    <div className="gacha-page">
      <header className="gacha-header">
        <button className="back-button" onClick={() => navigate('/home')}>← 戻る</button>
        <h1>ガチャ <small style={{ fontSize: '0.8rem', opacity: 0.5 }}>v1.0</small></h1>
        <div className="user-currency">
          <span>石: {gachaStones}</span>
        </div>
      </header>

      <main className="gacha-content">
        <div className="gacha-banner">
          <div className="banner-content">
            <h2>恒常ガチャ</h2>
            <p>強力なキャラクターと装備を手に入れよう！</p>
          </div>
        </div>

        <div className="gacha-actions">
          <div className="gacha-button-container">
            <button className="gacha-button single" onClick={() => handleGacha(1)}>
              <span className="gacha-count">1回引く</span>
              <span className="gacha-cost">石 1個</span>
            </button>
            <button className="gacha-button multi" onClick={() => handleGacha(10)}>
              <span className="gacha-count">10回引く</span>
              <span className="gacha-cost">石 10個</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Gacha;
