import BoardPage from '../components/BoardPage';
import VoiceWriter from '../components/VoiceWriter';
import useBoardPosts from '../hooks/useBoardPosts';

function MonthlyTopic() {
  const { posts, createPost, updatePost, deletePost, incrementViews, likePost, unlikePost, addComment, deleteComment, updateComment } = useBoardPosts('monthly');

  return (
    <div>
      <VoiceWriter onPostCreate={createPost} />

      <BoardPage
        title="월간 주제 게시판"
        emoji="💬"
        description="매달 새로운 주제로 함께 이야기를 나눠요."
        accentColor="#3a7d44"
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

export default MonthlyTopic;