# payments/stripe_provider.py
import stripe
from django.conf import settings
from django.urls import reverse
from .strategy import PaymentStrategy

stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeProvider(PaymentStrategy):
    def create_payment(self, booking, request):
        success_url = request.build_absolute_uri(reverse('payment-success')) + "?session_id={CHECKOUT_SESSION_ID}"
        cancel_url = request.build_absolute_uri(reverse('payment-cancel'))

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {'name': f"Booking - {booking.property.name}"},
                    'unit_amount': int(booking.total_amount * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={'booking_id': str(booking.id)},
        )

        return {
            "payment_url": session.url,
            "session_id": session.id
        }