from flask import Flask, jsonify, session
from flask_cors import CORS
from config import Config
from utils.db import Database
from utils.cloudinary_helper import CloudinaryHelper
import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = Config.SECRET_KEY
app.config['MAX_CONTENT_LENGTH'] = Config.MAX_FILE_SIZE

# Configure CORS
CORS(app, 
     origins=Config.ALLOWED_ORIGINS,
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Initialize database and Cloudinary
try:
    Database.initialize()
    CloudinaryHelper.initialize()
    logger.info("Application initialized successfully")
except Exception as e:
    logger.error(f"Initialization error: {str(e)}")
    raise

# Import and register blueprints
from routes.food_routes import food_bp
from routes.comment_routes import comment_bp
from routes.admin_routes import admin_bp
from routes.upload_routes import upload_bp

app.register_blueprint(food_bp, url_prefix='/api/foods')
app.register_blueprint(comment_bp, url_prefix='/api/comments')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(upload_bp, url_prefix='/api/upload')

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'Sri Lankan Cuisine API is running',
        'version': '2.0.0'
    })

# Root endpoint
@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        'success': True,
        'message': 'Welcome to Sri Lankan Cuisine API',
        'version': '2.0.0',
        'endpoints': {
            'health': '/api/health',
            'foods': '/api/foods',
            'comments': '/api/comments',
            'admin': '/api/admin',
            'upload': '/api/upload'
        }
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({
        'success': False,
        'message': 'Internal server error'
    }), 500

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({
        'success': False,
        'message': f'File too large. Maximum size is {Config.MAX_FILE_SIZE / (1024*1024)}MB'
    }), 413

# Cleanup on shutdown
@app.teardown_appcontext
def shutdown_session(exception=None):
    """Cleanup on shutdown"""
    if exception:
        logger.error(f"Shutdown error: {str(exception)}")

if __name__ == '__main__':
    # Create default admin if none exists
    from models.admin import Admin
    from config import Config
    
    if not Admin.exists():
        logger.info("Creating default admin user...")
        Admin.create(
            username=Config.ADMIN_USERNAME,
            password=Config.ADMIN_PASSWORD,
            email=Config.ADMIN_EMAIL
        )
        logger.info(f"Default admin created: {Config.ADMIN_USERNAME}")
    
    # Run the application
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=(Config.FLASK_ENV == 'development')
    )
