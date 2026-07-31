// Audio, Device Vibration & System Notification Bar Alert System for KPGU CSE EduPulse

export class NotificationManager {
  constructor() {
    this.audioCtx = null;
    this.permissionGranted = false;
    this.initPermission();
    this.initAudioOnFirstTouch();
  }

  async initPermission() {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        this.permissionGranted = true;
      } else if (Notification.permission !== 'denied') {
        try {
          const res = await Notification.requestPermission();
          this.permissionGranted = (res === 'granted');
        } catch (e) {
          console.warn('Permission request error:', e);
        }
      }
    }
  }

  initAudioOnFirstTouch() {
    const unlockAudio = () => {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
  }

  vibrateDevice(isUrgent = false) {
    if ('vibrate' in navigator) {
      try {
        if (isUrgent) {
          navigator.vibrate([400, 150, 400, 150, 600]);
        } else {
          navigator.vibrate([250, 100, 250]);
        }
      } catch (e) {
        console.warn('Vibration API blocked:', e);
      }
    }
  }

  playChime(isUrgent = false) {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      if (isUrgent) {
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.setValueAtTime(1174.66, now + 0.15);
        osc2.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(587.33, now + 0.15);
      } else {
        osc1.frequency.setValueAtTime(523.25, now);
        osc1.frequency.setValueAtTime(659.25, now + 0.2);
        osc1.frequency.setValueAtTime(783.99, now + 0.4);
        osc2.frequency.setValueAtTime(261.63, now);
      }

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isUrgent ? 0.7 : 0.9));

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + (isUrgent ? 0.7 : 0.9));
      osc2.stop(now + (isUrgent ? 0.7 : 0.9));
    } catch (e) {
      console.warn('Audio playback restricted:', e);
    }
  }

  async sendAlert(title, body, isUrgent = false) {
    this.playChime(isUrgent);
    this.vibrateDevice(isUrgent);
    this.showToast(title, body);

    // Send to Android System Notification Bar
    this.triggerSystemNotificationBar(title, body);
  }

  async triggerSystemNotificationBar(title, body) {
    // 1. Send postMessage to active ServiceWorker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'TRIGGER_NOTIFICATION',
        title: title,
        body: body
      });
    }

    // 2. Direct ServiceWorkerRegistration showNotification
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        if (reg && reg.showNotification) {
          reg.showNotification(title, {
            body: body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [400, 150, 400, 150, 600],
            tag: 'kpgu-bar-' + Date.now(),
            renotify: true,
            requireInteraction: true
          }).catch(err => console.warn(err));
        }
      });
    }

    // 3. Median / GoNative Android Native Notification Bridge
    try {
      if (typeof gonative !== 'undefined' && gonative.notifications) {
        gonative.notifications.create({ title: title, message: body });
      }
    } catch (e) {}

    // 4. Standard Browser Notification fallback
    try {
      new Notification(title, { body: body, icon: '/icon-192.png' });
    } catch (e) {}
  }

  showToast(title, body) {
    const container = document.getElementById('toast-container') || this.createToastContainer();
    const toast = document.createElement('div');
    toast.className = 'toast-alert';
    toast.innerHTML = `
      <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.2rem;">${title}</div>
      <div style="font-size: 0.85rem; opacity: 0.9;">${body}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  createToastContainer() {
    const div = document.createElement('div');
    div.id = 'toast-container';
    div.style.cssText = 'position: fixed; top: calc(4.2rem + env(safe-area-inset-top, 0px)); left: 0.8rem; right: 0.8rem; z-index: 99999; display: flex; flex-direction: column; gap: 0.5rem; pointer-events: none;';
    document.body.appendChild(div);
    return div;
  }
}
