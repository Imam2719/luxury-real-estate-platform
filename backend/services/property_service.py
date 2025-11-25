from django.core.cache import cache
from properties.models import Category, Property


class PropertyService:
    """
    Property Service - Business logic for properties
    Implements DFS algorithm for category recommendations
    """
    
    @staticmethod
    def get_properties_by_category(category_id):
        """
        Get all properties in a category including subcategories
        Uses DFS to traverse category tree
        """
        # Get category tree using DFS
        category_ids = PropertyService._dfs_get_all_category_ids(category_id)
        
        # Get all properties in these categories
        properties = Property.objects.filter(
            category_id__in=category_ids,
            status='active'
        )
        
        return properties
    
    @staticmethod
    def get_recommended_properties(category_id):
        """
        Get recommended properties based on category
        Uses cached category tree for performance
        """
        # Check cache first
        cache_key = f'category_tree_{category_id}'
        cached_ids = cache.get(cache_key)
        
        if cached_ids:
            print(f"✅ Cache HIT for category {category_id}")
            category_ids = cached_ids
        else:
            print(f"❌ Cache MISS for category {category_id}")
            # DFS traversal
            category_ids = PropertyService._dfs_get_all_category_ids(category_id)
            # Cache for 1 hour
            cache.set(cache_key, category_ids, 3600)
        
        # Get properties
        properties = Property.objects.filter(
            category_id__in=category_ids,
            status='active'
        ).order_by('-featured', '-created_at')
        
        return properties
    
    @staticmethod
    def _dfs_get_all_category_ids(category_id, visited=None):
        """
        Depth-First Search to get all descendant categories
        Algorithm: DFS traversal of category tree
        
        Time Complexity: O(n) where n is number of categories
        Space Complexity: O(h) where h is height of tree
        """
        if visited is None:
            visited = set()
        
        # Avoid infinite loops
        if category_id in visited:
            return []
        
        visited.add(category_id)
        result = [category_id]
        
        # Get all children
        try:
            category = Category.objects.get(id=category_id)
            children = category.children.all()
            
            # Recursively traverse children
            for child in children:
                result.extend(
                    PropertyService._dfs_get_all_category_ids(child.id, visited)
                )
        except Category.DoesNotExist:
            pass
        
        return result
    
    @staticmethod
    def check_availability(property_id, booking_date):
        """
        Check if property is available for booking on given date
        """
        from bookings.models import Booking
        from django.db.models import Q
        
        # Check for conflicting bookings
        conflicts = Booking.objects.filter(
            Q(property_id=property_id) &
            Q(booking_date=booking_date) &
            Q(status__in=['pending', 'confirmed', 'paid'])
        ).exists()
        
        return not conflicts