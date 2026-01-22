
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
        <div className="space-y-6 animate-slide-up">
            {/* Header */}
            <Card className="glass border-0 shadow-premium overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5" />
                <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-purple-50 rounded-2xl p-3">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-display font-bold text-foreground">
                                    Family Dashboard
                                </h1>
                                <p className="text-muted-foreground">
                                    Monitor your parents' health in real-time
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
                <Card className="glass border-0 shadow-premium">
                    <CardContent className="p-8 text-center">
                        <div className="bg-muted/50 rounded-full p-4 w-fit mx-auto mb-4">
                            <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-display font-bold text-lg mb-2">No Parents Linked</h3>
                        <p className="text-muted-foreground mb-6">
                            Ask your parent to share their link code from their Profile page
                        </p>

                        <Dialog open={showAddParent} onOpenChange={setShowAddParent}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                                    <Link className="h-4 w-4 mr-2" />
                                    Enter Parent's Code
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="glass">
                                <DialogHeader>
                                    <DialogTitle>Link to Parent</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <p className="text-sm text-muted-foreground">
                                        Ask your parent to open their <strong>Profile</strong> page and share their 6-character link code with you.
                                    </p>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Parent's Link Code</label>
                                        <Input
                                            placeholder="e.g., Z4C2WR"
                                            value={linkCode}
                                            onChange={(e) => {
                                                setLinkCode(e.target.value.toUpperCase());
                                                setLinkError('');
                                            }}
                                            maxLength={6}
                                            className="text-center text-2xl tracking-widest font-mono"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Relationship</label>
                                        <Select value={relationship} onValueChange={(v) => setRelationship(v as any)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select relationship" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="mother">Mother</SelectItem>
                                                <SelectItem value="father">Father</SelectItem>
                                                <SelectItem value="guardian">Guardian</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {linkError && (
                                        <p className="text-sm text-destructive">{linkError}</p>
                                    )}

                                    <Button
                                        onClick={handleLinkParent}
                                        disabled={linking || linkCode.length < 6}
                                        className="w-full"
                                    >
                                        {linking ? 'Linking...' : 'Connect to Parent'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            )}

            {/* Parent Health Cards */}
            {parents.map((parent) => (
                <ParentHealthCard
                    key={parent.linkCode}
                    parent={parent}
                    onUnlink={() => handleUnlinkParent(parent.linkCode)}
                />
            ))}

            {/* Add Another Parent */}
            {parents.length > 0 && (
                <Button
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => setShowAddParent(true)}
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Link Another Parent
                </Button>
            )}
        </div>
    );
};

