# payments/urls.py
from django.urls import path
from .views import InitiatePaymentView, stripe_webhook

urlpatterns = [
    path('initiate/', InitiatePaymentView.as_view(), name='initiate-payment'),
    path('webhook/stripe/', stripe_webhook, name='stripe-webhook'),
]