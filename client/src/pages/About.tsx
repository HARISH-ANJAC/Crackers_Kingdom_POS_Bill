import {
  ShieldCheck,
  Award,
  Eye,
  Target,
  Package,
  BadgeCheck,
  MapPin,
  Truck,
  Sparkles,
  Heart,
  Globe,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import PageHeader from "@/components/PageHeader";
import SEO from "@/components/SEO";
import headerBg from "@/assets/header_about_bg.png";

const milestones = [
  { year: "2025", event: "Founded", desc: "Crackers Kingdom officially launched in Sivakasi, Tamil Nadu, with a mission to bring premium fireworks to every corner of India." },
  { year: "2025", event: "First Batch", desc: "Successfully fulfilled our first 100+ customer orders across multiple states, establishing our nationwide parcel delivery network." },
  { year: "2025", event: "Diwali Season", desc: "Launched exclusive Diwali offers with up to 40% off on bulk orders — our biggest festive campaign to date." },
  { year: "2026", event: "Growing Strong", desc: "Expanding our product catalog, improving our 2-hour response guarantee, and serving customers across all major metros." },
];

const values = [
  { icon: ShieldCheck, title: "Safety First", desc: "Every product we sell complies with government safety standards. We operate under a valid license (RSK Agencies) and follow all Supreme Court guidelines on firework sales.", color: "bg-primary/10 text-primary" },
  { icon: BadgeCheck, title: "Certified Quality", desc: "Our fireworks are sourced directly from reputed Sivakasi manufacturers with proven quality records. Every batch is checked for safety and performance.", color: "bg-festive-green/10 text-festive-green" },
  { icon: Heart, title: "Customer First", desc: "\"Once our customer, always our customer.\" We respond within 2 hours for every estimate submitted, ensuring a smooth and personal experience.", color: "bg-festive-ruby/10 text-festive-ruby" },
  { icon: Globe, title: "Nationwide Reach", desc: "Though we are based in Sivakasi, we serve customers across India through our registered parcel transport network — bringing celebrations to you.", color: "bg-festive-sapphire/10 text-festive-sapphire" },
  { icon: Truck, title: "Legal Transport", desc: "We exclusively dispatch through government-registered parcel services as per Sivakasi standards. Customers collect at their nearest parcel center.", color: "bg-festive-gold/10 text-festive-gold" },
  { icon: Sparkles, title: "Festive Innovation", desc: "We constantly update our catalog with fresh collections — from classic ground crackers to modern multi-shot aerials — for every taste and budget.", color: "bg-accent/10 text-accent" },
];

const teamStats = [
  { icon: Package, value: "500+", label: "Products in Catalog", color: "text-primary" },
  { icon: Globe, value: "Pan India", label: "Delivery Network", color: "text-festive-green" },
  { icon: Zap, value: "2 Hours", label: "Response Guarantee", color: "text-festive-gold" },
  { icon: Award, value: "Licensed", label: "RSK Agencies Certified", color: "text-festive-ruby" },
];

const About = () => {
  return (
    <div>
      <SEO
        title="About Us | Crackers Kingdom — Our Story & Values"
        description="Learn about Crackers Kingdom — established in Sivakasi in 2025, committed to bringing premium, safe, and certified fireworks to every celebration across India. Our story, values, and mission."
      />
      <PageHeader
        title="About Us"
        subtitle="Born from a passion for celebrations — here is our story."
        bgImage={headerBg}
      />

      {/* Story Section */}
      <section className="py-20 section-padding">
        <div className="container-narrow grid lg:grid-cols-2 gap-12 items-start">
          <ScrollReveal direction="left">
            <span className="text-primary text-xs font-semibold uppercase tracking-widest">✨ Est. 2025 — Sivakasi</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight text-balance mt-2">
              Your Ultimate Nationwide<br />
              <span className="text-primary">Fireworks Destination</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mt-5">
              Welcome to <strong>Crackers Kingdom</strong> — your ultimate nationwide destination for illuminating every celebration with our spectacular variety of high-quality fireworks. Established just last year, we are committed to bringing fresh excitement and unparalleled joy to your festivities.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed mt-4">
              Our diverse collection ranges from classic sparklers to breathtaking aerial displays. This festive season, make your celebrations even brighter with our exclusive, not-to-be-missed <strong>Diwali offers!</strong>
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed mt-4">
              While we don't handle direct doorstep delivery, we expertly organize secure transport through reliable registered parcel services — allowing you to conveniently collect your chosen fireworks from the nearest designated parcel center in your area.
            </p>
            <blockquote className="mt-6 border-l-4 border-primary pl-4 italic text-sm text-primary font-medium">
              "Let Crackers Kingdom be the light that makes your special moments unforgettable!"
            </blockquote>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button asChild className="rounded-full gap-2 active:scale-[0.97] transition-transform">
                <Link to="/products">Browse Our Collection</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full gap-2 active:scale-[0.97] transition-transform">
                <Link to="/contact">Get In Touch</Link>
              </Button>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right">
            <div className="grid grid-cols-2 gap-4">
              {teamStats.map((s, i) => (
                <div key={s.label} className={`rounded-2xl p-6 text-center hover:-translate-y-1 transition-all duration-300 ${i % 2 === 0 ? "bg-secondary" : "bg-card border border-border shadow-sm"}`}>
                  <s.icon size={26} className={`mx-auto mb-3 ${s.color}`} />
                  <p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-foreground text-card rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <MapPin size={22} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-display font-bold">Our Base: Sivakasi, Tamil Nadu</p>
                  <p className="text-sm text-card/60 mt-1">2/190-B5, Naranapuram Road, Sivakasi – 629189</p>
                  <p className="text-xs text-card/40 mt-2">The Fireworks Capital of India — where quality crackers are made.</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 section-padding bg-secondary/50">
        <div className="container-narrow">
          <ScrollReveal className="text-center mb-12">
            <span className="text-primary text-xs font-semibold uppercase tracking-widest">🏅 What We Stand For</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Our Core Values</h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-md mx-auto">
              Every decision we make is guided by these principles — from sourcing our products to delivering them to you.
            </p>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <ScrollReveal key={v.title} delay={i * 0.08}>
                <div className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className={`w-12 h-12 rounded-xl ${v.color} flex items-center justify-center mb-4`}>
                    <v.icon size={22} />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="py-20 section-padding">
        <div className="container-narrow">
          <ScrollReveal className="text-center mb-12">
            <span className="text-primary text-xs font-semibold uppercase tracking-widest">📅 Our Journey</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">How We Got Here</h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-md mx-auto">
              Every great journey begins with a single spark. Here is ours.
            </p>
          </ScrollReveal>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden sm:block" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <ScrollReveal key={m.event} delay={i * 0.1}>
                  <div className="sm:pl-16 relative">
                    <div className="hidden sm:flex absolute left-0 top-1 w-12 h-12 rounded-full bg-primary text-primary-foreground items-center justify-center font-display font-bold text-xs z-10 shadow-lg shadow-primary/30">
                      {m.year.slice(2)}
                    </div>
                    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{m.year}</span>
                        <h3 className="font-display font-bold text-lg">{m.event}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 section-padding bg-secondary/50">
        <div className="container-narrow grid md:grid-cols-2 gap-8">
          <ScrollReveal delay={0}>
            <div className="bg-card rounded-2xl p-8 shadow-sm h-full hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Eye size={24} className="text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Our Vision</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To become India's most trusted online fireworks destination — where every customer can safely and legally access premium Sivakasi fireworks for any celebration. Our motto: <strong className="text-primary">"Our Customer's Joy is Our Pride."</strong>
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="bg-card rounded-2xl p-8 shadow-sm h-full hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 rounded-xl bg-festive-green/10 flex items-center justify-center mb-4">
                <Target size={24} className="text-festive-green" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Our Mission</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To connect celebration-lovers across India with the finest Sivakasi fireworks — through a transparent, legal, and reliable process. We organize every order with care, communicate within 2 hours, and dispatch through certified transport so your festive moments are always bright.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Legal Commitment */}
      <section className="py-16 section-padding">
        <div className="container-narrow">
          <ScrollReveal>
            <div className="bg-foreground text-card rounded-2xl p-8 md:p-10">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <ShieldCheck size={28} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-card mb-2">Our Legal Commitment</h3>
                  <p className="text-sm text-card/70 leading-relaxed">
                    As per the <strong className="text-primary">Supreme Court Order (2018)</strong>, online sale of firecrackers is not permitted. Customers are requested to select products for estimation and submit via the <strong className="text-card">"Get Estimate"</strong> button. We will contact you within 2 hours to confirm. Our shop, <strong className="text-card">Crackers Kingdom</strong>, operates 100% within legal compliance under <strong className="text-card">License: RSK AGENCIES (No: X/20XX)</strong>. We send parcels through registered legal transport services as per Sivakasi standards.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default About;
