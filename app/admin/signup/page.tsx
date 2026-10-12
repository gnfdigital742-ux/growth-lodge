"use client";

import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "@/component/ThemeToggle";

const API_URL = "http://localhost:5000";
const HOTEL_ID = 3;

export default function AdminSignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [otpStep, setOtpStep] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"success" | "error">("error");

  const [loading, setLoading] = useState(false);

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validatePhone(value: string) {
    const cleaned = value.replace(/[\s\-()]/g, "");
    return /^\+?\d{10,15}$/.test(cleaned);
  }

  function validatePassword(value: string) {
    if (value.length < 8) {
      return false;
    }

    let categories = 0;

    if (/[A-Z]/.test(value)) categories++;
    if (/[a-z]/.test(value)) categories++;
    if (/[0-9]/.test(value)) categories++;
    if (/[^A-Za-z0-9]/.test(value)) categories++;

    return categories >= 3;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setMessageType("error");
      setMessage("Please fill in all required fields.");
      return;
    }

    if (!validateEmail(email.trim())) {
      setMessageType("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    if (!validatePhone(phone.trim())) {
      setMessageType("error");
      setMessage(
        "Please enter a valid phone number with 10 to 15 digits."
      );
      return;
    }

    if (!validatePassword(password)) {
      setMessageType("error");
      setMessage(
        "Password must be at least 8 characters and contain at least 3 of these: uppercase letter, lowercase letter, number, or symbol."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage("Passwords do not match.");
      return;
    }

    if (!agreed) {
      setMessageType("error");
      setMessage("Please agree to the Terms & Conditions.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-hotel-id": String(HOTEL_ID),
          },
          body: JSON.stringify({
            hotel_id: HOTEL_ID,
            full_name: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            password,
            role: "admin",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessageType("error");
        setMessage(
          data.message || "Unable to start admin registration."
        );
        return;
      }

      setOtpStep(true);
      setMessageType("success");
      setMessage(
        data.message ||
          "A verification code has been sent to your email address."
      );
    } catch (error) {
      console.error("Admin registration error:", error);

      setMessageType("error");
      setMessage(
        "Unable to connect to the backend. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");

    if (!otp || otp.length !== 6) {
      setMessageType("error");
      setMessage("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-hotel-id": String(HOTEL_ID),
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp,
            hotel_id: HOTEL_ID,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessageType("error");
        setMessage(
          data.message ||
            "Invalid or expired verification code."
        );
        return;
      }

      setMessageType("success");
      setMessage(
        "Admin account created successfully. Redirecting to sign in..."
      );

      setTimeout(() => {
        window.location.href = "/signin";
      }, 1200);
    } catch (error) {
      console.error("Admin OTP verification error:", error);

      setMessageType("error");
      setMessage(
        "Unable to connect to the backend. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/resend-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-hotel-id": String(HOTEL_ID),
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            hotel_id: HOTEL_ID,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessageType("error");
        setMessage(
          data.message ||
            "Unable to resend verification code."
        );
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
        "Unable to connect to the backend. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B] dark:bg-[#0F0B1F] dark:text-white">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-purple-100 bg-white/95 backdrop-blur dark:border-[#31265A] dark:bg-[#18132D]/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-xl font-bold text-[#5B21B6] dark:text-[#A78BFA]"
          >
            Growth Lodge
          </Link>

          <ThemeToggle />
        </div>
      </header>

      <main className="flex min-h-screen items-center justify-center px-4 pb-10 pt-24">
        <div className="w-full max-w-xl">
          <div className="mb-5">
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#5B21B6] transition hover:text-[#4C1D95] dark:text-[#A78BFA]"
            >
              ← Back to Sign In
            </Link>
          </div>

          <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xl shadow-purple-100/40 dark:border-[#31265A] dark:bg-[#18132D] dark:shadow-none sm:p-8">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5B21B6] text-3xl text-white shadow-lg shadow-purple-300/30 dark:shadow-none">
                🛡️
              </div>
            </div>

            <div className="mb-8 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#5B21B6] dark:text-[#A78BFA]">
                Administrator
              </p>

              <h1 className="text-2xl font-bold text-[#1E1B4B] dark:text-white sm:text-3xl">
                {otpStep
                  ? "Verify Admin Email"
                  : "Create Admin Account"}
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {otpStep
                  ? "Enter the verification code sent to your email."
                  : "Create an administrator account for your Growth Lodge hotel management system."}
              </p>
            </div>

            <div className="mb-6 rounded-xl bg-[#F5F3FF] px-4 py-3 text-center dark:bg-[#241B3D]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Account Type
              </p>

              <p className="mt-1 font-semibold text-[#5B21B6] dark:text-[#A78BFA]">
                Administrator
              </p>
            </div>

            {message && (
              <div
                className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
                  messageType === "success"
                    ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400"
                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
                }`}
              >
                {message}
              </div>
            )}

            {!otpStep ? (
              <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#1E1B4B] outline-none transition placeholder:text-gray-400 focus:border-[#5B21B6] focus:ring-4 focus:ring-purple-100 dark:border-[#31265A] dark:bg-[#0F0B1F] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#A78BFA] dark:focus:ring-purple-950"
                  />
                </div>

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
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#1E1B4B] outline-none transition placeholder:text-gray-400 focus:border-[#5B21B6] focus:ring-4 focus:ring-purple-100 dark:border-[#31265A] dark:bg-[#0F0B1F] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#A78BFA] dark:focus:ring-purple-950"
                  />
                </div>

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
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#1E1B4B] outline-none transition placeholder:text-gray-400 focus:border-[#5B21B6] focus:ring-4 focus:ring-purple-100 dark:border-[#31265A] dark:bg-[#0F0B1F] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#A78BFA] dark:focus:ring-purple-950"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#1E1B4B] outline-none transition placeholder:text-gray-400 focus:border-[#5B21B6] focus:ring-4 focus:ring-purple-100 dark:border-[#31265A] dark:bg-[#0F0B1F] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#A78BFA] dark:focus:ring-purple-950"
                  />

                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    Password must be at least 8 characters and
                    contain at least 3 of: uppercase, lowercase,
                    number, symbol.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Confirm Password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#1E1B4B] outline-none transition placeholder:text-gray-400 focus:border-[#5B21B6] focus:ring-4 focus:ring-purple-100 dark:border-[#31265A] dark:bg-[#0F0B1F] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#A78BFA] dark:focus:ring-purple-950"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) =>
                      setAgreed(e.target.checked)
                    }
                    className="mt-1 h-4 w-4 cursor-pointer accent-[#5B21B6]"
                  />

                  <label
                    htmlFor="terms"
                    className="cursor-pointer text-sm leading-6 text-gray-600 dark:text-gray-300"
                  >
                    I agree to the{" "}
                    <Link
                      href="#"
                      className="font-semibold text-[#5B21B6] hover:underline dark:text-[#A78BFA]"
                    >
                      Terms & Conditions
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#5B21B6] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition hover:bg-[#4C1D95] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
                >
                  {loading
                    ? "Sending Verification Code..."
                    : "Continue & Verify Email"}
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleVerifyOtp}
                className="space-y-5"
              >
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
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-[#1E1B4B] outline-none transition focus:border-[#5B21B6] focus:ring-4 focus:ring-purple-100 dark:border-[#31265A] dark:bg-[#0F0B1F] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#A78BFA] dark:focus:ring-purple-950"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#5B21B6] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition hover:bg-[#4C1D95] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
                >
                  {loading
                    ? "Verifying..."
                    : "Verify Email & Create Admin Account"}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="w-full rounded-xl border border-[#5B21B6] px-5 py-3.5 text-sm font-semibold text-[#5B21B6] transition hover:bg-[#F5F3FF] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#A78BFA] dark:text-[#A78BFA] dark:hover:bg-[#241B3D]"
                >
                  Resend Verification Code
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpStep(false);
                    setOtp("");
                    setMessage("");
                  }}
                  className="w-full text-sm font-semibold text-gray-500 transition hover:text-[#5B21B6] dark:text-gray-400 dark:hover:text-[#A78BFA]"
                >
                  ← Back to Sign Up
                </button>
              </form>
            )}

            <div className="mt-7 border-t border-gray-100 pt-6 text-center dark:border-[#31265A]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Already have an admin account?{" "}
                <Link
                  href="/signin"
                  className="font-semibold text-[#5B21B6] hover:underline dark:text-[#A78BFA]"
                >
                  Sign In
                </Link>
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-purple-100 bg-[#F5F3FF] p-4 dark:border-[#4B3B78] dark:bg-[#241B3D]">
              <div className="flex gap-3">
                <span className="text-lg">🔐</span>

                <p className="text-xs leading-5 text-gray-600 dark:text-gray-300">
                  Admin accounts have access to hotel management
                  features. Email verification is required before
                  the administrator account is created.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Growth Lodge. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}