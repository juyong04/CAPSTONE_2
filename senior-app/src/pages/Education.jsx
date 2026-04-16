import { useState, useEffect } from 'react';
import BoardPage from '../components/BoardPage';
import { db } from '../config';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';

function Education() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const q = query(
          collection(db, 'posts'),
          where('board', '==', 'education')
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
        board: 'education',
        createdAt: new Date(),
      });

      // 🔥 저장 후 다시 불러오기
      const q = query(
        collection(db, 'posts'),
        where('board', '==', 'education')
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
      title="교육 게시판"
      posts={posts}
      onAddPost={handlePostCreate}
    />
  );
}

export default Education;