
"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/component/ThemeToggle";

export default function StaffSignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "error"
  );
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // ========================================
  // EMAIL VALIDATION
  // ========================================

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  // ========================================
  // PHONE VALIDATION
  // ========================================

  function validatePhone(value: string) {
    const cleaned = value.replace(/[\s\-()]/g, "");

    return /^\+?[0-9]{7,15}$/.test(cleaned);
  }

  // ========================================
  // PASSWORD VALIDATION
  // ========================================

  function validatePassword(value: string) {
    if (value.length < 8) {
      return "Password must be at least 8 characters.";
    }

    let categories = 0;

    if (/[A-Z]/.test(value)) categories++;
    if (/[a-z]/.test(value)) categories++;
    if (/[0-9]/.test(value)) categories++;
    if (/[^A-Za-z0-9]/.test(value)) categories++;

    if (categories < 3) {
      return "Password must contain at least 3 of: uppercase, lowercase, number, and symbol.";
    }

    return "";
  }

  // ========================================
  // STAFF SIGNUP
  // ========================================

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setMessageType("error");

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (
      !cleanFullName ||
      !cleanEmail ||
      !cleanPhone ||
      !password ||
      !confirmPassword
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (!validatePhone(cleanPhone)) {
      setMessage("Please enter a valid phone number.");
      return;
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      setMessage(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setMessage("Please accept the Terms and Conditions.");
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
            full_name: cleanFullName,
            email: cleanEmail,
            phone: cleanPhone,
            password: password,
            role: "staff",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Unable to start registration.");
        setMessageType("error");
        return;
      }

      setOtpStep(true);
      setMessageType("success");

      setMessage(
        data.message ||
          "A verification code has been sent to your email address."
      );
    } catch (error) {
      console.error("Staff registration error:", error);

      setMessageType("error");

      setMessage(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // VERIFY EMAIL OTP
  // ========================================

  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setMessageType("error");

    const cleanOtp = otp.trim();

    if (!cleanOtp) {
      setMessage("Please enter the verification code.");
      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      setMessage("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            otp: cleanOtp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(
          data.message || "Invalid or expired verification code."
        );
        setMessageType("error");
        return;
      }

      setMessageType("success");

      setMessage(
        data.message ||
          "Staff account created successfully. You can now sign in."
      );

      setTimeout(() => {
        window.location.href = "/staff/signin";
      }, 1500);
    } catch (error) {
      console.error("OTP verification error:", error);

      setMessageType("error");

      setMessage(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // RESEND OTP
  // ========================================

  async function handleResendOtp() {
    setMessage("");
    setMessageType("error");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setMessage("Email address is required.");
      return;
    }

    setResending(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/resend-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(
          data.message || "Unable to resend verification code."
        );
        setMessageType("error");
        return;
      }

      setMessageType("success");

      setMessage(
        data.message ||
          "A new verification code has been sent to your email."
      );
    } catch (error) {
      console.error("Resend OTP error:", error);

      setMessageType("error");

      setMessage(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setResending(false);
    }
  }

  // ========================================
  // BACK TO SIGNUP
  // ========================================

  function handleBackToSignup() {
    setOtpStep(false);
    setOtp("");
    setMessage("");
    setMessageType("error");
  }

  return (
    <main className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B] transition-colors duration-300 dark:bg-[#0F0B1F] dark:text-white">
      {/* ========================================
          NAVIGATION
      ======================================== */}

      <nav className="border-b border-purple-100 bg-white dark:border-[#31265A] dark:bg-[#18132D]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* LOGO */}

          <Link
            href="/"
            className="text-2xl font-bold text-[#5B21B6] dark:text-[#A78BFA]"
          >
            Growth Lodge
          </Link>

          {/* NAV LINKS */}

          <div className="hidden items-center gap-7 md:flex">
            <Link
              href="/"
              className="transition hover:text-[#5B21B6] dark:hover:text-[#A78BFA]"
            >
              Home
            </Link>

            <Link
              href="/about"
              className="transition hover:text-[#5B21B6] dark:hover:text-[#A78BFA]"
            >
              About Us
            </Link>

            <Link
              href="/features"
              className="transition hover:text-[#5B21B6] dark:hover:text-[#A78BFA]"
            >
              Features
            </Link>

            <Link
              href="/packages"
              className="transition hover:text-[#5B21B6] dark:hover:text-[#A78BFA]"
            >
              Packages
            </Link>

            <Link
              href="/contact"
              className="transition hover:text-[#5B21B6] dark:hover:text-[#A78BFA]"
            >
              Contact Us
            </Link>

            <Link
              href="/signin"
              className="font-semibold text-[#5B21B6] dark:text-[#A78BFA]"
            >
              Sign In
            </Link>

            <ThemeToggle />
          </div>

          {/* MOBILE THEME TOGGLE */}

          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* ========================================
          SIGN UP SECTION
      ======================================== */}

      <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl dark:bg-[#18132D] sm:p-10">
          {/* BRAND */}

          <div className="mb-8 text-center">
            <div className="mb-3 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5B21B6] text-2xl font-bold text-white">
                G
              </div>
            </div>

            <h1 className="text-3xl font-bold text-[#5B21B6] dark:text-[#A78BFA]">
              Growth Lodge
            </h1>

            <h2 className="mt-5 text-2xl font-bold text-[#1E1B4B] dark:text-white">
              Staff Sign Up
            </h2>

            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {otpStep
                ? "Verify your email address"
                : "Create your staff account"}
            </p>
          </div>

          {/* ACCOUNT TYPE */}

          <div className="mb-6 rounded-xl bg-[#F5F3FF] px-4 py-3 text-center dark:bg-[#241B3D]">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Account Type
            </p>

            <p className="mt-1 font-semibold text-[#5B21B6] dark:text-[#A78BFA]">
              Staff
            </p>
          </div>

          {!otpStep ? (
            /* ========================================
               SIGNUP FORM
            ======================================== */

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* FULL NAME */}

              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-[#1E1B4B] outline-none transition focus:border-[#5B21B6] focus:ring-2 focus:ring-purple-200 dark:border-[#31265A] dark:bg-[#241B3D] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#A78BFA] dark:focus:ring-purple-900"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold"
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
                  className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-[#1E1B4B] outline-none transition focus:border-[#5B21B6] focus:ring-2 focus:ring-purple-200 dark:border-[#31265A] dark:bg-[#241B3D] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#A78BFA] dark:focus:ring-purple-900"
                />
              </div>

              {/* PHONE */}

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  required
                  className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-[#1E1B4B] outline-none transition focus:border-[#5B21B6] focus:ring-2 focus:ring-purple-200 dark:border-[#31265A] dark:bg-[#241B3D] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#A78BFA] dark:focus:ring-purple-900"
                />

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Email verification is required. No phone OTP is required.
                </p>
              </div>

              {/* PASSWORD */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold"
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
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 pr-12 text-[#1E1B4B] outline-none transition focus:border-[#5B21B6] focus:ring-2 focus:ring-purple-200 dark:border-[#31265A] dark:bg-[#241B3D] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#A78BFA] dark:focus:ring-purple-900"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-500 hover:text-[#5B21B6] dark:text-gray-400 dark:hover:text-[#A78BFA]"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  Minimum 8 characters and at least 3 of: uppercase,
                  lowercase, number, and symbol.
                </p>
              </div>

              {/* CONFIRM PASSWORD */}

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold"
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
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 pr-12 text-[#1E1B4B] outline-none transition focus:border-[#5B21B6] focus:ring-2 focus:ring-purple-200 dark:border-[#31265A] dark:bg-[#241B3D] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#A78BFA] dark:focus:ring-purple-900"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-500 hover:text-[#5B21B6] dark:text-gray-400 dark:hover:text-[#A78BFA]"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* TERMS */}

              <div>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) =>
                      setAcceptedTerms(e.target.checked)
                    }
                    className="mt-1 h-4 w-4 accent-[#5B21B6]"
                  />

                  <span className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                    I agree to the Growth Lodge Terms and Conditions.
                  </span>
                </label>
              </div>

              {/* MESSAGE */}

              {message && (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    messageType === "success"
                      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                      : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* CREATE ACCOUNT */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#5B21B6] px-6 py-3.5 font-semibold text-white transition hover:bg-[#4C1D95] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Sending Verification Code..."
                  : "Continue & Verify Email"}
              </button>

              {/* SIGN IN LINK */}

              <div className="mt-6 border-t border-gray-100 pt-5 text-center dark:border-[#31265A]">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Already have an account?{" "}
                  <Link
                    href="/staff/signin"
                    className="font-semibold text-[#5B21B6] hover:underline dark:text-[#A78BFA]"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            /* ========================================
               OTP FORM
            ======================================== */

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="rounded-xl bg-[#F5F3FF] p-5 text-center dark:bg-[#241B3D]">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#5B21B6] text-2xl text-white">
                  ✉
                </div>

                <h3 className="text-lg font-bold text-[#1E1B4B] dark:text-white">
                  Check Your Email
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  We sent a 6-digit verification code to:
                </p>

                <p className="mt-1 break-all font-semibold text-[#5B21B6] dark:text-[#A78BFA]">
                  {email}
                </p>
              </div>

              {/* OTP */}

              <div>
                <label
                  htmlFor="otp"
                  className="mb-2 block text-sm font-semibold"
                >
                  Verification Code
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  placeholder="Enter 6-digit code"
                  required
                  className="w-full rounded-xl border border-purple-100 bg-white px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-[#1E1B4B] outline-none transition focus:border-[#5B21B6] focus:ring-2 focus:ring-purple-200 dark:border-[#31265A] dark:bg-[#241B3D] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#A78BFA] dark:focus:ring-purple-900"
                />
              </div>

              {/* MESSAGE */}

              {message && (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    messageType === "success"
                      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                      : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* VERIFY BUTTON */}

              <button
                type="submit"
                disabled={loading || resending}
                className="w-full rounded-xl bg-[#5B21B6] px-6 py-3.5 font-semibold text-white transition hover:bg-[#4C1D95] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Verifying..."
                  : "Verify Email & Create Account"}
              </button>

              {/* RESEND */}

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || resending}
                className="w-full rounded-xl border border-[#5B21B6] px-6 py-3.5 font-semibold text-[#5B21B6] transition hover:bg-[#F5F3FF] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#A78BFA] dark:text-[#A78BFA] dark:hover:bg-[#241B3D]"
              >
                {resending
                  ? "Sending..."
                  : "Resend Verification Code"}
              </button>

              {/* BACK */}

              <button
                type="button"
                onClick={handleBackToSignup}
                className="w-full text-sm font-semibold text-gray-500 hover:text-[#5B21B6] dark:text-gray-400 dark:hover:text-[#A78BFA]"
              >
                ← Back to Sign Up
              </button>
            </form>
          )}

          {/* HELP */}

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Need help?</p>

            <a
              href="tel:09114545197"
              className="font-semibold text-[#5B21B6] hover:underline dark:text-[#A78BFA]"
            >
              09114545197
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}