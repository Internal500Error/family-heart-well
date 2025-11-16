import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff,
  Heart,
  Pill,
  Activity,
  BookOpen,
  Volume2,
  Camera,
  Zap,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import HealthAIEngine, { HealthInsight } from '@/lib/ai-engine';
import VoiceAnalysisService, { SpeechRecognitionService, TextToSpeechService } from '@/lib/voice-analysis';
import ComputerVisionService from '@/lib/computer-vision';
import IoTIntegrationService from '@/lib/iot-integration';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
  insights?: HealthInsight[];
  voiceAnalysis?: any;
  imageAnalysis?: any;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      message: "Namaste! 🙏 I'm your advanced DilCare AI assistant with enhanced capabilities. I can now analyze your voice for stress, recognize pills from photos, integrate with your health devices, and provide predictive health insights. How can I make your day better?",
      timestamp: new Date()
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  // Advanced AI services
  const aiEngine = HealthAIEngine.getInstance();
  const voiceService = VoiceAnalysisService.getInstance();
  const speechRecognition = new SpeechRecognitionService();
  const textToSpeech = new TextToSpeechService();
  const visionService = ComputerVisionService.getInstance();
  const iotService = IoTIntegrationService.getInstance();

  useEffect(() => {
    // Initialize advanced services
    initializeAdvancedFeatures();
  }, []);

  const initializeAdvancedFeatures = async () => {
    try {
      await voiceService.initializeAudio();
      // Load user health profile for personalized insights
      loadUserHealthProfile();
    } catch (error) {
      console.log('Some advanced features may not be available:', error);
    }
  };

  const loadUserHealthProfile = () => {
    // Simulate loading user health data
    const mockUserProfile = {
      age: 45,
      conditions: ['hypertension', 'diabetes'],
      medications: ['Atorvastatin', 'Metformin'],
      preferences: { languages: ['en-US', 'hi-IN'] }
    };
    aiEngine.updateUserProfile(mockUserProfile);
  };

  const sendMessage = async (text: string, type: 'text' | 'voice' | 'image' = 'text') => {
    if (!text.trim()) return;

    setIsTyping(true);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      // Prepare AI response with enhanced features
      let aiResponse = '';
      let insights: HealthInsight[] = [];
      let voiceAnalysis = null;
      let imageAnalysis = null;

      // Handle different message types
      if (type === 'voice') {
        setIsAnalyzingVoice(true);
        voiceAnalysis = await voiceService.analyzeVoiceStress(text);
        aiResponse = generateVoiceResponse(text, voiceAnalysis);
        setIsAnalyzingVoice(false);
      } else if (type === 'image') {
        setIsProcessingImage(true);
        // Simulate image analysis (would use actual image data in real implementation)
        imageAnalysis = await visionService.identifyPill('mock-image-data');
        aiResponse = generateImageResponse(imageAnalysis);
        setIsProcessingImage(false);
      } else {
        // Regular text analysis with health insights
        insights = await aiEngine.generatePersonalizedInsights(text);
        aiResponse = generateAIResponse(text, insights);
      }

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: aiResponse,
        timestamp: new Date(),
        insights,
        voiceAnalysis,
        imageAnalysis
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Speak response if voice interaction
      if (type === 'voice') {
        await textToSpeech.speak(aiResponse);
      }

    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: "I'm having trouble processing that right now. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = (userMessage: string, insights: HealthInsight[]) => {
    const responses = [
      "Based on your health profile, here's what I think:",
      "Let me analyze that with my advanced health AI:",
      "I've processed your request with my enhanced capabilities:",
      "Here's my personalized health insight for you:"
    ];
    
    const baseResponse = responses[Math.floor(Math.random() * responses.length)];
    
    if (insights.length > 0) {
      const insightText = insights.map(insight => 
        `${insight.category}: ${insight.recommendation} (${insight.confidence}% confidence)`
      ).join('\n');
      return `${baseResponse}\n\n${insightText}`;
    }
    
    return `${baseResponse} I understand you're asking about "${userMessage}". While I can provide general guidance, please consult with your healthcare provider for personalized medical advice. Would you like me to analyze any symptoms or connect you with health resources?`;
  };

  const generateVoiceResponse = (text: string, voiceAnalysis: any) => {
    if (voiceAnalysis?.stressLevel === 'high') {
      return "I noticed some stress in your voice. Let's take a moment to breathe together. Would you like me to guide you through a relaxation exercise?";
    }
    return `I heard you say: "${text}". Your voice analysis suggests you're feeling ${voiceAnalysis?.mood || 'calm'}. How can I help you today?`;
  };

  const generateImageResponse = (imageAnalysis: any) => {
    if (imageAnalysis?.pillIdentified) {
      return `I've identified this as ${imageAnalysis.pillName}. This medication is typically used for ${imageAnalysis.commonUse}. Always verify with your pharmacist or doctor.`;
    }
    return "I've analyzed the image. If this is a medication, please ensure it's prescribed by your healthcare provider.";
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      speechRecognition.stop();
      setIsListening(false);
    } else {
      try {
        setIsListening(true);
        const transcript = await speechRecognition.start();
        if (transcript) {
          await sendMessage(transcript, 'voice');
        }
      } catch (error) {
        console.error('Voice recognition error:', error);
      } finally {
        setIsListening(false);
      }
    }
  };

  const handleImageCapture = async () => {
    try {
      // In a real implementation, this would capture from camera
      // For now, simulate with a file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          await sendMessage(`Analyzing captured image: ${file.name}`, 'image');
        }
      };
      input.click();
    } catch (error) {
      console.error('Camera capture error:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b border-border/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">DilCare AI Assistant</h1>
              <p className="text-muted-foreground text-sm">Your Advanced Health Companion</p>
            </div>
          </div>
          
          {/* Helpful Notice */}
          <Card className="mt-4 bg-gradient-to-r from-primary/10 to-accent/20 border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-start space-x-2">
                <Heart className="h-4 w-4 text-primary mt-0.5 animate-pulse" />
                <div className="flex-1">
                  <p className="text-xs text-foreground">
                    I'm enhanced with AI superpowers! I can analyze voice stress, identify pills from photos,
                    predict health risks, and sync with your health devices.
                    Always consult your doctor for medical decisions.
                  </p>
                  {(isAnalyzingVoice || isProcessingImage) && (
                    <div className="mt-2 flex items-center space-x-2">
                      <Brain className="h-3 w-3 text-blue-500 animate-pulse" />
                      <span className="text-xs text-blue-600 font-medium">
                        {isAnalyzingVoice && "Analyzing voice patterns..."}
                        {isProcessingImage && "Processing image with AI..."}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Messages */}
        <div className="bg-white shadow-lg max-h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground ml-auto' 
                  : 'bg-muted text-foreground'
              }`}>
                <p className="text-sm">{message.message}</p>
                {message.insights && message.insights.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.insights.map((insight, idx) => (
                      <div key={idx} className="flex items-center space-x-1 text-xs">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        <span>{insight.category}: {insight.recommendation}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs opacity-75 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground max-w-xs lg:max-w-md px-4 py-2 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6 border-t border-border/50">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me about your health, symptoms, or wellness..."
                className="pr-20"
                disabled={isListening || isAnalyzingVoice || isProcessingImage}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleVoiceInput}
                  className={`p-1 h-8 w-8 ${isListening ? 'text-red-500' : 'text-muted-foreground'}`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleImageCapture}
                  className="p-1 h-8 w-8 text-muted-foreground"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={!inputMessage.trim() || isTyping || isListening || isAnalyzingVoice || isProcessingImage}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendMessage("How can I track my heart health?")}
              className="text-xs"
            >
              <Heart className="h-3 w-3 mr-1" />
              Heart Health
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendMessage("Tell me about my medication schedule")}
              className="text-xs"
            >
              <Pill className="h-3 w-3 mr-1" />
              Medications
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendMessage("What exercises are good for me?")}
              className="text-xs"
            >
              <Activity className="h-3 w-3 mr-1" />
              Exercise
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendMessage("Show me health tips")}
              className="text-xs"
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Health Tips
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
