from datetime import datetime
from bson import ObjectId
from utils.db import get_db
import logging

logger = logging.getLogger(__name__)

class Comment:
    """Comment model for managing user comments"""
    
    collection_name = 'comments'
    
    # Comment status constants
    STATUS_PENDING = 'pending'
    STATUS_APPROVED = 'approved'
    STATUS_REJECTED = 'rejected'
    
    @staticmethod
    def create(data):
        """
        Create new comment
        
        Args:
            data: dict with comment information
            
        Returns:
            str: Inserted comment ID
        """
        db = get_db()
        
        comment_data = {
            'name': data.get('name'),
            'email': data.get('email'),
            'comment_text': data.get('comment_text'),
            'status': Comment.STATUS_PENDING,
            'created_at': datetime.utcnow(),
            'reviewed_at': None,
            'reviewed_by': None
        }
        
        result = db[Comment.collection_name].insert_one(comment_data)
        logger.info(f"Created comment: {result.inserted_id}")
        
        return str(result.inserted_id)
    
    @staticmethod
    def get_all(status=None, skip=0, limit=50):
        """
        Get all comments
        
        Args:
            status: Filter by status (pending, approved, rejected)
            skip: Number of documents to skip
            limit: Maximum number of documents to return
            
        Returns:
            list: Comment documents
        """
        db = get_db()
        
        query = {}
        if status:
            query['status'] = status
        
        comments = list(db[Comment.collection_name]
                       .find(query)
                       .sort('created_at', -1)
                       .skip(skip)
                       .limit(limit))
        
        # Convert ObjectId to string
        for comment in comments:
            comment['_id'] = str(comment['_id'])
        
        return comments
    
    @staticmethod
    def get_approved(skip=0, limit=50):
        """
        Get approved comments only
        
        Args:
            skip: Number of documents to skip
            limit: Maximum number of documents to return
            
        Returns:
            list: Approved comment documents
        """
        return Comment.get_all(status=Comment.STATUS_APPROVED, skip=skip, limit=limit)
    
    @staticmethod
    def get_pending(skip=0, limit=50):
        """
        Get pending comments for admin review
        
        Args:
            skip: Number of documents to skip
            limit: Maximum number of documents to return
            
        Returns:
            list: Pending comment documents
        """
        return Comment.get_all(status=Comment.STATUS_PENDING, skip=skip, limit=limit)
    
    @staticmethod
    def get_by_id(comment_id):
        """
        Get comment by ID
        
        Args:
            comment_id: Comment document ID
            
        Returns:
            dict: Comment document or None
        """
        db = get_db()
        
        try:
            comment = db[Comment.collection_name].find_one({'_id': ObjectId(comment_id)})
            
            if comment:
                comment['_id'] = str(comment['_id'])
            
            return comment
            
        except Exception as e:
            logger.error(f"Error getting comment {comment_id}: {str(e)}")
            return None
    
    @staticmethod
    def approve(comment_id, admin_username):
        """
        Approve comment
        
        Args:
            comment_id: Comment document ID
            admin_username: Username of admin approving
            
        Returns:
            bool: True if successful
        """
        db = get_db()
        
        try:
            result = db[Comment.collection_name].update_one(
                {'_id': ObjectId(comment_id)},
                {'$set': {
                    'status': Comment.STATUS_APPROVED,
                    'reviewed_at': datetime.utcnow(),
                    'reviewed_by': admin_username
                }}
            )
            
            logger.info(f"Approved comment {comment_id} by {admin_username}")
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error approving comment {comment_id}: {str(e)}")
            return False
    
    @staticmethod
    def reject(comment_id, admin_username):
        """
        Reject comment (marks as rejected, can be deleted later)
        
        Args:
            comment_id: Comment document ID
            admin_username: Username of admin rejecting
            
        Returns:
            bool: True if successful
        """
        db = get_db()
        
        try:
            result = db[Comment.collection_name].update_one(
                {'_id': ObjectId(comment_id)},
                {'$set': {
                    'status': Comment.STATUS_REJECTED,
                    'reviewed_at': datetime.utcnow(),
                    'reviewed_by': admin_username
                }}
            )
            
            logger.info(f"Rejected comment {comment_id} by {admin_username}")
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error rejecting comment {comment_id}: {str(e)}")
            return False
    
    @staticmethod
    def delete(comment_id):
        """
        Permanently delete comment
        
        Args:
            comment_id: Comment document ID
            
        Returns:
            bool: True if successful
        """
        db = get_db()
        
        try:
            result = db[Comment.collection_name].delete_one({'_id': ObjectId(comment_id)})
            
            logger.info(f"Deleted comment {comment_id}")
            return result.deleted_count > 0
            
        except Exception as e:
            logger.error(f"Error deleting comment {comment_id}: {str(e)}")
            return False
    
    @staticmethod
    def count(status=None):
        """
        Count comments
        
        Args:
            status: Filter by status
            
        Returns:
            int: Total count
        """
        db = get_db()
        query = {'status': status} if status else {}
        return db[Comment.collection_name].count_documents(query)
