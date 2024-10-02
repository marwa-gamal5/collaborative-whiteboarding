import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

/**
 * Custom hook to manage multiplayer state using Yjs and WebSocket
 * @param {WebsocketProvider} wsProvider - The Yjs WebSocket provider
 * @param {Y.Doc} doc - The Yjs document
 * @returns {Object} provider and awareness state
 */
export const useMultiplayerState = (wsProvider, doc) => {
  const [provider, setProvider] = useState(null);
  const [connected, setConnected] = useState(false);
  const awareness = wsProvider.awareness;

  useEffect(() => {
    // Set the WebSocket provider when the component mounts
    setProvider(wsProvider);

    // Listen for connection status changes
    wsProvider.on('status', (event) => {
      setConnected(event.status === 'connected');
      console.log(`WebSocket connection status: ${event.status}`);
    });

    // Cleanup the provider when the component unmounts
    return () => {
      wsProvider.disconnect();
      wsProvider.destroy();
    };
  }, [wsProvider]);

  useEffect(() => {
    // Awareness is used to track connected users
    awareness.setLocalStateField('user', {
      name: 'Anonymous',
    });

    // Handle changes in awareness (like users joining/leaving)
    const handleAwarenessChange = () => {
      console.log('Awareness state changed', Array.from(awareness.getStates().values()));
    };

    awareness.on('change', handleAwarenessChange);

    // Cleanup awareness listeners on unmount
    return () => {
      awareness.off('change', handleAwarenessChange);
    };
  }, [awareness]);

  return { provider, connected, awareness };
};
