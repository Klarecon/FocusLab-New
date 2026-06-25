import Nav from "@/components/layout/Nav";
import Hero from "@/components/landing/Hero";
import BenchmarkProof from "@/components/landing/BenchmarkProof";
import HowItWorks from "@/components/landing/HowItWorks";

import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <BenchmarkProof />
        <HowItWorks />

        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
