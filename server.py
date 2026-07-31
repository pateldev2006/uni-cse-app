import http.server
import socketserver
import socket
import sys
import json
import os
import time
import threading

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

PORTS_TO_TRY = [8080, 8000, 5000, 8888]
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
SCHEDULE_FILE = os.path.join(DATA_DIR, 'schedule.json')
VAPID_FILE = os.path.join(os.path.dirname(__file__), 'vapid_keys.json')

LAST_UPDATE_TIME = time.time()
TEST_ALERT_MESSAGE = None

# Store push subscriptions in memory (persisted to file)
PUSH_SUBSCRIPTIONS = []
SUBS_FILE = os.path.join(DATA_DIR, 'push_subscriptions.json')

# Load VAPID keys
VAPID_KEYS = {}
if os.path.exists(VAPID_FILE):
    with open(VAPID_FILE, 'r') as f:
        VAPID_KEYS = json.load(f)
    print(f"✅ VAPID keys loaded. Public key: {VAPID_KEYS.get('public_key', 'N/A')[:20]}...")

# Load saved subscriptions
def load_subscriptions():
    global PUSH_SUBSCRIPTIONS
    if os.path.exists(SUBS_FILE):
        try:
            with open(SUBS_FILE, 'r') as f:
                PUSH_SUBSCRIPTIONS = json.load(f)
            print(f"📱 Loaded {len(PUSH_SUBSCRIPTIONS)} push subscription(s)")
        except Exception:
            PUSH_SUBSCRIPTIONS = []

def save_subscriptions():
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(SUBS_FILE, 'w') as f:
        json.dump(PUSH_SUBSCRIPTIONS, f, indent=2)

load_subscriptions()

