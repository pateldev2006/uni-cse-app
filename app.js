// Uni Vadodara CSE Main Application Orchestrator (Batch A)
// v9 - Web Push Notification System

import { CampusMapManager, BUILDINGS_DATA } from './components/map.js';
import { NotificationManager } from './components/alerts.js';
import { ScheduleManager } from './components/schedule.js';

class EduPulseApp {
  constructor() {
    this.notifications = new NotificationManager();
    this.scheduleManager = new ScheduleManager(
      (building, room) => this.navigateToMapLocation(building, room),
      () => this.onScheduleDataUpdated()
    );
    this.mapManager = new CampusMapManager('campus-map-container');
    
    this.currentTab = 'dashboard';
    this.timerInterval = null;
    this.lastKnownVersion = null;
    this.pushSubscribed = false;
    
    this.init();
  }

  init() {
    this.setupTabNavigation();
    this.setupModal();
    this.renderDashboard();
    this.mapManager.render();
    this.startCountdownLoop();
    this.startLiveSyncLoop();
    this.registerServiceWorkerAndPush();
  }





  async registerServiceWorkerAndPush() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return;
    }

    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered!', reg);

      // Wait for the SW to be ready
      const swReg = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker ready!');

      // Subscribe to Web Push
      await this.subscribeToPush(swReg);
    } catch (err) {
      console.warn('SW registration failed:', err);
    }
  }

  async subscribeToPush(swRegistration) {
    try {
      // Check if already subscribed
      let subscription = await swRegistration.pushManager.getSubscription();

      if (subscription) {
        console.log('📱 Already subscribed to push!');
        await this.sendSubscriptionToServer(subscription);
        this.pushSubscribed = true;
        this.updatePushStatusUI(true);
        return;
      }

      // Get VAPID public key from server
      const response = await fetch('/api/vapid-public-key');
      const { publicKey } = await response.json();

      if (!publicKey) {
        console.warn('No VAPID public key available from server');
        return;
      }

      // Convert VAPID key from base64url to Uint8Array
      const vapidKeyArray = this.urlBase64ToUint8Array(publicKey);

      // Subscribe
      subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKeyArray
      });

      console.log('🔔 Push subscription created!', JSON.stringify(subscription));

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      this.pushSubscribed = true;

    } catch (err) {
      console.warn('Push subscription failed:', err);
    }
  }

  async sendSubscriptionToServer(subscription) {
    try {
      const response = await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON())
      });
      const result = await response.json();
      console.log('📤 Subscription sent to server:', result);
    } catch (err) {
      console.warn('Failed to send subscription to server:', err);
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }


  setupTabNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn, .mob-nav-item');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) this.switchTab(tab);
      });
    });

    const syncBtn = document.getElementById('header-sync-btn');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => {
        this.scheduleManager.resetToDefaults();
        this.scheduleManager.fetchServerData();
        this.notifications.sendAlert('🔄 Timetable Synced', 'Uni official Batch A schedule loaded cleanly!');
      });
    }

    const soundBtn = document.getElementById('header-sound-test-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', async () => {
        // Trigger in-app alert
        this.notifications.sendAlert('🔔 LIVE TEST NOTIFICATION', 'Ringtone, vibration, and push alert test firing now!', true);
        // Also trigger server-side Web Push (this goes to notification bar)
        try {
          const res = await fetch('./api/test-alert', { method: 'POST' });
          const data = await res.json();
          console.log('📤 Test alert triggered, push subscribers:', data.push_subscribers);
        } catch (e) {
          console.warn('Test alert fetch failed:', e);
        }
      });
    }
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    document.querySelectorAll('.nav-btn, .mob-nav-item').forEach(b => {
      if (b.getAttribute('data-tab') === tabId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    document.querySelectorAll('.tab-panel').forEach(panel => {
      if (panel.id === `tab-${tabId}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    if (tabId === 'schedule') {
      this.scheduleManager.renderScheduleList('schedule-list-container');
      this.setupDayFilters();
    } else if (tabId === 'map') {
      this.mapManager.render();
    } else if (tabId === 'dashboard') {
      this.renderDashboard();
    }
  }

  onScheduleDataUpdated() {
    this.renderDashboard();
    if (this.currentTab === 'schedule') {
      this.scheduleManager.renderScheduleList('schedule-list-container');
    }
  }

  startLiveSyncLoop() {
    setInterval(async () => {
      try {
        const res = await fetch('./api/version');
        if (res.ok) {
          const { version, testAlert } = await res.json();

          if (testAlert) {
            this.notifications.sendAlert('🚨 LIVE TEST NOTIFICATION', testAlert, true);
          }

          if (this.lastKnownVersion !== null && this.lastKnownVersion !== version) {
            console.log('🔄 Data updated!');
            await this.scheduleManager.fetchServerData();
            this.notifications.showToast('⚡ Live Sync', 'Uni Timetable updated!');
          }
          this.lastKnownVersion = version;
        }
      } catch (e) {
        // Silent catch
      }
    }, 1500);
  }

  navigateToMapLocation(building, room) {
    this.switchTab('map');
    this.mapManager.highlightLocation(building, room);
  }

  setupDayFilters() {
    const daysContainer = document.getElementById('day-filter-bar');
    if (!daysContainer) return;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    daysContainer.innerHTML = days.map(d => `
      <button class="nav-btn ${d.toLowerCase() === this.scheduleManager.selectedDay.toLowerCase() ? 'active' : ''}" data-day="${d}">
        ${d}
      </button>
    `).join('');

    daysContainer.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        this.scheduleManager.selectedDay = btn.getAttribute('data-day');
        this.setupDayFilters();
        this.scheduleManager.renderScheduleList('schedule-list-container');
      });
    });
  }

  renderDashboard() {
    const nextClass = this.scheduleManager.getNextClass();
    const heroContainer = document.getElementById('hero-next-lecture-card');
    
    if (heroContainer) {
      if (!nextClass) {
        heroContainer.innerHTML = `
          <div style="text-align: center; padding: 1.5rem;">
            <h3>🎉 No More Classes Today</h3>
            <p style="color: var(--text-muted); margin-top: 0.3rem;">All lectures finished or holiday scheduled.</p>
          </div>
        `;
      } else {
        heroContainer.innerHTML = `
          <div class="glass-card-header">
            <div class="card-title-group">
              <div class="card-icon" style="background: rgba(6,182,212,0.15); color: var(--accent-cyan);">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <h3 style="font-size: 1.05rem;">Next Upcoming Batch A Lecture</h3>
                <p class="brand-subtitle">Real-time alert countdown & classroom</p>
              </div>
            </div>
            <span class="live-badge">
              <span class="live-dot"></span> ${nextClass.isLiveNow ? 'CLASS IN PROGRESS' : 'NEXT UP'}
            </span>
          </div>

          <div style="display: flex; align-items: baseline; gap: 0.6rem; flex-wrap: wrap;">
            <h2 style="font-size: 1.4rem; color: white;">${nextClass.subject}</h2>
            <span style="background: rgba(99, 102, 241, 0.2); color: #A5B4FC; padding: 0.15rem 0.5rem; border-radius: 6px; font-weight: 700; font-size: 0.8rem;">
              ${nextClass.code}
            </span>
          </div>

          <div class="timer-box">
            <div>
              <div class="timer-label">Time Remaining</div>
              <div class="timer-display" id="dash-countdown-timer">00:00:00</div>
            </div>
            <button id="dash-locate-btn" class="btn-primary">
              📍 Locate Classroom
            </button>
          </div>

          <div class="lecture-meta-row">
            <div class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div>
                <div class="meta-label">Slot Time</div>
                <div class="meta-value">${nextClass.startTime} - ${nextClass.endTime}</div>
              </div>
            </div>

            <div class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <div>
                <div class="meta-label">Location</div>
                <div class="meta-value">${nextClass.building} &bull; Room ${nextClass.room}</div>
              </div>
            </div>

            <div class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <div>
                <div class="meta-label">Faculty</div>
                <div class="meta-value">${nextClass.professor}</div>
              </div>
            </div>
          </div>
        `;

        document.getElementById('dash-locate-btn')?.addEventListener('click', () => {
          this.navigateToMapLocation(nextClass.building, nextClass.room);
        });
      }
    }

    this.scheduleManager.renderScheduleList('dash-today-schedule-container');
  }

  startCountdownLoop() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    let lastAlertedId = null;

    const updateTimer = () => {
      const nextClass = this.scheduleManager.getNextClass();
      const timerEl = document.getElementById('dash-countdown-timer');
      if (!nextClass || !timerEl) return;

      const now = new Date();
      const [h, m] = nextClass.startTime.split(':').map(Number);
      
      const targetTime = new Date();
      targetTime.setHours(h, m, 0, 0);

      if (now > targetTime && !nextClass.isLiveNow) {
        timerEl.innerText = "00:00:00";
        return;
      }

      const diffMs = targetTime - now;
      if (diffMs <= 0) {
        timerEl.innerText = "CLASS STARTED!";
        if (lastAlertedId !== nextClass.id) {
          lastAlertedId = nextClass.id;
          this.notifications.sendAlert(
            `🚨 LECTURE STARTING NOW!`,
            `${nextClass.subject} is starting in ${nextClass.building} (Room ${nextClass.room})`,
            true
          );
          // Also send server push for notification bar
          this.triggerServerPush(
            `🚨 LECTURE STARTING NOW!`,
            `${nextClass.subject} is starting in ${nextClass.building} (Room ${nextClass.room})`
          );
        }
        return;
      }

      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins === 5 && lastAlertedId !== nextClass.id + '-5m') {
        lastAlertedId = nextClass.id + '-5m';
        this.notifications.sendAlert(
          `⏱️ 5 Minutes Warning!`,
          `Upcoming: ${nextClass.subject} in ${nextClass.building} Room ${nextClass.room}`,
          false
        );
        // Also send server push for notification bar
        this.triggerServerPush(
          `⏱️ 5 Minutes Warning!`,
          `Upcoming: ${nextClass.subject} in ${nextClass.building} Room ${nextClass.room}`
        );
      }

      const hours = Math.floor(diffMs / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);

      timerEl.innerText = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    updateTimer();
    this.timerInterval = setInterval(updateTimer, 1000);
  }

  async triggerServerPush(title, body) {
    try {
      await fetch('/api/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body })
      });
    } catch (e) {
      console.warn('Server push trigger failed:', e);
    }
  }

  setupModal() {
    const backdrop = document.getElementById('modal-backdrop');
    const openBtn = document.getElementById('open-add-modal-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const form = document.getElementById('add-lecture-form');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        backdrop.classList.add('active');
        this.populateBuildingOptions();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => backdrop.classList.remove('active'));
    }

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.classList.remove('active');
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newLec = {
          subject: document.getElementById('form-subject').value,
          code: document.getElementById('form-code').value || 'CSE',
          professor: document.getElementById('form-prof').value || 'Faculty Member',
          day: document.getElementById('form-day').value,
          startTime: document.getElementById('form-start').value,
          endTime: document.getElementById('form-end').value,
          building: document.getElementById('form-building').value,
          room: document.getElementById('form-room').value,
          color: '#6366F1',
          status: 'upcoming'
        };

        this.scheduleManager.addLecture(newLec);
        backdrop.classList.remove('active');
        form.reset();
        this.renderDashboard();
        this.scheduleManager.renderScheduleList('schedule-list-container');
        this.notifications.sendAlert('✅ Lecture Added', `${newLec.subject} scheduled for ${newLec.day} at ${newLec.startTime}`);
      });
    }
  }

  populateBuildingOptions() {
    const select = document.getElementById('form-building');
    if (select) {
      select.innerHTML = Object.keys(BUILDINGS_DATA).map(b => `<option value="${b}">${b}</option>`).join('');
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new EduPulseApp();
});
