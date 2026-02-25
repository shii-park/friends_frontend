import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

const BattleResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUserData } = useUser();
  const result = location.state?.result || 'win';
  const rankPointDelta: number = location.state?.rankPointDelta ?? (result === 'win' ? 10 : -5);
  const coinReward: number = location.state?.coinReward ?? (result === 'win' ? 100 : 0);
  const stoneReward: number = location.state?.stoneReward ?? (result === 'win' ? 1 : 0);

  useEffect(() => {
    // 報酬はサーバーサイドで既に付与済みなのでデータをリフレッシュするだけ
    refreshUserData();
  }, []);

  return (
    <div className={`battle-result-page ${result}`}>
      <div className="result-container">
        <h1 className="result-title">{result === 'win' ? 'VICTORY' : 'DEFEAT'}</h1>

        <div className="rewards-section">
          <h2>バトル結果</h2>
          <div className="reward-item">
            <span className="reward-label">ランクポイント:</span>
            <span className="reward-value">{rankPointDelta >= 0 ? '+' : ''}{rankPointDelta} RP</span>
          </div>
          <div className="reward-item">
            <span className="reward-label">フリーコイン:</span>
            <span className="reward-value">+{coinReward} Coin</span>
          </div>
          <div className="reward-item">
            <span className="reward-label">ガチャ石:</span>
            <span className="reward-value">+{stoneReward} 個</span>
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
