from rest_framework import serializers
from .models import Booking
from properties.serializers import PropertyListSerializer
from users.serializers import UserSerializer
from datetime import datetime


class BookingCreateSerializer(serializers.ModelSerializer):
    """Booking Creation Serializer"""
    booking_date = serializers.DateTimeField(required=False)  # 🔥 Optional করো
    
    class Meta:
        model = Booking
        fields = ['property', 'booking_date', 'visit_date', 'discount', 'notes']
    
    def create(self, validated_data):
        # 🔥 Auto-set booking_date if not provided
        if 'booking_date' not in validated_data:
            validated_data['booking_date'] = datetime.now()
        
        # User will be set in the view
        booking = Booking.objects.create(**validated_data)
        booking.calculate_totals()
        booking.save()
        return booking


class BookingSerializer(serializers.ModelSerializer):
    """Booking Detail Serializer"""
    user = UserSerializer(read_only=True)
    property = PropertyListSerializer(read_only=True)
    property_name = serializers.CharField(source='property.name', read_only=True)
    property_location = serializers.CharField(source='property.location', read_only=True)
    
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['id', 'user', 'subtotal', 'total_amount', 'created_at', 'updated_at']


class BookingListSerializer(serializers.ModelSerializer):
    """Booking List Serializer (lightweight)"""
    property_name = serializers.CharField(source='property.name', read_only=True)
    property_location = serializers.CharField(source='property.location', read_only=True)
    
    class Meta:
        model = Booking
        fields = ['id', 'property', 'property_name', 'property_location', 'status', 
                  'total_amount', 'booking_date', 'visit_date', 'created_at']