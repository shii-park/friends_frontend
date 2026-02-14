import React from 'react';
import { useNavigate } from 'react-router-dom';

const Title: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = false; // TODO: 本来はグローバルな状態やバックエンドの状況で判断
  const [userName, setUserName] = React.useState('');

  const handleStart = () => {
    if (!isLoggedIn && !userName.trim()) {
      alert('ユーザー名を入力してください');
      return;
    }
    // TODO: ログイン処理やユーザー登録処理
    navigate('/home');
  };

  return (
    <div className="title-page">
      <div className="title-container">
        <h1 className="game-title">Friends Game</h1>
        
        {!isLoggedIn && (
          <div className="login-box">
            <input
              type="text"
              placeholder="ユーザー名を入力"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="username-input"
            />
          </div>
        )}

        <button onClick={handleStart} className="start-button">
          始める
        </button>
      </div>
    </div>
  );
};

export default Title;
