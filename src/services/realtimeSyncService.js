/**
 * Real-time Multi-Device Sync Service for Oxford 3000 PvP Games.
 * Uses ntfy.sh Server-Sent Events (SSE) + BroadcastChannel API + localStorage sync.
 */

const ROOM_NAME = 'oxford3000_pvp_room_m7md_ryof';
const NTFY_URL = `https://ntfy.sh/${ROOM_NAME}`;

let broadcastChannel = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel('oxford3000_pvp_channel');
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
    await fetch(NTFY_URL, {
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
 */
export function subscribeRealtimeMoves(onMoveReceived) {
  const seenEventIds = new Set();

  // 1. BroadcastChannel listener
  const handleBroadcast = (e) => {
    if (e.data && e.data.id) {
      if (seenEventIds.has(e.data.id)) return;
      seenEventIds.add(e.data.id);
      onMoveReceived(e.data);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  // 2. ntfy.sh SSE listener (works on separate phones, laptops, and networks!)
  let eventSource = null;
  try {
    eventSource = new EventSource(`${NTFY_URL}/json`);
    eventSource.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        if (raw && raw.message) {
          const moveData = JSON.parse(raw.message);
          if (moveData && moveData.id) {
            if (seenEventIds.has(moveData.id)) return;
            seenEventIds.add(moveData.id);
            onMoveReceived(moveData);
          }
        }
      } catch (err) {}
    };
  } catch (err) {
    console.error('SSE connection error:', err);
  }

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    if (eventSource) {
      eventSource.close();
    }
  };
}
