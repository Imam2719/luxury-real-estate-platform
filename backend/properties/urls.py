from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, PropertyViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('', PropertyViewSet, basename='property')

urlpatterns = [
    path('', include(router.urls)),
]