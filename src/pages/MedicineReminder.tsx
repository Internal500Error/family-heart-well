
import React, { useState } from 'react';
import { 
  Pill, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Camera,
  Mic,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  taken: boolean;
  missed?: boolean;
}

const MedicineReminder = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: '1',
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Daily',
      time: '8:00 PM',
      taken: false
    },
    {
      id: '2',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      time: '9:00 AM, 9:00 PM',
      taken: true
    },
    {
      id: '3',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Daily',
      time: '7:00 AM',
      taken: false,
      missed: true
    }
  ]);

  const [newMedicine, setNewMedicine] = useState({
    name: '',
    dosage: '',
    frequency: '',
    time: ''
  });

  const toggleMedicineTaken = (id: string) => {
    setMedicines(medicines.map(med => 
      med.id === id ? { ...med, taken: !med.taken, missed: false } : med
    ));
  };

  const addMedicine = () => {
    if (newMedicine.name && newMedicine.dosage && newMedicine.frequency && newMedicine.time) {
      const medicine: Medicine = {
        id: Date.now().toString(),
        ...newMedicine,
        taken: false
      };
      setMedicines([...medicines, medicine]);
      setNewMedicine({ name: '', dosage: '', frequency: '', time: '' });
    }
  };

  const todaysMedicines = medicines.filter(med => !med.taken);
  const completedMedicines = medicines.filter(med => med.taken);
  const missedMedicines = medicines.filter(med => med.missed);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="text-center">
        <div className="bg-medicine/20 rounded-full p-4 w-fit mx-auto mb-4">
          <Pill className="h-8 w-8 text-medicine" />
        </div>
        <h1 className="text-2xl font-poppins font-semibold mb-2">Medicine Reminder</h1>
        <p className="text-muted-foreground">Stay healthy with timely medicines</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">{todaysMedicines.length}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-health-good">{completedMedicines.length}</div>
            <div className="text-xs text-muted-foreground">Taken</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-health-danger">{missedMedicines.length}</div>
            <div className="text-xs text-muted-foreground">Missed</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Medicine Button */}
      <div className="flex space-x-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Add Medicine
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Medicine</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Medicine Name</Label>
                <Input
                  id="name"
                  value={newMedicine.name}
                  onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                  placeholder="e.g., Atorvastatin"
                />
              </div>
              <div>
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={newMedicine.dosage}
                  onChange={(e) => setNewMedicine({...newMedicine, dosage: e.target.value})}
                  placeholder="e.g., 20mg"
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select onValueChange={(value) => setNewMedicine({...newMedicine, frequency: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once daily</SelectItem>
                    <SelectItem value="twice">Twice daily</SelectItem>
                    <SelectItem value="thrice">Three times daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newMedicine.time}
                  onChange={(e) => setNewMedicine({...newMedicine, time: e.target.value})}
                />
              </div>
              <Button onClick={addMedicine} className="w-full">
                Add Medicine
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline">
          <Mic className="h-4 w-4" />
        </Button>
        <Button variant="outline">
          <Camera className="h-4 w-4" />
        </Button>
      </div>

      {/* Today's Medicines */}
      <div>
        <h2 className="text-lg font-poppins font-semibold mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-primary" />
          Today's Medicines
        </h2>
        
        {medicines.map((medicine) => (
          <Card key={medicine.id} className={`mb-3 ${medicine.taken ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold">{medicine.name}</h3>
                    {medicine.missed && (
                      <Badge variant="destructive" className="text-xs">
                        Missed
                      </Badge>
                    )}
                    {medicine.taken && (
                      <Badge className="bg-health-good text-white text-xs">
                        Taken
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {medicine.dosage} • {medicine.frequency}
                  </p>
                  <p className="text-sm text-primary font-medium">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {medicine.time}
                  </p>
                </div>
                
                <Button
                  variant={medicine.taken ? "secondary" : "default"}
                  size="sm"
                  onClick={() => toggleMedicineTaken(medicine.id)}
                  className={medicine.taken ? "bg-health-good text-white hover:bg-health-good/80" : ""}
                >
                  {medicine.taken ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-white rounded"></div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Tips */}
      <Card className="bg-gradient-to-r from-medicine/10 to-primary/10 border-medicine/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-medicine/20 rounded-full p-2">
              <AlertCircle className="h-5 w-5 text-medicine" />
            </div>
            <div>
              <h3 className="font-semibold text-medicine mb-2">AI Reminder Tip</h3>
              <p className="text-sm text-foreground">
                Taking Atorvastatin in the evening is best as your body produces more cholesterol at night. Great timing! 🌙
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicineReminder;
