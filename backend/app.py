from flask import Flask, jsonify, request, send_file
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import threading
import time
import os
from datetime import datetime
import json
import tempfile

from core.database import Database
from core.scan_orchestrator import ScanOrchestrator
from core.realtime_broadcaster import RealTimeBroadcaster
from core.pdf_generator import PDFReportGenerator
from tools.integrations import ThirdPartyScannerIntegration

# Create Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'cybersage_v2_elite_secret_2024')

# Enable CORS
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Create SocketIO instance
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode='threading',
    logger=True,
    engineio_logger=True,
    ping_timeout=60,
    ping_interval=25,
    allow_upgrades=True,
    transports=['polling', 'websocket']
)

# Initialize components
db = Database()
broadcaster = RealTimeBroadcaster(socketio)
scan_orchestrator = ScanOrchestrator(db, broadcaster)
pdf_generator = PDFReportGenerator()
scanner_integration = ThirdPartyScannerIntegration(db, broadcaster)

# Store active scans with cancellation support
active_scans = {}

# ============================================================================
# REST API ENDPOINTS
# ============================================================================

@app.route('/')
def index():
    return jsonify({
        "status": "online",
        "version": "2.0",
        "name": "CyberSage Elite",
        "timestamp": datetime.now().isoformat(),
        "websocket": "enabled"
    })

@app.route('/api/health')
def health():
    return jsonify({
        "status": "healthy",
        "active_scans": len(active_scans),
        "database": "connected",
        "websocket": "enabled"
    })

@app.route('/api/config', methods=['GET'])
def get_config():
    """Get API configuration"""
    return jsonify({
        "openrouter_api_key_configured": bool(os.environ.get('OPENROUTER_API_KEY')),
        "ai_enabled": bool(os.environ.get('OPENROUTER_API_KEY'))
    })

@app.route('/api/config', methods=['POST'])
def update_config():
    """Update API configuration"""
    data = request.get_json()
    if 'openrouter_api_key' in data:
        os.environ['OPENROUTER_API_KEY'] = data['openrouter_api_key']
        return jsonify({"status": "success", "message": "API key updated"})
    return jsonify({"status": "error", "message": "Invalid configuration"}), 400

@app.route('/api/scans', methods=['GET'])
def get_scans():
    """Get all scan history"""
    scans = db.get_all_scans()
    return jsonify({"scans": scans})

@app.route('/api/scan/<scan_id>', methods=['GET'])
def get_scan_details(scan_id):
    """Get detailed scan results"""
    scan_data = db.get_scan_by_id(scan_id)
    vulnerabilities = db.get_vulnerabilities_by_scan(scan_id)
    chains = db.get_chains_by_scan(scan_id)
    
    return jsonify({
        "scan": scan_data,
        "vulnerabilities": vulnerabilities,
        "chains": chains,
        "stats": db.get_scan_stats(scan_id)
    })

@app.route('/api/scan/<scan_id>/cancel', methods=['POST'])
def cancel_scan(scan_id):
    """Cancel an active scan"""
    if scan_id in active_scans:
        active_scans[scan_id]['cancelled'] = True
        db.update_scan_status(scan_id, 'cancelled')
        broadcaster.broadcast_event('scan_cancelled', {
            'scan_id': scan_id,
            'timestamp': time.time()
        })
        return jsonify({"status": "success", "message": "Scan cancellation requested"})
    return jsonify({"status": "error", "message": "Scan not found or already completed"}), 404

@app.route('/api/scan/<scan_id>/export', methods=['GET'])
def export_scan(scan_id):
    """Export scan results as JSON"""
    scan_data = db.get_scan_by_id(scan_id)
    vulnerabilities = db.get_vulnerabilities_by_scan(scan_id)
    chains = db.get_chains_by_scan(scan_id)
    http_history = db.get_http_history(scan_id)
    statistics = db.get_scan_statistics(scan_id)
    
    export_data = {
        "scan_info": scan_data,
        "vulnerabilities": vulnerabilities,
        "attack_chains": chains,
        "http_history": http_history,
        "statistics": statistics,
        "generated_at": datetime.now().isoformat(),
        "platform": "CyberSage v2.0"
    }
    
    return jsonify(export_data)

