import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

const BattleResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateStats } = useUser();
  const result = location.state?.result || 'win'; // 'win' or 'lose'

  // 報酬設定 (docs/バトル.md に基づく)
  const rewards = {
    rp: result === 'win' ? 10 : 0,
    coin: result === 'win' ? 100 : 0,
    stone: result === 'win' ? 1 : 0,
  };

  useEffect(() => {
    if (result === 'win') {
      // 実際には石の更新メソッドも必要だが、現在はupdateStatsでRPとコインのみ更新
      updateStats(rewards.rp, rewards.coin);
    }
  }, [result]);

  return (
    <div className={`battle-result-page ${result}`}>
      <div className="result-container">
        <h1 className="result-title">{result === 'win' ? 'VICTORY' : 'DEFEAT'}</h1>
        
        <div className="rewards-section">
          <h2>獲得報酬</h2>
          <div className="reward-item">
            <span className="reward-label">ランクポイント:</span>
            <span className="reward-value">+{rewards.rp} RP</span>
          </div>
          <div className="reward-item">
            <span className="reward-label">フリーコイン:</span>
            <span className="reward-value">+{rewards.coin} Coin</span>
          </div>
          <div className="reward-item">
            <span className="reward-label">ガチャ石:</span>
            <span className="reward-value">+{rewards.stone} 個</span>
          </div>
        </div>

        <div className="result-actions">
          <button className="home-button" onClick={() => navigate('/home', { state: { from: '/battle-result' } })}>
            ホームへ戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default BattleResult;
