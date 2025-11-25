from django.test import TestCase
from django.contrib.auth import get_user_model
from properties.models import Category, Property
from services.booking_service import BookingService
from decimal import Decimal
from datetime import datetime

User = get_user_model()


class BookingServiceTestCase(TestCase):
    """Test Booking Service Calculations"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='test', password='test123')
        self.category = Category.objects.create(name='Test')
        self.property = Property.objects.create(
            name='Test Property',
            description='Test',
            location='Test',
            price=Decimal('100000'),
            bedrooms=3,
            bathrooms=2,
            status='active',
            category=self.category
        )
    
    def test_calculate_totals_no_discount(self):
        """Test calculation without discount"""
        result = BookingService.calculate_totals(100000, discount=0)
        
        self.assertEqual(result['subtotal'], Decimal('100000'))
        self.assertEqual(result['discount_amount'], Decimal('0'))
        self.assertEqual(result['total'], Decimal('100000'))
    
    def test_calculate_totals_with_discount(self):
        """Test calculation with 10% discount"""
        result = BookingService.calculate_totals(100000, discount=10)
        
        self.assertEqual(result['subtotal'], Decimal('100000'))
        self.assertEqual(result['discount_amount'], Decimal('10000'))
        self.assertEqual(result['total'], Decimal('90000'))
    
    def test_create_booking(self):
        """Test booking creation"""
        booking = BookingService.create_booking(
            user=self.user,
            property_id=self.property.id,
            booking_date=datetime.now(),
            discount=10
        )
        
        self.assertEqual(booking.user, self.user)
        self.assertEqual(booking.property, self.property)
        self.assertEqual(booking.total_amount, Decimal('90000'))
        self.assertEqual(booking.status, 'pending')