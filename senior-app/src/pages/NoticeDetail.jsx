import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import './NoticeDetail.css';

function NoticeDetail() {
  const { id } = useParams();
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'notice', id));
        if (snap.exists()) setNotice(snap.data());
      } catch (e) {
        console.error(e);
      }
    })();
  }, [id]);

  if (!notice) {
    return <div className="notice-detail-loading">로딩중...</div>;
  }

  return (
    <div className="notice-detail">
      <Link to="/notice" className="notice-detail-back">← 공지 목록</Link>

      <div className="notice-detail-card">
        <span className="notice-detail-badge">📢 공지사항</span>
        <h1 className="notice-detail-title">{notice.title}</h1>

        {notice.createdAt?.toDate && (
          <p className="notice-detail-date">
            📅 {notice.createdAt.toDate().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}

        <div className="notice-detail-content">{notice.content}</div>
      </div>
    </div>
  );
}

export default NoticeDetail;