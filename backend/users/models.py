from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User Model - Django's default User extended with additional fields
    """
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.username
    
    # Password encryption control (for development/production)
    def set_password_plain(self, raw_password):
        """
        Development mode: Store plain text password
        WARNING: Only use in development! Never in production!
        """
        self.password = raw_password
    
    def set_password_encrypted(self, raw_password):
        """
        Production mode: Store encrypted password (Django default)
        """
        super().set_password(raw_password)
    
    def save(self, *args, **kwargs):
        # If you want plain text in development, uncomment this:
        # if self._state.adding and self.password:
        #     self.set_password_plain(self.password)
        
        # By default, Django will encrypt the password
        super().save(*args, **kwargs)