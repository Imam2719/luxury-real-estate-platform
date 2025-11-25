from django.contrib.auth import get_user_model

User = get_user_model()


class UserService:
    """
    User Service - Business logic for users
    """
    
    @staticmethod
    def get_user_booking_history(user):
        """Get user's booking history with details"""
        return user.bookings.all().select_related('property', 'payment')
    
    @staticmethod
    def get_user_payment_history(user):
        """Get user's payment history"""
        from payments.models import Payment
        return Payment.objects.filter(booking__user=user).select_related('booking', 'booking__property')