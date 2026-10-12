"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/component/ThemeToggle";

type ReservationStatus =
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled"
  | "Checked In"
  | "Checked Out";

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

type Reservation = {
  id: string;
  room: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  amount: number;
  status: ReservationStatus;
  guestEmail: string;
};

type FilterType =
  | "All"
  | "Upcoming"
  | "Completed"
  | "Cancelled";

type LoggedInUser = {
  id: number;
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
};

export default function CustomerReservations() {
  const [reservations, setReservations] =
    useState<Reservation[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState<FilterType>("All");

  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  const [customerName, setCustomerName] =
    useState("Customer");

  const [customerEmail, setCustomerEmail] =
    useState("");

  // ========================================
  // LOAD CUSTOMER + RESERVATIONS
  // ========================================

  useEffect(() => {
    const loadCustomerReservations =
      async () => {
        try {
          setLoading(true);
          setError("");

          // ========================================
          // GET LOGGED-IN USER
          // ========================================

          const storedUser =
            localStorage.getItem(
              "growthLodgeUser"
            );

          if (!storedUser) {
            setError(
              "Please sign in before viewing your reservations."
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

          // ========================================
          // CHECK USER ID
          // ========================================

          if (!user?.id) {
            setError(
              "Your account information is incomplete. Please sign in again."
            );

            setLoading(false);
            return;
          }

          // ========================================
          // CUSTOMER INFORMATION
          // ========================================

          setCustomerName(
            user.full_name ||
              user.name ||
              "Customer"
          );

          setCustomerEmail(
            user.email || ""
          );

          // ========================================
          // GET RESERVATIONS FROM BACKEND
          // ========================================

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

          const backendReservations: BackendReservation[] =
            data.reservations || [];

          console.log(
            "All reservations from backend:",
            backendReservations
          );

          // ========================================
          // FILTER BY USER ID
          // ========================================

          const customerReservations =
            backendReservations.filter(
              (reservation) =>
                Number(
                  reservation.user_id
                ) === Number(user.id)
            );

          console.log(
            "Customer reservations:",
            customerReservations
          );

          // ========================================
          // FORMAT RESERVATIONS
          // ========================================

          const formattedReservations: Reservation[] =
            customerReservations.map(
              (reservation) => ({
                id: `GL-${reservation.id}`,

                room:
                  reservation.room_type ||
                  "Room",

                roomNumber:
                  reservation.room_number ||
                  "N/A",

                checkIn:
                  formatDate(
                    reservation.check_in
                  ),

                checkOut:
                  formatDate(
                    reservation.check_out
                  ),

                guests:
                  String(
                    reservation.guests || 1
                  ),

                amount:
                  Number(
                    reservation.price || 0
                  ),

                status:
                  normalizeStatus(
                    reservation.status
                  ),

                guestEmail:
                  reservation.email ||
                  user.email ||
                  "",
              })
            );

          setReservations(
            formattedReservations
          );
        } catch (error) {
          console.error(
            "Reservation loading error:",
            error
          );

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load your reservations."
          );
        } finally {
          setLoading(false);
        }
      };

    loadCustomerReservations();
  }, []);

  // ========================================
  // FILTER RESERVATIONS
  // ========================================

  const filteredReservations =
    useMemo(() => {
      if (activeFilter === "All") {
        return reservations;
      }

      if (activeFilter === "Upcoming") {
        return reservations.filter(
          (reservation) =>
            reservation.status ===
              "Pending" ||
            reservation.status ===
              "Confirmed" ||
            reservation.status ===
              "Checked In"
        );
      }

      if (activeFilter === "Completed") {
        return reservations.filter(
          (reservation) =>
            reservation.status ===
              "Completed" ||
            reservation.status ===
              "Checked Out"
        );
      }

      if (activeFilter === "Cancelled") {
        return reservations.filter(
          (reservation) =>
            reservation.status ===
            "Cancelled"
        );
      }

      return reservations;
    }, [
      reservations,
      activeFilter,
    ]);

  // ========================================
  // SUMMARY COUNTS
  // ========================================

  const totalReservations =
    reservations.length;

  const upcomingReservations =
    reservations.filter(
      (reservation) =>
        reservation.status ===
          "Pending" ||
        reservation.status ===
          "Confirmed" ||
        reservation.status ===
          "Checked In"
    ).length;

  const completedReservations =
    reservations.filter(
      (reservation) =>
        reservation.status ===
          "Completed" ||
        reservation.status ===
          "Checked Out"
    ).length;

  const cancelledReservations =
    reservations.filter(
      (reservation) =>
        reservation.status ===
        "Cancelled"
    ).length;

  // ========================================
  // FORMAT DATE
  // ========================================

  function formatDate(
    dateString: string
  ) {
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
  }

  // ========================================
  // NORMALIZE STATUS
  // ========================================

  function normalizeStatus(
    status: string
  ): ReservationStatus {
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
      case "checked-in":
        return "Checked In";

      case "checked out":
      case "checked_out":
      case "checked-out":
        return "Checked Out";

      case "pending":
      default:
        return "Pending";
    }
  }

  // ========================================
  // STATUS STYLE
  // ========================================

  function getStatusClass(
    status: ReservationStatus
  ) {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700";

      case "Completed":
      case "Checked Out":
        return "bg-blue-100 text-blue-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      case "Checked In":
        return "bg-purple-100 text-purple-700";

      case "Pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }

  // ========================================
  // FORMAT CURRENCY
  // ========================================

  function formatCurrency(
    amount: number
  ) {
    return new Intl.NumberFormat(
      "en-NG",
      {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }
    ).format(amount);
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B]">

      {/* HEADER */}

      <header className="fixed left-0 right-0 top-0 z-50 h-20 border-b border-purple-100 bg-white">
        <div className="flex h-full items-center justify-between px-6 lg:px-8">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6D28D9] text-xl font-bold text-white">
              G
            </div>

            <div>
              <h1 className="text-lg font-bold text-[#1E1B4B]">
                Growth Lodge
              </h1>

              <p className="text-xs text-gray-500">
                Customer Portal
              </p>
            </div>

          </div>

          <div className="flex items-center gap-5">

            <ThemeToggle />

            <div className="hidden items-center gap-3 sm:flex">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A78BFA] font-semibold text-white">
                {customerName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <p className="text-sm font-semibold text-[#1E1B4B]">
                  {customerName}
                </p>

                <p className="text-xs text-gray-500">
                  Customer
                </p>
              </div>

            </div>

          </div>

        </div>
      </header>

      {/* SIDEBAR */}

      <aside className="fixed bottom-0 left-0 top-20 z-40 hidden w-64 border-r border-purple-100 bg-white lg:block">

        <div className="flex h-full flex-col">

          <nav className="flex-1 space-y-2 p-5">

            <Link
              href="/customer"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-[#F5F3FF] hover:text-[#6D28D9]"
            >
              <span>▣</span>
              Dashboard
            </Link>

            <Link
              href="/customer/reservations"
              className="flex items-center gap-3 rounded-xl bg-[#6D28D9] px-4 py-3 text-sm font-semibold text-white shadow-sm"
            >
              <span>▤</span>
              My Reservations
            </Link>

            <Link
              href="/customer/rooms"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-[#F5F3FF] hover:text-[#6D28D9]"
            >
              <span>▦</span>
              Browse Rooms
            </Link>

            <Link
              href="/customer/payments"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-[#F5F3FF] hover:text-[#6D28D9]"
            >
              <span>₦</span>
              Payments
            </Link>

            <Link
              href="/customer/profile"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-[#F5F3FF] hover:text-[#6D28D9]"
            >
              <span>◉</span>
              My Profile
            </Link>

          </nav>

          <div className="border-t border-purple-100 p-5">

            <Link
              href="/signin"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <span>↪</span>
              Sign Out
            </Link>

          </div>

        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="pt-20 lg:pl-64">

        <div className="p-5 sm:p-6 lg:p-8">

          {/* PAGE HEADING */}

          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>

              <p className="mb-1 text-sm font-medium text-[#6D28D9]">
                Customer Portal
              </p>

              <h2 className="text-2xl font-bold text-[#1E1B4B] sm:text-3xl">
                My Reservations
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                View and manage your hotel reservations.
              </p>

            </div>

            <Link
              href="/customer/rooms"
              className="inline-flex items-center justify-center rounded-xl bg-[#6D28D9] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5B21B6]"
            >
              + Book a Room
            </Link>

          </div>

          {/* SUMMARY CARDS */}

          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl text-[#6D28D9]">
                  ▤
                </div>

                <span className="text-xs font-medium text-gray-400">
                  All
                </span>

              </div>

              <p className="text-sm text-gray-500">
                Total Reservations
              </p>

              <p className="mt-1 text-2xl font-bold text-[#1E1B4B]">
                {totalReservations}
              </p>

            </div>

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl text-green-600">
                  ✓
                </div>

                <span className="text-xs font-medium text-gray-400">
                  Active
                </span>

              </div>

              <p className="text-sm text-gray-500">
                Upcoming
              </p>

              <p className="mt-1 text-2xl font-bold text-[#1E1B4B]">
                {upcomingReservations}
              </p>

            </div>

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-600">
                  ★
                </div>

                <span className="text-xs font-medium text-gray-400">
                  Finished
                </span>

              </div>

              <p className="text-sm text-gray-500">
                Completed
              </p>

              <p className="mt-1 text-2xl font-bold text-[#1E1B4B]">
                {completedReservations}
              </p>

            </div>

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-xl text-red-600">
                  ×
                </div>

                <span className="text-xs font-medium text-gray-400">
                  Closed
                </span>

              </div>

              <p className="text-sm text-gray-500">
                Cancelled
              </p>

              <p className="mt-1 text-2xl font-bold text-[#1E1B4B]">
                {cancelledReservations}
              </p>

            </div>

          </div>

          {/* RESERVATIONS */}

          <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">

            {/* FILTERS */}

            <div className="border-b border-purple-100 p-5">

              <div className="flex flex-wrap gap-2">

                {(
                  [
                    "All",
                    "Upcoming",
                    "Completed",
                    "Cancelled",
                  ] as FilterType[]
                ).map((filter) => (

                  <button
                    key={filter}
                    onClick={() =>
                      setActiveFilter(
                        filter
                      )
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      activeFilter === filter
                        ? "bg-[#6D28D9] text-white"
                        : "bg-[#F5F3FF] text-gray-600 hover:bg-purple-100 hover:text-[#6D28D9]"
                    }`}
                  >
                    {filter}
                  </button>

                ))}

              </div>

            </div>

            {/* LOADING */}

            {loading && (
              <div className="flex min-h-[300px] items-center justify-center p-8">

                <div className="text-center">

                  <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-100 border-t-[#6D28D9]" />

                  <p className="text-sm font-medium text-gray-600">
                    Loading your reservations...
                  </p>

                </div>

              </div>
            )}

            {/* ERROR */}

            {!loading && error && (
              <div className="p-8">

                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">

                  <p className="font-semibold text-red-700">
                    Unable to load reservations
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {error}
                  </p>

                  <Link
                    href="/signin"
                    className="mt-4 inline-block rounded-lg bg-[#6D28D9] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Sign In Again
                  </Link>

                </div>

              </div>
            )}

            {/* EMPTY */}

            {!loading &&
              !error &&
              filteredReservations.length ===
                0 && (

                <div className="flex min-h-[320px] items-center justify-center p-8">

                  <div className="max-w-md text-center">

                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl text-[#6D28D9]">
                      ▤
                    </div>

                    <h3 className="text-lg font-bold text-[#1E1B4B]">
                      No reservations found
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      {activeFilter ===
                      "All"
                        ? "You do not have any reservations yet."
                        : `You do not have any ${activeFilter.toLowerCase()} reservations.`}
                    </p>

                    <Link
                      href="/customer/rooms"
                      className="mt-5 inline-flex rounded-xl bg-[#6D28D9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5B21B6]"
                    >
                      Browse Rooms
                    </Link>

                  </div>

                </div>

              )}

            {/* DESKTOP TABLE */}

            {!loading &&
              !error &&
              filteredReservations.length >
                0 && (

                <div className="hidden overflow-x-auto lg:block">

                  <table className="w-full">

                    <thead>

                      <tr className="border-b border-purple-100 bg-[#F5F3FF]">

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Reservation
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Room
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Check-in
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Check-out
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Guests
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Room Price
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Status
                        </th>

                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredReservations.map(
                        (reservation) => (

                          <tr
                            key={
                              reservation.id
                            }
                            className="border-b border-purple-50 last:border-0 hover:bg-purple-50/40"
                          >

                            <td className="px-5 py-5">

                              <p className="font-semibold text-[#1E1B4B]">
                                #
                                {
                                  reservation.id
                                }
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                Growth Lodge
                              </p>

                            </td>

                            <td className="px-5 py-5">

                              <p className="font-semibold text-[#1E1B4B]">
                                {
                                  reservation.room
                                }
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                Room{" "}
                                {
                                  reservation.roomNumber
                                }
                              </p>

                            </td>

                            <td className="px-5 py-5 text-sm text-gray-600">
                              {
                                reservation.checkIn
                              }
                            </td>

                            <td className="px-5 py-5 text-sm text-gray-600">
                              {
                                reservation.checkOut
                              }
                            </td>

                            <td className="px-5 py-5 text-sm text-gray-600">
                              {
                                reservation.guests
                              }
                            </td>

                            <td className="px-5 py-5 text-sm font-semibold text-[#1E1B4B]">

                              {reservation.amount >
                              0
                                ? `${formatCurrency(
                                    reservation.amount
                                  )} / night`
                                : "Not set"}

                            </td>

                            <td className="px-5 py-5">

                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                  reservation.status
                                )}`}
                              >
                                {
                                  reservation.status
                                }
                              </span>

                            </td>

                            <td className="px-5 py-5 text-right">

                              <button
                                onClick={() =>
                                  setSelectedReservation(
                                    reservation
                                  )
                                }
                                className="rounded-lg border border-purple-200 px-3 py-2 text-xs font-semibold text-[#6D28D9] transition hover:bg-purple-50"
                              >
                                View Details
                              </button>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            {/* MOBILE CARDS */}

            {!loading &&
              !error &&
              filteredReservations.length >
                0 && (

                <div className="space-y-4 p-4 lg:hidden">

                  {filteredReservations.map(
                    (reservation) => (

                      <div
                        key={
                          reservation.id
                        }
                        className="rounded-xl border border-purple-100 p-4"
                      >

                        <div className="mb-4 flex items-start justify-between gap-3">

                          <div>

                            <p className="font-bold text-[#1E1B4B]">
                              #
                              {
                                reservation.id
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {
                                reservation.room
                              }{" "}
                              • Room{" "}
                              {
                                reservation.roomNumber
                              }
                            </p>

                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              reservation.status
                            )}`}
                          >
                            {
                              reservation.status
                            }
                          </span>

                        </div>

                        <div className="grid grid-cols-2 gap-4">

                          <div>

                            <p className="text-xs text-gray-400">
                              Check-in
                            </p>

                            <p className="mt-1 text-sm font-medium text-[#1E1B4B]">
                              {
                                reservation.checkIn
                              }
                            </p>

                          </div>

                          <div>

                            <p className="text-xs text-gray-400">
                              Check-out
                            </p>

                            <p className="mt-1 text-sm font-medium text-[#1E1B4B]">
                              {
                                reservation.checkOut
                              }
                            </p>

                          </div>

                          <div>

                            <p className="text-xs text-gray-400">
                              Guests
                            </p>

                            <p className="mt-1 text-sm font-medium text-[#1E1B4B]">
                              {
                                reservation.guests
                              }
                            </p>

                          </div>

                          <div>

                            <p className="text-xs text-gray-400">
                              Room Price
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#1E1B4B]">
                              {reservation.amount >
                              0
                                ? `${formatCurrency(
                                    reservation.amount
                                  )} / night`
                                : "Not set"}
                            </p>

                          </div>

                        </div>

                        <button
                          onClick={() =>
                            setSelectedReservation(
                              reservation
                            )
                          }
                          className="mt-5 w-full rounded-lg bg-[#F5F3FF] px-4 py-2.5 text-sm font-semibold text-[#6D28D9] transition hover:bg-purple-100"
                        >
                          View Details
                        </button>

                      </div>

                    )
                  )}

                </div>

              )}

          </div>

          {/* HELP */}

          <div className="mt-6 rounded-2xl bg-[#1E1B4B] p-6 text-white shadow-sm">

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

              <div>

                <h3 className="text-lg font-bold">
                  Need help with your reservation?
                </h3>

                <p className="mt-1 text-sm text-purple-200">
                  Our support team is available to assist you.
                </p>

              </div>

              <a
                href="tel:09114545197"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#6D28D9] transition hover:bg-purple-50"
              >
                Call Support
              </a>

            </div>

          </div>

          {/* FOOTER */}

          <div className="py-6 text-center">

            <p className="text-xs text-gray-400">
              ©{" "}
              {new Date().getFullYear()}{" "}
              Growth Lodge. All rights reserved.
            </p>

          </div>

        </div>

      </main>

      {/* DETAILS MODAL */}

      {selectedReservation && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() =>
            setSelectedReservation(null)
          }
        >

          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="mb-6 flex items-start justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-[#6D28D9]">
                  Reservation Details
                </p>

                <h3 className="mt-1 text-2xl font-bold text-[#1E1B4B]">
                  #
                  {
                    selectedReservation.id
                  }
                </h3>

              </div>

              <button
                onClick={() =>
                  setSelectedReservation(
                    null
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition hover:bg-gray-200"
              >
                ×
              </button>

            </div>

            {/* ROOM */}

            <div className="space-y-4">

              <div className="rounded-xl bg-[#F5F3FF] p-4">

                <p className="text-xs text-gray-500">
                  Room
                </p>

                <p className="mt-1 font-semibold text-[#1E1B4B]">
                  {
                    selectedReservation.room
                  }
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Room{" "}
                  {
                    selectedReservation.roomNumber
                  }
                </p>

              </div>

              {/* DATES */}

              <div className="grid grid-cols-2 gap-4">

                <div className="rounded-xl border border-purple-100 p-4">

                  <p className="text-xs text-gray-500">
                    Check-in
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#1E1B4B]">
                    {
                      selectedReservation.checkIn
                    }
                  </p>

                </div>

                <div className="rounded-xl border border-purple-100 p-4">

                  <p className="text-xs text-gray-500">
                    Check-out
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#1E1B4B]">
                    {
                      selectedReservation.checkOut
                    }
                  </p>

                </div>

              </div>

              {/* GUESTS + PRICE */}

              <div className="grid grid-cols-2 gap-4">

                <div className="rounded-xl border border-purple-100 p-4">

                  <p className="text-xs text-gray-500">
                    Guests
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#1E1B4B]">
                    {
                      selectedReservation.guests
                    }
                  </p>

                </div>

                <div className="rounded-xl border border-purple-100 p-4">

                  <p className="text-xs text-gray-500">
                    Room Price
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#1E1B4B]">
                    {selectedReservation.amount >
                    0
                      ? `${formatCurrency(
                          selectedReservation.amount
                        )} / night`
                      : "Not set"}
                  </p>

                </div>

              </div>

              {/* STATUS */}

              <div className="rounded-xl border border-purple-100 p-4">

                <p className="text-xs text-gray-500">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                    selectedReservation.status
                  )}`}
                >
                  {
                    selectedReservation.status
                  }
                </span>

              </div>

              {/* EMAIL */}

              <div className="rounded-xl border border-purple-100 p-4">

                <p className="text-xs text-gray-500">
                  Guest Email
                </p>

                <p className="mt-1 break-all text-sm font-medium text-[#1E1B4B]">
                  {
                    selectedReservation.guestEmail
                  }
                </p>

              </div>

            </div>

            {/* MODAL BUTTONS */}

            <div className="mt-6 flex gap-3">

              <button
                onClick={() =>
                  setSelectedReservation(
                    null
                  )
                }
                className="flex-1 rounded-xl border border-purple-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Close
              </button>

              <a
                href="tel:09114545197"
                className="flex-1 rounded-xl bg-[#6D28D9] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#5B21B6]"
              >
                Contact Support
              </a>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}