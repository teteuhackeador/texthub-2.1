import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import ParticlesBackground from "@/components/ParticlesBackground";
import GlobalEnterToProcess from "@/components/GlobalEnterToProcess";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RemoveDuplicates from "./pages/RemoveDuplicates";
import RemoveKeyword from "./pages/RemoveKeyword";
import RemoveCpfSymbols from "./pages/RemoveCpfSymbols";
import RemoveUrls from "./pages/RemoveUrls";
import KeepKeyword from "./pages/KeepKeyword";
import FilterCpf from "./pages/FilterCpf";
import FilterEmail from "./pages/FilterEmail";
import FilterUser from "./pages/FilterUser";
import FilterNumeric from "./pages/FilterNumeric";
import FilterByLength from "./pages/FilterByLength";
import RemoveDomain from "./pages/RemoveDomain";
import RemoveChecked from "./pages/RemoveChecked";
import SplitParts from "./pages/SplitParts";
import HarReducer from "./pages/HarReducer";
import AddSuffix from "./pages/AddSuffix";
import FilterIntelX from "./pages/FilterIntelX";
import FilterCloud from "./pages/FilterCloud";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="relative flex min-h-screen w-full">
            <ParticlesBackground />
            <GlobalEnterToProcess />

            <div className="relative z-10 flex-1 flex flex-col">
              <header className="h-12 flex items-center border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 transition-all duration-300">
                <div className="flex-1 flex items-center justify-center">
                  <span className="font-semibold text-gradient">MultiTools</span>
                </div>
                <SidebarTrigger className="mr-4" />
              </header>

              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dividir-partes" element={<SplitParts />} />
                  <Route path="/har-reducer" element={<HarReducer />} />
                  <Route path="/filter-cpf" element={<FilterCpf />} />
                  <Route path="/filter-email" element={<FilterEmail />} />
                  <Route path="/filter-user" element={<FilterUser />} />
                  <Route path="/filter-numeric" element={<FilterNumeric />} />
                  <Route path="/filter-by-length" element={<FilterByLength />} />
                  <Route path="/filter-intelx" element={<FilterIntelX />} />
                  <Route path="/filter-cloud" element={<FilterCloud />} />
                  <Route path="/add-suffix" element={<AddSuffix />} />
                  <Route path="/remove-domain" element={<RemoveDomain />} />
                  <Route path="/keep-keyword" element={<KeepKeyword />} />
                  <Route path="/remove-checked" element={<RemoveChecked />} />
                  <Route path="/remove-duplicates" element={<RemoveDuplicates />} />
                  <Route path="/remove-keyword" element={<RemoveKeyword />} />
                  <Route path="/remove-cpf-symbols" element={<RemoveCpfSymbols />} />
                  <Route path="/remove-urls" element={<RemoveUrls />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
            <div className="relative z-10">
              <AppSidebar />
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
