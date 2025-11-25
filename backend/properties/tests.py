from django.test import TestCase
from django.contrib.auth import get_user_model
from properties.models import Category, Property
from services.property_service import PropertyService

User = get_user_model()


class PropertyServiceTestCase(TestCase):
    """Test Property Service DFS Algorithm"""
    
    def setUp(self):
        # Create test categories
        self.residential = Category.objects.create(name='Residential')
        self.apartments = Category.objects.create(name='Apartments', parent=self.residential)
        self.luxury = Category.objects.create(name='Luxury', parent=self.apartments)
        
        # Create test property
        self.property = Property.objects.create(
            name='Test Villa',
            description='Test',
            location='Test',
            price=1000000,
            bedrooms=3,
            bathrooms=2,
            status='active',
            category=self.luxury
        )
    
    def test_dfs_category_traversal(self):
        """Test DFS algorithm gets all descendant categories"""
        category_ids = PropertyService._dfs_get_all_category_ids(self.residential.id)
        
        # Should include Residential, Apartments, and Luxury
        self.assertEqual(len(category_ids), 3)
        self.assertIn(self.residential.id, category_ids)
        self.assertIn(self.apartments.id, category_ids)
        self.assertIn(self.luxury.id, category_ids)
    
    def test_get_properties_by_category(self):
        """Test getting properties by category"""
        properties = PropertyService.get_properties_by_category(self.residential.id)
        
        # Should find the property in Luxury subcategory
        self.assertEqual(properties.count(), 1)
        self.assertEqual(properties.first().name, 'Test Villa')