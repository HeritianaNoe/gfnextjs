import FanoronaGame from "@/components/FanoronaGame";

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-10 md:py-10 bg-bark-960">
      <div className="w-full max-w-3xl flex flex-col items-center gap-1 mb-8">
        <h1 className="font-display text-5xl md:text-6xl text-bone tracking-tight">
          Fanorona
        </h1>
        <p className="font-display italic text-bone/60 text-lg md:text-xl text-center tracking-wide">
          Lalao nentim-paharazana Malagasy
        </p>
      </div>
      <FanoronaGame />
      <section className="w-full max-w-3xl mt-6 mb-4">
        <div
          className="w-full h-px mb-4"
          style={{ backgroundColor: "rgba(232, 220, 200, 0.45)" }}
        />
        <p className="font-body text-bone/70 text-sm md:text-base leading-relaxed text-center tracking-wide">
          Ny Fanorona dia lalao nentim-paharazana malagasy izay hita teto ampovoan-tany.
          Riatra na Ady no fomba filaza ny lalao voalohany amin&apos;ny Fanorona ary
          fifanarahana eo amin&apos;ny mpifanandrina ny fandehanana voalohany amin&apos;ny
          lalao Riatra. Vela kosa no dingana manaraka, izay midika ho sazy eo amin&apos;ny
          lalao fanorona, araka izany dia tsimaitsy efaina izany sazy izany raha resy eo
          amin&apos;ny lalao Riatra. Ny lalao Vela dia maneho ny maha-olona sy ny
          hatsaram-panahin&apos;ny Malagasy: ny tanjona dia tsy ny hamono fotsiny, fa ny
          hamelona indray izay resy. Mankasitraka.
        </p>
      </section>

      <footer className="mt-auto pt-12 pb-6 w-full max-w-3xl flex items-center justify-between gap-4">
        <a
          href="https://lakabe.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-bone/50 hover:text-bone text-sm md:text-base tracking-wide transition-colors"
        >
          LakaBe
        </a>
        <p className="font-body text-bone/40 text-sm md:text-base tracking-wide">
          © 2026 — RASOLOMANANA Heritina Noe
        </p>
        <a
          href="https://zakaranda.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-bone/50 hover:text-bone text-sm md:text-base tracking-wide transition-colors"
        >
          Mpanoratra
        </a>
      </footer>
    </main>
  );
}
