import { useEffect, useState, useMemo } from 'react';
import { Loader2, Check, Sparkles, Users, CreditCard, Globe, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { billingApi, capacityApi, authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import BRAND, { getUserCurrency } from '@/config/brand';
import type { CapacityInfo } from '@/types';

declare global { interface Window { Razorpay: any; } }

export function Pricing() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [capacity, setCapacity] = useState<CapacityInfo | null>(null);
  const [capacityLoading, setCapacityLoading] = useState(true);

  // Detect currency once on mount
  const currency = useMemo(() => getUserCurrency(), []);

  const isActive = user?.subscriptionStatus === 'active' && user?.tier === 'starter';
  const isExpired = user?.subscriptionStatus === 'expired';

  const daysLeft = (() => {
    if (!user?.subscriptionExpiresAt) return null;
    const diff = new Date(user.subscriptionExpiresAt).getTime() - Date.now();
    return diff <= 0 ? 0 : Math.ceil(diff / (1000 * 60 * 60 * 24));
  })();

  useEffect(() => {
    capacityApi.getCapacity().then(setCapacity).catch(() => { }).finally(() => setCapacityLoading(false));
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);
      // Tell backend which currency → backend creates order in that currency+amount
      const order = await billingApi.createOrder(currency.code);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: BRAND.name,
        description: `${BRAND.plan.name} Plan — 30 Days`,
        order_id: order.id,

        handler: async (response: any) => {
          try {
            await billingApi.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            toast.success('Payment successful! Plan active for 30 days.');
            const freshUser = await authApi.me();
            setUser(freshUser);
          } catch { toast.error('Payment verification failed. Contact support.'); }
          finally { setLoading(false); }
        },

        prefill: { email: user?.email },
        theme: { color: BRAND.colors.primary },
        modal: { ondismiss: () => { toast('Payment cancelled — no charge.'); setLoading(false); } },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        toast.error(resp?.error?.description || 'Payment failed.');
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err?.message || 'Could not start checkout.');
      setLoading(false);
    }
  };

  // ── Active ──
  if (isActive && daysLeft !== null && daysLeft > 0) {
    return (
      <div className="max-w-md mx-auto py-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-sm font-medium mb-4">
            <Check className="w-4 h-4" /> Active
          </div>
          <h3 className="text-2xl font-bold mb-2">{BRAND.plan.name} Plan</h3>
          <p className="text-muted-foreground">{BRAND.plan.features[0]} · {BRAND.plan.features[1]}</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
          </div>
          {user?.subscriptionExpiresAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Expires {new Date(user.subscriptionExpiresAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
        <Card className="border">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">Renew early to extend by another 30 days.</p>
            <Button onClick={handlePayment} disabled={loading} variant="outline" className="gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Renew Now — {currency.display}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Expired ──
  if (isExpired || (daysLeft !== null && daysLeft <= 0)) {
    return (
      <div className="max-w-md mx-auto py-8 space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 rounded-full text-sm font-medium mb-4">
          <AlertTriangle className="w-4 h-4" /> Expired
        </div>
        <h3 className="text-2xl font-bold mb-2">Your plan has expired</h3>
        <p className="text-muted-foreground mb-6">Renew to get your agent running again.</p>
        <Button onClick={handlePayment} disabled={loading} className="gap-2 h-12 text-base">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Renew — {currency.display} for 30 days
        </Button>
      </div>
    );
  }

  // ── New user — show plan card ──
  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      {!capacityLoading && capacity && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 rounded-full text-sm font-medium">
            <Users className="w-4 h-4" />
            {capacity.seatsLeft > 0
              ? `${capacity.seatsLeft} of ${capacity.maxDeployments} ${BRAND.plan.seatsLabel} seats left`
              : 'All seats taken — join the waitlist'}
          </div>
        </div>
      )}

      <Card className="border-2 border-primary relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> {BRAND.plan.badge}
        </div>

        <CardHeader className="text-center pt-8">
          <CardTitle className="text-2xl">{BRAND.plan.name}</CardTitle>
          <CardDescription>One hosted AI agent — bring your own API key</CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <div>
            <span className="text-4xl font-bold">{currency.display}</span>
            <span className="text-muted-foreground">/month</span>
            <p className="text-xs text-muted-foreground mt-1">{BRAND.plan.noAutoCharge}</p>
          </div>

          <ul className="space-y-3 text-sm text-left max-w-xs mx-auto">
            {BRAND.plan.features.map((f) => (
              <li key={f} className="flex gap-2 items-center">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs font-medium"><CreditCard className="w-3 h-3" /> Cards</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs font-medium">UPI / QR</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs font-medium">Net Banking</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs font-medium">Wallets</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs font-medium"><Globe className="w-3 h-3" /> International</span>
          </div>
        </CardContent>

        <CardFooter>
          <Button className="w-full text-base h-12" onClick={handlePayment}
            disabled={loading || (capacity !== null && capacity.seatsLeft <= 0)}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {capacity !== null && capacity.seatsLeft <= 0
              ? 'All Seats Taken'
              : `Get Started — ${currency.display}`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
