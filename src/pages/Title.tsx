import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

const Title: React.FC = () => {
  const navigate = useNavigate();
  const { user, register, isLoading } = useUser();
  const [userName, setUserName] = useState('');

  const handleStart = async () => {
    if (user) {
      navigate('/home', { state: { from: '/' } });
      return;
    }

    if (!userName.trim()) {
      alert('ユーザー名を入力してください');
      return;
    }
    
    try {
      await register(userName);
      navigate('/home', { state: { from: '/' } });
    } catch (error) {
      console.error(error);
      alert('登録に失敗しました。もう一度お試しください。');
    }
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
              disabled={isLoading}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            />
          </div>
        )}

        {user && (
          <div className="user-welcome">
            <p>おかえりなさい、{user.userName}さん！</p>
          </div>
        )}

        <button 
          onClick={handleStart} 
          className="start-button"
          disabled={isLoading}
        >
          {isLoading ? '通信中...' : '始める'}
        </button>
      </div>
    </div>
  );
};

export default Title;
