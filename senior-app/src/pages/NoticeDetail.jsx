import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

function NoticeDetail() {
  const { id } = useParams();
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const docRef = doc(db, 'notice', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log(docSnap.data()); // ⭐ 확인용
          setNotice(docSnap.data());
        } else {
          console.log("문서 없음");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchNotice();
  }, [id]);

  if (!notice) return <div className="section">로딩중...</div>;

  return (
    <div className="section">

      {/* 제목 */}
      <h2 className="section-title">{notice.title}</h2>

      {/* 내용 */}
      <div style={{
        marginTop: '20px', lineHeight: '1.6',
        whiteSpace: 'pre-line'
      }}>
        {notice.content}
      </div>

    </div>
  );
}

export default NoticeDetail;