// Parent Health Card Component
const ParentHealthCard = ({ parent, onUnlink }: { parent: ParentHealthSummary; onUnlink: () => void }) => {
    const getRelationshipEmoji = (rel: string) => {
        switch (rel) {
            case 'mother': return '👩';
            case 'father': return '👨';
            default: return '👤';
        }
    };

    const getBPStatus = () => {
        const bp = parent.healthStats.bloodPressure;
        if (!bp) return null;

        if (bp.systolic >= 140 || bp.diastolic >= 90) {
            return { status: 'High', color: 'text-destructive', bg: 'bg-destructive/10' };
        } else if (bp.systolic >= 120 || bp.diastolic >= 80) {
            return { status: 'Elevated', color: 'text-warning', bg: 'bg-warning/10' };
        }
        return { status: 'Normal', color: 'text-success', bg: 'bg-success/10' };
    };

    const bpStatus = getBPStatus();

    return (
        <Card className="glass border-0 shadow-premium overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${parent.relationship === 'mother'
                    ? 'from-pink-500/5 to-purple-500/5'
                    : 'from-blue-500/5 to-cyan-500/5'
                }`} />

            <CardHeader className="relative pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`${parent.relationship === 'mother'
                                ? 'bg-pink-50'
                                : 'bg-blue-50'
                            } rounded-2xl p-3 text-2xl`}>
                            {getRelationshipEmoji(parent.relationship)}
                        </div>
                        <div>
                            <CardTitle className="text-lg">{parent.name}</CardTitle>
                            <p className="text-xs text-muted-foreground capitalize">
                                {parent.relationship}
                            </p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex space-x-2">
                        <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 bg-success/10 hover:bg-success/20">
                            <Phone className="h-4 w-4 text-success" />
                        </Button>
                        <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 bg-primary/10 hover:bg-primary/20">
                            <Bell className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-full h-10 w-10 bg-destructive/10 hover:bg-destructive/20"
                            onClick={onUnlink}
                            title="Unlink parent"
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative space-y-4">
                {/* Alerts */}
                {parent.alerts.length > 0 && (
                    <div className="space-y-2">
                        {parent.alerts.map((alert) => (
                            <AlertBadge key={alert.id} alert={alert} />
                        ))}
                    </div>
                )}

                {/* Health Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Blood Pressure */}
                    {parent.healthStats.bloodPressure && (
                        <div className={`${bpStatus?.bg || 'bg-muted/50'} rounded-xl p-3`}>
                            <div className="flex items-center space-x-2 mb-1">
                                <Heart className={`h-4 w-4 ${bpStatus?.color || 'text-muted-foreground'}`} />
                                <span className="text-xs font-medium text-muted-foreground">Blood Pressure</span>
                            </div>
                            <p className="text-lg font-bold">
                                {parent.healthStats.bloodPressure.systolic}/{parent.healthStats.bloodPressure.diastolic}
                            </p>
                            <p className={`text-xs font-medium ${bpStatus?.color}`}>{bpStatus?.status}</p>
                        </div>
                    )}

                    {/* Blood Sugar */}
                    {parent.healthStats.bloodSugar && (
                        <div className="bg-amber-50 rounded-xl p-3">
                            <div className="flex items-center space-x-2 mb-1">
                                <Activity className="h-4 w-4 text-amber-600" />
                                <span className="text-xs font-medium text-muted-foreground">Blood Sugar</span>
                            </div>
                            <p className="text-lg font-bold">{parent.healthStats.bloodSugar.value} mg/dL</p>
                            <p className="text-xs text-amber-600">
                                {parent.healthStats.bloodSugar.value < 100 ? 'Normal' : 'Elevated'}
                            </p>
                        </div>
                    )}

                    {/* Steps */}
                    <div className="bg-orange-50 rounded-xl p-3">
                        <div className="flex items-center space-x-2 mb-1">
                            <Footprints className="h-4 w-4 text-orange-600" />
                            <span className="text-xs font-medium text-muted-foreground">Steps Today</span>
                        </div>
                        <p className="text-lg font-bold">{parent.healthStats.stepsToday?.toLocaleString()}</p>
                        <p className="text-xs text-orange-600">
                            {(parent.healthStats.stepsToday || 0) >= 5000 ? 'On track!' : 'Needs activity'}
                        </p>
                    </div>

                    {/* Water Intake */}
                    <div className="bg-blue-50 rounded-xl p-3">
                        <div className="flex items-center space-x-2 mb-1">
                            <Droplets className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-medium text-muted-foreground">Water</span>
                        </div>
                        <p className="text-lg font-bold">{parent.healthStats.waterIntake} ml</p>
                        <p className="text-xs text-blue-600">
                            {(parent.healthStats.waterIntake || 0) >= 1500 ? 'Well hydrated' : 'Drink more water'}
                        </p>
                    </div>
                </div>

                {/* Medicine Adherence */}
                <div className="bg-white/60 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            <Pill className="h-5 w-5 text-primary" />
                            <span className="font-medium">Medicine Today</span>
                        </div>
                        <span className="text-sm font-bold text-primary">
                            {parent.medicineAdherence.takenToday}/{parent.medicineAdherence.totalMedicines}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all"
                            style={{
                                width: `${(parent.medicineAdherence.takenToday / parent.medicineAdherence.totalMedicines) * 100}%`
                            }}
                        />
                    </div>

                    {/* Next Due */}
                    {parent.medicineAdherence.nextDue && (
                        <div className="flex items-center space-x-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Next:</span>
                            <span className="font-medium">{parent.medicineAdherence.nextDue.name}</span>
                            <span className="text-primary font-medium">@ {parent.medicineAdherence.nextDue.time}</span>
                        </div>
                    )}

                    {/* Missed Alert */}
                    {parent.medicineAdherence.missedToday > 0 && (
                        <div className="flex items-center space-x-2 text-sm mt-2 text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <span>{parent.medicineAdherence.missedToday} medicine(s) missed today</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

// Alert Badge Component
const AlertBadge = ({ alert }: { alert: HealthAlert }) => {
    const getAlertStyle = () => {
        if (alert.severity === 'critical') {
            return 'bg-destructive/10 border-destructive/30 text-destructive';
        }
        return 'bg-warning/10 border-warning/30 text-warning';
    };

    return (
        <div className={`flex items-center justify-between p-3 rounded-lg border ${getAlertStyle()}`}>
            <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{alert.message}</span>
            </div>
            <Button size="icon" variant="ghost" className="h-6 w-6">
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
};

export default ChildDashboard;
