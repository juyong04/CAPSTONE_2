import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, getDocs, query } from 'firebase/firestore';
import './Notice.css';

function Notice() {
  const [notices, setNotices] = useState([]);

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
        setNotices(list);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="notice-page">
      <div className="notice-page-header">
        <h1>📢 공지사항</h1>
      </div>

      <ul className="notice-page-list">
        {notices.length === 0 && (
          <li className="notice-page-empty">공지사항이 없습니다.</li>
        )}
        {notices.map(n => (
          <li key={n.id} className="notice-page-item">
            <Link to={`/notice/${n.id}`} className="notice-page-link">
              <span className="notice-page-dot" />
              <span className="notice-page-title">{n.title}</span>
              <span className="notice-page-date">
                {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleDateString() : ''}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Notice;