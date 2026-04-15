import { useState } from 'react';
import BoardPage from '../components/BoardPage';
import VoiceWriter from '../components/VoiceWriter';

const samplePosts = [
  {
    id: 1,
    title: '오늘 텃밭에서 상추를 수확했어요! 🥬',
    content: '베란다 텃밭에서 씨 뿌린 지 한 달 만에 드디어 상추를 수확했답니다! 손주가 먹어보더니 맛있다고 하더라고요. 뭔가를 직접 키워서 먹는 게 이렇게 뿌듯할 줄 몰랐어요. 여러분도 텃밭 가꿔보세요!',
    author: '초록손',
    date: '2025-05-03',
    views: 88,
    comments: 14,
  },
  {
    id: 2,
    title: '어제 동네 노래방에서 뽕짝 한 판 했어요 ㅎㅎ',
    content: '친구들이랑 노래방에 갔더니 3시간이 어떻게 지나갔는지 모르겠어요. 조용필 노래 실컷 불렀더니 가슴이 다 시원하더라고요. 스트레스 해소에는 역시 노래가 최고인 것 같아요!',
    author: '노래꾼할아버지',
    date: '2025-05-01',
    views: 64,
    comments: 8,
  },
  {
    id: 3,
    title: '오늘 아침 공원에서 찍은 사진이에요',
    content: '매일 아침 6시에 공원 산책을 하는데 오늘 안개가 자욱하게 낀 모습이 너무 아름다웠어요. 비록 사진 실력이 부족하지만 그 느낌만큼은 전달됐으면 해서 올려봅니다.',
    author: '새벽산책',
    date: '2025-04-29',
    views: 112,
    comments: 22,
  },
];

function FreeBoard() {
  const [posts, setPosts] = useState(samplePosts);

  const handleVoicePostCreate = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <div>
      <VoiceWriter onPostCreate={handleVoicePostCreate} />
      <BoardPage
        title="자유게시판"
        emoji="🗣️"
        description="일상부터 취미까지 무엇이든 자유롭게 이야기해요. 규칙은 서로 존중하기뿐!"
        accentColor="#1565c0"
        posts={posts}
        onAddPost={handleVoicePostCreate}
      />
    </div>
  );
}

export default FreeBoard;
