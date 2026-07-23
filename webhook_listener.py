import http.server
import socketserver
import json

class WebhookHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('content-length', 0))
        data = self.rfile.read(length)
        print("=== RECEIVED CHATWOOT WEBHOOK ===")
        try:
            parsed = json.loads(data.decode('utf-8'))
            print(json.dumps(parsed, indent=2))
        except Exception as e:
            print("Error parsing:", e, data)
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"status":"ok"}')

if __name__ == '__main__':
    print("Listening on 0.0.0.0:9999...")
    with socketserver.TCPServer(('0.0.0.0', 9999), WebhookHandler) as httpd:
        httpd.handle_request()
