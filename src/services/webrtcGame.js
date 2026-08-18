/**
 * ============================================================================
 * File: src/services/webrtcGame.js
 * Purpose: PeerJS WebRTC P2P Multiplayer Connector
 * Connected To: WordChainGame.jsx, AppContext.jsx
 * Description:
 *   Establishes direct Peer-to-Peer DataChannels between players for real-time
 *   Duo Word Chain battles without requiring a dedicated backend game server.
 *   Provides room generation, connection handshakes, and packet broadcasting.
 * ============================================================================
 */

import { Peer } from 'peerjs';

export const WEBRTC_PACKETS = {
  GAME_INIT: 'GAME_INIT',
  WORD_PLAYED: 'WORD_PLAYED',
  TURN_CHANGE: 'TURN_CHANGE',
  TIMEOUT_FAIL: 'TIMEOUT_FAIL',
  GAME_OVER: 'GAME_OVER',
  REMATCH: 'REMATCH',
  CHAT_MESSAGE: 'CHAT_MESSAGE',
};

export class WebRtcGameSession {
  constructor(callbacks = {}) {
    this.peer = null;
    this.conn = null;
    this.myPeerId = null;
    this.isHost = false;
    this.callbacks = {
      onOpen: callbacks.onOpen || (() => {}),
      onConnected: callbacks.onConnected || (() => {}),
      onData: callbacks.onData || (() => {}),
      onDisconnected: callbacks.onDisconnected || (() => {}),
      onError: callbacks.onError || (() => {}),
    };
  }

  /**
   * Initialize Host Peer with a custom or random Room Code
   * @param {string} customRoomCode
   */
  initHost(customRoomCode = null) {
    const roomCode = customRoomCode || `oxf-${Math.random().toString(36).substring(2, 7)}`;
    this.isHost = true;

    try {
      this.peer = new Peer(roomCode, {
        debug: 1,
      });

      this.peer.on('open', (id) => {
        this.myPeerId = id;
        console.log(`🌐 WebRTC Host initialized with Room ID: ${id}`);
        this.callbacks.onOpen(id, true);
      });

      this.peer.on('connection', (connection) => {
        console.log('🔗 Guest connected to WebRTC room!');
        this.setupConnection(connection);
      });

      this.peer.on('error', (err) => {
        console.error('❌ WebRTC Peer Error (Host):', err);
        this.callbacks.onError(err);
      });
    } catch (err) {
      console.error('❌ Failed to initialize WebRTC Host:', err);
      this.callbacks.onError(err);
    }
  }

  /**
   * Join an existing room hosted by another player
   * @param {string} hostRoomCode
   */
  joinRoom(hostRoomCode) {
    this.isHost = false;
    const cleanRoomCode = hostRoomCode.trim().toLowerCase();

    try {
      this.peer = new Peer({
        debug: 1,
      });

      this.peer.on('open', (id) => {
        this.myPeerId = id;
        console.log(`🌐 WebRTC Guest peer initialized with ID: ${id}`);
        this.callbacks.onOpen(id, false);

        // Connect to Host
        console.log(`🔗 Connecting to Host Room "${cleanRoomCode}"...`);
        const connection = this.peer.connect(cleanRoomCode, {
          reliable: true,
        });

        this.setupConnection(connection);
      });

      this.peer.on('error', (err) => {
        console.error('❌ WebRTC Peer Error (Guest):', err);
        this.callbacks.onError(err);
      });
    } catch (err) {
      console.error('❌ Failed to join WebRTC room:', err);
      this.callbacks.onError(err);
    }
  }

  /**
   * Setup Connection Handlers on DataChannel
   */
  setupConnection(connection) {
    this.conn = connection;

    this.conn.on('open', () => {
      console.log('✅ WebRTC DataChannel successfully opened and ready!');
      this.callbacks.onConnected({
        peerId: this.conn.peer,
        isHost: this.isHost,
      });
    });

    this.conn.on('data', (data) => {
      this.callbacks.onData(data);
    });

    this.conn.on('close', () => {
      console.log('⚠️ WebRTC connection closed by peer.');
      this.callbacks.onDisconnected();
    });

    this.conn.on('error', (err) => {
      console.error('❌ WebRTC DataChannel error:', err);
      this.callbacks.onError(err);
    });
  }

  /**
   * Send typed packet over DataChannel
   */
  sendPacket(type, payload = {}) {
    if (this.conn && this.conn.open) {
      this.conn.send({
        type,
        payload,
        timestamp: Date.now(),
      });
    } else {
      console.warn('⚠️ Cannot send packet: WebRTC connection is not open.');
    }
  }

  /**
   * Destroy session and clean up peer instance
   */
  disconnect() {
    if (this.conn) {
      this.conn.close();
      this.conn = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    console.log('🛑 WebRTC Game Session disconnected.');
  }
}
