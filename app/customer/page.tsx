
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/component/ThemeToggle";

type BackendReservation = {
  id: number;
  user_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  status: string;
  created_at: string;
  full_name?: string;
  email?: string;
  phone?: string;
  room_number?: string;
  room_type?: string;
  price?: number;
};

type LoggedInUser = {
  id: number;
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
};

export default function CustomerDashboard() {
  const [customerName, setCustomerName] =
    useState("Customer");

  const [reservations, setReservations] =
    useState<BackendReservation[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const storedUser =
          localStorage.getItem("growthLodgeUser");

        if (!storedUser) {
          setError(
            "Please sign in before viewing your dashboard."
          );
          setLoading(false);
          return;
        }

        let user: LoggedInUser;

        try {
          user = JSON.parse(storedUser);
        } catch {
          setError(
            "Your login session is invalid. Please sign in again."
          );
          setLoading(false);
          return;
        }

        if (!user?.id) {
          setError(
            "Your account information is incomplete. Please sign in again."
          );
          setLoading(false);
          return;
        }

        setCustomerName(
          user.full_name ||
            user.name ||
            "Customer"
        );

        const response = await fetch(
          "http://localhost:5000/api/reservations"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load reservations."
          );
        }

        const data =
          await response.json();

        const allReservations: BackendReservation[] =
          data.reservations || [];

        const customerReservations =
          allReservations.filter(
            (reservation) =>
              Number(reservation.user_id) ===
              Number(user.id)
          );

        setReservations(
          customerReservations
        );
      } catch (error) {
        console.error(
          "Customer dashboard error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ========================================
  // RESERVATION HELPERS
  // ========================================

  const isUpcoming = (
    reservation: BackendReservation
  ) => {
    const status =
      reservation.status?.toLowerCase();

    return (
      status === "pending" ||
      status === "confirmed" ||
      status === "checked in" ||
      status === "checked_in"
    );
  };

  const isCompleted = (
    reservation: BackendReservation
  ) => {
    const status =
      reservation.status?.toLowerCase();

    return (
      status === "completed" ||
      status === "checked out" ||
      status === "checked_out"
    );
  };

  const normalizeStatus = (
    status: string
  ) => {
    const normalized =
      status?.toLowerCase();

    switch (normalized) {
      case "confirmed":
        return "Confirmed";

      case "completed":
        return "Completed";

      case "cancelled":
      case "canceled":
        return "Cancelled";

      case "checked in":
      case "checked_in":
        return "Checked In";

      case "checked out":
      case "checked_out":
        return "Checked Out";

      case "pending":
      default:
        return "Pending";
    }
  };

  const formatDate = (
    dateString: string
  ) => {
    if (!dateString) {
      return "—";
    }

    const date = new Date(dateString);

    if (
      Number.isNaN(date.getTime())
    ) {
      return dateString;
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatCurrency = (
    amount: number
  ) => {
    return new Intl.NumberFormat(
      "en-NG",
      {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }
    ).format(amount);
  };

  // ========================================
  // REAL DASHBOARD DATA
  // ========================================

  const upcomingReservations =
    reservations.filter(
      isUpcoming
    );

  const completedReservations =
    reservations.filter(
      isCompleted
    );

  const totalReservations =
    reservations.length;

  const upcomingCount =
    upcomingReservations.length;

  const completedCount =
    completedReservations.length;

  const recentReservations =
    reservations.slice(0, 5);

  const nextReservation =
    upcomingReservations.length > 0
      ? upcomingReservations[0]
      : null;

  return (
    <main className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B] dark:bg-[#0F0B1F] dark:text-white">

      {/* TOP HEADER */}

      <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-purple-100 bg-white dark:border-[#31265A] dark:bg-[#18132D]">

        <div className="flex h-full items-center justify-between px-4 md:px-6">

          {/* LOGO */}

          <Link
            href="/customer"
            className="text-xl font-bold text-[#5B21B6] dark:text-[#A78BFA] md:text-2xl"
          >
            Growth Lodge
          </Link>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-3">

            <ThemeToggle />

            {/* PROFILE */}

            <div className="hidden items-center gap-3 sm:flex">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5B21B6] font-semibold text-white">
                {customerName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="hidden lg:block">

                <p className="text-sm font-semibold">
                  {customerName}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Customer Account
                </p>

              </div>

            </div>

          </div>

        </div>

      </header>

      {/* SIDEBAR */}

      <aside className="fixed bottom-0 left-0 top-16 hidden w-64 border-r border-purple-100 bg-white dark:border-[#31265A] dark:bg-[#18132D] md:block">

        <div className="flex h-full flex-col">

          {/* NAVIGATION */}

          <nav className="flex-1 space-y-2 p-4">

            <Link
              href="/customer"
              className="flex items-center gap-3 rounded-xl bg-[#5B21B6] px-4 py-3 font-semibold text-white"
            >
              <span>🏠</span>
              <span>Dashboard</span>
            </Link>

            <Link
              href="/customer/reservations"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>📅</span>
              <span>My Reservations</span>
            </Link>

            <Link
              href="/customer/rooms"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>🛏️</span>
              <span>Browse Rooms</span>
            </Link>

            <Link
              href="/customer/payments"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>💳</span>
              <span>Payments</span>
            </Link>

            <Link
              href="/customer/profile"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>👤</span>
              <span>My Profile</span>
            </Link>

          </nav>

          {/* BOTTOM */}

          <div className="border-t border-purple-100 p-4 dark:border-[#31265A]">

            <Link
              href="/signin"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 transition hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </Link>

          </div>

        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="pt-16 md:ml-64">

        <div className="p-5 md:p-8">

          {/* PAGE HEADER */}

          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>

              <p className="text-sm font-medium text-[#5B21B6] dark:text-[#A78BFA]">
                Customer Portal
              </p>

              <h1 className="mt-1 text-2xl font-bold md:text-3xl">
                Welcome back, {customerName}!
              </h1>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 md:text-base">
                Manage your reservations and stay information from one place.
              </p>

            </div>

            <Link
              href="/customer/rooms"
              className="inline-flex items-center justify-center rounded-xl bg-[#5B21B6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4C1D95]"
            >
              + Book a Room
            </Link>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* STAT CARDS */}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {/* UPCOMING */}

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl dark:bg-[#31265A]">
                  📅
                </div>

                <span className="text-xs font-medium text-gray-400">
                  Upcoming
                </span>

              </div>

              <p className="mt-5 text-3xl font-bold">
                {loading
                  ? "..."
                  : upcomingCount}
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Upcoming Reservation
              </p>

            </div>

            {/* TOTAL BOOKINGS */}

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl dark:bg-[#31265A]">
                  🏨
                </div>

                <span className="text-xs font-medium text-gray-400">
                  Total
                </span>

              </div>

              <p className="mt-5 text-3xl font-bold">
                {loading
                  ? "..."
                  : totalReservations}
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Total Reservations
              </p>

            </div>

            {/* COMPLETED */}

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl dark:bg-[#31265A]">
                  ✅
                </div>

                <span className="text-xs font-medium text-gray-400">
                  Completed
                </span>

              </div>

              <p className="mt-5 text-3xl font-bold">
                {loading
                  ? "..."
                  : completedCount}
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Completed Stays
              </p>

            </div>

            {/* PAYMENTS */}

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl dark:bg-[#31265A]">
                  💳
                </div>

                <span className="text-xs font-medium text-gray-400">
                  Payments
                </span>

              </div>

              <p className="mt-5 text-2xl font-bold">
                —
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Total Payments
              </p>

            </div>

          </div>

          {/* MAIN GRID */}

          <div className="mt-8 grid gap-6 lg:grid-cols-3">

            {/* UPCOMING RESERVATION */}

            <div className="rounded-2xl border border-purple-100 bg-white shadow-sm dark:border-[#31265A] dark:bg-[#18132D] lg:col-span-2">

              <div className="flex items-center justify-between border-b border-purple-100 px-6 py-5 dark:border-[#31265A]">

                <div>

                  <h2 className="text-lg font-bold">
                    Upcoming Reservation
                  </h2>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Your next scheduled stay
                  </p>

                </div>

                <Link
                  href="/customer/reservations"
                  className="text-sm font-semibold text-[#5B21B6] hover:underline dark:text-[#A78BFA]"
                >
                  View All
                </Link>

              </div>

              <div className="p-6">

                {loading ? (

                  <div className="rounded-2xl bg-[#F5F3FF] p-8 text-center dark:bg-[#241B3D]">

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Loading reservation...
                    </p>

                  </div>

                ) : nextReservation ? (

                  <div className="rounded-2xl bg-[#F5F3FF] p-5 dark:bg-[#241B3D]">

                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                      <div className="flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#5B21B6] text-2xl text-white">
                          🛏️
                        </div>

                        <div>

                          <h3 className="font-bold">
                            {nextReservation.room_type ||
                              "Room"}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Room{" "}
                            {nextReservation.room_number ||
                              "N/A"}
                          </p>

                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Reservation #GL-
                            {nextReservation.id}
                          </p>

                        </div>

                      </div>

                      <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400">
                        {normalizeStatus(
                          nextReservation.status
                        )}
                      </span>

                    </div>

                    <div className="mt-6 grid gap-4 border-t border-purple-100 pt-5 dark:border-[#31265A] sm:grid-cols-3">

                      <div>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Check-in
                        </p>

                        <p className="mt-1 font-semibold">
                          {formatDate(
                            nextReservation.check_in
                          )}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Check-out
                        </p>

                        <p className="mt-1 font-semibold">
                          {formatDate(
                            nextReservation.check_out
                          )}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Room Price
                        </p>

                        <p className="mt-1 font-semibold">
                          {Number(
                            nextReservation.price || 0
                          ) > 0
                            ? formatCurrency(
                                Number(
                                  nextReservation.price
                                )
                              )
                            : "Not set"}
                        </p>

                      </div>

                    </div>

                  </div>

                ) : (

                  <div className="rounded-2xl bg-[#F5F3FF] p-8 text-center dark:bg-[#241B3D]">

                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 text-2xl dark:bg-[#31265A]">
                      🛏️
                    </div>

                    <h3 className="font-bold">
                      No upcoming reservation
                    </h3>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      You currently have no upcoming stays.
                    </p>

                    <Link
                      href="/customer/rooms"
                      className="mt-5 inline-flex rounded-xl bg-[#5B21B6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4C1D95]"
                    >
                      Browse Rooms
                    </Link>

                  </div>

                )}

              </div>

            </div>

            {/* QUICK ACTIONS */}

            <div className="rounded-2xl border border-purple-100 bg-white shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">

              <div className="border-b border-purple-100 px-6 py-5 dark:border-[#31265A]">

                <h2 className="text-lg font-bold">
                  Quick Actions
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Common customer actions
                </p>

              </div>

              <div className="space-y-3 p-6">

                <Link
                  href="/customer/rooms"
                  className="flex items-center gap-4 rounded-xl border border-purple-100 p-4 transition hover:border-[#A78BFA] hover:bg-[#F5F3FF] dark:border-[#31265A] dark:hover:bg-[#241B3D]"
                >

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5B21B6] text-white">
                    🛏️
                  </div>

                  <div>

                    <p className="font-semibold">
                      Browse Rooms
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Find your next room
                    </p>

                  </div>

                </Link>

                <Link
                  href="/customer/reservations"
                  className="flex items-center gap-4 rounded-xl border border-purple-100 p-4 transition hover:border-[#A78BFA] hover:bg-[#F5F3FF] dark:border-[#31265A] dark:hover:bg-[#241B3D]"
                >

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-xl dark:bg-[#31265A]">
                    📅
                  </div>

                  <div>

                    <p className="font-semibold">
                      My Reservations
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      View your bookings
                    </p>

                  </div>

                </Link>

                <Link
                  href="/customer/payments"
                  className="flex items-center gap-4 rounded-xl border border-purple-100 p-4 transition hover:border-[#A78BFA] hover:bg-[#F5F3FF] dark:border-[#31265A] dark:hover:bg-[#241B3D]"
                >

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-xl dark:bg-[#31265A]">
                    💳
                  </div>

                  <div>

                    <p className="font-semibold">
                      Payment History
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      View your payments
                    </p>

                  </div>

                </Link>

                <Link
                  href="/customer/profile"
                  className="flex items-center gap-4 rounded-xl border border-purple-100 p-4 transition hover:border-[#A78BFA] hover:bg-[#F5F3FF] dark:border-[#31265A] dark:hover:bg-[#241B3D]"
                >

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-xl dark:bg-[#31265A]">
                    👤
                  </div>

                  <div>

                    <p className="font-semibold">
                      My Profile
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Update your information
                    </p>

                  </div>

                </Link>

              </div>

            </div>

          </div>

          {/* RECENT RESERVATIONS */}

          <div className="mt-6 rounded-2xl border border-purple-100 bg-white shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">

            <div className="flex items-center justify-between border-b border-purple-100 px-6 py-5 dark:border-[#31265A]">

              <div>

                <h2 className="text-lg font-bold">
                  Recent Reservations
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Your recent booking activity
                </p>

              </div>

              <Link
                href="/customer/reservations"
                className="text-sm font-semibold text-[#5B21B6] hover:underline dark:text-[#A78BFA]"
              >
                View All
              </Link>

            </div>

            {loading ? (

              <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Loading reservations...
              </div>

            ) : recentReservations.length ===
              0 ? (

              <div className="p-8 text-center">

                <p className="font-semibold">
                  No reservations yet
                </p>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Your recent bookings will appear here.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[700px] text-left">

                  <thead>

                    <tr className="border-b border-purple-100 text-sm dark:border-[#31265A]">

                      <th className="px-6 py-4 font-semibold">
                        Reservation
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Room
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Check-in
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Check-out
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Amount
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {recentReservations.map(
                      (reservation) => (

                        <tr
                          key={reservation.id}
                          className="border-b border-purple-50 last:border-0 dark:border-[#31265A]"
                        >

                          <td className="px-6 py-4">

                            <span className="font-semibold">
                              #GL-
                              {reservation.id}
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            {reservation.room_type ||
                              "Room"}

                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                              Room{" "}
                              {reservation.room_number ||
                                "N/A"}
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            {formatDate(
                              reservation.check_in
                            )}

                          </td>

                          <td className="px-6 py-4">

                            {formatDate(
                              reservation.check_out
                            )}

                          </td>

                          <td className="px-6 py-4 font-semibold">

                            {Number(
                              reservation.price || 0
                            ) > 0
                              ? formatCurrency(
                                  Number(
                                    reservation.price
                                  )
                                )
                              : "Not set"}

                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                normalizeStatus(
                                  reservation.status
                                ) ===
                                "Confirmed"
                                  ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                  : normalizeStatus(
                                      reservation.status
                                    ) ===
                                    "Cancelled"
                                  ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                                  : normalizeStatus(
                                      reservation.status
                                    ) ===
                                    "Completed" ||
                                    normalizeStatus(
                                      reservation.status
                                    ) ===
                                      "Checked Out"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                              }`}
                            >
                              {normalizeStatus(
                                reservation.status
                              )}
                            </span>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

          {/* FOOTER NOTE */}

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Growth Lodge Customer Portal
          </div>

        </div>

      </main>

    </main>
  );
}