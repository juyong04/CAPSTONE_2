import { Link } from 'react-router-dom';
import './Home.css';

const cards = [
  {
    path: '/monthly-topic',
    emoji: '💬',
    title: '이달의 주제',
    desc: '매달 새로운 주제로 함께 이야기를 나눠요',
    color: '#e8f5e9',
    border: '#3a7d44',
  },
  {
    path: '/counseling',
    emoji: '🤝',
    title: '고민상담',
    desc: '혼자 해결하기 어려운 고민을 함께 나눠요',
    color: '#fff8e1',
    border: '#f9a825',
  },
  {
    path: '/freeboard',
    emoji: '🗣️',
    title: '자유게시판',
    desc: '일상부터 취미까지 자유롭게 이야기해요',
    color: '#e3f2fd',
    border: '#1565c0',
  },
  {
    path: '/education',
    emoji: '📚',
    title: '교육 게시판',
    desc: '건강·디지털·취미 등 유익한 정보를 나눠요',
    color: '#fce4ec',
    border: '#c62828',
  },
];

const notices = [
  { id: 1, title: '5월 이달의 주제: "내가 가장 좋아하는 계절 여행지"', date: '2025-05-01' },
  { id: 2, title: '커뮤니티 이용 안내 및 에티켓 공지', date: '2025-04-28' },
  { id: 3, title: '교육 게시판 "스마트폰 사진 잘 찍는 법" 신규 등록', date: '2025-04-25' },
];

function Home() {
  return (
    <div className="home">
      {/* 히어로 배너 */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1>🌿 환영합니다!</h1>
          <p>시니어 커뮤니티에 오신 걸 환영해요.<br />함께 이야기하고, 배우고, 즐겨봐요.</p>
        </div>
      </section>

      {/* 공지사항 */}
      <section className="section">
        <h2 className="section-title">📢 공지사항</h2>
        <ul className="notice-list">
          {notices.map((n) => (
            <li key={n.id} className="notice-item">
              <span className="notice-title">{n.title}</span>
              <span className="notice-date">{n.date}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 게시판 바로가기 */}
      <section className="section">
        <h2 className="section-title">📌 게시판 바로가기</h2>
        <div className="card-grid">
          {cards.map((card) => (
            <Link
              key={card.path}
              to={card.path}
              className="board-card"
              style={{ backgroundColor: card.color, borderLeft: `5px solid ${card.border}` }}
            >
              <span className="card-emoji">{card.emoji}</span>
              <h3 className="card-title">{card.title}</h3>
              <p className="card-desc">{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
