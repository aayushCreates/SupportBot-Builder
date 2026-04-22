import React from "react";
import { CreditCard, Zap, Check, Shield } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { PLAN_LIMITS } from "../types";
import { cn } from "../utils/helpers";

const BillingPage: React.FC = () => {
  // Mock billing data
  const billingData = {
    plan: "free",
    messagesThisMonth: 12,
    botsCount: 1,
  };

  const isFree = billingData.plan === "free";
  const limits = isFree ? PLAN_LIMITS.free : PLAN_LIMITS.pro;
  const messageUsagePercent =
    (billingData.messagesThisMonth / limits.messagesPerMonth) * 100;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Billing & Usage
        </h1>
        <p className="text-gray-500 font-medium">
          Manage your subscription and monitor your account limits.
        </p>
      </div>

      {/* Usage Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">
              Monthly Usage
            </h3>
            <Badge variant="neutral">{billingData.plan} Plan</Badge>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-gray-700">Messages Sent</span>
              <span className="font-bold text-gray-900">
                {billingData.messagesThisMonth} / {limits.messagesPerMonth}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  messageUsagePercent > 90
                    ? "bg-red-500"
                    : messageUsagePercent > 70
                      ? "bg-yellow-500"
                      : "bg-blue-600",
                )}
                style={{ width: `${messageUsagePercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 font-medium italic">
              Resets on May 1st, 2026
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                Bots Created
              </p>
              <p className="text-lg font-black text-gray-900">
                {billingData.botsCount} / {limits.bots}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                Max File Size
              </p>
              <p className="text-lg font-black text-gray-900">
                {limits.fileSizeMB} MB
              </p>
            </div>
          </div>
        </Card>

        <Card
          className={cn(
            "flex flex-col items-center justify-center gap-4 text-center border-l-4 ring-4 ring-offset-0",
            isFree
              ? "border-blue-600 ring-blue-50"
              : "border-indigo-600 ring-indigo-50",
          )}
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-blue-600 uppercase tracking-widest mb-1">
              Active Plan
            </p>
            <p className="text-2xl font-black text-gray-900 capitalize">
              {billingData.plan} Tier
            </p>
          </div>
          {isFree && (
            <Button variant="primary" className="mt-2 w-full">
              Upgrade to Pro
            </Button>
          )}
        </Card>
      </div>

      {/* Plan Selection */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-500 font-medium">
            Choose the plan that's right for your business scale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card
            className={cn(
              "p-8 space-y-8 relative overflow-hidden",
              isFree ? "ring-2 ring-blue-600" : "",
            )}
          >
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Starter</h3>
              <p className="text-sm text-gray-500 font-medium">
                Perfect for testing and small projects.
              </p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-gray-900">$0</span>
              <span className="text-gray-400 font-bold uppercase text-[10px]">
                / month
              </span>
            </div>
            <ul className="space-y-4">
              {[
                "1 SmartBot assistant",
                "50 messages / month",
                "3 knowledge sources",
                "Standard RAG intelligence",
                "Community support",
              ].map((f, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm font-medium text-gray-600"
                >
                  <div className="w-5 h-5 bg-gray-50 rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                    <Check className="w-3 h-3 text-gray-400" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" disabled={isFree}>
              {isFree ? "Current Plan" : "Downgrade"}
            </Button>
          </Card>

          {/* Pro Plan */}
          <Card
            className={cn(
              "p-8 space-y-8 relative overflow-hidden bg-white border-blue-200 outline-4 outline-blue-50/50",
              !isFree ? "ring-2 ring-blue-600" : "",
            )}
          >
            <div className="absolute top-0 right-0 p-4">
              <Badge
                variant="blue"
                className="bg-blue-600 text-white rounded-lg"
              >
                Best Value
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Professional</h3>
              <p className="text-sm text-gray-500 font-medium">
                For growing businesses needing scale.
              </p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-gray-900">$29</span>
              <span className="text-gray-400 font-bold uppercase text-[10px]">
                / month
              </span>
            </div>
            <ul className="space-y-4">
              {[
                "10 SmartBot assistants",
                "5,000 messages / month",
                "Unlimited knowledge sources",
                "Advanced neural retrieval",
                "Priority email support",
                "Custom branding removal",
              ].map((f, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm font-bold text-gray-900"
                >
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-100">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="primary" className="w-full shadow-2xl">
              {isFree ? "Upgrade to Pro" : "Current Plan"}
            </Button>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Shield className="w-3 h-3 text-green-500" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Secure Stripe Checkout
              </span>
            </div>
          </Card>
        </div>
      </section>

      {/* Payment Security Alert */}
      <div className="max-w-4xl mx-auto bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shrink-0 shadow-sm">
          <CreditCard className="w-6 h-6 text-gray-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">
            Secure Billing by Stripe
          </p>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            We don't store your credit card information. Payments are processed
            securely via Stripe. You can cancel or change your plan at any time
            from your customer portal.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-blue-600 font-black"
        >
          Learn More
        </Button>
      </div>
    </div>
  );
};

export default BillingPage;
