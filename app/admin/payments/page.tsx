"use client";

import { useEffect, useMemo, useState } from "react";
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
  full_name?: string;
  email?: string;
  phone?: string | null;
  room_number?: string;
  room_type?: string;
  check_in?: string;
  check_out?: string;
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
  full_name?: string;
  email?: string;
  phone?: string | null;
  room_number?: string;
  room_type?: string;
  price?: number | string;
};

type User = {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  role: string;
};

type Room = {
  id: number;
  room_number: string;
  room_type: string;
  price: number | string;
  status: string;
};

type PaymentForm = {
  reservation_id: string;
  amount: string;
  payment_method: string;
  status: string;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
} & T;

function getHotelId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const storageKeys = [
    "hotel_id",
    "hotelId",
    "growth_lodge_hotel_id",
  ];

  for (const key of storageKeys) {
    const value = localStorage.getItem(key);

    if (value && value.trim()) {
      return value.trim();
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
    const storedUser = localStorage.getItem(key);

    if (!storedUser) {
      continue;
    }

    try {
      const parsed = JSON.parse(storedUser);

      const hotelId =
        parsed?.hotel_id ??
        parsed?.hotelId ??
        parsed?.hotel?.id;

      if (
        hotelId !== undefined &&
        hotelId !== null &&
        String(hotelId).trim()
      ) {
        return String(hotelId).trim();
      }
    } catch {
      // Ignore invalid stored JSON and continue checking.
    }
  }

  return "";
}

function getRequestHeaders(
  includeJson = false
): Record<string, string> {
  const headers: Record<string, string> = {};

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  const hotelId = getHotelId();

  if (hotelId) {
    headers["x-hotel-id"] = hotelId;
  }

  return headers;
}

