import BoardPage from '../components/BoardPage';

const samplePosts = [
  {
    id: 1,
    title: '자식들이 전화를 잘 안 해요. 서운한 마음이 드는데 어떻게 할까요?',
    content: '아이들이 다 커서 독립하고 나니 연락이 뜸해졌어요. 바쁜 건 이해하는데 가끔 너무 서운합니다. 여러분은 이런 상황을 어떻게 마음을 다스리시나요? 제가 너무 예민한 건지도 모르겠어요.',
    author: '봄날의엄마',
    date: '2025-05-02',
    views: 205,
    comments: 34,
  },
  {
    id: 2,
    title: '무릎이 안 좋은데 운동을 해야 할까요?',
    content: '오래 걸으면 무릎이 아파서 운동을 못 하고 있어요. 그런데 주변에서 움직여야 더 낫는다고 하더라고요. 수영이나 물속 걷기가 좋다고 하던데 경험 있으신 분 계세요?',
    author: '건강이최고',
    date: '2025-04-30',
    views: 183,
    comments: 27,
  },
  {
    id: 3,
    title: '혼자 사는데 외로움을 극복하는 방법이 있을까요?',
    content: '배우자가 먼저 떠난 지 2년이 됐어요. 처음엔 많이 힘들었는데 요즘도 저녁이 되면 너무 조용해서 마음이 쓸쓸해요. 이 커뮤니티를 알게 되어서 조금 위안이 되긴 하는데... 좋은 방법 알려주세요.',
    author: '혼자이지만',
    date: '2025-04-27',
    views: 316,
    comments: 52,
  },
];

function Counseling() {
  return (
    <BoardPage
      title="고민상담"
      emoji="🤝"
      description="혼자 해결하기 어려운 고민을 함께 나눠요. 따뜻하게 이야기를 들어드릴게요."
      accentColor="#f9a825"
      posts={samplePosts}
    />
  );
}

export default Counseling;
