import {
  ShieldCheck,
  AlertTriangle,
  Baby,
  Droplets,
  Wind,
  Eye,
  Phone,
  Flame,
  BicepsFlexed,
  CircleAlert,
  ThumbsUp,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import PageHeader from "@/components/PageHeader";
import SEO from "@/components/SEO";
import headerBg from "@/assets/header_safety_bg.png";

const tips = [
  {
    icon: ShieldCheck,
    title: "Buy Only Certified Products",
    desc: "Always purchase fireworks from a licensed and authorized dealer like Crackers Kingdom. Check for ISI mark, government certification, and ensure the seller holds a valid license.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: AlertTriangle,
    title: "Maintain Safe Distance",
    desc: "Keep a safe distance of at least 5 meters from lit fireworks. Never lean over a firework to inspect it after lighting — even if it appears to be a dud. Wait at least 15 minutes.",
    color: "bg-festive-ruby/10 text-festive-ruby",
  },
  {
    icon: Baby,
    title: "Strict Adult Supervision",
    desc: "Children should ONLY use fireworks under strict adult supervision. Sparklers — though seemingly harmless — burn at over 1000°C. Children under 12 should never handle any crackers.",
    color: "bg-festive-gold/10 text-festive-gold",
  },
  {
    icon: Droplets,
    title: "Keep Water & Fire Aid Ready",
    desc: "Always keep a bucket of water, a hose, or a dry chemical fire extinguisher nearby. Fully douse used fireworks in water before disposal to prevent accidental re-ignition.",
    color: "bg-festive-sapphire/10 text-festive-sapphire",
  },
  {
    icon: Wind,
    title: "Open Spaces Only",
    desc: "Light fireworks outdoors only — in large, open areas away from buildings, vehicles, overhead cables, and dry vegetation. Check wind direction so sparks blow away from people.",
    color: "bg-festive-green/10 text-festive-green",
  },
  {
    icon: Eye,
    title: "Wear Protective Clothing",
    desc: "Wear close-fitting cotton clothing (not synthetic). Protect your eyes; avoid looking directly into aerial bursts. Keep a safe standback distance based on the firework size.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Flame,
    title: "Light One at a Time",
    desc: "Light fireworks one at a time and immediately move back to a safe distance. Never try to light multiple fireworks simultaneously or re-light a failed one with your hand.",
    color: "bg-festive-ruby/10 text-festive-ruby",
  },
  {
    icon: BicepsFlexed,
    title: "Proper Handling & Storage",
    desc: "Store fireworks in a cool, dry place away from heat sources, sunlight, and open flames. Never carry fireworks in pockets or near your body. Keep them in their original packaging.",
    color: "bg-festive-gold/10 text-festive-gold",
  },
  {
    icon: Phone,
    title: "Know Emergency Numbers",
    desc: "Keep emergency contacts handy: Fire Dept (101), Ambulance (108), Police (100). In case of burns, immediately cool the area with running water for at least 10 minutes before seeking medical help.",
    color: "bg-accent/10 text-accent",
  },
];

const doNots = [
  "Never light fireworks indoors or in enclosed spaces.",
  "Never point or throw fireworks at another person.",
  "Never carry lit fireworks in your hand.",
  "Never use fireworks under the influence of alcohol.",
  "Never alter or tamper with fireworks packaging or fuses.",
  "Never dispose of fireworks in recycling or regular waste bins without dousing them first.",
];

const Safety = () => (
  <div>
    <SEO
      title="Fireworks Safety Tips | Celebrate Safely — Crackers Kingdom"
      description="Your safety is our top priority. Read our comprehensive guidelines for using firecrackers safely during Diwali and every celebration. Stay safe, stay happy with Crackers Kingdom."
    />
    <PageHeader
      title="Safety Tips"
      subtitle="Your safety is our top priority. Celebrate with joy and responsibility."
      bgImage={headerBg}
    />

    {/* Intro */}
    <section className="py-16 section-padding">
      <div className="container-narrow grid lg:grid-cols-3 gap-8 items-start">
        <ScrollReveal className="lg:col-span-2" direction="left">
          <span className="text-primary text-xs font-semibold uppercase tracking-widest">🛡️ Safety First</span>
          <h2 className="font-display text-3xl font-bold mt-2 text-balance">
            Celebrate Brightly,<br />
            <span className="text-primary">Celebrate Safely</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mt-4">
            At Crackers Kingdom, we believe that the best celebrations are the safest ones. Fireworks are a beautiful part of our festive traditions — and with the right precautions, they can be enjoyed joyfully by the entire family.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed mt-3">
            All products available through Crackers Kingdom are sourced from licensed Sivakasi manufacturers and comply with government safety regulations. Here are our essential safety guidelines to ensure your festive season is filled with light, not worry.
          </p>
        </ScrollReveal>
        <ScrollReveal direction="right">
          <div className="bg-foreground text-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <CircleAlert size={22} className="text-festive-ruby shrink-0" />
              <h3 className="font-display font-bold">Legal Reminder</h3>
            </div>
            <p className="text-sm text-card/70 leading-relaxed">
              As per the <strong className="text-primary">Supreme Court Order (2018)</strong>, online direct sale of firecrackers is not permitted. All orders through Crackers Kingdom are processed via our estimate system, confirmed by our team, and dispatched via registered legal transport services.
            </p>
            <Button asChild size="sm" className="rounded-full gap-1.5 w-full" variant="outline">
              <Link to="/about">Learn More About Our Process</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>

    {/* Tips Grid */}
    <section className="py-8 pb-20 section-padding bg-secondary/50">
      <div className="container-narrow">
        <ScrollReveal className="text-center mb-12">
          <span className="text-primary text-xs font-semibold uppercase tracking-widest">📋 Safety Guidelines</span>
          <h2 className="font-display text-3xl font-bold mt-2">Essential Safety Rules</h2>
          <p className="text-muted-foreground text-sm mt-3 max-w-md mx-auto">
            Follow these guidelines for a happy, safe, and responsible celebration with your loved ones.
          </p>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((t, i) => (
            <ScrollReveal key={t.title} delay={i * 0.06}>
              <div className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full">
                <div className={`w-12 h-12 rounded-xl ${t.color} flex items-center justify-center mb-4`}>
                  <t.icon size={22} />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    {/* Do Nots */}
    <section className="py-20 section-padding">
      <div className="container-narrow grid lg:grid-cols-2 gap-12 items-start">
        <ScrollReveal direction="left">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-festive-ruby/10 flex items-center justify-center">
              <AlertTriangle size={22} className="text-festive-ruby" />
            </div>
            <h2 className="font-display text-2xl font-bold">What NOT to Do</h2>
          </div>
          <div className="space-y-3">
            {doNots.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-festive-ruby/5 border border-festive-ruby/10 rounded-xl p-4">
                <AlertTriangle size={16} className="text-festive-ruby mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
        <ScrollReveal direction="right">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-festive-green/10 flex items-center justify-center">
              <ThumbsUp size={22} className="text-festive-green" />
            </div>
            <h2 className="font-display text-2xl font-bold">Best Practices</h2>
          </div>
          <div className="space-y-4">
            {[
              { title: "Read Instructions", desc: "Always read the instructions on the firework packaging before lighting. Different fireworks have different safety requirements." },
              { title: "Supervise Children Always", desc: "Even older children (12+) with sparklers must have an adult present at all times. Never leave them unattended with any fireworks." },
              { title: "Inform Neighbors", desc: "Let your neighbors know before you start — especially if they have pets, elderly people, or infants who may be sensitive to loud sounds." },
              { title: "Check Local Timings", desc: "Follow local authority guidelines on allowed timings for bursting crackers. Avoid late-night bursting to respect community quiet hours." },
              { title: "Safe Disposal", desc: "After celebrations, sweep up all debris. Soak spent fireworks in water overnight and dispose of them in designated waste bins, not in drains." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-festive-green/5 border border-festive-green/10 rounded-xl p-4">
                <BookOpen size={16} className="text-festive-green mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold mb-0.5">{item.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 section-padding bg-primary">
      <div className="container-narrow text-center">
        <ScrollReveal>
          <h2 className="font-display text-3xl font-bold text-primary-foreground">
            Ready to Celebrate Safely?
          </h2>
          <p className="text-primary-foreground/80 mt-3 max-w-lg mx-auto text-sm">
            Browse our full collection of certified, safe, and high-quality fireworks. Place your estimate today and our team will reach you within 2 hours!
          </p>
          <div className="flex gap-4 flex-wrap justify-center mt-8">
            <Button asChild size="lg" className="rounded-full gap-2 bg-white text-primary hover:bg-white/90 active:scale-[0.97] transition-transform">
              <Link to="/products">Browse Products</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/90 bg-black/10 text-white hover:bg-black/10 active:scale-[0.97] transition-transform">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  </div>
);

export default Safety;
