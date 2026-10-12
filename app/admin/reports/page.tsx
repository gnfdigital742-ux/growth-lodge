"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/component/ThemeToggle";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Payment = {
  id: number;
  reservation_id: number;
  amount: number | string;
  payment_method: string;
  status: string;
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
  created_at?: string;
};

type User = {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  role: string;
  created_at?: string;
};

type Room = {
  id: number;
  room_number: string;
  room_type: string;
  price: number | string;
  status: string;
};

type ReportResult<T> = {
  items: T[];
  error: string;
};

function getHotelId(): string {
  if (typeof window === "undefined") return "";

  const keys = [
    "hotel_id",
    "hotelId",
    "growth_lodge_hotel_id",
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key);

    if (value && value !== "null" && value !== "undefined") {
      return value;
    }
  }

  const userKeys = [
    "user",
    "currentUser",
    "loggedInUser",
    "authUser",
    "adminUser",
  ];

  for (const key of userKeys) {
    const stored = localStorage.getItem(key);

    if (!stored) continue;

    try {
      const user = JSON.parse(stored);

      const hotelId =
        user?.hotel_id ??
        user?.hotelId ??
        user?.hotel?.id;

      if (
        hotelId !== undefined &&
        hotelId !== null &&
        String(hotelId).trim() !== ""
      ) {
        return String(hotelId);
      }
    } catch {
      // Ignore invalid local storage data.
    }
  }

  return "";
}

function getRequestHeaders(): HeadersInit {
  const hotelId = getHotelId();

  return hotelId
    ? { "x-hotel-id": hotelId }
    : {};
}

async function fetchReport<T>(
  endpoint: string,
  collectionKey: string
): Promise<ReportResult<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: getRequestHeaders(),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        items: [],
        error:
          data?.message ||
          data?.error ||
          `Unable to load ${collectionKey}.`,
      };
    }

    if (data?.success === false) {
      return {
        items: [],
        error:
          data.message ||
          `Unable to load ${collectionKey}.`,
      };
    }

    let items: unknown;

    if (Array.isArray(data)) {
      items = data;
    } else if (Array.isArray(data?.[collectionKey])) {
      items = data[collectionKey];
    } else if (Array.isArray(data?.data)) {
      items = data.data;
    } else {
      items = [];
    }

    return {
      items: items as T[],
      error: "",
    };
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);

    return {
      items: [],
      error: `Cannot connect to the backend for ${collectionKey}.`,
    };
  }
}

