"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/component/ThemeToggle";

type PaymentStatus = "Paid" | "Pending" | "Refunded";

type Payment = {
  id: number;
  receipt: string;
  guest: string;
  email: string;
  phone: string;
  reservation: string;
  room: string;
  roomType: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  date: string;
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
  price?: number | string;
};

type BackendPayment = {
  id: number;
  reservation_id: number;
  amount: number | string;
  payment_method: string;
  status: string;
  created_at: string;
};

export default function StaffPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const [paymentsResponse, reservationsResponse] =
        await Promise.all([
          fetch("http://localhost:5000/api/payments"),
          fetch("http://localhost:5000/api/reservations"),
        ]);

      if (!paymentsResponse.ok) {
        throw new Error("Failed to load payments.");
      }

      if (!reservationsResponse.ok) {
        throw new Error("Failed to load reservation information.");
      }

      const paymentsData = await paymentsResponse.json();
      const reservationsData = await reservationsResponse.json();

      const paymentList: BackendPayment[] = Array.isArray(
        paymentsData
      )
        ? paymentsData
        : Array.isArray(paymentsData.payments)
          ? paymentsData.payments
          : [];

      const reservationList: Reservation[] = Array.isArray(
        reservationsData
      )
        ? reservationsData
        : Array.isArray(reservationsData.reservations)
          ? reservationsData.reservations
          : [];

      const mappedPayments: Payment[] = paymentList.map(
        (payment, index) => {
          const reservation = reservationList.find(
            (item) =>
              Number(item.id) === Number(payment.reservation_id)
          );

          const rawStatus = String(
            payment.status || "pending"
          ).toLowerCase();

          let status: PaymentStatus = "Pending";

          if (
            rawStatus === "paid" ||
            rawStatus === "completed"
          ) {
            status = "Paid";
          } else if (rawStatus === "refunded") {
            status = "Refunded";
          }

          return {
            id: Number(payment.id),

            receipt: `PAY-${String(
              Number(payment.id) || 1001 + index
            ).padStart(4, "0")}`,

            guest:
              reservation?.full_name ||
              "Guest",

            email:
              reservation?.email ||
              "N/A",

            phone:
              reservation?.phone ||
              "N/A",

            reservation: reservation
              ? `#GL${String(reservation.id).padStart(4, "0")}`
              : `#GL${String(
                  payment.reservation_id
                ).padStart(4, "0")}`,

            room:
              reservation?.room_number ||
              "N/A",

            roomType:
              reservation?.room_type ||
              "N/A",

            amount: Number(payment.amount) || 0,

            method:
              payment.payment_method ||
              "Not specified",

            status,

            date: formatDate(payment.created_at),
          };
        }
      );

      setPayments(mappedPayments);
    } catch (err: any) {
      console.error("Payments error:", err);

      setError(
        err?.message ||
          "Unable to load payment records."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return true;
    }

    return (
      payment.receipt
        .toLowerCase()
        .includes(searchText) ||
      payment.guest
        .toLowerCase()
        .includes(searchText) ||
      payment.email
        .toLowerCase()
        .includes(searchText) ||
      payment.phone
        .toLowerCase()
        .includes(searchText) ||
      payment.reservation
        .toLowerCase()
        .includes(searchText) ||
      payment.room
        .toLowerCase()
        .includes(searchText) ||
      payment.roomType
        .toLowerCase()
        .includes(searchText) ||
      payment.method
        .toLowerCase()
        .includes(searchText) ||
      payment.status
        .toLowerCase()
        .includes(searchText)
    );
  });

  const totalPayments = payments
    .filter((payment) => payment.status === "Paid")
    .reduce(
      (total, payment) => total + payment.amount,
      0
    );

  const pendingPayments = payments
    .filter((payment) => payment.status === "Pending")
    .reduce(
      (total, payment) => total + payment.amount,
      0
    );

  const refundedPayments = payments
    .filter((payment) => payment.status === "Refunded")
    .reduce(
      (total, payment) => total + payment.amount,
      0
    );

  const handleView = (payment: Payment) => {
    alert(
      `Payment Details\n\n` +
        `Receipt: ${payment.receipt}\n` +
        `Guest: ${payment.guest}\n` +
        `Email: ${payment.email}\n` +
        `Phone: ${payment.phone}\n` +
        `Reservation: ${payment.reservation}\n` +
        `Room: ${payment.room}\n` +
        `Room Type: ${payment.roomType}\n` +
        `Amount: ₦${payment.amount.toLocaleString()}\n` +
        `Method: ${payment.method}\n` +
        `Status: ${payment.status}\n` +
        `Date: ${payment.date}`
    );
  };

  const handleMarkPaid = async (id: number) => {
    alert(
      "The payment status update API is not connected yet. The payment records are connected and displaying correctly."
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B] dark:bg-[#0F0B1F] dark:text-white">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-purple-100 bg-white dark:border-[#31265A] dark:bg-[#18132D]">
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-xl hover:bg-purple-50 md:hidden dark:hover:bg-[#241B3D]"
              aria-label="Open menu"
            >
              ☰
            </button>

            <Link
              href="/staff"
              className="text-xl font-bold text-[#5B21B6] dark:text-[#A78BFA]"
            >
              Growth Lodge
            </Link>

            <span className="hidden text-sm text-gray-400 sm:block">
              Staff Panel
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[#1E1B4B] dark:text-white">
                Staff Member
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Staff
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5B21B6] font-semibold text-white">
              S
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed bottom-0 left-0 top-16 z-40 hidden w-64 border-r border-purple-100 bg-white md:block dark:border-[#31265A] dark:bg-[#18132D]">
        <nav className="space-y-2 p-4">
          <Link
            href="/staff"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
          >
            <span>📊</span>
            Dashboard
          </Link>

          <Link
            href="/staff/reservations"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
          >
            <span>📅</span>
            Reservations
          </Link>

          <Link
            href="/staff/guests"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
          >
            <span>👥</span>
            Guests
          </Link>

          <Link
            href="/staff/rooms"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
          >
            <span>🛏️</span>
            Rooms
          </Link>

          <Link
            href="/staff/checkin"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
          >
            <span>✅</span>
            Check-in / Check-out
          </Link>

          <Link
            href="/staff/payments"
            className="flex items-center gap-3 rounded-xl bg-[#5B21B6] px-4 py-3 text-sm font-medium text-white shadow-sm"
          >
            <span>💳</span>
            Payments
          </Link>

          <Link
            href="/staff/profile"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
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
      <main className="min-h-screen pt-16 md:ml-64">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1E1B4B] dark:text-white md:text-3xl">
              Payments
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View and manage guest payments and transactions.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl dark:bg-green-950/40">
                  💰
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400">
                  Paid
                </span>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Paid
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#1E1B4B] dark:text-white">
                ₦{totalPayments.toLocaleString()}
              </h2>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-xl dark:bg-yellow-950/40">
                  ⏳
                </div>

                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400">
                  Pending
                </span>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pending Payments
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#1E1B4B] dark:text-white">
                ₦{pendingPayments.toLocaleString()}
              </h2>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-xl dark:bg-red-950/40">
                  ↩️
                </div>

                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-400">
                  Refunded
                </span>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Refunded Amount
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#1E1B4B] dark:text-white">
                ₦{refundedPayments.toLocaleString()}
              </h2>
            </div>
          </div>

          {/* Payments Section */}
          <section className="rounded-2xl border border-purple-100 bg-white shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
            <div className="border-b border-gray-100 p-5 dark:border-[#31265A] md:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#1E1B4B] dark:text-white">
                    Payment Transactions
                  </h2>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Review recent guest payment activity.
                  </p>
                </div>

                <div className="relative w-full lg:w-80">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    🔍
                  </span>

                  <input
                    type="text"
                    placeholder="Search payments..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#5B21B6] focus:ring-2 focus:ring-purple-100 dark:border-[#31265A] dark:bg-[#0F0B1F] dark:text-white dark:focus:border-[#A78BFA] dark:focus:ring-purple-950"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                Loading payment records...
              </div>
            ) : error ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-red-500">
                  {error}
                </p>

                <button
                  onClick={fetchPayments}
                  className="mt-4 rounded-lg bg-[#5B21B6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4C1D95]"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500 dark:border-[#31265A] dark:text-gray-400">
                        <th className="px-6 py-4 font-semibold">
                          Receipt
                        </th>

                        <th className="px-6 py-4 font-semibold">
                          Guest
                        </th>

                        <th className="px-6 py-4 font-semibold">
                          Reservation
                        </th>

                        <th className="px-6 py-4 font-semibold">
                          Room
                        </th>

                        <th className="px-6 py-4 font-semibold">
                          Amount
                        </th>

                        <th className="px-6 py-4 font-semibold">
                          Method
                        </th>

                        <th className="px-6 py-4 font-semibold">
                          Status
                        </th>

                        <th className="px-6 py-4 font-semibold">
                          Date
                        </th>

                        <th className="px-6 py-4 font-semibold">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredPayments.length > 0 ? (
                        filteredPayments.map((payment) => (
                          <tr
                            key={payment.id}
                            className="border-b border-gray-100 last:border-0 hover:bg-purple-50/50 dark:border-[#31265A] dark:hover:bg-[#241B3D]/50"
                          >
                            <td className="px-6 py-4">
                              <span className="font-semibold text-[#5B21B6] dark:text-[#A78BFA]">
                                {payment.receipt}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <p className="font-medium text-[#1E1B4B] dark:text-white">
                                {payment.guest}
                              </p>

                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {payment.email}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {payment.reservation}
                            </td>

                            <td className="px-6 py-4">
                              <p className="text-sm font-medium">
                                {payment.room}
                              </p>

                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {payment.roomType}
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <span className="font-semibold">
                                ₦
                                {payment.amount.toLocaleString()}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {payment.method}
                            </td>

                            <td className="px-6 py-4">
                              <StatusBadge
                                status={payment.status}
                              />
                            </td>

                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {payment.date}
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    handleView(payment)
                                  }
                                  className="rounded-lg bg-purple-50 px-3 py-2 text-xs font-semibold text-[#5B21B6] transition hover:bg-purple-100 dark:bg-[#241B3D] dark:text-[#A78BFA] dark:hover:bg-[#31265A]"
                                >
                                  View
                                </button>

                                {payment.status ===
                                  "Pending" && (
                                  <button
                                    onClick={() =>
                                      handleMarkPaid(
                                        payment.id
                                      )
                                    }
                                    disabled={
                                      actionLoading ===
                                      payment.id
                                    }
                                    className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-950/50"
                                  >
                                    {actionLoading ===
                                    payment.id
                                      ? "Updating..."
                                      : "Mark Paid"}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                          >
                            No payments found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-4 p-4 md:hidden">
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="rounded-xl border border-gray-100 p-4 dark:border-[#31265A]"
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <p className="font-bold text-[#5B21B6] dark:text-[#A78BFA]">
                              {payment.receipt}
                            </p>

                            <p className="mt-1 font-semibold text-[#1E1B4B] dark:text-white">
                              {payment.guest}
                            </p>

                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {payment.email}
                            </p>
                          </div>

                          <StatusBadge
                            status={payment.status}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">
                              Reservation
                            </p>

                            <p className="mt-1 font-medium">
                              {payment.reservation}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500 dark:text-gray-400">
                              Room
                            </p>

                            <p className="mt-1 font-medium">
                              {payment.room}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500 dark:text-gray-400">
                              Amount
                            </p>

                            <p className="mt-1 font-semibold">
                              ₦
                              {payment.amount.toLocaleString()}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500 dark:text-gray-400">
                              Method
                            </p>

                            <p className="mt-1 font-medium">
                              {payment.method}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500 dark:text-gray-400">
                              Date
                            </p>

                            <p className="mt-1 font-medium">
                              {payment.date}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() =>
                              handleView(payment)
                            }
                            className="flex-1 rounded-lg bg-purple-50 px-3 py-2 text-xs font-semibold text-[#5B21B6] dark:bg-[#241B3D] dark:text-[#A78BFA]"
                          >
                            View
                          </button>

                          {payment.status === "Pending" && (
                            <button
                              onClick={() =>
                                handleMarkPaid(payment.id)
                              }
                              disabled={
                                actionLoading ===
                                payment.id
                              }
                              className="flex-1 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 disabled:opacity-50 dark:bg-green-950/30 dark:text-green-400"
                            >
                              {actionLoading === payment.id
                                ? "Updating..."
                                : "Mark Paid"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      No payments found.
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Footer */}
            <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-500 dark:border-[#31265A] dark:text-gray-400">
              Showing {filteredPayments.length} of{" "}
              {payments.length} payments
            </div>
          </section>

          {/* Reminder */}
          <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50 p-5 dark:border-[#4B3B78] dark:bg-[#241B3D]">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5B21B6] text-lg text-white">
                💡
              </div>

              <div>
                <h3 className="font-semibold text-[#1E1B4B] dark:text-white">
                  Payment Reminder
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  Always confirm the payment method and amount
                  before completing a guest transaction. Payment
                  records are connected to the Growth Lodge
                  database.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function formatDate(value: any): string {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({
  status,
}: {
  status: PaymentStatus;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        status === "Paid"
          ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
          : status === "Pending"
            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
            : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
      }`}
    >
      {status}
    </span>
  );
}