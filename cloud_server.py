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

def get_schedule_file(batch_name):
    # Normalize name to a safe filename
    safe_name = "".join(c for c in batch_name if c.isalnum()).lower()
    if not safe_name:
        safe_name = "batcha"
    return os.path.join(DATA_DIR, f'schedule_{safe_name}.json')

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
    batch = request.args.get('batch', 'Batch A')
    schedule_file = get_schedule_file(batch)
    
    if request.method == 'POST':
        try:
            data = request.get_json()
            with open(schedule_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            LAST_UPDATE_TIME = time.time()
            return jsonify({'status': 'success', 'version': LAST_UPDATE_TIME})
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500
    else:
        if os.path.exists(schedule_file):
            with open(schedule_file, 'r', encoding='utf-8') as f:
                return jsonify(json.load(f))
        elif batch == 'Batch A' and os.path.exists(SCHEDULE_FILE):
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

def schedule_monitor_thread():
    import datetime
    # Keep track of what we alerted to avoid duplicates
    alerted_keys = set() 
    
    print("⏰ Background scheduler started...")
    while True:
        try:
            time.sleep(30)
            
            # Loop through all active batches
            batches = ['Batch A', 'Batch B', 'Batch C']
            for batch_name in batches:
                schedule_file = get_schedule_file(batch_name)
                # Fallback for Batch A if batch-specific file is missing
                if batch_name == 'Batch A' and not os.path.exists(schedule_file):
                    schedule_file = SCHEDULE_FILE
                    
                if not os.path.exists(schedule_file):
                    continue
                    
                with open(schedule_file, 'r', encoding='utf-8') as f:
                    schedule = json.load(f)
                    
                if not isinstance(schedule, list):
                    continue
                    
                # Get current day and time in IST (UTC+5:30)
                utc_now = datetime.datetime.utcnow()
                ist_now = utc_now + datetime.timedelta(hours=5, minutes=30)
                current_day = ist_now.strftime('%A')
                current_time_minutes = ist_now.hour * 60 + ist_now.minute
                
                # Filter schedule for today
                today_classes = [c for c in schedule if c.get('day', '').lower() == current_day.lower()]
                
                for c in today_classes:
                    start_time_str = c.get('startTime', '')
                    if not start_time_str:
                        continue
                    try:
                        sh, sm = map(int, start_time_str.split(':'))
                        start_minutes = sh * 60 + sm
                        
                        # 1. Check for 5-minute warning
                        five_min_warning_minutes = start_minutes - 5
                        if current_time_minutes == five_min_warning_minutes:
                            alert_key = f"{batch_name}-{c.get('id')}-5m-{ist_now.strftime('%Y-%m-%d')}"
                            if alert_key not in alerted_keys:
                                alerted_keys.add(alert_key)
                                title = f"⏱️ {batch_name} - 5 Minutes Warning!"
                                body = f"Upcoming: {c.get('subject')} in {c.get('building')} Room {c.get('room')}"
                                print(f"⏰ Auto-firing alert: {title} - {body}")
                                send_onesignal_push(title, body)
                                
                        # 2. Check for start warning
                        if current_time_minutes == start_minutes:
                            alert_key = f"{batch_name}-{c.get('id')}-start-{ist_now.strftime('%Y-%m-%d')}"
                            if alert_key not in alerted_keys:
                                alerted_keys.add(alert_key)
                                title = f"🚨 {batch_name} LECTURE STARTING NOW!"
                                body = f"{c.get('subject')} is starting in {c.get('building')} (Room {c.get('room')})"
                                print(f"⏰ Auto-firing alert: {title} - {body}")
                                send_onesignal_push(title, body)
                    except Exception as ex:
                        print("Error checking class:", ex)
                        
            # Clean up old alerts to prevent memory leak
            if len(alerted_keys) > 150:
                alerted_keys.clear()
                
        except Exception as e:
            print("Error in scheduler thread:", e)

# Start scheduler thread
import threading
threading.Thread(target=schedule_monitor_thread, daemon=True).start()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))

