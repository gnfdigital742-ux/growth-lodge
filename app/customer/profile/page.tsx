
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/component/ThemeToggle";

type User = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  created_at?: string;
};

export default function CustomerProfilePage() {
  const [userId, setUserId] = useState<number | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("Lagos, Nigeria");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("success");

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] =
    useState(false);

  // ========================================
  // LOAD CUSTOMER PROFILE
  // ========================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUser =
          localStorage.getItem("growthLodgeUser");

        if (!storedUser) {
          setMessage("Please sign in to view your profile.");
          setMessageType("error");
          setLoading(false);
          return;
        }

        const loggedInUser = JSON.parse(storedUser);

        if (!loggedInUser.id) {
          setMessage("Your account information is incomplete.");
          setMessageType("error");
          setLoading(false);
          return;
        }

        const id = Number(loggedInUser.id);

        setUserId(id);

        const response = await fetch(
          `http://localhost:5000/api/auth/users/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Could not load your profile."
          );
        }

        const user: User = data.user;

        setFullName(user.full_name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");

        // Keep the localStorage user information updated.
        localStorage.setItem(
          "growthLodgeUser",
          JSON.stringify(user)
        );
      } catch (error) {
        console.error("PROFILE LOAD ERROR:", error);

        setMessage(
          "Unable to load your profile. Please make sure the backend is running."
        );

        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ========================================
  // SAVE PROFILE
  // ========================================

  async function handleSaveProfile(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!userId) {
      setMessage("User account not found.");
      setMessageType("error");
      return;
    }

    if (!fullName.trim() || !email.trim()) {
      setMessage("Full name and email are required.");
      setMessageType("error");
      return;
    }

    try {
      setSavingProfile(true);
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/auth/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not update profile."
        );
      }

      const updatedUser: User = data.user;

      setFullName(updatedUser.full_name || "");
      setEmail(updatedUser.email || "");
      setPhone(updatedUser.phone || "");

      localStorage.setItem(
        "growthLodgeUser",
        JSON.stringify(updatedUser)
      );

      setMessage(
        data.message || "Profile updated successfully."
      );

      setMessageType("success");
    } catch (error) {
      console.error("PROFILE UPDATE ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not update your profile."
      );

      setMessageType("error");
    } finally {
      setSavingProfile(false);
    }
  }

  // ========================================
  // CHANGE PASSWORD
  // ========================================

  async function handleChangePassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!userId) {
      setMessage("User account not found.");
      setMessageType("error");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Please fill in all password fields.");
      setMessageType("error");
      return;
    }

    if (newPassword.length < 6) {
      setMessage(
        "New password must be at least 6 characters."
      );
      setMessageType("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    try {
      setChangingPassword(true);
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/auth/users/${userId}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not change password."
        );
      }

      setMessage(
        data.message || "Password changed successfully."
      );

      setMessageType("success");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("PASSWORD UPDATE ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not change your password."
      );

      setMessageType("error");
    } finally {
      setChangingPassword(false);
    }
  }

  const firstLetter =
    fullName.trim().charAt(0).toUpperCase() || "C";

  return (
    <div className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B] dark:bg-[#0F0B1F] dark:text-white">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-purple-100 bg-white dark:border-[#31265A] dark:bg-[#18132D]">
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <Link
            href="/customer"
            className="text-xl font-bold text-[#5B21B6] dark:text-[#A78BFA]"
          >
            Growth Lodge
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">
                {fullName || "Customer"}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {email || "Loading..."}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5B21B6] font-bold text-white">
              {firstLetter}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-64 border-r border-purple-100 bg-white dark:border-[#31265A] dark:bg-[#18132D] md:block">
        <nav className="space-y-2 p-4">
          <Link
            href="/customer"
            className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-purple-50 dark:hover:bg-[#241B3D]"
          >
            Dashboard
          </Link>

          <Link
            href="/customer/reservations"
            className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-purple-50 dark:hover:bg-[#241B3D]"
          >
            My Reservations
          </Link>

          <Link
            href="/customer/rooms"
            className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-purple-50 dark:hover:bg-[#241B3D]"
          >
            Browse Rooms
          </Link>

          <Link
            href="/customer/payments"
            className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-purple-50 dark:hover:bg-[#241B3D]"
          >
            Payments
          </Link>

          <Link
            href="/customer/profile"
            className="block rounded-xl bg-[#5B21B6] px-4 py-3 text-sm font-semibold text-white"
          >
            My Profile
          </Link>

          <Link
            href="/signin"
            className="block rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-[#241B3D]"
          >
            Sign Out
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="pt-16 md:ml-64">
        <div className="p-4 md:p-8">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold md:text-3xl">
              My Profile
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your personal information and account settings.
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 rounded-xl border p-4 text-sm font-medium ${
                messageType === "success"
                  ? "border-purple-200 bg-white text-[#5B21B6] dark:border-[#4B3B78] dark:bg-[#18132D] dark:text-[#A78BFA]"
                  : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {message}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-[#18132D]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading your profile...
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Card */}
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#5B21B6] text-3xl font-bold text-white">
                      {firstLetter}
                    </div>

                    <h2 className="mt-4 text-xl font-bold">
                      {fullName || "Customer"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Customer Account
                    </p>

                    <div className="mt-6 w-full rounded-xl bg-[#F5F3FF] p-4 text-left dark:bg-[#241B3D]">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Account Status
                      </p>

                      <p className="mt-1 font-semibold text-green-600">
                        Active
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D] lg:col-span-2">
                  <h2 className="mb-6 text-lg font-bold">
                    Personal Information
                  </h2>

                  <form
                    onSubmit={handleSaveProfile}
                    className="space-y-5"
                  >
                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Full Name
                        </label>

                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) =>
                            setFullName(e.target.value)
                          }
                          className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm outline-none focus:border-[#5B21B6] dark:border-[#31265A] dark:bg-[#0F0B1F]"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Email Address
                        </label>

                        <input
                          type="email"
                          value={email}
                          onChange={(e) =>
                            setEmail(e.target.value)
                          }
                          className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm outline-none focus:border-[#5B21B6] dark:border-[#31265A] dark:bg-[#0F0B1F]"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Phone Number
                        </label>

                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value)
                          }
                          className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm outline-none focus:border-[#5B21B6] dark:border-[#31265A] dark:bg-[#0F0B1F]"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Address
                        </label>

                        <input
                          type="text"
                          value={address}
                          onChange={(e) =>
                            setAddress(e.target.value)
                          }
                          className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm outline-none focus:border-[#5B21B6] dark:border-[#31265A] dark:bg-[#0F0B1F]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="rounded-xl bg-[#5B21B6] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4C1D95] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingProfile
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </form>
                </div>
              </div>

              {/* Security */}
              <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">
                <h2 className="mb-2 text-lg font-bold">
                  Security
                </h2>

                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                  Update your account password.
                </p>

                <form
                  onSubmit={handleChangePassword}
                  className="max-w-2xl space-y-5"
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Current Password
                    </label>

                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) =>
                        setCurrentPassword(e.target.value)
                      }
                      placeholder="Enter current password"
                      className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm outline-none focus:border-[#5B21B6] dark:border-[#31265A] dark:bg-[#0F0B1F]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      New Password
                    </label>

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(e.target.value)
                      }
                      placeholder="Enter new password"
                      className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm outline-none focus:border-[#5B21B6] dark:border-[#31265A] dark:bg-[#0F0B1F]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Confirm New Password
                    </label>

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      placeholder="Confirm new password"
                      className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm outline-none focus:border-[#5B21B6] dark:border-[#31265A] dark:bg-[#0F0B1F]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="rounded-xl border border-[#5B21B6] px-6 py-3 text-sm font-semibold text-[#5B21B6] hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#A78BFA] dark:text-[#A78BFA] dark:hover:bg-[#241B3D]"
                  >
                    {changingPassword
                      ? "Updating..."
                      : "Update Password"}
                  </button>
                </form>
              </div>

              {/* Support */}
              <div className="mt-6 rounded-2xl bg-[#5B21B6] p-6 text-white">
                <h2 className="text-lg font-bold">
                  Need help with your account?
                </h2>

                <p className="mt-2 text-sm text-purple-100">
                  Contact Growth Lodge support for assistance with your account.
                </p>

                <a
                  href="tel:09114545197"
                  className="mt-4 inline-block rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#5B21B6]"
                >
                  Call +234 911 454 5197
                </a>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}