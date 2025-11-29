'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_xxxxx');

function StripeCheckoutForm({ booking, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setProcessing(true);

    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('http://127.0.0.1:8000/api/payments/initiate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          booking_id: booking.id,
          provider: 'stripe'
        })
      });

      const data = await response.json();

      if (data.success && data.client_secret) {
        const result = await stripe.confirmCardPayment(data.client_secret, {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        });

        if (result.error) {
          toast.error(result.error.message);
        } else {
          toast.success('Payment successful!');
          onSuccess();
        }
      } else {
        toast.error(data.error || 'Payment initiation failed');
      }
    } catch (error) {
      toast.error('Payment error: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-dark p-4 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#fff',
                '::placeholder': { color: '#aab7c4' },
              },
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Lock size={20} />
        {processing ? 'Processing...' : `Pay $${parseFloat(booking.total_amount).toFixed(2)}`}
      </button>

      <p className="text-xs text-center text-gray-400">
        🔒 Secured by Stripe • Your payment info is encrypted
      </p>
    </form>
  );
}

function BkashCheckout({ booking, onSuccess }) {
  const [processing, setProcessing] = useState(false);

  const handleBkashPayment = async () => {
    setProcessing(true);

    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('http://127.0.0.1:8000/api/payments/initiate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          booking_id: booking.id,
          provider: 'bkash'
        })
      });

      const data = await response.json();

      if (data.success && data.bkash_url) {
        // Redirect to bKash payment page
        toast.success('Redirecting to bKash...');
        window.location.href = data.bkash_url;
      } else {
        toast.error(data.error || 'bKash payment initiation failed');
      }
    } catch (error) {
      toast.error('Payment error: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-dark p-6 rounded-lg text-center">
        <Smartphone size={64} className="mx-auto mb-4 text-pink-400" />
        <h3 className="text-xl font-bold mb-2">Pay with bKash</h3>
        <p className="text-gray-400 text-sm mb-4">
          You'll be redirected to bKash mobile payment
        </p>
        <div className="text-3xl font-bold text-pink-400 mb-4">
          ৳{(parseFloat(booking.total_amount) * 110).toFixed(2)}
        </div>
        <p className="text-xs text-gray-500">~$1 = ৳110</p>
      </div>

      <button
        onClick={handleBkashPayment}
        disabled={processing}
        className="w-full py-3 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Smartphone size={20} />
        {processing ? 'Connecting to bKash...' : 'Pay with bKash'}
      </button>

      <p className="text-xs text-center text-gray-400">
        🔒 Secured by bKash • Mobile Banking Payment
      </p>
    </div>
  );
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${params.bookingId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setBooking(data);
    } catch (error) {
      toast.error('Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
  const res = await fetch('http://127.0.0.1:8000/api/payments/initiate/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    },
    body: JSON.stringify({
      booking_id: booking.id,
      provider: paymentMethod  // 'stripe' or 'bkash'
    })
  });

  const data = await res.json();
  if (data.payment_url) {
    window.location.href = data.payment_url;  // Redirect to Stripe or bKash
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-red-900 flex items-center justify-center">
        <div className="text-white text-2xl">Booking not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="glass-dark p-8 rounded-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <CreditCard size={48} className="mx-auto mb-4 text-green-400" />
              <h1 className="text-3xl font-bold mb-2">Complete Payment</h1>
              <p className="text-gray-400">Booking ID: #{booking.id}</p>
            </div>

            {/* Booking Summary */}
            <div className="glass p-6 rounded-lg mb-6">
              <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Property:</span>
                  <span className="font-semibold">{booking.property_name || 'Property'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span>{booking.property_location || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal:</span>
                  <span>${parseFloat(booking.subtotal || booking.total_amount).toFixed(2)}</span>
                </div>
                {booking.discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({booking.discount}%):</span>
                    <span>-${((parseFloat(booking.subtotal) * booking.discount) / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-3 mt-3">
                  <div className="flex justify-between text-2xl font-bold">
                    <span>Total:</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                      ${parseFloat(booking.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">Select Payment Method</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'stripe'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 hover:border-blue-500/50'
                  }`}
                >
                  <CreditCard size={32} className="mx-auto mb-2 text-blue-400" />
                  <div className="font-semibold">Credit Card</div>
                  <div className="text-xs text-gray-400">Stripe</div>
                </button>

                <button
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'bkash'
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-white/10 hover:border-pink-500/50'
                  }`}
                >
                  <Smartphone size={32} className="mx-auto mb-2 text-pink-400" />
                  <div className="font-semibold">bKash</div>
                  <div className="text-xs text-gray-400">Mobile Banking</div>
                </button>
              </div>
            </div>

            {/* Payment Form */}
            {paymentMethod === 'stripe' ? (
              <Elements stripe={stripePromise}>
                <StripeCheckoutForm booking={booking} onSuccess={handlePaymentSuccess} />
              </Elements>
            ) : (
              <BkashCheckout booking={booking} onSuccess={handlePaymentSuccess} />
            )}

            {/* Test Card Info */}
            {paymentMethod === 'stripe' && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-300 font-semibold mb-2">🧪 Test Mode</p>
                <p className="text-xs text-gray-400">Use test card: 4242 4242 4242 4242</p>
                <p className="text-xs text-gray-400">Any future date, any CVC</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}