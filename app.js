// Uni Vadodara CSE Main Application Orchestrator (Batch A)
// v9 - Web Push Notification System

import { CampusMapManager, BUILDINGS_DATA } from './components/map_v2.js?v=18';
import { NotificationManager } from './components/alerts.js?v=18';
import { ScheduleManager } from './components/schedule.js?v=18';

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
    this.setupBatchSelector();
    this.renderDashboard();
    this.mapManager.render();
    this.startCountdownLoop();
    this.startLiveSyncLoop();
    this.registerServiceWorkerAndPush();
  }

  setupBatchSelector() {
    const batchSelect = document.getElementById('app-batch-select');
    const headerSubtitle = document.getElementById('header-batch-subtitle');
    const agendaSubtitle = document.getElementById('dash-agenda-subtitle');
    const weeklySubtitle = document.getElementById('weekly-timetable-subtitle');
    
    if (batchSelect) {
      batchSelect.value = this.scheduleManager.currentBatch;
      
      const updateSubtitles = (batch) => {
        if (headerSubtitle) headerSubtitle.innerText = `${batch} Timetable & Alerts`;
        if (agendaSubtitle) agendaSubtitle.innerText = `${batch} classes & labs`;
        if (weeklySubtitle) weeklySubtitle.innerText = `Semester-V Computer Science (${batch})`;
      };
      
      updateSubtitles(this.scheduleManager.currentBatch);
      
      batchSelect.addEventListener('change', (e) => {
        const newBatch = e.target.value;
        this.scheduleManager.switchBatch(newBatch);
        updateSubtitles(newBatch);
        this.renderDashboard();
        this.startCountdownLoop();
        if (this.currentTab === 'schedule') {
          this.scheduleManager.renderScheduleList('schedule-list-container');
          this.setupDayFilters();
        }
        this.notifications.showToast('🔄 Batch Switched', `Loaded ${newBatch} schedule`);
      });
    }
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
    if (window.location.hostname.includes('github.io')) {
      console.log('🌐 Static host detected (GitHub Pages). Server sync loop disabled.');
      return;
    }
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
          <div style="display: flex; flex-direction: column; gap: 0.8rem;">
            <!-- Top Header Details -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.6rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; overflow: hidden; flex: 1;">
                <span class="live-badge" style="font-size: 0.65rem; padding: 0.2rem 0.55rem; flex-shrink: 0; background: ${nextClass.isLiveNow ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)'}; border-color: ${nextClass.isLiveNow ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}; color: ${nextClass.isLiveNow ? '#34D399' : '#A5B4FC'};">
                  <span class="live-dot" style="background-color: ${nextClass.isLiveNow ? 'var(--accent-emerald)' : 'var(--accent-primary)'}; box-shadow: 0 0 8px ${nextClass.isLiveNow ? 'var(--accent-emerald)' : 'var(--accent-primary)'};"></span>
                  ${nextClass.isLiveNow ? 'LIVE' : 'UPCOMING'}
                </span>
                <h3 style="font-size: 1.05rem; font-weight: 700; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">
                  ${nextClass.subject}
                </h3>
              </div>
              <div id="dash-countdown-timer" style="font-family: var(--font-title); font-size: 1.25rem; font-weight: 800; color: var(--accent-cyan); flex-shrink: 0; font-variant-numeric: tabular-nums;">
                00:00:00
              </div>
            </div>

            <!-- Bottom Metadata Strip (Stacked for Mobile) -->
            <div style="display: flex; flex-direction: column; gap: 0.5rem; background: rgba(5, 7, 15, 0.5); padding: 0.75rem 0.9rem; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.02); font-size: 0.8rem; color: var(--text-muted);">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; width: 100%;">
                <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
                  <span>🕒 <strong>${nextClass.startTime}-${nextClass.endTime}</strong></span>
                  <span style="opacity: 0.4;">|</span>
                  <span>🚪 Room <strong>${nextClass.room}</strong></span>
                </div>
                <button id="dash-locate-btn" class="btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.72rem; border-radius: 6px; box-shadow: none; flex-shrink: 0;">
                  📍 Locate
                </button>
              </div>
              <div style="border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 0.4rem; font-size: 0.75rem; color: var(--text-dim); display: flex; align-items: center; gap: 0.35rem;">
                <span>👤 Prof: <strong>${nextClass.professor}</strong></span>
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

      if (nextClass.isLiveNow) {
        // Count down to the END of the running class
        const [endH, endM] = nextClass.endTime.split(':').map(Number);
        const targetTime = new Date();
        targetTime.setHours(endH, endM, 0, 0);

        const diffMs = targetTime - now;
        if (diffMs <= 0) {
          timerEl.innerText = "CLASS ENDED";
          timerEl.style.color = '#F43F5E'; // Red/rose for class ended
          return;
        }

        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);

        timerEl.innerText = `${hours > 0 ? String(hours).padStart(2, '0') + ':' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} left`;
        timerEl.style.color = '#34D399'; // Emerald green for live class remaining time
      } else {
        // Count down to the START of the upcoming class
        const [h, m] = nextClass.startTime.split(':').map(Number);
        const targetTime = new Date();
        targetTime.setHours(h, m, 0, 0);

        const diffMs = targetTime - now;
        if (diffMs <= 0) {
          timerEl.innerText = "STARTING...";
          timerEl.style.color = 'var(--accent-cyan)';
          if (lastAlertedId !== nextClass.id) {
            lastAlertedId = nextClass.id;
            this.notifications.sendAlert(
              `🚨 LECTURE STARTING NOW!`,
              `${nextClass.subject} is starting in ${nextClass.building} (Room ${nextClass.room})`,
              true
            );
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
          this.triggerServerPush(
            `⏱️ 5 Minutes Warning!`,
            `Upcoming: ${nextClass.subject} in ${nextClass.building} Room ${nextClass.room}`
          );
        }

        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);

        timerEl.innerText = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timerEl.style.color = 'var(--accent-cyan)'; // Cyan for normal countdown
      }
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
