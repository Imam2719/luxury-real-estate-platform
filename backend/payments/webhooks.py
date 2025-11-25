import stripe
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from decouple import config
from payments.models import Payment
from bookings.models import Booking


@csrf_exempt
@require_POST
def stripe_webhook(request):
    """
    Stripe Webhook Handler
    Handles payment confirmation from Stripe
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, 
            sig_header, 
            config('STRIPE_WEBHOOK_SECRET')
        )
    except ValueError:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)
    
    # Handle payment success
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        transaction_id = payment_intent['id']
        
        try:
            payment = Payment.objects.get(transaction_id=transaction_id)
            payment.status = 'completed'
            payment.raw_response = payment_intent
            payment.save()
            
            # Update booking status
            booking = payment.booking
            booking.status = 'paid'
            booking.save()
            
            print(f"✅ Payment confirmed: {transaction_id}")
        
        except Payment.DoesNotExist:
            print(f"❌ Payment not found: {transaction_id}")
    
    # Handle payment failure
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        transaction_id = payment_intent['id']
        
        try:
            payment = Payment.objects.get(transaction_id=transaction_id)
            payment.status = 'failed'
            payment.error_message = payment_intent.get('last_payment_error', {}).get('message', 'Payment failed')
            payment.save()
            
            print(f"❌ Payment failed: {transaction_id}")
        
        except Payment.DoesNotExist:
            print(f"❌ Payment not found: {transaction_id}")
    
    return HttpResponse(status=200)


@csrf_exempt
@require_POST
def bkash_webhook(request):
    """
    bKash Webhook Handler
    Handles payment confirmation from bKash
    """
    import json
    
    try:
        data = json.loads(request.body)
        transaction_id = data.get('paymentID')
        status = data.get('transactionStatus')
        
        if transaction_id:
            try:
                payment = Payment.objects.get(transaction_id=transaction_id)
                
                if status == 'Completed':
                    payment.status = 'completed'
                    payment.raw_response = data
                    payment.save()
                    
                    # Update booking
                    booking = payment.booking
                    booking.status = 'paid'
                    booking.save()
                    
                    print(f"✅ bKash payment confirmed: {transaction_id}")
                else:
                    payment.status = 'failed'
                    payment.error_message = data.get('statusMessage', 'Payment failed')
                    payment.save()
                    
                    print(f"❌ bKash payment failed: {transaction_id}")
            
            except Payment.DoesNotExist:
                print(f"❌ Payment not found: {transaction_id}")
        
        return HttpResponse(status=200)
    
    except Exception as e:
        print(f"❌ bKash webhook error: {e}")
        return HttpResponse(status=400)