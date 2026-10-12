"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/component/ThemeToggle";

const API_URL = "http://localhost:5000";
const HOTEL_ID = 3;

export default function SignInPage() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState("Admin");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      name: "Admin",
      icon: "👨‍💼",
      description: "Manage your hotel",
    },
    {
      name: "Staff",
      icon: "👨‍🔧",
      description: "Manage daily operations",
    },
    {
      name: "Customer",
      icon: "👤",
      description: "Access your account",
    },
  ];

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");

    const cleanEmail = email.trim().toLowerCase();
    const role = selectedRole.toLowerCase();

    if (!cleanEmail || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hotel-id": String(HOTEL_ID),
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          role,
          hotel_id: HOTEL_ID,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(
          data.message || "Invalid email, password, hotel or account role."
        );
        return;
      }

      /*
       * ---------------------------------------------------------
       * GET HOTEL ID FROM LOGIN RESPONSE
       * ---------------------------------------------------------
       */

      const hotelId =
        data.user?.hotel_id ??
        data.user?.hotelId ??
        data.hotel_id ??
        data.hotelId ??
        HOTEL_ID;

      /*
       * ---------------------------------------------------------
       * SAVE USER
       * ---------------------------------------------------------
       */

      if (data.user) {
        const loggedInUser = {
          ...data.user,
          hotel_id: Number(hotelId),
          hotelId: Number(hotelId),
        };

        localStorage.setItem(
          "growthLodgeUser",
          JSON.stringify(loggedInUser)
        );

        localStorage.setItem(
          "user",
          JSON.stringify(loggedInUser)
        );

        localStorage.setItem(
          "currentUser",
          JSON.stringify(loggedInUser)
        );

        localStorage.setItem(
          "loggedInUser",
          JSON.stringify(loggedInUser)
        );

        localStorage.setItem(
          "authUser",
          JSON.stringify(loggedInUser)
        );

        if (role === "admin") {
          localStorage.setItem(
            "adminUser",
            JSON.stringify(loggedInUser)
          );
        }

        if (role === "staff") {
          localStorage.setItem(
            "staffUser",
            JSON.stringify(loggedInUser)
          );
        }

        if (role === "customer") {
          localStorage.setItem(
            "customerUser",
            JSON.stringify(loggedInUser)
          );
        }
      }

      /*
       * ---------------------------------------------------------
       * SAVE HOTEL WORKSPACE ID
       * ---------------------------------------------------------
       */

      localStorage.setItem("hotel_id", String(hotelId));
      localStorage.setItem(
        "growth_lodge_hotel_id",
        String(hotelId)
      );

      localStorage.setItem(
        "hotelId",
        String(hotelId)
      );

      /*
       * ---------------------------------------------------------
       * SAVE HOTEL OBJECT IF BACKEND RETURNS ONE
       * ---------------------------------------------------------
       */

      if (data.hotel) {
        localStorage.setItem(
          "growthLodgeHotel",
          JSON.stringify(data.hotel)
        );

        localStorage.setItem(
          "hotel",
          JSON.stringify(data.hotel)
        );
      }

      /*
       * ---------------------------------------------------------
       * REMEMBER EMAIL
       * ---------------------------------------------------------
       */

      if (rememberMe) {
        localStorage.setItem(
          "growthLodgeEmail",
          cleanEmail
        );
      } else {
        localStorage.removeItem("growthLodgeEmail");
      }

      /*
       * ---------------------------------------------------------
       * SUCCESS
       * ---------------------------------------------------------
       */

      setMessage("Login successful. Redirecting...");

      /*
       * ---------------------------------------------------------
       * REDIRECT
       * ---------------------------------------------------------
       */

      const loggedInRole = String(
        data.user?.role || role
      ).toLowerCase();

      if (loggedInRole === "admin") {
        router.push("/admin");
      } else if (loggedInRole === "staff") {
        router.push("/staff");
      } else if (loggedInRole === "customer") {
        router.push("/customer");
      } else {
        setMessage("Unknown account role.");
      }
    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B] dark:bg-[#0F0B1F] dark:text-white">
      <nav className="border-b border-purple-100 bg-white dark:border-[#31265A] dark:bg-[#18132D]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
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
              className="hidden rounded-lg bg-[#5B21B6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4C1D95] sm:block"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl">
          <div className="grid overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-xl dark:border-[#31265A] dark:bg-[#18132D] lg:grid-cols-2">
            <div className="hidden bg-[#5B21B6] p-10 text-white lg:flex lg:flex-col lg:justify-center">
              <div className="mb-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl font-bold text-[#5B21B6]">
                  G
                </div>

                <h1 className="text-4xl font-bold leading-tight">
                  Welcome back to
                  <br />
                  Growth Lodge
                </h1>

                <p className="mt-5 max-w-md text-base leading-7 text-purple-100">
                  Manage your hotel operations, staff, rooms,
                  reservations, guests and business activities from
                  one powerful platform.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                    ✓
                  </div>

                  <span className="text-sm text-purple-100">
                    Easy hotel management
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                    ✓
                  </div>

                  <span className="text-sm text-purple-100">
                    Manage your hotel staff
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                    ✓
                  </div>

                  <span className="text-sm text-purple-100">
                    Track reservations and payments
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                    ✓
                  </div>

                  <span className="text-sm text-purple-100">
                    Powerful reports and analytics
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-10">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-[#1E1B4B] dark:text-white">
                  Sign In
                </h2>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Select your account type to continue
                </p>
              </div>

              <div className="mb-7 grid grid-cols-3 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.name}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.name);
                      setMessage("");
                    }}
                    className={`rounded-xl border p-3 text-center transition ${
                      selectedRole === role.name
                        ? "border-[#5B21B6] bg-[#F5F3FF] shadow-sm dark:border-[#A78BFA] dark:bg-[#241B3D]"
                        : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 dark:border-[#31265A] dark:bg-[#18132D] dark:hover:bg-[#241B3D]"
                    }`}
                  >
                    <div className="text-2xl">{role.icon}</div>

                    <div
                      className={`mt-1 text-sm font-semibold ${
                        selectedRole === role.name
                          ? "text-[#5B21B6] dark:text-[#A78BFA]"
                          : "text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {role.name}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mb-6 rounded-xl bg-[#F5F3FF] px-4 py-3 text-center dark:bg-[#241B3D]">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Signing in as
                </p>

                <p className="mt-1 font-semibold text-[#5B21B6] dark:text-[#A78BFA]">
                  {selectedRole}
                </p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-5">
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
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#5B21B6] focus:ring-2 focus:ring-purple-100 dark:border-[#31265A] dark:bg-[#0F0B1F] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#A78BFA] dark:focus:ring-[#241B3D]"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setMessage(
                          "Password recovery will be connected next."
                        )
                      }
                      className="text-xs font-semibold text-[#5B21B6] hover:underline dark:text-[#A78BFA]"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#5B21B6] focus:ring-2 focus:ring-purple-100 dark:border-[#31265A] dark:bg-[#0F0B1F] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#A78BFA] dark:focus:ring-[#241B3D]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5B21B6] dark:text-gray-400 dark:hover:text-[#A78BFA]"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) =>
                        setRememberMe(e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#5B21B6] focus:ring-[#5B21B6]"
                    />

                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Remember me
                    </span>
                  </label>
                </div>

                {message && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      message.includes("successful") ||
                      message.includes("Redirecting")
                        ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                        : "border-purple-200 bg-purple-50 text-[#5B21B6] dark:border-[#4B3B78] dark:bg-[#241B3D] dark:text-[#C4B5FD]"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#5B21B6] px-5 py-3.5 font-semibold text-white transition hover:bg-[#4C1D95] focus:outline-none focus:ring-4 focus:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-[#31265A]"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>

                <div className="mt-6 border-t border-gray-100 pt-5 text-center dark:border-[#31265A]">
                  {selectedRole === "Admin" && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/admin/signup"
                        className="font-semibold text-[#5B21B6] hover:underline dark:text-[#A78BFA]"
                      >
                        Sign Up
                      </Link>
                    </p>
                  )}

                  {selectedRole === "Customer" && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/signup"
                        className="font-semibold text-[#5B21B6] hover:underline dark:text-[#A78BFA]"
                      >
                        Sign Up
                      </Link>
                    </p>
                  )}

                  {selectedRole === "Staff" && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/staff/signup"
                        className="font-semibold text-[#5B21B6] hover:underline dark:text-[#A78BFA]"
                      >
                        Sign Up
                      </Link>
                    </p>
                  )}
                </div>
              </form>

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