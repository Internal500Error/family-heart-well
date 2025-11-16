import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Droplets, 
  Scale,
  User,
  Calendar,
  Clock,
  Zap,
  Brain,
  Bluetooth,
  Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import HealthAIEngine from '@/lib/ai-engine';
import IoTIntegrationService from '@/lib/iot-integration';

interface HealthReading {
  id: string;
  type: 'bp' | 'sugar' | 'weight' | 'temperature' | 'heart_rate';
  value: string;
  date: string;
  time: string;
  status: 'normal' | 'warning' | 'danger';
  deviceId?: string;
}

const HealthTracker = () => {
  const [readings, setReadings] = useState<HealthReading[]>([
    { id: '1', type: 'bp', value: '120/80', date: '2024-07-15', time: '08:00', status: 'normal' },
    { id: '2', type: 'sugar', value: '95', date: '2024-07-15', time: '08:30', status: 'normal' },
    { id: '3', type: 'weight', value: '70.5', date: '2024-07-15', time: '07:00', status: 'normal' },
    { id: '4', type: 'bp', value: '135/90', date: '2024-07-14', time: '19:00', status: 'warning' },
    { id: '5', type: 'sugar', value: '140', date: '2024-07-14', time: '14:00', status: 'warning' },
    { id: '6', type: 'weight', value: '72.5', date: '2024-07-11', time: '07:00', status: 'normal' }
  ]);

  const [healthInsights, setHealthInsights] = useState<any[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Advanced AI services
  const aiEngine = HealthAIEngine.getInstance();
  const iotService = IoTIntegrationService.getInstance();

  useEffect(() => {
    initializeAdvancedFeatures();
    generateHealthInsights();
    scanForDevices();
  }, [readings]);

  const initializeAdvancedFeatures = async () => {
    try {
      // Initialize IoT service
      await iotService.initialize();
      // Load connected devices
      const devices = await iotService.getConnectedDevices();
      setConnectedDevices(devices);
    } catch (error) {
      console.log('Some advanced features may not be available:', error);
    }
  };

  const generateHealthInsights = async () => {
    setIsLoadingInsights(true);
    try {
      // Prepare health data for AI analysis
      const healthData = {
        readings: readings.map(r => ({
          type: r.type,
          value: r.value,
          date: r.date,
          status: r.status
        })),
        trends: calculateTrends(),
        riskFactors: assessRiskFactors()
      };

      const insights = await aiEngine.analyzeHealthRisks(healthData);
      setHealthInsights(insights);
    } catch (error) {
      console.error('Error generating health insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const calculateTrends = () => {
    const trends: any = {};
    ['bp', 'sugar', 'weight'].forEach(type => {
      const typeReadings = readings.filter(r => r.type === type).slice(0, 5);
      if (typeReadings.length >= 2) {
        const latest = parseFloat(typeReadings[0].value.split('/')[0] || typeReadings[0].value);
        const previous = parseFloat(typeReadings[1].value.split('/')[0] || typeReadings[1].value);
        trends[type] = latest > previous ? 'increasing' : latest < previous ? 'decreasing' : 'stable';
      }
    });
    return trends;
  };

  const assessRiskFactors = () => {
    const risks = [];
    const recentBP = readings.find(r => r.type === 'bp' && r.status !== 'normal');
    const recentSugar = readings.find(r => r.type === 'sugar' && r.status !== 'normal');
    
    if (recentBP) risks.push('hypertension');
    if (recentSugar) risks.push('diabetes');
    
    return risks;
  };

  const syncWithDevices = async () => {
    setIsScanning(true);
    try {
      const syncedData = await iotService.syncAllDevices();
      
      // Convert synced data to health readings
      const newReadings = syncedData.map((data: any) => ({
        id: Date.now().toString() + Math.random(),
        type: mapDeviceTypeToHealthType(data.type),
        value: data.value,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        status: determineStatus(data.type, data.value),
        deviceId: data.deviceId
      }));
      
      setReadings(prev => [...newReadings, ...prev]);
    } catch (error) {
      console.error('Error syncing with devices:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const mapDeviceTypeToHealthType = (deviceType: string) => {
    switch (deviceType) {
      case 'blood_pressure': return 'bp' as const;
      case 'glucose_meter': return 'sugar' as const;
      case 'smart_scale': return 'weight' as const;
      case 'heart_rate_monitor': return 'heart_rate' as const;
      default: return 'heart_rate' as const;
    }
  };

  const determineStatus = (type: string, value: string): 'normal' | 'warning' | 'danger' => {
    // Simple status determination logic
    if (type === 'bp') {
      const systolic = parseInt(value.split('/')[0]);
      if (systolic > 140) return 'danger';
      if (systolic > 130) return 'warning';
      return 'normal';
    }
    if (type === 'sugar') {
      const sugar = parseInt(value);
      if (sugar > 140) return 'danger';
      if (sugar > 100) return 'warning';
      return 'normal';
    }
    return 'normal';
  };

  const scanForDevices = async () => {
    try {
      const devices = await iotService.discoverDevices();
      setConnectedDevices(devices);
    } catch (error) {
      console.log('Device scanning not available:', error);
    }
  };

  const calculateHealthScore = (): number => {
    let score = 85; // Base score
    
    readings.forEach(reading => {
      if (reading.status === 'warning') score -= 5;
      if (reading.status === 'danger') score -= 15;
    });
    
    // Add randomness for demo purposes
    score += (Math.random() - 0.5) * 10;
    
    return Math.max(50, Math.min(100, Math.round(score)));
  };

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
      icon: Scale,
      color: 'text-primary',
      bgColor: 'bg-green-50',
      unit: 'kg',
      lastReading: readings.find(r => r.type === 'weight')?.value || 'No data',
      status: readings.find(r => r.type === 'weight')?.status || 'normal'
    }
  ];

  const addReading = () => {
    if (!newReading.type || !newReading.value) return;

    const reading: HealthReading = {
      id: Date.now().toString(),
      type: newReading.type as HealthReading['type'],
      value: newReading.value,
      date: newReading.date,
      time: newReading.time,
      status: determineStatus(newReading.type, newReading.value)
    };

    setReadings(prev => [reading, ...prev]);
    setNewReading({
      type: '',
      value: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5)
    });
  };

  const getChartData = () => {
    return readings
      .filter(r => r.type === 'bp')
      .slice(0, 7)
      .reverse()
      .map(reading => ({
        date: reading.date,
        systolic: parseInt(reading.value.split('/')[0]),
        diastolic: parseInt(reading.value.split('/')[1])
      }));
  };

  const healthScore = calculateHealthScore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Health Tracker</h1>
          <p className="text-muted-foreground">Monitor your vitals with AI-powered insights</p>
        </div>

        {/* Health Score & AI Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-r from-primary to-accent text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Zap className="h-5 w-5 mr-2" />
                Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{healthScore}</div>
              <p className="text-white/80 text-sm">
                {healthScore >= 80 ? 'Excellent health' : 
                 healthScore >= 60 ? 'Good health' : 'Needs attention'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Brain className="h-5 w-5 mr-2 text-blue-500" />
                AI Health Insights
                {isLoadingInsights && <div className="ml-2 animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthInsights.length > 0 ? (
                <div className="space-y-2">
                  {healthInsights.slice(0, 2).map((insight, idx) => (
                    <div key={idx} className="text-sm p-2 bg-blue-50 rounded">
                      <p className="font-medium text-blue-800">{insight.type}</p>
                      <p className="text-blue-600">{insight.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  AI is analyzing your health data...
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Device Sync */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Bluetooth className="h-5 w-5 mr-2 text-blue-500" />
                Connected Health Devices
              </div>
              <Button 
                onClick={syncWithDevices} 
                disabled={isScanning}
                variant="outline"
                size="sm"
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                    Syncing...
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4 mr-2" />
                    Sync Devices
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connectedDevices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {connectedDevices.map((device, idx) => (
                  <div key={idx} className="flex items-center p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-sm">{device.name}</p>
                      <p className="text-xs text-muted-foreground">{device.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No devices connected. Enable Bluetooth to sync with your health devices.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {healthMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.type} className={metric.bgColor}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Icon className={`h-5 w-5 mr-2 ${metric.color}`} />
                    {metric.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{metric.lastReading}</div>
                    {metric.unit && (
                      <p className="text-sm text-muted-foreground">{metric.unit}</p>
                    )}
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      metric.status === 'normal' ? 'bg-green-100 text-green-800' :
                      metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {metric.status === 'normal' ? '✓ Normal' :
                       metric.status === 'warning' ? '⚠ Caution' : '⚠ Alert'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Blood Pressure Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="systolic" stroke="#dc2626" name="Systolic" />
                  <Line type="monotone" dataKey="diastolic" stroke="#2563eb" name="Diastolic" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Add New Reading */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Reading</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Select onValueChange={(value) => setNewReading(prev => ({...prev, type: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bp">Blood Pressure</SelectItem>
                  <SelectItem value="sugar">Blood Sugar</SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Value"
                value={newReading.value}
                onChange={(e) => setNewReading(prev => ({...prev, value: e.target.value}))}
              />
              
              <Input
                type="date"
                value={newReading.date}
                onChange={(e) => setNewReading(prev => ({...prev, date: e.target.value}))}
              />
              
              <Input
                type="time"
                value={newReading.time}
                onChange={(e) => setNewReading(prev => ({...prev, time: e.target.value}))}
              />
              
              <Button onClick={addReading} className="w-full">
                Add Reading
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Readings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Readings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {readings.slice(0, 5).map((reading) => (
                <div key={reading.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      reading.status === 'normal' ? 'bg-green-500' :
                      reading.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium">{healthMetrics.find(m => m.type === reading.type)?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {reading.value} • {reading.date} at {reading.time}
                      </p>
                    </div>
                  </div>
                  {reading.deviceId && (
                    <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Auto-synced
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthTracker;
