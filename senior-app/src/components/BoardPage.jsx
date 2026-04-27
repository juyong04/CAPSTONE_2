import { useState, useEffect } from 'react';
import { getSavedNickname, saveNickname } from '../utils/user';
import { hashPassword } from '../utils/crypto';
import './BoardPage.css';

function BoardPage({ title, emoji, description, accentColor, posts: externalPosts, onAddPost, onEditPost, onDeletePost }) {
  const [internalPosts, setInternalPosts] = useState(externalPosts);
  const posts = onAddPost ? externalPosts : internalPosts;
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  // 관리(수정/삭제/고정) 모드 관련 상태
  const [isManageMode, setIsManageMode] = useState(false);
  const [managePassword, setManagePassword] = useState('');
  const [authLevel, setAuthLevel] = useState(null); // 'author' | 'admin' | null
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    setNickname(getSavedNickname());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    if (!password.trim()) {
      alert('게시글을 안전하게 수정/삭제하기 위해 비밀번호를 입력해주세요.');
      return;
    }

    saveNickname(nickname);

    const newPost = {
      id: Date.now(),
      title: newTitle,
      content: newContent,
      author: nickname,
      password: password,
      date: new Date().toISOString().split('T')[0],
      views: 0,
      comments: 0,
    };

    if (onAddPost) {
      onAddPost(newPost);
    } else {
      setInternalPosts([newPost, ...internalPosts]);
    }
    setNewTitle('');
    setNewContent('');
    setPassword('');
    setShowForm(false);
  };

  const handleVerifyPassword = async () => {
    if (managePassword === 'touch1') {
      setAuthLevel('admin');
      return;
    }

    if (!selectedPost.password) {
      // 레거시 글 백도어
      if (managePassword === '0000') {
        setAuthLevel('author');
        return;
      }
    } else {
      const hashed = await hashPassword(managePassword);
      if (hashed === selectedPost.password) {
        setAuthLevel('author');
        return;
      }
    }

    alert('비밀번호가 일치하지 않습니다.');
  };

  const handleCloseDetail = () => {
    setSelectedPost(null);
    setIsManageMode(false);
    setAuthLevel(null);
    setManagePassword('');
    setIsEditing(false);
  };

  if (selectedPost) {
    return (
      <div className="board-page">
        <div className="board-header" style={{ borderColor: accentColor }}>
          <h1 className="board-header-title">{emoji} {title}</h1>
        </div>
        <div className="post-detail">
          <button className="back-btn" onClick={handleCloseDetail}>← 목록으로</button>
          
          {!isEditing ? (
            <>
              <h2 className="post-detail-title">
                {selectedPost.isPinned && <span style={{marginRight: '8px'}}>📌</span>}
                {selectedPost.title}
              </h2>
              <div className="post-detail-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span>✍️ {selectedPost.author}</span>
                  <span>📅 {selectedPost.date}</span>
                  <span>👁 조회 {selectedPost.views}</span>
                </div>
                <button 
                  className="manage-btn" 
                  onClick={() => setIsManageMode(!isManageMode)}
                  style={{ padding: '4px 8px', fontSize: '0.9rem', cursor: 'pointer', background: 'transparent', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  ⚙️ 글 관리
                </button>
              </div>

              {isManageMode && !authLevel && (
                <div className="manage-auth-box" style={{ marginTop: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', gap: '8px' }}>
                  <input 
                    type="password" 
                    placeholder="비밀번호 입력" 
                    value={managePassword} 
                    onChange={e => setManagePassword(e.target.value)}
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
                  />
                  <button onClick={handleVerifyPassword} style={{ padding: '6px 12px', background: accentColor, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>확인</button>
                </div>
              )}

              {authLevel && (
                <div className="manage-actions" style={{ marginTop: '10px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  {authLevel === 'admin' && (
                    <button 
                      onClick={() => {
                        const newPinned = !selectedPost.isPinned;
                        onEditPost(selectedPost.id, { isPinned: newPinned });
                        setSelectedPost({...selectedPost, isPinned: newPinned});
                      }}
                      style={{ padding: '6px 12px', background: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      {selectedPost.isPinned ? '📌 고정 해제' : '📌 게시글 고정'}
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setIsEditing(true);
                      setEditTitle(selectedPost.title);
                      setEditContent(selectedPost.content);
                    }}
                    style={{ padding: '6px 12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >수정</button>
                  <button 
                    onClick={() => {
                      if(window.confirm('정말 삭제하시겠습니까?')) {
                        onDeletePost(selectedPost.id);
                        handleCloseDetail();
                      }
                    }}
                    style={{ padding: '6px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >삭제</button>
                </div>
              )}

              {/* 음성 첨부가 있으면 오디오 플레이어 표시 */}
              {selectedPost.audioURL && (
                <div className="post-audio-section">
                  <div className="post-audio-header">
                    <span className="post-audio-icon">🎤</span>
                    <span className="post-audio-title">음성으로 작성된 글이에요</span>
                  </div>
                  <audio controls src={selectedPost.audioURL} className="post-audio-player" />
                </div>
              )}

              <div className="post-detail-content">{selectedPost.content}</div>
            </>
          ) : (
            <div className="edit-form" style={{ marginTop: '20px' }}>
              <input 
                className="form-input" 
                value={editTitle} 
                onChange={e => setEditTitle(e.target.value)} 
                placeholder="제목 수정"
                maxLength={80}
              />
              <textarea 
                className="form-textarea" 
                value={editContent} 
                onChange={e => setEditContent(e.target.value)} 
                placeholder="내용 수정"
                rows={10} 
              />
              <div className="form-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setIsEditing(false)}
                  style={{ padding: '8px 16px', background: '#aaa', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >취소</button>
                <button 
                  onClick={() => {
                    onEditPost(selectedPost.id, { title: editTitle, content: editContent });
                    setSelectedPost({...selectedPost, title: editTitle, content: editContent});
                    setIsEditing(false);
                  }}
                  style={{ padding: '8px 16px', background: accentColor, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >저장하기</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="board-page">
      <div className="board-header" style={{ borderColor: accentColor }}>
        <div>
          <h1 className="board-header-title">{emoji} {title}</h1>
          <p className="board-header-desc">{description}</p>
        </div>
        <button
          className="write-btn"
          style={{ backgroundColor: accentColor }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✖ 취소' : '✏️ 글쓰기'}
        </button>
      </div>

      {showForm && (
        <form className="post-form" onSubmit={handleSubmit}>
          <div className="form-auth-inputs" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              className="form-input"
              type="text"
              placeholder="닉네임 (미입력시 수줍은시니어)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              style={{ flex: 1, marginBottom: 0 }}
            />
            <input
              className="form-input"
              type="password"
              placeholder="비밀번호 (수정/삭제용)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ flex: 1, marginBottom: 0 }}
            />
          </div>
          <input
            className="form-input"
            type="text"
            placeholder="제목을 입력하세요"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            maxLength={80}
          />
          <textarea
            className="form-textarea"
            placeholder="내용을 입력하세요"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={5}
          />
          <div className="form-actions">
            <button type="submit" className="submit-btn" style={{ backgroundColor: accentColor }}>
              등록하기
            </button>
          </div>
        </form>
      )}

      <ul className="post-list">
        {posts.length === 0 && (
          <li className="no-post">아직 게시글이 없어요. 첫 글을 남겨보세요! 😊</li>
        )}
        {posts.map((post) => (
          <li
            key={post.id}
            className="post-item"
            onClick={() => setSelectedPost(post)}
          >
            <div className="post-main">
              <span className="post-title">
                {post.isPinned && <span style={{marginRight: '6px'}}>📌</span>}
                {post.audioURL && <span className="post-voice-badge">🎤</span>}
                {post.title}
              </span>
              <span className="post-preview">{post.content.slice(0, 60)}{post.content.length > 60 ? '…' : ''}</span>
            </div>
            <div className="post-meta">
              <span>{post.author}</span>
              <span>{post.date}</span>
              <span>👁 {post.views}</span>
              <span>💬 {post.comments}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BoardPage;
