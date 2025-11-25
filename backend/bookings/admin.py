from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'property', 'status', 'total_amount', 'booking_date', 'created_at']
    list_filter = ['status', 'booking_date']
    search_fields = ['user__username', 'property__name']
    list_editable = ['status']
    readonly_fields = ['subtotal', 'total_amount']