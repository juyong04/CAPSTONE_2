import { useState, useEffect } from 'react';
import BoardPage from '../components/BoardPage';
import { db } from '../config';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';

function MonthlyTopic() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const q = query(
          collection(db, 'posts'),
          where('board', '==', 'monthly')
        );

        const querySnapshot = await getDocs(q);

        const postList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPosts(postList);
      } catch (error) {
        console.error('게시글 불러오기 실패:', error);
      }
    };

    loadPosts();
  }, []);

  const handlePostCreate = async (newPost) => {
    try {
      await addDoc(collection(db, 'posts'), {
        title: newPost.title,
        content: newPost.content,
        board: 'monthly',
        createdAt: new Date(),
      });

      const q = query(
        collection(db, 'posts'),
        where('board', '==', 'monthly')
      );

      const querySnapshot = await getDocs(q);

      const postList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts(postList);
    } catch (error) {
      console.error('글 저장 실패:', error);
    }
  };

  return (
    <BoardPage
      title="월간 주제 게시판"
      posts={posts}
      onAddPost={handlePostCreate}
    />
  );
}

export default MonthlyTopic;