# payments/bkash_provider.py
import requests
from django.conf import settings
from django.urls import reverse
from .strategy import PaymentStrategy

class BkashProvider(PaymentStrategy):
    def __init__(self):
        self.base_url = settings.BKASH_BASE_URL
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "authorization": "",
            "x-app-key": settings.BKASH_APP_KEY,
        }

    def _get_token(self):
        # In production: cache this token
        url = f"{self.base_url}/tokenized/checkout/token/grant"
        payload = {
            "app_key": settings.BKASH_APP_KEY,
            "app_secret": settings.BKASH_APP_SECRET
        }
        headers = {
            "username": settings.BKASH_USERNAME,
            "password": settings.BKASH_PASSWORD,
            "Content-Type": "application/json"
        }
        response = requests.post(url, json=payload, headers=headers)
        return response.json()['id_token']

    def create_payment(self, booking, request):
        token = self._get_token()
        self.headers["authorization"] = token

        callback_url = request.build_absolute_uri(reverse('bkash-callback'))

        payload = {
            "mode": "0011",
            "payerReference": "01733704334",
            "callbackURL": callback_url,
            "amount": str(booking.total_amount),
            "currency": "BDT",
            "intent": "sale",
            "merchantInvoiceNumber": f"INV{booking.id}"
        }

        response = requests.post(
            f"{self.base_url}/checkout/create",
            json=payload,
            headers=self.headers
        ).json()

        if response.get("statusCode") == "0000":
            return {
                "payment_url": response['bkashURL'],
                "payment_id": response['paymentID']
            }
        else:
            raise Exception(response.get("statusMessage"))