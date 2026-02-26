import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { UserProvider } from './hooks/useUser';
import Title from './pages/Title';
import Home from './pages/Home';
import Storage from './pages/Storage';
import BattleSelect from './pages/BattleSelect';
import BattlePrepare from './pages/BattlePrepare';
import Battle from './pages/Battle';
import BattleResult from './pages/BattleResult';
import Collection from './pages/Collection';
import Gacha from './pages/Gacha';
import GachaEffect from './pages/GachaEffect';
import GachaResult from './pages/GachaResult';
import './App.css';

interface TransitionConfig {
  direction: number;
  type: 'vertical' | 'horizontal' | 'fade' | 'zoom';
}

// ページ遷移のアニメーション設定
const pageVariants: Variants = {
  initial: (custom: TransitionConfig) => ({
    y: custom.type === 'vertical' ? (custom.direction > 0 ? '100%' : custom.direction < 0 ? '-100%' : 0) : 0,
    x: custom.type === 'horizontal' ? (custom.direction > 0 ? '100%' : custom.direction < 0 ? '-100%' : 0) : 0,
    opacity: (custom.type === 'fade' || custom.type === 'zoom') ? 0 : 1,
    scale: custom.type === 'zoom' ? (custom.direction > 0 ? 0.5 : 1.5) : 1,
  }),
  animate: {
    y: 0,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  },
  exit: (custom: TransitionConfig) => ({
    y: custom.type === 'vertical' ? (custom.direction > 0 ? '-100%' : custom.direction < 0 ? '100%' : 0) : 0,
    x: custom.type === 'horizontal' ? (custom.direction > 0 ? '-100%' : custom.direction < 0 ? '100%' : 0) : 0,
    opacity: (custom.type === 'fade' || custom.type === 'zoom') ? 0 : 1,
    scale: custom.type === 'zoom' ? (custom.direction > 0 ? 1.5 : 0.5) : 1,
    transition: {
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  })
};

const PageTransition = ({ children, transitionConfig }: { children: React.ReactNode, transitionConfig: TransitionConfig }) => {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      custom={transitionConfig}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
      }}
    >
      {children}
    </motion.div>
  );
};

function AnimatedRoutes() {
  const location = useLocation();
  
  const getTransitionConfig = (): TransitionConfig => {
    const from = location.state?.from;
    const to = location.pathname;

    // 縦スライド: ホーム <-> ストレージ / 図鑑
    if (from === '/home' && (to === '/storage' || to === '/collection')) return { direction: 1, type: 'vertical' };
    if ((from === '/storage' || from === '/collection') && to === '/home') return { direction: -1, type: 'vertical' };

    // 横スライド: ホーム <-> バトル関連
    const battlePaths = ['/battle-select', '/battle-prepare', '/battle', '/battle-result'];
    if (from === '/home' && battlePaths.includes(to)) return { direction: 1, type: 'horizontal' };
    if (battlePaths.includes(from) && to === '/home') return { direction: -1, type: 'horizontal' };
    
    // バトル内での遷移（進む：右スライド、戻る：左スライド）
    if (battlePaths.includes(from) && battlePaths.includes(to)) {
      const fromIndex = battlePaths.indexOf(from);
      const toIndex = battlePaths.indexOf(to);
      return { direction: toIndex > fromIndex ? 1 : -1, type: 'horizontal' };
    }

    // ズーム: ホーム <-> ガチャ関連
    const gachaPaths = ['/gacha', '/gacha-effect', '/gacha-result'];
    if (from === '/home' && gachaPaths.includes(to)) return { direction: 1, type: 'zoom' };
    if (gachaPaths.includes(from) && to === '/home') return { direction: -1, type: 'zoom' };
    
    // ガチャ内での遷移もズーム
    if (gachaPaths.includes(from) && gachaPaths.includes(to)) return { direction: 1, type: 'zoom' };

    return { direction: 0, type: 'fade' };
  };

  const transitionConfig = getTransitionConfig();

  return (
    <AnimatePresence mode="popLayout" initial={false} custom={transitionConfig}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition transitionConfig={transitionConfig}><Title /></PageTransition>} />
        <Route path="/home" element={<PageTransition transitionConfig={transitionConfig}><Home /></PageTransition>} />
        
        {/* バトル関連 */}
        <Route path="/battle-select" element={<PageTransition transitionConfig={transitionConfig}><BattleSelect /></PageTransition>} />
        <Route path="/battle-prepare" element={<PageTransition transitionConfig={transitionConfig}><BattlePrepare /></PageTransition>} />
        <Route path="/battle" element={<PageTransition transitionConfig={transitionConfig}><Battle /></PageTransition>} />
        <Route path="/battle-result" element={<PageTransition transitionConfig={transitionConfig}><BattleResult /></PageTransition>} />
        
        {/* ストレージ関連 */}
        <Route path="/storage" element={<PageTransition transitionConfig={transitionConfig}><Storage /></PageTransition>} />
        <Route path="/collection" element={<PageTransition transitionConfig={transitionConfig}><Collection /></PageTransition>} />
        <Route path="/strage" element={<Navigate to="/storage" replace />} />
        
        {/* ガチャ関連 */}
        <Route path="/gacha" element={<PageTransition transitionConfig={transitionConfig}><Gacha /></PageTransition>} />
        <Route path="/gacha-effect" element={<PageTransition transitionConfig={transitionConfig}><GachaEffect /></PageTransition>} />
        <Route path="/gacha-result" element={<PageTransition transitionConfig={transitionConfig}><GachaResult /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
          <AnimatedRoutes />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
