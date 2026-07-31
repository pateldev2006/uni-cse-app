import subprocess
import time
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("Starting EduPulse Tunnel Keeper...")

cmd = [
    "ssh",
    "-o", "ServerAliveInterval=10",
    "-o", "ServerAliveCountMax=3",
    "-o", "StrictHostKeyChecking=no",
    "-R", "80:127.0.0.1:8080",
    "nokey@localhost.run"
]

while True:
    try:
        print("Connecting SSH Tunnel to localhost.run...")
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding='utf-8', errors='replace')
        
        for line in proc.stdout:
            print(line, end='')
            if 'lhr.life' in line or 'localhost.run' in line:
                sys.stdout.flush()

        proc.wait()
        print("Tunnel connection closed. Reconnecting in 3 seconds...")
        time.sleep(3)
    except Exception as e:
        print(f"Tunnel error: {e}. Retrying in 5s...")
        time.sleep(5)
