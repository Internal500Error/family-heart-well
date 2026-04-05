
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Group, TrendingUp, MessageCircle, Plus, Flag, Bell, Info, CheckCircle, UserPlus, Award, Loader } from 'lucide-react';
import { communityService } from '@/lib/api-client';

// Group members logic uses actual fetched members

const Community: React.FC = () => {
  const [tab, setTab] = useState<'leaderboard' | 'groups' | 'feed' | 'challenges' | 'mygroup'>('leaderboard');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  
  // State for API data
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  
  // Loading states
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Load leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoadingLeaderboard(true);
      try {
        const response = await communityService.getLeaderboard({ limit: 10 });
        if (!response.error) {
          setLeaderboard(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Load groups
  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoadingGroups(true);
      try {
        const response = await communityService.getGroups();
        if (!response.error) {
          setGroups(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        console.error('Failed to load groups:', err);
      } finally {
        setIsLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  // Load challenges
  useEffect(() => {
    const fetchChallenges = async () => {
      setIsLoadingChallenges(true);
      try {
        const response = await communityService.getChallenges();
        if (!response.error) {
          setChallenges(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        console.error('Failed to load challenges:', err);
      } finally {
        setIsLoadingChallenges(false);
      }
    };
    fetchChallenges();
  }, []);

  // Load notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoadingNotifications(true);
      try {
        const response = await communityService.getNotifications();
        if (!response.error) {
          setNotifications(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setIsLoadingNotifications(false);
      }
    };
    fetchNotifications();
  }, []);

  // Load group members when a group is selected
  useEffect(() => {
    if (selectedGroup) {
      const fetchGroupMembers = async () => {
        try {
          const response = await communityService.getGroupMembers(String(selectedGroup));
          if (!response.error) {
            setGroupMembers(Array.isArray(response.data) ? response.data : []);
          }
        } catch (err) {
          console.error('Failed to load group members:', err);
        }
      };
      fetchGroupMembers();
    }
  }, [selectedGroup]);


  // Contextual Help
  const help = (
    <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
      <Info className="h-4 w-4" />
      Compete with friends & family, join groups, and take on challenges!
    </div>
  );

  // Notification Bell (improved design, handles overflow)
  const notificationsBell = (
    <div className="relative mb-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
          <div className="flex gap-2 min-w-0">
            {isLoadingNotifications ? (
              <span className="inline-block text-xs text-muted-foreground whitespace-nowrap">
                <Loader className="h-3 w-3 inline animate-spin mr-1" /> Loading notifications...
              </span>
            ) : notifications.length > 0 ? (
              notifications.map((n, i) => (
                <span
                  key={i}
                  className="inline-block bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg px-3 py-2 text-xs text-foreground font-medium shadow-sm whitespace-nowrap max-w-xs truncate"
                  title={n.message || n.description}
                >
                  {n.message || n.description}
                </span>
              ))
            ) : (
              <span className="inline-block text-xs text-muted-foreground whitespace-nowrap">No new notifications</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Create/Join Group Modals (mocked)
  const groupModals = (
    <>
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-xs w-full">
            <h2 className="font-bold mb-2">Create Group</h2>
            <input className="border p-2 rounded w-full mb-3" placeholder="Group Name" />
            <Button className="w-full mb-2">Create</Button>
            <Button variant="outline" className="w-full" onClick={() => setShowCreateGroup(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {showJoinGroup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-xs w-full">
            <h2 className="font-bold mb-2">Join Group</h2>
            <input className="border p-2 rounded w-full mb-3" placeholder="Invite Code" />
            <Button className="w-full mb-2">Join</Button>
            <Button variant="outline" className="w-full" onClick={() => setShowJoinGroup(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </>
  );

  // Group Dashboard
  const groupDashboard = (
    <Card className="glass border-0 shadow-premium">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Group className="h-5 w-5 mr-2 text-blue-500" />
          My Group Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedGroup ? (
          <>
            <div className="mb-4">
              <div className="font-semibold mb-2">Members</div>
              <div className="flex flex-wrap gap-2">
                {groupMembers.slice(0, 5).map((m, i) => (
                  <span key={i} className="bg-muted/50 rounded px-3 py-1 text-xs font-medium border border-border/50">
                    {m.user_name || m.name} <span className="text-primary font-bold ml-1">{m.total_steps?.toLocaleString() || m.steps?.toLocaleString() || '0'} steps</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <div className="font-semibold mb-2">Group Leaderboard</div>
              <div className="space-y-1.5">
                {groupMembers.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50">
                    <span className="font-medium text-sm">{i + 1}. {m.user_name || m.name}</span>
                    <span className="font-bold text-blue-600 text-sm">{m.total_steps?.toLocaleString() || m.steps?.toLocaleString() || '0'} steps</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2">Group Chat (Coming Soon)</div>
              <div className="bg-muted/30 rounded-lg p-3 mb-3 text-sm text-muted-foreground italic text-center border border-border/50">
                Chat feature will be available in the next update.
              </div>
              <div className="flex gap-2">
                <input className="border px-3 py-2 rounded-md w-full text-sm" placeholder="Type a message... (Disabled)" disabled />
                <Button size="sm" disabled>Send</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Group className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium">No Group Selected</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">Please join or select a group from the Groups tab to view its dashboard.</p>
            <Button size="sm" onClick={() => setTab('groups')}>View Groups</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Challenges Tab
  const challengesTab = (
    <Card className="glass border-0 shadow-premium">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Flag className="h-5 w-5 mr-2 text-purple-500" />
          Challenges
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingChallenges ? (
          <div className="flex items-center justify-center p-4 gap-2">
            <Loader className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading challenges...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.length > 0 ? (
              challenges.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.description || 'No description'}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    {c.progress !== undefined && <div className="text-xs mb-1">Progress: {c.progress || 0}%</div>}
                    <Button size="sm" variant={c.joined ? 'default' : 'outline'} disabled={isLoadingChallenges}>
                      {c.joined ? 'View' : 'Join'}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No challenges available yet</p>
            )}
            <Button variant="outline" className="w-full mt-2">
              <Plus className="h-4 w-4 mr-1" /> Create Challenge
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Main Render
  // Quick Actions (navigation) - must be inside the component to access tab/setTab
  const quickActions = (
    <div className="flex flex-wrap gap-2 mb-2">
      <Button variant={tab === 'leaderboard' ? 'default' : 'outline'} size="sm" onClick={() => setTab('leaderboard')}>
        <Trophy className="h-4 w-4 mr-1" /> Leaderboard
      </Button>
      <Button variant={tab === 'groups' ? 'default' : 'outline'} size="sm" onClick={() => setTab('groups')}>
        <Users className="h-4 w-4 mr-1" /> Groups
      </Button>
      <Button variant={tab === 'mygroup' ? 'default' : 'outline'} size="sm" onClick={() => setTab('mygroup')}>
        <Group className="h-4 w-4 mr-1" /> My Group
      </Button>
      <Button variant={tab === 'challenges' ? 'default' : 'outline'} size="sm" onClick={() => setTab('challenges')}>
        <Flag className="h-4 w-4 mr-1" /> Challenges
      </Button>
      <Button variant={tab === 'feed' ? 'default' : 'outline'} size="sm" onClick={() => setTab('feed')}>
        <MessageCircle className="h-4 w-4 mr-1" /> Feed
      </Button>
    </div>
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground font-display mb-2">Community</h1>
          {quickActions}
        </div>
  {notificationsBell}
  {help}
        {groupModals}
        {tab === 'leaderboard' && (
          <Card className="glass border-0 shadow-premium">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
                Step Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLeaderboard ? (
                <div className="flex items-center justify-center p-4 gap-2">
                  <Loader className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Loading leaderboard...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.length > 0 ? (
                    leaderboard.map((entry, idx) => (
                      <div key={entry.id || idx} className={`flex items-center justify-between p-3 rounded-lg ${idx === 0 ? 'bg-orange-50' : 'bg-muted/50'}`}> 
                        <span className="font-medium text-foreground">{idx + 1}. {entry.user_name || entry.name}</span>
                        <span className="font-bold text-orange-600">{(entry.total_steps || entry.steps || 0).toLocaleString()} steps</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No leaderboard data available</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {tab === 'groups' && (
          <Card className="glass border-0 shadow-premium">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Group className="h-5 w-5 mr-2 text-blue-500" />
                My Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingGroups ? (
                <div className="flex items-center justify-center p-4 gap-2">
                  <Loader className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Loading groups...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.length > 0 ? (
                    groups.map((group) => (
                      <div key={group.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">{group.name}</div>
                          <div className="text-xs text-muted-foreground">{group.member_count || 0} members</div>
                        </div>
                        <div className="text-right mr-3">
                          <div className="text-sm text-blue-600 font-bold">{(group.total_steps || 0).toLocaleString()} steps</div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => { setSelectedGroup(group.id); setTab('mygroup'); }}>View</Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No groups yet. Create one to get started!</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {tab === 'mygroup' && groupDashboard}
        {tab === 'challenges' && challengesTab}
        {tab === 'feed' && (
          <Card className="glass border-0 shadow-premium">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MessageCircle className="h-5 w-5 mr-2 text-green-500" />
                Community Feed (Coming Soon)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-5 text-center mb-4 border border-border/50">
                <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-foreground">Social Feed is under construction</p>
                <p className="text-xs text-muted-foreground mt-1">Soon you'll be able to share updates, photos, and cheer on other community members!</p>
              </div>
              <div className="flex gap-2">
                <input className="border px-3 py-2 rounded-md w-full text-sm disabled:opacity-50" placeholder="Share something... (Disabled)" disabled />
                <Button size="sm" disabled><CheckCircle className="h-4 w-4 mr-1" /> Post</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Community;
