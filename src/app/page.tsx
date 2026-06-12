import Nav from "@/components/layout/Nav";
import Hero from "@/components/landing/Hero";
import ToolCards from "@/components/landing/ToolCards";
import BenchmarkProof from "@/components/landing/BenchmarkProof";
import RoleLenses from "@/components/landing/RoleLenses";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <ToolCards />
        <BenchmarkProof />
        <RoleLenses />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
