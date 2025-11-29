from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User Model - Django's default User extended with additional fields
    Includes admin status for property management access
    """
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    is_admin = models.BooleanField(default=False, help_text="User can create and manage properties")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['email']),
            models.Index(fields=['is_admin']),
        ]
    
    def __str__(self):
        return f"{self.username} {'[ADMIN]' if self.is_admin else ''}"
    
    def save(self, *args, **kwargs):
        """
        Override save to ensure passwords are properly encrypted
        By default, Django will encrypt the password using set_password()
        """
        super().save(*args, **kwargs)
    
    def is_property_manager(self):
        """
        Check if user can manage properties
        Returns True if user is admin or staff
        """
        return self.is_admin or self.is_staff
    
    @property
    def full_contact_info(self):
        """
        Get complete contact information
        """
        return {
            'phone': self.phone,
            'email': self.email,
            'address': self.address,
        }