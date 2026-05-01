import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSavedNickname, saveNickname } from '../utils/user';
import { hashPassword } from '../utils/crypto';
import './BoardPage.css';

function BoardPage({
  title,
  emoji,
  description,
  accentColor,
  posts: externalPosts,
  loading,
  showWriteForm,
  onToggleWrite,
  onAddPost,
  onEditPost,
  onDeletePost,
  onIncrementViews,
  onLikePost,
  onUnlikePost,
  onAddComment,
  onDeleteComment,
  onUpdateComment,
}) {
  const [internalPosts, setInternalPosts] = useState(externalPosts);
  const posts = onAddPost ? externalPosts : internalPosts;

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const location = useLocation();

  const [isManageMode, setIsManageMode] = useState(false);
  const [managePassword, setManagePassword] = useState('');
  const [authLevel, setAuthLevel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commentPassword, setCommentPassword] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  // 닉네임 불러오기
  useEffect(() => {
    setNickname(getSavedNickname());
  }, []);

  // URL 파라미터의 postId로 글 상세 열기
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const postIdParam = params.get('postId');
    if (postIdParam && posts.length > 0 && !selectedPost) {
      const found = posts.find(p => p.id.toString() === postIdParam);
      if (found) setSelectedPost(found);
    }
  }, [location.search, posts, selectedPost]);

  // 글 상세 진입 시 조회수 증가
  useEffect(() => {
    if (selectedPost && onIncrementViews) {
      const key = `viewed_${selectedPost.id}`;
      if (!sessionStorage.getItem(key)) {
        onIncrementViews(selectedPost.id);
        sessionStorage.setItem(key, 'true');
        setSelectedPost(prev => ({ ...prev, views: (prev.views || 0) + 1 }));
      }
    }
  }, [selectedPost?.id, onIncrementViews]);

  // ── 핸들러: 글 등록 ──
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    if (!password.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    saveNickname(nickname);

    const newPost = {
      id: Date.now(),
      title: newTitle,
      content: newContent,
      author: nickname,
      password,
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
    onToggleWrite?.();
  };

  // ── 핸들러: 비밀번호 검증 ──
  const handleVerifyPassword = async () => {
    if (managePassword === 'touch1') {
      setAuthLevel('admin');
      return;
    }
    if (!selectedPost.password) {
      if (managePassword === '0000') {
        setAuthLevel('author');
        return;
      }
    } else {
      const h = await hashPassword(managePassword);
      if (h === selectedPost.password) {
        setAuthLevel('author');
        return;
      }
    }
    alert('비밀번호가 일치하지 않습니다.');
  };

  // ── 핸들러: 상세 닫기 ──
  const handleCloseDetail = () => {
    setSelectedPost(null);
    setIsManageMode(false);
    setAuthLevel(null);
    setManagePassword('');
    setIsEditing(false);
  };

  // ── 핸들러: 좋아요 토글 ──
  const handleLike = () => {
    if (!onLikePost || !onUnlikePost) return;
    const key = `liked_${selectedPost.id}`;

    if (localStorage.getItem(key)) {
      onUnlikePost(selectedPost.id);
      localStorage.removeItem(key);
      setSelectedPost(prev => ({
        ...prev,
        likes: Math.max((prev.likes || 0) - 1, 0),
      }));
    } else {
      onLikePost(selectedPost.id);
      localStorage.setItem(key, 'true');
      setSelectedPost(prev => ({
        ...prev,
        likes: (prev.likes || 0) + 1,
      }));
    }
  };

  // ── 핸들러: 댓글 추가 ──
  const handleAddComment = async () => {
    if (!onAddComment || !newComment.trim()) return;
    saveNickname(nickname);

    let hashed = '';
    if (commentPassword) {
      hashed = await hashPassword(commentPassword);
    }

    const c = {
      id: Date.now(),
      text: newComment,
      author: nickname || '수줍은시니어',
      password: hashed,
      date: new Date().toISOString().split('T')[0],
    };

    onAddComment(selectedPost.id, c);
    setSelectedPost(prev => ({
      ...prev,
      commentList: [...(prev.commentList || []), c],
      comments: (prev.comments || 0) + 1,
    }));
    setNewComment('');
    setCommentPassword('');
  };

  // ── 핸들러: 댓글 비밀번호 검증 ──
  const verifyCommentPassword = async (comment) => {
    if (authLevel === 'admin') return true;
    if (!comment.password) return true;

    const pw = window.prompt('댓글 비밀번호를 입력하세요:');
    if (pw === null) return false;

    const h = await hashPassword(pw);
    if (h === comment.password) return true;

    alert('비밀번호가 일치하지 않습니다.');
    return false;
  };

  // ── 핸들러: 댓글 삭제 ──
  const handleDeleteComment = async (comment) => {
    if (!onDeleteComment) return;
    if (!(await verifyCommentPassword(comment))) return;

    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      onDeleteComment(selectedPost.id, comment);
      setSelectedPost(prev => ({
        ...prev,
        commentList: (prev.commentList || []).filter(c => c.id !== comment.id),
        comments: Math.max((prev.comments || 0) - 1, 0),
      }));
    }
  };

  // ── 핸들러: 댓글 수정 저장 ──
  const handleUpdateCommentSave = async (comment) => {
    if (!onUpdateComment || !editCommentText.trim()) return;
    if (!(await verifyCommentPassword(comment))) return;

    onUpdateComment(selectedPost.id, comment, editCommentText);
    setSelectedPost(prev => ({
      ...prev,
      commentList: (prev.commentList || []).map(c =>
        c.id === comment.id ? { ...c, text: editCommentText } : c
      ),
    }));
    setEditingCommentId(null);
    setEditCommentText('');
  };

  // ── 핸들러: 글 수정 시작 ──
  const handleStartEdit = () => {
    setIsEditing(true);
    setEditTitle(selectedPost.title);
    setEditContent(selectedPost.content);
  };

  // ── 핸들러: 글 수정 저장 ──
  const handleSaveEdit = () => {
    onEditPost(selectedPost.id, { title: editTitle, content: editContent });
    setSelectedPost({ ...selectedPost, title: editTitle, content: editContent });
    setIsEditing(false);
  };

  // ── 핸들러: 글 삭제 ──
  const handleDeletePost = () => {
    if (window.confirm('삭제하시겠습니까?')) {
      onDeletePost(selectedPost.id);
      handleCloseDetail();
    }
  };

  // ── 핸들러: 핀 토글 ──
  const handleTogglePin = () => {
    const v = !selectedPost.isPinned;
    onEditPost(selectedPost.id, { isPinned: v });
    setSelectedPost({ ...selectedPost, isPinned: v });
  };

  /* ═══════════════════════════════════════════
   *  글 상세 뷰
   * ═══════════════════════════════════════════ */
  if (selectedPost) {
    return (
      <div className="bp">
        <div className="bp-detail">
          <button className="bp-back" onClick={handleCloseDetail}>← 목록으로</button>

          {!isEditing ? (
            <>
              <h2 className="bp-detail-title">
                {selectedPost.isPinned && '📌 '}
                {selectedPost.title}
              </h2>

              <div className="bp-detail-meta">
                <span>✍️ {selectedPost.author}</span>
                <span>📅 {selectedPost.date}</span>
                <span>👁 {selectedPost.views}</span>
                <button className="bp-manage-btn" onClick={() => setIsManageMode(!isManageMode)}>
                  ⚙️ 관리
                </button>
              </div>

              {/* 비밀번호 인증 */}
              {isManageMode && !authLevel && (
                <div className="bp-auth-box">
                  <input
                    type="password"
                    placeholder="비밀번호"
                    value={managePassword}
                    onChange={e => setManagePassword(e.target.value)}
                  />
                  <button onClick={handleVerifyPassword}>확인</button>
                </div>
              )}

              {/* 관리 버튼 */}
              {authLevel && (
                <div className="bp-manage-actions">
                  {authLevel === 'admin' && (
                    <button className="bp-btn-pin" onClick={handleTogglePin}>
                      {selectedPost.isPinned ? '📌 해제' : '📌 고정'}
                    </button>
                  )}
                  <button className="bp-btn-edit" onClick={handleStartEdit}>수정</button>
                  <button className="bp-btn-del" onClick={handleDeletePost}>삭제</button>
                </div>
              )}

              {/* 오디오 */}
              {selectedPost.audioURL && (
                <div className="bp-audio">
                  <span>🎤 음성으로 작성된 글이에요</span>
                  <audio controls src={selectedPost.audioURL} style={{ width: '100%', marginTop: 8 }} />
                </div>
              )}

              {/* 본문 */}
              <div className="bp-detail-body">{selectedPost.content}</div>
              <div className="bp-like-area">
                <button className="bp-like-btn" onClick={handleLike}>
                  ❤️ 좋아요 {selectedPost.likes || 0}
                </button>
              </div>

              {/* 댓글 */}
              <div className="bp-comments">
                <h3>💬 댓글 {selectedPost.comments || 0}개</h3>
                <ul className="bp-comment-list">
                  {(selectedPost.commentList || []).map(c => (
                    <li key={c.id} className="bp-comment">
                      <div className="bp-comment-head">
                        <div className="bp-comment-author">
                          <span className="bp-avatar">{(c.author || '시')[0]}</span>
                          <strong>{c.author}</strong>
                          <span className="bp-comment-date">{c.date}</span>
                        </div>
                        <div className="bp-comment-btns">
                          <button onClick={() => { setEditingCommentId(c.id); setEditCommentText(c.text); }}>수정</button>
                          <button onClick={() => handleDeleteComment(c)}>삭제</button>
                        </div>
                      </div>

                      {editingCommentId === c.id ? (
                        <div className="bp-comment-edit">
                          <input value={editCommentText} onChange={e => setEditCommentText(e.target.value)} />
                          <button className="bp-btn-save" onClick={() => handleUpdateCommentSave(c)}>저장</button>
                          <button onClick={() => setEditingCommentId(null)}>취소</button>
                        </div>
                      ) : (
                        <p className="bp-comment-text">{c.text}</p>
                      )}
                    </li>
                  ))}
                </ul>

                {/* 댓글 작성 */}
                <div className="bp-comment-form">
                  <div className="bp-comment-row">
                    <input placeholder="닉네임" value={nickname} onChange={e => setNickname(e.target.value)} />
                    <input type="password" placeholder="비밀번호" value={commentPassword} onChange={e => setCommentPassword(e.target.value)} />
                  </div>
                  <div className="bp-comment-row">
                    <input
                      placeholder="댓글을 남겨보세요"
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleAddComment()}
                    />
                    <button className="bp-comment-submit" onClick={handleAddComment}>등록</button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ── 수정 폼 ── */
            <div className="bp-edit-form">
              <input className="bp-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="제목" />
              <textarea className="bp-textarea" value={editContent} onChange={e => setEditContent(e.target.value)} placeholder="내용" rows={8} />
              <div className="bp-edit-actions">
                <button className="bp-btn-cancel" onClick={() => setIsEditing(false)}>취소</button>
                <button className="bp-btn-save" onClick={handleSaveEdit}>저장</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
   *  글 목록 뷰
   * ═══════════════════════════════════════════ */
  return (
    <div className="bp">
      {/* 글쓰기 폼 */}
      {showWriteForm && (
        <form className="bp-form" onSubmit={handleSubmit}>
          <div className="bp-form-row">
            <input className="bp-input" placeholder="닉네임" value={nickname} onChange={e => setNickname(e.target.value)} />
            <input className="bp-input" type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <input className="bp-input" placeholder="제목을 입력하세요" value={newTitle} onChange={e => setNewTitle(e.target.value)} maxLength={80} />
          <textarea className="bp-textarea" placeholder="내용을 입력하세요" value={newContent} onChange={e => setNewContent(e.target.value)} rows={5} />
          <div className="bp-form-actions">
            <button type="submit" className="bp-submit-btn" style={{ background: accentColor }}>등록하기</button>
          </div>
        </form>
      )}

      {/* 글 목록 */}
      {loading ? (
        <div className="bp-loading">불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div className="bp-empty">아직 게시글이 없어요. 첫 글을 남겨보세요! 😊</div>
      ) : (
        <ul className="bp-list">
          {posts.map(post => (
            <li key={post.id} className="bp-item" onClick={() => setSelectedPost(post)}>
              <div className="bp-item-main">
                <span className="bp-item-title">
                  {post.isPinned && '📌 '}
                  {post.audioURL && '🎤 '}
                  {post.title}
                </span>
                <span className="bp-item-preview">
                  {post.content?.slice(0, 60)}{post.content?.length > 60 ? '…' : ''}
                </span>
              </div>
              <div className="bp-item-meta">
                <span>{post.author}</span>
                <span>{post.date}</span>
                <span>👁{post.views}</span>
                <span>💬{post.comments}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BoardPage;
