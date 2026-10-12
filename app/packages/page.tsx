export default function PackagesPage() {
  const packages = [
    {
      name: "Starter",
      description: "For small hotels getting started with digital management.",
      price: "₦50,000",
      period: "/ month",
      popular: false,
      features: [
        "Hotel Administration",
        "Room Management",
        "Reservation Management",
        "Guest Management",
        "Basic Staff Management",
        "Basic Reports",
        "Role-Based Access",
        "Email Support",
      ],
    },
    {
      name: "Professional",
      description: "For growing hotels that need more powerful management tools.",
      price: "₦100,000",
      period: "/ month",
      popular: true,
      features: [
        "Everything in Starter",
        "Advanced Room Management",
        "Advanced Reservations",
        "Complete Staff Management",
        "Payments & Finance",
        "Advanced Reports & Analytics",
        "Notifications",
        "Priority Support",
      ],
    },
    {
      name: "Enterprise",
      description: "For hotels that need advanced solutions and dedicated support.",
      price: "Custom",
      period: "",
      popular: false,
      features: [
        "Everything in Professional",
        "Multi-Hotel Management",
        "Advanced Analytics",
        "Custom Configuration",
        "Advanced Access Control",
        "Dedicated Support",
        "Business Integration",
        "Custom Solutions",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-white text-[#1E1B4B]">

      {/* ================= NAVIGATION ================= */}
      <nav className="border-b border-purple-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          {/* Logo */}
          <a
            href="/"
            className="text-2xl font-bold tracking-tight text-[#5B21B6]"
          >
            Growth Lodge
          </a>

          {/* Navigation */}
          <div className="hidden items-center gap-8 md:flex">

            <a
              href="/"
              className="font-medium text-gray-600 transition hover:text-[#5B21B6]"
            >
              Home
            </a>

            <a
              href="/about"
              className="font-medium text-gray-600 transition hover:text-[#5B21B6]"
            >
              About Us
            </a>

            <a
              href="/features"
              className="font-medium text-gray-600 transition hover:text-[#5B21B6]"
            >
              Features
            </a>

            <a
              href="/packages"
              className="font-medium text-[#5B21B6]"
            >
              Packages
            </a>

            <a
              href="/contact"
              className="font-medium text-gray-600 transition hover:text-[#5B21B6]"
            >
              Contact Us
            </a>

            <a
              href="/signin"
              className="rounded-lg bg-[#5B21B6] px-6 py-3 font-semibold text-white transition hover:bg-[#4C1D95]"
            >
              Sign In
            </a>

          </div>

          {/* Mobile Button */}
          <button
            type="button"
            className="rounded-lg border border-purple-200 px-3 py-2 text-xl text-[#5B21B6] md:hidden"
          >
            ☰
          </button>

        </div>
      </nav>


      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#5B21B6] via-[#6D28D9] to-[#A78BFA] px-6 py-24 text-white">

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-white/10" />

        <div className="relative mx-auto max-w-5xl text-center">

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-purple-100">
            Growth Lodge Packages
          </p>

          <h1 className="mt-5 text-5xl font-bold leading-tight md:text-6xl">
            Choose the Right Solution
            <span className="block text-[#F5F3FF]">
              for Your Hotel
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-purple-50 md:text-xl">
            Flexible packages designed to help hotels of different
            sizes manage their operations, teams, and business growth.
          </p>

        </div>

      </section>


      {/* ================= PACKAGES ================= */}
      <section className="bg-[#F5F3FF] px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="grid items-stretch gap-8 lg:grid-cols-3">

            {packages.map((pkg) => (

              <div
                key={pkg.name}
                className={`relative flex flex-col rounded-3xl bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  pkg.popular
                    ? "border-2 border-[#5B21B6] lg:-translate-y-3"
                    : "border border-purple-100"
                }`}
              >

                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#5B21B6] px-5 py-2 text-sm font-bold text-white">
                    Most Popular
                  </div>
                )}

                {/* Package Name */}
                <div>

                  <h2 className="text-2xl font-bold text-[#1E1B4B]">
                    {pkg.name}
                  </h2>

                  <p className="mt-3 min-h-[72px] leading-6 text-gray-600">
                    {pkg.description}
                  </p>

                </div>


                {/* Price */}
                <div className="mt-7 border-b border-gray-100 pb-7">

                  <div className="flex items-end gap-2">

                    <span className="text-4xl font-bold text-[#5B21B6]">
                      {pkg.price}
                    </span>

                    {pkg.period && (
                      <span className="pb-1 text-sm text-gray-500">
                        {pkg.period}
                      </span>
                    )}

                  </div>

                </div>


                {/* Features */}
                <div className="flex-1">

                  <h3 className="mt-7 font-bold text-[#1E1B4B]">
                    What's Included
                  </h3>

                  <ul className="mt-5 space-y-4">

                    {pkg.features.map((feature) => (

                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-gray-600"
                      >

                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F5F3FF] text-xs font-bold text-[#5B21B6]">
                          ✓
                        </span>

                        <span>
                          {feature}
                        </span>

                      </li>

                    ))}

                  </ul>

                </div>


                {/* Button */}
                <a
                  href="/contact"
                  className={`mt-8 block rounded-lg px-6 py-4 text-center font-semibold transition ${
                    pkg.popular
                      ? "bg-[#5B21B6] text-white hover:bg-[#4C1D95]"
                      : "border-2 border-[#5B21B6] text-[#5B21B6] hover:bg-[#5B21B6] hover:text-white"
                  }`}
                >
                  {pkg.name === "Enterprise"
                    ? "Contact Sales"
                    : "Get Started"}
                </a>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ================= COMPARISON ================= */}
      <section className="bg-white px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#7C3AED]">
              Flexible Solutions
            </p>

            <h2 className="mt-4 text-4xl font-bold text-[#1E1B4B] md:text-5xl">
              Built for Different Hotel Needs
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              Whether you manage a small hotel or a larger hospitality
              business, Growth Lodge provides a solution that can grow
              with your operations.
            </p>

          </div>


          <div className="mt-14 grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl border border-purple-100 p-8">

              <div className="text-4xl">
                🏨
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Small Hotels
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Start with the essential tools you need to organize
                rooms, reservations, guests, and daily operations.
              </p>

            </div>


            <div className="rounded-2xl border-2 border-[#A78BFA] bg-[#F5F3FF] p-8">

              <div className="text-4xl">
                📈
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Growing Hotels
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Get advanced tools for managing larger teams,
                payments, reporting, and expanding operations.
              </p>

            </div>


            <div className="rounded-2xl border border-purple-100 p-8">

              <div className="text-4xl">
                🏢
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Hotel Groups
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Access enterprise-level solutions designed for
                complex and multi-hotel operations.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= FAQ ================= */}
      <section className="bg-[#F5F3FF] px-6 py-24">

        <div className="mx-auto max-w-4xl">

          <div className="text-center">

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#7C3AED]">
              Frequently Asked Questions
            </p>

            <h2 className="mt-4 text-4xl font-bold text-[#1E1B4B] md:text-5xl">
              Questions About Our Packages?
            </h2>

          </div>


          <div className="mt-12 space-y-5">

            <div className="rounded-2xl bg-white p-7 shadow-sm">

              <h3 className="text-lg font-bold">
                Can I change my package later?
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Yes. Your hotel's needs can change as your business
                grows, so your package can be reviewed and adjusted
                when necessary.
              </p>

            </div>


            <div className="rounded-2xl bg-white p-7 shadow-sm">

              <h3 className="text-lg font-bold">
                Is there a setup process?
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Yes. Our team can help configure your hotel profile,
                users, rooms, and other required settings before you
                begin using the platform.
              </p>

            </div>


            <div className="rounded-2xl bg-white p-7 shadow-sm">

              <h3 className="text-lg font-bold">
                Can Growth Lodge support multiple hotels?
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                The Enterprise package is designed to support larger
                hotel operations and multi-hotel management.
              </p>

            </div>


            <div className="rounded-2xl bg-white p-7 shadow-sm">

              <h3 className="text-lg font-bold">
                How can I get started?
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Contact the Growth Lodge team and we can discuss your
                hotel's requirements and recommend the appropriate
                solution.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-6 py-24 text-white">

        <div className="mx-auto max-w-4xl text-center">

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-purple-200">
            Let's Work Together
          </p>

          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            Find the Right Solution for Your Hotel
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-7 text-purple-100">
            Talk to the Growth Lodge team about your hotel's needs
            and discover how our platform can support your operations.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">

            <a
              href="/contact"
              className="rounded-lg bg-white px-8 py-4 font-semibold text-[#5B21B6] transition hover:bg-[#F5F3FF]"
            >
              Contact Us
            </a>

            <a
              href="/features"
              className="rounded-lg border-2 border-white px-8 py-4 font-semibold text-white transition hover:bg-white hover:text-[#5B21B6]"
            >
              Explore Features
            </a>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="bg-[#1E1B4B] px-6 py-12 text-white">

        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">

          {/* Brand */}
          <div>

            <h2 className="text-2xl font-bold">
              Growth Lodge
            </h2>

            <p className="mt-4 leading-6 text-purple-200">
              Modern hotel management technology designed to help
              hotels operate smarter and grow.
            </p>

          </div>


          {/* Company */}
          <div>

            <h3 className="font-bold text-[#A78BFA]">
              Company
            </h3>

            <div className="mt-4 space-y-3 text-purple-200">

              <a
                href="/"
                className="block transition hover:text-white"
              >
                Home
              </a>

              <a
                href="/about"
                className="block transition hover:text-white"
              >
                About Us
              </a>

              <a
                href="/features"
                className="block transition hover:text-white"
              >
                Features
              </a>

              <a
                href="/packages"
                className="block transition hover:text-white"
              >
                Packages
              </a>

              <a
                href="/contact"
                className="block transition hover:text-white"
              >
                Contact Us
              </a>

            </div>

          </div>


          {/* Platform */}
          <div>

            <h3 className="font-bold text-[#A78BFA]">
              Platform
            </h3>

            <div className="mt-4 space-y-3 text-purple-200">

              <p>Hotel Administration</p>
              <p>Room Management</p>
              <p>Reservations</p>
              <p>Guest Management</p>
              <p>Staff Management</p>
              <p>Reports & Analytics</p>

            </div>

          </div>


          {/* Contact */}
          <div>

            <h3 className="font-bold text-[#A78BFA]">
              Contact Us
            </h3>

            <div className="mt-4 space-y-3 text-purple-200">

              <p>📧 info@growthlodge.com</p>

              <a
                href="tel:09114545197"
                className="block transition hover:text-white"
              >
                📞 09114545197
              </a>

              <p>📍 Nigeria</p>

            </div>

          </div>

        </div>


        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-sm text-purple-300">
          © 2026 Growth Lodge. All rights reserved.
        </div>

      </footer>

    </main>
  );
}