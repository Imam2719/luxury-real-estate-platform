from django.contrib import admin
from .models import Category, Property


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'slug', 'created_at']
    list_filter = ['parent']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'status', 'bedrooms', 'bathrooms', 'featured', 'created_at']
    list_filter = ['status', 'category', 'featured']
    search_fields = ['name', 'location']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['status', 'featured']