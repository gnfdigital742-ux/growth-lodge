"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/component/ThemeToggle";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Guest = {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
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

type Room = {
  id: number;
  room_number: string;
  room_type: string;
  status?: string;
};

type ApiResult<T> = {
  success?: boolean;
  message?: string;
  guests?: T;
  reservations?: T;
  rooms?: T;
};

function getHotelId(): string {
  if (typeof window === "undefined") return "";

  const directKeys = [
    "hotel_id",
    "hotelId",
    "growth_lodge_hotel_id",
  ];

  for (const key of directKeys) {
    const value = localStorage.getItem(key);
    if (value?.trim()) return value.trim();
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
        String(hotelId).trim()
      ) {
        return String(hotelId).trim();
      }
    } catch {
      // Ignore storage values that are not JSON.
    }
  }

  return "";
}

function getHeaders(includeJson = false): HeadersInit {
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
  dataKey: "guests" | "reservations" | "rooms"
): Promise<T> {
  let data: ApiResult<T>;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `The server returned an invalid response (${response.status}).`
    );
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message ||
        `Request failed (${response.status}).`
    );
  }

  const result = data[dataKey];

  if (result === undefined || result === null) {
    return [] as unknown as T;
  }

  return result;
}

function normalizeStatus(status: string): string {
  return (status || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .trim();
}

function formatDate(value?: string): string {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toLocaleDateString();
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [reservations, setReservations] =
    useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [search, setSearch] = useState("");
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showEditGuest, setShowEditGuest] = useState(false);
  const [selectedGuest, setSelectedGuest] =
    useState<Guest | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [newGuest, setNewGuest] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [editGuest, setEditGuest] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const requests = [
      {
        name: "guests",
        url: `${API_URL}/api/guests`,
        key: "guests" as const,
      },
      {
        name: "reservations",
        url: `${API_URL}/api/reservations`,
        key: "reservations" as const,
      },
      {
        name: "rooms",
        url: `${API_URL}/api/rooms`,
        key: "rooms" as const,
      },
    ];

    const results = await Promise.allSettled(
      requests.map(async (request) => {
        const response = await fetch(request.url, {
          method: "GET",
          headers: getHeaders(),
          cache: "no-store",
        });

        return readResponse<Guest[] | Reservation[] | Room[]>(
          response,
          request.key
        );
      })
    );

    const errors: string[] = [];

    results.forEach((result, index) => {
      const request = requests[index];

      if (result.status === "rejected") {
        errors.push(
          `${request.name}: ${
            result.reason instanceof Error
              ? result.reason.message
              : "Could not load data."
          }`
        );

        if (request.key === "guests") setGuests([]);
        if (request.key === "reservations") {
          setReservations([]);
        }
        if (request.key === "rooms") setRooms([]);

        return;
      }

      const data = result.value;

      if (request.key === "guests") {
        setGuests(data as Guest[]);
      }

      if (request.key === "reservations") {
        setReservations(data as Reservation[]);
      }

      if (request.key === "rooms") {
        setRooms(data as Room[]);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(" "));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleAddGuest = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!getHotelId()) {
      setError(
        "Hotel workspace not found. Please sign in again and ensure your account has a hotel ID."
      );
      return;
    }

    if (
      !newGuest.name.trim() ||
      !newGuest.email.trim() ||
      !newGuest.phone.trim() ||
      !newGuest.password
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (newGuest.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/api/guests`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
          full_name: newGuest.name.trim(),
          email: newGuest.email.trim(),
          phone: newGuest.phone.trim(),
          password: newGuest.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Failed to create guest."
        );
      }

      setMessage("Guest created successfully.");
      setNewGuest({
        name: "",
        email: "",
        phone: "",
        password: "",
      });
      setShowAddGuest(false);

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create guest."
      );
    } finally {
      setSaving(false);
    }
  };

  const openEditGuest = (guest: Guest) => {
    setError("");
    setMessage("");
    setSelectedGuest(guest);

    setEditGuest({
      name: guest.full_name || "",
      email: guest.email || "",
      phone: guest.phone || "",
    });

    setShowEditGuest(true);
  };

  const handleEditGuest = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!selectedGuest) return;

    setError("");
    setMessage("");

    if (!getHotelId()) {
      setError(
        "Hotel workspace not found. Please sign in again and ensure your account has a hotel ID."
      );
      return;
    }

    if (
      !editGuest.name.trim() ||
      !editGuest.email.trim() ||
      !editGuest.phone.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/api/guests/${selectedGuest.id}`,
        {
          method: "PUT",
          headers: getHeaders(true),
          body: JSON.stringify({
            full_name: editGuest.name.trim(),
            email: editGuest.email.trim(),
            phone: editGuest.phone.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Failed to update guest."
        );
      }

      setMessage("Guest information updated successfully.");
      setShowEditGuest(false);
      setSelectedGuest(null);

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update guest."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGuest = async (guest: Guest) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${guest.full_name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    if (!getHotelId()) {
      setError(
        "Hotel workspace not found. Please sign in again and ensure your account has a hotel ID."
      );
      return;
    }

    setDeletingId(guest.id);

    try {
      const response = await fetch(
        `${API_URL}/api/guests/${guest.id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Failed to delete guest."
        );
      }

      setMessage(`${guest.full_name} was deleted successfully.`);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete guest."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getGuestReservations = (userId: number) =>
    reservations
      .filter(
        (reservation) =>
          Number(reservation.user_id) === Number(userId)
      )
      .sort(
        (a, b) =>
          new Date(b.check_in).getTime() -
          new Date(a.check_in).getTime()
      );

  const getGuestReservation = (userId: number) =>
    getGuestReservations(userId)[0];

  const getRoom = (roomId: number) =>
    rooms.find((room) => Number(room.id) === Number(roomId));

  const getStatusLabel = (status: string) => {
    const normalized = normalizeStatus(status);

    if (normalized === "checked in") return "Checked In";
    if (normalized === "checked out") return "Checked Out";
    if (normalized === "confirmed") return "Confirmed";
    if (normalized === "pending") return "Pending";
    if (
      normalized === "cancelled" ||
      normalized === "canceled"
    ) {
      return "Cancelled";
    }

    return status || "No Reservation";
  };

  const getStatusClass = (status: string) => {
    const normalized = normalizeStatus(status);

    if (
      normalized === "checked in" ||
      normalized === "confirmed"
    ) {
      return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400";
    }

    if (normalized === "pending") {
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400";
    }

    if (
      normalized === "cancelled" ||
      normalized === "canceled"
    ) {
      return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";
    }

    if (normalized === "checked out") {
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";
    }

    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  const searchValue = search.toLowerCase().trim();

  const filteredGuests = guests.filter((guest) => {
    const reservation = getGuestReservation(guest.id);
    const room = reservation
      ? getRoom(reservation.room_id)
      : undefined;

    if (!searchValue) return true;

    return (
      (guest.full_name || "").toLowerCase().includes(searchValue) ||
      (guest.email || "").toLowerCase().includes(searchValue) ||
      (guest.phone || "").toLowerCase().includes(searchValue) ||
      (room?.room_number || "").toLowerCase().includes(searchValue)
    );
  });

  const totalGuests = guests.length;

  const currentGuests = guests.filter((guest) => {
    const reservation = getGuestReservation(guest.id);
    return (
      !!reservation &&
      normalizeStatus(reservation.status) === "checked in"
    );
  }).length;

  const checkedOutGuests = guests.filter((guest) => {
    const reservation = getGuestReservation(guest.id);
    return (
      !!reservation &&
      normalizeStatus(reservation.status) === "checked out"
    );
  }).length;

  const inputClass =
    "w-full rounded-xl border border-purple-100 bg-white px-4 py-3 outline-none focus:border-[#5B21B6] focus:ring-2 focus:ring-purple-200 dark:border-[#31265A] dark:bg-[#241B3D] dark:text-white dark:focus:border-[#A78BFA]";

  const closeAddModal = () => {
    setShowAddGuest(false);
    setError("");
  };

  const closeEditModal = () => {
    setShowEditGuest(false);
    setSelectedGuest(null);
    setError("");
  };

  return (
    <main className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B] dark:bg-[#0F0B1F] dark:text-white">
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
        <aside className="hidden min-h-[calc(100vh-81px)] w-64 border-r border-purple-100 bg-white p-5 dark:border-[#31265A] dark:bg-[#18132D] md:block">
          <nav className="space-y-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>📊</span> Dashboard
            </Link>
            <Link
              href="/admin/rooms"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>🛏️</span> Rooms
            </Link>
            <Link
              href="/admin/reservations"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>📅</span> Reservations
            </Link>
            <Link
              href="/admin/guests"
              className="flex items-center gap-3 rounded-xl bg-[#5B21B6] px-4 py-3 font-semibold text-white"
            >
              <span>👥</span> Guests
            </Link>
            <Link
              href="/admin/staff"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>👨‍💼</span> Staff
            </Link>
            <Link
              href="/admin/payments"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>💳</span> Payments
            </Link>
            <Link
              href="/admin/reports"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>📈</span> Reports
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>⚙️</span> Settings
            </Link>
          </nav>

          <div className="mt-10 border-t border-purple-100 pt-5 dark:border-[#31265A]">
            <Link
              href="/signin"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <span>🚪</span> Sign Out
            </Link>
          </div>
        </aside>

        <section className="w-full p-6 md:p-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold">Guests</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Manage guest information and hotel stays.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setError("");
                setMessage("");
                setShowAddGuest(true);
              }}
              className="rounded-xl bg-[#5B21B6] px-5 py-3 font-semibold text-white transition hover:bg-[#4C1D95]"
            >
              + Add New Guest
            </button>
          </div>

          {message && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-[#18132D]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Guests
              </p>
              <p className="mt-2 text-3xl font-bold">{totalGuests}</p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-[#18132D]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Current Guests
              </p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {currentGuests}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-[#18132D]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Checked Out
              </p>
              <p className="mt-2 text-3xl font-bold text-[#5B21B6] dark:text-[#A78BFA]">
                {checkedOutGuests}
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm dark:bg-[#18132D]">
            <input
              type="text"
              placeholder="Search by guest name, email, phone or room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#18132D]">
            <div className="flex items-center justify-between border-b border-purple-100 px-6 py-5 dark:border-[#31265A]">
              <div>
                <h3 className="text-xl font-bold">All Guests</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {filteredGuests.length} guest
                  {filteredGuests.length === 1 ? "" : "s"} shown
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadData()}
                disabled={loading}
                className="rounded-lg border border-purple-200 px-3 py-2 text-sm font-semibold text-[#5B21B6] disabled:opacity-50 dark:border-[#6D28D9] dark:text-[#A78BFA]"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="border-b border-purple-100 bg-[#F5F3FF] text-left text-sm dark:border-[#31265A] dark:bg-[#241B3D]">
                    <th className="px-6 py-4 font-semibold">Guest</th>
                    <th className="px-6 py-4 font-semibold">Contact</th>
                    <th className="px-6 py-4 font-semibold">Room</th>
                    <th className="px-6 py-4 font-semibold">Check In</th>
                    <th className="px-6 py-4 font-semibold">Check Out</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading && guests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        Loading guests...
                      </td>
                    </tr>
                  ) : filteredGuests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        {search
                          ? "No guests match your search."
                          : "No guests found. Use Add New Guest to create the first guest."}
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((guest) => {
                      const reservation = getGuestReservation(guest.id);
                      const room = reservation
                        ? getRoom(reservation.room_id)
                        : undefined;
                      const status = reservation?.status || "";

                      return (
                        <tr
                          key={guest.id}
                          className="border-b border-gray-100 last:border-0 dark:border-[#31265A]"
                        >
                          <td className="px-6 py-5">
                            <p className="font-semibold">
                              {guest.full_name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Guest #{guest.id}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <p className="text-sm">{guest.email}</p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {guest.phone || "No phone"}
                            </p>
                          </td>

                          <td className="px-6 py-5 font-medium">
                            {room
                              ? `Room ${room.room_number}`
                              : "Not assigned"}
                          </td>

                          <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(reservation?.check_in)}
                          </td>

                          <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(reservation?.check_out)}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(status)}`}
                            >
                              {getStatusLabel(status)}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditGuest(guest)}
                                className="rounded-lg border border-purple-200 px-3 py-2 text-sm font-semibold text-[#5B21B6] transition hover:bg-[#F5F3FF] dark:border-[#6D28D9] dark:text-[#A78BFA] dark:hover:bg-[#241B3D]"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => void handleDeleteGuest(guest)}
                                disabled={deletingId === guest.id}
                                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                              >
                                {deletingId === guest.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
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

      {showAddGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#18132D]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Add New Guest</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Create a guest account from the admin panel.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                className="text-2xl text-gray-500 transition hover:text-red-500"
                aria-label="Close add guest form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddGuest} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter guest full name"
                  value={newGuest.name}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, name: e.target.value })
                  }
                  required
                  className={inputClass}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    value={newGuest.email}
                    onChange={(e) =>
                      setNewGuest({ ...newGuest, email: e.target.value })
                    }
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="08012345678"
                    value={newGuest.phone}
                    onChange={(e) =>
                      setNewGuest({ ...newGuest, phone: e.target.value })
                    }
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Create guest password"
                  value={newGuest.password}
                  onChange={(e) =>
                    setNewGuest({
                      ...newGuest,
                      password: e.target.value,
                    })
                  }
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={inputClass}
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Use at least 8 characters.
                </p>
              </div>

              <div className="rounded-xl border border-purple-100 bg-[#F5F3FF] px-4 py-3 text-sm text-[#5B21B6] dark:border-[#31265A] dark:bg-[#241B3D] dark:text-[#A78BFA]">
                This form creates the guest directly through the admin
                endpoint. Email verification depends on your backend's
                guest-creation route.
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={saving}
                  className="w-1/2 rounded-xl border border-gray-200 px-5 py-3 font-semibold transition hover:bg-gray-50 disabled:opacity-50 dark:border-[#31265A] dark:hover:bg-[#241B3D]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 rounded-xl bg-[#5B21B6] px-5 py-3 font-semibold text-white transition hover:bg-[#4C1D95] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Adding..." : "Add Guest"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditGuest && selectedGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#18132D]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Edit Guest</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Update guest information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="text-2xl text-gray-500 transition hover:text-red-500"
                aria-label="Close edit guest form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditGuest} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editGuest.name}
                  onChange={(e) =>
                    setEditGuest({ ...editGuest, name: e.target.value })
                  }
                  required
                  className={inputClass}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editGuest.email}
                    onChange={(e) =>
                      setEditGuest({ ...editGuest, email: e.target.value })
                    }
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editGuest.phone}
                    onChange={(e) =>
                      setEditGuest({ ...editGuest, phone: e.target.value })
                    }
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="w-1/2 rounded-xl border border-gray-200 px-5 py-3 font-semibold transition hover:bg-gray-50 disabled:opacity-50 dark:border-[#31265A] dark:hover:bg-[#241B3D]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 rounded-xl bg-[#5B21B6] px-5 py-3 font-semibold text-white transition hover:bg-[#4C1D95] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}