import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import CategoryChips from '../components/CategoryChips';
import BoardPage from '../components/BoardPage';
import VoiceWriter from '../components/VoiceWriter';
import useBoardPosts from '../hooks/useBoardPosts';
import './Board.css';

const BOARDS = [
  { key: 'monthly', label: '이달의 주제', emoji: '💬', desc: '매달 새로운 주제로 이야기를 나눠요', color: '#2D7A4F' },
  { key: 'counseling', label: '고민상담', emoji: '🤝', desc: '어려운 일이나 고민이 있다면 함께 나눠요', color: '#D4860B' },
  { key: 'free', label: '자유게시판', emoji: '🗣️', desc: '일상부터 취미까지 자유롭게 이야기해요', color: '#2B6CB0' },
  { key: 'education', label: '교육', emoji: '📚', desc: '건강·디지털·취미 등 유익한 정보를 나눠요', color: '#8E44AD' },
];

function Board() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'free';
  const showWrite = searchParams.get('write') === '1';
  const [activeBoard, setActiveBoard] = useState(tabParam);

  // URL 파라미터 변경 시 칩 동기화
  useEffect(() => {
    if (tabParam && BOARDS.find(b => b.key === tabParam)) {
      setActiveBoard(tabParam);
    }
  }, [tabParam]);

  const boardMeta = BOARDS.find(b => b.key === activeBoard) || BOARDS[2];
  const {
    posts, loading, createPost, updatePost, deletePost,
    incrementViews, likePost, unlikePost, addComment, deleteComment, updateComment
  } = useBoardPosts(activeBoard);

  const handleChipChange = (key) => {
    setActiveBoard(key);
    const p = new URLSearchParams(searchParams);
    p.set('tab', key);
    // 글쓰기 모드 유지: write 파라미터 보존
    setSearchParams(p);
  };

  const handleToggleWrite = () => {
    const p = new URLSearchParams(searchParams);
    if (p.get('write')) p.delete('write'); else p.set('write', '1');
    p.set('tab', activeBoard);
    setSearchParams(p);
  };

  return (
    <div className="board-wrap">
      <CategoryChips boards={BOARDS} active={activeBoard} onChange={handleChipChange} />

      {/* 음성 글쓰기 */}
      <VoiceWriter onPostCreate={createPost} />

      <BoardPage
        title={boardMeta.label}
        emoji={boardMeta.emoji}
        description={boardMeta.desc}
        accentColor={boardMeta.color}
        posts={posts}
        loading={loading}
        showWriteForm={showWrite}
        onToggleWrite={handleToggleWrite}
        onAddPost={createPost}
        onEditPost={updatePost}
        onDeletePost={deletePost}
        onIncrementViews={incrementViews}
        onLikePost={likePost}
        onUnlikePost={unlikePost}
        onAddComment={addComment}
        onDeleteComment={deleteComment}
        onUpdateComment={updateComment}
      />
    </div>
  );
}

export default Board;
