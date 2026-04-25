import { useState, useEffect, useCallback } from 'react';
import { db, storage } from '../firebase/config';
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * 게시판 공통 로직을 담은 커스텀 훅
 * - 게시글 로드 (createdAt 내림차순 정렬)
 * - 게시글 저장 (+ 선택적 오디오 업로드)
 *
 * @param {string} boardId - 게시판 식별자 ('free', 'monthly', 'counseling', 'education')
 */
export default function useBoardPosts(boardId) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 게시글 불러오기
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'posts'),
        where('board', '==', boardId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const postList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts(postList);
    } catch (error) {
      console.error('게시글 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // 게시글 저장 (오디오 포함 가능)
  const createPost = useCallback(
    async (newPost) => {
      try {
        let audioURL = null;

        // 오디오 Blob이 있으면 Firebase Storage에 업로드
        if (newPost.audioBlob) {
          const audioFileName = `audio/${boardId}/${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}.webm`;
          const audioRef = ref(storage, audioFileName);
          await uploadBytes(audioRef, newPost.audioBlob, {
            contentType: 'audio/webm',
          });
          audioURL = await getDownloadURL(audioRef);
        }

        await addDoc(collection(db, 'posts'), {
          title: newPost.title,
          content: newPost.content,
          author: newPost.author || '익명',
          date: newPost.date || new Date().toISOString().split('T')[0],
          views: newPost.views !== undefined ? newPost.views : 0,
          comments: newPost.comments !== undefined ? newPost.comments : 0,
          board: boardId,
          createdAt: new Date(),
          ...(audioURL && { audioURL }),
        });

        // 저장 후 다시 불러오기
        await loadPosts();
      } catch (error) {
        console.error('글 저장 실패:', error);
      }
    },
    [boardId, loadPosts]
  );

  return { posts, loading, createPost };
}
