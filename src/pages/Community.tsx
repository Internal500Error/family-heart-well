
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Group, TrendingUp, MessageCircle, Plus, Flag, Bell, Info, CheckCircle, UserPlus, Award } from 'lucide-react';

// Mock Data
const mockLeaderboard = [
  { name: 'Dr. Sharma', steps: 12000 },
  { name: 'Anjali', steps: 10500 },
  { name: 'Rohan', steps: 9800 },
  { name: 'Priya', steps: 8700 },
  { name: 'You', steps: 8000 },
];
const mockGroups = [
  { name: 'Sharma Family', members: 4, totalSteps: 41000, id: 1 },
  { name: 'Office Friends', members: 6, totalSteps: 52000, id: 2 },
];
const mockFeed = [
  { user: 'Anjali', message: 'Completed 10,000 steps today! 🎉' },
  { user: 'Rohan', message: 'Won the weekly challenge!' },
  { user: 'You', message: '7-day streak badge unlocked!' },
];
const mockChallenges = [
  { name: 'Weekly Step Challenge', progress: 80, joined: true, reward: '🏆' },
  { name: 'Family 50k Steps', progress: 40, joined: false, reward: '🎖️' },
];
const mockGroupMembers = [
  { name: 'Dr. Sharma', steps: 12000 },
  { name: 'Anjali', steps: 10500 },
  { name: 'Rohan', steps: 9800 },
  { name: 'Priya', steps: 8700 },
];
const mockNotifications = [
  { message: 'You have been invited to join "Office Friends" group.', type: 'invite' },
  { message: 'New challenge: Family 50k Steps!', type: 'challenge' },
];

const Community: React.FC = () => {
  const [tab, setTab] = useState<'leaderboard' | 'groups' | 'feed' | 'challenges' | 'mygroup'>('leaderboard');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);


  // Contextual Help
  const help = (
    <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
      <Info className="h-4 w-4" />
      Compete with friends & family, join groups, and take on challenges!
    </div>
  );

  // Notification Bell (improved design, handles overflow)
  const notifications = (
    <div className="relative mb-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
          <div className="flex gap-2 min-w-0">
            {mockNotifications.map((n, i) => (
              <span
                key={i}
                className="inline-block bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg px-3 py-2 text-xs text-foreground font-medium shadow-sm whitespace-nowrap max-w-xs truncate"
                title={n.message}
              >
                {n.message}
              </span>
            ))}
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
          Sharma Family (Group Dashboard)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="font-semibold mb-1">Members</div>
          <div className="flex flex-wrap gap-2">
            {mockGroupMembers.map((m, i) => (
              <span key={i} className="bg-muted/50 rounded px-3 py-1 text-xs font-medium">
                {m.name} <span className="text-primary font-bold">{m.steps.toLocaleString()} steps</span>
              </span>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-1">Group Leaderboard</div>
          <div className="space-y-1">
            {mockGroupMembers.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30">
                <span>{i + 1}. {m.name}</span>
                <span className="font-bold text-blue-600">{m.steps.toLocaleString()} steps</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="font-semibold mb-1">Group Chat</div>
          <div className="bg-muted/30 rounded p-2 mb-2 text-xs">(Mock) "Let's win this week's challenge!"</div>
          <input className="border p-2 rounded w-full mb-2" placeholder="Type a message..." />
          <Button size="sm" className="w-full">Send</Button>
        </div>
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
        <div className="space-y-3">
          {mockChallenges.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <div className="font-semibold text-foreground">{c.name}</div>
                <div className="text-xs text-muted-foreground">Reward: {c.reward}</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-xs mb-1">Progress: {c.progress}%</div>
                <Button size="sm" variant={c.joined ? 'default' : 'outline'}>{c.joined ? 'View' : 'Join'}</Button>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-2">
            <Plus className="h-4 w-4 mr-1" /> Create Challenge
          </Button>
        </div>
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
  {notifications}
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
              <div className="space-y-3">
                {mockLeaderboard.map((entry, idx) => (
                  <div key={entry.name} className={`flex items-center justify-between p-3 rounded-lg ${idx === 0 ? 'bg-orange-50' : 'bg-muted/50'}`}> 
                    <span className="font-medium text-foreground">{idx + 1}. {entry.name}</span>
                    <span className="font-bold text-orange-600">{entry.steps.toLocaleString()} steps</span>
                  </div>
                ))}
              </div>
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
              <div className="space-y-3">
                {mockGroups.map((group) => (
                  <div key={group.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <div className="font-semibold text-foreground">{group.name}</div>
                      <div className="text-xs text-muted-foreground">{group.members} members</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-blue-600 font-bold">{group.totalSteps.toLocaleString()} steps</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => { setSelectedGroup(group.id); setTab('mygroup'); }}>View</Button>
                  </div>
                ))}
              </div>
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
                Community Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockFeed.map((item, idx) => (
                  <div key={idx} className="flex items-center p-3 rounded-lg bg-muted/50">
                    <span className="font-semibold text-primary mr-2">{item.user}:</span>
                    <span className="text-foreground">{item.message}</span>
                  </div>
                ))}
                <div className="flex gap-2 mt-4">
                  <input className="border p-2 rounded w-full" placeholder="Share something..." />
                  <Button size="sm"><CheckCircle className="h-4 w-4 mr-1" /> Post</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Community;
