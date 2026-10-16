import sys
import socket
import uvicorn
from app.core.config import settings

def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex((host, port)) == 0

def main():
    host = settings.ADMIN_HOST
    port = settings.ADMIN_PORT

    print("==================================================================")
    print("  TRUTHPRENUER — LOCAL PRIVILEGED ADMIN API SERVICE")
    print("==================================================================")
    print(f"Target Host      : {host} (STRICT LOOPBACK ONLY)")
    print(f"Target Port      : {port}")
    print(f"Allowed UI Origin: {settings.ADMIN_UI_ORIGIN}")
    print("Zero-Trust Edge  : STRICT HOST & IP BOUNDARY")
    print("------------------------------------------------------------------")

    if is_port_in_use(port, host):
        print(f"FATAL: Port {port} on {host} is already in use by another process!")
        print("Failing fast to prevent port collision or fallback.")
        sys.exit(1)

    print(f"Starting server on http://{host}:{port}...")
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=False,
        log_level="info",
        access_log=True
    )

if __name__ == "__main__":
    main()
