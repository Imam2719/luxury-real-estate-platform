# bookings/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet

# Router setup
router = DefaultRouter()
router.register(r'', BookingViewSet, basename='booking')  # '' means /api/bookings/

urlpatterns = [
    # Main CRUD routes (list, create, retrieve, update, delete)
    path('', include(router.urls)),

    # Extra action: Admin can update booking status (confirm/cancel/paid)
    # URL: PATCH /api/bookings/5/update-status/
    path('<int:pk>/update-status/', 
         BookingViewSet.as_view({'patch': 'update_status'}), 
         name='booking-update-status'),
]