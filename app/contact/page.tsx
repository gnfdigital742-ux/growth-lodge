"use client";

import { FormEvent, useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-white text-[#1E1B4B]">

      {/* ================= NAVIGATION ================= */}
      <nav className="border-b border-purple-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <a
            href="/"
            className="text-2xl font-bold tracking-tight text-[#5B21B6]"
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
              className="font-medium text-gray-600 transition hover:text-[#5B21B6]"
            >
              Packages
            </a>

            <a
              href="/contact"
              className="font-medium text-[#5B21B6]"
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
            Contact Growth Lodge
          </p>

          <h1 className="mt-5 text-5xl font-bold leading-tight md:text-6xl">
            Let's Talk About
            <span className="block text-[#F5F3FF]">
              Your Hotel
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-purple-50 md:text-xl">
            Have questions about Growth Lodge, our features, or our
            packages? Our team is ready to hear from you.
          </p>

        </div>

      </section>


      {/* ================= CONTACT CONTENT ================= */}
      <section className="bg-white px-6 py-24">

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">

          {/* ================= CONTACT INFORMATION ================= */}
          <div>

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#7C3AED]">
              Get In Touch
            </p>

            <h2 className="mt-4 text-4xl font-bold leading-tight text-[#1E1B4B] md:text-5xl">
              We're Here to Help Your Hotel Grow
            </h2>

            <p className="mt-6 max-w-xl leading-8 text-gray-600">
              Whether you want to learn more about Growth Lodge,
              discuss your hotel's requirements, or ask about our
              packages, reach out to our team.
            </p>


            {/* Contact Cards */}
            <div className="mt-10 space-y-5">

              {/* Phone */}
              <a
                href="tel:09114545197"
                className="flex items-center gap-5 rounded-2xl border border-purple-100 bg-[#F5F3FF] p-6 transition hover:border-[#A78BFA] hover:shadow-md"
              >

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#5B21B6] text-2xl">
                  📞
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Phone
                  </p>

                  <p className="mt-1 text-lg font-bold text-[#1E1B4B]">
                    09114545197
                  </p>
                </div>

              </a>


              {/* Email */}
              <a
                href="mailto:info@growthlodge.com"
                className="flex items-center gap-5 rounded-2xl border border-purple-100 bg-[#F5F3FF] p-6 transition hover:border-[#A78BFA] hover:shadow-md"
              >

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED] text-2xl">
                  📧
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Email
                  </p>

                  <p className="mt-1 text-lg font-bold text-[#1E1B4B]">
                    info@growthlodge.com
                  </p>
                </div>

              </a>


              {/* Location */}
              <div className="flex items-center gap-5 rounded-2xl border border-purple-100 bg-[#F5F3FF] p-6">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#5B21B6] text-2xl">
                  📍
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Location
                  </p>

                  <p className="mt-1 text-lg font-bold text-[#1E1B4B]">
                    Nigeria
                  </p>
                </div>

              </div>

            </div>

          </div>


          {/* ================= CONTACT FORM ================= */}
          <div className="rounded-3xl border border-purple-100 bg-white p-8 shadow-xl md:p-10">

            <h2 className="text-2xl font-bold text-[#1E1B4B]">
              Send Us a Message
            </h2>

            <p className="mt-2 text-gray-600">
              Tell us how we can help your hotel.
            </p>


            {submitted ? (

              <div className="mt-8 rounded-2xl bg-[#F5F3FF] p-8 text-center">

                <div className="text-5xl">
                  ✅
                </div>

                <h3 className="mt-5 text-2xl font-bold text-[#1E1B4B]">
                  Message Ready
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  Thank you for contacting Growth Lodge. Your message
                  has been received by the form.
                </p>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 rounded-lg bg-[#5B21B6] px-6 py-3 font-semibold text-white transition hover:bg-[#4C1D95]"
                >
                  Send Another Message
                </button>

              </div>

            ) : (

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-6"
              >

                {/* Name */}
                <div>

                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-[#1E1B4B]"
                  >
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    required
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100"
                  />

                </div>


                {/* Email */}
                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#1E1B4B]"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100"
                  />

                </div>


                {/* Hotel */}
                <div>

                  <label
                    htmlFor="hotel"
                    className="mb-2 block text-sm font-semibold text-[#1E1B4B]"
                  >
                    Hotel Name
                  </label>

                  <input
                    id="hotel"
                    name="hotel"
                    type="text"
                    placeholder="Enter your hotel name"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100"
                  />

                </div>


                {/* Subject */}
                <div>

                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-semibold text-[#1E1B4B]"
                  >
                    Subject
                  </label>

                  <select
                    id="subject"
                    name="subject"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100"
                  >
                    <option value="general">
                      General Inquiry
                    </option>

                    <option value="package">
                      Package Information
                    </option>

                    <option value="demo">
                      Request a Demo
                    </option>

                    <option value="support">
                      Support
                    </option>
                  </select>

                </div>


                {/* Message */}
                <div>

                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-semibold text-[#1E1B4B]"
                  >
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Tell us how we can help..."
                    required
                    className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100"
                  />

                </div>


                {/* Submit */}
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#5B21B6] px-6 py-4 font-semibold text-white transition hover:bg-[#4C1D95]"
                >
                  Send Message
                </button>

              </form>

            )}

          </div>

        </div>

      </section>


      {/* ================= WHY CONTACT US ================= */}
      <section className="bg-[#F5F3FF] px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#7C3AED]">
              Why Contact Us?
            </p>

            <h2 className="mt-4 text-4xl font-bold text-[#1E1B4B] md:text-5xl">
              Let's Understand Your Hotel
            </h2>

          </div>


          <div className="mt-14 grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

              <div className="text-4xl">
                💬
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Ask Questions
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Get answers about Growth Lodge and how the platform
                can support your hotel.
              </p>

            </div>


            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

              <div className="text-4xl">
                🏨
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Discuss Your Hotel
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Tell us about your hotel's requirements and
                management needs.
              </p>

            </div>


            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

              <div className="text-4xl">
                🚀
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Get Started
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Take the next step toward a more organized hotel
                management experience.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-6 py-24 text-white">

        <div className="mx-auto max-w-4xl text-center">

          <h2 className="text-4xl font-bold md:text-5xl">
            Have More Questions?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-7 text-purple-100">
            Call us directly and speak with the Growth Lodge team.
          </p>

          <a
            href="tel:09114545197"
            className="mt-8 inline-block rounded-lg bg-white px-8 py-4 font-semibold text-[#5B21B6] transition hover:bg-[#F5F3FF]"
          >
            Call 09114545197
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

              <a href="/" className="block hover:text-white">
                Home
              </a>

              <a href="/about" className="block hover:text-white">
                About Us
              </a>

              <a href="/features" className="block hover:text-white">
                Features
              </a>

              <a href="/packages" className="block hover:text-white">
                Packages
              </a>

              <a href="/contact" className="block hover:text-white">
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