import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Facebook, Linkedin, Twitter } from "lucide-react";
import logo from "@/assets/logo.jpeg";

const Footer = () => {
  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="max-w-[1400px] mx-auto section-padding py-10">
        {/*
          Desktop (lg): 12-column grid
            Brand        → col-span-3  (25%)
            Explore      → col-span-2  (17%)
            Visit Us     → col-span-2  (17%)
            Get in Touch → col-span-2  (17%)
            Legal Notice → col-span-3  (25%)

          Tablet (md): 2-column grid — Brand full-width row, rest auto-grid
          Mobile: single column
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-8 lg:gap-6 items-start">

          {/* ── Brand ── */}
          <div className="space-y-4 md:col-span-2 lg:col-span-3 text-center md:text-left">
            <div className="relative rounded-xl bg-white/10 p-1.5 shadow-sm inline-block w-fit mb-1 mx-auto md:mx-0">
              <img src={logo} alt="Crackers Kingdom" className="h-24 w-32 object-contain" />
            </div>
            <p className="text-sm leading-relaxed opacity-80 max-w-[220px] mx-auto md:mx-0">
              Premium fireworks sourced directly from Sivakasi — delivered safely across India.
            </p>
            <div className="flex gap-3 pt-1 justify-center md:justify-start">
              {[Facebook, Linkedin, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-card/10 flex items-center justify-center hover:bg-festive-gold/25 hover:text-card transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Explore ── */}
          <div className="lg:col-span-2 text-center md:text-left">
            <h4 className="font-display font-bold text-card mb-5">Explore</h4>
            <nav className="flex flex-col gap-3 items-center md:items-start">
              {[
                { label: "Home", to: "/" },
                { label: "Estimate", to: "/products" },
                { label: "About Us", to: "/about" },
                { label: "Safety Tips", to: "/safety" },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-sm hover:text-festive-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Visit Us ── */}
          <div className="lg:col-span-2 text-center md:text-left">
            <h4 className="font-display font-bold text-card mb-5">Visit Us</h4>
            <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-2.5 text-sm text-left max-w-[240px] mx-auto md:mx-0">
              <MapPin size={16} className="text-festive-gold mt-0.5 shrink-0 justify-self-center" />
              <span className="leading-relaxed">
                2/190-B5, Naranapuram Road,<br />
                Sivakasi – 629189,<br />
                Tamil Nadu
              </span>
            </div>
          </div>

          {/* ── Get in Touch ── */}
          <div className="lg:col-span-2 text-center md:text-left">
            <h4 className="font-display font-bold text-card mb-5">Get in Touch</h4>
            <div className="space-y-4 max-w-[320px] mx-auto md:mx-0">
              {/* Email — break-words so it wraps at the @ if needed, no mid-character breaking */}
              <a
                href="mailto:crackerskingdom26@gmail.com"
                className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-2.5 text-sm text-left hover:text-festive-gold transition-colors group"
              >
                <Mail size={15} className="text-festive-gold shrink-0 mt-0.5 justify-self-center" />
                <span className="wrap-break-word leading-snug">
                  crackerskingdom26@gmail.com
                </span>
              </a>

              {/* Phone */}
              <a
                href="tel:+918144271571"
                className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-2.5 text-sm text-left hover:text-festive-gold transition-colors"
              >
                <Phone size={15} className="text-festive-gold shrink-0 mt-0.5 justify-self-center" />
                <span>+91 81442 71571</span>
              </a>
            </div>
          </div>

          {/* ── Legal Notice ── */}
          <div className="md:col-span-2 lg:col-span-3 text-center md:text-left">
            <h4 className="font-display font-bold text-festive-gold mb-5">Legal Notice</h4>
            <div className="bg-white/5 border border-white/15 rounded-xl p-4 sm:p-5">
              <p className="text-[11px] sm:text-xs leading-relaxed text-footer-foreground/95 font-medium italic">
                <span className="text-festive-gold font-bold not-italic underline underline-offset-4 mb-2 inline-block">
                  Supreme Court Order (2018):
                </span>
                <br />
                Online sale of firecrackers is not permitted. Customers are requested to select
                products for estimation and submit via the{" "}
                <span className="text-card font-bold">Get Estimate</span> button. We will contact
                you within 2 hrs to confirm. Our shop{" "}
                <span className="text-card font-bold">Crackers Kingdom</span> follows 100% legal
                compliances under License:{" "}
                <span className="text-card font-bold">RSK AGENCIES (No: X/20XX)</span>. We send
                parcels through registered legal transport services as per Sivakasi standards.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/15">
        <div className="max-w-[1400px] mx-auto section-padding py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-footer-foreground/80">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <img src={logo} alt="Crackers Kingdom" className="h-6 w-6 rounded-sm object-cover opacity-90" />
            <span>
              Copyright © 2026 <strong>Crackers Kingdom</strong>. All rights reserved.
            </span>
          </div>
          <span className="text-center sm:text-right">
            Designed by{" "}
            <a href="#" className="text-festive-gold underline hover:opacity-80 transition-opacity">
              Harish Prabhu
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
