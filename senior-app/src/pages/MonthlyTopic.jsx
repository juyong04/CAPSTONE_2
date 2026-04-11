import BoardPage from '../components/BoardPage';

const samplePosts = [
  {
    id: 1,
    title: '5월 주제: 내가 가장 좋아하는 계절 여행지',
    content: '저는 매년 봄이 되면 경주를 찾아갑니다. 벚꽃이 피는 시기에 불국사 주변을 걸으면 정말 마음이 편안해져요. 오래된 절과 꽃이 어우러진 풍경이 너무 아름답습니다. 여러분의 봄 여행지는 어디인가요?',
    author: '꽃바람할매',
    date: '2025-05-01',
    views: 142,
    comments: 18,
  },
  {
    id: 2,
    title: '가을엔 역시 단풍 구경! 설악산을 추천해요',
    content: '설악산 단풍은 정말 전국 최고라고 생각해요. 올해도 10월 초에 아들 가족과 함께 다녀왔는데 손자 손녀들도 너무 좋아했답니다.',
    author: '산행러버',
    date: '2025-04-28',
    views: 98,
    comments: 12,
  },
  {
    id: 3,
    title: '제주도는 사계절 내내 좋아요',
    content: '저는 여름 제주를 특히 좋아해요. 더울 때 바다에서 수영도 하고, 해산물도 먹고... 이번 여름도 제주 여행을 계획 중이랍니다.',
    author: '바다친구',
    date: '2025-04-25',
    views: 76,
    comments: 9,
  },
];

function MonthlyTopic() {
  return (
    <BoardPage
      title="이달의 주제"
      emoji="💬"
      description="매달 새로운 주제로 함께 이야기를 나눠요. 이번 달의 주제: 내가 가장 좋아하는 계절 여행지"
      accentColor="#3a7d44"
      posts={samplePosts}
    />
  );
}

export default MonthlyTopic;
