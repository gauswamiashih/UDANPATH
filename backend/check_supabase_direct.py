import httpx

url = "https://hrvaxxyvwwpnoajiixey.supabase.co/rest/v1/exams"
# Service Role key from .env:
service_role_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydmF4eHl2d3dwbm9hamlpeGV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDc2NDgyNiwiZXhwIjoyMTAwMzQwODI2fQ.lY6vBzHUpJv_F2qGGoHaTtaY7w_qy0bbSiVrS7G"

headers = {
    "apikey": service_role_key,
    "Authorization": f"Bearer {service_role_key}"
}

try:
    print("Testing direct connection to Supabase REST API with Service Role Key...")
    res = httpx.get(url, headers=headers, timeout=5.0)
    print("Status code:", res.status_code)
    print("Response text:", res.text)
except Exception as e:
    print("Connection failed:", e)
