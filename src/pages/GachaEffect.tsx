import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const GachaEffect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const count = location.state?.count || 1;
  const results = location.state?.results || [];
  
  const [phase, setPhase] = useState<'charge' | 'upgrade' | 'flash' | 'finish'>('charge');
  const hasSSR = results.some((r: any) => r.rarity === 'SSR');

  useEffect(() => {
    // 演出シーケンス
    const timer1 = setTimeout(() => setPhase('upgrade'), 1500); // 昇格演出開始
    const timer2 = setTimeout(() => setPhase('flash'), 3500);   // 白光
    const timer3 = setTimeout(() => {
      navigate('/gacha-result', { state: { count, results, from: '/gacha-effect' } });
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate, count, results]);

  // パーティクルの生成（簡易版）
  const particles = Array.from({ length: 20 });

  return (
    <div className="gacha-effect-page">
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div 
            className="gacha-bg-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      <div className="crystal-container">
        {/* エネルギーリング */}
        <motion.div 
          className={`energy-ring ${phase !== 'charge' && hasSSR ? 'ssr' : ''}`}
          animate={{ 
            scale: phase === 'charge' ? [2, 0.8] : [1, 1.5],
            opacity: phase === 'charge' ? [0, 1] : [1, 0]
          }}
          transition={{ duration: 1.5, repeat: phase === 'charge' ? Infinity : 0 }}
        />

        {/* メインクリスタル */}
        <motion.div 
          className={`crystal ${phase !== 'charge' && hasSSR ? 'ssr' : ''}`}
          initial={{ scale: 0, rotate: 0 }}
          animate={{ 
            scale: phase === 'flash' ? 10 : 1,
            rotate: 360,
          }}
          transition={{ 
            scale: { duration: phase === 'flash' ? 0.5 : 0.8 },
            rotate: { duration: 3, repeat: Infinity, ease: "linear" }
          }}
        />

        {/* パーティクル（収束/拡散） */}
        {particles.map((_, i) => (
          <motion.div
            key={i}
            className={`particle ${phase !== 'charge' && hasSSR ? 'ssr' : ''}`}
            initial={{ 
              x: Math.cos(i) * 300, 
              y: Math.sin(i) * 300,
              opacity: 0 
            }}
            animate={phase === 'charge' ? {
              x: 0,
              y: 0,
              opacity: [0, 1, 0],
            } : {
              x: Math.cos(i) * 500,
              y: Math.sin(i) * 500,
              opacity: [1, 0],
            }}
            transition={{ 
              duration: phase === 'charge' ? 1 : 0.5, 
              repeat: phase === 'charge' ? Infinity : 0,
              delay: i * 0.05 
            }}
          />
        ))}
      </div>

      <motion.h2 
        className="effect-text"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {phase === 'charge' ? 'エネルギー充填中...' : hasSSR ? '極稀有反応アリ！' : '召喚準備完了'}
      </motion.h2>
    </div>
  );
};

export default GachaEffect;
