from rest_framework import serializers
from .models import Payment
from bookings.serializers import BookingSerializer


class PaymentSerializer(serializers.ModelSerializer):
    """Payment Serializer"""
    booking = BookingSerializer(read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'transaction_id', 'created_at', 'updated_at']


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Payment Creation Serializer"""
    class Meta:
        model = Payment
        fields = ['booking', 'provider', 'amount', 'currency']