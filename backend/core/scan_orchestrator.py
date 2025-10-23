import time
from tools.recon import ReconEngine
from tools.vuln_scanner import VulnerabilityScanner
from tools.advanced.chain_detector import ChainDetector
from tools.advanced.business_logic import BusinessLogicScanner
from tools.advanced.api_security import APISecurityScanner
from tools.advanced.ai_analyzer import AIAnalyzer
from tools.nmap_scanner import NmapScanner
from tools.professional_tools import ProfessionalToolsIntegration

class ScanOrchestrator:
    """
    Orchestrates the complete security scan workflow with professional tools
    """
    
    def __init__(self, database, broadcaster):
        self.db = database
        self.broadcaster = broadcaster
        
        # Initialize scan engines
        self.recon = ReconEngine(database, broadcaster)
        self.vuln_scanner = VulnerabilityScanner(database, broadcaster)
        self.chain_detector = ChainDetector(database, broadcaster)
        self.business_logic = BusinessLogicScanner(database, broadcaster)
        self.api_security = APISecurityScanner(database, broadcaster)
        self.ai_analyzer = AIAnalyzer(database, broadcaster)
        self.nmap = NmapScanner(database, broadcaster)
        self.pro_tools = ProfessionalToolsIntegration(database, broadcaster)
    
    def execute_elite_scan(self, scan_id, target, scan_mode='elite', options=None, is_cancelled=None):
        """
        Execute comprehensive elite-level security scan
        """
        print(f"\n{'='*60}")
        print(f"🧠 Starting Elite Scan: {scan_id}")
        print(f"🎯 Target: {target}")
        print(f"⚙️  Mode: {scan_mode}")
        print(f"🔧 Tools: {options.get('tools') if options else 'default'}")
        print(f"{'='*60}\n")
        
        start_time = time.time()
        all_vulnerabilities = []
        all_chains = []
        
        # Get selected tools
        tools_config = options.get('tools', {}) if options else {}
        
        try:
            # Check cancellation
            if is_cancelled and is_cancelled():
                return self._cancelled_result(scan_id)
            
            # Phase 1: Deep Reconnaissance (0-20%)
            self.broadcaster.broadcast_scan_progress(scan_id, 3, "🔍 Initiating Recon & Blueprinting")
            recon_data = self.recon.deep_reconnaissance(scan_id, target, options)
            
            if is_cancelled and is_cancelled():
                return self._cancelled_result(scan_id)
            
            # Persist blueprint
            try:
                osint = {
                    'subdomains': recon_data.get('subdomains', []),
                    'live_hosts': recon_data.get('live_hosts', []),
                    'technologies': recon_data.get('technologies', []),
                    'api_definitions': recon_data.get('api_definitions', [])
                }
                self.db.set_recon_blueprint(scan_id, recon_data.get('blueprint', {}), osint)
            except Exception as e:
                print(f"[WARNING] Blueprint save failed: {e}")
            
            # Professional Tools Integration (5-20%)
            if tools_config.get('nmap', True):
                self.broadcaster.broadcast_scan_progress(scan_id, 8, "🌐 Network Discovery (Nmap)")
                nmap_findings = self.nmap.scan_target(scan_id, target, options.get('intensity', 'normal'))
                for nf in nmap_findings:
                    if is_cancelled and is_cancelled():
                        return self._cancelled_result(scan_id)
                    self.broadcaster.broadcast_vulnerability_found(scan_id, nf)
                    self.db.add_vulnerability(scan_id, nf)
                all_vulnerabilities.extend(nmap_findings)
            
            # Run other professional tools if selected
            if tools_config.get('theHarvester', False):
                if is_cancelled and is_cancelled():
                    return self._cancelled_result(scan_id)
                harvester_findings = self.pro_tools.run_theharvester(scan_id, target)
                all_vulnerabilities.extend(harvester_findings)
            
            if tools_config.get('amass', False):
                if is_cancelled and is_cancelled():
                    return self._cancelled_result(scan_id)
                amass_findings = self.pro_tools.run_amass(scan_id, target)
                all_vulnerabilities.extend(amass_findings)
            
            if tools_config.get('whois', False):
                if is_cancelled and is_cancelled():
                    return self._cancelled_result(scan_id)
                whois_findings = self.pro_tools.run_whois(scan_id, target)
                all_vulnerabilities.extend(whois_findings)
            
            if tools_config.get('ffuf', False):
                if is_cancelled and is_cancelled():
                    return self._cancelled_result(scan_id)
                ffuf_findings = self.pro_tools.run_ffuf(scan_id, target)
                all_vulnerabilities.extend(ffuf_findings)
            
            if tools_config.get('gobuster', False):
                if is_cancelled and is_cancelled():
                    return self._cancelled_result(scan_id)
                gobuster_findings = self.pro_tools.run_gobuster(scan_id, target)
                all_vulnerabilities.extend(gobuster_findings)
            
            if tools_config.get('sqlmap', False):
                if is_cancelled and is_cancelled():
                    return self._cancelled_result(scan_id)
                sqlmap_findings = self.pro_tools.run_sqlmap(scan_id, target)
                all_vulnerabilities.extend(sqlmap_findings)
            
            if tools_config.get('nikto', False):
                if is_cancelled and is_cancelled():
                    return self._cancelled_result(scan_id)
                nikto_findings = self.pro_tools.run_nikto(scan_id, target)
                all_vulnerabilities.extend(nikto_findings)
            
            if tools_config.get('wpscan', False):
                if is_cancelled and is_cancelled():
                    return self._cancelled_result(scan_id)
                wpscan_findings = self.pro_tools.run_wpscan(scan_id, target)
                all_vulnerabilities.extend(wpscan_findings)
            
            if tools_config.get('nuclei', False):
                if is_cancelled and is_cancelled():
                    return self._cancelled_result(scan_id)
                nuclei_findings = self.pro_tools.run_nuclei(scan_id, target)
                all_vulnerabilities.extend(nuclei_findings)
            
            self.broadcaster.broadcast_scan_progress(scan_id, 20, "✓ Reconnaissance Complete")
            
            # Phase 2: Vulnerability Scanning (20-50%)
            if is_cancelled and is_cancelled():
                return self._cancelled_result(scan_id)
            
            self.broadcaster.broadcast_scan_progress(scan_id, 25, "🔥 Initiating Vulnerability Scans")
            vulns = self.vuln_scanner.comprehensive_scan(scan_id, recon_data)
            all_vulnerabilities.extend(vulns)
            
            self.broadcaster.broadcast_scan_progress(scan_id, 50, "✓ Vulnerability Scanning Complete")
            
            # Phase 3: Advanced Detection (50-70%)
            if scan_mode == 'elite':
                if is_cancelled and is_cancelled():
                    return self._cancelled_result(scan_id)
                
                self.broadcaster.broadcast_scan_progress(scan_id, 55, "🧩 Analyzing Business Logic")
                business_vulns = self.business_logic.scan(scan_id, recon_data)
                all_vulnerabilities.extend(business_vulns)
                
                if recon_data.get('has_api'):
                    if is_cancelled and is_cancelled():
                        return self._cancelled_result(scan_id)
                    self.broadcaster.broadcast_scan_progress(scan_id, 60, "🔌 Testing API Security")
                    api_vulns = self.api_security.scan(scan_id, recon_data)
                    all_vulnerabilities.extend(api_vulns)
                
                self.broadcaster.broadcast_scan_progress(scan_id, 70, "✓ Advanced Detection Complete")
            
            # Phase 4: Chain Detection (70-85%)
            if is_cancelled and is_cancelled():
                return self._cancelled_result(scan_id)
            
            self.broadcaster.broadcast_scan_progress(scan_id, 75, "⛓️  Detecting Attack Chains")
            chains = self.chain_detector.detect_chains(scan_id, all_vulnerabilities, recon_data)
            all_chains.extend(chains)
            
            for chain in chains:
                self.broadcaster.broadcast_chain_detected(scan_id, chain)
            
            self.broadcaster.broadcast_scan_progress(scan_id, 85, "✓ Chain Analysis Complete")
            
            # Phase 5: AI Analysis (85-95%)
            if scan_mode == 'elite':
                if is_cancelled and is_cancelled():
                    return self._cancelled_result(scan_id)
                
                self.broadcaster.broadcast_scan_progress(scan_id, 90, "🤖 AI Deep Analysis")
                ai_insights = self.ai_analyzer.analyze(scan_id, {
                    'vulnerabilities': all_vulnerabilities,
                    'chains': all_chains,
                    'recon_data': recon_data
                })
                
                for insight in ai_insights:
                    self.broadcaster.broadcast_ai_insight(scan_id, insight)
                
                self.broadcaster.broadcast_scan_progress(scan_id, 95, "✓ AI Analysis Complete")
            
            # Phase 6: Finalization (95-100%)
            self.broadcaster.broadcast_scan_progress(scan_id, 98, "📊 Generating Final Report")
            
            stats = self._calculate_final_stats(all_vulnerabilities, all_chains)
            
            self.broadcaster.broadcast_scan_progress(scan_id, 100, "✅ Scan Complete")
            
            elapsed_time = time.time() - start_time
            
            print(f"\n{'='*60}")
            print(f"✅ Scan Complete: {scan_id}")
            print(f"⏱️  Duration: {elapsed_time:.2f}s")
            print(f"🔍 Vulnerabilities Found: {len(all_vulnerabilities)}")
            print(f"⛓️  Attack Chains: {len(all_chains)}")
            print(f"{'='*60}\n")
            
            return {
                'scan_id': scan_id,
                'status': 'completed',
                'duration': elapsed_time,
                'vulnerabilities_count': len(all_vulnerabilities),
                'chains_count': len(all_chains),
                'stats': stats
            }
            
        except Exception as e:
            print(f"[ERROR] Scan failed: {str(e)}")
            import traceback
            traceback.print_exc()
            raise e
    
    def _cancelled_result(self, scan_id):
        """Return result for cancelled scan"""
        print(f"[CANCELLED] Scan {scan_id} was cancelled by user")
        return {
            'scan_id': scan_id,
            'status': 'cancelled',
            'duration': 0,
            'vulnerabilities_count': 0,
            'chains_count': 0,
            'stats': {}
        }
    
    def _calculate_final_stats(self, vulnerabilities, chains):
        """Calculate final scan statistics"""
        stats = {
            'total': len(vulnerabilities),
            'critical': len([v for v in vulnerabilities if v.get('severity') == 'critical']),
            'high': len([v for v in vulnerabilities if v.get('severity') == 'high']),
            'medium': len([v for v in vulnerabilities if v.get('severity') == 'medium']),
            'low': len([v for v in vulnerabilities if v.get('severity') == 'low']),
            'chains': len(chains),
            'avg_confidence': sum([v.get('confidence', 50) for v in vulnerabilities]) / len(vulnerabilities) if vulnerabilities else 0
        }
        return stats