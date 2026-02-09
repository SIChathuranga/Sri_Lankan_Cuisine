from functools import wraps
from flask import session, jsonify
import hashlib
import secrets
import logging

logger = logging.getLogger(__name__)

def hash_password(password):
    """
    Hash password using SHA-256
    
    Args:
        password: Plain text password
        
    Returns:
        str: Hashed password
    """
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed_password):
    """
    Verify password against hash
    
    Args:
        password: Plain text password
        hashed_password: Hashed password
        
    Returns:
        bool: True if password matches
    """
    return hash_password(password) == hashed_password

def generate_session_token():
    """
    Generate secure session token
    
    Returns:
        str: Random session token
    """
    return secrets.token_hex(32)

def admin_required(f):
    """
    Decorator to protect admin routes
    
    Usage:
        @app.route('/admin/dashboard')
        @admin_required
        def dashboard():
            return jsonify({'message': 'Admin dashboard'})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return jsonify({
                'success': False,
                'message': 'Unauthorized. Admin login required.'
            }), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

def validate_email(email):
    """
    Basic email validation
    
    Args:
        email: Email address
        
    Returns:
        bool: True if valid email format
    """
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def sanitize_input(text):
    """
    Sanitize user input to prevent XSS
    
    Args:
        text: User input text
        
    Returns:
        str: Sanitized text
    """
    if not text:
        return text
    
    # Remove HTML tags
    import re
    text = re.sub(r'<[^>]+>', '', text)
    
    # Escape special characters
    replacements = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    }
    
    for char, escape in replacements.items():
        text = text.replace(char, escape)
    
    return text.strip()
