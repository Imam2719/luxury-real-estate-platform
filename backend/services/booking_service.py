from decimal import Decimal
from django.db import transaction
from bookings.models import Booking
from properties.models import Property
from services.property_service import PropertyService


class BookingService:
    """
    Booking Service - Business logic for bookings
    Handles calculations and availability checking
    """
    
    @staticmethod
    def calculate_totals(property_price, discount=0):
        """
        Calculate booking totals
        
        Args:
            property_price (Decimal): Base price
            discount (float): Discount percentage (0-100)
        
        Returns:
            dict: {subtotal, discount_amount, total}
        """
        subtotal = Decimal(str(property_price))
        discount_decimal = Decimal(str(discount))
        
        discount_amount = (subtotal * discount_decimal) / Decimal('100')
        total = subtotal - discount_amount
        
        return {
            'subtotal': subtotal,
            'discount_amount': discount_amount,
            'total': total
        }
    
    @staticmethod
    @transaction.atomic
    def create_booking(user, property_id, booking_date, visit_date=None, discount=0, notes=''):
        """
        Create a booking with availability check
        Uses database transaction for data integrity
        
        Args:
            user: User instance
            property_id: Property ID
            booking_date: DateTime for booking
            visit_date: Date for property visit
            discount: Discount percentage
            notes: Additional notes
        
        Returns:
            Booking instance
        
        Raises:
            ValueError: If property not available
        """
        # Check availability
        if not PropertyService.check_availability(property_id, booking_date):
            raise ValueError("Property is not available on this date")
        
        # Get property
        try:
            property_obj = Property.objects.get(id=property_id)
        except Property.DoesNotExist:
            raise ValueError("Property not found")
        
        # Calculate totals
        totals = BookingService.calculate_totals(property_obj.price, discount)
        
        # Create booking
        booking = Booking.objects.create(
            user=user,
            property=property_obj,
            booking_date=booking_date,
            visit_date=visit_date,
            discount=Decimal(str(discount)),
            subtotal=totals['subtotal'],
            total_amount=totals['total'],
            status='pending',
            notes=notes
        )
        
        return booking
    
    @staticmethod
    def cancel_booking(booking_id, user):
        """
        Cancel a booking
        Only pending bookings can be canceled
        """
        try:
            booking = Booking.objects.get(id=booking_id, user=user)
        except Booking.DoesNotExist:
            raise ValueError("Booking not found")
        
        if booking.status == 'paid':
            raise ValueError("Cannot cancel paid booking. Request refund instead.")
        
        if booking.status == 'canceled':
            raise ValueError("Booking already canceled")
        
        booking.status = 'canceled'
        booking.save()
        
        return booking