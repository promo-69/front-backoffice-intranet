import { io } from "socket.io-client";

const WS_URL = import.meta.env.VITE_WS_URL || "http://127.0.0.1:4000";

class SocketService {
  constructor() {
    this.socket = null;
    this._listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(WS_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on("connect", () => {
      console.log("[Socket] Connected");
    });

    this.socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect" || reason === "io client disconnect") {
        this.socket = null;
      }
    });

    this.socket.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this._listeners.clear();
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }

  waitForConnection(timeout = 15000) {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) return resolve();
      if (!this.socket) return reject(new Error("no_socket"));
      const timer = setTimeout(() => reject(new Error("connection_timeout")), timeout);
      const onConnect = () => {
        clearTimeout(timer);
        this.socket?.off("connect", onConnect);
        resolve();
      };
      this.socket.on("connect", onConnect);
    });
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  joinShowtime(showtimeId) {
    this.emit("join_showtime", { showtimeId });
  }

  waitForJoin(showtimeId, timeout = 8000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("join_timeout")), timeout);
      const onSuccess = (data) => {
        if (data?.showtimeId === showtimeId) {
          clearTimeout(timer);
          this.socket?.off("join_success", onSuccess);
          this.socket?.off("join_error", onError);
          resolve(data);
        }
      };
      const onError = (data) => {
        clearTimeout(timer);
        this.socket?.off("join_success", onSuccess);
        this.socket?.off("join_error", onError);
        reject(new Error(data?.message || "join_error"));
      };
      this.socket?.on("join_success", onSuccess);
      this.socket?.on("join_error", onError);
    });
  }

  leaveShowtime(showtimeId) {
    this.emit("leave_showtime", { showtimeId });
  }

  lockSeat(seatId) {
    this.emit("lock_seat", { seatId });
  }

  lockSeatWithAck(seatId, timeout = 8000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("lock_timeout")), timeout);
      const onSuccess = (data) => {
        if (data?.seatId === seatId) {
          clearTimeout(timer);
          this.socket?.off("seat_lock_success", onSuccess);
          this.socket?.off("seat_lock_error", onError);
          resolve(data);
        }
      };
      const onError = (data) => {
        if (data?.seatId === seatId) {
          clearTimeout(timer);
          this.socket?.off("seat_lock_success", onSuccess);
          this.socket?.off("seat_lock_error", onError);
          reject(new Error(data?.message || "lock_error"));
        }
      };
      this.socket?.on("seat_lock_success", onSuccess);
      this.socket?.on("seat_lock_error", onError);
      this.lockSeat(seatId);
    });
  }

  unlockSeat(seatId) {
    this.emit("unlock_seat", { seatId });
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
    if (this._listeners.has(event)) {
      const arr = this._listeners.get(event);
      const idx = arr.indexOf(callback);
      if (idx !== -1) arr.splice(idx, 1);
    }
  }
}

const socketService = new SocketService();
export default socketService;
