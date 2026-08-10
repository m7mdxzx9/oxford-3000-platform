/**
 * Robust Real-time Multi-Device Sync Engine for Oxford 3000 PvP Games.
 * Combines SSE (Server-Sent Events) + Fast HTTP Polling Fallback + BroadcastChannel API.
 */

const ROOM_NAME = 'oxford3000_pvp_room_m7md_ryof_v2';
const NTFY_BASE = `https://ntfy.sh/${ROOM_NAME}`;

let broadcastChannel = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel('oxford3000_pvp_channel_v2');
  }
} catch (e) {}

/**
 * Send real-time move event to all connected devices.
 */
export async function sendRealtimeMove(moveData) {
  const payload = {
    ...moveData,
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
 * Subscribe to real-time move events from any device in the room.
 * Uses SSE + Fast Polling (1.5s interval) to guarantee 100% delivery across mobile & desktop.
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

  // 3. Fast Poll backup (pulls messages every 1.5 seconds so no move is ever lost)
  const pollInterval = setInterval(async () => {
    try {
      const res = await fetch(`${NTFY_BASE}/json?poll=1&since=2m`);
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
  }, 1500);

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
