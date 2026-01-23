
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useUserMode } from '@/hooks/useUserMode';
import FamilyService from '@/lib/family-service';

interface UserProfile {
  name: string;
  age: number;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
}

const Profile = () => {
  const { parentLinkCode, generateNewLinkCode } = useUserMode();
  const [copied, setCopied] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    name: 'Rajesh Kumar',
    age: 65,
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@email.com',
    address: 'B-123, Green Valley Society, Mumbai',
    emergencyContact: '+91 98765 43211',
    bloodGroup: 'B+',
    allergies: ['Penicillin', 'Peanuts'],
    chronicConditions: ['Hypertension', 'Diabetes Type 2']
  });

  const [settings, setSettings] = useState({
    medicineReminders: true,
    healthAlerts: true,
    dailyTips: true,
    locationSharing: false,
    voiceAssistant: true,
    nightMode: false
  });

  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  // Save parent profile to family service whenever profile or link code changes
  useEffect(() => {
    if (parentLinkCode) {
      const familyService = FamilyService.getInstance();
      familyService.saveParentProfile({
        linkCode: parentLinkCode,
        name: profile.name,
        age: profile.age,
        phone: profile.phone,
        bloodGroup: profile.bloodGroup,
        healthData: {
          bloodPressure: { systolic: 128, diastolic: 82, timestamp: new Date().toISOString() },
          bloodSugar: { value: 105, timestamp: new Date().toISOString() },
          stepsToday: 4500,
          waterIntake: 1500,
        },
        medicines: {
          total: 4,
          taken: 3,
          nextDue: { name: 'Blood Pressure Med', time: '6:00 PM' },
        },
        lastUpdated: new Date().toISOString(),
      });
    }
  }, [profile, parentLinkCode]);

  const saveProfile = () => {
    setProfile(editedProfile);
    setEditMode(false);
  };

  const copyLinkCode = () => {
    navigator.clipboard.writeText(parentLinkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const healthStats = {
    totalMedicines: 4,
    healthRecords: 12,
    doctorVisits: 8,
    streak: 15
  };

  const achievements = [
    { icon: '', title: 'Health Champion', description: '30 days streak!' },
    { icon: '', title: 'Medicine Master', description: 'Never missed a dose' },
    { icon: '', title: 'Knowledge Seeker', description: 'Read 50 health tips' },
    { icon: '', title: 'Heart Hero', description: 'BP under control' }
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
            <User className="h-12 w-12 text-primary" />
          </div>
          <Button
            size="sm"
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full p-0"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <h1 className="text-2xl font-poppins font-semibold mb-1">{profile.name}</h1>
        <p className="text-muted-foreground">{profile.age} years old</p>
        <Badge className="mt-2 bg-health-good text-white">
          {healthStats.streak} day streak! 🔥
        </Badge>
      </div>

      {/* Family Linking Card - Share code with children */}
      <Card className="glass border-0 shadow-premium overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5" />
        <CardHeader className="relative pb-2">
          <CardTitle className="text-lg flex items-center">
            <Users className="h-5 w-5 mr-2 text-purple-600" />
            Family Linking
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <p className="text-sm text-muted-foreground">
            Share this code with your child so they can monitor your health
          </p>

          {/* Link Code Display */}
          <div className="bg-white/60 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-2">Your Link Code</p>
            <div className="flex items-center justify-center space-x-3">
              <span className="text-3xl font-mono font-bold tracking-[0.3em] text-primary">
                {parentLinkCode}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={copyLinkCode}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={generateNewLinkCode}
              title="Generate new code"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Your child can enter this code in their DilCare app to see your health updates
          </p>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-medicine">{healthStats.totalMedicines}</div>
            <div className="text-xs text-muted-foreground">Active Medicines</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-health-good">{healthStats.healthRecords}</div>
            <div className="text-xs text-muted-foreground">Health Records</div>
          </CardContent>
        </Card>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Personal Information</CardTitle>
            <Dialog open={editMode} onOpenChange={setEditMode}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={editedProfile.age}
                      onChange={(e) => setEditedProfile({ ...editedProfile, age: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editedProfile.phone}
                      onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Input
                      id="bloodGroup"
                      value={editedProfile.bloodGroup}
                      onChange={(e) => setEditedProfile({ ...editedProfile, bloodGroup: e.target.value })}
                    />
                  </div>
                  <Button onClick={saveProfile} className="w-full">
                    Save Changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{profile.phone}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{profile.email}</span>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{profile.address}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Heart className="h-4 w-4 text-health-danger" />
            <span className="text-sm">Blood Group: {profile.bloodGroup}</span>
          </div>
        </CardContent>
      </Card>

      {/* Health Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Health Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Chronic Conditions</h4>
            <div className="flex flex-wrap gap-2">
              {profile.chronicConditions.map((condition, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {condition}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Allergies</h4>
            <div className="flex flex-wrap gap-2">
              {profile.allergies.map((allergy, index) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  {allergy}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Gift className="h-5 w-5 mr-2 text-primary" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement, index) => (
              <div key={index} className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <h4 className="font-semibold text-xs mb-1">{achievement.title}</h4>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Settings className="h-5 w-5 mr-2 text-muted-foreground" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Medicine Reminders</span>
            </div>
            <Switch
              checked={settings.medicineReminders}
              onCheckedChange={(checked) => setSettings({ ...settings, medicineReminders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Health Alerts</span>
            </div>
            <Switch
              checked={settings.healthAlerts}
              onCheckedChange={(checked) => setSettings({ ...settings, healthAlerts: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Location Sharing</span>
            </div>
            <Switch
              checked={settings.locationSharing}
              onCheckedChange={(checked) => setSettings({ ...settings, locationSharing: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Support & Help */}
      <div className="space-y-3">
        <Button variant="outline" className="w-full justify-start">
          <HelpCircle className="h-4 w-4 mr-3" />
          Help & Support
        </Button>

        <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </div>

      {/* App Info */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/20 border-primary/20">
        <CardContent className="p-4 text-center">
          <h3 className="font-semibold text-primary mb-2">DilCare v1.0</h3>
          <p className="text-xs text-foreground">
            Made with ❤️ for your health and happiness
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            © 2024 DilCare. All rights reserved.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
