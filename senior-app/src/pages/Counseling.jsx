import BoardPage from '../components/BoardPage';
import VoiceWriter from '../components/VoiceWriter';
import useBoardPosts from '../hooks/useBoardPosts';

function Counseling() {
  const { posts, createPost, updatePost, deletePost, incrementViews, likePost, unlikePost, addComment, deleteComment, updateComment } = useBoardPosts('counseling');

  return (
    <div>
      <VoiceWriter onPostCreate={createPost} />

      <BoardPage
        title="고민상담방"
        emoji="🤝"
        description="어려운 일이나 고민이 있다면 함께 나눠요."
        accentColor="#d35400"
        posts={posts}
        onAddPost={createPost}
        onEditPost={updatePost}
        onDeletePost={deletePost}
        onIncrementViews={incrementViews}
        onLikePost={likePost}
        onUnlikePost={unlikePost}
        onAddComment={addComment}
        onDeleteComment={deleteComment}
        onUpdateComment={updateComment}
      />
    </div>
  );
}

export default Counseling;