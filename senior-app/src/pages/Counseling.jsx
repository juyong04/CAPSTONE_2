import BoardPage from '../components/BoardPage';
import VoiceWriter from '../components/VoiceWriter';
import useBoardPosts from '../hooks/useBoardPosts';

function Counseling() {
  const { posts, createPost, updatePost, deletePost } = useBoardPosts('counseling');

  return (
    <div>
      <VoiceWriter onPostCreate={createPost} />

      <BoardPage
        title="고민상담"
        emoji="🤝"
        description="혼자 해결하기 어려운 고민을 함께 나눠요."
        accentColor="#f9a825"
        posts={posts}
        onAddPost={createPost}
        onEditPost={updatePost}
        onDeletePost={deletePost}
      />
    </div>
  );
}

export default Counseling;