from flask import Blueprint, request, jsonify
from models.food import Food
from utils.auth import admin_required, sanitize_input
from utils.cloudinary_helper import delete_image
import logging

logger = logging.getLogger(__name__)

food_bp = Blueprint('food', __name__)

@food_bp.route('/', methods=['GET'])
def get_foods():
    """Get all active foods with pagination"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 9))
        search = request.args.get('search', '').strip()
        
        skip = (page - 1) * limit
        
        if search:
            foods = Food.search(search, skip=skip, limit=limit)
            total = len(foods)  # Simplified for search
        else:
            foods = Food.get_all(active_only=True, skip=skip, limit=limit)
            total = Food.count(active_only=True)
        
        return jsonify({
            'success': True,
            'data': foods,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting foods: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error retrieving foods'
        }), 500

@food_bp.route('/<food_id>', methods=['GET'])
def get_food(food_id):
    """Get single food by ID"""
    try:
        food = Food.get_by_id(food_id)
        
        if not food:
            return jsonify({
                'success': False,
                'message': 'Food not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': food
        })
        
    except Exception as e:
        logger.error(f"Error getting food {food_id}: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error retrieving food'
        }), 500

@food_bp.route('/', methods=['POST'])
@admin_required
def create_food():
    """Create new food (admin only)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'description', 'image_url']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Sanitize inputs
        data['title'] = sanitize_input(data['title'])
        data['description'] = sanitize_input(data['description'])
        data['instructions'] = sanitize_input(data.get('instructions', ''))
        
        food_id = Food.create(data)
        
        return jsonify({
            'success': True,
            'message': 'Food created successfully',
            'data': {'id': food_id}
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating food: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error creating food'
        }), 500

@food_bp.route('/<food_id>', methods=['PUT'])
@admin_required
def update_food(food_id):
    """Update food (admin only)"""
    try:
        data = request.get_json()
        
        # Sanitize inputs if present
        if 'title' in data:
            data['title'] = sanitize_input(data['title'])
        if 'description' in data:
            data['description'] = sanitize_input(data['description'])
        if 'instructions' in data:
            data['instructions'] = sanitize_input(data['instructions'])
        
        success = Food.update(food_id, data)
        
        if not success:
            return jsonify({
                'success': False,
                'message': 'Food not found or update failed'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Food updated successfully'
        })
        
    except Exception as e:
        logger.error(f"Error updating food {food_id}: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error updating food'
        }), 500

@food_bp.route('/<food_id>', methods=['DELETE'])
@admin_required
def delete_food(food_id):
    """Delete food (admin only)"""
    try:
        # Get food to delete image from Cloudinary
        food = Food.get_by_id(food_id)
        
        if not food:
            return jsonify({
                'success': False,
                'message': 'Food not found'
            }), 404
        
        # Delete from database (soft delete)
        success = Food.delete(food_id)
        
        if not success:
            return jsonify({
                'success': False,
                'message': 'Error deleting food'
            }), 500
        
        # Delete image from Cloudinary if exists
        if food.get('image_public_id'):
            delete_image(food['image_public_id'])
        
        return jsonify({
            'success': True,
            'message': 'Food deleted successfully'
        })
        
    except Exception as e:
        logger.error(f"Error deleting food {food_id}: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error deleting food'
        }), 500