@app.route('/api/scan/<scan_id>/export/pdf', methods=['GET'])
def export_scan_pdf(scan_id):
    """Export scan results as PDF report"""
    try:
        scan_data = db.get_scan_by_id(scan_id)
        vulnerabilities = db.get_vulnerabilities_by_scan(scan_id)
        chains = db.get_chains_by_scan(scan_id)
        statistics = db.get_scan_statistics(scan_id)
        
        if not scan_data:
            return jsonify({"error": "Scan not found"}), 404
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            pdf_path = tmp_file.name
        
        pdf_generator.generate_scan_report(
            scan_data, 
            vulnerabilities, 
            chains, 
            statistics, 
            pdf_path
        )
        
        return send_file(
            pdf_path,
            as_attachment=True,
            download_name=f'cybersage-scan-{scan_id}.pdf',
            mimetype='application/pdf'
        )
        
    except Exception as e:
        return jsonify({"error": f"PDF generation failed: {str(e)}"}), 500

@app.route('/api/scan/import', methods=['POST'])
def import_scan():
    """Import scan results from JSON/XML file"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['file']
        scanner_type = request.form.get('scanner_type', 'generic')
        
        content = file.read().decode('utf-8')
        
        # Parse based on scanner type
        scan_id = f"import_{int(time.time())}"
        db.create_scan(scan_id, f"Imported from {scanner_type}", 'import')
        
        if scanner_type == 'nmap':
            scanner_integration.integrate_nmap_results(scan_id, content)
        elif scanner_type == 'nessus':
            data = json.loads(content)
            scanner_integration.integrate_nessus_results(scan_id, data)
        elif scanner_type == 'zap':
            data = json.loads(content)
            scanner_integration.integrate_owasp_zap_results(scan_id, data)
        elif scanner_type == 'burp':
            data = json.loads(content)
            scanner_integration.integrate_burp_results(scan_id, data)
        else:
            data = json.loads(content)
            scanner_integration.integrate_custom_scanner(scan_id, scanner_type, data)
        
        db.update_scan_status(scan_id, 'completed')
        
        return jsonify({
            "status": "success",
            "scan_id": scan_id,
            "message": f"Successfully imported {scanner_type} results"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scan/<scan_id>/history', methods=['GET'])
def get_scan_history(scan_id):
    """Get HTTP request/response history"""
    history = db.get_http_history(scan_id)
    return jsonify({"history": history})

@app.route('/api/scan/<scan_id>/statistics', methods=['GET'])
def get_scan_statistics(scan_id):
    """Get detailed scan statistics"""
    stats = db.get_scan_statistics(scan_id)
    return jsonify({"statistics": stats})

@app.route('/api/scan/<scan_id>/blueprint', methods=['GET'])
def get_scan_blueprint(scan_id):
    """Get recon blueprint and OSINT details"""
    data = db.get_recon_blueprint(scan_id)
    return jsonify(data)

@app.route('/api/vulnerability/<int:vuln_id>', methods=['GET'])
def get_vulnerability_details(vuln_id):
    """Get full vulnerability details with HTTP history"""
    vuln = db.get_vulnerability_details(vuln_id)
    return jsonify({"vulnerability": vuln})

@app.route('/api/repeater/send', methods=['POST'])
def repeater_send():
    """Send HTTP request via Repeater"""
    try:
        import requests
        
        payload = request.get_json(force=True) or {}
        method = (payload.get('method') or 'GET').upper()
        url = payload.get('url')
        headers = payload.get('headers') or {}
        body = payload.get('body') or ''
        timeout = int(payload.get('timeout') or 20)
        scan_id = payload.get('scan_id') or f"manual_{int(time.time())}"

        if not url:
            return jsonify({"error": "url is required"}), 400

        session = requests.Session()
        session.verify = False

        start = time.time()
        resp = session.request(method, url, headers=headers, data=body, timeout=timeout, allow_redirects=True)
        elapsed_ms = int((time.time() - start) * 1000)

        req_headers_raw = "\n".join([f"{k}: {v}" for k, v in (headers or {}).items()])
        resp_headers_raw = "\n".join([f"{k}: {v}" for k, v in resp.headers.items()])

        db.add_http_request(
            scan_id=scan_id,
            method=method,
            url=url,
            req_headers=req_headers_raw,
            req_body=str(body)[:10000],
            resp_code=resp.status_code,
            resp_headers=resp_headers_raw[:10000],
            resp_body=resp.text[:50000],
            resp_time_ms=elapsed_ms,
            vuln_id=None
        )

        return jsonify({
            "scan_id": scan_id,
            "status": "ok",
            "response": {
                "code": resp.status_code,
                "headers": dict(resp.headers),
                "body": resp.text,
                "time_ms": elapsed_ms
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# WEBSOCKET EVENT HANDLERS
# ============================================================================

@socketio.on('connect', namespace='/scan')
def handle_connect():
    """Handle client connection"""
    print(f'✅ [WebSocket] Client connected: {request.sid}')
    emit('connected', {
        'status': 'ready',
        'message': 'Connected to CyberSage v2.0',
        'server_time': time.time(),
        'version': '2.0',
        'ai_enabled': bool(os.environ.get('OPENROUTER_API_KEY'))
    })

@socketio.on('disconnect', namespace='/scan')
def handle_disconnect():
    """Handle client disconnection"""
    print(f'❌ [WebSocket] Client disconnected: {request.sid}')

@socketio.on('ping', namespace='/scan')
def handle_ping():
    """Handle ping from client"""
    emit('pong', {'timestamp': time.time()})

@socketio.on('start_scan', namespace='/scan')
def handle_start_scan(data):
    """Start a new security scan"""
    print(f'[WebSocket] Received start_scan request: {data}')
    
    target = data.get('target')
    scan_mode = data.get('mode', 'elite')
    options = {
        'intensity': data.get('intensity', 'normal'),
        'auth': data.get('auth', {}),
        'policy': data.get('policy', {}),
        'spiderConfig': data.get('spiderConfig', {}),
        'tools': data.get('tools', {})  # FIXED: Store selected tools
    }
    
    if not target:
        emit('error', {'message': 'Target is required'})
        return
    
    scan_id = f"scan_{int(time.time())}_{target.replace('://', '_').replace('/', '_')[:30]}"
    
    print(f'[Scan] Starting scan {scan_id} for target: {target}')
    print(f'[Scan] Selected tools: {options.get("tools")}')
    
    db.create_scan(scan_id, target, scan_mode)
    
    emit('scan_started', {
        'scan_id': scan_id,
        'target': target,
        'mode': scan_mode,
        'timestamp': time.time()
    })
    
    # Start scan in background thread
    scan_thread = threading.Thread(
        target=execute_scan_async,
        args=(scan_id, target, scan_mode, options),
        daemon=True
    )
    scan_thread.start()
    
    active_scans[scan_id] = {
        'target': target,
        'mode': scan_mode,
        'thread': scan_thread,
        'started_at': time.time(),
        'cancelled': False
    }

def execute_scan_async(scan_id, target, scan_mode, options=None):
    """Execute scan asynchronously"""
    try:
        print(f'[Scan] Executing scan {scan_id}')
        
        broadcaster.broadcast_event('scan_status', {
            'scan_id': scan_id,
            'status': 'running',
            'message': 'Initializing CyberSage Elite Scanner...'
        })
        
        # Execute the scan with cancellation support
        results = scan_orchestrator.execute_elite_scan(
            scan_id, 
            target, 
            scan_mode, 
            options,
            lambda: active_scans.get(scan_id, {}).get('cancelled', False)
        )
        
        # Check if cancelled
        if active_scans.get(scan_id, {}).get('cancelled', False):
            print(f'[Scan] Scan {scan_id} was cancelled')
            return
        
        # Update scan status
        db.update_scan_status(scan_id, 'completed')
        
        broadcaster.broadcast_event('scan_completed', {
            'scan_id': scan_id,
            'status': 'completed',
            'results_summary': results,
            'timestamp': time.time()
        })
        
        print(f'[Scan] Completed scan {scan_id}')
        
    except Exception as e:
        print(f"[ERROR] Scan {scan_id} failed: {str(e)}")
        import traceback
        traceback.print_exc()
        
        db.update_scan_status(scan_id, 'failed', str(e))
        
        broadcaster.broadcast_event('scan_error', {
            'scan_id': scan_id,
            'error': str(e),
            'timestamp': time.time()
        })
    
    finally:
        if scan_id in active_scans:
            del active_scans[scan_id]

@socketio.on('stop_scan', namespace='/scan')
def handle_stop_scan(data):
    """Stop an active scan"""
    scan_id = data.get('scan_id')
    
    if scan_id in active_scans:
        active_scans[scan_id]['cancelled'] = True
        db.update_scan_status(scan_id, 'stopped')
        emit('scan_stopped', {'scan_id': scan_id})
        print(f'[Scan] Stopped scan {scan_id}')
    else:
        emit('error', {'message': 'Scan not found or already completed'})

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    print("\n" + "=" * 80)
    print("🧠 CyberSage v2.0 - Elite Vulnerability Intelligence Platform")
    print("=" * 80)
    print(f"[+] Backend: http://0.0.0.0:5000")
    print(f"[+] WebSocket: /scan namespace")
    print(f"[+] Database: {db.db_path}")
    print(f"[+] AI Enabled: {bool(os.environ.get('OPENROUTER_API_KEY'))}")
    print("=" * 80)
    print("[+] ✅ Ready for connections!")
    print("=" * 80 + "\n")
    
    socketio.run(
        app,
        host='0.0.0.0',
        port=5000,
        debug=False,
        use_reloader=False,
        allow_unsafe_werkzeug=True
    )