import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface WSMessage {
  type: string;
  payload: any;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WSMessage | null;
  sendMessage: (message: WSMessage) => void;
  reconnect: () => void;
}

/**
 * Hook для работы с WebSocket соединением
 * Автоматически подключается, переподключается при разрыве
 * Использует JWT токен для аутентификации
 */
export function useWebSocket(): UseWebSocketReturn {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Получаем access_token из cookie (httpOnly) или localStorage
  const getAccessToken = useCallback(() => {
    // Try to get from localStorage as fallback
    const customUser = localStorage.getItem('custom_user');
    if (customUser) {
      try {
        const userData = JSON.parse(customUser);
        return userData.token || userData.accessToken;
      } catch (e) {
        console.error('Failed to parse custom_user:', e);
      }
    }
    return null;
  }, []);

  const connect = useCallback(() => {
    if (!user) {
      console.log('[WebSocket] No user, skipping connection');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      console.warn('[WebSocket] No access token available');
      return;
    }

    // Определяем WebSocket URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const wsUrl = apiUrl
      .replace('http://', 'ws://')
      .replace('https://', 'wss://')
      .replace('/api', ''); // Remove /api suffix for WS endpoint
    
    const wsEndpoint = `${wsUrl}/api/ws?token=${token}`;

    console.log(`[WebSocket] Connecting to ${wsEndpoint.replace(token, 'TOKEN')}`);

    try {
      const ws = new WebSocket(wsEndpoint);

      ws.onopen = () => {
        console.log('✅ [WebSocket] Connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          console.log('[WebSocket] Message received:', message);
          setLastMessage(message);

          // Handle specific message types
          switch (message.type) {
            case 'notification':
              // Show desktop notification if permitted
              showDesktopNotification(message.payload);
              break;
            case 'ping':
              // Respond to ping with pong
              ws.send(JSON.stringify({ type: 'pong' }));
              break;
            case 'unread_count':
              // Update unread count in UI
              console.log('[WebSocket] Unread count:', message.payload);
              break;
          }
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ [WebSocket] Error:', error);
      };

      ws.onclose = (event) => {
        console.log(`⚠️ [WebSocket] Disconnected (code: ${event.code}, reason: ${event.reason})`);
        setIsConnected(false);
        wsRef.current = null;

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`🔄 [WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          console.error('❌ [WebSocket] Max reconnection attempts reached');
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
    }
  }, [user, getAccessToken]);

  const sendMessage = useCallback((message: WSMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send message - not connected');
    }
  }, []);

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // Connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Reconnect when user changes
  useEffect(() => {
    if (user) {
      reconnect();
    }
  }, [user?.id]); // Only reconnect when user ID changes

  return {
    isConnected,
    lastMessage,
    sendMessage,
    reconnect,
  };
}

// Helper function for desktop notifications
function showDesktopNotification(notification: any) {
  if (!('Notification' in window)) {
    console.log('[Notifications] Desktop notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(notification.title || 'New Notification', {
      body: notification.message || notification.body,
      icon: '/logo.png',
      badge: '/logo.png',
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(notification.title || 'New Notification', {
          body: notification.message || notification.body,
          icon: '/logo.png',
        });
      }
    });
  }
}
