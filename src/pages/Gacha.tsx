import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

const Gacha: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  if (!user) return null;

  const handleGacha = (count: number) => {
    // 石の消費チェック（本来はここで実装）
    // 演出画面へ遷移
    navigate('/gacha-effect', { state: { count } });
  };

  return (
    <div className="gacha-page">
      <header className="gacha-header">
        <button className="back-button" onClick={() => navigate('/home')}>← 戻る</button>
        <h1>ガチャ</h1>
        <div className="user-currency">
          <span>石: 10</span> {/* 石の管理を後で追加 */}
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
