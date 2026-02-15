import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import gachaImage from '../assets/ガチャ.png';

const Gacha: React.FC = () => {
  const navigate = useNavigate();
  const { user, gachaStones, drawGacha, isLoading } = useUser();

  if (!user) return null;

  const handleGacha = async (count: number) => {
    if (gachaStones < count) {
      alert('石が足りません');
      return;
    }
    
    // ガチャ実行
    const results = await drawGacha(count);
    
    if (results && results.length > 0) {
      // 演出画面へ遷移（結果データを渡す）
      navigate('/gacha-effect', { state: { count, results, from: '/gacha' } });
    } else {
      alert('ガチャの実行に失敗しました');
    }
  };

  return (
    <div className="gacha-page">
      <header className="app-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/home', { state: { from: '/gacha' } })}>← 戻る</button>
        </div>
        <div className="header-center">
          <h1>ガチャ</h1>
        </div>
        <div className="header-right">
          <div className="header-stats-item">石: {gachaStones}</div>
        </div>
      </header>

      <main className="gacha-content">
        <div className="gacha-banner">
          <div className="gacha-banner-bg-text">TRY YOUR LUCK</div>
          <img src={gachaImage} alt="ガチャバナー" className="gacha-banner-image" />
        </div>

        <div className="gacha-actions">
          <div className="gacha-button-container">
            <button 
              className="gacha-button single" 
              onClick={() => handleGacha(1)}
              disabled={isLoading}
            >
              <span className="gacha-count">1回引く</span>
              <span className="gacha-cost">石 1個</span>
            </button>
            <button 
              className="gacha-button multi" 
              onClick={() => handleGacha(10)}
              disabled={isLoading}
            >
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
