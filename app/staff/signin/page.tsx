
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/component/ThemeToggle";

type LoggedInStaff = {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  created_at?: string;
};

export default function StaffSignIn() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
            role: "staff",
          }),
        }
      );

      const data = await response.json();

      console.log("STAFF LOGIN RESPONSE:", data);

      if (!response.ok || !data.success) {
        setError(
          data.message || "Invalid email or password."
        );
        return;
      }

      // ========================================
      // GET STAFF USER FROM LOGIN RESPONSE
      // ========================================

      const loggedInStaff: LoggedInStaff =
        data.user || data.staff;

      if (!loggedInStaff || !loggedInStaff.id) {
        console.error(
          "Staff ID missing from login response:",
          data
        );

        setError(
          "Login succeeded, but the staff account ID was not returned by the server."
        );

        return;
      }

      // Make sure this is actually a staff account
      if (
        loggedInStaff.role &&
        loggedInStaff.role.toLowerCase() !== "staff"
      ) {
        setError(
          "This account is not registered as a staff account."
        );

        return;
      }

      // ========================================
      // SAVE STAFF INFORMATION
      // ========================================

      localStorage.setItem(
        "growthLodgeStaff",
        JSON.stringify(loggedInStaff)
      );

      localStorage.setItem(
        "growthLodgeStaffId",
        String(loggedInStaff.id)
      );

      // Debug confirmation
      console.log(
        "Growth Lodge Staff ID saved:",
        loggedInStaff.id
      );

      // ========================================
      // GO TO STAFF DASHBOARD
      // ========================================

      router.push("/staff");
    } catch (err) {
      console.error("Staff sign in error:", err);

      setError(
        "Unable to connect to the server. Please make sure your backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-[#1E1B4B]">
      {/* Navigation */}

      <nav className="border-b border-[#E9E4FF] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold text-[#6D28D9]"
          >
            Growth Lodge
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-sm font-medium hover:text-[#6D28D9]"
            >
              Home
            </Link>

            <Link
              href="/about"
              className="text-sm font-medium hover:text-[#6D28D9]"
            >
              About Us
            </Link>

            <Link
              href="/features"
              className="text-sm font-medium hover:text-[#6D28D9]"
            >
              Features
            </Link>

            <Link
              href="/packages"
              className="text-sm font-medium hover:text-[#6D28D9]"
            >
              Packages
            </Link>

            <Link
              href="/contact"
              className="text-sm font-medium hover:text-[#6D28D9]"
            >
              Contact Us
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Sign In Section */}

      <section className="flex min-h-[calc(100vh-90px)] items-center justify-center bg-[#F5F3FF] px-6 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            {/* Header */}

            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F3FF]">
                <svg
                  className="h-8 w-8 text-[#6D28D9]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-[#1E1B4B]">
                Staff Sign In
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Sign in to access your Growth Lodge staff dashboard
              </p>
            </div>

            {/* Error */}

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Form */}

            <form
              onSubmit={handleSignIn}
              className="space-y-5"
            >
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
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#A78BFA]/30"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[#1E1B4B]"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#A78BFA]/30"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#6D28D9]"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#6D28D9] px-4 py-3 font-semibold text-white transition hover:bg-[#5B21B6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Signing In..."
                  : "Sign In"}
              </button>
            </form>

            {/* Sign Up */}

            <div className="mt-7 text-center">
              <p className="text-sm text-gray-500">
                Don&apos;t have a staff account?{" "}
                <Link
                  href="/staff/signup"
                  className="font-semibold text-[#6D28D9] hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>

            {/* Help */}

            <div className="mt-6 border-t border-gray-100 pt-5 text-center">
              <p className="text-xs text-gray-500">
                Need help? Contact Growth Lodge
              </p>

              <p className="mt-1 text-sm font-semibold text-[#6D28D9]">
                09114545197
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
