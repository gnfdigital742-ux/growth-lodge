"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/component/ThemeToggle";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  role: string;
};

type Room = {
  id: number;
  room_number: string;
  room_type: string;
  price: number | string;
  status: string;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  reservations?: T;
  users?: T;
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
    const savedUser = localStorage.getItem(key);

    if (!savedUser) continue;

    try {
      const user = JSON.parse(savedUser);
      const id = user?.hotel_id ?? user?.hotelId;

      if (id !== undefined && id !== null && String(id).trim()) {
        return String(id);
      }
    } catch {
      // Ignore malformed saved session data.
    }
  }

  return "";
}

function getRequestHeaders(json = false): HeadersInit {
  const headers: Record<string, string> = {};

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  const hotelId = getHotelId();

  if (hotelId) {
    headers["x-hotel-id"] = hotelId;
  }

  return headers;
}

async function readResponse<T>(
  response: Response
): Promise<ApiResponse<T>> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || `Request failed (${response.status})`
    );
  }

  return data as ApiResponse<T>;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [newReservation, setNewReservation] = useState({
    user_id: "",
    room_id: "",
    check_in: "",
    check_out: "",
    guests: "1",
    status: "pending",
  });

  const fetchReservations = useCallback(async () => {
    const response = await fetch(`${API_URL}/api/reservations`, {
      headers: getRequestHeaders(),
      cache: "no-store",
    });

    const data = await readResponse<Reservation[]>(response);

    setReservations(
      Array.isArray(data.reservations) ? data.reservations : []
    );
  }, []);

  const fetchUsers = useCallback(async () => {
    const response = await fetch(`${API_URL}/api/auth/users`, {
      headers: getRequestHeaders(),
      cache: "no-store",
    });

    const data = await readResponse<User[]>(response);

    setUsers(Array.isArray(data.users) ? data.users : []);
  }, []);

  const fetchRooms = useCallback(async () => {
    const response = await fetch(`${API_URL}/api/rooms`, {
      headers: getRequestHeaders(),
      cache: "no-store",
    });

    const data = await readResponse<Room[]>(response);

    setRooms(Array.isArray(data.rooms) ? data.rooms : []);
  }, []);

  const loadAllData = useCallback(
    async (isRefresh = false) => {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const results = await Promise.allSettled([
        fetchReservations(),
        fetchUsers(),
        fetchRooms(),
      ]);

      const messages: string[] = [];

      if (results[0].status === "rejected") {
        console.error(
          "Reservations request failed:",
          results[0].reason
        );
        messages.push(
          "Reservations could not be retrieved from the backend."
        );
      }

      if (results[1].status === "rejected") {
        console.error("Guests request failed:", results[1].reason);
        messages.push("Guest accounts could not be retrieved.");
      }

      if (results[2].status === "rejected") {
        console.error("Rooms request failed:", results[2].reason);
        messages.push("Rooms could not be retrieved.");
      }

      if (messages.length > 0) {
        setError(messages.join(" "));
      }

      setLoading(false);
      setRefreshing(false);
    },
    [fetchReservations, fetchUsers, fetchRooms]
  );

  useEffect(() => {
    void loadAllData();
  }, [loadAllData]);

  const resetReservationForm = () => {
    setNewReservation({
      user_id: "",
      room_id: "",
      check_in: "",
      check_out: "",
      guests: "1",
      status: "pending",
    });
  };

  const handleCreateReservation = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!getHotelId()) {
      setError(
        "Your hotel workspace is not linked to this session. Please sign in again or connect your admin account to the correct hotel workspace."
      );
      return;
    }

    if (
      !newReservation.user_id ||
      !newReservation.room_id ||
      !newReservation.check_in ||
      !newReservation.check_out
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (newReservation.check_out <= newReservation.check_in) {
      setError("Check-out date must be after the check-in date.");
      return;
    }

    const selectedRoom = rooms.find(
      (room) => room.id === Number(newReservation.room_id)
    );

    if (!selectedRoom) {
      setError("Please select a valid room.");
      return;
    }

    if (selectedRoom.status?.toLowerCase().includes("maintenance")) {
      setError("This room is currently under maintenance.");
      return;
    }

    const selectedUser = users.find(
      (user) => user.id === Number(newReservation.user_id)
    );

    if (
      !selectedUser ||
      selectedUser.role?.toLowerCase() !== "customer"
    ) {
      setError("Please select an existing customer account.");
      return;
    }

    const guestCount = Number(newReservation.guests);

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      setError("Number of guests must be at least 1.");
      return;
    }

    const hasOverlap = reservations.some((reservation) => {
      if (reservation.room_id !== Number(newReservation.room_id)) {
        return false;
      }

      const status = reservation.status?.toLowerCase();

      if (
        [
          "cancelled",
          "checked_out",
          "checked out",
          "completed",
        ].includes(status)
      ) {
        return false;
      }

      return (
        newReservation.check_in < reservation.check_out &&
        newReservation.check_out > reservation.check_in
      );
    });

    if (hasOverlap) {
      setError(
        "This room already has a reservation during the selected dates."
      );
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/reservations`, {
        method: "POST",
        headers: getRequestHeaders(true),
        body: JSON.stringify({
          user_id: Number(newReservation.user_id),
          room_id: Number(newReservation.room_id),
          check_in: newReservation.check_in,
          check_out: newReservation.check_out,
          guests: guestCount,
          status: newReservation.status,
        }),
      });

      const data = await readResponse<Reservation>(response);

      setShowModal(false);
      resetReservationForm();
      setSuccess("Reservation created successfully.");

      await fetchReservations();

      if (data.message) {
        setSuccess(data.message);
      }
    } catch (err) {
      console.error("Create reservation error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not create the reservation. Check your backend."
      );
    }
  };

  const handleStatusChange = async (
    id: number,
    status: string
  ) => {
    setError("");
    setSuccess("");
    setUpdatingId(id);

    try {
      const response = await fetch(
        `${API_URL}/api/reservations/${id}`,
        {
          method: "PUT",
          headers: getRequestHeaders(true),
          body: JSON.stringify({ status }),
        }
      );

      await readResponse<unknown>(response);

      setSuccess("Reservation status updated successfully.");

      await fetchReservations();
    } catch (err) {
      console.error("Update reservation error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not update reservation status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this reservation?"
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(id);

    try {
      const response = await fetch(
        `${API_URL}/api/reservations/${id}`,
        {
          method: "DELETE",
          headers: getRequestHeaders(),
        }
      );

      await readResponse<unknown>(response);

      setSuccess("Reservation deleted successfully.");

      await fetchReservations();
    } catch (err) {
      console.error("Delete reservation error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not delete reservation."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getUser = (id: number) =>
    users.find((user) => user.id === id);

  const getRoom = (id: number) =>
    rooms.find((room) => room.id === id);

  const getStatusStyle = (status: string) => {
    const value = status?.toLowerCase() || "";

    if (value === "confirmed") {
      return "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400";
    }

    if (value === "checked_in" || value === "checked in") {
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400";
    }

    if (
      value === "checked_out" ||
      value === "checked out" ||
      value === "completed"
    ) {
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }

    if (value === "cancelled") {
      return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400";
    }

    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400";
  };

  const totalReservations = reservations.length;

  const pendingReservations = reservations.filter(
    (reservation) =>
      reservation.status?.toLowerCase() === "pending"
  ).length;

  const confirmedReservations = reservations.filter(
    (reservation) =>
      reservation.status?.toLowerCase() === "confirmed"
  ).length;

  const checkedInReservations = reservations.filter((reservation) => {
    const status = reservation.status?.toLowerCase();

    return status === "checked_in" || status === "checked in";
  }).length;

  const filteredReservations = reservations.filter((reservation) => {
    const user = getUser(reservation.user_id);
    const room = getRoom(reservation.room_id);
    const searchValue = search.toLowerCase().trim();

    return (
      String(reservation.id).includes(searchValue) ||
      String(reservation.user_id).includes(searchValue) ||
      String(reservation.room_id).includes(searchValue) ||
      (user?.full_name || "").toLowerCase().includes(searchValue) ||
      (user?.email || "").toLowerCase().includes(searchValue) ||
      (room?.room_number || "").toLowerCase().includes(searchValue) ||
      (room?.room_type || "").toLowerCase().includes(searchValue) ||
      (reservation.status || "").toLowerCase().includes(searchValue)
    );
  });

  const customerUsers = users.filter(
    (user) => user.role?.toLowerCase() === "customer"
  );

  const availableRoomsForBooking = rooms.filter(
    (room) => room.status?.toLowerCase() === "available"
  );

  return (
    <div className="min-h-screen bg-white text-[#1E1B4B] dark:bg-[#0F0B1F] dark:text-white">
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-purple-100 bg-[#F5F3FF] dark:border-[#31265A] dark:bg-[#18132D]">
        <div className="flex h-20 items-center border-b border-purple-100 px-6 dark:border-[#31265A]">
          <div>
            <h1 className="text-2xl font-bold text-[#6D28D9]">
              Growth Lodge
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Admin Panel
            </p>
          </div>
        </div>

        <nav className="p-4">
          {[
            { href: "/admin", label: "Dashboard" },
            { href: "/admin/rooms", label: "Rooms" },
            { href: "/admin/reservations", label: "Reservations" },
            { href: "/admin/guests", label: "Guests" },
            { href: "/admin/staff", label: "Staff" },
            { href: "/admin/payments", label: "Payments" },
            { href: "/admin/reports", label: "Reports" },
            { href: "/admin/settings", label: "Settings" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-2 block rounded-xl px-4 py-3 text-sm font-medium ${
                item.href === "/admin/reservations"
                  ? "bg-[#6D28D9] text-white"
                  : "hover:bg-purple-100 dark:hover:bg-[#31265A]"
              }`}
            >
              {item.label}
            </Link>
          ))}

          <div className="my-4 border-t border-purple-100 dark:border-[#31265A]" />

          <Link
            href="/signin"
            className="block rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            🚪 Sign Out
          </Link>
        </nav>
      </aside>

      <main className="ml-64 min-h-screen">
        <header className="flex min-h-20 items-center justify-between gap-4 border-b border-purple-100 px-8 py-4 dark:border-[#31265A]">
          <div>
            <h2 className="text-2xl font-bold">Reservations</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage hotel reservations
            </p>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <button
              onClick={() => {
                setError("");
                setSuccess("");
                resetReservationForm();
                setShowModal(true);
              }}
              className="rounded-xl bg-[#6D28D9] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5B21B6]"
            >
              + New Reservation
            </button>
          </div>
        </header>

        <section className="p-8">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-400">
              {success}
            </div>
          )}

          <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">
            {[
              {
                label: "Total Reservations",
                value: totalReservations,
                color: "text-[#6D28D9]",
              },
              {
                label: "Pending",
                value: pendingReservations,
                color: "text-yellow-600",
              },
              {
                label: "Confirmed",
                value: confirmedReservations,
                color: "text-green-600",
              },
              {
                label: "Checked In",
                value: checkedInReservations,
                color: "text-blue-600",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {card.label}
                </p>
                <h3 className={`mt-2 text-3xl font-bold ${card.color}`}>
                  {card.value}
                </h3>
              </div>
            ))}
          </div>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Search reservations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 outline-none focus:border-[#6D28D9] dark:border-[#31265A] dark:bg-[#18132D]"
            />

            <button
              onClick={() => void loadAllData(true)}
              disabled={refreshing}
              className="rounded-xl border border-purple-200 bg-white px-5 py-3 text-sm font-semibold text-[#6D28D9] hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#31265A] dark:bg-[#18132D] dark:hover:bg-[#31265A]"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F5F3FF] dark:bg-[#0F0B1F]">
                  <tr>
                    {[
                      "ID",
                      "Guest",
                      "Room",
                      "Check In",
                      "Check Out",
                      "Guests",
                      "Status",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-6 py-4 text-sm font-semibold"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        Loading reservations...
                      </td>
                    </tr>
                  ) : filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <p className="font-semibold">No reservations yet</p>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Your reservation list is empty. Add rooms and customer
                          accounts, then create your first reservation.
                        </p>
                        <button
                          onClick={() => {
                            setError("");
                            setSuccess("");
                            resetReservationForm();
                            setShowModal(true);
                          }}
                          className="mt-4 rounded-xl bg-[#6D28D9] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5B21B6]"
                        >
                          + Create First Reservation
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((reservation) => {
                      const user = getUser(reservation.user_id);
                      const room = getRoom(reservation.room_id);

                      return (
                        <tr
                          key={reservation.id}
                          className="border-t border-purple-100 dark:border-[#31265A]"
                        >
                          <td className="px-6 py-4 text-sm">
                            #{reservation.id}
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-medium">
                              {user?.full_name ||
                                `User #${reservation.user_id}`}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {user?.email || ""}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-sm">
                            <div>
                              {room?.room_number ||
                                `Room #${reservation.room_id}`}
                            </div>
                            {room?.room_type && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {room.room_type}
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm">
                            {reservation.check_in}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {reservation.check_out}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {reservation.guests}
                          </td>

                          <td className="px-6 py-4">
                            <select
                              value={reservation.status}
                              disabled={updatingId === reservation.id}
                              onChange={(e) =>
                                void handleStatusChange(
                                  reservation.id,
                                  e.target.value
                                )
                              }
                              className={`rounded-full border-0 px-3 py-1 text-xs font-semibold outline-none ${getStatusStyle(
                                reservation.status
                              )}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="checked_in">Checked In</option>
                              <option value="checked_out">Checked Out</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>

                          <td className="px-6 py-4">
                            <button
                              onClick={() =>
                                void handleDelete(reservation.id)
                              }
                              disabled={deletingId === reservation.id}
                              className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
                            >
                              {deletingId === reservation.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
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
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-7 shadow-xl dark:bg-[#18132D]">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">New Reservation</h3>

              <button
                onClick={() => {
                  setShowModal(false);
                  resetReservationForm();
                }}
                aria-label="Close reservation form"
                className="text-2xl text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateReservation} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Guest
                </label>

                <select
                  value={newReservation.user_id}
                  onChange={(e) =>
                    setNewReservation({
                      ...newReservation,
                      user_id: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 outline-none focus:border-[#6D28D9] dark:border-[#31265A] dark:bg-[#0F0B1F]"
                >
                  <option value="">Select Guest</option>

                  {customerUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} - {user.email}
                    </option>
                  ))}
                </select>

                {customerUsers.length === 0 && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    No customer accounts yet. Create a customer account before
                    making a reservation.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Room
                </label>

                <select
                  value={newReservation.room_id}
                  onChange={(e) =>
                    setNewReservation({
                      ...newReservation,
                      room_id: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 outline-none focus:border-[#6D28D9] dark:border-[#31265A] dark:bg-[#0F0B1F]"
                >
                  <option value="">Select Room</option>

                  {availableRoomsForBooking.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.room_number} - {room.room_type} - ₦
                      {Number(room.price).toLocaleString()}
                    </option>
                  ))}
                </select>

                {availableRoomsForBooking.length === 0 && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    No available rooms yet. Add a room and set its status to
                    Available first.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Number of Guests
                </label>

                <input
                  type="number"
                  min="1"
                  value={newReservation.guests}
                  onChange={(e) =>
                    setNewReservation({
                      ...newReservation,
                      guests: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 outline-none focus:border-[#6D28D9] dark:border-[#31265A] dark:bg-[#0F0B1F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Check In
                  </label>

                  <input
                    type="date"
                    value={newReservation.check_in}
                    onChange={(e) =>
                      setNewReservation({
                        ...newReservation,
                        check_in: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 outline-none focus:border-[#6D28D9] dark:border-[#31265A] dark:bg-[#0F0B1F]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Check Out
                  </label>

                  <input
                    type="date"
                    value={newReservation.check_out}
                    min={newReservation.check_in || undefined}
                    onChange={(e) =>
                      setNewReservation({
                        ...newReservation,
                        check_out: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 outline-none focus:border-[#6D28D9] dark:border-[#31265A] dark:bg-[#0F0B1F]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Status
                </label>

                <select
                  value={newReservation.status}
                  onChange={(e) =>
                    setNewReservation({
                      ...newReservation,
                      status: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 outline-none focus:border-[#6D28D9] dark:border-[#31265A] dark:bg-[#0F0B1F]"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked_in">Checked In</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetReservationForm();
                  }}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold hover:bg-gray-50 dark:border-[#31265A] dark:hover:bg-[#31265A]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    customerUsers.length === 0 ||
                    availableRoomsForBooking.length === 0
                  }
                  className="rounded-xl bg-[#6D28D9] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5B21B6] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Create Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}