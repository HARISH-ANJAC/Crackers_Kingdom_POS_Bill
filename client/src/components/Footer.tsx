import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Facebook, Linkedin, Twitter } from "lucide-react";
import logo from "@/assets/logo.png";
import { ADDRESS_LINES } from "@/lib/businessInfo";

const Footer = () => {
  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="max-w-[1400px] mx-auto section-padding py-10">
        {/*
          Desktop (lg): 12-column grid
            Brand        → col-span-3  (25%)
            Explore      → col-span-2  (17%)
            Reach Us     → col-span-4  (33%)
            Legal Notice → col-span-3  (25%)

          Tablet (md): 2-column grid — Brand full-width row, rest auto-grid
          Mobile: single column
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6">

          {/* ── Brand ── */}
          <div className="space-y-4 md:col-span-2 lg:col-span-3">
            <div className="relative inline-flex w-fit mb-1">
              <div className="absolute -inset-2 rounded-full border border-white/10" />
              <div className="absolute -inset-2 rounded-full border-2 border-transparent border-t-primary border-r-festive-gold animate-spin shadow-[0_0_16px_rgba(247,201,72,0.45)]" />
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-primary/40 bg-linear-to-br from-card/45 via-card/20 to-card/5 p-2.5 backdrop-blur-sm">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-footer/80 ring-1 ring-white/10">
                  <img
                    src={logo}
                    alt="Crackers Kingdom"
                    className="h-[90%] w-[90%] rounded-full object-contain drop-shadow-[0_2px_10px_rgba(247,201,72,0.35)]"
                  />
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed opacity-70 max-w-[220px]">
              Premium fireworks sourced directly from Sivakasi — delivered safely across India.
            </p>
            <div className="flex gap-3 pt-1">
              {[Facebook, Linkedin, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-card/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Explore ── */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-bold text-card mb-5">Explore</h4>
            <nav className="flex flex-col gap-3">
              {[
                { label: "Home", to: "/" },
                { label: "Estimate", to: "/products" },
                { label: "About Us", to: "/about" },
                { label: "Safety Tips", to: "/safety" },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-sm hover:text-primary transition-colors w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Reach Us (Visit & Contact Combined) ── */}
          <div className="lg:col-span-4 lg:pl-10">
            <h4 className="font-display font-bold text-card mb-5">Reach Us</h4>
            <div className="space-y-6">
              {/* Visit Us */}
              <div className="flex items-start gap-2 text-sm">
                <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                <p className="leading-relaxed">
                  {ADDRESS_LINES.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>

              {/* Get in Touch */}
              <div className="space-y-4">
                <a
                  href="mailto:crackerskingdom26@gmail.com"
                  className="flex items-start gap-2 text-sm hover:text-primary transition-colors group"
                >
                  <Mail size={15} className="text-primary shrink-0 mt-0.5" />
                  <p className="wrap-break-word leading-snug">
                    crackerskingdom26@gmail.com
                  </p>
                </a>

                <a
                  href="tel:+918144271571"
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  <Phone size={15} className="text-festive-green shrink-0" />
                  <span>+91 81442 71571</span>
                </a>
              </div>

              <p className="text-xs font-bold text-card">
                GST IN :30239HHJ343HG393
              </p>
            </div>
          </div>

          {/* ── Legal Notice ── */}
          <div className="md:col-span-2 lg:col-span-3">
            <h4 className="font-display font-bold text-primary mb-5">Legal Notice</h4>
            <div className="bg-card/5 border border-card/10 rounded-xl p-4">
              <p className="text-xs leading-relaxed text-footer-foreground/75 font-medium italic text-justify indent-4">
                Online sale of firecrackers is not allowed. You can view and select the products on
                our website only to get a price estimate. After selecting the items, please click
                the <span className="text-card font-bold">"Get Estimate"</span> button and submit
                your request. Our team will contact you within 2 hours to confirm your order
                details. <span className="text-card font-bold">Crackers Kingdom</span> follows all
                legal rules and regulations under License:{" "}
                <span className="text-card font-bold">
                  M/S NANDHINI TRADERS, SURVEY NO: 299/13A1C, 299/15A2
                </span>
                . We send parcels only through legally approved and registered transport services, as
                per the standard guidelines followed in Sivakasi.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-card/10">
        <div className="max-w-[1400px] mx-auto section-padding py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs opacity-60">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Crackers Kingdom" className="h-8 w-8 rounded-full" />
            <span>
              Copyright © 2026 <strong>Crackers Kingdom</strong>. All rights reserved.
            </span>
          </div>
          <span>
            Designed by{" "}
            <a href="#" className="text-primary underline hover:opacity-80 transition-opacity">
              Harish Prabhu
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
