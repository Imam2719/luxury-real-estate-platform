from django.core.management.base import BaseCommand
from properties.models import Category, Property
from decimal import Decimal

class Command(BaseCommand):
    help = 'Create sample properties'

    def handle(self, *args, **kwargs):
        residential = Category.objects.get_or_create(
            name='Residential', 
            defaults={'slug': 'residential'}
        )[0]
        
        luxury = Category.objects.get_or_create(
            name='Luxury',
            defaults={'slug': 'luxury', 'parent': residential}
        )[0]
        
        Property.objects.get_or_create(
            slug='sky-tower-penthouse',
            defaults={
                'name': 'Sky Tower Penthouse',
                'description': 'Luxury penthouse with stunning views',
                'location': 'New York City, USA',
                'price': Decimal('5000000'),
                'bedrooms': 4,
                'bathrooms': 3,
                'square_feet': 3500,
                'amenities': ['Pool', 'Gym', 'Parking'],
                'status': 'active',
                'category': luxury,
                'featured': True
            }
        )
        
        Property.objects.get_or_create(
            slug='ocean-villa',
            defaults={
                'name': 'Ocean View Villa',
                'description': 'Beachfront villa',
                'location': 'Miami, Florida',
                'price': Decimal('3500000'),
                'bedrooms': 5,
                'bathrooms': 4,
                'square_feet': 4200,
                'amenities': ['Beach', 'Pool'],
                'status': 'active',
                'category': luxury,
                'featured': True
            }
        )
        
        self.stdout.write(self.style.SUCCESS('✅ Sample data created!'))