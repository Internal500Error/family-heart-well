
import React, { useState } from 'react';
import {
    Heart,
    Activity,
    Pill,
    Droplets,
    Footprints,
    Phone,
    Bell,
    AlertTriangle,
    Clock,
    RefreshCw,
    UserPlus,
    Users,
    Sparkles,
    X,
    Link,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import FamilyService, { ParentHealthSummary, HealthAlert } from '@/lib/family-service';
import AddFamilyMembers from './AddFamilyMembers';

// Child user ID - in production would come from auth
const CHILD_USER_ID = 'child-user-001';

const ChildDashboard = () => {
    const [parents, setParents] = useState<ParentHealthSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddParent, setShowAddParent] = useState(false);
    const [linkCode, setLinkCode] = useState('');
    const [relationship, setRelationship] = useState<'mother' | 'father' | 'guardian'>('mother');
    const [linking, setLinking] = useState(false);
    const [linkError, setLinkError] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Load linked parents
    const loadParents = () => {
        setLoading(true);
        const familyService = FamilyService.getInstance();
        const summaries = familyService.getLinkedParentsSummaries(CHILD_USER_ID);
        setParents(summaries);
        setLastUpdated(new Date());
        setLoading(false);
    };

    // Initial load
    React.useEffect(() => {
        loadParents();

        // Refresh every 30 seconds
        const interval = setInterval(loadParents, 30000);
        return () => clearInterval(interval);
    }, []);

    // Handle linking parent
    const handleLinkParent = () => {
        if (!linkCode.trim() || linkCode.length < 6) {
            setLinkError('Please enter a valid 6-character code');
            return;
        }

        setLinking(true);
        setLinkError('');

        const familyService = FamilyService.getInstance();
        const success = familyService.linkParent(CHILD_USER_ID, linkCode.trim(), relationship);

        if (success) {
            setShowAddParent(false);
            setLinkCode('');
            loadParents();
        } else {
            setLinkError('No parent found with this code. Ask your parent to share their link code from their Profile page.');
        }

        setLinking(false);
    };

    // Unlink parent
    const handleUnlinkParent = (parentLinkCode: string) => {
        const familyService = FamilyService.getInstance();
        familyService.unlinkParent(CHILD_USER_ID, parentLinkCode);
        loadParents();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20">
            <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
                {/* Header */}
                <Card className="glass border-0 shadow-premium overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5" />
                    <CardContent className="p-6 relative">
                        <div className="flex flex-row items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="bg-purple-50 rounded-2xl p-3">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-display font-bold text-foreground">
                                        Family Dashboard
                                    </h1>
                                    <p className="text-muted-foreground">
                                        Monitor your Family's health in real-time
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={loadParents}
                                    className="rounded-full"
                                >
                                    <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                                <Sparkles className="h-6 w-6 text-purple-500/60 animate-float" />
                            </div>
                        </div>

                        {lastUpdated && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Last synced: {lastUpdated.toLocaleTimeString()}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Loading State */}
                {loading && parents.length === 0 && (
                    <Card className="glass border-0 shadow-premium">
                        <CardContent className="p-8 text-center">
                            <RefreshCw className="h-8 w-8 mx-auto text-primary animate-spin mb-4" />
                            <p className="text-muted-foreground">Loading family health data...</p>
                        </CardContent>
                    </Card>
                )}

                {/* No Parents Linked */}
                {!loading && parents.length === 0 && (
                    <AddFamilyMembers />
                )}
            </div>
        </div>
    );
};


export default ChildDashboard;
