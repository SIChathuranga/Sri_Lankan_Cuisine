import cloudinary
import cloudinary.uploader
import cloudinary.api
from config import Config
import logging

logger = logging.getLogger(__name__)

class CloudinaryHelper:
    """Cloudinary image management helper"""
    
    _initialized = False
    
    @classmethod
    def initialize(cls):
        """Initialize Cloudinary configuration"""
        if not cls._initialized:
            cloudinary.config(
                cloud_name=Config.CLOUDINARY_CLOUD_NAME,
                api_key=Config.CLOUDINARY_API_KEY,
                api_secret=Config.CLOUDINARY_API_SECRET,
                secure=True
            )
            cls._initialized = True
            logger.info("Cloudinary initialized successfully")
    
    @classmethod
    def upload_image(cls, file, folder="sri_lankan_cuisine"):
        """
        Upload image to Cloudinary
        
        Args:
            file: File object or file path
            folder: Cloudinary folder name
            
        Returns:
            dict: Upload result with url and public_id
        """
        cls.initialize()
        
        try:
            result = cloudinary.uploader.upload(
                file,
                folder=folder,
                transformation=[
                    {'width': 1200, 'height': 800, 'crop': 'limit'},
                    {'quality': 'auto:good'},
                    {'fetch_format': 'auto'}
                ],
                allowed_formats=['jpg', 'jpeg', 'png', 'gif', 'webp']
            )
            
            return {
                'url': result['secure_url'],
                'public_id': result['public_id'],
                'width': result.get('width'),
                'height': result.get('height'),
                'format': result.get('format')
            }
            
        except Exception as e:
            logger.error(f"Cloudinary upload error: {str(e)}")
            raise
    
    @classmethod
    def delete_image(cls, public_id):
        """
        Delete image from Cloudinary
        
        Args:
            public_id: Cloudinary public ID
            
        Returns:
            bool: True if successful
        """
        cls.initialize()
        
        try:
            result = cloudinary.uploader.destroy(public_id)
            return result.get('result') == 'ok'
            
        except Exception as e:
            logger.error(f"Cloudinary delete error: {str(e)}")
            return False
    
    @classmethod
    def get_optimized_url(cls, public_id, width=None, height=None):
        """
        Get optimized image URL with transformations
        
        Args:
            public_id: Cloudinary public ID
            width: Target width
            height: Target height
            
        Returns:
            str: Optimized image URL
        """
        cls.initialize()
        
        transformation = []
        
        if width or height:
            transform = {'crop': 'fill'}
            if width:
                transform['width'] = width
            if height:
                transform['height'] = height
            transformation.append(transform)
        
        transformation.extend([
            {'quality': 'auto:good'},
            {'fetch_format': 'auto'}
        ])
        
        return cloudinary.CloudinaryImage(public_id).build_url(
            transformation=transformation,
            secure=True
        )

# Convenience functions
def upload_image(file, folder="sri_lankan_cuisine"):
    """Upload image to Cloudinary"""
    return CloudinaryHelper.upload_image(file, folder)

def delete_image(public_id):
    """Delete image from Cloudinary"""
    return CloudinaryHelper.delete_image(public_id)

def get_optimized_url(public_id, width=None, height=None):
    """Get optimized image URL"""
    return CloudinaryHelper.get_optimized_url(public_id, width, height)
