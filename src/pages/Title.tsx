import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

const Title: React.FC = () => {
  const navigate = useNavigate();
  const { user, login } = useUser();
  const [userName, setUserName] = React.useState('');

  const handleStart = () => {
    if (!user && !userName.trim()) {
      alert('ユーザー名を入力してください');
      return;
    }
    
    if (!user) {
      login(userName);
    }
    
    navigate('/home');
  };

  return (
    <div className="title-page">
      <div className="title-container">
        <h1 className="game-title">Friends Game</h1>
        
        {!user && (
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