async function readResponse<T>(
  response: Response,
  fallbackMessage: string
): Promise<ApiResponse<T>> {
  let data: ApiResponse<T>;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `The server returned an invalid response while trying to ${fallbackMessage.toLowerCase()}`
    );
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || fallbackMessage
    );
  }

  return data;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingPaymentId, setUpdatingPaymentId] =
    useState<number | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] =
    useState<Payment | null>(null);

  const [form, setForm] = useState<PaymentForm>({
    reservation_id: "",
    amount: "",
    payment_method: "Cash",
    status: "pending",
  });

  // =========================
  // LOAD DATA
  // =========================

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const headers = getRequestHeaders();

      const results = await Promise.allSettled([
        fetch(`${API_URL}/api/payments`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/reservations`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/auth/users`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/rooms`, {
          headers,
          cache: "no-store",
        }),
      ]);

      const labels = [
        "payments",
        "reservations",
        "users",
        "rooms",
      ];

      const responses: Response[] = [];

      for (let index = 0; index < results.length; index++) {
        const result = results[index];

        if (result.status === "rejected") {
          throw new Error(
            `Unable to connect while loading ${labels[index]}. Check that the backend is running.`
          );
        }

        responses.push(result.value);
      }

      const [
        paymentsData,
        reservationsData,
        usersData,
        roomsData,
      ] = await Promise.all([
        readResponse<{ payments?: Payment[] }>(
          responses[0],
          "Failed to load payments."
        ),
        readResponse<{ reservations?: Reservation[] }>(
          responses[1],
          "Failed to load reservations."
        ),
        readResponse<{ users?: User[] }>(
          responses[2],
          "Failed to load users."
        ),
        readResponse<{ rooms?: Room[] }>(
          responses[3],
          "Failed to load rooms."
        ),
      ]);

      setPayments(
        Array.isArray(paymentsData.payments)
          ? paymentsData.payments
          : []
      );

      setReservations(
        Array.isArray(reservationsData.reservations)
          ? reservationsData.reservations
          : []
      );

      setUsers(
        Array.isArray(usersData.users)
          ? usersData.users
          : []
      );

      setRooms(
        Array.isArray(roomsData.rooms)
          ? roomsData.rooms
          : []
      );
    } catch (err) {
      console.error("Payment load error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load payment information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // =========================
  // HELPERS
  // =========================

  const getReservation = (reservationId: number) =>
    reservations.find(
      (reservation) =>
        Number(reservation.id) === Number(reservationId)
    );

  const getUser = (userId: number) =>
    users.find(
      (user) => Number(user.id) === Number(userId)
    );

  const getRoom = (roomId: number) =>
    rooms.find(
      (room) => Number(room.id) === Number(roomId)
    );

  const getGuestName = (payment: Payment) => {
    if (payment.full_name) {
      return payment.full_name;
    }

    const reservation = getReservation(
      payment.reservation_id
    );

    if (!reservation) {
      return "Unknown Guest";
    }

    return (
      getUser(reservation.user_id)?.full_name ||
      reservation.full_name ||
      "Unknown Guest"
    );
  };

  const getGuestEmail = (payment: Payment) => {
    if (payment.email) {
      return payment.email;
    }

    const reservation = getReservation(
      payment.reservation_id
    );

    if (!reservation) {
      return "—";
    }

    return (
      getUser(reservation.user_id)?.email ||
      reservation.email ||
      "—"
    );
  };

  const getRoomNumber = (payment: Payment) => {
    if (payment.room_number) {
      return payment.room_number;
    }

    const reservation = getReservation(
      payment.reservation_id
    );

    if (!reservation) {
      return "—";
    }

    return (
      getRoom(reservation.room_id)?.room_number ||
      reservation.room_number ||
      "—"
    );
  };

  const getStatus = (status: string) =>
    status?.toLowerCase().trim() || "pending";

  const formatDate = (date?: string) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (
    amount: number | string
  ) => {
    const value = Number(amount || 0);

    return `₦${(Number.isFinite(value) ? value : 0).toLocaleString(
      "en-NG",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // =========================
  // FILTER
  // =========================

  const filteredPayments = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return payments;
    }

    return payments.filter((payment) => {
      const reservationId = String(
        payment.reservation_id
      );

      return (
        getGuestName(payment)
          .toLowerCase()
          .includes(value) ||
        getGuestEmail(payment)
          .toLowerCase()
          .includes(value) ||
        getRoomNumber(payment)
          .toLowerCase()
          .includes(value) ||
        (payment.payment_method || "")
          .toLowerCase()
          .includes(value) ||
        (payment.status || "")
          .toLowerCase()
          .includes(value) ||
        reservationId.includes(value)
      );
    });
  }, [payments, reservations, users, rooms, search]);

  // =========================
  // SUMMARY
  // =========================

  const totalPaid = payments
    .filter(
      (payment) => getStatus(payment.status) === "paid"
    )
    .reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    );

  const totalPending = payments
    .filter(
      (payment) => getStatus(payment.status) === "pending"
    )
    .reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    );

  const totalRefunded = payments
    .filter(
      (payment) => getStatus(payment.status) === "refunded"
    )
    .reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    );

  const paidCount = payments.filter(
    (payment) => getStatus(payment.status) === "paid"
  ).length;

  const pendingCount = payments.filter(
    (payment) => getStatus(payment.status) === "pending"
  ).length;

  const refundedCount = payments.filter(
    (payment) => getStatus(payment.status) === "refunded"
  ).length;

  // =========================
  // ADD PAYMENT
  // =========================

  const openAddPayment = () => {
    setError("");
    setMessage("");

    setForm({
      reservation_id: "",
      amount: "",
      payment_method: "Cash",
      status: "pending",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (!saving) {
      setShowModal(false);
    }
  };

  const handleReservationChange = (
    reservationId: string
  ) => {
    const reservation = reservations.find(
      (item) =>
        Number(item.id) === Number(reservationId)
    );

    const room = reservation
      ? getRoom(reservation.room_id)
      : null;

    setForm((previous) => ({
      ...previous,
      reservation_id: reservationId,
      amount: room
        ? String(room.price)
        : previous.amount,
    }));
  };

  const handleAddPayment = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!form.reservation_id) {
      setError("Please select a reservation.");
      return;
    }

    if (
      !form.amount ||
      !Number.isFinite(Number(form.amount)) ||
      Number(form.amount) <= 0
    ) {
      setError("Please enter a valid payment amount.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/api/payments`,
        {
          method: "POST",
          headers: getRequestHeaders(true),
          body: JSON.stringify({
            reservation_id: Number(form.reservation_id),
            amount: Number(form.amount),
            payment_method: form.payment_method,
            status: form.status,
          }),
        }
      );

      const data = await readResponse<Record<string, never>>(
        response,
        "Failed to create payment."
      );

      setShowModal(false);
      setMessage(
        data.message || "Payment added successfully."
      );

      await loadData();
    } catch (err) {
      console.error("Add payment error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to add payment."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // UPDATE PAYMENT STATUS
  // =========================

  const updatePaymentStatus = async (
    payment: Payment,
    newStatus: string
  ) => {
    setError("");
    setMessage("");

    try {
      setUpdatingPaymentId(payment.id);

      const response = await fetch(
        `${API_URL}/api/payments/${payment.id}`,
        {
          method: "PUT",
          headers: getRequestHeaders(true),
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await readResponse<Record<string, never>>(
        response,
        "Failed to update payment."
      );

      setMessage(
        data.message ||
          `Payment marked as ${newStatus}.`
      );

      await loadData();
    } catch (err) {
      console.error("Update payment error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update payment."
      );
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  // =========================
  // VIEW PAYMENT
  // =========================

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[#1E1B4B] outline-none focus:border-[#A78BFA] dark:border-[#31265A] dark:bg-[#241B3D] dark:text-white";

  const sidebarLinkClass =
    "flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]";

  return (
    <main className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B] dark:bg-[#0F0B1F] dark:text-white">
      {/* TOP BAR */}
      <header className="border-b border-purple-100 bg-white dark:border-[#31265A] dark:bg-[#18132D]">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Link
              href="/admin"
              className="text-2xl font-bold text-[#5B21B6] dark:text-[#A78BFA]"
            >
              Growth Lodge
            </Link>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Hotel Management System
            </p>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <div className="hidden text-right sm:block">
              <p className="font-semibold">Administrator</p>
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

      <div className="flex">
        {/* SIDEBAR */}
        <aside className="hidden min-h-[calc(100vh-81px)] w-64 shrink-0 border-r border-purple-100 bg-white p-5 dark:border-[#31265A] dark:bg-[#18132D] md:block">
          <nav className="space-y-2">
            <Link href="/admin" className={sidebarLinkClass}>
              <span>📊</span>
              Dashboard
            </Link>

            <Link href="/admin/rooms" className={sidebarLinkClass}>
              <span>🛏️</span>
              Rooms
            </Link>

            <Link
              href="/admin/reservations"
              className={sidebarLinkClass}
            >
              <span>📅</span>
              Reservations
            </Link>

            <Link href="/admin/guests" className={sidebarLinkClass}>
              <span>👥</span>
              Guests
            </Link>

            <Link href="/admin/staff" className={sidebarLinkClass}>
              <span>👨‍💼</span>
              Staff
            </Link>

            <Link
              href="/admin/payments"
              className="flex items-center gap-3 rounded-xl bg-[#5B21B6] px-4 py-3 font-semibold text-white"
            >
              <span>💳</span>
              Payments
            </Link>

            <Link href="/admin/reports" className={sidebarLinkClass}>
              <span>📈</span>
              Reports
            </Link>

            <Link href="/admin/settings" className={sidebarLinkClass}>
              <span>⚙️</span>
              Settings
            </Link>
          </nav>

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

        {/* MAIN */}
        <section className="min-w-0 w-full p-6 md:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold">Payments</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Manage hotel payments and payment status.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void loadData()}
                disabled={loading}
                className="rounded-xl border border-purple-200 bg-white px-5 py-3 font-semibold text-[#5B21B6] transition hover:bg-purple-50 disabled:opacity-60 dark:border-[#31265A] dark:bg-[#18132D] dark:text-[#A78BFA]"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>

              <button
                type="button"
                onClick={openAddPayment}
                className="rounded-xl bg-[#6D28D9] px-5 py-3 font-semibold text-white shadow-md transition hover:bg-[#5B21B6]"
              >
                + Add Payment
              </button>
            </div>
          </div>

          {/* MESSAGES */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
            >
              <span>{error}</span>

              <button
                type="button"
                onClick={() => void loadData()}
                className="font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          {message && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300"
            >
              {message}
            </div>
          )}

          {/* SUMMARY */}
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Paid
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                {formatCurrency(totalPaid)}
              </h2>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Paid Payments
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                {paidCount}
              </h2>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pending Payments
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                {pendingCount}
              </h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formatCurrency(totalPending)}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#18132D]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Refunded
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                {refundedCount}
              </h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formatCurrency(totalRefunded)}
              </p>
            </div>
          </div>

          {/* SEARCH */}
          <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm dark:bg-[#18132D]">
            <input
              type="text"
              placeholder="Search guest, email, room, method, status..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className={inputClass}
            />
          </div>

          {/* TABLE */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#18132D]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 px-6 py-5 dark:border-[#31265A]">
              <h3 className="text-xl font-bold">Payment Records</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filteredPayments.length} record
                {filteredPayments.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-[#F5F3FF] dark:bg-[#241B3D]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Guest
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Room
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Method
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        Loading payments...
                      </td>
                    </tr>
                  ) : filteredPayments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        {search
                          ? "No payments match your search."
                          : "No payments found. Add a payment when a reservation is available."}
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => {
                      const status = getStatus(payment.status);
                      const updating =
                        updatingPaymentId === payment.id;

                      return (
                        <tr
                          key={payment.id}
                          className="border-t border-gray-100 dark:border-[#31265A]"
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold">
                              {getGuestName(payment)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {getGuestEmail(payment)}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            Room {getRoomNumber(payment)}
                          </td>

                          <td className="px-6 py-4 font-semibold">
                            {formatCurrency(payment.amount)}
                          </td>

                          <td className="px-6 py-4">
                            {payment.payment_method || "—"}
                          </td>

                          <td className="px-6 py-4">
                            {formatDate(payment.created_at)}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                status === "paid"
                                  ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                  : status === "refunded"
                                  ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                              }`}
                            >
                              {status}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleViewPayment(payment)
                                }
                                className="rounded-lg bg-[#F5F3FF] px-3 py-2 text-xs font-semibold text-[#6D28D9] hover:bg-[#EDE9FE] dark:bg-[#241B3D] dark:text-[#A78BFA] dark:hover:bg-[#31265A]"
                              >
                                View
                              </button>

                              {status === "pending" && (
                                <button
                                  type="button"
                                  disabled={updating}
                                  onClick={() =>
                                    void updatePaymentStatus(
                                      payment,
                                      "paid"
                                    )
                                  }
                                  className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                                >
                                  {updating
                                    ? "Updating..."
                                    : "Mark Paid"}
                                </button>
                              )}

                              {status === "paid" && (
                                <button
                                  type="button"
                                  disabled={updating}
                                  onClick={() =>
                                    void updatePaymentStatus(
                                      payment,
                                      "refunded"
                                    )
                                  }
                                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                                >
                                  {updating
                                    ? "Updating..."
                                    : "Refund"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* ADD PAYMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-[#18132D]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Add Payment</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create a payment for an existing reservation.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close add payment form"
                className="text-2xl text-gray-400 hover:text-gray-700 disabled:opacity-50 dark:hover:text-white"
              >
                ×
              </button>
            </div>

            {reservations.length === 0 && !loading && (
              <div className="mb-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-300">
                No reservations are available. Create a reservation before adding a payment.
              </div>
            )}

            <form
              onSubmit={handleAddPayment}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Reservation
                </label>

                <select
                  value={form.reservation_id}
                  onChange={(event) =>
                    handleReservationChange(event.target.value)
                  }
                  className={inputClass}
                  required
                >
                  <option value="">Select reservation</option>

                  {reservations.map((reservation) => {
                    const guest = getUser(reservation.user_id);
                    const room = getRoom(reservation.room_id);

                    return (
                      <option
                        key={reservation.id}
                        value={reservation.id}
                      >
                        #{reservation.id} —{" "}
                        {guest?.full_name ||
                          reservation.full_name ||
                          "Unknown Guest"}{" "}
                        — Room{" "}
                        {room?.room_number ||
                          reservation.room_number ||
                          "—"}
                      </option>
                    );
                  })}
                </select>
              </div>

              {form.reservation_id && (
                <div className="rounded-xl bg-[#F5F3FF] p-4 text-sm dark:bg-[#241B3D]">
                  {(() => {
                    const reservation = getReservation(
                      Number(form.reservation_id)
                    );

                    if (!reservation) {
                      return null;
                    }

                    const guest = getUser(reservation.user_id);
                    const room = getRoom(reservation.room_id);

                    return (
                      <div className="space-y-1">
                        <p>
                          <strong>Guest:</strong>{" "}
                          {guest?.full_name ||
                            reservation.full_name ||
                            "—"}
                        </p>

                        <p>
                          <strong>Email:</strong>{" "}
                          {guest?.email ||
                            reservation.email ||
                            "—"}
                        </p>

                        <p>
                          <strong>Room:</strong>{" "}
                          {room?.room_number ||
                            reservation.room_number ||
                            "—"}
                        </p>

                        <p>
                          <strong>Check-in:</strong>{" "}
                          {formatDate(reservation.check_in)}
                        </p>

                        <p>
                          <strong>Check-out:</strong>{" "}
                          {formatDate(reservation.check_out)}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Amount (₦)
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      amount: event.target.value,
                    }))
                  }
                  placeholder="Enter amount"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Payment Method
                </label>

                <select
                  value={form.payment_method}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      payment_method: event.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">
                    Bank Transfer
                  </option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      status: event.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-[#31265A] dark:text-gray-200 dark:hover:bg-[#241B3D]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || reservations.length === 0}
                  className="flex-1 rounded-xl bg-[#6D28D9] px-4 py-3 font-semibold text-white hover:bg-[#5B21B6] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Add Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT DETAILS MODAL */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-[#18132D]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Payment Details
              </h2>

              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                aria-label="Close payment details"
                className="text-2xl text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                ×
              </button>
            </div>

            {(() => {
              const reservation = getReservation(
                selectedPayment.reservation_id
              );

              const guest = reservation
                ? getUser(reservation.user_id)
                : undefined;

              const room = reservation
                ? getRoom(reservation.room_id)
                : undefined;

              return (
                <div className="space-y-4">
                  <div className="rounded-xl bg-[#F5F3FF] p-4 dark:bg-[#241B3D]">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Guest
                    </p>

                    <p className="font-semibold">
                      {selectedPayment.full_name ||
                        guest?.full_name ||
                        reservation?.full_name ||
                        "Unknown Guest"}
                    </p>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedPayment.email ||
                        guest?.email ||
                        reservation?.email ||
                        "—"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Reservation
                      </p>
                      <p className="font-semibold">
                        #{selectedPayment.reservation_id}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Room
                      </p>
                      <p className="font-semibold">
                        {selectedPayment.room_number ||
                          room?.room_number ||
                          reservation?.room_number ||
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Amount
                      </p>
                      <p className="font-semibold">
                        {formatCurrency(selectedPayment.amount)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Method
                      </p>
                      <p className="font-semibold">
                        {selectedPayment.payment_method || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Check-in
                      </p>
                      <p className="font-semibold">
                        {formatDate(
                          selectedPayment.check_in ||
                            reservation?.check_in
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Check-out
                      </p>
                      <p className="font-semibold">
                        {formatDate(
                          selectedPayment.check_out ||
                            reservation?.check_out
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Date Created
                      </p>
                      <p className="font-semibold">
                        {formatDate(selectedPayment.created_at)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    <p className="font-semibold capitalize">
                      {getStatus(selectedPayment.status)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedPayment(null)}
                    className="w-full rounded-xl bg-[#6D28D9] px-4 py-3 font-semibold text-white hover:bg-[#5B21B6]"
                  >
                    Close
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </main>
  );
}