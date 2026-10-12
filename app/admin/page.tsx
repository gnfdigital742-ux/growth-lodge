"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/component/ThemeToggle";

type Room = {
  id: number;
  room_number: string;
  room_type: string;
  price: string | number;
  status: string;
  description?: string;
  created_at?: string;
};

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
  price?: string | number;
};

type User = {
  id: number;
  hotel_id?: number;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  created_at?: string;
};

type Payment = {
  id: number;
  reservation_id: number;
  amount: string | number;
  payment_method: string;
  status: string;
  created_at: string;
};

export default function AdminDashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getHotelId = (): string | null => {
    if (typeof window === "undefined") {
      return null;
    }

    const directHotelId =
      localStorage.getItem("hotel_id") ||
      localStorage.getItem("hotelId") ||
      localStorage.getItem("growth_lodge_hotel_id");

    if (directHotelId) {
      return directHotelId;
    }

    const possibleUserKeys = [
      "user",
      "currentUser",
      "authUser",
      "growth_lodge_user",
    ];

    for (const key of possibleUserKeys) {
      const storedUser = localStorage.getItem(key);

      if (!storedUser) {
        continue;
      }

      try {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser?.hotel_id) {
          return String(parsedUser.hotel_id);
        }

        if (parsedUser?.hotelId) {
          return String(parsedUser.hotelId);
        }

        if (parsedUser?.user?.hotel_id) {
          return String(parsedUser.user.hotel_id);
        }

        if (parsedUser?.user?.hotelId) {
          return String(parsedUser.user.hotelId);
        }
      } catch {
        continue;
      }
    }

    return null;
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const hotelId = getHotelId();

      if (!hotelId) {
        throw new Error(
          "Hotel workspace not found. Please sign in again."
        );
      }

      const headers = {
        "Content-Type": "application/json",
        "x-hotel-id": hotelId,
      };

      const [roomsResponse, reservationsResponse, usersResponse, paymentsResponse] =
        await Promise.all([
          fetch("http://localhost:5000/api/rooms", {
            method: "GET",
            headers,
            credentials: "include",
          }),

          fetch("http://localhost:5000/api/reservations", {
            method: "GET",
            headers,
            credentials: "include",
          }),

          fetch("http://localhost:5000/api/auth/users", {
            method: "GET",
            headers,
            credentials: "include",
          }),

          fetch("http://localhost:5000/api/payments", {
            method: "GET",
            headers,
            credentials: "include",
          }),
        ]);

      const roomsData = await roomsResponse.json();
      const reservationsData = await reservationsResponse.json();
      const usersData = await usersResponse.json();
      const paymentsData = await paymentsResponse.json();

      if (!roomsResponse.ok || !roomsData.success) {
        throw new Error(
          roomsData.message || "Unable to load rooms."
        );
      }

      if (!reservationsResponse.ok || !reservationsData.success) {
        throw new Error(
          reservationsData.message || "Unable to load reservations."
        );
      }

      if (!usersResponse.ok || !usersData.success) {
        throw new Error(
          usersData.message || "Unable to load users."
        );
      }

      if (!paymentsResponse.ok || !paymentsData.success) {
        throw new Error(
          paymentsData.message || "Unable to load payments."
        );
      }

      setRooms(roomsData.rooms || []);
      setReservations(reservationsData.reservations || []);
      setUsers(usersData.users || []);
      setPayments(paymentsData.payments || []);
    } catch (err) {
      console.error("Admin dashboard error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the Growth Lodge server."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DASHBOARD CALCULATIONS
  ========================= */

  const totalRooms = rooms.length;

  const availableRooms = rooms.filter(
    (room) => room.status?.toLowerCase() === "available"
  ).length;

  const occupiedRooms = rooms.filter((room) => {
    const status = room.status?.toLowerCase();

    return (
      status === "occupied" ||
      status === "checked in" ||
      status === "checked_in"
    );
  }).length;

  const maintenanceRooms = rooms.filter((room) => {
    const status = room.status?.toLowerCase();

    return (
      status === "maintenance" ||
      status === "under maintenance"
    );
  }).length;

  const totalGuests = users.filter(
    (user) => user.role?.toLowerCase() === "customer"
  ).length;

  const totalReservations = reservations.length;

  const totalRevenue = payments
    .filter(
      (payment) => payment.status?.toLowerCase() === "paid"
    )
    .reduce((total, payment) => {
      return total + Number(payment.amount || 0);
    }, 0);

  const recentReservations = [...reservations]
    .sort((a, b) => {
      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    })
    .slice(0, 3);

  const roomStatusTotal =
    availableRooms + occupiedRooms + maintenanceRooms;

  const availablePercentage =
    roomStatusTotal > 0
      ? Math.round((availableRooms / roomStatusTotal) * 100)
      : 0;

  const occupiedPercentage =
    roomStatusTotal > 0
      ? Math.round((occupiedRooms / roomStatusTotal) * 100)
      : 0;

  const maintenancePercentage =
    roomStatusTotal > 0
      ? Math.round((maintenanceRooms / roomStatusTotal) * 100)
      : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getReservationStatus = (status: string) => {
    const normalizedStatus = status?.toLowerCase();

    if (
      normalizedStatus === "confirmed" ||
      normalizedStatus === "reserved" ||
      normalizedStatus === "checked in"
    ) {
      return {
        label:
          normalizedStatus === "checked in"
            ? "Checked In"
            : "Confirmed",
        className:
          "bg-green-100 text-green-700",
      };
    }

    if (normalizedStatus === "pending") {
      return {
        label: "Pending",
        className:
          "bg-yellow-100 text-yellow-700",
      };
    }

    if (
      normalizedStatus === "cancelled" ||
      normalizedStatus === "canceled"
    ) {
      return {
        label: "Cancelled",
        className:
          "bg-red-100 text-red-700",
      };
    }

    if (
      normalizedStatus === "checked out" ||
      normalizedStatus === "completed"
    ) {
      return {
        label: "Completed",
        className:
          "bg-blue-100 text-blue-700",
      };
    }

    return {
      label: status || "Unknown",
      className:
        "bg-gray-100 text-gray-700",
    };
  };

  return (
    <main className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B] dark:bg-[#0F0B1F] dark:text-white">

      {/* TOP BAR */}
      <header className="border-b border-purple-100 bg-white dark:border-[#31265A] dark:bg-[#18132D]">
        <div className="flex items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-2xl font-bold text-[#5B21B6] dark:text-[#A78BFA]">
              Growth Lodge
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Hotel Management System
            </p>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <div className="hidden text-right sm:block">
              <p className="font-semibold">
                Administrator
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Admin
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#5B21B6] font-bold text-white">
              A
            </div>
          </div>

        </div>
      </header>

      {/* PAGE */}
      <div className="flex">

        {/* SIDEBAR */}
        <aside className="hidden min-h-[calc(100vh-81px)] w-64 border-r border-purple-100 bg-white p-5 dark:border-[#31265A] dark:bg-[#18132D] md:block">

          <nav className="space-y-2">

            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl bg-[#5B21B6] px-4 py-3 font-semibold text-white"
            >
              <span>📊</span>
              Dashboard
            </Link>

            <Link
              href="/admin/rooms"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>🛏️</span>
              Rooms
            </Link>

            <Link
              href="/admin/reservations"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>📅</span>
              Reservations
            </Link>

            <Link
              href="/admin/guests"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>👥</span>
              Guests
            </Link>

            <Link
              href="/admin/staff"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>👨‍💼</span>
              Staff
            </Link>

            <Link
              href="/admin/payments"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>💳</span>
              Payments
            </Link>

            <Link
              href="/admin/reports"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>📈</span>
              Reports
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>⚙️</span>
              Settings
            </Link>

          </nav>

          {/* LOGOUT */}
          <div className="mt-10 border-t border-purple-100 pt-5 dark:border-[#31265A]">
            <Link
              href="/signin"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <span>🚪</span>
              Sign Out
            </Link>
          </div>

        </aside>

        {/* MAIN CONTENT */}
        <section className="w-full p-6 md:p-8">

          {/* WELCOME */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold">
              Dashboard
            </h2>

            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Welcome back, Administrator. Here's what's happening with your
              hotel today.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
              {error}
            </div>
          )}

          {/* LOADING */}
          {loading ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-[#18132D]">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-[#5B21B6]" />

              <p className="font-medium text-gray-600 dark:text-gray-300">
                Loading dashboard data...
              </p>
            </div>
          ) : (
            <>
              {/* STATISTICS */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {/* ROOMS */}
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total Rooms
                      </p>

                      <h3 className="mt-2 text-3xl font-bold">
                        {totalRooms}
                      </h3>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl dark:bg-[#31265A]">
                      🛏️
                    </div>
                  </div>
                </div>

                {/* AVAILABLE */}
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Available Rooms
                      </p>

                      <h3 className="mt-2 text-3xl font-bold">
                        {availableRooms}
                      </h3>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                      ✓
                    </div>
                  </div>
                </div>

                {/* OCCUPIED */}
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Occupied Rooms
                      </p>

                      <h3 className="mt-2 text-3xl font-bold">
                        {occupiedRooms}
                      </h3>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                      🔑
                    </div>
                  </div>
                </div>

                {/* GUESTS */}
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total Guests
                      </p>

                      <h3 className="mt-2 text-3xl font-bold">
                        {totalGuests}
                      </h3>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                      👥
                    </div>
                  </div>
                </div>

                {/* RESERVATIONS */}
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Reservations
                      </p>

                      <h3 className="mt-2 text-3xl font-bold">
                        {totalReservations}
                      </h3>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
                      📅
                    </div>
                  </div>
                </div>

                {/* REVENUE */}
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total Revenue
                      </p>

                      <h3 className="mt-2 text-2xl font-bold">
                        {formatCurrency(totalRevenue)}
                      </h3>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-2xl">
                      💰
                    </div>
                  </div>
                </div>

              </div>

              {/* LOWER SECTION */}
              <div className="mt-8 grid gap-6 lg:grid-cols-2">

                {/* RECENT RESERVATIONS */}
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">

                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-xl font-bold">
                      Recent Reservations
                    </h3>

                    <Link
                      href="/admin/reservations"
                      className="text-sm font-semibold text-[#5B21B6] hover:underline dark:text-[#A78BFA]"
                    >
                      View All
                    </Link>
                  </div>

                  {recentReservations.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      No reservations found.
                    </div>
                  ) : (
                    <div className="space-y-4">

                      {recentReservations.map((reservation, index) => {
                        const status =
                          getReservationStatus(
                            reservation.status
                          );

                        return (
                          <div
                            key={reservation.id}
                            className={`flex items-center justify-between ${
                              index !== recentReservations.length - 1
                                ? "border-b border-gray-100 pb-4 dark:border-[#31265A]"
                                : ""
                            }`}
                          >
                            <div>
                              <p className="font-semibold">
                                {reservation.full_name ||
                                  "Guest"}
                              </p>

                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Room{" "}
                                {reservation.room_number ||
                                  reservation.room_id}
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </div>
                        );
                      })}

                    </div>
                  )}

                </div>

                {/* ROOM STATUS */}
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">

                  <h3 className="mb-5 text-xl font-bold">
                    Room Status
                  </h3>

                  <div className="space-y-5">

                    {/* AVAILABLE */}
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>Available</span>

                        <span className="font-semibold">
                          {availableRooms} rooms
                        </span>
                      </div>

                      <div className="h-3 rounded-full bg-gray-100 dark:bg-[#31265A]">
                        <div
                          className="h-3 rounded-full bg-green-500"
                          style={{
                            width: `${availablePercentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* OCCUPIED */}
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>Occupied</span>

                        <span className="font-semibold">
                          {occupiedRooms} rooms
                        </span>
                      </div>

                      <div className="h-3 rounded-full bg-gray-100 dark:bg-[#31265A]">
                        <div
                          className="h-3 rounded-full bg-[#5B21B6]"
                          style={{
                            width: `${occupiedPercentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* MAINTENANCE */}
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>Maintenance</span>

                        <span className="font-semibold">
                          {maintenanceRooms} rooms
                        </span>
                      </div>

                      <div className="h-3 rounded-full bg-gray-100 dark:bg-[#31265A]">
                        <div
                          className="h-3 rounded-full bg-orange-500"
                          style={{
                            width: `${maintenancePercentage}%`,
                          }}
                        />
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            </>
          )}

        </section>
      </div>
    </main>
  );
}