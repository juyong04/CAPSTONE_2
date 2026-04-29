import { useState, useEffect, useCallback } from 'react';
import { db, storage } from '../firebase/config';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { hashPassword } from '../utils/crypto';
import { getUserIdentifier } from '../utils/user';

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
        where('board', '==', boardId)
      );

      const querySnapshot = await getDocs(q);
      const postList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 클라이언트에서 정렬 수행 (고정 우선, 그다음 최신순)
      postList.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.date ? new Date(a.date).getTime() : 0);
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.date ? new Date(b.date).getTime() : 0);
        return timeB - timeA;
      });

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
          try {
            const audioFileName = `audio/${boardId}/${Date.now()}_${Math.random()
              .toString(36)
              .slice(2, 8)}.webm`;
            const audioRef = ref(storage, audioFileName);
            
            // Firebase Storage 무한 재시도(CORS 에러 등) 방지를 위한 5초 타임아웃
            const uploadTask = uploadBytes(audioRef, newPost.audioBlob, {
              contentType: 'audio/webm',
            });
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('업로드 시간 초과')), 5000)
            );

            await Promise.race([uploadTask, timeoutPromise]);
            audioURL = await getDownloadURL(audioRef);
          } catch (storageError) {
            console.error('Storage 업로드 실패:', storageError);
            alert('음성 파일 업로드에 실패했습니다. Firebase Storage 권한 설정이 필요할 수 있습니다. 텍스트만 게시됩니다.');
          }
        }

        // 비밀번호 해시화
        let hashedPassword = '';
        if (newPost.password) {
          hashedPassword = await hashPassword(newPost.password);
        }

        // IP 식별자 획득 및 닉네임 조합
        const ipIdentifier = await getUserIdentifier();
        const baseNickname = newPost.author || '수줍은시니어';
        const authorWithIp = `${baseNickname}(${ipIdentifier})`;

        await addDoc(collection(db, 'posts'), {
          title: newPost.title,
          content: newPost.content,
          author: authorWithIp,
          password: hashedPassword, // 암호화된 비밀번호 저장
          isPinned: false, // 기본적으로 고정 해제 상태
          date: newPost.date || new Date().toISOString().split('T')[0],
          views: newPost.views !== undefined ? newPost.views : 0,
          comments: newPost.comments !== undefined ? newPost.comments : 0,
          likes: 0,
          commentList: [],
          board: boardId,
          createdAt: new Date(),
          ...(audioURL && { audioURL }),
        });

        // 저장 후 다시 불러오기
        await loadPosts();
        alert('게시글이 성공적으로 등록되었습니다.');
      } catch (error) {
        console.error('글 저장 실패:', error);
        alert('글 저장에 실패했습니다. 개발자 도구(F12) 콘솔을 확인해주세요.');
      }
    },
    [boardId, loadPosts]
  );

  // 게시글 수정
  const updatePost = useCallback(
    async (postId, updatedData) => {
      try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, updatedData);
        await loadPosts();
      } catch (error) {
        console.error('글 수정 실패:', error);
      }
    },
    [loadPosts]
  );

  // 게시글 삭제
  const deletePost = useCallback(
    async (postId) => {
      try {
        const postRef = doc(db, 'posts', postId);
        await deleteDoc(postRef);
        await loadPosts();
      } catch (error) {
        console.error('글 삭제 실패:', error);
      }
    },
    [loadPosts]
  );

  // 조회수 증가
  const incrementViews = useCallback(async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, { views: increment(1) });
    } catch (error) {
      console.error('조회수 증가 실패:', error);
    }
  }, []);

  // 좋아요 증가
  const likePost = useCallback(async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, { likes: increment(1) });
    } catch (error) {
      console.error('좋아요 증가 실패:', error);
    }
  }, []);

  // 좋아요 취소
  const unlikePost = useCallback(async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, { likes: increment(-1) });
    } catch (error) {
      console.error('좋아요 취소 실패:', error);
    }
  }, []);

  // 댓글 추가
  const addComment = useCallback(async (postId, comment) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        commentList: arrayUnion(comment),
        comments: increment(1)
      });
      await loadPosts();
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  }, [loadPosts]);

  // 댓글 삭제
  const deleteComment = useCallback(async (postId, comment) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        commentList: arrayRemove(comment),
        comments: increment(-1)
      });
      await loadPosts();
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
    }
  }, [loadPosts]);

  // 댓글 수정
  const updateComment = useCallback(async (postId, oldComment, newText) => {
    try {
      const postRef = doc(db, 'posts', postId);
      // 기존 객체 삭제 후 새 객체 추가 (순서가 마지막으로 밀릴 수 있지만 간단한 구현)
      await updateDoc(postRef, {
        commentList: arrayRemove(oldComment)
      });
      const updatedComment = { ...oldComment, text: newText };
      await updateDoc(postRef, {
        commentList: arrayUnion(updatedComment)
      });
      await loadPosts();
    } catch (error) {
      console.error('댓글 수정 실패:', error);
    }
  }, [loadPosts]);

  return { posts, loading, createPost, updatePost, deletePost, incrementViews, likePost, unlikePost, addComment, deleteComment, updateComment };
}
