/**
 * Ultra-Reliable & Secure Real-Time Engine for Oxford 3000 Dual Player Hub.
 * Uses BroadcastChannel for local zero-latency multi-tab sync, with strict message validation.
 */

const DEFAULT_CHANNEL = 'oxford3000_pvp_local_channel';

export const LOCAL_DEVICE_ID = `dev_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

let broadcastChannel = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel(DEFAULT_CHANNEL);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment');
}

/**
 * Validate incoming real-time payload structure to prevent arbitrary injections
 */
function isValidPayload(payload) {
  if (!payload || typeof payload !== 'object') return false;
  if (!payload.id || typeof payload.id !== 'string') return false;
  if (!payload.type || typeof payload.type !== 'string') return false;
  if (payload.senderDeviceId === LOCAL_DEVICE_ID) return false; // Ignore own messages
  return true;
}

/**
 * Send real-time move or state change event to connected local tabs/windows.
 */
export async function sendRealtimeMove(moveData) {
  if (!moveData || typeof moveData !== 'object') return;

  const payload = {
    ...moveData,
    senderDeviceId: LOCAL_DEVICE_ID,
    senderTimestamp: Date.now(),
  };

  // 1. Same-device cross-tab BroadcastChannel
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(payload);
    } catch (err) {
      console.warn('BroadcastChannel error:', err);
    }
  }
}

/**
 * Subscribe to real-time events.
 */
export function subscribeRealtimeMoves(onMoveReceived) {
  const seenEventIds = new Set();

  const processEventData = (moveData) => {
    if (isValidPayload(moveData)) {
      if (seenEventIds.has(moveData.id)) return;
      seenEventIds.add(moveData.id);
      
      // Keep seen set bounded to prevent memory growth
      if (seenEventIds.size > 200) {
        const oldest = Array.from(seenEventIds).slice(0, 50);
        oldest.forEach(id => seenEventIds.delete(id));
      }

      onMoveReceived(moveData);
    }
  };

  // BroadcastChannel listener
  const handleBroadcast = (e) => {
    if (e && e.data) processEventData(e.data);
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
  };
}

export default {
  sendRealtimeMove,
  subscribeRealtimeMoves,
  LOCAL_DEVICE_ID,
};

