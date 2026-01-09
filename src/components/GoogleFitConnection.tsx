import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Smartphone, 
  Cloud,
  RefreshCw,
  Settings,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EnhancedStepTrackerService from '@/lib/enhanced-step-tracker';

{/* =issue fixedhere*/}


{/* =issue fixedhere*/}

interface ConnectionStatus {
  googleFit: boolean;
  deviceSensors: boolean;
  dataSource: string;
  lastSync: Date;
}

const GoogleFitConnection: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    googleFit: false,
    deviceSensors: true,
    dataSource: 'device-sensors',
    lastSync: new Date()
  });
  const [accuracy, setAccuracy] = useState<'high' | 'medium' | 'low'>('medium');

  const stepTracker = EnhancedStepTrackerService.getInstance();

  useEffect(() => {
    updateConnectionStatus();
  }, []);

  const updateConnectionStatus = () => {
    const status = stepTracker.getConnectionStatus();
    const dataAccuracy = stepTracker.getDataAccuracy();
    setConnectionStatus(status);
    setAccuracy(dataAccuracy);
  };

  const handleConnectGoogleFit = async () => {
    setIsConnecting(true);
    try {
      const success = await stepTracker.connectGoogleFit();
      if (success) {
        updateConnectionStatus();
        console.log('Successfully connected to Google Fit');
      } else {
        console.error('Failed to connect to Google Fit');
      }
    } catch (error) {
      console.error('Error connecting to Google Fit:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGoogleFit = async () => {
    try {
      await stepTracker.disconnectGoogleFit();
      updateConnectionStatus();
      console.log('Disconnected from Google Fit');
    } catch (error) {
      console.error('Error disconnecting from Google Fit:', error);
    }
  };

  const handleRefreshData = async () => {
    setIsConnecting(true);
    try {
      await stepTracker.refreshData();
      updateConnectionStatus();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const getDataSourceIcon = () => {
    switch (connectionStatus.dataSource) {
      case 'google-fit':
        return <Cloud className="h-4 w-4 text-blue-500" />;
      case 'device-sensors':
        return <Smartphone className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAccuracyBadge = () => {
    const variants = {
      high: 'default',
      medium: 'secondary',
      low: 'outline'
    } as const;

    const colors = {
      high: 'text-green-600',
      medium: 'text-yellow-600',
      low: 'text-red-600'
    };

    return (
      <Badge variant={variants[accuracy]} className={colors[accuracy]}>
        {accuracy.toUpperCase()} ACCURACY
      </Badge>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-3 sm:px-4 py-3 sm:py-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
            <span className="truncate text-sm sm:text-base lg:text-lg">Data Sources</span>
          </div>
          {getAccuracyBadge()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-4">
        {/* Current Data Source */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center min-w-0 flex-1">
            {getDataSourceIcon()}
            <div className="ml-3 min-w-0 flex-1">
              <p className="font-medium text-sm truncate">
                {connectionStatus.dataSource === 'google-fit' ? 'Google Fit' : 'Device Sensors'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Last sync: {connectionStatus.lastSync.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <Button
            onClick={handleRefreshData}
            variant="outline"
            size="sm"
            disabled={isConnecting}
            className="ml-2 flex-shrink-0 h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
          >
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isConnecting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline ml-1">Sync</span>
          </Button>
        </div>

        {/* Google Fit Connection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full mr-3 ${
                connectionStatus.googleFit ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className="text-sm font-medium">Google Fit</span>
            </div>
            {connectionStatus.googleFit ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-gray-400" />
            )}
          </div>

          {connectionStatus.googleFit ? (
            <div className="space-y-2">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Connected to Google Fit for high-accuracy step tracking across all your devices.
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleDisconnectGoogleFit}
                variant="outline"
                size="sm"
                className="w-full text-xs sm:text-sm"
              >
                Disconnect Google Fit
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Connect to Google Fit for the most accurate step tracking and access to historical data.
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleConnectGoogleFit}
                disabled={isConnecting}
                className="w-full text-xs sm:text-sm"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Connect Google Fit
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Device Sensors Status hello krishna here*/}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full mr-3 bg-green-500" />
            <span className="text-sm font-medium">Device Sensors</span>
          </div>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </div>

        {/* Benefits Information */}
        <div className="pt-2 space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Google Fit Benefits:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Accurate tracking across phones, smartwatches, and fitness trackers</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Automatic activity detection (walking, running, cycling)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Historical data and cross-device synchronization</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Battery-optimized background tracking</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleFitConnection;
