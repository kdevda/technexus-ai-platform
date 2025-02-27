import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { parse } from 'url';
import { verify } from 'jsonwebtoken';
import { prisma } from './db';
import { UserStatus, WSConnection, ExtendedWebSocket } from './types/websocket';

export class CallWebSocketServer {
  private wss: WebSocketServer;
  private connections: Map<string, WSConnection>;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws' // Set the WebSocket path to /ws
    });
    this.connections = new Map();
    this.init();
    console.log('WebSocket server initialized at path: /ws');
  }

  private init() {
    this.wss.on('connection', async (ws: ExtendedWebSocket, req) => {
      try {
        console.log('WebSocket connection attempt from:', req.socket.remoteAddress);
        
        const { query } = parse(req.url || '', true);
        const token = query.token as string;

        if (!token) {
          console.warn('WebSocket connection rejected: No token provided');
          ws.close(1008, 'Token required');
          return;
        }

        let userId: string;
        
        try {
          // Verify JWT token
          const decoded = verify(token, process.env.JWT_SECRET!) as any;
          userId = decoded.userId;
          console.log(`Authenticated WebSocket connection for user: ${userId}`);
        } catch (error) {
          // In development, allow connections even with invalid tokens
          if (process.env.NODE_ENV === 'development') {
            console.warn('Invalid token in development mode, allowing connection anyway');
            userId = 'dev-user-' + Math.random().toString(36).substring(2, 9);
          } else {
            console.error('WebSocket authentication failed:', error);
            ws.close(1008, 'Authentication failed');
            return;
          }
        }

        // Create connection object
        const connection: WSConnection = {
          ws,
          userId
        };
        
        // Store the connection
        this.connections.set(userId, connection);
        console.log(`WebSocket connection established for user: ${userId}`);

        // Setup ping/pong for connection health
        ws.isAlive = true;
        ws.on('pong', () => {
          connection.ws.isAlive = true;
        });

        // Send welcome message
        ws.send(JSON.stringify({
          type: 'welcome',
          message: 'Connected to TechNexus WebSocket server',
          userId
        }));

        // Handle client messages
        ws.on('message', async (message: string) => {
          try {
            console.log(`Received message from ${userId}:`, message.toString());
            const data = JSON.parse(message.toString());
            await this.handleMessage(connection, data);
          } catch (error) {
            console.error('Error handling message:', error);
          }
        });

        // Handle disconnection
        ws.on('close', (code, reason) => {
          console.log(`WebSocket connection closed for user ${userId}: ${code} ${reason}`);
          this.connections.delete(userId);
        });
      } catch (error) {
        console.error('WebSocket connection error:', error);
        ws.close(1011, 'Server error');
      }
    });

    // Heartbeat to keep connections alive
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        const extendedWs = ws as ExtendedWebSocket;
        if (!extendedWs.isAlive) {
          return ws.terminate();
        }
        extendedWs.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  private async handleMessage(connection: WSConnection, data: any) {
    switch (data.type) {
      case 'agent_status':
        await this.updateAgentStatus(connection, data);
        break;
      case 'call_accepted':
        await this.handleCallAccepted(connection, data);
        break;
      // Add more message handlers as needed
    }
  }

  public notifyIncomingCall(callData: any) {
    // Broadcast to all connected users
    this.connections.forEach((connection) => {
      const message = JSON.stringify({
        type: 'incoming_call',
        call: callData
      });
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(message);
      }
    });
  }

  private async updateAgentStatus(connection: WSConnection, data: UserStatus) {
    await prisma.user.update({
      where: { id: connection.userId },
      data: {
        status: data.status
      }
    });

    this.broadcastToAll({
      type: 'agent_status_changed',
      agentId: connection.userId,
      status: data.status
    });
  }

  private async handleCallAccepted(connection: WSConnection, data: any) {
    // Update call record with accepting agent
    await prisma.callHistory.update({
      where: { id: data.callId },
      data: { 
        userId: connection.userId,
        status: 'IN_PROGRESS'
      }
    });

    // Notify other agents that call was accepted
    this.broadcastToAll({
      type: 'call_accepted',
      callId: data.callId,
      agentId: connection.userId
    });
  }

  private broadcastToAll(data: any) {
    this.connections.forEach((connection) => {
      const message = JSON.stringify(data);
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(message);
      }
    });
  }
} 