# backend/services/tests.py (তোমার existing file এ add করো)

from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from properties.models import Property, Category
from services.property_service import PropertyService
from datetime import date, timedelta
import threading

User = get_user_model()

class AvailabilityTestCase(TransactionTestCase):
    """Test availability checking with concurrency"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='test123')
        self.category = Category.objects.create(name='Test', slug='test')
        self.property = Property.objects.create(
            name='Test Property',
            slug='test-property',
            category=self.category,
            price=1000000,
            bedrooms=3,
            bathrooms=2,
            status='active'
        )
        self.visit_date = date.today() + timedelta(days=7)
    
    def test_availability_check(self):
        """Test basic availability check"""
        is_available = PropertyService.check_availability(
            self.property.id,
            self.visit_date
        )
        self.assertTrue(is_available)
    
    def test_unavailable_after_booking(self):
        """Test property becomes unavailable after booking"""
        # Create booking
        from services.booking_service import BookingService
        booking = BookingService.create_booking(
            user=self.user,
            property_id=self.property.id,
            booking_date=date.today(),
            visit_date=self.visit_date
        )
        booking.status = 'confirmed'
        booking.save()
        
        # Check availability
        is_available = PropertyService.check_availability(
            self.property.id,
            self.visit_date
        )
        self.assertFalse(is_available)