import Link from "next/link";

const HeroBanner = () => {
  return (
    <section className="bg-accent">
      <div className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Rent Smarter with Markro
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
            Find the things you need or list what you own. Simple, local rentals
            made easy.
          </p>
          <div className="mt-8">
            <Link
              href="/browse-ads"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
            >
              Browse Ads
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
