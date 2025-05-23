from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class CustomHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Map paths to HTML files
        path_mappings = {
            '/': 'main.html',
            '/main': 'main.html',
            '/lang': 'lang.html',
            '/color': 'color.html',
            '/replacer': 'replacer.html',
            '/media': 'media.html'
        }
        
        # Get the file path
        if self.path in path_mappings:
            self.path = path_mappings[self.path]
        elif '.' not in self.path:  # If no file extension, default to main
            self.path = 'main.html'
            
        return SimpleHTTPRequestHandler.do_GET(self)

# Run server
port = 8000
print(f"Server running at http://localhost:{port}")
HTTPServer(('', port), CustomHandler).serve_forever() 