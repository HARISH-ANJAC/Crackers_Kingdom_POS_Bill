import { Link } from "react-router-dom";
import {
  ArrowRight,
  Users,
  Package,
  Star,
  MapPin,
  ShieldCheck,
  Award,
  Truck,
  Clock,
  BadgeCheck,
  Sparkles,
  Phone,
  Rocket,
  Trophy,
  ClipboardList,
  Send,
  Flame,
  Leaf,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import HeroCarousel from "@/components/HeroCarousel";
import SEO from "@/components/SEO";
import sparklers from "@/assets/sparklers.jpg";
import flowerPots from "@/assets/flower-pots.jpg";
import chakkars from "@/assets/chakkars.jpg";
import rockets from "@/assets/rockets.jpg";
import repeatingShots from "@/assets/repeating-shots.jpg";
import bombs from "@/assets/bombs.jpg";

interface Product {
  name: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  tag: string;
  badgeIcon: LucideIcon;
  badge: string;
}

const featuredProducts: Product[] = [
  { name: "Color Sparklers", price: "₹60", rating: 4.8, reviews: 92, image: sparklers, tag: "Sparklers", badgeIcon: Star, badge: "Bestseller" },
  { name: "Giant Flower Pots", price: "₹120", rating: 4.7, reviews: 74, image: flowerPots, tag: "Flower Pots", badgeIcon: Leaf, badge: "Popular" },
  { name: "Ground Chakra Deluxe", price: "₹125", rating: 4.6, reviews: 61, image: chakkars, tag: "Chakkars", badgeIcon: Flame, badge: "Hot Pick" },
];

const categories = [
  { name: "CHAKKARS", image: chakkars, desc: "Spinning ground wheels" },
  { name: "FLOWER POTS", image: flowerPots, desc: "Fountain of colors" },
  { name: "SPARKLERS", image: sparklers, desc: "Classic & colorful" },
  { name: "ROCKETS", image: rockets, desc: "Aerial sky bursts" },
  { name: "REPEATING SHOTS", image: repeatingShots, desc: "Multi-shot aerial" },
  { name: "BOMBS", image: bombs, desc: "Loud & powerful" },
];

const stats = [
  { icon: Users, value: "500+", label: "HAPPY CUSTOMERS" },
  { icon: Package, value: "1,000+", label: "ORDERS FULFILLED" },
  { icon: Star, value: "4.8★", label: "AVG. RATING" },
  { icon: MapPin, value: "Pan India", label: "PARCEL DELIVERY" },
];

const whyUs = [
  {
    icon: BadgeCheck,
    title: "Licensed & Certified",
    desc: "We operate under a valid government license (RSK Agencies, No: X/20XX) with 100% compliance to legal standards.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Truck,
    title: "Safe Parcel Transport",
    desc: "We arrange secure transport through registered legal parcel services. Collect your order at the nearest parcel center in your city.",
    color: "bg-festive-green/10 text-festive-green",
  },
  {
    icon: ShieldCheck,
    title: "Premium Quality",
    desc: "Every product in our collection is sourced directly from reputed Sivakasi manufacturers, batch-tested for safety and quality.",
    color: "bg-festive-sapphire/10 text-festive-sapphire",
  },
  {
    icon: Sparkles,
    title: "Exclusive Festive Offers",
    desc: "Enjoy exciting Diwali season discounts with bulk order savings, bundle deals, and special pricing for every budget.",
    color: "bg-festive-gold/10 text-festive-gold",
  },
  {
    icon: Clock,
    title: "Quick Response",
    desc: "Submit your estimate and our team will contact you within 2 hours to confirm your order and transport details.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Award,
    title: "Nationwide Reach",
    desc: "Though based in Sivakasi, we serve customers across India with our nationwide parcel network — bringing fireworks to your city.",
    color: "bg-primary/10 text-primary",
  },
];

// How It Works steps — emoji replaced with lucide icons
const howItWorks = [
  {
    step: "01",
    icon: ClipboardList,
    title: "Browse & Estimate",
    desc: "Visit our Estimate page, browse the full product list, and select quantities for the items you want.",
  },
  {
    step: "02",
    icon: Send,
    title: "Submit Request",
    desc: "Click 'Proceed to Checkout'. We will receive your estimate with item details and your contact info.",
  },
  {
    step: "03",
    icon: Phone,
    title: "We Call You Within 2 Hrs",
    desc: "Our team will reach you within 2 hours to confirm your order, pricing, and transport arrangements.",
  },
  {
    step: "04",
    icon: Package,
    title: "Collect at Parcel Center",
    desc: "We dispatch via registered legal transport. You collect your fireworks from the nearest parcel center in your city.",
  },
];

const Index = () => {
  return (
    <div>
      <SEO
        title="Crackers Kingdom | Premium Sivakasi Fireworks — Nationwide"
        description="Crackers Kingdom is your ultimate nationwide destination for premium Sivakasi fireworks. Exclusive Diwali offers, safe certified crackers, and convenient pan-India parcel delivery. Get your estimate today!"
      />
      <HeroCarousel />

      {/* ── Floating Decorative Elements ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-festive-ruby/5 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      {/* ── Featured Products ── */}
      <section className="py-20 section-padding">
        <div className="container-narrow">
          <ScrollReveal className="text-center mb-16 relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/10 blur-3xl rounded-full opacity-50" />
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
              <Sparkles size={12} className="animate-sparkle" /> Premium Collection
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-black mt-6 text-balance leading-[1.1]">
              Celebrations Deserve <br />
              <span className="text-primary italic">The Finest Light</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-base leading-relaxed">
              Discover our wide range of high-quality fireworks sourced directly from Sivakasi —
              perfect for every celebration. Safe, colorful, and spectacularly bright.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((p, i) => (
              <ScrollReveal key={p.name} delay={i * 0.1}>
                <div className="group bg-card rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-border/50">
                  <div className="relative overflow-hidden aspect-[4/3] p-4">
                    <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <span className="absolute top-8 left-8 text-[10px] font-black uppercase tracking-widest bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                      {p.tag}
                    </span>
                    <span className="absolute top-8 right-8 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground px-3 py-1.5 rounded-full shadow-lg shadow-primary/20">
                      <p.badgeIcon size={12} className="animate-sparkle" />
                      {p.badge}
                    </span>
                  </div>
                  <div className="p-8 pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display font-bold text-xl md:text-2xl group-hover:text-primary transition-colors">{p.name}</h3>
                      <span className="text-primary font-black text-xl italic">{p.price}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-6">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} size={14} className={j < Math.floor(p.rating) ? "fill-primary text-primary" : "text-border"} />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-muted-foreground/60 ml-2 uppercase tracking-tighter">({p.reviews} Enthusiasts)</span>
                    </div>
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all group/link"
                    >
                      Explore Collection
                      <ArrowRight size={14} className="group-hover/link:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="text-center mt-10">
            <Button asChild variant="outline" className="rounded-full gap-2 active:scale-[0.97] transition-transform">
              <Link to="/products">View Complete Estimate Form <ArrowRight size={14} /></Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 section-padding bg-foreground text-card">
        <div className="container-narrow">
          <ScrollReveal className="text-center mb-12">
            {/* 🚀 → Rocket */}
            <span className="inline-flex items-center gap-1.5 text-festive-gold text-xs font-semibold uppercase tracking-widest">
              <Rocket size={13} /> Simple Process
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 text-balance">
              How to Order From Us
            </h2>
            <p className="text-card/60 mt-3 max-w-lg mx-auto text-sm">
              Due to Supreme Court regulations, online direct sale of firecrackers is not permitted. Here is how our transparent ordering process works:
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 0.1}>
                <div className="relative bg-card/5 border border-card/10 rounded-2xl p-6 hover:border-primary/40 hover:bg-card/10 transition-all duration-300">
                  <span className="text-4xl font-display font-black text-primary/20 absolute top-4 right-4">{item.step}</span>
                  {/* 📋📤📞📦 → lucide icon in a styled container */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon size={24} className="text-festive-gold" />
                  </div>
                  <h3 className="font-display font-bold text-card mb-2">{item.title}</h3>
                  <p className="text-card/60 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Preview ── */}
      <section className="py-20 section-padding bg-secondary/50">
        <div className="container-narrow grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal direction="left">
            {/* ✨ → Sparkles */}
            <span className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-widest">
              <Sparkles size={13} /> Est. 2025 — Sivakasi
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 leading-tight text-balance">
              Your Nationwide<br />
              <span className="text-primary">Fireworks Destination</span>
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed text-sm">
              Welcome to Crackers Kingdom — established just last year, yet already making celebrations brighter across India. Based in the fireworks capital of the world, Sivakasi, we are committed to bringing fresh excitement and unparalleled joy to your festivities with a diverse collection ranging from classic sparklers to breathtaking aerial displays.
            </p>
            <p className="text-muted-foreground mt-3 leading-relaxed text-sm">
              While direct doorstep delivery of firecrackers is restricted as per Supreme Court orders, we expertly organize secure transport through reliable registered parcel services — so your fireworks reach you conveniently and legally.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" />
                <span className="text-sm font-medium">100% Licensed & Legal</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={18} className="text-festive-gold" />
                <span className="text-sm font-medium">Quality Tested Products</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-festive-green" />
                <span className="text-sm font-medium">Pan-India Parcel Service</span>
              </div>
            </div>
            <Button asChild className="mt-6 rounded-full gap-2 active:scale-[0.97] transition-transform" variant="outline">
              <Link to="/about">Know More About Us <ArrowRight size={14} /></Link>
            </Button>
          </ScrollReveal>

          <ScrollReveal direction="right">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-2xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 col-span-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg">Sivakasi, Tamil Nadu</p>
                    <p className="text-xs text-muted-foreground">2/190-B5, Naranapuram Road, Sivakasi – 629189</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-2xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-festive-gold/10 flex items-center justify-center mb-3">
                  <Sparkles size={20} className="text-festive-gold" />
                </div>
                <p className="text-2xl font-display font-bold text-primary">40%</p>
                <p className="text-xs text-muted-foreground mt-1">Off on Bulk Orders This Season</p>
              </div>
              <div className="bg-card rounded-2xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Phone size={20} className="text-primary" />
                </div>
                <p className="text-2xl font-display font-bold">2 Hrs</p>
                <p className="text-xs text-muted-foreground mt-1">Response guarantee after estimate</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="py-16 relative overflow-hidden bg-foreground">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
        <div className="container-narrow grid grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
          {stats.map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 0.07}>
              <div className="flex flex-col items-center text-center gap-3 group">
                <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:bg-primary/20 group-hover:scale-110 group-hover:-rotate-6">
                  <s.icon size={28} className="text-festive-gold" />
                </div>
                <div className="space-y-1">
                  <p className="text-3xl md:text-4xl font-display font-black text-white italic tracking-tighter">{s.value}</p>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em]">{s.label}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-20 section-padding">
        <div className="container-narrow">
          <ScrollReveal className="text-center mb-12">
            {/* 🏆 → Trophy */}
            <span className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-widest">
              <Trophy size={13} /> Why Us
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">
              Why Choose <span className="text-primary">Crackers Kingdom?</span>
            </h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-md mx-auto">
              We are committed to quality, safety, and making your festive celebrations unforgettable — every single time.
            </p>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((w, i) => (
              <ScrollReveal key={w.title} delay={i * 0.08}>
                <div className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className={`w-12 h-12 rounded-xl ${w.color} flex items-center justify-center mb-4`}>
                    <w.icon size={22} />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">{w.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-20 section-padding bg-secondary/50">
        <div className="container-narrow">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-10">
              <div>
                {/* ✨ → Sparkles */}
                <span className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-widest">
                  <Sparkles size={13} /> Popular Collections
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">
                  Shop by <span className="text-primary">Category</span>
                </h2>
                <p className="text-muted-foreground text-sm mt-2 max-w-md">
                  Explore our wide range of premium fireworks, carefully sourced from Sivakasi and categorized for your specific celebration needs.
                </p>
              </div>
              <Link to="/products" className="hidden sm:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                View All Products <ArrowRight size={14} />
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {categories.map((c, i) => (
              <ScrollReveal key={c.name} delay={i * 0.07}>
                <Link to="/products" className="group relative block aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="font-display font-bold text-card text-lg leading-tight">{c.name}</h3>
                    <p className="text-card/60 text-xs mt-0.5">{c.desc}</p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal className="text-center mt-8 sm:hidden">
            <Button asChild variant="outline" className="rounded-full gap-2">
              <Link to="/products">View All Categories <ArrowRight size={14} /></Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 section-padding bg-primary">
        <div className="container-narrow text-center">
          <ScrollReveal>
            {/* 🎆 → Sparkles */}
            <span className="inline-flex items-center gap-1.5 text-primary-foreground/70 text-xs font-semibold uppercase tracking-widest">
              <Sparkles size={13} /> This Diwali Season
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mt-2 text-balance">
              Don't Miss Our Exclusive Festive Offers!
            </h2>
            <p className="text-primary-foreground/80 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              Get up to 40% off on bulk orders this season. Browse our complete collection, build your estimate, and our team will reach out within 2 hours to confirm. Let Crackers Kingdom make your celebration unforgettable!
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <Button asChild size="lg" className="rounded-full gap-2 bg-white text-primary hover:bg-white/90 shadow-lg active:scale-[0.97] transition-transform">
                <Link to="/products">Get My Estimate <ArrowRight size={16} /></Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="rounded-full gap-2 border-white/30 text-white bg-white/10 hover:bg-white/10 active:scale-[0.97] transition-transform">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Index;
