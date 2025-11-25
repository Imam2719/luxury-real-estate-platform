from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from properties.models import Category, Property
from decimal import Decimal

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed database with sample data'
    
    def handle(self, *args, **kwargs):
        self.stdout.write('🌱 Seeding database...')
        
        # Create admin user
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123',
                is_admin=True
            )
            self.stdout.write('✅ Admin user created')
        
        # Create test user
        if not User.objects.filter(username='testuser').exists():
            User.objects.create_user(
                username='testuser',
                email='test@example.com',
                password='test123',
                phone='01712345678',
                address='Dhaka, Bangladesh'
            )
            self.stdout.write('✅ Test user created')
        
        # Create categories
        categories = [
            {'name': 'Residential', 'parent': None},
            {'name': 'Commercial', 'parent': None},
            {'name': 'Luxury Apartments', 'parent': 'Residential'},
            {'name': 'Villas', 'parent': 'Residential'},
            {'name': 'Penthouses', 'parent': 'Luxury Apartments'},
            {'name': 'Office Spaces', 'parent': 'Commercial'},
            {'name': 'Retail Shops', 'parent': 'Commercial'},
        ]
        
        created_categories = {}
        for cat_data in categories:
            parent = None
            if cat_data['parent']:
                parent = created_categories.get(cat_data['parent'])
            
            cat, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={'parent': parent}
            )
            created_categories[cat_data['name']] = cat
            
            if created:
                self.stdout.write(f'✅ Category created: {cat.name}')
        
        # Create properties
        properties = [
            {
                'name': 'Luxury Beach Villa',
                'description': 'Beautiful beachfront villa with stunning ocean views',
                'location': 'Cox\'s Bazar, Bangladesh',
                'price': Decimal('50000000'),
                'bedrooms': 5,
                'bathrooms': 4,
                'square_feet': 5000,
                'amenities': ['Swimming Pool', 'Private Beach', 'Garden', 'Garage'],
                'category': 'Villas',
                'featured': True
            },
            {
                'name': 'Sky Tower Penthouse',
                'description': 'Modern penthouse with panoramic city views',
                'location': 'Gulshan, Dhaka',
                'price': Decimal('75000000'),
                'bedrooms': 4,
                'bathrooms': 3,
                'square_feet': 4000,
                'amenities': ['Rooftop Terrace', 'Gym', 'Concierge', 'Parking'],
                'category': 'Penthouses',
                'featured': True
            },
            {
                'name': 'Riverside Apartment',
                'description': 'Elegant apartment with river views',
                'location': 'Banani, Dhaka',
                'price': Decimal('35000000'),
                'bedrooms': 3,
                'bathrooms': 2,
                'square_feet': 2500,
                'amenities': ['Balcony', 'Gym', 'Security', 'Generator'],
                'category': 'Luxury Apartments',
                'featured': False
            },
            {
                'name': 'Commercial Office Space',
                'description': 'Prime office location in business district',
                'location': 'Motijheel, Dhaka',
                'price': Decimal('25000000'),
                'bedrooms': 0,
                'bathrooms': 2,
                'square_feet': 3000,
                'amenities': ['Reception', 'Conference Room', 'Parking', 'Lift'],
                'category': 'Office Spaces',
                'featured': False
            },
            {
                'name': 'Retail Shop',
                'description': 'High-traffic retail location',
                'location': 'New Market, Dhaka',
                'price': Decimal('15000000'),
                'bedrooms': 0,
                'bathrooms': 1,
                'square_feet': 1500,
                'amenities': ['Display Windows', 'Storage', 'AC'],
                'category': 'Retail Shops',
                'featured': False
            }
        ]
        
        for prop_data in properties:
            category = created_categories.get(prop_data['category'])
            
            prop, created = Property.objects.get_or_create(
                name=prop_data['name'],
                defaults={
                    'description': prop_data['description'],
                    'location': prop_data['location'],
                    'price': prop_data['price'],
                    'bedrooms': prop_data['bedrooms'],
                    'bathrooms': prop_data['bathrooms'],
                    'square_feet': prop_data['square_feet'],
                    'amenities': prop_data['amenities'],
                    'category': category,
                    'featured': prop_data['featured'],
                    'status': 'active'
                }
            )
            
            if created:
                self.stdout.write(f'✅ Property created: {prop.name}')
        
        self.stdout.write(self.style.SUCCESS('🎉 Database seeded successfully!'))