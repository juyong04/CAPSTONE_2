import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { getMyPostIds } from '../utils/user';
import './MyPosts.css';

const BOARD_META = {
  monthly: { label: '이달의 주제', emoji: '💬' },
  counseling: { label: '고민상담', emoji: '🤝' },
  free: { label: '자유게시판', emoji: '🗣️' },
  education: { label: '교육', emoji: '📚' },
};

function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const ids = getMyPostIds();
        if (ids.length === 0) { setLoading(false); return; }

        // Firestore에서 각 postId로 개별 조회
        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const snap = await getDoc(doc(db, 'posts', id));
              if (snap.exists()) return { id: snap.id, ...snap.data() };
              return null;
            } catch { return null; }
          })
        );

        const valid = results.filter(Boolean);
        // 최신순 정렬
        valid.sort((a, b) => {
          const ta = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const tb = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return tb - ta;
        });
        setPosts(valid);
      } catch (e) {
        console.error('내 작성글 로드 실패:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  return (
    <div className="my-posts">
      <div className="my-posts-header">
        <h1>📝 내 작성글</h1>
        <p className="my-posts-hint">이 기기에서 작성한 글을 모아볼 수 있어요</p>
      </div>

      {loading ? (
        <div className="my-posts-empty">불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div className="my-posts-empty">
          <span className="my-posts-empty-icon">📭</span>
          <p>아직 작성한 글이 없어요</p>
          <Link to="/board" className="my-posts-link">게시판으로 이동하기 →</Link>
        </div>
      ) : (
        <ul className="my-posts-list">
          {posts.map(post => {
            const meta = BOARD_META[post.board] || { label: '게시판', emoji: '📋' };
            return (
              <li key={post.id}>
                <Link to={`/board?tab=${post.board}&postId=${post.id}`} className="my-post-card">
                  <div className="my-post-top">
                    <span className="my-post-badge">{meta.emoji} {meta.label}</span>
                    <span className="my-post-date">{post.date}</span>
                  </div>
                  <strong className="my-post-title">{post.title}</strong>
                  <span className="my-post-preview">{post.content?.slice(0, 80)}{post.content?.length > 80 ? '…' : ''}</span>
                  <div className="my-post-stats">
                    <span>👁 {post.views || 0}</span>
                    <span>💬 {post.comments || 0}</span>
                    <span>❤️ {post.likes || 0}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default MyPosts;
