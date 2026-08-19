import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="w-full pb-4 sm:pb-6 lg:pb-8">
      <div className="relative w-full overflow-hidden border-y border-border-soft shadow-md sm:border">
        <div className="relative min-h-[540px] sm:min-h-[620px] lg:min-h-[680px]">
          <Image
            src="/media/vilca.avif"
            alt="Vilcabamba, Ecuador"
            fill
            sizes="100vw"
            priority
            fetchPriority="high"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0B5D1E]/95 via-[#0B5D1E]/45 to-transparent" />

          <div className="relative flex h-full min-h-[540px] flex-col items-center justify-end gap-6 px-6 pb-14 text-center sm:min-h-[620px] sm:pb-16 lg:min-h-[680px] lg:pb-20">
            <div className="flex max-w-2xl flex-col items-center gap-4">
              <h1 className="text-4xl font-medium text-white sm:text-5xl lg:text-6xl">
                Productos naturales desde Vilcabamba
              </h1>
              <p className="max-w-xl text-base text-white/85 sm:text-lg">
                Bienestar y alimentación consciente, con la pureza artesanal del valle de la longevidad.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/tienda"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#C58A1D] px-8 text-label-lg font-medium text-white transition hover:bg-[#B47C18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B5D1E]"
              >
                Ver productos
              </Link>
              <Link
                href="/sobre-nosotros"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/70 px-8 text-label-lg font-medium text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B5D1E]"
              >
                Conócenos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
