// src/api/websocketService.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = 'http://localhost:8080/ws-ledger';

/**
 * Creates and initializes a STOMP WebSocket client
 * * @param {string} token - Current JWT Token for authentication
 * @param {function} onConnectCallback - Callback invoked when connection is established
 * @returns {Client} Connected STOMP Client instance
 */
export const createWebSocketClient = (token, onConnectCallback) => {
  const client = new Client({
    // Fallback to SockJS if native WebSockets are blocked
    webSocketFactory: () => new SockJS(WS_URL),
    connectHeaders: {
      Authorization: token ? `Bearer ${token}` : '',
    },
    debug: (str) => {
      if (import.meta.env.DEV) {
        console.log('[STOMP WS]:', str);
      }
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  client.onConnect = (frame) => {
    console.log('✅ WebSocket Connected successfully to /ws-ledger');
    if (onConnectCallback) {
      onConnectCallback(client, frame);
    }
  };

  client.onStompError = (frame) => {
    console.error('❌ STOMP Broker error:', frame.headers['message']);
    console.error('Details:', frame.body);
  };

  client.activate();
  return client;
};