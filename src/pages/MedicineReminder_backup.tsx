import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Clock, 
  Plus, 
  Check, 
  AlertCircle, 
  Bell,
  Camera,
  Brain,
  Zap,
  Target,
  Calendar,
  Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import ComputerVisionService from '@/lib/computer-vision';
import HealthAIEngine from '@/lib/ai-engine';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  taken: boolean;
  nextDue: Date;
  instructions?: string;
  sideEffects?: string[];
}

const MedicineReminder = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: '1',
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Daily',
      time: '8:00 PM',
      taken: false,
      nextDue: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      instructions: 'Take with dinner',
      sideEffects: ['muscle pain', 'digestive issues']
    },
    {
      id: '2',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      time: '8:00 AM, 8:00 PM',
      taken: true,
      nextDue: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      instructions: 'Take with meals',
      sideEffects: ['nausea', 'diarrhea']
    },
    {
      id: '3',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Daily',
      time: '7:00 AM',
      taken: false,
      nextDue: new Date(Date.now() + 14 * 60 * 60 * 1000), // 14 hours from now
      instructions: 'Take in the morning',
      sideEffects: ['dizziness', 'dry cough']
    }
  ]);

  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [smartReminders, setSmartReminders] = useState(true);

  // Advanced AI services
  const visionService = ComputerVisionService.getInstance();
  const aiEngine = HealthAIEngine.getInstance();

  useEffect(() => {
    generateMedicationInsights();
    optimizeScheduling();
  }, [medicines]);

  const generateMedicationInsights = async () => {
    try {
      // Prepare medication data for AI analysis
      const medicationData = {
        medicines: medicines.map(m => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          adherence: m.taken ? 100 : 80, // Mock adherence data
          sideEffects: m.sideEffects || []
        })),
        patientProfile: {
          age: 45,
          conditions: ['hypertension', 'diabetes', 'high cholesterol'],
          allergies: []
        }
      };

      const insights = await aiEngine.optimizeMedicationSchedule(medicationData);
      setAiInsights(insights);
    } catch (error) {
      console.error('Error generating medication insights:', error);
    }
  };

  const optimizeScheduling = () => {
    if (!smartReminders) return;

    // AI-powered scheduling optimization
    const optimizedMedicines = medicines.map(medicine => {
      const optimizedTime = getOptimalTime(medicine);
      return { ...medicine, time: optimizedTime };
    });

    if (JSON.stringify(optimizedMedicines) !== JSON.stringify(medicines)) {
      setMedicines(optimizedMedicines);
    }
  };

  const getOptimalTime = (medicine: Medicine): string => {
    // AI logic for optimal medication timing
    if (medicine.name.toLowerCase().includes('atorvastatin')) {
      return '8:00 PM'; // Statins work better at night
    }
    if (medicine.name.toLowerCase().includes('metformin')) {
      return '8:00 AM, 8:00 PM'; // With meals
    }
    if (medicine.name.toLowerCase().includes('lisinopril')) {
      return '7:00 AM'; // ACE inhibitors in morning
    }
    return medicine.time; // Keep current timing
  };

  const scanPillWithCamera = async () => {
    setIsScanning(true);
    try {
      // In a real implementation, this would capture from camera
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            const results = await visionService.identifyPill(file);
            setScanResults(results);
            
            // Auto-add if pill is identified
            if (results.pillIdentified) {
              const newMedicine: Medicine = {
                id: Date.now().toString(),
                name: results.pillName || 'Unknown Medication',
                dosage: results.dosage || 'As directed',
                frequency: 'Daily',
                time: '8:00 AM',
                taken: false,
                nextDue: new Date(Date.now() + 24 * 60 * 60 * 1000),
                instructions: results.instructions || 'Follow doctor\'s instructions'
              };
              setMedicines(prev => [...prev, newMedicine]);
            }
          } catch (error) {
            console.error('Error analyzing pill:', error);
          }
        }
      };
      input.click();
    } catch (error) {
      console.error('Camera access error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const [newMedicine, setNewMedicine] = useState({
    name: '',
    dosage: '',
    frequency: '',
    time: ''
  });

  const toggleMedicineTaken = (id: string) => {
    setMedicines(medicines.map(medicine => 
      medicine.id === id 
        ? { ...medicine, taken: !medicine.taken }
        : medicine
    ));
  };

  const addMedicine = () => {
    if (!newMedicine.name || !newMedicine.dosage) return;

    const medicine: Medicine = {
      id: Date.now().toString(),
      name: newMedicine.name,
      dosage: newMedicine.dosage,
      frequency: newMedicine.frequency || 'Daily',
      time: newMedicine.time || '8:00 AM',
      taken: false,
      nextDue: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    setMedicines([...medicines, medicine]);
    setNewMedicine({ name: '', dosage: '', frequency: '', time: '' });
  };

  const getUpcomingMedicines = () => {
    return medicines
      .filter(m => !m.taken)
      .sort((a, b) => a.nextDue.getTime() - b.nextDue.getTime())
      .slice(0, 3);
  };

  const getAdherenceRate = () => {
    const taken = medicines.filter(m => m.taken).length;
    return medicines.length > 0 ? Math.round((taken / medicines.length) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Medicine Reminder</h1>
          <p className="text-muted-foreground">AI-powered medication management</p>
        </div>

        {/* AI Insights & Adherence */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-r from-medicine to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Target className="h-5 w-5 mr-2" />
                Adherence Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{getAdherenceRate()}%</div>
              <p className="text-white/80 text-sm">
                {getAdherenceRate() >= 80 ? 'Excellent adherence!' : 
                 getAdherenceRate() >= 60 ? 'Good, keep it up!' : 'Needs improvement'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Brain className="h-5 w-5 mr-2 text-blue-500" />
                AI Medication Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiInsights.length > 0 ? (
                <div className="space-y-2">
                  {aiInsights.slice(0, 2).map((insight, idx) => (
                    <div key={idx} className="text-sm p-2 bg-blue-50 rounded">
                      <p className="font-medium text-blue-800">{insight.type}</p>
                      <p className="text-blue-600">{insight.recommendation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  AI is analyzing your medication schedule...
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Smart Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                Smart Features
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Smart Scheduling</span>
                  <Switch
                    checked={smartReminders}
                    onCheckedChange={setSmartReminders}
                  />
                </div>
                <Button 
                  onClick={scanPillWithCamera}
                  disabled={isScanning}
                  variant="outline"
                  size="sm"
                >
                  {isScanning ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Scan Pill
                    </>
                  )}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scanResults && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-green-800">
                    Pill Identified: {scanResults.pillName || 'Unknown'}
                  </p>
                </div>
                {scanResults.commonUse && (
                  <p className="text-xs text-green-600 mt-1">
                    Commonly used for: {scanResults.commonUse}
                  </p>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-3 border rounded-lg">
                <Brain className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium text-sm">AI Pill Recognition</p>
                  <p className="text-xs text-muted-foreground">Scan any medication</p>
                </div>
              </div>
              <div className="flex items-center p-3 border rounded-lg">
                <Target className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="font-medium text-sm">Smart Timing</p>
                  <p className="text-xs text-muted-foreground">Optimized schedules</p>
                </div>
              </div>
              <div className="flex items-center p-3 border rounded-lg">
                <Smartphone className="h-5 w-5 text-purple-500 mr-3" />
                <div>
                  <p className="font-medium text-sm">Smart Reminders</p>
                  <p className="text-xs text-muted-foreground">Context-aware alerts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Medicines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-orange-500" />
              Upcoming Medicines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getUpcomingMedicines().map((medicine) => (
                <div key={medicine.id} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Pill className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{medicine.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {medicine.dosage} • {medicine.frequency}
                      </p>
                      <p className="text-xs text-orange-600">
                        Due: {medicine.nextDue.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleMedicineTaken(medicine.id)}
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {getUpcomingMedicines().length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  All medications taken for today! 🎉
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* All Medicines */}
        <Card>
          <CardHeader>
            <CardTitle>All Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {medicines.map((medicine) => (
                <div key={medicine.id} className={`p-4 border rounded-lg transition-all ${
                  medicine.taken ? 'bg-green-50 border-green-200' : 'bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        medicine.taken ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Pill className={`h-5 w-5 ${
                          medicine.taken ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className={`font-semibold ${
                            medicine.taken ? 'text-green-800 line-through' : 'text-foreground'
                          }`}>
                            {medicine.name}
                          </h3>
                          {medicine.taken && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Taken
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {medicine.dosage} • {medicine.frequency} • {medicine.time}
                        </p>
                        {medicine.instructions && (
                          <p className="text-xs text-blue-600 mt-1">
                            {medicine.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!medicine.taken && (
                        <div className="text-xs text-orange-600 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Due {medicine.nextDue.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      <Button
                        onClick={() => toggleMedicineTaken(medicine.id)}
                        variant={medicine.taken ? "outline" : "default"}
                        size="sm"
                      >
                        {medicine.taken ? 'Undo' : 'Take'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add New Medicine */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add New Medicine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input
                placeholder="Medicine name"
                value={newMedicine.name}
                onChange={(e) => setNewMedicine(prev => ({...prev, name: e.target.value}))}
              />
              <Input
                placeholder="Dosage (e.g., 10mg)"
                value={newMedicine.dosage}
                onChange={(e) => setNewMedicine(prev => ({...prev, dosage: e.target.value}))}
              />
              <Input
                placeholder="Frequency"
                value={newMedicine.frequency}
                onChange={(e) => setNewMedicine(prev => ({...prev, frequency: e.target.value}))}
              />
              <Input
                placeholder="Time (e.g., 8:00 AM)"
                value={newMedicine.time}
                onChange={(e) => setNewMedicine(prev => ({...prev, time: e.target.value}))}
              />
              <Button onClick={addMedicine} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedicineReminder;
