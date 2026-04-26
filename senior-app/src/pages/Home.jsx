import { Link } from 'react-router-dom';

/* ⭐ 추가 */
import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

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

function Home() {

  /* ⭐ 기존 notices 배열 삭제 → state로 변경 */
  const [notices, setNotices] = useState([]);

  /* ⭐ 추가: Firebase 공지 불러오기 */
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const q = query(
          collection(db, 'notice')
        );

        const data = await getDocs(q);

        let noticeList = data.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        noticeList.sort((a, b) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.date ? new Date(a.date).getTime() : 0);
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.date ? new Date(b.date).getTime() : 0);
          return timeB - timeA;
        });

        setNotices(noticeList.slice(0, 3));
      } catch (error) {
        console.error(error);
      }
    };

    fetchNotices();
  }, []);

  return (
    <div className="home">
      {/* 히어로 배너 */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1>🌿 환영합니다!</h1>
          <p>
            시니어 커뮤니티에 오신 걸 환영해요.
            <br />
            함께 이야기하고, 배우고, 즐겨봐요.
          </p>
        </div>
      </section>

      {/* 공지사항 */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">📢 공지사항</h2>

          <Link to="/notice" className="more-btn">
            더보기 →
          </Link>
        </div>

        <ul className="notice-list">
          {/* ⭐ 여기만 Firebase 데이터로 변경 */}
          {notices.map((n) => (
            <li key={n.id} className="notice-item">
              <Link
                to={`/notice/${n.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <span className="notice-title">{n.title}</span>

                <span className="notice-date">
                  {n.createdAt?.toDate
                    ? n.createdAt.toDate().toLocaleDateString()
                    : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 게시판 바로가기 (절대 수정 안함) */}
      <section className="section">
        <h2 className="section-title">📌 게시판 바로가기</h2>
        <div className="card-grid">
          {cards.map((card) => (
            <Link
              key={card.path}
              to={card.path}
              className="board-card"
              style={{
                backgroundColor: card.color,
                borderLeft: `5px solid ${card.border}`,
              }}
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