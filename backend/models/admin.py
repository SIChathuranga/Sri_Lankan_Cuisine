from datetime import datetime
from bson import ObjectId
from utils.db import get_db
from utils.auth import hash_password, verify_password
import logging

logger = logging.getLogger(__name__)

class Admin:
    """Admin model for managing admin users"""
    
    collection_name = 'admins'
    
    @staticmethod
    def create(username, password, email):
        """
        Create new admin user
        
        Args:
            username: Admin username
            password: Plain text password
            email: Admin email
            
        Returns:
            str: Inserted admin ID or None if username/email exists
        """
        db = get_db()
        
        # Check if username or email already exists
        existing = db[Admin.collection_name].find_one({
            '$or': [
                {'username': username},
                {'email': email}
            ]
        })
        
        if existing:
            logger.warning(f"Admin creation failed: username or email already exists")
            return None
        
        admin_data = {
            'username': username,
            'password_hash': hash_password(password),
            'email': email,
            'created_at': datetime.utcnow(),
            'last_login': None
        }
        
        result = db[Admin.collection_name].insert_one(admin_data)
        logger.info(f"Created admin: {result.inserted_id}")
        
        return str(result.inserted_id)
    
    @staticmethod
    def authenticate(username, password):
        """
        Authenticate admin user
        
        Args:
            username: Admin username
            password: Plain text password
            
        Returns:
            dict: Admin document (without password) or None
        """
        db = get_db()
        
        admin = db[Admin.collection_name].find_one({'username': username})
        
        if not admin:
            logger.warning(f"Authentication failed: username not found")
            return None
        
        if not verify_password(password, admin['password_hash']):
            logger.warning(f"Authentication failed: incorrect password")
            return None
        
        # Update last login
        db[Admin.collection_name].update_one(
            {'_id': admin['_id']},
            {'$set': {'last_login': datetime.utcnow()}}
        )
        
        # Remove password from response
        admin['_id'] = str(admin['_id'])
        del admin['password_hash']
        
        logger.info(f"Admin authenticated: {username}")
        return admin
    
    @staticmethod
    def get_by_username(username):
        """
        Get admin by username
        
        Args:
            username: Admin username
            
        Returns:
            dict: Admin document (without password) or None
        """
        db = get_db()
        
        admin = db[Admin.collection_name].find_one({'username': username})
        
        if admin:
            admin['_id'] = str(admin['_id'])
            del admin['password_hash']
        
        return admin
    
    @staticmethod
    def change_password(username, old_password, new_password):
        """
        Change admin password
        
        Args:
            username: Admin username
            old_password: Current password
            new_password: New password
            
        Returns:
            bool: True if successful
        """
        db = get_db()
        
        admin = db[Admin.collection_name].find_one({'username': username})
        
        if not admin:
            return False
        
        if not verify_password(old_password, admin['password_hash']):
            logger.warning(f"Password change failed: incorrect old password")
            return False
        
        result = db[Admin.collection_name].update_one(
            {'_id': admin['_id']},
            {'$set': {'password_hash': hash_password(new_password)}}
        )
        
        logger.info(f"Password changed for admin: {username}")
        return result.modified_count > 0
    
    @staticmethod
    def exists():
        """
        Check if any admin exists
        
        Returns:
            bool: True if at least one admin exists
        """
        db = get_db()
        return db[Admin.collection_name].count_documents({}) > 0
