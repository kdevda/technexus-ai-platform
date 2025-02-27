import { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Softphone } from './Softphone';
import { cn } from '@/lib/utils';

export const PhoneBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found, cannot connect to WebSocket');
      setConnectionError('No authentication token found');
      return;
    }

    // Determine WebSocket URL based on current environment
    let wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let wsHost = window.location.hostname;
    let wsPort = window.location.hostname === 'localhost' ? ':3001' : '';
    
    // If we're using ngrok, we need to use the same hostname
    const wsUrl = `${wsProtocol}//${wsHost}${wsPort}/ws?token=${token}`;
    console.log('Connecting to WebSocket at:', wsUrl);
    
    let reconnectAttempts = 0;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let ws: WebSocket | null = null;

    const connectWebSocket = () => {
      // Clear any existing connection error
      setConnectionError(null);
      
      // Create a new WebSocket connection
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setWsConnected(true);
        reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
        setConnectionError('Failed to connect to WebSocket server');
      };
      
      ws.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        setWsConnected(false);
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          console.log(`Attempting to reconnect in ${delay}ms...`);
          
          reconnectTimer = setTimeout(() => {
            reconnectAttempts++;
            connectWebSocket();
          }, delay);
        } else {
          setConnectionError('Failed to connect after multiple attempts');
        }
      };
      
      ws.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'incoming_call') {
            setIsRinging(true);
            setIncomingCall(data.call);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    };

    // Initial connection
    connectWebSocket();

    // Cleanup function
    return () => {
      console.log('Closing WebSocket connection');
      if (ws) {
        ws.close();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, []);

  return (
    <>
      <Button
        className={cn(
          "fixed bottom-8 right-8 rounded-full w-12 h-12 p-0",
          isRinging && "animate-shake",
          !wsConnected && "bg-gray-400"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Phone className="h-6 w-6" />
        {!wsConnected && (
          <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500"></span>
        )}
      </Button>

      {isOpen && <Softphone onClose={() => setIsOpen(false)} />}

      {/* Connection error notification */}
      {connectionError && (
        <div className="fixed bottom-24 right-8 w-80 bg-white rounded-lg shadow-lg p-4 border-l-4 border-red-500">
          <h3 className="font-semibold text-red-500">Connection Error</h3>
          <p className="text-sm text-gray-600">{connectionError}</p>
        </div>
      )}

      {/* Incoming call notification */}
      {isRinging && !isOpen && (
        <div className="fixed bottom-24 right-8 w-80 bg-white rounded-lg shadow-lg p-4">
          <h3 className="font-semibold">Incoming Call</h3>
          <p className="text-sm text-gray-600">{incomingCall?.from}</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                setIsRinging(false);
                setIncomingCall(null);
              }}
            >
              Reject
            </Button>
            <Button
              onClick={() => {
                setIsOpen(true);
                setIsRinging(false);
              }}
            >
              Answer
            </Button>
          </div>
        </div>
      )}
    </>
  );
}; 