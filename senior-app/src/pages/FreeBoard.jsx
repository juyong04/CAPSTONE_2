import { useState, useEffect } from 'react';
import BoardPage from '../components/BoardPage';
import VoiceWriter from '../components/VoiceWriter';

import { db } from '../config';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';

function FreeBoard() {
  const [posts, setPosts] = useState([]);

  // 🔥 자유게시판 글만 불러오기
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const q = query(
          collection(db, 'posts'),
          where('board', '==', 'free')
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

  // 🔥 글 저장
  const handlePostCreate = async (newPost) => {
    try {
      await addDoc(collection(db, 'posts'), {
        title: newPost.title,
        content: newPost.content,
        board: 'free', // 🔥 핵심
        createdAt: new Date(),
      });

      // 🔥 저장 후 다시 불러오기
      const q = query(
        collection(db, 'posts'),
        where('board', '==', 'free')
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

export default FreeBoard;