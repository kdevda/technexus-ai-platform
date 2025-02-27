import { useState, useEffect, useRef } from 'react';
import { Device } from '@twilio/voice-sdk';
import { Phone, X, Mic, MicOff, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialpad } from './Dialpad';
import { CallHistory } from './CallHistory';
import { useToast } from '@/components/ui/use-toast';
import api from '@/config/api';
import { handleApiError, getErrorMessage } from '@/utils/errorHandler';

interface SoftphoneProps {
  onClose: () => void;
}

export const Softphone = ({ onClose }: SoftphoneProps) => {
  const [device, setDevice] = useState<Device | null>(null);
  const [connection, setConnection] = useState<any>(null);
  const [isIncoming, setIsIncoming] = useState(false);
  const [incomingNumber, setIncomingNumber] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [view, setView] = useState<'dialpad' | 'history'>('dialpad');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState<'ready' | 'error' | 'unavailable'>('unavailable');

  useEffect(() => {
    initializeTwilio();
    return () => {
      if (device) {
        device.destroy();
      }
    };
  }, []);

  const handleError = (error: any) => {
    console.error('Softphone error:', error);
    setDeviceStatus('error');
    const errorMessage = getErrorMessage(error, 'An error occurred with the softphone');
    toast({
      variant: 'destructive',
      title: 'Softphone Error',
      description: errorMessage,
    });
    setIsLoading(false);
    setIsCallActive(false);
  };

  const handleDisconnect = () => {
    console.log('Call disconnected');
    setIsCallActive(false);
    setConnection(null);
    setIsMuted(false);
  };

  const initializeTwilio = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleError(new Error('User is not authenticated. Please log in.'));
        return;
      }
      console.log('Authentication token found:', token.substring(0, 10) + '...');
      console.log('Fetching Twilio config...');
      const configResponse = await api.get('/twilio/config/current');
      console.log('Twilio config response:', configResponse.data);
      const config = configResponse.data;
      if (!config.enabled) {
        handleError(new Error('Twilio integration is not enabled'));
        return;
      }
      if (config.twimlAppSid) {
        console.log('Using TwiML App SID:', config.twimlAppSid);
      } else {
        console.warn('No TwiML App SID configured, calls may not work properly');
      }
      console.log('Fetching Twilio token...');
      try {
        const timestamp = new Date().getTime();
        const tokenResponse = await api.get(`/twilio/token?_t=${timestamp}`);
        console.log('Twilio token response:', tokenResponse);
        if (!tokenResponse.data || !tokenResponse.data.token) {
          console.error('Invalid token response:', tokenResponse.data);
          throw new Error('Received invalid Twilio token response');
        }
        const twilioToken = tokenResponse.data.token;
        console.log('Twilio token received, length:', twilioToken.length);
        if (!twilioToken) {
          throw new Error('Received empty Twilio token');
        }
        console.log('Initializing Twilio device with token...');
        try {
          const newDevice = new Device(twilioToken, {
            closeProtection: true,
            disableAudioContextSounds: false,
            logLevel: 'debug'
          });
          newDevice.on('ready', () => {
            console.log('Twilio device is ready');
            setDevice(newDevice);
            setDeviceStatus('ready');
            setIsLoading(false);
            toast({
              title: 'Softphone Ready',
              description: 'Your softphone is now ready to make and receive calls',
            });
          });
          newDevice.on('error', (error) => {
            console.error('Twilio device error:', error);
            console.error('Twilio error code:', error.code);
            console.error('Twilio error message:', error.message);
            console.error('Twilio error details:', error.info || 'No additional details');
            handleError(error);
          });
          newDevice.on('incoming', (conn) => {
            console.log('Incoming call received:', conn);
            handleIncomingCall(conn);
          });
          newDevice.on('cancel', () => {
            console.log('Call was cancelled');
            handleDisconnect();
          });
          newDevice.on('disconnect', () => {
            console.log('Call was disconnected');
            handleDisconnect();
          });
          console.log('Registering Twilio device...');
          await newDevice.register();
          console.log('Twilio device registered successfully');
        } catch (deviceError) {
          console.error('Error initializing Twilio device:', deviceError);
          if (deviceError instanceof Error) {
            console.error('Error name:', deviceError.name);
            console.error('Error message:', deviceError.message);
            console.error('Error stack:', deviceError.stack);
          }
          throw deviceError;
        }
      } catch (tokenError) {
        console.error('Error with Twilio token:', tokenError);
        if (tokenError instanceof Error) {
          console.error('Token error details:', (tokenError as any).response?.data || 'No additional details');
        }
        handleError(tokenError || new Error('Failed to initialize Twilio with the provided token'));
      }
    } catch (error) {
      console.error('Error initializing Twilio:', error);
      handleApiError(error || new Error('Failed to initialize Twilio'), 'Twilio Initialization Error', 'Failed to initialize Twilio softphone');
      setIsLoading(false);
    }
  };

  const handleIncomingCall = (conn: any) => {
    setIsIncoming(true);
    setIncomingNumber(conn.parameters.From);
    setConnection(conn);
    conn.on('disconnect', handleDisconnect);
    conn.on('error', handleError);
    toast({
      title: "Incoming Call",
      description: `From: ${conn.parameters.From}`,
    });
  };

  const handleOutgoingCall = async (number: string) => {
    try {
      if (!device) {
        toast({
          title: "Error",
          description: "Softphone not initialized",
          variant: "destructive",
        });
        return;
      }
      let formattedNumber = number;
      if (!number.startsWith('+')) {
        formattedNumber = `+1${number.replace(/\D/g, '')}`;
      }
      console.log(`Initiating call to ${formattedNumber}`);
      setIsLoading(true);
      const conn = await device.connect({ 
        params: { 
          To: formattedNumber,
        }
      });
      console.log('Call connected:', conn);
      setConnection(conn);
      setIsCallActive(true);
      setIsLoading(false);
      conn.on('disconnect', () => {
        console.log('Call disconnected');
        handleDisconnect();
      });
      conn.on('error', (error) => {
        console.error('Call connection error:', error);
        handleError(error);
      });
      toast({
        title: "Call Connected",
        description: `Connected to ${formattedNumber}`,
      });
    } catch (error) {
      console.error('Error making call:', error);
      setIsLoading(false);
      toast({
        title: "Call Failed",
        description: getErrorMessage(error, "Failed to place call"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed bottom-24 right-8 w-80 bg-white rounded-lg shadow-lg">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Softphone</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center mb-4">
          <Phone className={`h-6 w-6 ${deviceStatus === 'ready' ? 'text-green-500' : deviceStatus === 'error' ? 'text-red-500' : 'text-gray-500'}`} />
          <span className="ml-2 text-sm">
            {deviceStatus === 'ready' ? 'Device Ready' : deviceStatus === 'error' ? 'Device Error' : 'Device Unavailable'}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={view === 'dialpad' ? 'default' : 'outline'}
            onClick={() => setView('dialpad')}
          >
            Dialpad
          </Button>
          <Button
            variant={view === 'history' ? 'default' : 'outline'}
            onClick={() => setView('history')}
          >
            History
          </Button>
        </div>

        {/* Main content */}
        {view === 'dialpad' ? (
          <Dialpad onCall={handleOutgoingCall} disabled={isCallActive} />
        ) : (
          <CallHistory onCallNumber={handleOutgoingCall} />
        )}

        {/* Active call controls */}
        {isCallActive && (
          <div className="mt-4 flex justify-center gap-4">
            <Button
              variant={isMuted ? 'destructive' : 'outline'}
              size="icon"
              onClick={() => {
                connection?.mute(!isMuted);
                setIsMuted(!isMuted);
              }}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => connection?.disconnect()}
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}; 