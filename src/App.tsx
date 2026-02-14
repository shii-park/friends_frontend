import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './hooks/useUser';
import Title from './pages/Title';
import Home from './pages/Home';
import './App.css';

// プレースホルダーコンポーネント
const Placeholder = ({ name }: { name: string }) => (
  <div style={{ padding: '20px' }}>
    <h1>{name} Page</h1>
    <p>現在開発中です。</p>
  </div>
);

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Title />} />
          <Route path="/home" element={<Home />} />
          <Route path="/battle-select" element={<Placeholder name="Battle Select" />} />
          <Route path="/battle-prepare" element={<Placeholder name="Battle Prepare" />} />
          <Route path="/battle" element={<Placeholder name="Battle" />} />
          <Route path="/battle-result" element={<Placeholder name="Battle Result" />} />
          <Route path="/storage" element={<Placeholder name="Storage" />} />
          <Route path="/gacha" element={<Placeholder name="Gacha" />} />
          <Route path="/gacha-effect" element={<Placeholder name="Gacha Effect" />} />
          <Route path="/gacha-result" element={<Placeholder name="Gacha Result" />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
