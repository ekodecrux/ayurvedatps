#!/usr/bin/env python3
"""
Web-based Backup & Restore Management API
Provides RESTful endpoints for backup/restore operations
Run this as a service on production server
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import json
import subprocess
import glob
from datetime import datetime

app = Flask(__name__)
CORS(app)

BACKUP_DIR = "/var/www/ayurveda/backups/daily"
BACKUP_SCRIPT = "/var/www/ayurveda/daily_backup.py"
RESTORE_SCRIPT = "/var/www/ayurveda/restore_from_backup.py"
DB_PATH = "/var/www/ayurveda/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite"

@app.route('/api/backups/list', methods=['GET'])
def list_backups():
    """List all available backups"""
    try:
        if not os.path.exists(BACKUP_DIR):
            return jsonify({
                'success': False,
                'error': 'Backup directory not found'
            }), 404
        
        backups = []
        # List all backup directories
        backup_dirs = sorted(glob.glob(f"{BACKUP_DIR}/ayurveda_backup_*"), reverse=True)
        
        for backup_path in backup_dirs:
            if os.path.isdir(backup_path):
                backup_name = os.path.basename(backup_path)
                json_file = os.path.join(backup_path, 'data.json')
                summary_file = os.path.join(backup_path, 'SUMMARY.txt')
                archive_file = f"{backup_path}.tar.gz"
                
                # Read backup info
                backup_info = {
                    'name': backup_name,
                    'path': backup_path,
                    'date': backup_name.replace('ayurveda_backup_', ''),
                    'size': 0,
                    'patients': 0,
                    'prescriptions': 0,
                    'medicines': 0,
                    'has_data': False
                }
                
                # Get file size
                if os.path.exists(archive_file):
                    backup_info['size'] = os.path.getsize(archive_file)
                
                # Read JSON data for counts
                if os.path.exists(json_file):
                    try:
                        with open(json_file, 'r') as f:
                            data = json.load(f)
                            backup_info['has_data'] = True
                            backup_info['patients'] = len(data.get('patients', []))
                            backup_info['prescriptions'] = len(data.get('prescriptions', []))
                            backup_info['medicines'] = sum(
                                len(p.get('medicines', []))
                                for p in data.get('prescriptions', [])
                            )
                            backup_info['backup_timestamp'] = data.get('backup_timestamp', '')
                    except:
                        pass
                
                backups.append(backup_info)
        
        return jsonify({
            'success': True,
            'data': backups,
            'count': len(backups)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/backups/create', methods=['POST'])
def create_backup():
    """Trigger manual backup"""
    try:
        if not os.path.exists(BACKUP_SCRIPT):
            return jsonify({
                'success': False,
                'error': 'Backup script not found'
            }), 404
        
        # Run backup script
        result = subprocess.run(
            ['python3', BACKUP_SCRIPT],
            capture_output=True,
            text=True,
            timeout=300  # 5 minutes timeout
        )
        
        if result.returncode == 0:
            return jsonify({
                'success': True,
                'message': 'Backup created successfully',
                'output': result.stdout[-500:] if len(result.stdout) > 500 else result.stdout
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Backup failed',
                'output': result.stderr
            }), 500
            
    except subprocess.TimeoutExpired:
        return jsonify({
            'success': False,
            'error': 'Backup timeout (took longer than 5 minutes)'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/backups/info/<backup_name>', methods=['GET'])
def get_backup_info(backup_name):
    """Get detailed info about a specific backup"""
    try:
        backup_path = os.path.join(BACKUP_DIR, backup_name)
        json_file = os.path.join(backup_path, 'data.json')
        summary_file = os.path.join(backup_path, 'SUMMARY.txt')
        
        if not os.path.exists(backup_path):
            return jsonify({
                'success': False,
                'error': 'Backup not found'
            }), 404
        
        info = {
            'name': backup_name,
            'path': backup_path
        }
        
        # Read JSON data
        if os.path.exists(json_file):
            with open(json_file, 'r') as f:
                data = json.load(f)
                info['data'] = {
                    'backup_timestamp': data.get('backup_timestamp'),
                    'patients_count': len(data.get('patients', [])),
                    'prescriptions_count': len(data.get('prescriptions', [])),
                    'medicines_count': sum(
                        len(p.get('medicines', []))
                        for p in data.get('prescriptions', [])
                    ),
                    'payments_count': len(data.get('payment_collections', [])),
                    'appointments_count': len(data.get('appointments', [])),
                }
        
        # Read summary
        if os.path.exists(summary_file):
            with open(summary_file, 'r') as f:
                info['summary'] = f.read()
        
        return jsonify({
            'success': True,
            'data': info
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/backups/restore', methods=['POST'])
def restore_backup():
    """Restore from backup - requires confirmation"""
    try:
        data = request.get_json()
        backup_name = data.get('backup_name')
        confirmed = data.get('confirmed', False)
        
        if not backup_name:
            return jsonify({
                'success': False,
                'error': 'Backup name is required'
            }), 400
        
        if not confirmed:
            return jsonify({
                'success': False,
                'error': 'Restoration requires explicit confirmation',
                'warning': 'This will REPLACE ALL current data with backup data'
            }), 400
        
        backup_path = os.path.join(BACKUP_DIR, backup_name)
        if not os.path.exists(backup_path):
            return jsonify({
                'success': False,
                'error': 'Backup not found'
            }), 404
        
        # Stop PM2 process
        subprocess.run(['pm2', 'stop', 'ayurveda-clinic'], check=False)
        
        # Run restore script
        result = subprocess.run(
            ['python3', RESTORE_SCRIPT, '1'],  # Restore from backup (would need to modify script to accept backup name)
            capture_output=True,
            text=True,
            timeout=300,
            cwd="/var/www/ayurveda"
        )
        
        # Restart PM2 process
        subprocess.run(['pm2', 'restart', 'ayurveda-clinic'], check=False)
        
        if result.returncode == 0:
            return jsonify({
                'success': True,
                'message': 'Restore completed successfully',
                'output': result.stdout[-500:] if len(result.stdout) > 500 else result.stdout
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Restore failed',
                'output': result.stderr
            }), 500
            
    except Exception as e:
        # Try to restart PM2 even if restore failed
        subprocess.run(['pm2', 'restart', 'ayurveda-clinic'], check=False)
        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/backups/delete/<backup_name>', methods=['DELETE'])
def delete_backup(backup_name):
    """Delete a backup (with confirmation)"""
    try:
        confirmed = request.args.get('confirmed', 'false').lower() == 'true'
        
        if not confirmed:
            return jsonify({
                'success': False,
                'error': 'Deletion requires confirmation'
            }), 400
        
        backup_path = os.path.join(BACKUP_DIR, backup_name)
        archive_file = f"{backup_path}.tar.gz"
        
        if not os.path.exists(backup_path) and not os.path.exists(archive_file):
            return jsonify({
                'success': False,
                'error': 'Backup not found'
            }), 404
        
        # Delete directory
        if os.path.exists(backup_path):
            import shutil
            shutil.rmtree(backup_path)
        
        # Delete archive
        if os.path.exists(archive_file):
            os.remove(archive_file)
        
        return jsonify({
            'success': True,
            'message': 'Backup deleted successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'backup_dir_exists': os.path.exists(BACKUP_DIR),
        'backup_script_exists': os.path.exists(BACKUP_SCRIPT),
        'restore_script_exists': os.path.exists(RESTORE_SCRIPT)
    })

if __name__ == '__main__':
    # Run on port 5000
    app.run(host='0.0.0.0', port=5000, debug=False)
