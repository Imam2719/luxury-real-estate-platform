from abc import ABC, abstractmethod
from decimal import Decimal
import stripe
import requests
from django.conf import settings
from decouple import config
from payments.models import Payment
from bookings.models import Booking


# Strategy Interface
class PaymentStrategy(ABC):
    """
    Abstract Payment Strategy
    Design Pattern: Strategy Pattern
    """
    
    @abstractmethod
    def initiate_payment(self, booking, amount):
        """Initiate payment and return payment details"""
        pass
    
    @abstractmethod
    def verify_payment(self, transaction_id):
        """Verify payment status"""
        pass


# Stripe Strategy
class StripePaymentStrategy(PaymentStrategy):
    """
    Stripe Payment Implementation
    """
    
    def __init__(self):
        stripe.api_key = config('STRIPE_SECRET_KEY')
    
    def initiate_payment(self, booking, amount):
        """
        Create Stripe Payment Intent
        """
        try:
            # Create payment intent
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to cents
                currency='usd',
                metadata={
                    'booking_id': booking.id,
                    'user_id': booking.user.id
                }
            )
            
            # Save payment record
            payment = Payment.objects.create(
                booking=booking,
                provider='stripe',
                transaction_id=intent.id,
                amount=amount,
                currency='USD',
                status='pending',
                raw_response=intent
            )
            
            return {
                'success': True,
                'payment_id': payment.id,
                'client_secret': intent.client_secret,
                'transaction_id': intent.id
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def verify_payment(self, transaction_id):
        """
        Verify Stripe payment
        """
        try:
            intent = stripe.PaymentIntent.retrieve(transaction_id)
            return intent.status == 'succeeded'
        except Exception as e:
            print(f"Stripe verification error: {e}")
            return False


# bKash Strategy
class BkashPaymentStrategy(PaymentStrategy):
    """
    bKash Payment Implementation
    """
    
    def __init__(self):
        self.app_key = config('BKASH_APP_KEY')
        self.app_secret = config('BKASH_APP_SECRET')
        self.username = config('BKASH_USERNAME')
        self.password = config('BKASH_PASSWORD')
        self.base_url = config('BKASH_API_URL')
        self.token = None
    
    def _get_token(self):
        """Get bKash authorization token"""
        url = f"{self.base_url}/checkout/token/grant"
        headers = {
            'username': self.username,
            'password': self.password
        }
        data = {
            'app_key': self.app_key,
            'app_secret': self.app_secret
        }
        
        try:
            response = requests.post(url, headers=headers, json=data)
            if response.status_code == 200:
                self.token = response.json().get('id_token')
                return self.token
        except Exception as e:
            print(f"bKash token error: {e}")
        
        return None
    
    def initiate_payment(self, booking, amount):
        """
        Create bKash payment
        """
        if not self.token:
            self._get_token()
        
        if not self.token:
            return {
                'success': False,
                'error': 'Failed to get bKash token'
            }
        
        url = f"{self.base_url}/checkout/create"
        headers = {
            'Authorization': f'Bearer {self.token}',
            'X-APP-Key': self.app_key
        }
        data = {
            'amount': str(amount),
            'currency': 'BDT',
            'intent': 'sale',
            'merchantInvoiceNumber': f'INV-{booking.id}'
        }
        
        try:
            response = requests.post(url, headers=headers, json=data)
            result = response.json()
            
            if response.status_code == 200 and result.get('statusCode') == '0000':
                # Save payment record
                payment = Payment.objects.create(
                    booking=booking,
                    provider='bkash',
                    transaction_id=result.get('paymentID'),
                    amount=amount,
                    currency='BDT',
                    status='pending',
                    raw_response=result
                )
                
                return {
                    'success': True,
                    'payment_id': payment.id,
                    'bkash_url': result.get('bkashURL'),
                    'transaction_id': result.get('paymentID')
                }
            else:
                return {
                    'success': False,
                    'error': result.get('statusMessage', 'Payment failed')
                }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def verify_payment(self, transaction_id):
        """
        Verify bKash payment
        """
        if not self.token:
            self._get_token()
        
        url = f"{self.base_url}/checkout/execute"
        headers = {
            'Authorization': f'Bearer {self.token}',
            'X-APP-Key': self.app_key
        }
        data = {
            'paymentID': transaction_id
        }
        
        try:
            response = requests.post(url, headers=headers, json=data)
            result = response.json()
            return result.get('transactionStatus') == 'Completed'
        except Exception as e:
            print(f"bKash verification error: {e}")
            return False


# Payment Service (Context)
class PaymentService:
    """
    Payment Service - Uses Strategy Pattern
    Supports multiple payment providers
    """
    
    def __init__(self, provider):
        """
        Initialize with payment provider
        
        Args:
            provider (str): 'stripe' or 'bkash'
        """
        if provider == 'stripe':
            self.strategy = StripePaymentStrategy()
        elif provider == 'bkash':
            self.strategy = BkashPaymentStrategy()
        else:
            raise ValueError(f"Unsupported payment provider: {provider}")
    
    def initiate_payment(self, booking_id, user):
        """
        Initiate payment for a booking
        """
        try:
            booking = Booking.objects.get(id=booking_id, user=user)
        except Booking.DoesNotExist:
            return {
                'success': False,
                'error': 'Booking not found'
            }
        
        if booking.status == 'paid':
            return {
                'success': False,
                'error': 'Booking already paid'
            }
        
        # Initiate payment using strategy
        result = self.strategy.initiate_payment(booking, booking.total_amount)
        
        return result
    
    def verify_payment(self, transaction_id):
        """
        Verify payment status
        """
        return self.strategy.verify_payment(transaction_id)