
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/component/ThemeToggle";

type User = {
  id: number;
  full_name?: string;
  name?: string;
  email: string;
  phone?: string;
  role?: string;
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
  room_number?: string;
  room_type?: string;
  price?: number;
};

type BackendPayment = {
  id: number;
  reservation_id: number;
  amount: number | string;
  payment_method: string;
  status: string;
  created_at: string;
};

type Payment = {
  id: string;
  reservation: string;
  date: string;
  method: string;
  amount: number;
  status: "Paid" | "Pending";
};

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] =
    useState<Payment | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState<User | null>(null);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        setError("");

        const storedUser = localStorage.getItem("growthLodgeUser");

        if (!storedUser) {
          setError("Please sign in to view your payments.");
          setLoading(false);
          return;
        }

        const user: User = JSON.parse(storedUser);

        if (!user.id) {
          setError("Your account information is incomplete.");
          setLoading(false);
          return;
        }

        setCustomer(user);

        // Get customer reservations
        const reservationsResponse = await fetch(
          "http://localhost:5000/api/reservations"
        );

        if (!reservationsResponse.ok) {
          throw new Error("Failed to load reservations.");
        }

        const reservationsData = await reservationsResponse.json();

        const reservations: Reservation[] = Array.isArray(reservationsData)
          ? reservationsData
          : Array.isArray(reservationsData.reservations)
          ? reservationsData.reservations
          : [];

        // Keep only this customer's reservations
        const customerReservations = reservations.filter(
          (reservation) =>
            Number(reservation.user_id) === Number(user.id)
        );

        const customerReservationIds = new Set(
          customerReservations.map((reservation) =>
            Number(reservation.id)
          )
        );

        // Get all payments
        const paymentsResponse = await fetch(
          "http://localhost:5000/api/payments"
        );

        if (!paymentsResponse.ok) {
          throw new Error("Failed to load payments.");
        }

        const paymentsData = await paymentsResponse.json();

        const backendPayments: BackendPayment[] = Array.isArray(
          paymentsData
        )
          ? paymentsData
          : Array.isArray(paymentsData.payments)
          ? paymentsData.payments
          : [];

        // Keep only payments connected to this customer's reservations
        const customerPayments = backendPayments.filter((payment) =>
          customerReservationIds.has(Number(payment.reservation_id))
        );

        const formattedPayments: Payment[] = customerPayments.map(
          (payment) => {
            const reservation = customerReservations.find(
              (item) =>
                Number(item.id) === Number(payment.reservation_id)
            );

            const numericAmount = Number(payment.amount) || 0;

            const normalizedStatus =
              String(payment.status).toLowerCase() === "paid"
                ? "Paid"
                : "Pending";

            return {
              id: `TXN-${String(payment.id).padStart(4, "0")}`,
              reservation: reservation
                ? `#GL-${reservation.id}`
                : `#GL-${payment.reservation_id}`,
              date: new Date(
                payment.created_at
              ).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              method: payment.payment_method,
              amount: numericAmount,
              status: normalizedStatus,
            };
          }
        );

        setPayments(formattedPayments);
      } catch (err) {
        console.error("Payment loading error:", err);
        setError(
          "Unable to load your payments. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  const filteredPayments = payments.filter(
    (payment) =>
      payment.id.toLowerCase().includes(search.toLowerCase()) ||
      payment.reservation
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      payment.method.toLowerCase().includes(search.toLowerCase())
  );

  const totalPaid = payments
    .filter((payment) => payment.status === "Paid")
    .reduce((total, payment) => total + payment.amount, 0);

  const pendingAmount = payments
    .filter((payment) => payment.status === "Pending")
    .reduce((total, payment) => total + payment.amount, 0);

  const customerName =
    customer?.full_name || customer?.name || "Customer";

  const customerEmail =
    customer?.email || "customer@growthlodge.com";

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
                {customerName}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {customerEmail}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5B21B6] font-bold text-white">
              {customerName.charAt(0).toUpperCase()}
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
            className="block rounded-xl bg-[#5B21B6] px-4 py-3 text-sm font-semibold text-white"
          >
            Payments
          </Link>

          <Link
            href="/customer/profile"
            className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-purple-50 dark:hover:bg-[#241B3D]"
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
          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold md:text-3xl">
              Payments
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View and manage your payment history.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="mb-8 rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-[#18132D]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading your payment history...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Summary Cards */}
          {!loading && !error && (
            <>
              <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Paid
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-green-600">
                    ₦{totalPaid.toLocaleString()}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pending Payment
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-orange-500">
                    ₦{pendingAmount.toLocaleString()}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Transactions
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {payments.length}
                  </h2>
                </div>
              </div>

              {/* Search */}
              <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm dark:bg-[#18132D]">
                <input
                  type="text"
                  placeholder="Search transaction, reservation or payment method..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm outline-none focus:border-[#5B21B6] dark:border-[#31265A] dark:bg-[#0F0B1F]"
                />
              </div>

              {/* Payment Table */}
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#18132D]">
                <div className="border-b border-purple-100 p-5 dark:border-[#31265A]">
                  <h2 className="font-semibold">
                    Payment History
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px]">
                    <thead>
                      <tr className="border-b border-purple-100 text-left text-sm text-gray-500 dark:border-[#31265A] dark:text-gray-400">
                        <th className="px-5 py-4">
                          Transaction ID
                        </th>

                        <th className="px-5 py-4">
                          Reservation
                        </th>

                        <th className="px-5 py-4">
                          Date
                        </th>

                        <th className="px-5 py-4">
                          Method
                        </th>

                        <th className="px-5 py-4">
                          Amount
                        </th>

                        <th className="px-5 py-4">
                          Status
                        </th>

                        <th className="px-5 py-4">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredPayments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-b border-purple-50 last:border-0 dark:border-[#31265A]"
                        >
                          <td className="px-5 py-4 text-sm font-semibold">
                            {payment.id}
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {payment.reservation}
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {payment.date}
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {payment.method}
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold">
                            ₦{payment.amount.toLocaleString()}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                payment.status === "Paid"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {payment.status === "Pending" ? (
                              <button
                                onClick={() =>
                                  alert(
                                    "Payment gateway will be connected when online payment processing is implemented."
                                  )
                                }
                                className="mr-2 rounded-lg bg-[#5B21B6] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4C1D95]"
                              >
                                Pay Now
                              </button>
                            ) : null}

                            <button
                              onClick={() =>
                                setSelectedPayment(payment)
                              }
                              className="rounded-lg border border-purple-200 px-3 py-2 text-xs font-semibold text-[#5B21B6] hover:bg-purple-50 dark:border-[#4B3B78] dark:text-[#A78BFA] dark:hover:bg-[#241B3D]"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredPayments.length === 0 && (
                  <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No payments found.
                  </div>
                )}
              </div>

              {/* Help */}
              <div className="mt-8 rounded-2xl bg-[#5B21B6] p-6 text-white">
                <h2 className="text-lg font-bold">
                  Need help with a payment?
                </h2>

                <p className="mt-2 text-sm text-purple-100">
                  Contact Growth Lodge support if you have any
                  payment questions.
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

      {/* View Payment Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-[#18132D]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Payment Details
              </h2>

              <button
                onClick={() => setSelectedPayment(null)}
                className="text-2xl text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">
                  Transaction ID
                </p>

                <p className="font-semibold">
                  {selectedPayment.id}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Reservation
                </p>

                <p className="font-semibold">
                  {selectedPayment.reservation}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Payment Date
                </p>

                <p className="font-semibold">
                  {selectedPayment.date}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Payment Method
                </p>

                <p className="font-semibold">
                  {selectedPayment.method}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Amount
                </p>

                <p className="text-xl font-bold text-[#5B21B6] dark:text-[#A78BFA]">
                  ₦{selectedPayment.amount.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Status
                </p>

                <p
                  className={`font-semibold ${
                    selectedPayment.status === "Paid"
                      ? "text-green-600"
                      : "text-orange-500"
                  }`}
                >
                  {selectedPayment.status}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedPayment(null)}
              className="mt-6 w-full rounded-xl bg-[#5B21B6] py-3 font-semibold text-white hover:bg-[#4C1D95]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
