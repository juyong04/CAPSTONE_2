import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, query } from 'firebase/firestore';
import './Home.css';

const boards = [
  { key: 'monthly', path: '/board?tab=monthly', emoji: '💬', title: '이달의 주제', desc: '매달 새로운 주제로 이야기', color: '#2D7A4F' },
  { key: 'counseling', path: '/board?tab=counseling', emoji: '🤝', title: '고민상담', desc: '함께 나누는 고민 이야기', color: '#D4860B' },
  { key: 'free', path: '/board?tab=free', emoji: '🗣️', title: '자유게시판', desc: '자유롭게 소통해요', color: '#2B6CB0' },
  { key: 'education', path: '/board?tab=education', emoji: '📚', title: '교육 게시판', desc: '유익한 정보 나눔', color: '#8E44AD' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return { text: '편안한 밤 보내고 계신가요?', icon: '🌙' };
  if (h < 12) return { text: '좋은 아침이에요!', icon: '🌅' };
  if (h < 18) return { text: '활기찬 오후 보내세요!', icon: '☀️' };
  return { text: '편안한 저녁 시간 되세요!', icon: '🌆' };
}

function Home() {
  const [notices, setNotices] = useState([]);
  const greeting = getGreeting();

  useEffect(() => {
    (async () => {
      try {
        const data = await getDocs(query(collection(db, 'notice')));
        let list = data.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => {
          const ta = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const tb = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return tb - ta;
        });
        setNotices(list.slice(0, 3));
      } catch (e) { console.error(e); }
    })();
  }, []);

  return (
    <div className="home">
      {/* 인사 카드 */}
      <section className="greeting-card">
        <span className="greeting-icon">{greeting.icon}</span>
        <div>
          <p className="greeting-text">{greeting.text}</p>
          <p className="greeting-sub">시니어 커뮤니티에 오신 걸 환영해요</p>
        </div>
      </section>

      {/* 공지 */}
      <section className="home-section">
        <div className="home-section-head">
          <h2>📢 공지사항</h2>
          <Link to="/notice" className="more-link">더보기 →</Link>
        </div>
        <ul className="notice-list">
          {notices.length === 0 && <li className="notice-empty">공지사항이 없습니다.</li>}
          {notices.map(n => (
            <li key={n.id}>
              <Link to={`/notice/${n.id}`} className="notice-row">
                <span className="notice-dot" />
                <span className="notice-title">{n.title}</span>
                <span className="notice-date">{n.createdAt?.toDate ? n.createdAt.toDate().toLocaleDateString() : ''}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 게시판 그리드 */}
      <section className="home-section">
        <h2>📌 게시판 바로가기</h2>
        <div className="board-grid">
          {boards.map(b => (
            <Link key={b.key} to={b.path} className="board-shortcut" style={{ '--accent': b.color }}>
              <span className="board-shortcut-emoji">{b.emoji}</span>
              <strong className="board-shortcut-title">{b.title}</strong>
              <span className="board-shortcut-desc">{b.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;