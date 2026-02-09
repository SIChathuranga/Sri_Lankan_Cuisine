from flask import Blueprint, request, jsonify, session
from models.admin import Admin
from utils.auth import sanitize_input
import logging

logger = logging.getLogger(__name__)

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/login', methods=['POST'])
def login():
    """Admin login"""
    try:
        data = request.get_json()
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({
                'success': False,
                'message': 'Username and password are required'
            }), 400
        
        # Authenticate admin
        admin = Admin.authenticate(username, password)
        
        if not admin:
            return jsonify({
                'success': False,
                'message': 'Invalid username or password'
            }), 401
        
        # Set session
        session['admin_logged_in'] = True
        session['admin_username'] = admin['username']
        session['admin_email'] = admin['email']
        
        logger.info(f"Admin logged in: {username}")
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'username': admin['username'],
                'email': admin['email']
            }
        })
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Login error'
        }), 500

@admin_bp.route('/logout', methods=['POST'])
def logout():
    """Admin logout"""
    try:
        username = session.get('admin_username', 'Unknown')
        
        # Clear session
        session.clear()
        
        logger.info(f"Admin logged out: {username}")
        
        return jsonify({
            'success': True,
            'message': 'Logout successful'
        })
        
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Logout error'
        }), 500

@admin_bp.route('/check-auth', methods=['GET'])
def check_auth():
    """Check if admin is authenticated"""
    try:
        if session.get('admin_logged_in'):
            return jsonify({
                'success': True,
                'authenticated': True,
                'data': {
                    'username': session.get('admin_username'),
                    'email': session.get('admin_email')
                }
            })
        else:
            return jsonify({
                'success': True,
                'authenticated': False
            })
            
    except Exception as e:
        logger.error(f"Auth check error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Auth check error'
        }), 500

@admin_bp.route('/change-password', methods=['PUT'])
def change_password():
    """Change admin password"""
    try:
        if not session.get('admin_logged_in'):
            return jsonify({
                'success': False,
                'message': 'Unauthorized'
            }), 401
        
        data = request.get_json()
        
        old_password = data.get('old_password', '')
        new_password = data.get('new_password', '')
        
        if not old_password or not new_password:
            return jsonify({
                'success': False,
                'message': 'Old and new passwords are required'
            }), 400
        
        if len(new_password) < 8:
            return jsonify({
                'success': False,
                'message': 'New password must be at least 8 characters long'
            }), 400
        
        username = session.get('admin_username')
        
        success = Admin.change_password(username, old_password, new_password)
        
        if not success:
            return jsonify({
                'success': False,
                'message': 'Incorrect old password or update failed'
            }), 400
        
        logger.info(f"Password changed for admin: {username}")
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        })
        
    except Exception as e:
        logger.error(f"Password change error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Password change error'
        }), 500
