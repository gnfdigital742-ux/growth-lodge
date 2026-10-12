export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#0F4C5C]">
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=2000&q=85"
          alt="Luxury hotel room at Growth Lodge"
          className="h-full w-full object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-[#0F4C5C]/75"></div>
      </div>

      {/* Hero Content */}
      <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center px-6 py-20 lg:px-8">
        <div className="max-w-3xl text-white">

          {/* Small Heading */}
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-[#C9A24B]">
            Welcome to Growth Lodge
          </p>

          {/* Main Heading */}
          <h1 className="text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
            Your Comfort.
            <br />
            Our Priority.
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-200 sm:text-xl">
            Experience exceptional comfort, elegant rooms, and outstanding
            hospitality designed to make every stay memorable.
          </p>

          {/* Buttons */}
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a
              href="/signin"
              className="rounded-lg bg-[#C9A24B] px-8 py-4 text-center font-semibold text-white shadow-lg transition hover:bg-[#B38D3B]"
            >
              Book Your Stay
            </a>

            <a
              href="#rooms"
              className="rounded-lg border border-white px-8 py-4 text-center font-semibold text-white transition hover:bg-white hover:text-[#0F4C5C]"
            >
              Explore Rooms
            </a>
          </div>

          {/* Trust Information */}
          <div className="mt-12 flex flex-wrap gap-8 border-t border-white/20 pt-6">

            <div>
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-gray-300">Guest Support</p>
            </div>

            <div>
              <p className="text-2xl font-bold">Premium</p>
              <p className="text-sm text-gray-300">Accommodation</p>
            </div>

            <div>
              <p className="text-2xl font-bold">5★</p>
              <p className="text-sm text-gray-300">Guest Experience</p>
            </div>

          </div>

        </div>
      </div>

    </section>
  );
}