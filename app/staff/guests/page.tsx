"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/component/ThemeToggle";

type Guest = {
  id: string;
  userId: number;
  name: string;
  email: string;
  phone: string;
  room: string;
  roomType: string;
  status: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

export default function StaffGuests() {
  const [search, setSearch] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGuest, setSelectedGuest] =
    useState<Guest | null>(null);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        setLoading(true);
        setError("");

        const [usersResponse, reservationsResponse] =
          await Promise.all([
            fetch("http://localhost:5000/api/auth/users"),
            fetch("http://localhost:5000/api/reservations"),
          ]);

        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users");
        }

        const usersData = await usersResponse.json();

        let reservationsData: any[] = [];

        if (reservationsResponse.ok) {
          const reservationResult =
            await reservationsResponse.json();

          reservationsData = Array.isArray(reservationResult)
            ? reservationResult
            : reservationResult.reservations || [];
        }

        const users = Array.isArray(usersData)
          ? usersData
          : usersData.users || [];

        const customerUsers = users.filter(
          (user: any) =>
            String(user.role || "").toLowerCase() ===
            "customer"
        );

        const formattedGuests: Guest[] =
          customerUsers.map((user: any) => {
            const userReservations =
              reservationsData.filter(
                (reservation: any) =>
                  String(reservation.user_id) ===
                  String(user.id)
              );

            const matchingReservation =
              userReservations.length > 0
                ? [...userReservations].sort(
                    (a: any, b: any) =>
                      Number(b.id) - Number(a.id)
                  )[0]
                : null;

            let status = "Checked Out";

            if (matchingReservation) {
              const reservationStatus = String(
                matchingReservation.status || ""
              ).toLowerCase();

              if (
                reservationStatus === "checked in" ||
                reservationStatus === "check-in" ||
                reservationStatus === "checkin"
              ) {
                status = "Checked In";
              } else if (
                reservationStatus === "reserved" ||
                reservationStatus === "pending" ||
                reservationStatus === "confirmed"
              ) {
                status = "Reserved";
              } else if (
                reservationStatus === "checked out" ||
                reservationStatus === "check-out" ||
                reservationStatus === "checkout" ||
                reservationStatus === "completed"
              ) {
                status = "Checked Out";
              }
            }

            return {
              id: `G${String(user.id).padStart(3, "0")}`,
              userId: Number(user.id),
              name:
                user.full_name ||
                user.name ||
                "Guest",
              email: user.email || "-",
              phone: user.phone || "-",
              room: String(
                matchingReservation?.room_number || "-"
              ),
              roomType:
                matchingReservation?.room_type || "-",
              status,
              checkIn:
                matchingReservation?.check_in || "",
              checkOut:
                matchingReservation?.check_out || "",
              guests: Number(
                matchingReservation?.guests || 1
              ),
            };
          });

        setGuests(formattedGuests);
      } catch (err) {
        console.error("Guests fetch error:", err);

        setError(
          "Unable to load guests from the server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();
  }, []);

  const filteredGuests = guests.filter((guest) =>
    `${guest.name} ${guest.email} ${guest.phone} ${guest.room} ${guest.id}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalGuests = guests.length;

  const checkedInGuests = guests.filter(
    (guest) => guest.status === "Checked In"
  ).length;

  const todayString =
    new Date().toISOString().split("T")[0];

  const todaysArrivals = guests.filter(
    (guest) =>
      guest.checkIn === todayString &&
      guest.status !== "Checked Out"
  ).length;

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
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
            className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D]"
          >
            📊 Dashboard
          </Link>

          <Link
            href="/staff/reservations"
            className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D]"
          >
            📅 Reservations
          </Link>

          <Link
            href="/staff/guests"
            className="mb-1 flex items-center gap-3 rounded-xl bg-purple-50 px-4 py-3 text-sm font-medium text-[#5B21B6] dark:bg-[#241B3D]"
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
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold md:text-3xl">
              Guests
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View and manage hotel guests.
            </p>
          </div>

          {/* Summary */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Guests
              </p>

              <p className="mt-2 text-2xl font-bold">
                {loading ? "..." : totalGuests}
              </p>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Currently Checked In
              </p>

              <p className="mt-2 text-2xl font-bold">
                {loading ? "..." : checkedInGuests}
              </p>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Today's Arrivals
              </p>

              <p className="mt-2 text-2xl font-bold">
                {loading ? "..." : todaysArrivals}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
            <input
              type="text"
              placeholder="Search guest by name, email, phone or room..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm outline-none focus:border-[#5B21B6] dark:border-[#31265A] dark:bg-[#0F0B1F]"
            />
          </div>

          {/* Guests Table */}
          <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-purple-50 dark:bg-[#241B3D]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase">
                      Guest
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase">
                      Room
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
                        colSpan={5}
                        className="px-6 py-10 text-center text-sm text-gray-500"
                      >
                        Loading guests...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-sm text-red-500"
                      >
                        {error}
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((guest) => (
                      <tr
                        key={guest.id}
                        className="border-t border-gray-100 dark:border-[#31265A]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 font-bold text-[#5B21B6] dark:bg-[#241B3D] dark:text-[#A78BFA]">
                              {getInitials(
                                guest.name
                              )}
                            </div>

                            <div>
                              <p className="text-sm font-semibold">
                                {guest.name}
                              </p>

                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {guest.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm">
                            {guest.email}
                          </p>

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {guest.phone}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm">
                          {guest.room === "-"
                            ? "-"
                            : `Room ${guest.room}`}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              guest.status ===
                              "Checked In"
                                ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                : guest.status ===
                                    "Reserved"
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {guest.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              setSelectedGuest(
                                guest
                              )
                            }
                            className="rounded-lg bg-[#5B21B6] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4C1D95]"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading &&
              !error &&
              filteredGuests.length === 0 && (
                <div className="p-10 text-center text-sm text-gray-500">
                  No guests found.
                </div>
              )}
          </div>
        </div>
      </main>

      {/* Guest Details Modal */}
      {selectedGuest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedGuest(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#18132D]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  Guest Details
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedGuest.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedGuest(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#241B3D] dark:text-gray-300 dark:hover:bg-[#31265A]"
              >
                ✕
              </button>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-lg font-bold text-[#5B21B6] dark:bg-[#241B3D] dark:text-[#A78BFA]">
                {getInitials(
                  selectedGuest.name
                )}
              </div>

              <div>
                <h4 className="text-lg font-bold">
                  {selectedGuest.name}
                </h4>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Customer
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-purple-50 p-4 dark:bg-[#241B3D]">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Email
                </p>

                <p className="mt-1 break-all text-sm font-semibold">
                  {selectedGuest.email}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-4 dark:bg-[#241B3D]">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Phone
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {selectedGuest.phone}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-4 dark:bg-[#241B3D]">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Room
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {selectedGuest.room === "-"
                    ? "-"
                    : `Room ${selectedGuest.room}`}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-4 dark:bg-[#241B3D]">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Room Type
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {selectedGuest.roomType}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-4 dark:bg-[#241B3D]">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Check-in
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {formatDate(
                    selectedGuest.checkIn
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-4 dark:bg-[#241B3D]">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Check-out
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {formatDate(
                    selectedGuest.checkOut
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-4 dark:bg-[#241B3D]">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Number of Guests
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {selectedGuest.guests}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-4 dark:bg-[#241B3D]">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Status
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {selectedGuest.status}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedGuest(null)}
              className="mt-6 w-full rounded-xl bg-[#5B21B6] px-4 py-3 text-sm font-semibold text-white hover:bg-[#4C1D95]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}