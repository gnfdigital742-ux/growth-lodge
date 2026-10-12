"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/component/ThemeToggle";

type Reservation = {
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
  price?: number | string;
};

export default function StaffReservations() {
  const [search, setSearch] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/reservations"
        );

        if (!response.ok) {
          throw new Error("Failed to load reservations");
        }

        const data = await response.json();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.reservations)
          ? data.reservations
          : [];

        setReservations(list);
      } catch (err) {
        console.error("RESERVATIONS LOAD ERROR:", err);
        setError(
          "Unable to connect to the reservation server. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const filteredReservations = reservations.filter((reservation) => {
    const guest = reservation.full_name || "";
    const room = reservation.room_number || "";
    const reservationId = String(reservation.id);

    return `${guest} ${reservationId} ${room} ${
      reservation.room_type || ""
    } ${reservation.email || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const formatDate = (date?: string) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date?: string) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status?: string) => {
    const currentStatus = (status || "").toLowerCase();

    if (
      currentStatus === "confirmed" ||
      currentStatus === "completed" ||
      currentStatus === "checked-in"
    ) {
      return "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400";
    }

    if (
      currentStatus === "cancelled" ||
      currentStatus === "canceled"
    ) {
      return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400";
    }

    return "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400";
  };

  const getReservationId = (id: number) => {
    return `GL${String(id).padStart(4, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B] dark:bg-[#0F0B1F] dark:text-white">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-purple-100 bg-white dark:border-[#31265A] dark:bg-[#18132D]">
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5B21B6] font-bold text-white">
              G
            </div>

            <div>
              <h1 className="text-lg font-bold text-[#5B21B6] dark:text-[#A78BFA]">
                Growth Lodge
              </h1>

              <p className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">
                Staff Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">Staff Member</p>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Staff
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5B21B6] font-bold text-white">
              S
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed bottom-0 left-0 top-16 hidden w-64 border-r border-purple-100 bg-white dark:border-[#31265A] dark:bg-[#18132D] md:block">
        <nav className="p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Staff Menu
          </p>

          <Link
            href="/staff"
            className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D]"
          >
            📊 Dashboard
          </Link>

          <Link
            href="/staff/reservations"
            className="mb-1 flex items-center gap-3 rounded-xl bg-purple-50 px-4 py-3 text-sm font-medium text-[#5B21B6] dark:bg-[#241B3D]"
          >
            📅 Reservations
          </Link>

          <Link
            href="/staff/guests"
            className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D]"
          >
            👥 Guests
          </Link>

          <Link
            href="/staff/rooms"
            className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D]"
          >
            🛏️ Rooms
          </Link>

          <Link
            href="/staff/checkin"
            className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D]"
          >
            🔑 Check-in / Check-out
          </Link>

          <Link
            href="/staff/payments"
            className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D]"
          >
            💳 Payments
          </Link>

          <Link
            href="/staff/profile"
            className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D]"
          >
            👤 My Profile
          </Link>

          <div className="my-4 border-t border-gray-100 dark:border-[#31265A]" />

          <Link
            href="/signin"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            🚪 Sign Out
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="pt-16 md:ml-64">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold md:text-3xl">
              Reservations
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View and manage hotel guest reservations.
            </p>
          </div>

          {/* Search */}
          <div className="mb-6 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-semibold">Reservation List</h3>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {loading
                    ? "Loading reservations..."
                    : `${filteredReservations.length} reservations found`}
                </p>
              </div>

              <input
                type="text"
                placeholder="Search guest, ID or room..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm outline-none focus:border-[#5B21B6] md:w-80 dark:border-[#31265A] dark:bg-[#0F0B1F]"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-purple-50 dark:bg-[#241B3D]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase">
                      Reservation
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase">
                      Guest
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase">
                      Room
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase">
                      Check-in
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase">
                      Check-out
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-sm text-gray-500"
                      >
                        Loading reservations...
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filteredReservations.map((reservation) => {
                      const guest =
                        reservation.full_name || "Unknown Guest";

                      const room =
                        reservation.room_number || "—";

                      const type =
                        reservation.room_type || "";

                      const status =
                        reservation.status || "pending";

                      const reservationId = getReservationId(
                        reservation.id
                      );

                      return (
                        <tr
                          key={reservation.id}
                          className="border-t border-gray-100 dark:border-[#31265A]"
                        >
                          <td className="px-6 py-4 text-sm font-semibold">
                            #{reservationId}
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-sm font-medium">
                              {guest}
                            </p>

                            {reservation.email && (
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {reservation.email}
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm">
                            Room {room}

                            {type && (
                              <span className="ml-2 text-xs text-gray-500">
                                {type}
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm">
                            {formatDate(reservation.check_in)}
                          </td>

                          <td className="px-6 py-4 text-sm">
                            {formatDate(reservation.check_out)}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <button
                              onClick={() =>
                                setSelectedReservation(reservation)
                              }
                              className="rounded-lg bg-[#5B21B6] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4C1D95]"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {!loading &&
              !error &&
              filteredReservations.length === 0 && (
                <div className="p-10 text-center text-sm text-gray-500">
                  No reservations found.
                </div>
              )}
          </div>
        </div>
      </main>

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-[#18132D]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#5B21B6] dark:text-[#A78BFA]">
                  Reservation
                </p>

                <h2 className="text-xl font-bold">
                  #{getReservationId(selectedReservation.id)}
                </h2>
              </div>

              <button
                onClick={() => setSelectedReservation(null)}
                className="text-2xl text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              <div className="rounded-xl bg-[#F5F3FF] p-4 dark:bg-[#241B3D]">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Guest
                </p>

                <p className="mt-1 font-semibold">
                  {selectedReservation.full_name ||
                    "Unknown Guest"}
                </p>

                {selectedReservation.email && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {selectedReservation.email}
                  </p>
                )}

                {selectedReservation.phone && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {selectedReservation.phone}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Room
                  </p>

                  <p className="mt-1 font-semibold">
                    Room {selectedReservation.room_number || "—"}
                  </p>

                  {selectedReservation.room_type && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedReservation.room_type}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Guests
                  </p>

                  <p className="mt-1 font-semibold">
                    {selectedReservation.guests}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Check-in
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatDate(selectedReservation.check_in)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Check-out
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatDate(selectedReservation.check_out)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-purple-100 p-4 dark:border-[#31265A]">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Status
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                      selectedReservation.status
                    )}`}
                  >
                    {selectedReservation.status || "pending"}
                  </span>
                </div>

                {selectedReservation.price !== undefined && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Room Price
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#5B21B6] dark:text-[#A78BFA]">
                      ₦
                      {Number(
                        selectedReservation.price
                      ).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Reservation Created
                </p>

                <p className="mt-1 text-sm font-medium">
                  {formatDateTime(
                    selectedReservation.created_at
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedReservation(null)}
              className="mt-6 w-full rounded-xl bg-[#5B21B6] py-3 text-sm font-semibold text-white hover:bg-[#4C1D95]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}