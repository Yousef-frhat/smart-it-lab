import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Check, Network, Lock, Shield, CreditCard, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { useAuth } from "@/app/contexts/auth-context";
import { toast } from "sonner";

type PlanType = 'free' | 'pro' | 'enterprise';

interface PaymentForm {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: string;
}

export default function PricingPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: ''
  });

  const plans = [
    {
      id: 'free' as PlanType,
      name: "Student",
      price: "Free",
      period: "forever",
      description: "Perfect for individual learners",
      features: [
        "Access to 5 Basic Labs",
        "Basic Scoring System",
        "Community Support",
        "Learn Mode Only",
        "Limited Lab Time (2hrs/day)"
      ],
      cta: "Start Free",
      highlighted: false
    },
    {
      id: 'pro' as PlanType,
      name: "Network Pro",
      price: "$19",
      period: "/month",
      description: "For serious network engineers",
      features: [
        "Unlimited Labs Access",
        "Advanced Scenarios",
        "Priority Support",
        "Performance Analytics",
        "Downloadable Certificates",
        "Practice & Exam Modes",
        "24/7 Lab Availability",
        "Custom Lab Configurations"
      ],
      cta: "Start Pro Trial",
      highlighted: true
    },
    {
      id: 'enterprise' as PlanType,
      name: "Training Centers",
      price: "$199",
      period: "/month",
      description: "Enterprise-grade for institutions",
      features: [
        "Everything in Pro",
        "Multi-user Management (up to 100 users)",
        "Custom Topologies",
        "Dedicated Support",
        "SSO Integration",
        "Advanced Reporting",
        "API Access",
        "White-label Options",
        "Custom Training Materials"
      ],
      cta: "Start Enterprise",
      highlighted: false
    }
  ];

  const handlePlanSelection = (planId: PlanType) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to subscribe");
      navigate("/auth");
      return;
    }

    if (planId === 'free') {
      toast.success("You're now on the Free plan!");
      return;
    }

    setSelectedPlan(planId);
    setCheckoutOpen(true);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').substring(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const handleInputChange = (field: keyof PaymentForm, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }

    setPaymentForm(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Validate form
    if (!paymentForm.cardNumber || !paymentForm.expiryDate || !paymentForm.cvv || !paymentForm.cardholderName) {
      toast.error("Please fill in all payment details");
      setIsProcessing(false);
      return;
    }

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setCheckoutOpen(false);
    toast.success(`Successfully subscribed to ${selectedPlan === 'pro' ? 'Network Pro' : 'Enterprise'} plan!`);
    
    // Reset form
    setPaymentForm({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      billingAddress: ''
    });

    // Redirect to dashboard
    navigate("/dashboard");
  };

  const getSelectedPlanDetails = () => {
    return plans.find(p => p.id === selectedPlan);
  };

  const calculateTotal = () => {
    const plan = getSelectedPlanDetails();
    if (!plan) return 0;
    
    const amount = selectedPlan === 'pro' ? 19 : 199;
    const tax = amount * 0.0; // 0% tax for simplicity
    return amount + tax;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Network className="w-6 h-6 text-accent" />
            <span className="font-mono text-xl tracking-tight">Smart IT Lab</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-accent transition-colors">Home</Link>
            <Link to="/pricing" className="text-sm text-accent">Pricing</Link>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm" className="bg-[#3B82F6] hover:bg-[#2563EB]">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-[#00FF41] hover:bg-[#00DD35] text-[#0F172A]">
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-card text-primary border-border font-mono mb-4">
            Pricing Plans
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="text-accent">Learning Path</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Current Plan Badge */}
        {isAuthenticated && user?.plan && (
          <div className="text-center mb-8">
            <Badge className="bg-[#3B82F6]/20 text-primary border-primary/30 px-4 py-2">
              Current Plan: {user.plan.toUpperCase()}
            </Badge>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <Card 
              key={i} 
              className={`relative ${
                plan.highlighted 
                  ? 'bg-card border-primary border-2 shadow-lg shadow-[#3B82F6]/20' 
                  : 'bg-card border-border'
              } ${user?.plan === plan.id ? 'ring-2 ring-[#00FF41]' : ''}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge className="bg-[#3B82F6] text-white">Most Popular</Badge>
                </div>
              )}
              {user?.plan === plan.id && (
                <div className="absolute -top-4 right-4">
                  <Badge className="bg-[#00FF41] text-[#0F172A]">Current Plan</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-8 pt-10">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                <div className="mt-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${
                    plan.highlighted 
                      ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white' 
                      : plan.id === 'free'
                      ? 'bg-[#00FF41] hover:bg-[#00DD35] text-[#0F172A]'
                      : 'bg-card border border-border hover:bg-muted'
                  }`}
                  onClick={() => handlePlanSelection(plan.id)}
                  disabled={user?.plan === plan.id}
                >
                  {user?.plan === plan.id ? 'Current Plan' : plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Compare Plans</h2>
          <Card className="bg-card border-border max-w-4xl mx-auto">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { feature: 'Lab Access', free: '5 Basic Labs', pro: 'Unlimited', enterprise: 'Unlimited + Custom' },
                  { feature: 'Lab Time', free: '2hrs/day', pro: 'Unlimited', enterprise: 'Unlimited' },
                  { feature: 'Support', free: 'Community', pro: 'Priority Email', enterprise: 'Dedicated + Phone' },
                  { feature: 'Certificates', free: '—', pro: 'Yes', enterprise: 'Yes + Custom' },
                  { feature: 'Analytics', free: 'Basic', pro: 'Advanced', enterprise: 'Enterprise' },
                  { feature: 'Users', free: '1', pro: '1', enterprise: 'Up to 100' },
                  { feature: 'API Access', free: '—', pro: '—', enterprise: 'Yes' },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 py-3 border-b border-border last:border-0">
                    <div className="font-semibold">{row.feature}</div>
                    <div className="text-sm text-muted-foreground text-center">{row.free}</div>
                    <div className="text-sm text-muted-foreground text-center">{row.pro}</div>
                    <div className="text-sm text-muted-foreground text-center">{row.enterprise}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Complete Your Subscription</span>
              <Badge className="bg-[#3B82F6]/20 text-primary border-none">
                {selectedPlan === 'pro' ? 'Network Pro' : 'Enterprise'}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCheckout} className="space-y-6 mt-4">
            {/* Card Number */}
            <div className="space-y-2">
              <Label>Card Number</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={paymentForm.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  className="bg-background border-border font-mono pr-10"
                  required
                />
                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input
                  type="text"
                  placeholder="MM/YY"
                  value={paymentForm.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  className="bg-background border-border font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>CVV</Label>
                <Input
                  type="text"
                  placeholder="123"
                  value={paymentForm.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  className="bg-background border-border font-mono"
                  required
                />
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="space-y-2">
              <Label>Cardholder Name</Label>
              <Input
                type="text"
                placeholder="John Doe"
                value={paymentForm.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                className="bg-background border-border"
                required
              />
            </div>

            {/* Billing Address */}
            <div className="space-y-2">
              <Label>Billing Address</Label>
              <Input
                type="text"
                placeholder="123 Main St, City, Country"
                value={paymentForm.billingAddress}
                onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                className="bg-background border-border"
              />
            </div>

            {/* Order Summary */}
            <div className="pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{getSelectedPlanDetails()?.name}</span>
                <span className="font-mono">${selectedPlan === 'pro' ? '19.00' : '199.00'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-mono">$0.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span className="font-mono text-accent">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Security Badges */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4 text-accent" />
                <span>256-bit SSL</span>
              </div>
              <div className="w-px h-4 bg-secondary" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-4 h-4 text-accent" />
                <span>Secure Payment</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              className="w-full bg-[#00FF41] hover:bg-[#00DD35] text-[#0F172A] font-semibold"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Pay $${calculateTotal().toFixed(2)}`}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Powered by Stripe • Your payment information is encrypted
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
