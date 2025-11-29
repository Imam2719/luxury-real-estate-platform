# payments/urls.py
from django.urls import path
from .views import (
    InitiatePaymentView, 
    stripe_webhook,
    bkash_callback,
    payment_success,
    payment_cancel
)

urlpatterns = [
    # Main payment initiation endpoint
    path('initiate/', InitiatePaymentView.as_view(), name='initiate-payment'),
    
    # Stripe webhook for payment confirmation
    path('webhook/stripe/', stripe_webhook, name='stripe-webhook'),
    
    # bKash webhook for payment confirmation
    path('webhook/bkash/', bkash_callback, name='bkash-callback'),
    
    # Success page after payment
    path('success/', payment_success, name='payment-success'),
    
    # Cancel page if user cancels payment
    path('cancel/', payment_cancel, name='payment-cancel'),
]