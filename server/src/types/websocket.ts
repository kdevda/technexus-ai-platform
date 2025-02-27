import { WebSocket } from 'ws';

export interface ExtendedWebSocket extends WebSocket {
  isAlive?: boolean;
}

export interface WSConnection {
  ws: ExtendedWebSocket;
  userId: string;
}

export interface UserStatus {
  status: 'online' | 'offline' | 'busy';
}

export interface CallData {
  type: string;
  callId?: string;
  status?: string;
  [key: string]: any;
} 