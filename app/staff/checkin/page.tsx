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
  full_name: string;
  email: string;
  phone: string;
  room_number: string;
  room_type: string;
  price: string;
};

export default function StaffCheckIn() {
  const [search, setSearch] = useState("");
  const [reservations, setReservations] = useState<
    Reservation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(
    null
  );

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/reservations"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reservations");
      }

      const data = await response.json();

      const reservationData = Array.isArray(data)
        ? data
        : data.reservations || [];

      setReservations(reservationData);
    } catch (err) {
      console.error(
        "Check-in reservations fetch error:",
        err
      );

      setError(
        "Unable to load reservations from the server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const formatDate = (date: string) => {
    if (!date) return "-";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDisplayStatus = (reservation: Reservation) => {
    const status = String(
      reservation.status || ""
    ).toLowerCase();

    if (
      status === "checked in" ||
      status === "checkin" ||
      status === "check-in"
    ) {
      return "Checked In";
    }

    if (
      status === "checked out" ||
      status === "checkout" ||
      status === "check-out" ||
      status === "completed"
    ) {
      return "Checked Out";
    }

    if (
      status === "confirmed" ||
      status === "reserved"
    ) {
      return "Ready for Check-in";
    }

    if (status === "pending") {
      return "Ready for Check-in";
    }

    return reservation.status || "Pending";
  };

  const handleAction = async (
    reservation: Reservation,
    action: "checkin" | "checkout"
  ) => {
    const newStatus =
      action === "checkin"
        ? "checked in"
        : "checked out";

    try {
      setUpdatingId(reservation.id);

      const response = await fetch(
        `http://localhost:5000/api/reservations/${reservation.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update reservation"
        );
      }

      await fetchReservations();
    } catch (err) {
      console.error(
        "Reservation status update error:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Unable to update reservation."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReservations = reservations.filter(
    (reservation) => {
      const displayStatus =
        getDisplayStatus(reservation);

      return `${reservation.id} ${
        reservation.full_name
      } ${reservation.email} ${
        reservation.phone
      } ${reservation.room_number} ${
        reservation.room_type
      } ${displayStatus}`
        .toLowerCase()
        .includes(search.toLowerCase());
    }
  );

  const readyCheckIns = reservations.filter(
    (reservation) =>
      getDisplayStatus(reservation) ===
      "Ready for Check-in"
  ).length;

  const checkedIn = reservations.filter(
    (reservation) =>
      getDisplayStatus(reservation) === "Checked In"
  ).length;

  const readyCheckOuts = reservations.filter(
    (reservation) => {
      const status =
        getDisplayStatus(reservation);

      return status === "Checked In";
    }
  ).length;

  const checkedOut = reservations.filter(
    (reservation) =>
      getDisplayStatus(reservation) === "Checked Out"
  ).length;

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
              <h1 className="text-lg font-bold text-[#5B21B6]">
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
              <p className="text-sm font-semibold">
                Staff Member
              </p>

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
            className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D]"
          >
            <span>📊</span>
            Dashboard
          </Link>

          <Link
            href="/staff/reservations"
            className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D]"
          >
            <span>📅</span>
            Reservations
          </Link>

          <Link
            href="/staff/guests"
            className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D]"
          >
            <span>👥</span>
            Guests
          </Link>

          <Link
            href="/staff/rooms"
            className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D]"
          >
            <span>🛏️</span>
            Rooms
          </Link>

          <Link
            href="/staff/checkin"
            className="mb-1 flex items-center gap-3 rounded-xl bg-purple-50 px-4 py-3 text-sm font-medium text-[#5B21B6] dark:bg-[#241B3D]"
          >
            <span>🔑</span>
            Check-in / Check-out
          </Link>

          <Link
            href="/staff/payments"
            className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D]"
          >
            <span>💳</span>
            Payments
          </Link>

          <Link
            href="/staff/profile"
            className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D]"
          >
            <span>👤</span>
            My Profile
          </Link>

          <div className="my-4 border-t border-gray-100 dark:border-[#31265A]" />

          <Link
            href="/signin"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <span>🚪</span>
            Sign Out
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="pt-16 md:ml-64">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold md:text-3xl">
              Check-in / Check-out
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage guest arrivals and departures.
            </p>
          </div>

          {/* Statistics */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ready for Check-in
              </p>

              <p className="mt-2 text-2xl font-bold">
                {loading ? "..." : readyCheckIns}
              </p>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Checked In
              </p>

              <p className="mt-2 text-2xl font-bold">
                {loading ? "..." : checkedIn}
              </p>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ready for Check-out
              </p>

              <p className="mt-2 text-2xl font-bold">
                {loading ? "..." : readyCheckOuts}
              </p>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Checked Out
              </p>

              <p className="mt-2 text-2xl font-bold">
                {loading ? "..." : checkedOut}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
            <input
              type="text"
              placeholder="Search guest, reservation or room..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm outline-none focus:border-[#5B21B6] dark:border-[#31265A] dark:bg-[#0F0B1F]"
            />
          </div>

          {/* Reservations */}
          <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
            <div className="border-b border-gray-100 p-6 dark:border-[#31265A]">
              <h3 className="text-lg font-bold">
                Guest Check-in / Check-out
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Process guest arrivals and departures.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
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
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-sm text-gray-500"
                      >
                        Loading reservations...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-sm text-red-500"
                      >
                        {error}
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map(
                      (reservation) => {
                        const displayStatus =
                          getDisplayStatus(
                            reservation
                          );

                        return (
                          <tr
                            key={reservation.id}
                            className="border-t border-gray-100 dark:border-[#31265A]"
                          >
                            <td className="px-6 py-4 text-sm font-semibold">
                              #GL
                              {String(
                                reservation.id
                              ).padStart(4, "0")}
                            </td>

                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold">
                                {reservation.full_name ||
                                  "Guest"}
                              </p>

                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {reservation.email ||
                                  "-"}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-sm">
                              Room{" "}
                              {reservation.room_number ||
                                "-"}
                              <span className="ml-2 text-xs text-gray-500">
                                {reservation.room_type ||
                                  "-"}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-sm">
                              {formatDate(
                                reservation.check_in
                              )}
                            </td>

                            <td className="px-6 py-4 text-sm">
                              {formatDate(
                                reservation.check_out
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  displayStatus ===
                                  "Checked In"
                                    ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                    : displayStatus ===
                                        "Checked Out"
                                      ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                      : "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                                }`}
                              >
                                {displayStatus}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              {displayStatus ===
                                "Ready for Check-in" && (
                                <button
                                  disabled={
                                    updatingId ===
                                    reservation.id
                                  }
                                  onClick={() =>
                                    handleAction(
                                      reservation,
                                      "checkin"
                                    )
                                  }
                                  className="rounded-lg bg-[#5B21B6] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#4C1D95] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {updatingId ===
                                  reservation.id
                                    ? "Updating..."
                                    : "Check In"}
                                </button>
                              )}

                              {displayStatus ===
                                "Checked In" && (
                                <button
                                  disabled={
                                    updatingId ===
                                    reservation.id
                                  }
                                  onClick={() =>
                                    handleAction(
                                      reservation,
                                      "checkout"
                                    )
                                  }
                                  className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {updatingId ===
                                  reservation.id
                                    ? "Updating..."
                                    : "Check Out"}
                                </button>
                              )}

                              {displayStatus ===
                                "Checked Out" && (
                                <span className="text-xs font-medium text-gray-400">
                                  Completed
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
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

          {/* Important Notice */}
          <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50 p-5 dark:border-[#4B3B78] dark:bg-[#241B3D]">
            <div className="flex gap-3">
              <span className="text-xl">ℹ️</span>

              <div>
                <h3 className="font-semibold">
                  Staff reminder
                </h3>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Always verify the guest reservation and
                  room information before completing a
                  check-in or check-out.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}