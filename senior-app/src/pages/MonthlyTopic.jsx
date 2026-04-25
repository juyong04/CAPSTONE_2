import BoardPage from '../components/BoardPage';
import VoiceWriter from '../components/VoiceWriter';
import useBoardPosts from '../hooks/useBoardPosts';

function MonthlyTopic() {
  const { posts, createPost } = useBoardPosts('monthly');

  return (
    <div>
      <VoiceWriter onPostCreate={createPost} />

      <BoardPage
        title="이달의 주제"
        emoji="💬"
        description="매달 새로운 주제로 함께 이야기를 나눠요."
        accentColor="#3a7d44"
        posts={posts}
        onAddPost={createPost}
      />
    </div>
  );
}

export default MonthlyTopic;