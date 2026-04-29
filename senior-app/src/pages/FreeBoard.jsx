import BoardPage from '../components/BoardPage';
import VoiceWriter from '../components/VoiceWriter';
import useBoardPosts from '../hooks/useBoardPosts';

function FreeBoard() {
  const { posts, createPost, updatePost, deletePost, incrementViews, likePost, unlikePost, addComment, deleteComment, updateComment } = useBoardPosts('free');

  return (
    <div>
      <VoiceWriter onPostCreate={createPost} />

      <BoardPage
        title="자유게시판"
        emoji="🗣️"
        description="일상부터 취미까지 무엇이든 자유롭게 이야기해요."
        accentColor="#1565c0"
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

export default FreeBoard;