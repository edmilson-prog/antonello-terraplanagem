import { SiteHeader } from "@/features/site/components/site-header";
import { HeroSection } from "@/features/site/components/hero-section";
import { MarqueeServicos } from "@/features/site/components/marquee-servicos";
import { ContadoresSection } from "@/features/site/components/contadores-section";
import { ServicosSection } from "@/features/site/components/servicos-section";
import { FrotaSection } from "@/features/site/components/frota-section";
import { ProcessoSection } from "@/features/site/components/processo-section";
import { ContatoBand } from "@/features/site/components/contato-band";
import { SiteFooter } from "@/features/site/components/site-footer";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="hazard-stripe h-1.5" aria-hidden />
      <SiteHeader />
      <main>
        <HeroSection />
        <MarqueeServicos />
        <ContadoresSection />
        <ServicosSection />
        <FrotaSection />
        <ProcessoSection />
        <ContatoBand />
      </main>
      <SiteFooter />
      <div className="hazard-stripe h-1.5" aria-hidden />
    </div>
  );
}
