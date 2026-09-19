import FanoronaGame from "@/components/FanoronaGame";

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-10 md:py-10 bg-bark-950">
      <div className="w-full max-w-3xl flex flex-col items-center gap-1 mb-8">
        <h1 className="font-display text-5xl md:text-6xl text-bone tracking-tight">
          Fanorona
        </h1>
        <p className="font-display italic text-bone/60 text-lg md:text-xl text-center tracking-wide">
          Lalao nentim-paharazana Malagasy
        </p>
      </div>
      <FanoronaGame />
      <footer className="mt-auto pt-12 pb-6 w-full text-center">
        <p className="font-body text-bone/50 text-sm md:text-base tracking-wide">
          © 2026 — RASOLOMANANA Heritina Noe
        </p>
      </footer>
    </main>
  );
}
