import { useState, useEffect } from 'react';
import BoardPage from '../components/BoardPage';
import VoiceWriter from '../components/VoiceWriter';

import { db } from '../firebase/config';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';

function Counseling() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const q = query(
          collection(db, 'posts'),
          where('board', '==', 'counseling')
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
        author: newPost.author || '익명',
        date: newPost.date || new Date().toISOString().split('T')[0],
        views: newPost.views !== undefined ? newPost.views : 0,
        comments: newPost.comments !== undefined ? newPost.comments : 0,
        board: 'counseling',
        createdAt: new Date(),
      });

      const q = query(
        collection(db, 'posts'),
        where('board', '==', 'counseling')
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
    <div>
      <VoiceWriter onPostCreate={handlePostCreate} />

      <BoardPage
        title="자유게시판"
        emoji="🗣️"
        description="일상부터 취미까지 무엇이든 자유롭게 이야기해요."
        accentColor="#1565c0"
        posts={posts}
        onAddPost={handlePostCreate}
      />
    </div>
  );
}

export default Counseling;