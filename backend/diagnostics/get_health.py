import httpx
try:
    res = httpx.get("http://127.0.0.1:8000/api/v1/health", timeout=12.0)
    print(res.status_code)
    print(res.text)
except Exception as e:
    print(e)
