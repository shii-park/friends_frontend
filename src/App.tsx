import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './hooks/useUser';
import Title from './pages/Title';
import Home from './pages/Home';
import Storage from './pages/Storage';
import BattleSelect from './pages/BattleSelect';
import BattlePrepare from './pages/BattlePrepare';
import Battle from './pages/Battle';
import BattleResult from './pages/BattleResult';
import Gacha from './pages/Gacha';
import GachaEffect from './pages/GachaEffect';
import GachaResult from './pages/GachaResult';
import './App.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Title />} />
          <Route path="/home" element={<Home />} />
          
          {/* バトル関連 */}
          <Route path="/battle-select" element={<BattleSelect />} />
          <Route path="/battle-prepare" element={<BattlePrepare />} />
          <Route path="/battle" element={<Battle />} />
          <Route path="/battle-result" element={<BattleResult />} />
          
          {/* ストレージ関連 (ドキュメントの/strageと一般的な/storage両方に対応) */}
          <Route path="/storage" element={<Storage />} />
          <Route path="/strage" element={<Navigate to="/storage" replace />} />
          
          {/* ガチャ関連 */}
          <Route path="/gacha" element={<Gacha />} />
          <Route path="/gacha-effect" element={<GachaEffect />} />
          <Route path="/gacha-result" element={<GachaResult />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
