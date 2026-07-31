// Mobile Phone Installation & Local Network QR Code Component

export class MobileInstallManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render() {
    if (!this.container) return;

    const currentHost = window.location.href;

    this.container.innerHTML = `
      <div class="glass-card">
        <div class="glass-card-header">
          <div class="card-title-group">
            <div class="card-icon" style="background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan);">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            </div>
            <div>
              <h3 style="font-size: 1.1rem;">Install App on Phone</h3>
              <p class="brand-subtitle">Run as native phone app</p>
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="background: rgba(255,255,255,0.03); padding: 0.85rem; border-radius: var(--radius-md); border-left: 3px solid #3B82F6;">
            <strong style="color: white; font-size: 0.88rem; display: block;">📱 Android (Google Chrome)</strong>
            <ol style="margin-left: 1.2rem; font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; line-height: 1.5;">
              <li>Open <strong>http://192.168.29.206:8080</strong> in Chrome.</li>
              <li>Tap the <strong>3-dots menu (⋮)</strong> top right.</li>
              <li>Tap <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.</li>
            </ol>
          </div>

          <div style="background: rgba(255,255,255,0.03); padding: 0.85rem; border-radius: var(--radius-md); border-left: 3px solid #EC4899;">
            <strong style="color: white; font-size: 0.88rem; display: block;">🍎 iPhone / iPad (Apple Safari)</strong>
            <ol style="margin-left: 1.2rem; font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; line-height: 1.5;">
              <li>Open <strong>http://192.168.29.206:8080</strong> in Safari.</li>
              <li>Tap the <strong>Share button</strong> at the bottom.</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
            </ol>
          </div>

          <button id="pwa-install-banner-btn" class="btn-primary" style="margin-top: 0.5rem; width: 100%;">
            ⚡ Tap to Install App Directly
          </button>
        </div>
      </div>
    `;

    this.attachInstallPrompt();
  }

  attachInstallPrompt() {
    const btn = this.container.querySelector('#pwa-install-banner-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (window.deferredPwaPrompt) {
          window.deferredPwaPrompt.prompt();
          window.deferredPwaPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted PWA prompt');
            }
            window.deferredPwaPrompt = null;
          });
        } else {
          alert('To install on your phone:\n1. Open http://192.168.29.206:8080 on your phone\n2. Tap "Add to Home Screen" in your browser menu!');
        }
      });
    }
  }
}
