
import React, { useState, useEffect } from 'react';
import {
  User,
  Edit,
  Heart,
  Gift,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Camera,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Copy,
  RefreshCw,
  Users,
  Share2,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { userService, authService } from '@/lib/api-client';

interface UserProfile {
  id?: string;
  name?: string;
  age?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [parentLinkCode, setParentLinkCode] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const [settings, setSettings] = useState({
    medicineReminders: true,
    healthAlerts: true,
    dailyTips: true,
    locationSharing: false,
    voiceAssistant: true,
    nightMode: false
  });
  
  // Real stats from backend (or fallback)
  const [stats, setStats] = useState<{
    totalMedicines: number;
    healthRecords: number;
    streak: number;
    achievements: any[];
  }>({
    totalMedicines: 0,
    healthRecords: 0,
    streak: 0,
    achievements: []
  });

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
    fetchLinkCode();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await userService.getProfile();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setProfile(response.data);
        setEditedProfile(response.data);
        if (response.data.stats) {
          setStats({
            totalMedicines: response.data.stats.total_medicines || 0,
            healthRecords: response.data.stats.health_records || 0,
            streak: response.data.stats.streak || 0,
            achievements: response.data.stats.achievements || []
          });
        }
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error('Profile error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLinkCode = async () => {
    try {
      const response = await userService.getParentLinkCode();
      if (response.data) {
        setParentLinkCode(response.data.parent_link_code || '');
      }
    } catch (err) {
      console.error('Link code error:', err);
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    setError('');
    try {
      const response = await userService.updateProfile(editedProfile);
      if (response.error) {
        setError(response.error);
      } else {
        setProfile(response.data || editedProfile);
        setEditMode(false);
      }
    } catch (err) {
      setError('Failed to save profile');
      console.error('Save profile error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const regenerateLinkCode = async () => {
    try {
      const response = await userService.regenerateLinkCode();
      if (response.data) {
        setParentLinkCode(response.data.parent_link_code || '');
      }
    } catch (err) {
      console.error('Regenerate link code error:', err);
    }
  };

  const copyLinkCode = () => {
    navigator.clipboard.writeText(parentLinkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* ── Hero avatar section ─────────────────────────────────── */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-lg"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)' }}
        >
          {/* Decorative blobs */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute bottom-0 -left-6 w-28 h-28 rounded-full bg-white/10" />

          <div className="relative px-4 py-4 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-white/25 border-2 border-white/40 flex items-center justify-center shadow-lg backdrop-blur-sm">
                <User className="h-12 w-12 text-white" />
              </div>
              <Button
                size="sm"
                className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl p-0 border-2 border-white shadow-md"
                style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}
              >
                <Camera className="h-3.5 w-3.5 text-white" />
              </Button>
            </div>

            <h1 className="text-2xl font-black text-white leading-tight">{profile.name}</h1>
            <p className="text-white/65 text-sm mt-0.5">{profile.age} years old</p>

            <div className="flex items-center gap-2 mt-3 bg-white/20 border border-white/30 px-4 py-1.5 rounded-full">
              <span className="text-sm">🔥</span>
              <span className="text-white text-xs font-bold">{stats.streak} day streak!</span>
            </div>
          </div>
        </div>

        {/* ── Quick stats ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: stats.totalMedicines, label: 'Active Medicines', color: 'text-violet-600', bg: 'bg-violet-50' },
            { value: stats.healthRecords, label: 'Health Records', color: 'text-green-600', bg: 'bg-green-50' },
          ].map(({ value, label, color, bg }) => (
            <Card key={label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex flex-col items-center gap-1">
                <span className={`text-3xl font-black leading-none ${color}`}>{value}</span>
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Family Linking ──────────────────────────────────────── */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #ec4899)' }} />
          <CardContent className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm leading-none">Family Linking</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Share this code so family can monitor your health
                </p>
              </div>
            </div>

            {/* Code display */}
            <div
              className="rounded-2xl p-5 text-center border"
              style={{ background: 'linear-gradient(135deg, #f5f3ff, #fdf4ff)', borderColor: '#e9d5ff' }}
            >
              <p className="text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-2">Your Link Code</p>
              <span className="text-4xl font-black font-mono tracking-[0.35em] bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                {parentLinkCode}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={copyLinkCode}
                className="flex-1 h-11 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
              >
                {copied ? (
                  <><Check className="h-4 w-4" />Copied!</>
                ) : (
                  <><Copy className="h-4 w-4" />Copy Code</>
                )}
              </button>
              <button
                onClick={regenerateLinkCode}
                title="Generate new code"
                className="w-11 h-11 rounded-2xl border-2 border-purple-200 flex items-center justify-center text-purple-500 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Family members enter this code in their DilCare app to see your health updates
            </p>
          </CardContent>
        </Card>

        {/* ── Personal Information ────────────────────────────────── */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-cyan-400" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-blue-500 to-cyan-400" />
                <h2 className="font-black text-gray-900 text-sm">Personal Information</h2>
              </div>
              <Dialog open={editMode} onOpenChange={setEditMode}>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors">
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Edit className="h-4 w-4 text-blue-600" />
                      </div>
                      Edit Profile
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-1">
                    {[
                      { id: 'name', label: 'Full Name', type: 'text', key: 'name' },
                      { id: 'age', label: 'Age', type: 'number', key: 'age' },
                      { id: 'phone', label: 'Phone', type: 'tel', key: 'phone' },
                      { id: 'email', label: 'Email', type: 'email', key: 'email' },
                      { id: 'bloodGroup', label: 'Blood Group', type: 'text', key: 'bloodGroup' },
                    ].map(({ id, label, type, key }) => (
                      <div key={id} className="space-y-1.5">
                        <Label htmlFor={id} className="text-sm font-semibold">{label}</Label>
                        <Input
                          id={id} type={type}
                          value={(editedProfile as any)[key]}
                          onChange={e => setEditedProfile({
                            ...editedProfile,
                            [key]: type === 'number' ? parseInt(e.target.value) : e.target.value,
                          })}
                          className="h-11 rounded-xl"
                        />
                      </div>
                    ))}
                    <Button onClick={saveProfile} className="w-full h-11 rounded-xl font-semibold">
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {[
                { icon: Phone, value: profile.phone, color: 'text-blue-500', bg: 'bg-blue-50' },
                { icon: Mail, value: profile.email, color: 'text-violet-500', bg: 'bg-violet-50' },
                { icon: MapPin, value: profile.address, color: 'text-green-500', bg: 'bg-green-50' },
                { icon: Heart, value: `Blood Group: ${profile.bloodGroup}`, color: 'text-red-500', bg: 'bg-red-50' },
              ].map(({ icon: Icon, value, color, bg }, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                  <span className="text-sm text-gray-700">{value || 'Not provided'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Health Information ──────────────────────────────────── */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-red-400 to-orange-400" />
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-red-500 to-orange-400" />
              <h2 className="font-black text-gray-900 text-sm">Health Information</h2>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Chronic Conditions</p>
              <div className="flex flex-wrap gap-2">
                {profile.chronicConditions?.map((c, i) => (
                  <span key={i} className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                    {c}
                  </span>
                )) || <span className="text-xs text-gray-400 italic">None reported</span>}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Allergies</p>
              <div className="flex flex-wrap gap-2">
                {profile.allergies?.map((a, i) => (
                  <span key={i} className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                    {a}
                  </span>
                )) || <span className="text-xs text-gray-400 italic">No known allergies</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Achievements ────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-yellow-300" />
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-amber-500 to-yellow-400" />
              <Gift className="h-4 w-4 text-amber-500" />
              <h2 className="font-black text-gray-900 text-sm">Achievements</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {stats.achievements && stats.achievements.length > 0 ? (
                stats.achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center p-4 rounded-2xl border border-amber-100"
                    style={{ background: 'linear-gradient(135deg, #fffbeb, #fef9c3)' }}
                  >
                    <span className="text-3xl mb-2 leading-none">{achievement.icon || '🏆'}</span>
                    <p className="font-bold text-gray-900 text-xs leading-snug">{achievement.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{achievement.description}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-6 bg-amber-50/50 rounded-xl border border-amber-100/50">
                  <Gift className="h-8 w-8 text-amber-300 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-amber-700/80">No achievements yet</p>
                  <p className="text-xs text-amber-600/60 mt-1">Keep tracking your health to earn badges!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Settings ────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-gray-300 to-gray-400" />
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-gray-400 to-gray-500" />
              <Settings className="h-4 w-4 text-gray-500" />
              <h2 className="font-black text-gray-900 text-sm">Settings</h2>
            </div>

            <div className="space-y-1">
              {[
                { icon: Bell, label: 'Medicine Reminders', key: 'medicineReminders', color: 'text-violet-500', bg: 'bg-violet-50' },
                { icon: Heart, label: 'Health Alerts', key: 'healthAlerts', color: 'text-red-500', bg: 'bg-red-50' },
                { icon: Shield, label: 'Location Sharing', key: 'locationSharing', color: 'text-blue-500', bg: 'bg-blue-50' },
              ].map(({ icon: Icon, label, key, color, bg }, i, arr) => (
                <div key={key}>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
                        <Icon className={`h-3.5 w-3.5 ${color}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{label}</span>
                    </div>
                    <Switch
                      checked={(settings as any)[key]}
                      onCheckedChange={checked => setSettings({ ...settings, [key]: checked })}
                    />
                  </div>
                  {i < arr.length - 1 && <div className="h-px bg-gray-100 ml-11" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Support & Sign Out ──────────────────────────────────── */}
        <div className="space-y-2">
          <button className="w-full h-12 rounded-2xl border-2 border-gray-200 flex items-center gap-3 px-4 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors">
            <div className="w-7 h-7 rounded-xl bg-gray-100 flex items-center justify-center">
              <HelpCircle className="h-3.5 w-3.5 text-gray-500" />
            </div>
            Help & Support
          </button>
          <button onClick={handleLogout} className="w-full h-12 rounded-2xl border-2 border-red-200 flex items-center gap-3 px-4 text-sm font-semibold text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors">
            <div className="w-7 h-7 rounded-xl bg-red-50 flex items-center justify-center">
              <LogOut className="h-3.5 w-3.5 text-red-500" />
            </div>
            Sign Out
          </button>
        </div>

        {/* ── App Info ────────────────────────────────────────────── */}
        <div
          className="rounded-3xl px-6 py-5 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #eef2ff, #fdf4ff, #fff1f2)' }}
        >
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-primary/5" />
          <p
            className="font-black text-base mb-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            DilCare v1.0
          </p>
          <p className="text-xs text-gray-600">Made with ❤️ for your health and happiness</p>
          <p className="text-[11px] text-muted-foreground mt-1">© 2024 DilCare. All rights reserved.</p>
        </div>

        <div className="h-2" />
      </div>
    </div>
  );
};

export default Profile;
