import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="w-full">
      <div className="relative w-full overflow-hidden">
        <div className="relative min-h-[540px] sm:min-h-[620px] lg:min-h-[680px]">
          <Image
            src="/media/vilcabamba-hero-mobile.jpg"
            alt="Vilcabamba, Ecuador"
            fill
            sizes="100vw"
            priority
            fetchPriority="high"
            className="object-cover lg:hidden"
          />
          <Image
            src="/media/vilcabamba-hero-final.jpg"
            alt=""
            fill
            sizes="100vw"
            priority
            className="hidden object-cover lg:block"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#0B5D1E]/10 via-[#0B5D1E]/40 to-[#0B5D1E]/85 max-lg:bg-gradient-to-t max-lg:from-[#0B5D1E]/75 max-lg:via-[#0B5D1E]/35 max-lg:to-black/10" />

          <div className="relative grid min-h-[80vh] grid-cols-1 lg:grid-cols-2">
            <div aria-hidden="true" className="hidden lg:block" />

            <div className="flex flex-col items-center justify-center gap-6 px-6 py-14 text-center sm:px-10 lg:items-start lg:px-12 lg:py-20 lg:text-left xl:px-20">
              <div className="flex max-w-2xl flex-col items-center gap-4 lg:items-start">
                <span className="inline-flex rounded-full border border-[#E2B84B]/60 bg-[#C58A1D]/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#F5D77E] shadow-sm backdrop-blur-sm sm:text-sm">
                  Bienestar natural y artesanal
                </span>
                <h1 className="text-4xl font-medium text-white sm:text-5xl lg:text-5xl xl:text-6xl">
                Productos naturales desde Vilcabamba (valle de la longevidad)
                </h1>
                <p className="max-w-xl text-base text-white/85 sm:text-lg">
                  Bienestar y alimentación consciente, con la pureza artesanal del valle de la longevidad.
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 sm:flex-row lg:items-start">
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
      </div>
    </section>
  );
}
