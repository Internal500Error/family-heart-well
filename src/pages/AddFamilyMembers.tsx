import React, { useState } from 'react';
import {
    Users, Link, UserPlus, Phone, Bell, Trash2,
    Heart, Activity, Footprints, Droplets, Pill,
    Clock, AlertTriangle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ─── Types ────────────────────────────────────────────────────────────────────
type Relationship = 'mother' | 'father' | 'guardian' | 'brother' | 'sister' | 'grandpa';

interface HealthAlert {
    id: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
}

interface ParentHealthSummary {
    id: string;
    name: string;
    relationship: Relationship;
    linkCode: string;
    alerts: HealthAlert[];
    healthStats: {
        bloodPressure?: { systolic: number; diastolic: number };
        bloodSugar?: { value: number };
        stepsToday?: number;
        waterIntake?: number;
    };
    medicineAdherence: {
        takenToday: number;
        totalMedicines: number;
        missedToday: number;
        nextDue?: { name: string; time: string };
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const EMOJI_MAP: Record<string, string> = {
    mother: '👩', father: '👨', sister: '👧',
    brother: '👦', grandpa: '👴', guardian: '🧑',
};
const getEmoji = (rel: string) => EMOJI_MAP[rel] ?? '👤';

const getBPStatus = (bp?: { systolic: number; diastolic: number }) => {
    if (!bp) return null;
    if (bp.systolic >= 140 || bp.diastolic >= 90)
        return { label: 'High', color: 'text-red-600', bg: 'bg-red-50', dot: '#ef4444' };
    if (bp.systolic >= 120 || bp.diastolic >= 80)
        return { label: 'Elevated', color: 'text-amber-600', bg: 'bg-amber-50', dot: '#f59e0b' };
    return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-50', dot: '#22c55e' };
};

// ─── Mock builder (replace with real FamilyService call) ─────────────────────
const buildMockParent = (
    id: string, name: string,
    relationship: Relationship, linkCode: string,
): ParentHealthSummary => ({
    id, name, relationship, linkCode,
    alerts: [],
    healthStats: {
        bloodPressure: { systolic: 128, diastolic: 82 },
        bloodSugar: { value: 105 },
        stepsToday: 4500,
        waterIntake: 1500,
    },
    medicineAdherence: {
        takenToday: 3, totalMedicines: 4, missedToday: 0,
        nextDue: { name: 'Blood Pressure Med', time: '6:00 PM' },
    },
});

// ─── Link Dialog (defined OUTSIDE main component — fixes the remount bug) ─────
interface LinkDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onLink: (code: string, rel: Relationship) => Promise<void>;
}

const LinkDialog: React.FC<LinkDialogProps> = ({ open, onOpenChange, onLink }) => {
    // State lives here — stable across re-renders of the parent
    const [linkCode, setLinkCode] = useState('');
    const [relationship, setRelationship] = useState<Relationship | ''>('');
    const [linkError, setLinkError] = useState('');
    const [linking, setLinking] = useState(false);

    const handleSubmit = async () => {
        if (linkCode.length < 6) { setLinkError('Enter a valid 6-character code.'); return; }
        if (!relationship) { setLinkError('Please select a relationship.'); return; }
        setLinking(true);
        setLinkError('');
        try {
            await onLink(linkCode, relationship as Relationship);
            setLinkCode('');
            setRelationship('');
        } catch (err: any) {
            setLinkError(err?.message || 'Could not link. Check the code and try again.');
        } finally {
            setLinking(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) { setLinkCode(''); setRelationship(''); setLinkError(''); } onOpenChange(v); }}>
            <DialogContent className="rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Link className="h-4 w-4 text-purple-600" />
                        </div>
                        Link Family Member
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-1">
                    <p className="text-sm text-muted-foreground">
                        Ask your family member to open their <strong>Profile</strong> page and share their 6-character link code.
                    </p>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold">Link Code</label>
                        <Input
                            placeholder="e.g., Z4C2WR"
                            value={linkCode}
                            onChange={e => { setLinkCode(e.target.value.toUpperCase()); setLinkError(''); }}
                            maxLength={6}
                            className="text-center text-2xl tracking-widest font-mono h-14 rounded-xl"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold">Relationship</label>
                        <Select
                            value={relationship}
                            onValueChange={v => { setRelationship(v as Relationship); setLinkError(''); }}
                        >
                            <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mother">👩 Mother</SelectItem>
                                <SelectItem value="father">👨 Father</SelectItem>
                                <SelectItem value="guardian">🧑 Guardian</SelectItem>
                                <SelectItem value="brother">👦 Brother</SelectItem>
                                <SelectItem value="sister">👧 Sister</SelectItem>
                                <SelectItem value="grandpa">👴 Grandpa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {linkError && (
                        <p className="text-sm text-red-500 font-medium">{linkError}</p>
                    )}

                    <Button
                        onClick={handleSubmit}
                        disabled={linking || linkCode.length < 6 || !relationship}
                        className="w-full h-11 rounded-xl font-semibold"
                    >
                        {linking ? 'Connecting…' : 'Connect to Your Loved One'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// ─── Parent Health Card (detail view) ────────────────────────────────────────
const ParentHealthCard: React.FC<{
    parent: ParentHealthSummary;
    onBack: () => void;
    onUnlink: () => void;
}> = ({ parent, onBack, onUnlink }) => {
    const isMother = parent.relationship === 'mother';
    const bpStatus = getBPStatus(parent.healthStats.bloodPressure);
    const medPct = parent.medicineAdherence.totalMedicines > 0
        ? (parent.medicineAdherence.takenToday / parent.medicineAdherence.totalMedicines) * 100
        : 0;

    const gradient = isMother
        ? 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)'
        : 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)';

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50/40 via-white to-pink-50/30">
            <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

                {/* Back */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <div className="w-7 h-7 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-gray-300">
                        <ChevronLeft className="h-4 w-4" />
                    </div>
                    Back to Family
                </button>

                {/* Profile hero */}
                <div className="relative rounded-3xl overflow-hidden shadow-lg" style={{ background: gradient }}>
                    <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
                    <div className="absolute bottom-0 -left-6 w-28 h-28 rounded-full bg-white/10" />
                    <div className="relative px-6 pt-6 pb-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-3xl bg-white/25 border-2 border-white/40 flex items-center justify-center text-3xl shadow-lg">
                                    {getEmoji(parent.relationship)}
                                </div>
                                <div>
                                    <h1 className="text-xl font-black text-white leading-tight">{parent.name}</h1>
                                    <p className="text-white/65 text-xs font-semibold capitalize mt-0.5">{parent.relationship}</p>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-white/60 text-[11px] font-medium">Live monitoring</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {[
                                    { icon: Phone, bg: 'bg-white/20', fn: undefined },
                                    { icon: Bell, bg: 'bg-white/20', fn: undefined },
                                    { icon: Trash2, bg: 'bg-red-500/30', fn: onUnlink },
                                ].map(({ icon: Icon, bg, fn }, i) => (
                                    <button key={i} onClick={fn}
                                        className={`w-10 h-10 rounded-2xl ${bg} border border-white/30 flex items-center justify-center hover:opacity-80 transition-opacity active:scale-95`}>
                                        <Icon className="text-white" style={{ width: 16, height: 16 }} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {parent.alerts.length > 0 && (
                    <div className="space-y-2">
                        {parent.alerts.map(alert => {
                            const s = {
                                high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
                                medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
                                low: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', dot: 'bg-gray-400' },
                            }[alert.severity];
                            return (
                                <div key={alert.id} className={`flex items-center gap-2.5 rounded-2xl px-4 py-2.5 border ${s.bg} ${s.border}`}>
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                                    <span className={`text-xs font-semibold ${s.text}`}>{alert.message}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Health stats */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        {
                            show: !!parent.healthStats.bloodPressure,
                            icon: Heart, iconColor: bpStatus?.color ?? 'text-gray-500',
                            bg: bpStatus?.bg ?? 'bg-gray-50',
                            label: 'Blood Pressure',
                            value: parent.healthStats.bloodPressure
                                ? `${parent.healthStats.bloodPressure.systolic}/${parent.healthStats.bloodPressure.diastolic}`
                                : '—',
                            sub: bpStatus?.label ?? '', subColor: bpStatus?.color ?? 'text-gray-500',
                        },
                        {
                            show: !!parent.healthStats.bloodSugar,
                            icon: Activity, iconColor: 'text-amber-600', bg: 'bg-amber-50',
                            label: 'Blood Sugar',
                            value: `${parent.healthStats.bloodSugar?.value ?? '—'} mg/dL`,
                            sub: (parent.healthStats.bloodSugar?.value ?? 0) < 100 ? 'Normal' : 'Elevated',
                            subColor: (parent.healthStats.bloodSugar?.value ?? 0) < 100 ? 'text-green-600' : 'text-amber-600',
                        },
                        {
                            show: true,
                            icon: Footprints, iconColor: 'text-orange-600', bg: 'bg-orange-50',
                            label: 'Steps Today',
                            value: (parent.healthStats.stepsToday ?? 0).toLocaleString(),
                            sub: (parent.healthStats.stepsToday ?? 0) >= 5000 ? 'On track!' : 'Needs activity',
                            subColor: (parent.healthStats.stepsToday ?? 0) >= 5000 ? 'text-green-600' : 'text-orange-600',
                        },
                        {
                            show: true,
                            icon: Droplets, iconColor: 'text-blue-600', bg: 'bg-blue-50',
                            label: 'Water Intake',
                            value: `${parent.healthStats.waterIntake ?? 0} ml`,
                            sub: (parent.healthStats.waterIntake ?? 0) >= 1500 ? 'Well hydrated' : 'Drink more',
                            subColor: (parent.healthStats.waterIntake ?? 0) >= 1500 ? 'text-blue-600' : 'text-amber-600',
                        },
                    ].filter(t => t.show).map(({ icon: Icon, iconColor, bg, label, value, sub, subColor }) => (
                        <div key={label} className={`${bg} rounded-2xl p-4 flex flex-col gap-2`}>
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-xl bg-white/70 flex items-center justify-center">
                                    <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                                </div>
                                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
                            </div>
                            <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
                            <p className={`text-[11px] font-semibold ${subColor}`}>{sub}</p>
                        </div>
                    ))}
                </div>

                {/* Medicine adherence */}
                <Card className="border-0 shadow-sm overflow-hidden">
                    <div className="h-1 w-full" style={{ background: gradient }} />
                    <CardContent className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Pill style={{ width: 18, height: 18 }} className="text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm leading-none">Medicine Today</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">Daily adherence</p>
                                </div>
                            </div>
                            <div>
                                <span className="text-2xl font-black leading-none" style={{ color: medPct === 100 ? '#22c55e' : '#6366f1' }}>
                                    {parent.medicineAdherence.takenToday}
                                </span>
                                <span className="text-lg font-black text-gray-300">
                                    /{parent.medicineAdherence.totalMedicines}
                                </span>
                            </div>
                        </div>

                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${medPct}%`,
                                    background: medPct === 100
                                        ? 'linear-gradient(90deg,#22c55e,#16a34a)'
                                        : gradient,
                                }}
                            />
                        </div>

                        {parent.medicineAdherence.nextDue && (
                            <div className="flex items-center gap-2.5 bg-gray-50 rounded-2xl px-4 py-3">
                                <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Clock style={{ width: 14, height: 14 }} className="text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] text-muted-foreground">Next dose</p>
                                    <p className="text-sm font-bold text-gray-900 truncate">{parent.medicineAdherence.nextDue.name}</p>
                                </div>
                                <span className="text-xs font-black px-2.5 py-1 rounded-full text-white shrink-0" style={{ background: gradient }}>
                                    {parent.medicineAdherence.nextDue.time}
                                </span>
                            </div>
                        )}

                        {parent.medicineAdherence.missedToday > 0 && (
                            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                                <span className="text-sm font-semibold text-red-700">
                                    {parent.medicineAdherence.missedToday} medicine{parent.medicineAdherence.missedToday > 1 ? 's' : ''} missed today
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="h-2" />
            </div>
        </div>
    );
};

// ─── Member Row Card (list item) ──────────────────────────────────────────────
const MemberRowCard: React.FC<{
    parent: ParentHealthSummary;
    onClick: () => void;
}> = ({ parent, onClick }) => {
    const isMother = parent.relationship === 'mother';
    const hasAlerts = parent.alerts.some(a => a.severity === 'high');
    const medPct = parent.medicineAdherence.totalMedicines > 0
        ? Math.round((parent.medicineAdherence.takenToday / parent.medicineAdherence.totalMedicines) * 100)
        : 0;

    return (
        <Card
            className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.99] overflow-hidden"
            onClick={onClick}
        >
            <div className="flex">
                <div
                    className="w-1 shrink-0 rounded-l-xl"
                    style={{ background: isMother ? '#ec4899' : '#3b82f6' }}
                />
                <CardContent className="flex-1 p-4 min-w-0">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                            style={{ background: isMother ? '#fdf2f8' : '#eff6ff' }}
                        >
                            {getEmoji(parent.relationship)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <p className="font-bold text-gray-900 text-[15px] leading-tight truncate">{parent.name}</p>
                                {hasAlerts && (
                                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 shrink-0">Alert</Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground capitalize">{parent.relationship}</p>
                        </div>
                        <div className="text-right shrink-0 space-y-1">
                            <p className="text-xs text-muted-foreground">Medicines</p>
                            <p className="text-sm font-black text-primary">
                                {parent.medicineAdherence.takenToday}/{parent.medicineAdherence.totalMedicines}
                            </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                    </div>
                </CardContent>
            </div>
        </Card>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AddFamilyMembers: React.FC = () => {
    const [parents, setParents] = useState<ParentHealthSummary[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showDialog, setShowDialog] = useState(false);

    const selectedParent = parents.find(p => p.id === selectedId) ?? null;

    const handleLink = async (code: string, rel: Relationship) => {
        // TODO: replace with real FamilyService.getInstance().getParentByCode(code)
        await new Promise(res => setTimeout(res, 800));
        setParents(prev => [...prev, buildMockParent(Date.now().toString(), 'Family Member', rel, code)]);
        setShowDialog(false);
    };

    const handleUnlink = (id: string) => {
        setParents(prev => prev.filter(p => p.id !== id));
        setSelectedId(null);
    };

    // ── Detail view ──────────────────────────────────────────────────────────
    if (selectedParent) {
        return (
            <ParentHealthCard
                parent={selectedParent}
                onBack={() => setSelectedId(null)}
                onUnlink={() => handleUnlink(selectedParent.id)}
            />
        );
    }

    // ── List view ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen space-y-5">
            {/* Section header */}
            <div className="flex items-center justify-between px-1">

                {parents.length > 0 && (
                    <span className="text-xs font-medium text-muted-foreground bg-gray-100 px-2.5 py-1 rounded-full">
                        {parents.length} linked
                    </span>
                )}
            </div>

            {/* Member rows */}
            {parents.length > 0 && (
                <div className="space-y-3">
                    {parents.map(parent => (
                        <MemberRowCard
                            key={parent.id}
                            parent={parent}
                            onClick={() => setSelectedId(parent.id)}
                        />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {parents.length === 0 && (
                <Card className="border-0 shadow-sm">
                    <CardContent className="py-14 flex flex-col items-center gap-4 text-center">
                        <div
                            className="w-16 h-16 rounded-3xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #f3e8ff, #fce7f3)' }}
                        >
                            <Users className="h-8 w-8 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1">No Members Linked</h3>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                Ask your family member to share their link code from the Profile page
                            </p>
                        </div>
                        <button
                            onClick={() => setShowDialog(true)}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-sm font-bold transition-opacity hover:opacity-90 active:scale-95"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
                        >
                            <Link className="h-4 w-4" />
                            Enter Family Member's Code
                        </button>
                    </CardContent>
                </Card>
            )}

            {/* Add another */}
            {parents.length > 0 && (
                <button
                    onClick={() => setShowDialog(true)}
                    className="w-full h-11 rounded-2xl border-2 border-dashed border-purple-200 flex items-center justify-center gap-2 text-sm font-semibold text-purple-500 hover:border-purple-300 hover:bg-purple-50/50 transition-colors"
                >
                    <UserPlus className="h-4 w-4" />
                    Link Another Family Member
                </button>
            )}

            {/* Dialog — stable, defined outside, no remount */}
            <LinkDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                onLink={handleLink}
            />
        </div>
    );
};

export default AddFamilyMembers;