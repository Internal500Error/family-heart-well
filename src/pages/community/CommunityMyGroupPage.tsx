import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Group, Loader } from 'lucide-react';
import { communityService } from '@/lib/api-client';
import { CommunityShell } from './CommunityShell';

const CommunityMyGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatDraft, setChatDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;
    const fetchData = async () => {
      setIsLoading(true);
      const [membersResp, chatResp] = await Promise.all([
        communityService.getGroupMembers(groupId),
        communityService.getGroupChat(groupId),
      ]);
      if (!membersResp.error) setGroupMembers(Array.isArray(membersResp.data) ? membersResp.data : []);
      if (!chatResp.error) setChatMessages(Array.isArray(chatResp.data) ? chatResp.data : []);
      setIsLoading(false);
    };
    fetchData();
  }, [groupId]);

  const handleSend = async () => {
    if (!groupId) return;
    if (!chatDraft.trim()) return setActionError('Message cannot be empty.');
    setIsSending(true); setActionError(null);
    const response = await communityService.sendGroupChatMessage(groupId, chatDraft.trim());
    setIsSending(false);
    if (response.error) return setActionError('Unable to send message.');
    setChatDraft('');
    const chatResp = await communityService.getGroupChat(groupId);
    if (!chatResp.error) setChatMessages(Array.isArray(chatResp.data) ? chatResp.data : []);
  };

  return (
    <CommunityShell actionError={actionError}>
      <Card className="glass border-0 shadow-premium">
        <CardHeader><CardTitle className="flex items-center text-lg"><Group className="h-5 w-5 mr-2 text-blue-500" />My Group Dashboard</CardTitle></CardHeader>
        <CardContent>
          {!groupId ? (
            <div className="text-center py-8"><Group className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-sm font-medium">No Group Selected</p><p className="text-xs text-muted-foreground mt-1 mb-4">Open Groups and choose a group to continue.</p><Button size="sm" onClick={() => navigate('/community/groups')}>View Groups</Button></div>
          ) : isLoading ? (
            <div className="flex items-center justify-center p-4 gap-2"><Loader className="h-5 w-5 animate-spin text-primary" /><span className="text-sm text-muted-foreground">Loading group details...</span></div>
          ) : (
            <>
              <div className="mb-4"><div className="font-semibold mb-2">Members</div><div className="flex flex-wrap gap-2">{groupMembers.slice(0, 8).map((member) => <span key={member.id} className="bg-muted/50 rounded px-3 py-1 text-xs font-medium border border-border/50">{member.user_name || member.name}</span>)}</div></div>
              <div><div className="font-semibold mb-2">Group Chat</div><div className="bg-muted/30 rounded-lg p-3 mb-3 border border-border/50 max-h-60 overflow-y-auto space-y-2">{chatMessages.length > 0 ? chatMessages.map((m) => <div key={m.id} className="p-2 rounded bg-background/80 border border-border/50"><div className="text-xs text-muted-foreground">{m.user_name || 'Member'}</div><div className="text-sm text-foreground">{m.content}</div></div>) : <p className="text-sm text-muted-foreground text-center">No messages yet. Start the conversation.</p>}</div><div className="flex gap-2"><input className="border px-3 py-2 rounded-md w-full text-sm" placeholder="Type a message..." value={chatDraft} onChange={(e) => setChatDraft(e.target.value)} /><Button size="sm" onClick={handleSend} disabled={isSending}>{isSending ? 'Sending...' : 'Send'}</Button></div></div>
            </>
          )}
        </CardContent>
      </Card>
    </CommunityShell>
  );
};

export default CommunityMyGroupPage;
