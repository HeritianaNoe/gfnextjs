import FanoronaGame from "@/components/FanoronaGame";

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-10 md:py-16 bg-bark-950">
      <div className="w-full max-w-3xl flex flex-col items-center gap-2 mb-8">
        <h1 className="font-display text-5xl md:text-6xl text-bone tracking-tight">
          Fanorona
        </h1>
        <p className="font-body text-bone/50 text-sm md:text-base text-center max-w-md">
          Ny lalao ara-tantana malagasy. Misambora, mizara, ary resio ny ordinatera.
        </p>
      </div>
      <FanoronaGame />
    </main>
  );
}
