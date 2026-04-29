import BoardPage from '../components/BoardPage';
import VoiceWriter from '../components/VoiceWriter';
import useBoardPosts from '../hooks/useBoardPosts';

function Education() {
  const { posts, createPost, updatePost, deletePost, incrementViews, likePost, unlikePost, addComment, deleteComment, updateComment } = useBoardPosts('education');

  return (
    <div>
      <VoiceWriter onPostCreate={createPost} />

      <BoardPage
        title="디지털 교육 게시판"
        emoji="📱"
        description="스마트폰, 키오스크 사용법 등 유용한 정보를 공유해요."
        accentColor="#8e44ad"
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

export default Education;