export default function ReportsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("Last 6 Months");

  const loadReportsData = useCallback(async () => {
    setLoading(true);
    setError("");

    const [paymentsResult, reservationsResult, usersResult, roomsResult] =
      await Promise.all([
        fetchReport<Payment>("/api/payments", "payments"),
        fetchReport<Reservation>("/api/reservations", "reservations"),
        fetchReport<User>("/api/auth/users", "users"),
        fetchReport<Room>("/api/rooms", "rooms"),
      ]);

    setPayments(paymentsResult.items);
    setReservations(reservationsResult.items);
    setUsers(usersResult.items);
    setRooms(roomsResult.items);

    const errors = [
      paymentsResult.error,
      reservationsResult.error,
      usersResult.error,
      roomsResult.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      setError(errors.join(" "));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadReportsData();
  }, [loadReportsData]);

  const customers = useMemo(
    () =>
      users.filter(
        (user) => user.role?.toLowerCase() === "customer"
      ),
    [users]
  );

  const paidPayments = useMemo(
    () =>
      payments.filter(
        (payment) => payment.status?.toLowerCase() === "paid"
      ),
    [payments]
  );

  const totalRevenue = paidPayments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  );

  const pendingPayments = payments.filter(
    (payment) => payment.status?.toLowerCase() === "pending"
  ).length;

  const refundedPayments = payments.filter(
    (payment) => payment.status?.toLowerCase() === "refunded"
  ).length;

  const totalRooms = rooms.length;

  const occupiedRooms = rooms.filter((room) => {
    const status = room.status?.toLowerCase().replace(/_/g, " ");

    return status === "occupied" || status === "checked in";
  }).length;

  const availableRooms = rooms.filter(
    (room) => room.status?.toLowerCase() === "available"
  ).length;

  const maintenanceRooms = rooms.filter((room) => {
    const status = room.status?.toLowerCase().replace(/_/g, " ");

    return (
      status === "maintenance" ||
      status === "under maintenance"
    );
  }).length;

  const occupancyRate =
    totalRooms > 0
      ? Math.round((occupiedRooms / totalRooms) * 100)
      : 0;

  const confirmedReservations = reservations.filter(
    (reservation) =>
      reservation.status?.toLowerCase() === "confirmed"
  ).length;

  const pendingReservations = reservations.filter(
    (reservation) =>
      reservation.status?.toLowerCase() === "pending"
  ).length;

  const checkedInReservations = reservations.filter((reservation) => {
    const status = reservation.status?.toLowerCase().replace(/_/g, " ");
    return status === "checked in";
  }).length;

  const completedReservations = reservations.filter((reservation) => {
    const status = reservation.status?.toLowerCase().replace(/_/g, " ");

    return status === "checked out" || status === "completed";
  }).length;

  const monthlyRevenue = useMemo(() => {
    const now = new Date();

    let monthCount = 6;

    if (period === "Last 30 Days") {
      monthCount = 1;
    } else if (period === "Last 12 Months") {
      monthCount = 12;
    } else if (period === "This Year") {
      monthCount = now.getMonth() + 1;
    }

    const result: { month: string; revenue: number }[] = [];

    for (let i = monthCount - 1; i >= 0; i--) {
      const date =
        period === "Last 30 Days"
          ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29)
          : new Date(
              now.getFullYear(),
              now.getMonth() - i,
              1
            );

      const endDate =
        period === "Last 30 Days"
          ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          : new Date(date.getFullYear(), date.getMonth() + 1, 1);

      const revenue = paidPayments
        .filter((payment) => {
          if (!payment.created_at) return false;

          const paymentDate = new Date(payment.created_at);

          return (
            !Number.isNaN(paymentDate.getTime()) &&
            paymentDate >= date &&
            paymentDate < endDate
          );
        })
        .reduce(
          (total, payment) => total + Number(payment.amount || 0),
          0
        );

      result.push({
        month:
          period === "Last 30 Days"
            ? "Last 30 days"
            : date.toLocaleDateString("en", {
                month: "short",
                year:
                  period === "Last 12 Months" ||
                  period === "This Year"
                    ? "2-digit"
                    : undefined,
              }),
        revenue,
      });
    }

    return result;
  }, [paidPayments, period]);

  const maxRevenue = Math.max(
    ...monthlyRevenue.map((item) => item.revenue),
    1
  );

  const recentPayments = useMemo(
    () =>
      [...payments]
        .sort((a, b) => {
          const dateA = a.created_at
            ? new Date(a.created_at).getTime()
            : 0;

          const dateB = b.created_at
            ? new Date(b.created_at).getTime()
            : 0;

          return dateB - dateA;
        })
        .slice(0, 5),
    [payments]
  );

  const roomTypeData = useMemo(() => {
    const grouped: Record<
      string,
      {
        total: number;
        occupied: number;
        available: number;
        maintenance: number;
      }
    > = {};

    rooms.forEach((room) => {
      const type = room.room_type || "Other";
      const status = room.status?.toLowerCase().replace(/_/g, " ");

      if (!grouped[type]) {
        grouped[type] = {
          total: 0,
          occupied: 0,
          available: 0,
          maintenance: 0,
        };
      }

      grouped[type].total += 1;

      if (status === "occupied" || status === "checked in") {
        grouped[type].occupied += 1;
      }

      if (status === "available") {
        grouped[type].available += 1;
      }

      if (
        status === "maintenance" ||
        status === "under maintenance"
      ) {
        grouped[type].maintenance += 1;
      }
    });

    return Object.entries(grouped).map(([type, values]) => ({
      type,
      ...values,
    }));
  }, [rooms]);

  const formatCurrency = (amount: number | string) =>
    `₦${Number(amount || 0).toLocaleString("en-NG", {
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date?: string) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? "—"
      : parsedDate.toLocaleDateString();
  };

  const getStatusClasses = (status: string) => {
    const normalized = status?.toLowerCase();

    if (normalized === "paid") {
      return "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400";
    }

    if (normalized === "pending") {
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400";
    }

    if (normalized === "refunded") {
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400";
    }

    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  const cardClass =
    "rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]";

  const navClass =
    "mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D]";

  return (
    <div className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B] dark:bg-[#0F0B1F] dark:text-white">
      <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-purple-100 bg-white dark:border-[#31265A] dark:bg-[#18132D]">
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5B21B6] text-lg font-bold text-white">
              G
            </div>

            <div>
              <h1 className="text-lg font-bold text-[#5B21B6]">
                Growth Lodge
              </h1>
              <p className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">
                Hotel Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">Administrator</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Admin
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5B21B6] font-bold text-white">
              A
            </div>
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 hidden w-64 border-r border-purple-100 bg-white dark:border-[#31265A] dark:bg-[#18132D] md:block">
        <nav className="p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Main Menu
          </p>

          <Link href="/admin" className={navClass}>
            <span>📊</span> Dashboard
          </Link>

          <Link href="/admin/rooms" className={navClass}>
            <span>🛏️</span> Rooms
          </Link>

          <Link href="/admin/reservations" className={navClass}>
            <span>📅</span> Reservations
          </Link>

          <Link href="/admin/guests" className={navClass}>
            <span>👥</span> Guests
          </Link>

          <Link href="/admin/staff" className={navClass}>
            <span>🧑‍💼</span> Staff
          </Link>

          <Link href="/admin/payments" className={navClass}>
            <span>💳</span> Payments
          </Link>

          <Link
            href="/admin/reports"
            className="mb-1 flex items-center gap-3 rounded-xl bg-purple-50 px-4 py-3 text-sm font-semibold text-[#5B21B6] dark:bg-[#241B3D] dark:text-[#A78BFA]"
          >
            <span>📈</span> Reports
          </Link>

          <Link href="/admin/settings" className={navClass}>
            <span>⚙️</span> Settings
          </Link>

          <div className="my-4 border-t border-gray-100 dark:border-[#31265A]" />

          <Link
            href="/signin"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <span>🚪</span> Sign Out
          </Link>
        </nav>
      </aside>

      <main className="pt-16 md:ml-64">
        <div className="p-4 md:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="mb-1 text-sm font-medium text-[#5B21B6] dark:text-[#A78BFA]">
                Admin / Reports
              </p>

              <h2 className="text-2xl font-bold md:text-3xl">
                Reports & Analytics
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Monitor hotel performance and business activity.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-[#5B21B6] dark:border-[#31265A] dark:bg-[#18132D]"
                aria-label="Revenue report period"
              >
                <option>Last 6 Months</option>
                <option>Last 30 Days</option>
                <option>Last 12 Months</option>
                <option>This Year</option>
              </select>

              <button
                type="button"
                onClick={() => void loadReportsData()}
                disabled={loading}
                className="rounded-xl border border-purple-200 bg-white px-5 py-3 text-sm font-semibold text-[#5B21B6] transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#31265A] dark:bg-[#18132D] dark:text-[#A78BFA] dark:hover:bg-[#241B3D]"
              >
                {loading ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400"
            >
              <p className="font-semibold">Some report data could not load.</p>
              <p className="mt-1">{error}</p>
              <p className="mt-2">
                Check that the backend is running and your account has a
                valid hotel workspace.
              </p>
            </div>
          )}

          {loading ? (
            <div className={`${cardClass} p-10 text-center`}>
              <p className="font-semibold">Loading reports...</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Getting the latest information from Growth Lodge.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className={cardClass}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Total Revenue
                    </span>
                    <span className="rounded-xl bg-green-100 p-2 text-green-600 dark:bg-green-950/30 dark:text-green-400">
                      ₦
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold">
                    {formatCurrency(totalRevenue)}
                  </h3>
                  <p className="mt-1 text-xs text-green-500">
                    From paid payments
                  </p>
                </div>

                <div className={cardClass}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Occupancy Rate
                    </span>
                    <span className="rounded-xl bg-purple-100 p-2 dark:bg-purple-950/30">
                      🏨
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold">{occupancyRate}%</h3>
                  <p className="mt-1 text-xs text-gray-400">
                    Based on current room status
                  </p>
                </div>

                <div className={cardClass}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Total Rooms
                    </span>
                    <span className="rounded-xl bg-blue-100 p-2 dark:bg-blue-950/30">
                      🛏️
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold">{totalRooms}</h3>
                  <p className="mt-1 text-xs text-gray-400">
                    Rooms in the system
                  </p>
                </div>

                <div className={cardClass}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Occupied Rooms
                    </span>
                    <span className="rounded-xl bg-orange-100 p-2 dark:bg-orange-950/30">
                      👤
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold">{occupiedRooms}</h3>
                  <p className="mt-1 text-xs text-orange-500">
                    {availableRooms} available
                  </p>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className={cardClass}>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Reservations
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {reservations.length}
                  </p>
                </div>

                <div className={cardClass}>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Confirmed
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {confirmedReservations}
                  </p>
                </div>

                <div className={cardClass}>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Customers
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {customers.length}
                  </p>
                </div>

                <div className={cardClass}>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pending Payments
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {pendingPayments}
                  </p>
                </div>
              </div>

              <div className={`${cardClass} mb-8`}>
                <div className="mb-6">
                  <h3 className="text-lg font-bold">Revenue Overview</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Paid-payment revenue for the selected period
                  </p>
                </div>

                <div className="flex min-h-72 items-end gap-3 overflow-x-auto md:gap-6">
                  {monthlyRevenue.map((item) => {
                    const height =
                      item.revenue > 0
                        ? Math.max(
                            (item.revenue / maxRevenue) * 100,
                            4
                          )
                        : 3;

                    return (
                      <div
                        key={item.month}
                        className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
                      >
                        <span className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                          {formatCurrency(item.revenue)}
                        </span>

                        <div className="flex h-52 w-full items-end justify-center">
                          <div
                            className="w-full max-w-14 rounded-t-xl bg-[#5B21B6] transition-all hover:bg-[#7C3AED]"
                            style={{ height: `${height}%` }}
                            title={`${item.month}: ${formatCurrency(item.revenue)}`}
                          />
                        </div>

                        <span className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className={cardClass}>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold">Room Occupancy</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Current occupancy by room type
                    </p>
                  </div>

                  {roomTypeData.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No room data available.
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {roomTypeData.map((room) => {
                        const percentage =
                          room.total > 0
                            ? Math.round(
                                (room.occupied / room.total) * 100
                              )
                            : 0;

                        return (
                          <div key={room.type}>
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-semibold">
                                {room.type}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {room.occupied}/{room.total}
                              </span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-[#31265A]">
                              <div
                                className="h-full rounded-full bg-[#5B21B6]"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>

                            <div className="mt-1 flex justify-between text-xs text-gray-400">
                              <span>{room.available} available</span>
                              <span>{percentage}% occupied</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className={cardClass}>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold">Quick Reports</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Hotel statistics currently available
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-purple-100 p-4 dark:border-[#31265A]">
                      <div className="mb-2 text-2xl">💰</div>
                      <p className="font-semibold">Revenue Report</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatCurrency(totalRevenue)} paid revenue
                      </p>
                    </div>

                    <div className="rounded-xl border border-purple-100 p-4 dark:border-[#31265A]">
                      <div className="mb-2 text-2xl">🏨</div>
                      <p className="font-semibold">Occupancy Report</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {occupancyRate}% current occupancy
                      </p>
                    </div>

                    <div className="rounded-xl border border-purple-100 p-4 dark:border-[#31265A]">
                      <div className="mb-2 text-2xl">👥</div>
                      <p className="font-semibold">Guest Report</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {customers.length} registered customers
                      </p>
                    </div>

                    <div className="rounded-xl border border-purple-100 p-4 dark:border-[#31265A]">
                      <div className="mb-2 text-2xl">💳</div>
                      <p className="font-semibold">Payment Report</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {payments.length} payment records
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${cardClass} mb-8`}>
                <div className="mb-6">
                  <h3 className="text-lg font-bold">Reservation Summary</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Current reservation activity
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {[
                    { label: "Total", value: reservations.length },
                    { label: "Confirmed", value: confirmedReservations },
                    { label: "Pending", value: pendingReservations },
                    { label: "Checked In", value: checkedInReservations },
                    { label: "Completed", value: completedReservations },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl bg-[#F5F3FF] p-4 dark:bg-[#241B3D]"
                    >
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.label}
                      </p>
                      <p className="mt-1 text-2xl font-bold">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm dark:border-green-950/40 dark:bg-[#18132D]">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Paid Payments
                  </p>
                  <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                    {paidPayments.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm dark:border-yellow-950/40 dark:bg-[#18132D]">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pending Payments
                  </p>
                  <p className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {pendingPayments}
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm dark:border-blue-950/40 dark:bg-[#18132D]">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Refunded Payments
                  </p>
                  <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {refundedPayments}
                  </p>
                </div>
              </div>

              <div className={`${cardClass} mb-8`}>
                <div className="mb-6">
                  <h3 className="text-lg font-bold">Room Summary</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Current room availability and maintenance status
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-green-50 p-4 dark:bg-green-950/20">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Available
                    </p>
                    <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                      {availableRooms}
                    </p>
                  </div>

                  <div className="rounded-xl bg-orange-50 p-4 dark:bg-orange-950/20">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Occupied
                    </p>
                    <p className="mt-1 text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {occupiedRooms}
                    </p>
                  </div>

                  <div className="rounded-xl bg-red-50 p-4 dark:bg-red-950/20">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Maintenance
                    </p>
                    <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                      {maintenanceRooms}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
                <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center dark:border-[#31265A]">
                  <div>
                    <h3 className="font-bold">Recent Payment Activity</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Latest payment transactions from the database
                    </p>
                  </div>

                  <Link
                    href="/admin/payments"
                    className="rounded-xl bg-[#5B21B6] px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#4C1D95]"
                  >
                    View Payments
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 dark:border-[#31265A]">
                        <th className="px-5 py-4">Payment</th>
                        <th className="px-5 py-4">Amount</th>
                        <th className="px-5 py-4">Method</th>
                        <th className="px-5 py-4">Date</th>
                        <th className="px-5 py-4">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentPayments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-5 py-8 text-center text-sm text-gray-500"
                          >
                            No payment activity yet.
                          </td>
                        </tr>
                      ) : (
                        recentPayments.map((payment) => (
                          <tr
                            key={payment.id}
                            className="border-b border-gray-50 dark:border-[#31265A]"
                          >
                            <td className="px-5 py-4">
                              <p className="font-semibold">
                                Payment #{payment.id}
                              </p>
                              <p className="text-xs text-gray-400">
                                Reservation #{payment.reservation_id}
                              </p>
                            </td>

                            <td className="px-5 py-4 font-semibold">
                              {formatCurrency(payment.amount)}
                            </td>

                            <td className="px-5 py-4 text-sm">
                              {payment.payment_method || "—"}
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(payment.created_at)}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(payment.status)}`}
                              >
                                {payment.status || "Unknown"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}