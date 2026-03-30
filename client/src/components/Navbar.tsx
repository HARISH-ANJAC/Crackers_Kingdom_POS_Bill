import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Estimate", to: "/products" },
  { label: "About Us", to: "/about" },
  { label: "Safety Tips", to: "/safety" },
  { label: "Contact", to: "/contact" },
];

const announcement =
  "Premium Sivakasi Crackers  -  Get up to 40% bulk offer  -  Estimate now, confirm in 2 hours  -  Pan India legal parcel delivery  -  100% safe and certified products";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div className="relative z-40 overflow-hidden border-b border-primary/30 bg-linear-to-r from-primary/95 via-primary to-primary/90 text-primary-foreground">
        <div className="container-narrow section-padding h-9 flex items-center">
          <div className="animate-marquee whitespace-nowrap inline-block text-[11px] md:text-xs font-bold tracking-wide uppercase">
            {announcement}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{announcement}
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl supports-backdrop-filter:bg-background/75">
        <div className="relative container-narrow section-padding h-20 md:h-24 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3 group min-w-0">
            <div className="relative top-2 h-22 w-22 md:h-28 md:w-28 rounded-full p-[2px] bg-linear-to-br from-primary via-festive-gold to-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.35),0_10px_26px_hsl(var(--primary)/0.35)] transition-transform duration-300 group-hover:scale-[1.04]">
              <div className="h-full w-full rounded-full bg-footer/95 ring-1 ring-white/12 flex items-center justify-center overflow-hidden">
                <img
                  src={logo}
                  alt="Crackers Kingdom"
                  className="h-full w-full rounded-full object-contain p-1"
                />
              </div>
            </div>
            <div className="hidden sm:flex flex-col leading-tight min-w-0">
              <span className="font-display text-[1.05rem] md:text-[1.12rem] font-black text-foreground truncate">
                Crackers Kingdom
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Premium Sivakasi Fireworks
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center rounded-full border border-border/70 bg-card/70 p-1 shadow-sm">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 xl:px-4 py-2 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 ${isActive
                    ? "bg-primary text-primary-foreground shadow-[0_6px_20px_hsl(var(--primary)/0.38)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/75"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Button asChild className="rounded-full h-10 px-5 font-black text-xs uppercase tracking-wider">
              <Link to="/products">
                Get Price List <ArrowRight size={14} />
              </Link>
            </Button>
          </div>

          <div className="md:hidden absolute left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-[10px] font-black uppercase tracking-[0.14em] text-primary whitespace-nowrap">
            Minimum Order {"\u20B9"} 3000
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="lg:hidden h-10 w-10 shrink-0 rounded-full border border-border bg-card/90 hover:bg-secondary/80 transition-colors flex items-center justify-center"
                aria-label="Open navigation drawer"
              >
                <Menu size={20} />
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="lg:hidden w-[86vw] max-w-[360px] border-l border-border/70 bg-background/95 p-0 backdrop-blur-xl"
            >
              <div className="h-full flex flex-col">
                <div className="px-5 py-5 border-b border-border/60 bg-linear-to-b from-secondary/40 to-transparent">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full p-[2px] bg-linear-to-br from-primary via-festive-gold to-primary">
                      <div className="h-full w-full rounded-full bg-footer/95 ring-1 ring-white/15 overflow-hidden">
                        <img
                          src={logo}
                          alt="Crackers Kingdom"
                          className="h-full w-full rounded-full object-contain p-1"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-display text-base font-black text-foreground">Crackers Kingdom</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        Menu
                      </p>
                    </div>
                  </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.to;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setOpen(false)}
                        className={`block px-4 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-colors ${isActive
                          ? "bg-primary text-primary-foreground shadow-[0_8px_20px_hsl(var(--primary)/0.3)]"
                          : "bg-secondary/45 text-foreground hover:bg-secondary"
                          }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-4 border-t border-border/60">
                  <Button
                    asChild
                    className="w-full h-11 rounded-2xl font-black text-xs uppercase tracking-wider"
                  >
                    <Link to="/products" onClick={() => setOpen(false)}>
                      <Sparkles size={15} />
                      Get Price List
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
};

export default Navbar;
