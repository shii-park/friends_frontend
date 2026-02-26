import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { apiService } from '../services/api';
import CollectionCard from '../components/CollectionCard';
import type { CollectionEntry } from '../types/collection';

const Collection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [entries, setEntries] = useState<CollectionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'chara' | 'equip'>('chara');
  const [selectedEntry, setSelectedEntry] = useState<CollectionEntry | null>(null);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const res = await apiService.getCollection();
        setEntries(res.entries);
      } catch (e) {
        console.error('Failed to fetch collection:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, []);

  if (!user) return null;

  const filteredEntries = entries.filter(e => 
    tab === 'chara' ? e.card.base.cardKind === 1 : e.card.base.cardKind === 0
  );

  const obtainedCount = entries.filter(e => e.state === 'get').length;
  const totalCount = entries.length;

  return (
    <div className="storage-page collection-page">
      <header className="app-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/home', { state: { from: '/collection' } })}>↑ 戻る</button>
        </div>
        <div className="header-center">
          <h1>図鑑</h1>
        </div>
        <div className="header-right">
          <div className="header-stats-item">達成率: {obtainedCount}/{totalCount}</div>
        </div>
      </header>

      <div className="storage-tabs-container">
        <div className="tab-buttons">
          <button className={`tab-button ${tab === 'chara' ? 'active' : ''}`} onClick={() => setTab('chara')}>キャラクター</button>
          <button className={`tab-button ${tab === 'equip' ? 'active' : ''}`} onClick={() => setTab('equip')}>装備</button>
        </div>
      </div>

      <main className="storage-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--primary)', fontWeight: 900 }}>LOADING COLLECTION...</div>
        ) : (
          <div className="card-grid">
            {filteredEntries.map((entry) => (
              <CollectionCard 
                key={entry.card.base.cardID} 
                entry={entry}
                onClick={() => entry.state !== 'NotFound' && setSelectedEntry(entry)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 詳細モーダル（簡易版） */}
      {selectedEntry && (
        <div className="modal-overlay" onClick={() => setSelectedEntry(null)}>
          <div className="strengthen-modal" onClick={e => e.stopPropagation()}>
            <h2>{selectedEntry.state === 'get' ? selectedEntry.card.base.cardName : '???'}</h2>
            <div className="modal-card-info" style={{ alignItems: 'flex-start' }}>
              <div className="modal-card-visual" style={{ width: '200px' }}>
                <CollectionCard entry={selectedEntry} />
              </div>
              <div className="modal-card-details">
                {selectedEntry.state === 'get' ? (
                  <>
                    <div className="modal-stats" style={{ marginBottom: '1.5rem' }}>
                      {selectedEntry.card.character && (
                        <>
                          <p><span>HP</span> <span>{selectedEntry.card.character.initHP} 〜 {selectedEntry.card.character.maxHP}</span></p>
                          <p><span>ATK</span> <span>{selectedEntry.card.character.initATK} 〜 {selectedEntry.card.character.maxATK}</span></p>
                          <p><span>TECH</span> <span>{selectedEntry.card.character.initTECH} 〜 {selectedEntry.card.character.maxTECH}</span></p>
                          <p><span>必殺技</span> <span>{selectedEntry.card.character.specialType === 'rock' ? 'グー' : selectedEntry.card.character.specialType === 'scissors' ? 'チョキ' : 'パー'}</span></p>
                        </>
                      )}
                      {selectedEntry.card.equip && (
                        <>
                          <p><span>Bonus HP</span> <span>+{selectedEntry.card.equip.initBonusHP} 〜 +{selectedEntry.card.equip.maxBonusHP}</span></p>
                          <p><span>Bonus ATK</span> <span>+{selectedEntry.card.equip.initBonusATK} 〜 +{selectedEntry.card.equip.maxBonusATK}</span></p>
                          <p><span>Bonus TECH</span> <span>+{selectedEntry.card.equip.initBonusTECH} 〜 +{selectedEntry.card.equip.maxBonusTECH}</span></p>
                        </>
                      )}
                    </div>
                    <p style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: '1.6', borderTop: '1px solid #333', paddingTop: '1rem' }}>
                      {selectedEntry.card.base.detail || '説明文がありません。'}
                    </p>
                  </>
                ) : (
                  <p style={{ color: 'var(--primary)', fontWeight: 800 }}>詳細情報を閲覧するにはカードを入手してください。</p>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button className="upgrade-button" onClick={() => setSelectedEntry(null)}>閉じる</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collection;
