"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/component/ThemeToggle";

export default function CustomerSignUp() {
  const [step, setStep] = useState<"signup" | "otp">("signup");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      return "Password must be at least 8 characters.";
    }

    let criteria = 0;

    if (/[A-Z]/.test(value)) criteria++;
    if (/[a-z]/.test(value)) criteria++;
    if (/[0-9]/.test(value)) criteria++;
    if (/[^A-Za-z0-9]/.test(value)) criteria++;

    if (criteria < 3) {
      return "Password must contain at least 3 of: uppercase, lowercase, number, and symbol.";
    }

    return "";
  };

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validatePhone = (value: string) => {
    const cleaned = value.replace(/[\s\-()]/g, "");
    return /^\+?[0-9]{7,15}$/.test(cleaned);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the terms and conditions.");
      return;
    }

    if (!validateEmail(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!validatePhone(phone.trim())) {
      setError("Please enter a valid phone number.");
      return;
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
            role: "customer",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to start registration.");
        return;
      }

      setSuccess(
        data.message ||
          "A verification code has been sent to your email address."
      );

      setStep("otp");
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to the server. Please make sure your backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!otp.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            otp: otp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid verification code.");
        return;
      }

      setSuccess(
        data.message ||
          "Email verified successfully. Your customer account has been created."
      );

      setTimeout(() => {
        window.location.href = "/signin";
      }, 1500);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to the server. Please make sure your backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");

    try {
      setResending(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/resend-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to resend verification code.");
        return;
      }

      setSuccess(
        data.message || "A new verification code has been sent."
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to the server. Please make sure your backend is running."
      );
    } finally {
      setResending(false);
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

      {/* Signup / OTP Section */}
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
                  {step === "signup" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM5 20a7 7 0 0114 0"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  )}
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-[#1E1B4B]">
                {step === "signup"
                  ? "Create Account"
                  : "Verify Your Email"}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {step === "signup"
                  ? "Create your Growth Lodge customer account"
                  : `Enter the 6-digit code sent to ${email}`}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                {success}
              </div>
            )}

            {/* SIGNUP STEP */}
            {step === "signup" && (
              <>
                <form
                  onSubmit={handleSignUp}
                  className="space-y-5"
                >
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-sm font-semibold text-[#1E1B4B]"
                    >
                      Full Name
                    </label>

                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#A78BFA]/30"
                      autoComplete="name"
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
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#A78BFA]/30"
                      autoComplete="email"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold text-[#1E1B4B]"
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#A78BFA]/30"
                      autoComplete="tel"
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
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16 outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#A78BFA]/30"
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#6D28D9]"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      Minimum 8 characters and at least 3 of:
                      uppercase, lowercase, number, symbol.
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-semibold text-[#1E1B4B]"
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
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16 outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#A78BFA]/30"
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#6D28D9]"
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) =>
                        setTermsAccepted(e.target.checked)
                      }
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-[#6D28D9] focus:ring-[#A78BFA]"
                    />

                    <label
                      htmlFor="terms"
                      className="text-sm text-gray-500"
                    >
                      I agree to the Growth Lodge terms and
                      conditions.
                    </label>
                  </div>

                  {/* Create Account */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-[#6D28D9] px-4 py-3 font-semibold text-white transition hover:bg-[#5B21B6] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Sending Verification Code..."
                      : "Create Account"}
                  </button>
                </form>

                {/* Sign In */}
                <div className="mt-7 text-center">
                  <p className="text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link
                      href="/signin"
                      className="font-semibold text-[#6D28D9] hover:underline"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </>
            )}

            {/* OTP STEP */}
            {step === "otp" && (
              <>
                <form
                  onSubmit={handleVerifyOtp}
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="otp"
                      className="mb-2 block text-sm font-semibold text-[#1E1B4B]"
                    >
                      Email Verification Code
                    </label>

                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) =>
                        setOtp(
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                      placeholder="Enter 6-digit code"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-xl tracking-[0.4em] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#A78BFA]/30"
                      autoComplete="one-time-code"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-[#6D28D9] px-4 py-3 font-semibold text-white transition hover:bg-[#5B21B6] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Verifying..."
                      : "Verify Email"}
                  </button>
                </form>

                <div className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="text-sm font-semibold text-[#6D28D9] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resending
                      ? "Sending..."
                      : "Resend Verification Code"}
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("signup");
                      setOtp("");
                      setError("");
                      setSuccess("");
                    }}
                    className="text-sm text-gray-500 hover:text-[#6D28D9]"
                  >
                    ← Back to Sign Up
                  </button>
                </div>
              </>
            )}

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