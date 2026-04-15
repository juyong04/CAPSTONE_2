import { useState } from 'react';
import './BoardPage.css';

function BoardPage({ title, emoji, description, accentColor, posts: externalPosts, onAddPost }) {
  const [internalPosts, setInternalPosts] = useState(externalPosts);
  const posts = onAddPost ? externalPosts : internalPosts;
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost = {
      id: Date.now(),
      title: newTitle,
      content: newContent,
      author: '익명',
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
    setShowForm(false);
  };

  if (selectedPost) {
    return (
      <div className="board-page">
        <div className="board-header" style={{ borderColor: accentColor }}>
          <h1 className="board-header-title">{emoji} {title}</h1>
        </div>
        <div className="post-detail">
          <button className="back-btn" onClick={() => setSelectedPost(null)}>← 목록으로</button>
          <h2 className="post-detail-title">{selectedPost.title}</h2>
          <div className="post-detail-meta">
            <span>✍️ {selectedPost.author}</span>
            <span>📅 {selectedPost.date}</span>
            <span>👁 조회 {selectedPost.views}</span>
          </div>
          <div className="post-detail-content">{selectedPost.content}</div>
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
              <span className="post-title">{post.title}</span>
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
