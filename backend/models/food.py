from datetime import datetime
from bson import ObjectId
from utils.db import get_db
import logging

logger = logging.getLogger(__name__)

class Food:
    """Food model for managing food articles"""
    
    collection_name = 'foods'
    
    @staticmethod
    def create(data):
        """
        Create new food article
        
        Args:
            data: dict with food information
            
        Returns:
            str: Inserted food ID
        """
        db = get_db()
        
        food_data = {
            'title': data.get('title'),
            'description': data.get('description'),
            'image_url': data.get('image_url'),
            'image_public_id': data.get('image_public_id'),
            'ingredients': data.get('ingredients', []),
            'instructions': data.get('instructions', ''),
            'category': data.get('category', 'General'),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'is_active': data.get('is_active', True)
        }
        
        result = db[Food.collection_name].insert_one(food_data)
        logger.info(f"Created food: {result.inserted_id}")
        
        return str(result.inserted_id)
    
    @staticmethod
    def get_all(active_only=True, skip=0, limit=9):
        """
        Get all food articles
        
        Args:
            active_only: Only return active foods
            skip: Number of documents to skip
            limit: Maximum number of documents to return
            
        Returns:
            list: Food documents
        """
        db = get_db()
        
        query = {'is_active': True} if active_only else {}
        
        foods = list(db[Food.collection_name]
                    .find(query)
                    .sort('created_at', -1)
                    .skip(skip)
                    .limit(limit))
        
        # Convert ObjectId to string
        for food in foods:
            food['_id'] = str(food['_id'])
        
        return foods
    
    @staticmethod
    def get_by_id(food_id):
        """
        Get food by ID
        
        Args:
            food_id: Food document ID
            
        Returns:
            dict: Food document or None
        """
        db = get_db()
        
        try:
            food = db[Food.collection_name].find_one({'_id': ObjectId(food_id)})
            
            if food:
                food['_id'] = str(food['_id'])
            
            return food
            
        except Exception as e:
            logger.error(f"Error getting food {food_id}: {str(e)}")
            return None
    
    @staticmethod
    def update(food_id, data):
        """
        Update food article
        
        Args:
            food_id: Food document ID
            data: Updated food data
            
        Returns:
            bool: True if successful
        """
        db = get_db()
        
        try:
            update_data = {
                'updated_at': datetime.utcnow()
            }
            
            # Only update provided fields
            allowed_fields = ['title', 'description', 'image_url', 'image_public_id', 
                            'ingredients', 'instructions', 'category', 'is_active']
            
            for field in allowed_fields:
                if field in data:
                    update_data[field] = data[field]
            
            result = db[Food.collection_name].update_one(
                {'_id': ObjectId(food_id)},
                {'$set': update_data}
            )
            
            logger.info(f"Updated food {food_id}: {result.modified_count} documents")
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error updating food {food_id}: {str(e)}")
            return False
    
    @staticmethod
    def delete(food_id):
        """
        Delete food article (soft delete by setting is_active to False)
        
        Args:
            food_id: Food document ID
            
        Returns:
            bool: True if successful
        """
        db = get_db()
        
        try:
            result = db[Food.collection_name].update_one(
                {'_id': ObjectId(food_id)},
                {'$set': {'is_active': False, 'updated_at': datetime.utcnow()}}
            )
            
            logger.info(f"Deleted food {food_id}")
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error deleting food {food_id}: {str(e)}")
            return False
    
    @staticmethod
    def count(active_only=True):
        """
        Count total food articles
        
        Args:
            active_only: Only count active foods
            
        Returns:
            int: Total count
        """
        db = get_db()
        query = {'is_active': True} if active_only else {}
        return db[Food.collection_name].count_documents(query)
    
    @staticmethod
    def search(query_text, skip=0, limit=9):
        """
        Search foods by title or description
        
        Args:
            query_text: Search query
            skip: Number of documents to skip
            limit: Maximum number of documents to return
            
        Returns:
            list: Matching food documents
        """
        db = get_db()
        
        query = {
            'is_active': True,
            '$or': [
                {'title': {'$regex': query_text, '$options': 'i'}},
                {'description': {'$regex': query_text, '$options': 'i'}},
                {'category': {'$regex': query_text, '$options': 'i'}}
            ]
        }
        
        foods = list(db[Food.collection_name]
                    .find(query)
                    .sort('created_at', -1)
                    .skip(skip)
                    .limit(limit))
        
        for food in foods:
            food['_id'] = str(food['_id'])
        
        return foods
