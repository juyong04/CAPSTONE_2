import { useEffect, useState } from 'react';

// ⭐ 추가
import { Link } from 'react-router-dom';

import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

function Notice() {

  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
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

        setNotices(noticeList);

      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="section">

      <h2 className="section-title">📢 공지사항</h2>

      <ul className="notice-list">

        {notices.map((n) => (
          <li key={n.id} className="notice-item">

            {/* ⭐ 여기만 추가 (기존 span 구조 유지하면서 감싸기) */}
            <Link
              to={`/notice/${n.id}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                textDecoration: 'none',
                color: 'inherit'
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
    </div>
  );
}

export default Notice;