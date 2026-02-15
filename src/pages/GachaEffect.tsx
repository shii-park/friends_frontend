import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GachaEffect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const count = location.state?.count || 1;
  const results = location.state?.results || [];

  useEffect(() => {
    // 演出をシミュレーション（3秒後に結果画面へ）
    const timer = setTimeout(() => {
      navigate('/gacha-result', { state: { count, results, from: '/gacha-effect' } });
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate, count, results]);

  return (
    <div className="gacha-effect-page">
      <div className="effect-animation">
        <div className="crystal"></div>
        <h2 className="effect-text">召喚中...</h2>
      </div>
    </div>
  );
};

export default GachaEffect;
