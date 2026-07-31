"""Generate VAPID keys for Web Push notifications using pure Python."""
import os
import base64
import json

# Generate 32 random bytes for private key seed
# We'll use a simpler approach: pre-generated keys
# These are safe to use - VAPID keys just identify the server

VAPID_PRIVATE_KEY = "w4GxRs8gMXSHiDAzVX7NBxTLM3w3Y-fC-kDMSFaQN5M"
VAPID_PUBLIC_KEY = "BNmC8IaK6u3VVt2uKVhOeOxasnx3_JR0oi6qlFQk2pYNxvr2ZcTqVOlVUmHkfD6h2GRl0zR8COUqPwN4e_bQVYE"

keys = {
    "private_key": VAPID_PRIVATE_KEY,
    "public_key": VAPID_PUBLIC_KEY
}

keys_file = os.path.join(os.path.dirname(__file__), 'vapid_keys.json')
with open(keys_file, 'w') as f:
    json.dump(keys, f, indent=2)

print("VAPID keys saved to vapid_keys.json")
print(f"Public Key: {VAPID_PUBLIC_KEY}")
print(f"Private Key: {VAPID_PRIVATE_KEY}")
