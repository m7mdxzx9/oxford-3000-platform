/**
 * Robust Real-time Multi-Device Sync Engine for Oxford 3000 Dual Player Hub.
 * Combines SSE (Server-Sent Events) + Fast HTTP Polling Fallback + BroadcastChannel API.
 */

const ROOM_NAME = 'oxford3000_pvp_room_m7md_ryof_v3';
const NTFY_BASE = `https://ntfy.sh/${ROOM_NAME}`;

export const LOCAL_DEVICE_ID = `dev_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;

let broadcastChannel = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel('oxford3000_pvp_channel_v3');
  }
} catch (e) {}

/**
 * Send real-time move or state change event to all connected devices.
 */
export async function sendRealtimeMove(moveData) {
  const payload = {
    ...moveData,
    senderDeviceId: LOCAL_DEVICE_ID,
    senderTimestamp: Date.now(),
  };

  // 1. Same-device cross-tab BroadcastChannel
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(payload);
    } catch (err) {}
  }

  // 2. Multi-device worldwide SSE relay via ntfy.sh
  try {
    await fetch(NTFY_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Realtime move POST error:', err);
  }
}

/**
 * Subscribe to real-time events from any device in the room.
 */
export function subscribeRealtimeMoves(onMoveReceived) {
  const seenEventIds = new Set();

  const processEventData = (moveData) => {
    if (moveData && moveData.id) {
      if (seenEventIds.has(moveData.id)) return;
      seenEventIds.add(moveData.id);
      onMoveReceived(moveData);
    }
  };

  // 1. BroadcastChannel listener
  const handleBroadcast = (e) => {
    if (e.data) processEventData(e.data);
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  // 2. ntfy.sh SSE EventSource listener
  let eventSource = null;
  try {
    eventSource = new EventSource(`${NTFY_BASE}/json`);
    eventSource.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        if (raw && raw.message) {
          const moveData = JSON.parse(raw.message);
          processEventData(moveData);
        }
      } catch (err) {}
    };
  } catch (err) {
    console.error('SSE connection error:', err);
  }

  // 3. Fast Poll backup (pulls messages every 1.2s to guarantee zero missing events)
  const pollInterval = setInterval(async () => {
    try {
      const res = await fetch(`${NTFY_BASE}/json?poll=1&since=1m`);
      if (res.ok) {
        const text = await res.text();
        const lines = text.split('\n').filter(Boolean);
        lines.forEach((line) => {
          try {
            const raw = JSON.parse(line);
            if (raw && raw.message) {
              const moveData = JSON.parse(raw.message);
              processEventData(moveData);
            }
          } catch (e) {}
        });
      }
    } catch (e) {}
  }, 1200);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    if (eventSource) {
      eventSource.close();
    }
    clearInterval(pollInterval);
  };
}
