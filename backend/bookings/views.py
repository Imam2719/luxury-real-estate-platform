# bookings/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db import transaction
from django.db.models import Q
from .models import Booking
from .serializers import BookingSerializer, BookingListSerializer
from properties.models import Property

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().select_related('property', 'user')
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Booking.objects.all().select_related('property', 'user')
        return Booking.objects.filter(user=self.request.user).select_related('property')

    def get_serializer_class(self):
        if self.action == 'list':
            return BookingListSerializer
        return BookingSerializer

    # THIS IS THE MAIN FIX - Concurrency Safe Create
    @transaction.atomic
    def perform_create(self, serializer):
        property_obj = serializer.validated_data['property']
        visit_date = serializer.validated_data['visit_date']

        # Lock the Property row + related bookings to prevent race condition
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

        # All good — save booking
        serializer.save(user=self.request.user, status='pending')

    # Admin can confirm/cancel
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def update_status(self, request, pk=None):
        booking = self.get_object()
        new_status = request.data.get('status')

        if new_status not in ['confirmed', 'canceled', 'paid']:
            return Response({"error": "Invalid status"}, status=400)

        booking.status = new_status
        booking.save()
        return Response({"success": True, "status": new_status})