from flask import Blueprint, request, jsonify
from utils.auth import admin_required
from utils.cloudinary_helper import upload_image
from config import Config
import logging

logger = logging.getLogger(__name__)

upload_bp = Blueprint('upload', __name__)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@upload_bp.route('/image', methods=['POST'])
@admin_required
def upload_image_route():
    """Upload image to Cloudinary (admin only)"""
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No file provided'
            }), 400
        
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'No file selected'
            }), 400
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'message': f'Invalid file type. Allowed types: {", ".join(Config.ALLOWED_EXTENSIONS)}'
            }), 400
        
        # Upload to Cloudinary
        result = upload_image(file)
        
        logger.info(f"Image uploaded: {result['public_id']}")
        
        return jsonify({
            'success': True,
            'message': 'Image uploaded successfully',
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Image upload error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error uploading image'
        }), 500
