
"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-[#1E1B4B]">

      {/* ================= NAVBAR ================= */}
      <nav className="border-b border-purple-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-[#5B21B6]"
          >
            Growth Lodge
          </Link>

          <div className="hidden items-center gap-8 md:flex">

            <Link
              href="/"
              className="font-bold text-[#5B21B6]"
            >
              Home
            </Link>

            <Link
              href="/about"
              className="font-semibold text-gray-600 transition hover:text-[#5B21B6]"
            >
              About Us
            </Link>

            <Link
              href="/features"
              className="font-semibold text-gray-600 transition hover:text-[#5B21B6]"
            >
              Features
            </Link>

            <Link
              href="/packages"
              className="font-semibold text-gray-600 transition hover:text-[#5B21B6]"
            >
              Packages
            </Link>

            <Link
              href="/contact"
              className="font-semibold text-gray-600 transition hover:text-[#5B21B6]"
            >
              Contact Us
            </Link>

            <Link
              href="/signin"
              className="rounded-lg bg-[#5B21B6] px-6 py-3 font-bold text-white transition hover:bg-[#4C1D95]"
            >
              Sign In
            </Link>

          </div>

          <Link
            href="/signin"
            className="rounded-lg bg-[#5B21B6] px-4 py-2 font-bold text-white md:hidden"
          >
            Sign In
          </Link>

        </div>
      </nav>


      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#4C1D95] via-[#6D28D9] to-[#A78BFA] px-6 py-24 text-white md:py-32">

        {/* Decorative circles */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-white/10" />
        <div className="absolute left-1/2 top-20 h-40 w-40 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-7xl">

          <div className="grid items-center gap-16 lg:grid-cols-2">

            {/* HERO CONTENT */}
            <div>

              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-5 py-2 backdrop-blur-sm">
                <span className="mr-2">✨</span>
                <span className="text-sm font-bold">
                  Modern Hotel Management Platform
                </span>
              </div>

              <p className="mt-7 text-sm font-extrabold uppercase tracking-[0.25em] text-purple-100">
                Welcome to Growth Lodge
              </p>

              <h1 className="mt-5 text-5xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
                Smarter Hotel
                <span className="block text-[#F5F3FF]">
                  Management Starts Here
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-purple-50 md:text-xl">
                Growth Lodge gives hotels one powerful platform to
                manage rooms, reservations, guests, staff, payments,
                reports, and daily operations with ease.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">

                <Link
                  href="/signin"
                  className="rounded-xl bg-white px-8 py-4 text-center font-extrabold text-[#5B21B6] shadow-xl transition hover:-translate-y-1 hover:bg-[#F5F3FF]"
                >
                  Get Started
                </Link>

                <Link
                  href="/about"
                  className="rounded-xl border-2 border-white px-8 py-4 text-center font-extrabold text-white transition hover:bg-white hover:text-[#5B21B6]"
                >
                  Learn More
                </Link>

              </div>

              {/* HERO TRUST POINTS */}
              <div className="mt-10 flex flex-wrap gap-6 text-sm font-bold text-purple-100">

                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#5B21B6]">
                    ✓
                  </span>
                  Easy to Use
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#5B21B6]">
                    ✓
                  </span>
                  Secure
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#5B21B6]">
                    ✓
                  </span>
                  Built for Hotels
                </div>

              </div>

            </div>


            {/* ================= HERO CARD ================= */}
            <div className="rounded-3xl bg-white/15 p-4 shadow-2xl backdrop-blur-md">

              <div className="rounded-2xl bg-white p-8 shadow-2xl">

                {/* CARD HEADER */}
                <div className="border-b border-gray-200 pb-6">

                  <p className="text-sm font-extrabold uppercase tracking-wider text-[#7C3AED]">
                    Growth Lodge
                  </p>

                  <h2 className="mt-2 text-3xl font-extrabold text-[#1E1B4B]">
                    Hotel Management
                  </h2>

                  <p className="mt-2 font-medium text-gray-500">
                    Everything your hotel needs in one platform.
                  </p>

                </div>


                {/* FEATURES */}
                <div className="mt-6 grid grid-cols-2 gap-5">

                  {/* ROOM MANAGEMENT */}
                  <div className="rounded-2xl border border-purple-100 bg-[#F5F3FF] p-6 transition hover:-translate-y-1 hover:shadow-lg">

                    <div className="text-4xl">
                      🛏️
                    </div>

                    <p className="mt-4 text-lg font-extrabold text-[#1E1B4B]">
                      Room Management
                    </p>

                    <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                      Organize rooms and availability easily.
                    </p>

                  </div>


                  {/* RESERVATIONS */}
                  <div className="rounded-2xl border border-purple-100 bg-[#F5F3FF] p-6 transition hover:-translate-y-1 hover:shadow-lg">

                    <div className="text-4xl">
                      📅
                    </div>

                    <p className="mt-4 text-lg font-extrabold text-[#1E1B4B]">
                      Reservations
                    </p>

                    <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                      Keep bookings organized and accessible.
                    </p>

                  </div>


                  {/* GUEST MANAGEMENT */}
                  <div className="rounded-2xl border border-purple-100 bg-[#F5F3FF] p-6 transition hover:-translate-y-1 hover:shadow-lg">

                    <div className="text-4xl">
                      👥
                    </div>

                    <p className="mt-4 text-lg font-extrabold text-[#1E1B4B]">
                      Guest Management
                    </p>

                    <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                      Keep important guest information organized.
                    </p>

                  </div>


                  {/* REPORTS */}
                  <div className="rounded-2xl border border-purple-100 bg-[#F5F3FF] p-6 transition hover:-translate-y-1 hover:shadow-lg">

                    <div className="text-4xl">
                      📊
                    </div>

                    <p className="mt-4 text-lg font-extrabold text-[#1E1B4B]">
                      Reports
                    </p>

                    <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                      Understand your hotel's operations better.
                    </p>

                  </div>

                </div>


                {/* CARD BOTTOM */}
                <div className="mt-6 rounded-2xl bg-[#5B21B6] p-6 text-center text-white shadow-lg">

                  <p className="text-lg font-extrabold">
                    Everything your hotel needs in one platform.
                  </p>

                  <Link
                    href="/signin"
                    className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-extrabold text-[#5B21B6] transition hover:bg-[#F5F3FF]"
                  >
                    Get Started
                  </Link>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ================= FEATURES ================= */}
      <section className="bg-white px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-[#7C3AED]">
              Powerful Features
            </p>

            <h2 className="mt-4 text-4xl font-extrabold md:text-5xl">
              Everything Your Hotel Needs
            </h2>

            <p className="mt-5 font-medium leading-7 text-gray-600">
              Manage your hotel's essential operations from one
              organized platform.
            </p>

          </div>


          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {[
              [
                "🏨",
                "Hotel Administration",
                "Manage your hotel's information, settings, and operations.",
              ],
              [
                "🛏️",
                "Room Management",
                "Manage rooms, categories, availability, and room status.",
              ],
              [
                "📅",
                "Reservations",
                "Keep track of bookings, check-ins, check-outs, and reservations.",
              ],
              [
                "👥",
                "Guest Management",
                "Keep guest information organized and accessible.",
              ],
              [
                "👨‍💼",
                "Staff Management",
                "Manage staff accounts, roles, and responsibilities.",
              ],
              [
                "📊",
                "Reports & Analytics",
                "Turn hotel information into useful business insights.",
              ],
            ].map(([icon, title, description]) => (

              <div
                key={title}
                className="rounded-2xl border border-purple-100 p-8 transition hover:-translate-y-1 hover:shadow-xl"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#F5F3FF] text-2xl">
                  {icon}
                </div>

                <h3 className="mt-5 text-xl font-extrabold">
                  {title}
                </h3>

                <p className="mt-3 font-medium leading-7 text-gray-600">
                  {description}
                </p>

              </div>

            ))}

          </div>


          <div className="mt-10 text-center">

            <Link
              href="/features"
              className="inline-block rounded-lg bg-[#5B21B6] px-7 py-3 font-bold text-white transition hover:bg-[#4C1D95]"
            >
              Explore All Features
            </Link>

          </div>

        </div>

      </section>


      {/* ================= ABOUT ================= */}
      <section className="bg-[#F5F3FF] px-6 py-24">

        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">

          <div>

            <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-[#7C3AED]">
              About Growth Lodge
            </p>

            <h2 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
              Built to Help Hotels{" "}
              <span className="text-[#5B21B6]">
                Grow Smarter
              </span>
            </h2>

            <p className="mt-6 font-medium leading-8 text-gray-600">
              Growth Lodge is a modern hotel management platform
              designed to bring important hotel operations together
              in one organized system.
            </p>

            <p className="mt-4 font-medium leading-8 text-gray-600">
              From rooms and reservations to guests, staff, payments,
              and reports, Growth Lodge gives hotel teams the tools
              they need to manage their daily activities efficiently.
            </p>

            <Link
              href="/about"
              className="mt-7 inline-block rounded-lg bg-[#5B21B6] px-7 py-3 font-bold text-white transition hover:bg-[#4C1D95]"
            >
              About Growth Lodge
            </Link>

          </div>


          <div className="grid gap-5 sm:grid-cols-2">

            <div className="rounded-2xl bg-white p-7 shadow-sm">
              <div className="text-3xl">⚡</div>

              <h3 className="mt-4 text-xl font-extrabold">
                Efficient
              </h3>

              <p className="mt-2 font-medium leading-6 text-gray-600">
                Simplify everyday hotel operations.
              </p>
            </div>


            <div className="rounded-2xl bg-white p-7 shadow-sm">
              <div className="text-3xl">🔐</div>

              <h3 className="mt-4 text-xl font-extrabold">
                Secure
              </h3>

              <p className="mt-2 font-medium leading-6 text-gray-600">
                Manage access according to user roles.
              </p>
            </div>


            <div className="rounded-2xl bg-white p-7 shadow-sm">
              <div className="text-3xl">📊</div>

              <h3 className="mt-4 text-xl font-extrabold">
                Organized
              </h3>

              <p className="mt-2 font-medium leading-6 text-gray-600">
                Keep important hotel information together.
              </p>
            </div>


            <div className="rounded-2xl bg-white p-7 shadow-sm">
              <div className="text-3xl">📈</div>

              <h3 className="mt-4 text-xl font-extrabold">
                Growth Focused
              </h3>

              <p className="mt-2 font-medium leading-6 text-gray-600">
                Support better hotel management decisions.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* ================= SERVICES ================= */}
      <section className="bg-white px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-[#7C3AED]">
              Our Services
            </p>

            <h2 className="mt-4 text-4xl font-extrabold md:text-5xl">
              Services Designed for Hotels
            </h2>

            <p className="mt-5 font-medium leading-7 text-gray-600">
              Growth Lodge connects the different areas of hotel
              operations so your team can work more effectively.
            </p>

          </div>


          <div className="mt-14 grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl border border-purple-100 p-8 transition hover:-translate-y-1 hover:shadow-lg">

              <div className="text-4xl">🛏️</div>

              <h3 className="mt-5 text-xl font-extrabold">
                Hotel Operations
              </h3>

              <p className="mt-3 font-medium leading-7 text-gray-600">
                Organize rooms, reservations, guests, and everyday
                hotel activities.
              </p>

            </div>


            <div className="rounded-2xl border border-purple-100 p-8 transition hover:-translate-y-1 hover:shadow-lg">

              <div className="text-4xl">👨‍💼</div>

              <h3 className="mt-5 text-xl font-extrabold">
                Team Management
              </h3>

              <p className="mt-3 font-medium leading-7 text-gray-600">
                Give staff the appropriate tools and access needed
                for their responsibilities.
              </p>

            </div>


            <div className="rounded-2xl border border-purple-100 p-8 transition hover:-translate-y-1 hover:shadow-lg">

              <div className="text-4xl">📊</div>

              <h3 className="mt-5 text-xl font-extrabold">
                Business Reporting
              </h3>

              <p className="mt-3 font-medium leading-7 text-gray-600">
                Access organized information and reports to understand
                your hotel's operations.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= CONTACT ================= */}
      <section className="bg-[#F5F3FF] px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-12 lg:grid-cols-2">

            <div>

              <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-[#7C3AED]">
                Contact Growth Lodge
              </p>

              <h2 className="mt-4 text-4xl font-extrabold md:text-5xl">
                Let's Talk About
                <span className="block text-[#5B21B6]">
                  Your Hotel
                </span>
              </h2>

              <p className="mt-6 font-medium leading-8 text-gray-600">
                Have questions about Growth Lodge or want to discuss
                your hotel's requirements? Our team is ready to help.
              </p>


              <div className="mt-8 space-y-5">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                    📧
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Email
                    </p>

                    <p className="font-extrabold">
                      info@growthlodge.com
                    </p>
                  </div>

                </div>


                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                    📞
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Phone
                    </p>

                    <p className="font-extrabold">
                      09114545197
                    </p>
                  </div>

                </div>


                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                    📍
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Location
                    </p>

                    <p className="font-extrabold">
                      Nigeria
                    </p>
                  </div>

                </div>

              </div>

            </div>


            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h3 className="text-2xl font-extrabold">
                Ready to Get Started?
              </h3>

              <p className="mt-3 font-medium leading-7 text-gray-600">
                Visit our contact page to send us your questions or
                discuss your hotel's requirements.
              </p>

              <Link
                href="/contact"
                className="mt-7 inline-block rounded-lg bg-[#5B21B6] px-7 py-3 font-bold text-white transition hover:bg-[#4C1D95]"
              >
                Contact Us
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="bg-[#1E1B4B] px-6 py-12 text-white">

        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">

          <div>

            <h2 className="text-2xl font-extrabold">
              Growth Lodge
            </h2>

            <p className="mt-4 font-medium leading-6 text-purple-200">
              Modern hotel management technology designed to help
              hotels operate smarter and grow.
            </p>

          </div>


          <div>

            <h3 className="font-extrabold text-[#A78BFA]">
              Company
            </h3>

            <div className="mt-4 space-y-3 font-medium text-purple-200">

              <Link href="/" className="block hover:text-white">
                Home
              </Link>

              <Link href="/about" className="block hover:text-white">
                About Us
              </Link>

              <Link href="/features" className="block hover:text-white">
                Features
              </Link>

              <Link href="/packages" className="block hover:text-white">
                Packages
              </Link>

              <Link href="/contact" className="block hover:text-white">
                Contact Us
              </Link>

            </div>

          </div>


          <div>

            <h3 className="font-extrabold text-[#A78BFA]">
              Platform
            </h3>

            <div className="mt-4 space-y-3 font-medium text-purple-200">

              <p>Room Management</p>
              <p>Reservations</p>
              <p>Guest Management</p>
              <p>Staff Management</p>
              <p>Reports & Analytics</p>

            </div>

          </div>


          <div>

            <h3 className="font-extrabold text-[#A78BFA]">
              Contact Us
            </h3>

            <div className="mt-4 space-y-3 font-medium text-purple-200">

              <p>
                📧 info@growthlodge.com
              </p>

              <a
                href="tel:09114545197"
                className="block hover:text-white"
              >
                📞 09114545197
              </a>

              <p>
                📍 Nigeria
              </p>

            </div>

          </div>

        </div>


        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-sm font-medium text-purple-300">

          © 2026 Growth Lodge. All rights reserved.

        </div>

      </footer>

    </main>
  );
}