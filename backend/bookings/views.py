# backend/bookings/views.py - COMPLETE CORRECTED VERSION

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db import transaction
from django.db.models import Q
from .models import Booking
from .serializers import BookingSerializer, BookingListSerializer, BookingCreateSerializer
from properties.models import Property


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().select_related('property', 'user')
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter bookings based on user role"""
        if self.request.user.is_staff:
            return Booking.objects.all().select_related('property', 'user')
        return Booking.objects.filter(user=self.request.user).select_related('property')

    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return BookingListSerializer
        elif self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer

    # ✅ CREATE BOOKING - Concurrency safe
    @transaction.atomic
    def perform_create(self, serializer):
        """Override create to ensure user is set and check availability"""
        property_obj = serializer.validated_data.get('property')
        visit_date = serializer.validated_data.get('visit_date')

        # ✅ Lock the Property row to prevent race conditions
        Property.objects.select_for_update().get(pk=property_obj.pk)

        # Check if same date already booked
        conflicting_booking = Booking.objects.filter(
            property=property_obj,
            visit_date=visit_date,
            status__in=['pending', 'confirmed', 'paid']
        ).exists()

        if conflicting_booking:
            raise serializer.ValidationError({
                "visit_date": "This date is already booked! Please choose another date."
            })

        # ✅ Automatically set user to current authenticated user
        serializer.save(user=self.request.user, status='pending')

    # ✅ ADMIN UPDATE STATUS
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def update_status(self, request, pk=None):
        """Admin only: update booking status"""
        booking = self.get_object()
        new_status = request.data.get('status')

        if new_status not in ['confirmed', 'canceled', 'paid']:
            return Response({"error": "Invalid status"}, status=400)

        booking.status = new_status
        booking.save()
        return Response({"success": True, "status": new_status})

    # ✅ CANCEL BOOKING
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel(self, request, pk=None):
        """User: cancel their own booking"""
        booking = self.get_object()
        
        # ✅ Ensure user can only cancel their own bookings
        if booking.user != request.user and not request.user.is_staff:
            return Response(
                {"error": "You can only cancel your own bookings"},
                status=status.HTTP_403_FORBIDDEN
            )

        if booking.status == 'paid':
            return Response(
                {"error": "Cannot cancel paid booking. Request refund instead."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if booking.status == 'canceled':
            return Response(
                {"error": "Booking already canceled"},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = 'canceled'
        booking.save()
        
        return Response({"success": True, "message": "Booking canceled"})