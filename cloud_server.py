import os
import json
import time
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='.')
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)
SCHEDULE_FILE = os.path.join(DATA_DIR, 'schedule.json')
SUBS_FILE = os.path.join(DATA_DIR, 'push_subscriptions.json')

LAST_UPDATE_TIME = time.time()
TEST_ALERT_MESSAGE = None
PUSH_SUBSCRIPTIONS = []

# Load saved subscriptions
if os.path.exists(SUBS_FILE):
    try:
        with open(SUBS_FILE, 'r') as f:
            PUSH_SUBSCRIPTIONS = json.load(f)
    except Exception:
        PUSH_SUBSCRIPTIONS = []

def save_subscriptions():
    with open(SUBS_FILE, 'w') as f:
        json.dump(PUSH_SUBSCRIPTIONS, f, indent=2)

def send_onesignal_push(title, body):
    """Trigger OneSignal REST API to deliver notifications to native Android app."""
    import urllib.request
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
            print("🚀 OneSignal Cloud API response:", res_data)
            return res_data
    except Exception as e:
        print("❌ OneSignal Cloud API failed:", e)
        return str(e)

# Serve Web App Frontend
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# APIs
@app.route('/api/schedule', methods=['GET', 'POST'])
def api_schedule():
    global LAST_UPDATE_TIME
    if request.method == 'POST':
        try:
            data = request.get_json()
            with open(SCHEDULE_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            LAST_UPDATE_TIME = time.time()
            return jsonify({'status': 'success', 'version': LAST_UPDATE_TIME})
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500
    else:
        if os.path.exists(SCHEDULE_FILE):
            with open(SCHEDULE_FILE, 'r', encoding='utf-8') as f:
                return jsonify(json.load(f))
        return jsonify([])

@app.route('/api/version', methods=['GET'])
def api_version():
    global TEST_ALERT_MESSAGE
    resp = {'version': LAST_UPDATE_TIME, 'testAlert': TEST_ALERT_MESSAGE}
    TEST_ALERT_MESSAGE = None
    return jsonify(resp)

@app.route('/api/test-alert', methods=['POST'])
def api_test_alert():
    global LAST_UPDATE_TIME, TEST_ALERT_MESSAGE
    title = "🚨 Uni Lecture Alert"
    body = "TEST: DAA-A Lab starting in Room F001/A1!"
    TEST_ALERT_MESSAGE = f"{title} - {body}"
    LAST_UPDATE_TIME = time.time()
    
    # Send push via OneSignal
    send_onesignal_push(title, body)
    
    return jsonify({
        'status': 'success',
        'message': TEST_ALERT_MESSAGE
    })

@app.route('/api/send-push', methods=['POST'])
def api_send_push():
    try:
        data = request.get_json() or {}
        title = data.get('title', '🚨 Uni Alert')
        body = data.get('body', 'Lecture starting soon!')
        send_onesignal_push(title, body)
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
