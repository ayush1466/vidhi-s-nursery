import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { CheckCircle, CreditCard, Truck, Lock, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

const STEPS = ['Shipping', 'Payment', 'Confirm']
const isUUID = (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(val))
const ORDER_TIMEOUT_MS = 45000

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)

  const [shipping, setShipping] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })

  const [payment, setPayment] = useState({
    method: 'cod',
    cardNumber: '',
    expiry: '',
    cvv: '',
    upiId: '',
  })

  const shippingFee = total >= 599 ? 0 : 49
  const finalTotal = total - discount + shippingFee

  const withTimeout = (promise, ms, message) =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
    ])

  const isTimeoutError = (err) => String(err?.message || '').toLowerCase().includes('timed out')

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'GREENIE') {
      setDiscount(Math.round(total * 0.15))
      toast.success('15% discount applied')
    } else {
      toast.error('Invalid coupon code')
    }
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      if (!user) {
        toast.error('Please sign in to place order')
        navigate('/login')
        return
      }

      const createOrderRequest = () =>
        supabase
          .from('orders')
          .insert({
            user_id: user.id,
            total_amount: finalTotal,
            status: 'pending',
            payment_method: payment.method,
            shipping_address: {
              name: shipping.name,
              email: shipping.email,
              phone: shipping.phone,
              address: shipping.address,
              city: shipping.city,
              state: shipping.state,
              pincode: shipping.pincode,
              full: `${shipping.address}, ${shipping.city}, ${shipping.state} - ${shipping.pincode}`,
            },
          })
          .select()
          .single()

      let orderResponse
      try {
        orderResponse = await withTimeout(createOrderRequest(), ORDER_TIMEOUT_MS, 'Order request timed out')
      } catch (firstErr) {
        if (!isTimeoutError(firstErr)) throw firstErr
        toast('Network is slow, retrying order...')
        orderResponse = await withTimeout(createOrderRequest(), ORDER_TIMEOUT_MS, 'Order request timed out')
      }

      const { data: order, error: orderError } = orderResponse

      if (orderError) throw orderError

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: isUUID(item.id) ? item.id : null,
        product_name: item.name,
        product_image: item.image,
        quantity: item.quantity,
        price: item.price,
      }))

      const insertItemsRequest = () => supabase.from('order_items').insert(orderItems)

      let itemsResponse
      try {
        itemsResponse = await withTimeout(insertItemsRequest(), ORDER_TIMEOUT_MS, 'Order items request timed out')
      } catch (firstErr) {
        if (!isTimeoutError(firstErr)) throw firstErr
        toast('Network is slow, retrying items...')
        itemsResponse = await withTimeout(insertItemsRequest(), ORDER_TIMEOUT_MS, 'Order items request timed out')
      }

      const { error: itemsError } = itemsResponse
      if (itemsError) throw itemsError

      setOrderId(order.id)
      clearCart()
      setOrderPlaced(true)
    } catch (e) {
      console.error('Order error:', e)
      toast.error(
        isTimeoutError(e)
          ? 'Order is taking too long. Check internet and try again.'
          : 'Something went wrong: ' + e.message
      )
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-cream pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-2xl text-bark mb-4">Your cart is empty</p>
          <Link to="/shop" className="bg-forest-600 text-white font-body px-6 py-3 rounded-full hover:bg-forest-700 transition-colors">
            Browse Plants
          </Link>
        </div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-cream pt-24 flex items-center justify-center">
        <div className="text-center max-w-md px-4 animate-slide-up">
          <div className="w-20 h-20 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-forest-600" />
          </div>
          <h1 className="font-display text-3xl text-bark mb-3">Order Placed</h1>
          <p className="font-body text-bark/60 mb-2">Thank you for shopping with Vidhi's Nursery</p>
          {orderId && (
            <p className="font-body text-sm text-forest-600 mb-4">
              Order ID: <strong>#{orderId.slice(0, 8).toUpperCase()}</strong>
            </p>
          )}
          <div className="bg-forest-50 rounded-2xl p-4 mb-6 text-left">
            <p className="font-body text-xs text-forest-600 uppercase tracking-wider mb-2">Delivering to</p>
            <p className="font-body text-sm text-bark font-medium">{shipping.name}</p>
            <p className="font-body text-sm text-bark/60">{shipping.address}, {shipping.city}, {shipping.state} - {shipping.pincode}</p>
            <p className="font-body text-sm text-bark/60">{shipping.phone}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link to="/orders" className="border border-forest-200 text-bark font-body px-6 py-3 rounded-full hover:bg-forest-50 transition-colors">
              View Orders
            </Link>
            <Link to="/shop" className="bg-forest-600 text-white font-body px-6 py-3 rounded-full hover:bg-forest-700 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display text-3xl text-bark mb-8">Checkout</h1>

        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-body font-medium ${i <= step ? 'bg-forest-600 text-white' : 'bg-forest-100 text-gray-400'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`font-body text-sm ${i === step ? 'text-bark' : 'text-gray-400'}`}>{s}</span>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Truck className="w-5 h-5 text-forest-600" />
                  <h2 className="font-display text-xl text-bark">Shipping Details</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Full Name', type: 'text', span: 1 },
                    { key: 'email', label: 'Email', type: 'email', span: 1 },
                    { key: 'phone', label: 'Phone Number', type: 'tel', span: 2 },
                    { key: 'address', label: 'Full Address', type: 'text', span: 2 },
                    { key: 'city', label: 'City', type: 'text', span: 1 },
                    { key: 'state', label: 'State', type: 'text', span: 1 },
                    { key: 'pincode', label: 'PIN Code', type: 'text', span: 1 },
                  ].map(({ key, label, type, span }) => (
                    <div key={key} className={span === 2 ? 'sm:col-span-2' : ''}>
                      <label className="font-body text-xs text-gray-400 uppercase tracking-wider block mb-1">{label}</label>
                      <input
                        type={type}
                        value={shipping[key]}
                        onChange={e => setShipping({ ...shipping, [key]: e.target.value })}
                        className="w-full border border-forest-100 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 bg-cream"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep(1)}
                  disabled={!shipping.name || !shipping.phone || !shipping.address || !shipping.city || !shipping.pincode}
                  className="mt-6 w-full bg-forest-600 text-white font-body py-3.5 rounded-full hover:bg-forest-700 disabled:opacity-50"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <CreditCard className="w-5 h-5 text-forest-600" />
                  <h2 className="font-display text-xl text-bark">Payment</h2>
                </div>
                <div className="flex gap-3 mb-6">
                  {['card', 'upi', 'cod'].map(m => (
                    <button
                      key={m}
                      onClick={() => setPayment({ ...payment, method: m })}
                      className={`flex-1 py-2.5 rounded-xl font-body text-sm border ${payment.method === m ? 'bg-forest-600 text-white border-forest-600' : 'border-forest-100 text-bark hover:bg-forest-50'}`}
                    >
                      {m === 'card' ? 'Card' : m === 'upi' ? 'UPI' : 'Cash on Delivery'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(0)} className="px-6 py-3.5 border border-forest-200 text-bark font-body rounded-full hover:bg-forest-50">
                    Back
                  </button>
                  <button onClick={() => setStep(2)} className="flex-1 bg-forest-600 text-white font-body py-3.5 rounded-full hover:bg-forest-700">
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h2 className="font-display text-xl text-bark mb-5">Review & Place Order</h2>
                <div className="bg-forest-50 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-forest-600" />
                    <p className="font-body text-xs text-forest-600 uppercase tracking-wider">Delivering to</p>
                  </div>
                  <p className="font-body text-sm text-bark font-medium">{shipping.name}</p>
                  <p className="font-body text-sm text-bark/60">{shipping.address}</p>
                  <p className="font-body text-sm text-bark/60">{shipping.city}, {shipping.state} - {shipping.pincode}</p>
                  <p className="font-body text-sm text-bark/60">{shipping.phone}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="px-6 py-3.5 border border-forest-200 text-bark font-body rounded-full hover:bg-forest-50">
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-forest-600 text-white font-body py-3.5 rounded-full hover:bg-forest-700 disabled:opacity-70"
                  >
                    <Lock className="w-4 h-4" />
                    {loading ? 'Placing Order...' : `Place Order · ₹${finalTotal.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-5 shadow-sm sticky top-24">
              <h3 className="font-display text-bark text-lg mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-xs text-bark truncate">{item.name}</p>
                      <p className="font-body text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-body text-sm text-bark">₹{(item.price * item.quantity).toFixed(0)}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  className="flex-1 border border-forest-100 rounded-full px-3 py-2 font-body text-xs focus:outline-none focus:ring-1 focus:ring-forest-300"
                />
                <button onClick={applyCoupon} className="bg-forest-100 text-forest-700 font-body text-xs px-3 py-2 rounded-full hover:bg-forest-200">
                  Apply
                </button>
              </div>
              <div className="space-y-2 text-sm font-body border-t border-forest-50 pt-4">
                <div className="flex justify-between text-bark/60">
                  <span>Subtotal</span><span>₹{total.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-forest-600">
                    <span>Discount</span><span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-bark/60">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? <span className="text-forest-600">Free</span> : `₹${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-bark font-medium text-base pt-2 border-t border-forest-50">
                  <span className="font-display">Total</span>
                  <span className="font-display text-forest-800">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
