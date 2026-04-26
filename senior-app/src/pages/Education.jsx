import BoardPage from '../components/BoardPage';
import VoiceWriter from '../components/VoiceWriter';
import useBoardPosts from '../hooks/useBoardPosts';

function Education() {
  const { posts, createPost, updatePost, deletePost } = useBoardPosts('education');

  return (
    <div>
      <VoiceWriter onPostCreate={createPost} />

      <BoardPage
        title="교육 게시판"
        emoji="📚"
        description="건강·디지털·취미 등 유익한 정보를 나눠요."
        accentColor="#c62828"
        posts={posts}
        onAddPost={createPost}
        onEditPost={updatePost}
        onDeletePost={deletePost}
      />
    </div>
  );
}

export default Education;