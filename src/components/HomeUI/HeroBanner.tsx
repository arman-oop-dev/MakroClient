import { ArrowRight, Search } from "lucide-react";

const HeroBanner = () => {
  return (
    <section className="relative isolate overflow-hidden bg-[#052e3b] text-white">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(120deg,#052e3b_0%,#073b4c_48%,#0a5c70_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute -top-32 -right-20 -z-10 size-[28rem] rounded-full bg-primary/25 blur-[100px]" />
      <div className="absolute -bottom-24 left-1/4 -z-10 size-72 rounded-full bg-cyan-300/10 blur-[90px]" />

      <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl leading-[1.05] font-semibold tracking-[-0.045em] sm:text-5xl lg:text-6xl xl:text-7xl">
          Find the right gear
          <span className="block text-cyan-300">for every job</span>
        </h1>

        <form
          action="/browse-ads"
          method="get"
          aria-label="Search equipment"
          className="mt-10 flex w-full max-w-2xl flex-col gap-3 rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl shadow-[#021820]/30 backdrop-blur-xl sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search
              className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-primary"
              aria-hidden="true"
            />
            <input
              type="search"
              name="search"
              aria-label="Search equipment"
              placeholder="Search equipment..."
              className="h-12 w-full rounded-xl bg-white pr-4 pl-12 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#052e3b] focus-visible:outline-none"
          >
            Search
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
};

export default HeroBanner;
