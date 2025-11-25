from django.db import models
from django.conf import settings
from properties.models import Property


class Booking(models.Model):
    """
    Booking Model - Property visit/purchase bookings
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('paid', 'Paid'),
        ('canceled', 'Canceled'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='bookings')
    booking_date = models.DateTimeField()
    visit_date = models.DateField(null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bookings'
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['booking_date']),
        ]
    
    def __str__(self):
        return f"Booking #{self.id} - {self.user.username} - {self.property.name}"
    
    def calculate_totals(self):
        """Calculate subtotal and total with discount"""
        self.subtotal = self.property.price
        discount_amount = (self.subtotal * self.discount) / 100
        self.total_amount = self.subtotal - discount_amount
    
    def save(self, *args, **kwargs):
        if not self.pk:  # Only on creation
            self.calculate_totals()
        super().save(*args, **kwargs)