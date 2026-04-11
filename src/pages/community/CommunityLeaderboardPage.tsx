import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, TrendingUp } from 'lucide-react';
import { communityService } from '@/lib/api-client';
import { CommunityShell } from './CommunityShell';

const CommunityLeaderboardPage: React.FC = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      const response = await communityService.getLeaderboard({ period });
      if (!response.error) {
        const payload = response.data as any;
        if (Array.isArray(payload)) setLeaderboard(payload);
        else if (Array.isArray(payload?.entries)) setLeaderboard(payload.entries);
        else setLeaderboard([]);
      }
      setIsLoading(false);
    };
    fetchLeaderboard();
  }, [period]);

  return (
    <CommunityShell>
      <Card className="glass border-0 shadow-premium">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
              Step Leaderboard
            </CardTitle>
            <select value={period} onChange={(e) => setPeriod(e.target.value as any)} className="border rounded-md px-2 py-1 text-sm bg-background">
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-4 gap-2">
              <Loader className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading leaderboard...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.length > 0 ? leaderboard.map((entry, idx) => (
                <div key={entry.id || idx} className={`flex items-center justify-between p-3 rounded-lg ${idx === 0 ? 'bg-orange-50' : 'bg-muted/50'}`}>
                  <span className="font-medium text-foreground">{idx + 1}. {entry.user_name || entry.name}</span>
                  <span className="font-bold text-orange-600">{(entry.total_steps || entry.steps || 0).toLocaleString()} steps</span>
                </div>
              )) : <p className="text-sm text-muted-foreground text-center py-4">No leaderboard data available</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </CommunityShell>
  );
};

export default CommunityLeaderboardPage;
