import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import Safety from "./pages/Safety";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import ScrollTop from "@/components/ScrollTop";

import { useState } from "react";
import OpenStatement from "@/components/ui/OpenStatement";
import QuickEnquiry from "@/components/QuickEnquiry";
import WhatsAppButton from "./components/WhatsAppButton";

const queryClient = new QueryClient();

const App = () => {
  const [isStatementOpen, setIsStatementOpen] = useState(true);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SEO /> {/* Global Default SEO */}
          <Toaster />
          <BrowserRouter>
            <OpenStatement isOpen={isStatementOpen} onOpenChange={setIsStatementOpen} />
            <ScrollTop />
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
            <WhatsAppButton />
            <QuickEnquiry />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
