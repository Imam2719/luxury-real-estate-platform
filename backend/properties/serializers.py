from rest_framework import serializers
from .models import Category, Property


class CategorySerializer(serializers.ModelSerializer):
    """Category Serializer with children (Fixed - prevents infinite recursion)"""
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent', 'description', 'children', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']
    
    def get_children(self, obj):
        """
        Get child categories - Uses depth parameter to limit recursion
        """
        # Check if we're already at max depth to prevent infinite recursion
        request = self.context.get('request')
        depth = self.context.get('depth', 0)
        
        # Limit recursion to 3 levels deep
        if depth >= 3:
            return []
        
        if obj.children.exists():
            # Pass increased depth to child serializer
            serializer = CategorySerializer(
                obj.children.all(), 
                many=True,
                context={
                    **self.context,
                    'depth': depth + 1
                }
            )
            return serializer.data
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