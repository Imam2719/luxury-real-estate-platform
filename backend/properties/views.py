# properties/views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.conf import settings
from django.core.cache import cache
from .models import Property
from .serializers import PropertySerializer, PropertyDetailSerializer

class PropertyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Property.objects.filter(status='active').select_related('category').prefetch_related('amenities')
    serializer_class = PropertySerializer

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PropertyDetailSerializer
        return PropertySerializer

    # 1. List view - Full page caching (15 min)
    @method_decorator(cache_page(settings.CACHE_TTL))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    # 2. Single property detail - Cache per property
    def retrieve(self, request, *args, **kwargs):
        property_slug = kwargs.get('pk')  # assuming slug
        cache_key = f"property_detail_{property_slug}"
        
        # Try to get from cache
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)

        # Not in cache → get from DB
        response = super().retrieve(request, *args, **kwargs)
        
        # Save to cache for next time
        cache.set(cache_key, response.data, settings.CACHE_TTL)
        return response

    # 3. DFS Recommendations - Manual caching
    @action(detail=True, methods=['get'])
    def recommendations(self, request, pk=None):
        property = self.get_object()
        cache_key = f"recommendations_{property.slug}"

        # Check cache first
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        # DFS Algorithm (tor existing code)
        visited = set()
        recommendations = []

        def dfs(category, depth=0):
            if depth > 3 or category in visited:
                return
            visited.add(category)

            # Same category properties
            props = Property.objects.filter(
                category=category,
                status='active'
            ).exclude(id=property.id)[:4]

            for prop in props:
                if prop not in recommendations:
                    recommendations.append(prop)

            # Go to parent
            if category.parent and category.parent not in visited:
                dfs(category.parent, depth + 1)

            # Go to children
            for child in category.children.all():
                if child not in visited:
                    dfs(child, depth + 1)

        if property.category:
            dfs(property.category)

        serializer = PropertySerializer(recommendations[:8], many=True, context={'request': request})
        result = serializer.data

        # Cache for 15 minutes
        cache.set(cache_key, result, settings.CACHE_TTL)

        return Response(result)