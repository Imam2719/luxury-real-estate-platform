from rest_framework import serializers
from .models import Category, Property


class CategorySerializer(serializers.ModelSerializer):
    """Category Serializer with children"""
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent', 'description', 'children', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']
    
    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.all(), many=True).data
        return []


class PropertyListSerializer(serializers.ModelSerializer):
    """Property List Serializer (lightweight)"""
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = Property
        fields = ['id', 'name', 'slug', 'location', 'price', 'bedrooms', 'bathrooms', 
                  'status', 'category', 'image', 'featured', 'created_at']


class PropertyDetailSerializer(serializers.ModelSerializer):
    """Property Detail Serializer (complete data)"""
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class PropertyCreateUpdateSerializer(serializers.ModelSerializer):
    """Property Create/Update Serializer"""
    class Meta:
        model = Property
        fields = ['name', 'description', 'location', 'price', 'bedrooms', 'bathrooms', 
                  'square_feet', 'amenities', 'status', 'category', 'image', 'featured']