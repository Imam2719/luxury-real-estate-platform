# payments/views.py
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import stripe
import requests
import json

from bookings.models import Booking
from .models import Payment
from .payment_service import PaymentService  


# 1. Initiate Payment (Stripe or bKash) - Frontend hits this
class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        provider = request.data.get('provider', 'stripe').lower()  # 'stripe' or 'bkash'

        if provider not in ['stripe', 'bkash']:
            return Response({"error": "Invalid provider"}, status=400)

        try:
            booking = Booking.objects.get(
                id=booking_id,
                user=request.user,
                status__in=['pending', 'confirmed']
            )
        except Booking.DoesNotExist:
            return Response({"error": "Invalid or already paid booking"}, status=400)

        service = PaymentService(provider)
        result = service.initiate_payment(booking, request)

        return Response({
            "success": True,
            "payment_url": result['payment_url']
        })


# 2. Stripe Webhook - Auto confirm payment
@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        return HttpResponse(status=400)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        booking_id = session.metadata.get('booking_id')

        try:
            booking = Booking.objects.get(id=booking_id)
            booking.status = 'paid'
            booking.save()

            Payment.objects.update_or_create(
                booking=booking,
                defaults={
                    'transaction_id': session.id,
                    'provider': 'stripe',
                    'status': 'completed',
                    'amount': booking.total_amount
                }
            )
        except Booking.DoesNotExist:
            pass

    return HttpResponse(status=200)


# 3. bKash Callback - Auto execute + confirm
@csrf_exempt
def bkash_callback(request):
    if request.method == "POST":
        payment_id = request.POST.get('paymentID')
        status = request.POST.get('status')

        if not payment_id:
            return HttpResponse("Missing paymentID", status=400)

        # Step 1: Get token
        token_url = f"{settings.BKASH_BASE_URL}/tokenized/checkout/token/grant"
        token_payload = {
            "app_key": settings.BKASH_APP_KEY,
            "app_secret": settings.BKASH_APP_SECRET
        }
        token_headers = {
            "username": settings.BKASH_USERNAME,
            "password": settings.BKASH_PASSWORD,
            "Content-Type": "application/json"
        }

        token_resp = requests.post(token_url, json=token_payload, headers=token_headers)
        if token_resp.status_code != 200:
            return HttpResponse("Token error", status=500)
        token = token_resp.json().get('id_token')

        # Step 2: Execute payment
        execute_headers = {
            "authorization": token,
            "x-app-key": settings.BKASH_APP_KEY,
            "Content-Type": "application/json"
        }
        execute_resp = requests.post(
            f"{settings.BKASH_BASE_URL}/checkout/execute",
            json={"paymentID": payment_id},
            headers=execute_headers
        )
        data = execute_resp.json()

        if data.get("transactionStatus") == "Completed":
            invoice = data.get("merchantInvoiceNumber", "")
            booking_id = invoice.replace("INV", "")

            try:
                booking = Booking.objects.get(id=booking_id)
                booking.status = 'paid'
                booking.save()

                Payment.objects.update_or_create(
                    booking=booking,
                    defaults={
                        'transaction_id': payment_id,
                        'provider': 'bkash',
                        'status': 'completed',
                        'amount': booking.total_amount
                    }
                )
            except:
                pass

            return HttpResponse("<h1 style='text-align:center; margin-top:100px; color:green;'>Payment Successful! You can close this tab.</h1>")

    return HttpResponse("Payment processing...", status=200)


# 4. Success & Cancel Pages (optional but nice)
def payment_success(request):
    return render(request, 'payments/success.html')

def payment_cancel(request):
    return render(request, 'payments/cancel.html')