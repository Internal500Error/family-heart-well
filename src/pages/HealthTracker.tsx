
import React, { useState } from 'react';
import { 
  Activity, 
  Heart, 
  Droplets, 
  Weight, 
  Plus,
  TrendingUp,
  TrendingDown,
  FileDown,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HealthReading {
  id: string;
  type: 'bp' | 'sugar' | 'weight' | 'heartRate';
  value: string;
  date: string;
  time: string;
  status: 'normal' | 'warning' | 'danger';
}

const HealthTracker = () => {
  const [readings, setReadings] = useState<HealthReading[]>([
    {
      id: '1',
      type: 'bp',
      value: '120/80',
      date: '2024-07-11',
      time: '09:00',
      status: 'normal'
    },
    {
      id: '2',
      type: 'sugar',
      value: '95',
      date: '2024-07-11',
      time: '08:30',
      status: 'normal'
    },
    {
      id: '3',
      type: 'weight',
      value: '72.5',
      date: '2024-07-11',
      time: '07:00',
      status: 'normal'
    }
  ]);

  const [newReading, setNewReading] = useState({
    type: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5)
  });

  const healthMetrics = [
    {
      type: 'bp',
      title: 'Blood Pressure',
      icon: Heart,
      color: 'text-health-danger',
      bgColor: 'bg-red-50',
      unit: 'mmHg',
      lastReading: readings.find(r => r.type === 'bp')?.value || 'No data',
      status: readings.find(r => r.type === 'bp')?.status || 'normal'
    },
    {
      type: 'sugar',
      title: 'Blood Sugar',
      icon: Droplets,
      color: 'text-medicine',
      bgColor: 'bg-blue-50',
      unit: 'mg/dL',
      lastReading: readings.find(r => r.type === 'sugar')?.value || 'No data',
      status: readings.find(r => r.type === 'sugar')?.status || 'normal'
    },
    {
      type: 'weight',
      title: 'Weight',
      icon: Weight,
      color: 'text-health-good',
      bgColor: 'bg-green-50',
      unit: 'kg',
      lastReading: readings.find(r => r.type === 'weight')?.value || 'No data',
      status: readings.find(r => r.type === 'weight')?.status || 'normal'
    },
    {
      type: 'heartRate',
      title: 'Heart Rate',
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-orange-50',
      unit: 'bpm',
      lastReading: readings.find(r => r.type === 'heartRate')?.value || 'No data',
      status: readings.find(r => r.type === 'heartRate')?.status || 'normal'
    }
  ];

  // Sample chart data
  const chartData = [
    { date: '07-07', bp: 125, sugar: 98, weight: 73.0 },
    { date: '07-08', bp: 122, sugar: 95, weight: 72.8 },
    { date: '07-09', bp: 118, sugar: 92, weight: 72.6 },
    { date: '07-10', bp: 120, sugar: 96, weight: 72.4 },
    { date: '07-11', bp: 120, sugar: 95, weight: 72.5 },
  ];

  const addReading = () => {
    if (newReading.type && newReading.value) {
      const reading: HealthReading = {
        id: Date.now().toString(),
        type: newReading.type as any,
        value: newReading.value,
        date: newReading.date,
        time: newReading.time,
        status: 'normal' // This would be calculated based on the value
      };
      setReadings([reading, ...readings]);
      setNewReading({
        type: '',
        value: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5)
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-health-good';
      case 'warning': return 'bg-health-warning';
      case 'danger': return 'bg-health-danger';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="text-center">
        <div className="bg-health-good/20 rounded-full p-4 w-fit mx-auto mb-4">
          <Activity className="h-8 w-8 text-health-good" />
        </div>
        <h1 className="text-2xl font-poppins font-semibold mb-2">Health Tracker</h1>
        <p className="text-muted-foreground">Monitor your vital signs</p>
      </div>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {healthMetrics.map((metric) => (
          <Card key={metric.type}>
            <CardContent className="p-4">
              <div className={`${metric.bgColor} rounded-2xl p-3 mb-3 w-fit`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <h3 className="font-semibold text-sm mb-1">{metric.title}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">{metric.lastReading}</span>
                {metric.lastReading !== 'No data' && (
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(metric.status)}`}></div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{metric.unit}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Reading Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Reading
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Health Reading</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Metric Type</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={newReading.type}
                onChange={(e) => setNewReading({...newReading, type: e.target.value})}
              >
                <option value="">Select metric</option>
                <option value="bp">Blood Pressure</option>
                <option value="sugar">Blood Sugar</option>
                <option value="weight">Weight</option>
                <option value="heartRate">Heart Rate</option>
              </select>
            </div>
            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                value={newReading.value}
                onChange={(e) => setNewReading({...newReading, value: e.target.value})}
                placeholder="e.g., 120/80, 95, 72.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newReading.date}
                  onChange={(e) => setNewReading({...newReading, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newReading.time}
                  onChange={(e) => setNewReading({...newReading, time: e.target.value})}
                />
              </div>
            </div>
            <Button onClick={addReading} className="w-full">
              Add Reading
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Health Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Health Trends (Last 5 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bp" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="sugar" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Readings */}
      <div>
        <h2 className="text-lg font-poppins font-semibold mb-4">Recent Readings</h2>
        {readings.slice(0, 5).map((reading) => {
          const metric = healthMetrics.find(m => m.type === reading.type);
          return (
            <Card key={reading.id} className="mb-3">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {metric && (
                      <div className={`${metric.bgColor} rounded-full p-2`}>
                        <metric.icon className={`h-4 w-4 ${metric.color}`} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{metric?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {reading.date} at {reading.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{reading.value}</div>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(reading.status)} mx-auto`}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Export & Share */}
      <div className="flex space-x-3">
        <Button variant="outline" className="flex-1">
          <FileDown className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
        <Button variant="outline" className="flex-1">
          <Share2 className="h-4 w-4 mr-2" />
          Share Report
        </Button>
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-health-good/10 to-primary/10 border-health-good/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-health-good/20 rounded-full p-2">
              <TrendingUp className="h-5 w-5 text-health-good" />
            </div>
            <div>
              <h3 className="font-semibold text-health-good mb-2">AI Health Insight</h3>
              <p className="text-sm text-foreground">
                Your blood pressure has been stable this week! Keep up the good work with your morning walks. 🚶‍♂️
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthTracker;
