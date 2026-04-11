import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flag, Loader, Plus } from 'lucide-react';
import { communityService } from '@/lib/api-client';
import { CommunityShell } from './CommunityShell';

const CommunityChallengesPage: React.FC = () => {
  const [challengeFilter, setChallengeFilter] = useState<'all' | 'active' | 'upcoming' | 'completed' | 'joined'>('all');
  const [challenges, setChallenges] = useState<any[]>([]);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchChallenges = async () => {
    setIsLoadingChallenges(true);
    const params = challengeFilter === 'joined' ? { joined: 'true' } : challengeFilter === 'all' ? undefined : { status: challengeFilter };
    const response = await communityService.getChallenges(params);
    if (!response.error) setChallenges(Array.isArray(response.data) ? response.data : []);
    setIsLoadingChallenges(false);
  };

  useEffect(() => { fetchChallenges(); }, [challengeFilter]);

  const handleChallengeAction = async (challenge: any) => {
    setIsActionLoading(true); setActionError(null); setActionSuccess(null);
    const response = challenge.joined ? await communityService.leaveChallenge(String(challenge.id)) : await communityService.joinChallenge(String(challenge.id));
    setIsActionLoading(false);
    if (response.error) return setActionError(challenge.joined ? 'Unable to leave challenge.' : 'Unable to join challenge.');
    setActionSuccess(challenge.joined ? 'Left challenge successfully.' : 'Joined challenge successfully.');
    await fetchChallenges();
  };

  return (
    <CommunityShell actionError={actionError} actionSuccess={actionSuccess}>
      <Card className="glass border-0 shadow-premium">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center text-lg"><Flag className="h-5 w-5 mr-2 text-purple-500" />Challenges</CardTitle>
            <select value={challengeFilter} onChange={(e) => setChallengeFilter(e.target.value as any)} className="border rounded-md px-2 py-1 text-sm bg-background">
              <option value="all">All</option><option value="active">Active</option><option value="upcoming">Upcoming</option><option value="completed">Completed</option><option value="joined">Joined</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingChallenges ? <div className="flex items-center justify-center p-4 gap-2"><Loader className="h-5 w-5 animate-spin text-primary" /><span className="text-sm text-muted-foreground">Loading challenges...</span></div> : (
            <div className="space-y-3">
              {challenges.length > 0 ? challenges.map((challenge) => (
                <div key={challenge.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1"><div className="font-semibold text-foreground">{challenge.name || challenge.title}</div><div className="text-xs text-muted-foreground">{challenge.description || 'No description'}</div></div>
                  <div className="flex flex-col items-end">{challenge.progress !== undefined && <div className="text-xs mb-1">Progress: {challenge.progress || 0}%</div>}<Button size="sm" variant={challenge.joined ? 'default' : 'outline'} disabled={isLoadingChallenges || isActionLoading} onClick={() => handleChallengeAction(challenge)}>{challenge.joined ? 'Leave' : 'Join'}</Button></div>
                </div>
              )) : <p className="text-sm text-muted-foreground text-center py-4">No challenges available yet</p>}
              <Button variant="outline" className="w-full mt-2" disabled><Plus className="h-4 w-4 mr-1" /> Create Challenge</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </CommunityShell>
  );
};

export default CommunityChallengesPage;
