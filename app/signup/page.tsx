"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/component/ThemeToggle";

export default function CustomerSignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setMessage("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setMessage("Please agree to the terms and conditions.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: fullName,
            email: email,
            phone: phone,
            password: password,
            role: "customer",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(
          data.message || "Unable to create customer account."
        );
        setLoading(false);
        return;
      }

      setMessage(
        "Customer account created successfully. Redirecting to Sign In..."
      );

      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setAgreeTerms(false);

      setTimeout(() => {
        router.push("/signin");
      }, 1500);
    } catch (error) {
      console.error("Signup error:", error);

      setMessage(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B] dark:bg-[#0F0B1F] dark:text-white">

      {/* ================= NAVIGATION ================= */}
      <nav className="border-b border-purple-100 bg-white dark:border-[#31265A] dark:bg-[#18132D]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5B21B6] text-xl font-bold text-white">
              G
            </div>

            <span className="text-xl font-bold text-[#5B21B6] dark:text-[#A78BFA]">
              Growth Lodge
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">

            <Link
              href="/"
              className="text-sm font-medium text-gray-600 transition hover:text-[#5B21B6] dark:text-gray-300 dark:hover:text-[#A78BFA]"
            >
              Home
            </Link>

            <Link
              href="/about"
              className="text-sm font-medium text-gray-600 transition hover:text-[#5B21B6] dark:text-gray-300 dark:hover:text-[#A78BFA]"
            >
              About Us
            </Link>

            <Link
              href="/features"
              className="text-sm font-medium text-gray-600 transition hover:text-[#5B21B6] dark:text-gray-300 dark:hover:text-[#A78BFA]"
            >
              Features
            </Link>

            <Link
              href="/packages"
              className="text-sm font-medium text-gray-600 transition hover:text-[#5B21B6] dark:text-gray-300 dark:hover:text-[#A78BFA]"
            >
              Packages
            </Link>

            <Link
              href="/contact"
              className="text-sm font-medium text-gray-600 transition hover:text-[#5B21B6] dark:text-gray-300 dark:hover:text-[#A78BFA]"
            >
              Contact Us
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/signin"
              className="rounded-lg bg-[#5B21B6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4C1D95]"
            >
              Sign In
            </Link>
          </div>

        </div>
      </nav>


      {/* ================= SIGN UP SECTION ================= */}
      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">

        <div className="w-full max-w-5xl">

          <div className="grid overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-xl dark:border-[#31265A] dark:bg-[#18132D] lg:grid-cols-2">

            {/* ================= LEFT SIDE ================= */}
            <div className="hidden bg-[#5B21B6] p-10 text-white lg:flex lg:flex-col lg:justify-center">

              <div>

                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl font-bold text-[#5B21B6]">
                  G
                </div>

                <h1 className="text-4xl font-bold leading-tight">
                  Create your
                  <br />
                  Growth Lodge account
                </h1>

                <p className="mt-5 max-w-md text-base leading-7 text-purple-100">
                  Create your customer account and easily manage your
                  reservations, payments, and hotel activities.
                </p>

              </div>

              <div className="mt-10 space-y-4">

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                    ✓
                  </div>

                  <span className="text-sm text-purple-100">
                    Manage your reservations
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                    ✓
                  </div>

                  <span className="text-sm text-purple-100">
                    View your payments
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                    ✓
                  </div>

                  <span className="text-sm text-purple-100">
                    Manage your profile
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                    ✓
                  </div>

                  <span className="text-sm text-purple-100">
                    Access Growth Lodge services
                  </span>
                </div>

              </div>

            </div>


            {/* ================= RIGHT SIDE ================= */}
            <div className="p-6 sm:p-10">

              <div className="mb-8 text-center">

                <h2 className="text-3xl font-bold text-[#1E1B4B] dark:text-white">
                  Create Customer Account
                </h2>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Create your account to get started
                </p>

              </div>


              {/* FORM */}
              <form
                onSubmit={handleSignup}
                className="space-y-5"
              >

                {/* Full Name */}
                <div>

                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
                    Full Name
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#5B21B6] focus:ring-2 focus:ring-purple-100 dark:border-[#31265A] dark:bg-[#0F0B1F] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#A78BFA] dark:focus:ring-[#241B3D]"
                  />

                </div>


                {/* Email */}
                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#5B21B6] focus:ring-2 focus:ring-purple-100 dark:border-[#31265A] dark:bg-[#0F0B1F] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#A78BFA] dark:focus:ring-[#241B3D]"
                  />

                </div>


                {/* Phone */}
                <div>

                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#5B21B6] focus:ring-2 focus:ring-purple-100 dark:border-[#31265A] dark:bg-[#0F0B1F] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#A78BFA] dark:focus:ring-[#241B3D]"
                  />

                </div>


                {/* Password */}
                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#5B21B6] focus:ring-2 focus:ring-purple-100 dark:border-[#31265A] dark:bg-[#0F0B1F] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#A78BFA] dark:focus:ring-[#241B3D]"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5B21B6] dark:text-gray-400 dark:hover:text-[#A78BFA]"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>

                  </div>

                </div>


                {/* Confirm Password */}
                <div>

                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">

                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      placeholder="Confirm your password"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#5B21B6] focus:ring-2 focus:ring-purple-100 dark:border-[#31265A] dark:bg-[#0F0B1F] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#A78BFA] dark:focus:ring-[#241B3D]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5B21B6] dark:text-gray-400 dark:hover:text-[#A78BFA]"
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>

                  </div>

                </div>


                {/* Terms */}
                <label className="flex cursor-pointer items-start gap-3">

                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) =>
                      setAgreeTerms(e.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#5B21B6] focus:ring-[#5B21B6]"
                  />

                  <span className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                    I agree to the{" "}
                    <span className="font-semibold text-[#5B21B6] dark:text-[#A78BFA]">
                      Terms & Conditions
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold text-[#5B21B6] dark:text-[#A78BFA]">
                      Privacy Policy
                    </span>
                  </span>

                </label>


                {/* Message */}
                {message && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      message.includes("successfully")
                        ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                        : "border-purple-200 bg-purple-50 text-[#5B21B6] dark:border-[#4B3B78] dark:bg-[#241B3D] dark:text-[#C4B5FD]"
                    }`}
                  >
                    {message}
                  </div>
                )}


                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#5B21B6] px-5 py-3.5 font-semibold text-white transition hover:bg-[#4C1D95] focus:outline-none focus:ring-4 focus:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-[#31265A]"
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Customer Account"}
                </button>


                {/* Sign In */}
                <div className="border-t border-gray-100 pt-5 text-center dark:border-[#31265A]">

                  <p className="text-sm text-gray-600 dark:text-gray-300">

                    Already have an account?{" "}

                    <Link
                      href="/signin"
                      className="font-semibold text-[#5B21B6] hover:underline dark:text-[#A78BFA]"
                    >
                      Sign In
                    </Link>

                  </p>

                </div>

              </form>


              {/* Help */}
              <div className="mt-7 text-center">

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Need help? Contact Growth Lodge support
                </p>

                <a
                  href="tel:09114545197"
                  className="mt-1 inline-block text-sm font-semibold text-[#5B21B6] hover:underline dark:text-[#A78BFA]"
                >
                  +234 911 454 5197
                </a>

              </div>

            </div>

          </div>


          {/* Back Home */}
          <div className="mt-6 text-center">

            <Link
              href="/"
              className="text-sm font-medium text-gray-500 transition hover:text-[#5B21B6] dark:text-gray-400 dark:hover:text-[#A78BFA]"
            >
              ← Back to Growth Lodge
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}