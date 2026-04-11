import React from 'react';
import { NavLink } from 'react-router-dom';
import { Flag, Group, MessageCircle, Trophy, Users } from 'lucide-react';

interface CommunityShellProps {
	children: React.ReactNode;
	actionError?: string | null;
	actionSuccess?: string | null;
}

const tabs = [
	{ to: '/community/leaderboard', label: 'Leaderboard', icon: Trophy },
	{ to: '/community/groups', label: 'Groups', icon: Users },
	{ to: '/community/my-group', label: 'My Group', icon: Group },
	{ to: '/community/challenges', label: 'Challenges', icon: Flag },
	{ to: '/community/feed', label: 'Feed', icon: MessageCircle },
];

export const CommunityShell: React.FC<CommunityShellProps> = ({
	children,
	actionError,
	actionSuccess,
}) => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20 p-4">
			<div className="max-w-3xl mx-auto space-y-6">
				<div className="mb-4">
					<h1 className="text-2xl font-bold text-foreground font-display mb-2">Community</h1>
					<div className="flex flex-wrap gap-2 mb-2">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							return (
								<NavLink
									key={tab.to}
									to={tab.to}
									className={({ isActive }) =>
										`inline-flex items-center rounded-md px-3 py-2 text-sm border transition-colors ${
											isActive
												? 'bg-primary text-primary-foreground border-primary'
												: 'bg-background border-border hover:bg-muted'
										}`
									}
								>
									<Icon className="h-4 w-4 mr-1" /> {tab.label}
								</NavLink>
							);
						})}
					</div>
				</div>

				{actionError && (
					<div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
						{actionError}
					</div>
				)}
				{actionSuccess && (
					<div className="rounded-md border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm">
						{actionSuccess}
					</div>
				)}

				{children}
			</div>
		</div>
	);
};

