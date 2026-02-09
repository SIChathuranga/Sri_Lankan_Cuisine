from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from config import Config
import logging

logger = logging.getLogger(__name__)

class Database:
    """MongoDB database connection manager"""
    
    _client = None
    _db = None
    
    @classmethod
    def initialize(cls):
        """Initialize database connection"""
        try:
            cls._client = MongoClient(
                Config.MONGODB_URI,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=10000
            )
            
            # Test connection
            cls._client.admin.command('ping')
            
            cls._db = cls._client[Config.MONGODB_DB_NAME]
            
            # Create indexes
            cls._create_indexes()
            
            logger.info(f"Connected to MongoDB: {Config.MONGODB_DB_NAME}")
            return True
            
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise
    
    @classmethod
    def _create_indexes(cls):
        """Create database indexes for performance"""
        try:
            # Food indexes
            cls._db.foods.create_index([("created_at", DESCENDING)])
            cls._db.foods.create_index([("is_active", ASCENDING)])
            cls._db.foods.create_index([("title", ASCENDING)])
            
            # Comment indexes
            cls._db.comments.create_index([("status", ASCENDING)])
            cls._db.comments.create_index([("created_at", DESCENDING)])
            cls._db.comments.create_index([("email", ASCENDING)])
            
            # Admin indexes
            cls._db.admins.create_index([("username", ASCENDING)], unique=True)
            cls._db.admins.create_index([("email", ASCENDING)], unique=True)
            
            logger.info("Database indexes created successfully")
            
        except Exception as e:
            logger.warning(f"Error creating indexes: {str(e)}")
    
    @classmethod
    def get_db(cls):
        """Get database instance"""
        if cls._db is None:
            cls.initialize()
        return cls._db
    
    @classmethod
    def close(cls):
        """Close database connection"""
        if cls._client:
            cls._client.close()
            logger.info("MongoDB connection closed")

# Convenience function
def get_db():
    """Get database instance"""
    return Database.get_db()
