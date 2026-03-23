import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Estimate", to: "/products" },
  { label: "About Us", to: "/about" },
  { label: "Safety Tips", to: "/safety" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <div className="bg-primary text-primary-foreground overflow-hidden py-2 font-body text-sm font-semibold">
        <div className="animate-marquee whitespace-nowrap inline-block">
          ✨ Exclusive Diwali Offer! Get up to 40% Off on Bulk Orders! ✨&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          🚚 Order via Estimate — Dispatched via Registered Parcel Service to Your City! 🚚&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          ✨ Premium Quality — 100% Safe & Certified Crackers from Sivakasi! ✨&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          ✨ Exclusive Diwali Offer! Get up to 40% Off on Bulk Orders! ✨&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          🚚 Order via Estimate — Dispatched via Registered Parcel Service to Your City! 🚚&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          ✨ Premium Quality — 100% Safe & Certified Crackers from Sivakasi! ✨&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </div>
      </div>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300">
        <div className="container-narrow section-padding flex items-center justify-between h-20 md:h-24">
          <Link to="/" className="flex items-center gap-3 md:gap-4 group">
            <div className=" h-16 w-20 md:h-20 md:w-24 rounded-sm md:rounded-lg bg-black/70 p-0.5 shadow-md border border-border/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
              <img src={logo} alt="Crackers Kingdom" className="h-16 w-28 md:h-20 md:w-32 object-contain drop-shadow-sm" />
            </div>
            {/* <div className="flex flex-col">
              <span className="font-display font-black text-lg md:text-2xl tracking-tighter text-foreground leading-[0.8] uppercase italic">
                CRACKERS
              </span>
              <span className="font-display font-black text-lg md:text-2xl tracking-tighter text-primary leading-[0.8] uppercase italic">
                KINGDOM
              </span>
            </div> */}
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${location.pathname === link.to
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button asChild className="rounded-full gap-1.5">
              <Link to="/products">
                Get Price List <ArrowRight size={14} />
              </Link>
            </Button>
          </div>

          <button
            className="md:hidden p-2 rounded-md hover:bg-secondary transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-border bg-card">
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${location.pathname === link.to
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild className="mt-2 rounded-full gap-1.5">
                <Link to="/products" onClick={() => setOpen(false)}>
                  Get Started <ArrowRight size={14} />
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
