import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Collection from "./pages/Collection";
import Farmers from "./pages/Farmers";
import Products from "./pages/Products";
import Trace from "./pages/Trace";
import CollectorPortal from "./pages/CollectorPortal";
import ProcessorPortal from "./pages/ProcessorPortal";
import TestingLabPortal from "./pages/TestingLabPortal";
import ManufacturerPortal from "./pages/ManufacturerPortal";
import GovViewPortal from "./pages/GovViewPortal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/farmers" element={<Farmers />} />
            <Route path="/products" element={<Products />} />
            <Route path="/trace" element={<Trace />} />
            <Route path="/collector-portal" element={<CollectorPortal />} />
            <Route path="/processor-portal" element={<ProcessorPortal />} />
            <Route path="/testing-lab-portal" element={<TestingLabPortal />} />
            <Route path="/manufacturer-portal" element={<ManufacturerPortal />} />
            <Route path="/gov-view-portal" element={<GovViewPortal />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
