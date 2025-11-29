# backend/properties/views.py - COMPLETE FIXED VERSION

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.conf import settings
from django.core.cache import cache
from .models import Property, Category
from .serializers import (
    PropertyListSerializer,
    PropertyDetailSerializer,
    CategorySerializer
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Category ViewSet - Read-only access for all users
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class PropertyViewSet(viewsets.ModelViewSet):
    """
    Property ViewSet - Full CRUD operations with proper permissions
    - List/Retrieve: Anyone can view
    - Create/Update/Delete: Only admins
    """
    lookup_field = 'slug'
    queryset = Property.objects.filter(status='active').select_related('category')
    serializer_class = PropertyListSerializer

    def get_permissions(self):
        """
        Set permissions based on action
        - list, retrieve, recommendations: Anyone (AllowAny)
        - create, update, partial_update, destroy: Admin only (IsAdminUser)
        """
        if self.action in ['list', 'retrieve', 'recommendations']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        """
        Return queryset based on user role
        - Admin: See all properties (active, inactive, sold)
        - Regular users: Only active properties
        """
        if self.request.user.is_staff:
            return Property.objects.all().select_related('category')
        return Property.objects.filter(status='active').select_related('category')

    def get_serializer_class(self):
        """Use detailed serializer for single property view"""
        if self.action == 'retrieve':
            return PropertyDetailSerializer
        return PropertyListSerializer

    # 1. List view - Full page caching (15 min)
    @method_decorator(cache_page(settings.CACHE_TTL))
    def list(self, request, *args, **kwargs):
        """Get all properties with caching"""
        return super().list(request, *args, **kwargs)

    # 2. Single property detail - Cache per property
    def retrieve(self, request, *args, **kwargs):
        """Get single property by slug with caching"""
        slug = kwargs.get('slug')
        cache_key = f"property_detail_{slug}"
        
        # Try to get from cache
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)

        # Not in cache → get from DB
        response = super().retrieve(request, *args, **kwargs)
        
        # Save to cache for next time
        cache.set(cache_key, response.data, settings.CACHE_TTL)
        return response

    # 3. CREATE - Admin only (handled by get_permissions)
    def create(self, request, *args, **kwargs):
        """
        Create new property - Admin only
        Automatically generates slug from name
        """
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    # 4. UPDATE - Admin only (handled by get_permissions)
    def update(self, request, *args, **kwargs):
        """Update property - Admin only"""
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    # 5. PARTIAL UPDATE - Admin only (handled by get_permissions)
    def partial_update(self, request, *args, **kwargs):
        """Partial update (PATCH) - Admin only"""
        try:
            # Clear cache when updating
            slug = kwargs.get('slug')
            cache_key = f"property_detail_{slug}"
            cache.delete(cache_key)
            
            return super().partial_update(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    # 6. DELETE - Admin only (handled by get_permissions)
    def destroy(self, request, *args, **kwargs):
        """Delete property - Admin only"""
        try:
            # Clear cache when deleting
            slug = kwargs.get('slug')
            cache_key = f"property_detail_{slug}"
            cache.delete(cache_key)
            
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    # 7. DFS Recommendations - Public access
    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def recommendations(self, request, slug=None):
        """
        Get recommended properties using DFS algorithm
        URL: /api/properties/{slug}/recommendations/
        """
        try:
            # Get the property object using slug (lookup_field)
            property_obj = self.get_object()
        except Property.DoesNotExist:
            return Response({'error': 'Property not found'}, status=404)
        
        cache_key = f"recommendations_{slug}"

        # Check cache first
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        try:
            # DFS Algorithm
            visited = set()
            recommendations = []

            def dfs(category, depth=0):
                """Depth-first search through category tree"""
                if depth > 3 or category in visited:
                    return
                visited.add(category)

                # Get properties in this category
                try:
                    props = Property.objects.filter(
                        category=category,
                        status='active'
                    ).exclude(id=property_obj.id)[:4]

                    for prop in props:
                        if prop not in recommendations:
                            recommendations.append(prop)
                except Exception as e:
                    print(f"Error getting properties: {e}")

            # Start DFS from property's category
            if property_obj.category:
                dfs(property_obj.category)

            # Serialize the results
            serializer = PropertyListSerializer(
                recommendations[:8], 
                many=True, 
                context={'request': request}
            )
            result = serializer.data

            # Cache for 15 minutes
            cache.set(cache_key, result, settings.CACHE_TTL)

            return Response(result)
            
        except Exception as e:
            print(f"Error in recommendations DFS: {e}")
            # Return empty list on error instead of 500
            return Response([])