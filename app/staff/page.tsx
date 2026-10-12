"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/component/ThemeToggle";

type Reservation = {
  id: number;
  guest_name?: string;
  guest_email?: string;
  room_id?: number;
  room_number?: string;
  room_type?: string;
  check_in?: string;
  check_out?: string;
  status?: string;
};

type Room = {
  id: number;
  room_number?: string;
  room_type?: string;
  price?: number;
  status?: string;
};

type Payment = {
  id: number;
  reservation_id?: number;
  amount?: number;
  payment_method?: string;
  status?: string;
};

type Staff = {
  id?: number;
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
};

export default function StaffDashboard() {
  // ========================================
  // STAFF INFORMATION
  // ========================================

  const [staff, setStaff] = useState<Staff | null>(null);
  const [staffName, setStaffName] = useState("Staff Member");

  // ========================================
  // DASHBOARD DATA
  // ========================================

  const [reservations, setReservations] = useState<
    Reservation[]
  >([]);

  const [rooms, setRooms] = useState<Room[]>([]);

  const [payments, setPayments] = useState<Payment[]>([]);

  const [loading, setLoading] = useState(true);

  // ========================================
  // LOAD STAFF + DASHBOARD DATA
  // ========================================

  useEffect(() => {
    // Get logged-in staff from localStorage
    const savedStaff =
      localStorage.getItem("growthLodgeStaff");

    if (savedStaff) {
      try {
        const staffData: Staff =
          JSON.parse(savedStaff);

        setStaff(staffData);

        if (staffData.full_name) {
          setStaffName(staffData.full_name);
        } else if (staffData.name) {
          setStaffName(staffData.name);
        }
      } catch (error) {
        console.error(
          "Error loading staff information:",
          error
        );
      }
    }

    // Load dashboard data
    const loadDashboardData = async () => {
      try {
        const [
          reservationsResponse,
          roomsResponse,
          paymentsResponse,
        ] = await Promise.all([
          fetch(
            "http://localhost:5000/api/reservations"
          ),
          fetch(
            "http://localhost:5000/api/rooms"
          ),
          fetch(
            "http://localhost:5000/api/payments"
          ),
        ]);

        const reservationsData =
          await reservationsResponse.json();

        const roomsData =
          await roomsResponse.json();

        const paymentsData =
          await paymentsResponse.json();

        if (reservationsData.success) {
          setReservations(
            reservationsData.reservations || []
          );
        }

        if (roomsData.success) {
          setRooms(
            roomsData.rooms || []
          );
        }

        if (paymentsData.success) {
          setPayments(
            paymentsData.payments || []
          );
        }
      } catch (error) {
        console.error(
          "Dashboard data error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // ========================================
  // TODAY'S DATE
  // ========================================

  const today = new Date()
    .toISOString()
    .split("T")[0];

  // ========================================
  // TODAY'S RESERVATIONS
  // ========================================

  const todayReservations =
    reservations.filter((reservation) => {
      if (!reservation.check_in) {
        return false;
      }

      return reservation.check_in.startsWith(
        today
      );
    });

  // ========================================
  // TODAY'S CHECK-INS
  // ========================================

  const todayCheckIns =
    reservations.filter((reservation) => {
      if (!reservation.check_in) {
        return false;
      }

      return (
        reservation.check_in.startsWith(
          today
        ) &&
        reservation.status?.toLowerCase() !==
          "cancelled"
      );
    });

  // ========================================
  // TODAY'S CHECK-OUTS
  // ========================================

  const todayCheckOuts =
    reservations.filter((reservation) => {
      if (!reservation.check_out) {
        return false;
      }

      return reservation.check_out.startsWith(
        today
      );
    });

  // ========================================
  // AVAILABLE ROOMS
  // ========================================

  const availableRooms = rooms.filter(
    (room) =>
      room.status?.toLowerCase() ===
      "available"
  );

  // ========================================
  // OCCUPIED ROOMS
  // ========================================

  const occupiedRooms = rooms.filter(
    (room) =>
      room.status?.toLowerCase() ===
      "occupied"
  );

  // ========================================
  // PENDING RESERVATIONS
  // ========================================

  const pendingReservations =
    reservations.filter(
      (reservation) =>
        reservation.status?.toLowerCase() ===
        "pending"
    );

  // ========================================
  // COMPLETED PAYMENTS
  // ========================================

  const completedPayments =
    payments.filter(
      (payment) =>
        payment.status?.toLowerCase() ===
        "completed"
    );

  // ========================================
  // TOTAL REVENUE
  // ========================================

  const totalRevenue =
    completedPayments.reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    );

  // ========================================
  // STAFF INITIALS
  // ========================================

  const initials = staffName
    .split(" ")
    .filter(Boolean)
    .map((name) =>
      name.charAt(0)
    )
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // ========================================
  // SIGN OUT
  // ========================================

  const handleSignOut = () => {
    localStorage.removeItem(
      "growthLodgeStaff"
    );

    localStorage.removeItem(
      "growthLodgeStaffId"
    );

    window.location.href =
      "/staff/signin";
  };

  // ========================================
  // LOADING SCREEN
  // ========================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F3FF] text-[#1E1B4B] dark:bg-[#0F0B1F] dark:text-white">

        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-[#5B21B6]" />

          <p className="font-medium">
            Loading Staff Dashboard...
          </p>

        </div>

      </main>
    );
  }

  // ========================================
  // DASHBOARD
  // ========================================

  return (
    <main className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B] dark:bg-[#0F0B1F] dark:text-white">

      {/* ========================================
          TOP NAVIGATION
      ======================================== */}

      <header className="fixed left-0 right-0 top-0 z-50 h-[73px] border-b border-purple-100 bg-white dark:border-[#31265A] dark:bg-[#18132D]">

        <div className="flex h-full items-center justify-between px-6">

          {/* LOGO */}

          <Link
            href="/"
            className="text-2xl font-bold text-[#5B21B6] dark:text-[#A78BFA]"
          >
            Growth Lodge
          </Link>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-5">

            <ThemeToggle />

            <div className="hidden text-right sm:block">

              <p className="text-sm font-semibold">
                {staffName}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Staff
              </p>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5B21B6] font-bold text-white">
              {initials || "S"}
            </div>

          </div>

        </div>

      </header>

      {/* ========================================
          SIDEBAR
      ======================================== */}

      <aside className="fixed bottom-0 left-0 top-[73px] hidden w-64 border-r border-purple-100 bg-white dark:border-[#31265A] dark:bg-[#18132D] lg:block">

        <div className="flex h-full flex-col p-5">

          <nav className="space-y-2">

            {/* DASHBOARD */}

            <Link
              href="/staff"
              className="flex items-center gap-3 rounded-xl bg-[#5B21B6] px-4 py-3 font-semibold text-white"
            >
              <span>📊</span>
              Dashboard
            </Link>

            {/* RESERVATIONS */}

            <Link
              href="/staff/reservations"
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-[#F5F3FF] dark:hover:bg-[#241B3D]"
            >
              <span>📅</span>
              Reservations
            </Link>

            {/* GUESTS */}

            <Link
              href="/staff/guests"
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-[#F5F3FF] dark:hover:bg-[#241B3D]"
            >
              <span>👥</span>
              Guests
            </Link>

            {/* ROOMS */}

            <Link
              href="/staff/rooms"
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-[#F5F3FF] dark:hover:bg-[#241B3D]"
            >
              <span>🛏️</span>
              Rooms
            </Link>

            {/* CHECK IN / CHECK OUT */}

            <Link
              href="/staff/checkin"
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-[#F5F3FF] dark:hover:bg-[#241B3D]"
            >
              <span>🛎️</span>
              Check-in / Check-out
            </Link>

            {/* PAYMENTS */}

            <Link
              href="/staff/payments"
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-[#F5F3FF] dark:hover:bg-[#241B3D]"
            >
              <span>💳</span>
              Payments
            </Link>

            {/* PROFILE */}

            <Link
              href="/staff/profile"
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-[#F5F3FF] dark:hover:bg-[#241B3D]"
            >
              <span>👤</span>
              My Profile
            </Link>

          </nav>

          {/* SIGN OUT */}

          <div className="mt-auto">

            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <span>🚪</span>
              Sign Out
            </button>

          </div>

        </div>

      </aside>

      {/* ========================================
          MAIN CONTENT
      ======================================== */}

      <section className="pt-[73px] lg:pl-64">

        <div className="p-6 md:p-8">

          {/* ========================================
              WELCOME
          ======================================== */}

          <div className="mb-8">

            <p className="mb-2 text-sm font-medium text-[#5B21B6] dark:text-[#A78BFA]">
              Staff Dashboard
            </p>

            <h1 className="text-3xl font-bold md:text-4xl">
              Welcome back, {staffName}
            </h1>

            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Here is what's happening at
              Growth Lodge today.
            </p>

          </div>

          {/* ========================================
              STAT CARDS
          ======================================== */}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            {/* RESERVATIONS */}

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">

              <div className="mb-5 flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-xl dark:bg-purple-950/40">
                  📅
                </div>

                <span className="text-xs font-semibold text-[#5B21B6] dark:text-[#A78BFA]">
                  Today
                </span>

              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Today's Reservations
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                {todayReservations.length}
              </h2>

            </div>

            {/* CHECK INS */}

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">

              <div className="mb-5 flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl dark:bg-blue-950/40">
                  🛎️
                </div>

                <span className="text-xs font-semibold text-blue-600">
                  Today
                </span>

              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Today's Check-ins
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                {todayCheckIns.length}
              </h2>

            </div>

            {/* CHECK OUTS */}

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">

              <div className="mb-5 flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-xl dark:bg-orange-950/40">
                  🚪
                </div>

                <span className="text-xs font-semibold text-orange-600">
                  Today
                </span>

              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Today's Check-outs
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                {todayCheckOuts.length}
              </h2>

            </div>

            {/* AVAILABLE ROOMS */}

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">

              <div className="mb-5 flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-xl dark:bg-green-950/40">
                  🛏️
                </div>

                <span className="text-xs font-semibold text-green-600">
                  Available
                </span>

              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Available Rooms
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                {availableRooms.length}
              </h2>

            </div>

          </div>

          {/* ========================================
              SECONDARY STATS
          ======================================== */}

          <div className="mt-6 grid gap-5 md:grid-cols-3">

            {/* OCCUPIED */}

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Occupied Rooms
              </p>

              <p className="mt-2 text-2xl font-bold">
                {occupiedRooms.length}
              </p>

            </div>

            {/* PENDING */}

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pending Reservations
              </p>

              <p className="mt-2 text-2xl font-bold">
                {pendingReservations.length}
              </p>

            </div>

            {/* PAYMENTS */}

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Completed Payments
              </p>

              <p className="mt-2 text-2xl font-bold">
                ₦{totalRevenue.toLocaleString()}
              </p>

            </div>

          </div>

          {/* ========================================
              TASKS + QUICK ACTIONS
          ======================================== */}

          <div className="mt-8 grid gap-6 xl:grid-cols-2">

            {/* TODAY'S TASKS */}

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">

              <div className="mb-6">

                <h2 className="text-xl font-bold">
                  Today's Tasks
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Activities that need your attention
                </p>

              </div>

              <div className="space-y-4">

                {/* CHECK IN TASK */}

                <div className="flex items-center justify-between rounded-xl bg-[#F5F3FF] p-4 dark:bg-[#241B3D]">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-[#31265A]">
                      🛎️
                    </div>

                    <div>

                      <p className="font-semibold">
                        Check-ins
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Guests arriving today
                      </p>

                    </div>

                  </div>

                  <span className="font-bold text-[#5B21B6] dark:text-[#A78BFA]">
                    {todayCheckIns.length}
                  </span>

                </div>

                {/* CHECK OUT TASK */}

                <div className="flex items-center justify-between rounded-xl bg-[#F5F3FF] p-4 dark:bg-[#241B3D]">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-[#31265A]">
                      🚪
                    </div>

                    <div>

                      <p className="font-semibold">
                        Check-outs
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Guests leaving today
                      </p>

                    </div>

                  </div>

                  <span className="font-bold text-[#5B21B6] dark:text-[#A78BFA]">
                    {todayCheckOuts.length}
                  </span>

                </div>

                {/* PENDING TASK */}

                <div className="flex items-center justify-between rounded-xl bg-[#F5F3FF] p-4 dark:bg-[#241B3D]">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-[#31265A]">
                      📅
                    </div>

                    <div>

                      <p className="font-semibold">
                        Pending Reservations
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Reservations waiting for action
                      </p>

                    </div>

                  </div>

                  <span className="font-bold text-[#5B21B6] dark:text-[#A78BFA]">
                    {pendingReservations.length}
                  </span>

                </div>

              </div>

            </div>

            {/* QUICK ACTIONS */}

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">

              <div className="mb-6">

                <h2 className="text-xl font-bold">
                  Quick Actions
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Quickly access common staff tasks
                </p>

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                {/* RESERVATIONS */}

                <Link
                  href="/staff/reservations"
                  className="rounded-xl border border-purple-100 p-5 transition hover:border-[#A78BFA] hover:bg-[#F5F3FF] dark:border-[#31265A] dark:hover:bg-[#241B3D]"
                >

                  <div className="mb-3 text-2xl">
                    📅
                  </div>

                  <h3 className="font-semibold">
                    Reservations
                  </h3>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage guest reservations
                  </p>

                </Link>

                {/* ROOMS */}

                <Link
                  href="/staff/rooms"
                  className="rounded-xl border border-purple-100 p-5 transition hover:border-[#A78BFA] hover:bg-[#F5F3FF] dark:border-[#31265A] dark:hover:bg-[#241B3D]"
                >

                  <div className="mb-3 text-2xl">
                    🛏️
                  </div>

                  <h3 className="font-semibold">
                    Manage Rooms
                  </h3>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    View room availability
                  </p>

                </Link>

                {/* CHECK IN */}

                <Link
                  href="/staff/checkin"
                  className="rounded-xl border border-purple-100 p-5 transition hover:border-[#A78BFA] hover:bg-[#F5F3FF] dark:border-[#31265A] dark:hover:bg-[#241B3D]"
                >

                  <div className="mb-3 text-2xl">
                    🛎️
                  </div>

                  <h3 className="font-semibold">
                    Check-in / Check-out
                  </h3>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage guest arrivals
                  </p>

                </Link>

                {/* PROFILE */}

                <Link
                  href="/staff/profile"
                  className="rounded-xl border border-purple-100 p-5 transition hover:border-[#A78BFA] hover:bg-[#F5F3FF] dark:border-[#31265A] dark:hover:bg-[#241B3D]"
                >

                  <div className="mb-3 text-2xl">
                    👤
                  </div>

                  <h3 className="font-semibold">
                    My Profile
                  </h3>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    View your staff profile
                  </p>

                </Link>

              </div>

            </div>

          </div>

          {/* ========================================
              RECENT RESERVATIONS
          ======================================== */}

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">

            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

              <div>

                <h2 className="text-xl font-bold">
                  Recent Reservations
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Latest guest reservations
                </p>

              </div>

              <Link
                href="/staff/reservations"
                className="font-semibold text-[#5B21B6] hover:underline dark:text-[#A78BFA]"
              >
                View All
              </Link>

            </div>

            {reservations.length === 0 ? (

              <div className="rounded-xl bg-[#F5F3FF] p-8 text-center dark:bg-[#241B3D]">

                <div className="mb-3 text-3xl">
                  📅
                </div>

                <p className="font-semibold">
                  No reservations yet
                </p>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  New reservations will appear here.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[700px]">

                  <thead>

                    <tr className="border-b border-gray-100 text-left dark:border-[#31265A]">

                      <th className="px-4 py-3 text-sm font-semibold">
                        Guest
                      </th>

                      <th className="px-4 py-3 text-sm font-semibold">
                        Room
                      </th>

                      <th className="px-4 py-3 text-sm font-semibold">
                        Check-in
                      </th>

                      <th className="px-4 py-3 text-sm font-semibold">
                        Check-out
                      </th>

                      <th className="px-4 py-3 text-sm font-semibold">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {reservations
                      .slice(0, 5)
                      .map((reservation) => (

                        <tr
                          key={reservation.id}
                          className="border-b border-gray-50 last:border-0 dark:border-[#31265A]"
                        >

                          <td className="px-4 py-4">

                            <p className="font-semibold">
                              {reservation.guest_name ||
                                "Guest"}
                            </p>

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {reservation.guest_email ||
                                "No email"}
                            </p>

                          </td>

                          <td className="px-4 py-4 text-sm">
                            {reservation.room_number ||
                              reservation.room_type ||
                              reservation.room_id ||
                              "-"}
                          </td>

                          <td className="px-4 py-4 text-sm">
                            {reservation.check_in
                              ? new Date(
                                  reservation.check_in
                                ).toLocaleDateString()
                              : "-"}
                          </td>

                          <td className="px-4 py-4 text-sm">
                            {reservation.check_out
                              ? new Date(
                                  reservation.check_out
                                ).toLocaleDateString()
                              : "-"}
                          </td>

                          <td className="px-4 py-4">

                            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-[#5B21B6] dark:bg-purple-950/40 dark:text-[#A78BFA]">
                              {reservation.status ||
                                "Pending"}
                            </span>

                          </td>

                        </tr>

                      ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      </section>

    </main>
  );
}