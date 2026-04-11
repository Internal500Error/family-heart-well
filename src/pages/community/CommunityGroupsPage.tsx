import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Group, Loader, Plus } from 'lucide-react';
import { communityService } from '@/lib/api-client';
import { CommunityShell } from './CommunityShell';

const CommunityGroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<any[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [createGroupName, setCreateGroupName] = useState('');
  const [createGroupDescription, setCreateGroupDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchGroups = async () => {
    setIsLoadingGroups(true);
    const response = await communityService.getGroups();
    if (!response.error) setGroups(Array.isArray(response.data) ? response.data : []);
    setIsLoadingGroups(false);
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleJoinPublicGroup = async (groupId: string) => {
    setIsActionLoading(true); setActionError(null); setActionSuccess(null);
    const response = await communityService.joinGroup(groupId);
    setIsActionLoading(false);
    if (response.error) return setActionError('Unable to join group.');
    setActionSuccess('Joined group successfully.');
    await fetchGroups();
  };

  const handleJoinGroupByInvite = async () => {
    if (!inviteCode.trim()) return setActionError('Invite code is required.');
    setIsActionLoading(true); setActionError(null); setActionSuccess(null);
    const response = await communityService.joinGroupByInvite(inviteCode.trim().toUpperCase());
    setIsActionLoading(false);
    if (response.error) return setActionError('Unable to join group with invite code.');
    setInviteCode(''); setShowJoinGroup(false); setActionSuccess('Joined group successfully.');
    await fetchGroups();
  };

  const handleLeaveGroup = async (groupId: string) => {
    setIsActionLoading(true); setActionError(null); setActionSuccess(null);
    const response = await communityService.leaveGroup(groupId);
    setIsActionLoading(false);
    if (response.error) return setActionError('Unable to leave group.');
    setActionSuccess('Left group successfully.');
    await fetchGroups();
  };

  const handleCreateGroup = async () => {
    if (!createGroupName.trim()) return setActionError('Group name is required.');
    setIsActionLoading(true); setActionError(null); setActionSuccess(null);
    const response = await communityService.addGroup({ name: createGroupName.trim(), description: createGroupDescription.trim(), is_public: true, max_members: 50 });
    setIsActionLoading(false);
    if (response.error) return setActionError('Unable to create group.');
    setCreateGroupName(''); setCreateGroupDescription(''); setShowCreateGroup(false); setActionSuccess('Group created successfully.');
    await fetchGroups();
  };

  return (
    <CommunityShell actionError={actionError} actionSuccess={actionSuccess}>
      {showCreateGroup && <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-6 shadow-lg max-w-xs w-full"><h2 className="font-bold mb-2">Create Group</h2><input className="border p-2 rounded w-full mb-3" placeholder="Group Name" value={createGroupName} onChange={(e) => setCreateGroupName(e.target.value)} /><input className="border p-2 rounded w-full mb-3" placeholder="Description (optional)" value={createGroupDescription} onChange={(e) => setCreateGroupDescription(e.target.value)} /><Button className="w-full mb-2" onClick={handleCreateGroup} disabled={isActionLoading}>{isActionLoading ? 'Creating...' : 'Create'}</Button><Button variant="outline" className="w-full" onClick={() => setShowCreateGroup(false)}>Cancel</Button></div></div>}
      {showJoinGroup && <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-6 shadow-lg max-w-xs w-full"><h2 className="font-bold mb-2">Join Group</h2><input className="border p-2 rounded w-full mb-3" placeholder="Invite Code" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} /><Button className="w-full mb-2" onClick={handleJoinGroupByInvite} disabled={isActionLoading}>{isActionLoading ? 'Joining...' : 'Join'}</Button><Button variant="outline" className="w-full" onClick={() => setShowJoinGroup(false)}>Cancel</Button></div></div>}

      <Card className="glass border-0 shadow-premium">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center text-lg"><Group className="h-5 w-5 mr-2 text-blue-500" />My Groups</CardTitle>
            <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setShowJoinGroup(true)}>Join via Invite</Button><Button size="sm" onClick={() => setShowCreateGroup(true)}><Plus className="h-4 w-4 mr-1" /> Create Group</Button></div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingGroups ? <div className="flex items-center justify-center p-4 gap-2"><Loader className="h-5 w-5 animate-spin text-primary" /><span className="text-sm text-muted-foreground">Loading groups...</span></div> : (
            <div className="space-y-3">
              {groups.length > 0 ? groups.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1"><div className="font-semibold text-foreground">{group.name}</div><div className="text-xs text-muted-foreground">{group.member_count || 0} members · {group.is_public ? 'Public' : 'Private'}</div></div>
                  <div className="flex gap-2">
                    {group.is_member ? <><Button size="sm" variant="outline" onClick={() => navigate(`/community/my-group/${group.id}`)}>View</Button><Button size="sm" variant="outline" onClick={() => handleLeaveGroup(String(group.id))} disabled={isActionLoading}>Leave</Button></> : <Button size="sm" variant="outline" onClick={() => handleJoinPublicGroup(String(group.id))} disabled={isActionLoading || !group.is_public}>{group.is_public ? 'Join' : 'Invite Only'}</Button>}
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground text-center py-4">No groups yet. Create one to get started!</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </CommunityShell>
  );
};

export default CommunityGroupsPage;
