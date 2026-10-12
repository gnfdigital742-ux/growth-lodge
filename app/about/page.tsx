export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-[#1E1B4B]">

      {/* ================= NAVIGATION ================= */}
      <nav className="border-b border-purple-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <a
            href="/"
            className="text-2xl font-bold text-[#5B21B6]"
          >
            Growth Lodge
          </a>

          <div className="hidden items-center gap-8 md:flex">

            <a
              href="/"
              className="font-medium text-gray-600 transition hover:text-[#5B21B6]"
            >
              Home
            </a>

            <a
              href="/about"
              className="font-medium text-[#5B21B6]"
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
              className="font-medium text-gray-600 transition hover:text-[#5B21B6]"
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

        </div>
      </nav>


      {/* ================= PAGE HERO ================= */}
      <section className="bg-gradient-to-br from-[#5B21B6] to-[#A78BFA] px-6 py-24 text-white">

        <div className="mx-auto max-w-5xl text-center">

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-purple-100">
            About Growth Lodge
          </p>

          <h1 className="mt-5 text-5xl font-bold md:text-6xl">
            Helping Hotels Manage
            <span className="block text-[#F5F3FF]">
              Smarter and Better
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-purple-50">
            Growth Lodge is a modern hotel management platform built
            to help hotels simplify operations, improve efficiency,
            and create sustainable business growth.
          </p>

        </div>

      </section>


      {/* ================= OUR STORY ================= */}
      <section className="bg-white px-6 py-24">

        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">

          <div>

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#7C3AED]">
              Our Story
            </p>

            <h2 className="mt-4 text-4xl font-bold text-[#1E1B4B] md:text-5xl">
              Built Around the Needs of Modern Hotels
            </h2>

            <p className="mt-6 leading-8 text-gray-600">
              Managing a hotel involves many moving parts. Rooms,
              reservations, guests, staff, payments, and reports all
              need to work together.
            </p>

            <p className="mt-4 leading-8 text-gray-600">
              Growth Lodge brings these essential operations together
              in one organized platform, giving hotel teams a simpler
              way to manage their daily activities.
            </p>

          </div>


          <div className="rounded-3xl bg-[#F5F3FF] p-8">

            <div className="grid gap-5 sm:grid-cols-2">

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="text-3xl">🏨</div>

                <h3 className="mt-4 font-bold">
                  Hotel Operations
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Organize your hotel's daily activities.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="text-3xl">📊</div>

                <h3 className="mt-4 font-bold">
                  Business Insights
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Understand your hotel's performance.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="text-3xl">👥</div>

                <h3 className="mt-4 font-bold">
                  Team Management
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Keep teams organized and connected.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="text-3xl">🔐</div>

                <h3 className="mt-4 font-bold">
                  Secure Access
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Control access according to user roles.
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= MISSION & VISION ================= */}
      <section className="bg-[#F5F3FF] px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-8 md:grid-cols-2">

            {/* Mission */}
            <div className="rounded-3xl bg-white p-10 shadow-sm">

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#5B21B6] text-2xl">
                🎯
              </div>

              <h2 className="mt-6 text-3xl font-bold text-[#1E1B4B]">
                Our Mission
              </h2>

              <p className="mt-5 leading-8 text-gray-600">
                To provide hotels with reliable and easy-to-use
                technology that simplifies management, improves
                productivity, and supports better business decisions.
              </p>

            </div>


            {/* Vision */}
            <div className="rounded-3xl bg-white p-10 shadow-sm">

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#7C3AED] text-2xl">
                👁️
              </div>

              <h2 className="mt-6 text-3xl font-bold text-[#1E1B4B]">
                Our Vision
              </h2>

              <p className="mt-5 leading-8 text-gray-600">
                To become a trusted technology platform that helps
                hotels operate efficiently, deliver better experiences,
                and achieve sustainable growth.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= OUR VALUES ================= */}
      <section className="bg-white px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#7C3AED]">
              Our Values
            </p>

            <h2 className="mt-4 text-4xl font-bold text-[#1E1B4B] md:text-5xl">
              What Drives Growth Lodge
            </h2>

          </div>


          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            {[
              [
                "💡",
                "Innovation",
                "We continuously look for better ways to solve hotel management challenges.",
              ],
              [
                "🤝",
                "Partnership",
                "We work with hotels as partners and focus on their long-term success.",
              ],
              [
                "⭐",
                "Excellence",
                "We aim to deliver a reliable and professional platform.",
              ],
              [
                "🔒",
                "Trust",
                "We value security, transparency, and responsible management of information.",
              ],
            ].map(([icon, title, text]) => (

              <div
                key={title}
                className="rounded-2xl border border-purple-100 p-7 transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="text-3xl">
                  {icon}
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#1E1B4B]">
                  {title}
                </h3>

                <p className="mt-3 leading-6 text-gray-600">
                  {text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-6 py-24 text-white">

        <div className="mx-auto max-w-4xl text-center">

          <h2 className="text-4xl font-bold md:text-5xl">
            Ready to Grow Your Hotel?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-7 text-purple-100">
            Discover how Growth Lodge can help your hotel operate
            smarter and more efficiently.
          </p>

          <a
            href="/contact"
            className="mt-8 inline-block rounded-lg bg-white px-8 py-4 font-semibold text-[#5B21B6] transition hover:bg-[#F5F3FF]"
          >
            Get Started
          </a>

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