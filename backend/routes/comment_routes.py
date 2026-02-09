from flask import Blueprint, request, jsonify, session
from models.comment import Comment
from utils.auth import admin_required, sanitize_input, validate_email
import logging

logger = logging.getLogger(__name__)

comment_bp = Blueprint('comment', __name__)

@comment_bp.route('/approved', methods=['GET'])
def get_approved_comments():
    """Get all approved comments (public)"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        
        skip = (page - 1) * limit
        
        comments = Comment.get_approved(skip=skip, limit=limit)
        total = Comment.count(status=Comment.STATUS_APPROVED)
        
        return jsonify({
            'success': True,
            'data': comments,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting approved comments: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error retrieving comments'
        }), 500

@comment_bp.route('/all', methods=['GET'])
@admin_required
def get_all_comments():
    """Get all comments with status filter (admin only)"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        status = request.args.get('status')  # pending, approved, rejected
        
        skip = (page - 1) * limit
        
        comments = Comment.get_all(status=status, skip=skip, limit=limit)
        total = Comment.count(status=status)
        
        return jsonify({
            'success': True,
            'data': comments,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            },
            'stats': {
                'pending': Comment.count(status=Comment.STATUS_PENDING),
                'approved': Comment.count(status=Comment.STATUS_APPROVED),
                'rejected': Comment.count(status=Comment.STATUS_REJECTED)
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting all comments: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error retrieving comments'
        }), 500

@comment_bp.route('/', methods=['POST'])
def create_comment():
    """Submit new comment (public)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'comment_text']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Validate email
        if not validate_email(data['email']):
            return jsonify({
                'success': False,
                'message': 'Invalid email address'
            }), 400
        
        # Sanitize inputs
        data['name'] = sanitize_input(data['name'])
        data['email'] = sanitize_input(data['email'])
        data['comment_text'] = sanitize_input(data['comment_text'])
        
        # Validate comment length
        if len(data['comment_text']) < 10:
            return jsonify({
                'success': False,
                'message': 'Comment must be at least 10 characters long'
            }), 400
        
        if len(data['comment_text']) > 1000:
            return jsonify({
                'success': False,
                'message': 'Comment must be less than 1000 characters'
            }), 400
        
        comment_id = Comment.create(data)
        
        return jsonify({
            'success': True,
            'message': 'Comment submitted successfully. It will be visible after admin approval.',
            'data': {'id': comment_id}
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating comment: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error submitting comment'
        }), 500

@comment_bp.route('/<comment_id>/approve', methods=['PUT'])
@admin_required
def approve_comment(comment_id):
    """Approve comment (admin only)"""
    try:
        admin_username = session.get('admin_username')
        
        success = Comment.approve(comment_id, admin_username)
        
        if not success:
            return jsonify({
                'success': False,
                'message': 'Comment not found or approval failed'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Comment approved successfully'
        })
        
    except Exception as e:
        logger.error(f"Error approving comment {comment_id}: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error approving comment'
        }), 500

@comment_bp.route('/<comment_id>/reject', methods=['PUT'])
@admin_required
def reject_comment(comment_id):
    """Reject comment (admin only)"""
    try:
        admin_username = session.get('admin_username')
        
        success = Comment.reject(comment_id, admin_username)
        
        if not success:
            return jsonify({
                'success': False,
                'message': 'Comment not found or rejection failed'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Comment rejected successfully'
        })
        
    except Exception as e:
        logger.error(f"Error rejecting comment {comment_id}: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error rejecting comment'
        }), 500

@comment_bp.route('/<comment_id>', methods=['DELETE'])
@admin_required
def delete_comment(comment_id):
    """Delete comment permanently (admin only)"""
    try:
        success = Comment.delete(comment_id)
        
        if not success:
            return jsonify({
                'success': False,
                'message': 'Comment not found or deletion failed'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Comment deleted successfully'
        })
        
    except Exception as e:
        logger.error(f"Error deleting comment {comment_id}: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error deleting comment'
        }), 500
