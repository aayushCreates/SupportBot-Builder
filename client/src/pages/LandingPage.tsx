import React, { useState } from "react";
import { SignInButton, useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import {
  Menu,
  ArrowRight,
  Globe,
  MessageSquare,
  Plus,
  Check,
  Database,
  Gauge,
  RefreshCw,
  Lock,
  Sparkles,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { cn } from "../utils/helpers";
import Button from "../components/ui/Button";

const LandingPage: React.FC = () => {
  const { isSignedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );

  if (isSignedIn) return <Navigate to="/dashboard" replace />;

  const steps = [
    {
      number: "01",
      icon: Database,
      title: "Add your knowledge base",
      desc: "Upload PDFs, paste plain text, or simply provide your website URL to get started.",
    },
    {
      number: "02",
      icon: Gauge,
      title: "Build with a click",
      desc: "Our AI processes your content instantly, creating a custom brain for your chatbot.",
    },
    {
      number: "03",
      icon: ExternalLink,
      title: "Embed on your website",
      desc: "Copy a single line of code and paste it on your site for an instant 24/7 support assistant.",
    },
  ];

  const features = [
    {
      icon: Database,
      title: "PDF Ingestion",
      desc: "Upload PDFs and let AI analyze every detail for accuracy.",
    },
    {
      icon: Globe,
      title: "Auto-Scrape",
      desc: "Provide a URL and we'll automatically index your whole site.",
    },
    {
      icon: Sparkles,
      title: "AI Reasoning",
      desc: "Answers appear naturally, providing just the context customers need.",
    },
    {
      icon: MessageSquare,
      title: "Conversation History",
      desc: "See every interaction between visitors and your bot.",
    },
    {
      icon: RefreshCw,
      title: "Customization",
      desc: "Match your brand with colors, logos, and custom greetings.",
    },
    {
      icon: Lock,
      title: "Universal Tag",
      desc: "Add one script tag and your bot is live on any platform.",
    },
  ];

  const pricing = {
    free: {
      name: "Free",
      price: "0",
      features: [
        "1 Bot",
        "50 Sources per bot",
        "100 Messages/month",
        "Basic analytics",
        "Custom branding",
        "Priority support",
      ],
    },
    pro: {
      name: "Pro",
      price: billingCycle === "monthly" ? "29" : "24",
      features: [
        "10 Bots",
        "1000 Sources per bot",
        "5,000 Messages/month",
        "Full analytics",
        "Custom branding",
        "Priority support",
      ],
    },
  };

  const faqs = [
    {
      q: "What is SupportBot?",
      a: "SupportBot is an AI-powered platform that lets you create custom chatbots trained specifically on your data, providing instant, accurate answers to your visitors.",
    },
    {
      q: "What files can I upload?",
      a: "Currently we support PDF files, plain text, and full website scraping via URL.",
    },
    {
      q: "Can I customize the widget?",
      a: "Yes, you can customize everything from the colors and logo to the welcome message and font style.",
    },
    {
      q: "What happens if I reach my message limit?",
      a: "We'll notify you when you're close. Once the limit is reached, the bot will pause until the next cycle or until you upgrade.",
    },
    {
      q: "Is my data secure?",
      a: "Absolutely. We use enterprise-grade encryption and do not use your private data to train foundation models.",
    },
  ];

  const trustIcons = [
    { name: "A", color: "bg-blue-500" },
    { name: "B", color: "bg-teal-500" },
    { name: "C", color: "bg-orange-500" },
    { name: "D", color: "bg-red-500" },
    { name: "E", color: "bg-indigo-500" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-brand/10 selection:text-brand">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 flex items-center justify-center bg-brand rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">SupportBot</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {["Features", "Pricing", "Help"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-text-secondary hover:text-foreground transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-text-secondary hover:text-foreground">
                Sign in
              </button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button
                size="sm"
                className="rounded-md bg-primary text-white font-bold h-9"
              >
                Get started free
              </Button>
            </SignInButton>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-0 right-0 w-full p-6 space-y-8 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center bg-brand rounded-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">SupportBot</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-bg-tertiary rounded-xl transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {["Features", "Pricing", "Help"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-semibold text-foreground hover:text-brand transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="pt-8 border-t border-border flex flex-col gap-4">
              <SignInButton mode="modal">
                <Button variant="outline" className="w-full py-4 font-bold">
                  Sign in
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button className="w-full py-4 font-bold bg-primary text-white">
                  Get started free
                </Button>
              </SignInButton>
            </div>
          </div>
        </div>
      )}

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/5 border border-brand/10 text-brand text-[10px] font-bold uppercase tracking-widest animate-pulse">
              <Plus className="w-3 h-3" /> Powered by AI
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-foreground leading-[1.1] tracking-tight">
              Turn your docs into a <br />
              <span className="text-primary underline decoration-brand/30 underline-offset-8">
                24/7 support chatbot
              </span>
            </h1>

            <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Upload your docs, help center, or even a simple URL and embed it
              in <br className="hidden md:block" /> your website for an instant
              response.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="px-8 rounded-md bg-primary text-white shadow-xl shadow-brand/20"
                >
                  Start for free
                </Button>
              </SignInButton>
              <Button variant="ghost" size="lg" className="px-8 font-bold">
                See it in action
              </Button>
            </div>

            {/* Trust Icons */}
            <div className="pt-6 flex flex-col items-center gap-4">
              <div className="flex -space-x-2">
                {trustIcons.map((icon, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-white text-[10px] font-black shadow-sm",
                      icon.color,
                    )}
                  >
                    {icon.name}
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold text-text-tertiary">
                Trusted by 10,000+ teams and small businesses
              </p>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-24 px-6 bg-bg-secondary/30">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-4">
              HOW IT WORKS
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-16">
              Three steps to go live
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="bg-background rounded-3xl p-10 border border-border shadow-sm text-left group hover:scale-[1.02] transition-all"
                >
                  <div className="flex items-start justify-between mb-8">
                    <span className="text-5xl font-black text-foreground/5">
                      {step.number}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-brand/5 flex items-center justify-center text-brand">
                      <step.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Instant Answers Feature */}
        <section id="features" className="py-32 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 items-center gap-20">
            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-4">
                  INSTANT RESPONSE
                </p>
                <h2 className="text-4xl font-black text-foreground leading-tight">
                  Your visitors get instant answers
                </h2>
              </div>
              <p className="text-lg text-text-secondary leading-relaxed font-medium">
                Capture 24/7 support ticket that helps your business work
                faster. Deliver personal and helpful answers in real-time.
              </p>

              <ul className="space-y-4">
                {[
                  "Answers only from your content — no hallucinations",
                  "Custom response width for UI",
                  "Retains daily conversation context",
                ].map((text) => (
                  <li
                    key={text}
                    className="flex items-center gap-3 text-sm font-bold text-foreground"
                  >
                    <div className="w-5 h-5 rounded-full bg-success-bg text-success flex items-center justify-center shadow-sm">
                      <Check className="w-3 h-3" />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="bg-primary/5 rounded-[40px] p-10 relative overflow-hidden">
                <div className="bg-background rounded-2xl shadow-2xl border border-border overflow-hidden">
                  <div className="bg-primary p-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span className="text-xs font-bold">Support Agent</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4 h-[300px] overflow-y-auto bg-background">
                    <div className="flex justify-end">
                      <div className="bg-primary text-white text-[11px] font-bold px-4 py-3 rounded-2xl rounded-tr-none max-w-[80%]">
                        How can I restore my password?
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-bg-secondary text-foreground text-[11px] font-medium px-4 py-3 rounded-2xl rounded-tl-none max-w-[80%] border border-border">
                        Just visit the login page and click on forgot password
                        to receive a reset code in your email.
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-border flex items-center gap-2">
                    <div className="flex-1 h-9 bg-bg-secondary rounded-xl px-4" />
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 px-6 bg-bg-secondary/30">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-4">
              FEATURES
            </p>
            <h2 className="text-4xl font-black text-foreground mb-16">
              Everything you need
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="bg-background rounded-3xl p-8 border border-border shadow-sm text-left group hover:border-brand/40 transition-all flex flex-col items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {f.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed font-medium">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-4">
              PRICING
            </p>
            <h2 className="text-4xl font-black text-foreground mb-12">
              Simple, honest pricing
            </h2>

            <div className="flex items-center justify-center gap-4 mb-16">
              <span
                className={cn(
                  "text-sm font-bold",
                  billingCycle === "monthly"
                    ? "text-foreground"
                    : "text-text-tertiary",
                )}
              >
                Monthly
              </span>
              <button
                onClick={() =>
                  setBillingCycle(
                    billingCycle === "monthly" ? "yearly" : "monthly",
                  )
                }
                className="w-12 h-6 bg-primary rounded-full relative p-1 transition-all"
              >
                <div
                  className={cn(
                    "w-4 h-4 bg-white rounded-full transition-all",
                    billingCycle === "yearly" ? "ml-6" : "",
                  )}
                />
              </button>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-sm font-bold",
                    billingCycle === "yearly"
                      ? "text-foreground"
                      : "text-text-tertiary",
                  )}
                >
                  Yearly
                </span>
                <span className="text-[10px] bg-success-bg text-success px-2 py-0.5 rounded-full font-black">
                  Save 20%
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Card */}
              <div className="bg-background rounded-[40px] p-10 border border-border shadow-sm hover:shadow-xl transition-all text-left flex flex-col justify-between">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-6">
                      {pricing.free.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black">
                        ${pricing.free.price}
                      </span>
                      <span className="text-text-tertiary font-bold">/mo</span>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {pricing.free.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-3 text-sm font-bold text-foreground"
                      >
                        <Check className="w-4 h-4 text-success" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    className="w-full py-4 mt-12 rounded-md border-2 hover:bg-bg-tertiary"
                  >
                    Get started free
                  </Button>
                </SignInButton>
              </div>

              {/* Pro Card */}
              <div className="bg-background rounded-[40px] p-10 border-2 border-primary shadow-2xl transition-all text-left flex flex-col justify-between relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  Most popular
                </div>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-6">
                      {pricing.pro.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black">
                        ${pricing.pro.price}
                      </span>
                      <span className="text-text-tertiary font-bold">/mo</span>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {pricing.pro.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-3 text-sm font-bold text-foreground"
                      >
                        <Check className="w-4 h-4 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <SignInButton mode="modal">
                  <Button className="w-full py-4 mt-12 rounded-2xl bg-primary text-white shadow-xl shadow-brand/20">
                    Upgrade to Pro
                  </Button>
                </SignInButton>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="help" className="py-32 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-4">
              FAQ
            </p>
            <h2 className="text-4xl font-black text-foreground mb-16">
              Frequently asked questions
            </h2>

            <div className="space-y-4 text-left">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-background border-b border-border">
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full py-6 flex items-center justify-between text-left group"
                  >
                    <span className="text-base font-bold text-foreground hover:text-brand transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-text-tertiary transition-transform duration-300",
                        activeFaq === i ? "rotate-180" : "",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      activeFaq === i ? "max-h-40 pb-6" : "max-h-0",
                    )}
                  >
                    <p className="text-sm text-text-secondary leading-relaxed font-medium">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="pt-24 pb-12 px-6 border-t border-border bg-bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between mb-20">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center bg-brand rounded-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tighter">
                  SupportBot
                </span>
              </div>
              <p className="text-sm text-text-secondary font-medium leading-relaxed max-w-xs">
                Turn your docs into custom AI-native support agents that work
                24/7.
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">
                Product
              </h4>
              <ul className="space-y-4 text-sm font-bold text-text-secondary">
                <li>
                  <a href="#" className="hover:text-brand transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand transition-colors">
                    Changelog
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* <div className="pt-8 border-t border-border text-[10px] font-bold text-text-tertiary uppercase tracking-widest flex justify-between items-center">
            <p>© 2026 SupportBot. All rights reserved.</p>
            <div className="flex gap-6">
              <a
                href="https://github.com/aayushCreates/SupportBot-Builder"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand"
              >
                GitHub
              </a>
            </div>
          </div> */}
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
