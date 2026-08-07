import time
import json
import httpx

BASE_URL = "http://127.0.0.1:8000"

def test_endpoints():
    print("=========================================================")
    print("     TESTING UDANPATH API GATEWAY LIVE ENDPOINTS         ")
    print("=========================================================\n")

    endpoints = [
        ("/api/v1/health", "GET"),
        ("/api/v1/config/public", "GET"),
        ("/api/v1/db/verify", "GET"),
        ("/api/v1/auth/verify", "GET"),
        ("/api/v1/storage/verify", "GET"),
        ("/api/v1/ai/verify", "GET"),
    ]

    with httpx.Client(timeout=10.0) as client:
        for path, method in endpoints:
            url = f"{BASE_URL}{path}"
            try:
                if method == "GET":
                    res = client.get(url)
                print(f"[{res.status_code}] {path}")
                print(f"     Response: {json.dumps(res.json(), indent=2)}\n")
            except Exception as e:
                print(f"[ERR] {path}: {e}\n")

        print("Testing Streaming AI Chat Endpoint (/api/v1/ai/chat)...")
        try:
            chat_url = f"{BASE_URL}/api/v1/ai/chat"
            payload = {"message": "What is the eligibility for UPSC CSE?", "context_exam": "UPSC_CSE"}
            with client.stream("POST", chat_url, json=payload) as response:
                print(f"[{response.status_code}] /api/v1/ai/chat stream started:")
                tokens_received = 0
                for line in response.iter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            print("\n     [Stream Completed Successfully!]")
                            break
                        try:
                            parsed = json.loads(data_str)
                            if "token" in parsed:
                                tokens_received += 1
                                print(parsed["token"], end="", flush=True)
                        except Exception:
                            pass
                print(f"\n     Total tokens received: {tokens_received}\n")
        except Exception as e:
            print(f"[ERR] /api/v1/ai/chat stream failed: {e}\n")

if __name__ == "__main__":
    time.sleep(1) # Ensure server startup
    test_endpoints()
