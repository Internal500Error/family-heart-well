import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, MessageCircle } from 'lucide-react';
import { communityService } from '@/lib/api-client';
import { CommunityShell } from './CommunityShell';

const CommunityFeedPage: React.FC = () => {
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [feedDraft, setFeedDraft] = useState('');
  const [feedComments, setFeedComments] = useState<Record<string, any[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchFeed = async () => {
    setIsLoadingFeed(true);
    const response = await communityService.getFeed();
    if (!response.error) setFeedPosts(Array.isArray(response.data) ? response.data : []);
    setIsLoadingFeed(false);
  };

  useEffect(() => { fetchFeed(); }, []);

  const fetchCommentsForPost = async (postId: string) => {
    const response = await communityService.getFeedComments(postId);
    if (!response.error) setFeedComments((prev) => ({ ...prev, [postId]: Array.isArray(response.data) ? response.data : [] }));
  };

  const handleCreateFeedPost = async () => {
    if (!feedDraft.trim()) return setActionError('Post content is required.');
    setIsActionLoading(true); setActionError(null); setActionSuccess(null);
    const response = await communityService.addFeedPost({ content: feedDraft.trim() });
    setIsActionLoading(false);
    if (response.error) return setActionError('Unable to create post.');
    setFeedDraft(''); setActionSuccess('Post shared successfully.');
    await fetchFeed();
  };

  const handleToggleFeedLike = async (postId: string) => {
    const response = await communityService.toggleFeedLike(postId);
    if (response.error) return setActionError('Unable to like post.');
    await fetchFeed();
  };

  const handleAddComment = async (postId: string) => {
    const content = (commentDrafts[postId] || '').trim();
    if (!content) return setActionError('Comment cannot be empty.');
    const response = await communityService.addFeedComment(postId, content);
    if (response.error) return setActionError('Unable to add comment.');
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
    await fetchCommentsForPost(postId);
    await fetchFeed();
  };

  return (
    <CommunityShell actionError={actionError} actionSuccess={actionSuccess}>
      <Card className="glass border-0 shadow-premium">
        <CardHeader><CardTitle className="flex items-center text-lg"><MessageCircle className="h-5 w-5 mr-2 text-green-500" />Community Feed</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-4"><div className="flex gap-2"><input className="border px-3 py-2 rounded-md w-full text-sm" placeholder="Share your update..." value={feedDraft} onChange={(e) => setFeedDraft(e.target.value)} /><Button size="sm" onClick={handleCreateFeedPost} disabled={isActionLoading}><CheckCircle className="h-4 w-4 mr-1" /> Post</Button></div></div>
          {isLoadingFeed ? <div className="text-sm text-muted-foreground text-center py-4">Loading feed...</div> : feedPosts.length > 0 ? (
            <div className="space-y-3">{feedPosts.map((post) => (
              <div key={post.id} className="p-3 rounded-lg bg-muted/40 border border-border/50">
                <div className="text-sm font-semibold text-foreground">{post.user_name || 'Member'}</div>
                <div className="text-xs text-muted-foreground mb-2">{post.group_name || 'Global'}</div>
                <div className="text-sm mb-2">{post.content}</div>
                <div className="flex items-center gap-2 mb-2"><Button size="sm" variant="outline" onClick={() => handleToggleFeedLike(String(post.id))}>{post.is_liked_by_me ? 'Unlike' : 'Like'} ({post.likes_count || 0})</Button><Button size="sm" variant="outline" onClick={() => fetchCommentsForPost(String(post.id))}>Comments ({post.comments_count || 0})</Button></div>
                {(feedComments[String(post.id)] || []).length > 0 && <div className="space-y-1 mb-2">{feedComments[String(post.id)].map((comment) => <div key={comment.id} className="text-xs p-2 rounded bg-background/90 border border-border/40"><span className="font-semibold">{comment.user_name || 'Member'}: </span>{comment.content}</div>)}</div>}
                <div className="flex gap-2"><input className="border px-2 py-1 rounded-md w-full text-xs" placeholder="Write a comment..." value={commentDrafts[String(post.id)] || ''} onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [String(post.id)]: e.target.value }))} /><Button size="sm" onClick={() => handleAddComment(String(post.id))}>Send</Button></div>
              </div>
            ))}</div>
          ) : <div className="text-sm text-muted-foreground text-center py-4">No posts yet. Share the first update.</div>}
          <div className="mt-3"><Button size="sm" variant="outline" onClick={fetchFeed}>Refresh Feed</Button></div>
        </CardContent>
      </Card>
    </CommunityShell>
  );
};

export default CommunityFeedPage;