def send_push_to_all(title, body):
    """Send notifications to Web Push subscribers AND native Median app via OneSignal REST API."""
    import urllib.request
    
    # 1. Send via OneSignal to native Android app
    onesignal_app_id = "84c65846-6a2e-4bc2-86db-a0881890aa3f"
    onesignal_rest_key = "os_v2_app_qtdfqrtkfzf4fbw3ucebrefkh6v3at2bcppuzveqvu2fg535bxdijwkj4qmz24lv46nfogfrhu25zrrs6rvvljolmyglwn3src7a4oq"
    
    onesignal_payload = {
        "app_id": onesignal_app_id,
        "included_segments": ["Subscribed Users", "Total Subscriptions", "All"],
        "headings": {"en": title},
        "contents": {"en": body},
        "android_accent_color": "FF6366F1",
        "android_led_color": "FF6366F1",
        "priority": 10
    }
    
    try:
        req = urllib.request.Request(
            "https://onesignal.com/api/v1/notifications",
            data=json.dumps(onesignal_payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": f"Basic {onesignal_rest_key}"
            },
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            print("🚀 OneSignal REST API response:", res_data)
    except Exception as e:
        print("❌ OneSignal API send failed:", e)

    # 2. Send via browser Web Push (PWA fallback)
    if not PUSH_SUBSCRIPTIONS:
        return 1

    private_key_path = os.path.join(os.path.dirname(__file__), "private_key.pem")
    if not os.path.exists(private_key_path):
        return 1

    try:
        from pywebpush import webpush, WebPushException
    except ImportError:
        return 1

    payload = json.dumps({
        "title": title,
        "body": body,
        "icon": "/icon-192.png",
        "badge": "/icon-192.png",
        "vibrate": [400, 150, 400, 150, 600],
        "tag": f"kpgu-push-{int(time.time())}",
        "renotify": True,
        "requireInteraction": True
    })

    sent = 0
    failed_indices = []

    for i, sub in enumerate(PUSH_SUBSCRIPTIONS):
        try:
            webpush(
                subscription_info=sub,
                data=payload,
                vapid_private_key=private_key_path,
                vapid_claims={"sub": "mailto:kpgu-edupulse@example.com"}
            )
            sent += 1
            print(f"  ✅ Web Push sent to subscription #{i+1}")
        except WebPushException as e:
            print(f"  ❌ Web Push failed: {e}")
            if '410' in str(e) or '404' in str(e):
                failed_indices.append(i)
        except Exception as e:
            print(f"  ❌ Web Push error: {e}")

    if failed_indices:
        for idx in reversed(failed_indices):
            PUSH_SUBSCRIPTIONS.pop(idx)
        save_subscriptions()

    return sent



def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


class SyncHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        global LAST_UPDATE_TIME, TEST_ALERT_MESSAGE

        clean_path = self.path.split('?')[0]

        if clean_path == '/api/schedule':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            if os.path.exists(SCHEDULE_FILE):
                with open(SCHEDULE_FILE, 'r', encoding='utf-8') as f:
                    self.wfile.write(f.read().encode('utf-8'))
            else:
                self.wfile.write(b'[]')
            return

        if clean_path == '/api/version':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            resp = {'version': LAST_UPDATE_TIME, 'testAlert': TEST_ALERT_MESSAGE}
            TEST_ALERT_MESSAGE = None
            self.wfile.write(json.dumps(resp).encode('utf-8'))
            return

        if clean_path == '/api/vapid-public-key':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'publicKey': VAPID_KEYS.get('public_key', '')
            }).encode('utf-8'))
            return

        if clean_path == '/api/push-status':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'subscriptions': len(PUSH_SUBSCRIPTIONS),
                'vapidConfigured': bool(VAPID_KEYS.get('public_key'))
            }).encode('utf-8'))
            return

        super().do_GET()

    def do_POST(self):
        global LAST_UPDATE_TIME, TEST_ALERT_MESSAGE

        post_data = b''
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            post_data = self.rfile.read(content_length)

        if self.path == '/api/push-subscribe':
            try:
                sub_info = json.loads(post_data.decode('utf-8'))
                # Check if already registered (by endpoint)
                existing = [s for s in PUSH_SUBSCRIPTIONS if s.get('endpoint') == sub_info.get('endpoint')]
                if not existing:
                    PUSH_SUBSCRIPTIONS.append(sub_info)
                    save_subscriptions()
                    print(f"📱 New push subscription registered! Total: {len(PUSH_SUBSCRIPTIONS)}")
                else:
                    print(f"📱 Subscription already registered. Total: {len(PUSH_SUBSCRIPTIONS)}")

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'status': 'success',
                    'total_subscriptions': len(PUSH_SUBSCRIPTIONS)
                }).encode('utf-8'))
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
            return

        if self.path == '/api/test-alert':
            title = "🚨 Uni Lecture Alert"
            body = "TEST: DAA-A Lab starting in Room F001/A1!"
            TEST_ALERT_MESSAGE = f"{title} - {body}"
            LAST_UPDATE_TIME = time.time()

            # Send Web Push in background thread
            def do_push():
                sent = send_push_to_all(title, body)
                print(f"📤 Test alert push sent to {sent} device(s)")
            threading.Thread(target=do_push, daemon=True).start()

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'status': 'success',
                'message': TEST_ALERT_MESSAGE,
                'push_subscribers': len(PUSH_SUBSCRIPTIONS)
            }).encode('utf-8'))
            return

        if self.path == '/api/send-push':
            try:
                data = json.loads(post_data.decode('utf-8'))
                title = data.get('title', '🚨 Uni Alert')
                body = data.get('body', 'Lecture alert!')

                def do_push():
                    sent = send_push_to_all(title, body)
                    print(f"📤 Custom push sent to {sent} device(s)")
                threading.Thread(target=do_push, daemon=True).start()

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'status': 'success',
                    'push_subscribers': len(PUSH_SUBSCRIPTIONS)
                }).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
            return

        if self.path == '/api/schedule':
            try:
                parsed = json.loads(post_data.decode('utf-8'))
                os.makedirs(DATA_DIR, exist_ok=True)
                with open(SCHEDULE_FILE, 'w', encoding='utf-8') as f:
                    json.dump(parsed, f, indent=2)
                LAST_UPDATE_TIME = time.time()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success', 'version': LAST_UPDATE_TIME}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()


Handler = SyncHTTPRequestHandler
Handler.extensions_map.update({
    '.json': 'application/json',
    '.webmanifest': 'application/manifest+json',
    '.js': 'application/javascript',
    '.css': 'text/css',
})

socketserver.TCPServer.allow_reuse_address = True
local_ip = get_local_ip()

httpd = None
selected_port = None

for port in PORTS_TO_TRY:
    try:
        httpd = socketserver.TCPServer(("0.0.0.0", port), Handler)
        selected_port = port
        break
    except Exception:
        continue

if httpd and selected_port:
    print("=" * 60)
    print("🚀 Uni EduPulse Server with Web Push Notifications!")
    print(f"📱 Phone Access URL: http://{local_ip}:{selected_port}")
    print(f"💻 Local Access URL: http://localhost:{selected_port}")
    print(f"🔔 Push Subscriptions: {len(PUSH_SUBSCRIPTIONS)}")
    print(f"🔑 VAPID Public Key: {VAPID_KEYS.get('public_key', 'N/A')[:30]}...")
    print("=" * 60)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
