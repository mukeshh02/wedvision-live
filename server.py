"""Serve the local copy with clean routes and correct JavaScript MIME types."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, unquote, parse_qs
import argparse
import re

ROOT=Path(__file__).resolve().parent/'public'
class Handler(SimpleHTTPRequestHandler):
    extensions_map={**SimpleHTTPRequestHandler.extensions_map,'.mjs':'application/javascript','.woff2':'font/woff2','.webp':'image/webp','.svg':'image/svg+xml'}
    def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(ROOT),**kwargs)
    def do_GET(self):
        path=unquote(urlsplit(self.path).path)
        candidate=ROOT/path.lstrip('/')
        query=parse_qs(urlsplit(self.path).query)
        byte_range=self.headers.get('Range') or ('bytes='+query['range'][0] if 'range' in query else '')
        if candidate.is_file() and byte_range:
            match=re.fullmatch(r'bytes=(\d+)-(\d*)',byte_range)
            if match:
                size=candidate.stat().st_size
                start=int(match[1]); end=min(int(match[2]) if match[2] else size-1,size-1)
                if start>=size:
                    self.send_response(416);self.send_header('Content-Range',f'bytes */{size}');self.end_headers();return
                self.send_response(206 if 'Range' in self.headers else 200)
                self.send_header('Content-Type',self.guess_type(str(candidate)))
                self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
                self.send_header('Content-Length',str(end-start+1))
                self.send_header('Accept-Ranges','bytes')
                self.end_headers()
                with candidate.open('rb') as stream:
                    stream.seek(start);self.wfile.write(stream.read(end-start+1))
                return
        if path!='/' and candidate.is_dir() and (candidate/'index.html').exists():
            self.path=path.rstrip('/')+'/index.html'
        super().do_GET()

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--port',type=int,default=3000)
    args=parser.parse_args()
    print(f'WedVision local: http://localhost:{args.port}',flush=True)
    ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
