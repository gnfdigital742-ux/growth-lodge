"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/component/ThemeToggle";

type Room = {
  id: number;
  number: string;
  type: string;
  price: string;
  status: string;
  description: string;
};

export default function StaffRooms() {
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] =
    useState<Room | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/rooms"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch rooms");
        }

        const data = await response.json();

        const roomData = Array.isArray(data)
          ? data
          : data.rooms || [];

        const formattedRooms: Room[] = roomData.map(
          (room: any) => ({
            id: Number(room.id),

            number: String(
              room.room_number ??
                room.number ??
                room.roomNo ??
                "-"
            ),

            type: String(
              room.room_type ??
                room.type ??
                "-"
            ),

            price: `₦${Number(
              room.price ??
                room.price_per_night ??
                room.pricePerNight ??
                0
            ).toLocaleString()}`,

            status: String(
              room.status ??
                "Available"
            ),

            description: String(
              room.description ??
                "No room description available."
            ),
          })
        );

        setRooms(formattedRooms);
      } catch (err) {
        console.error("Rooms fetch error:", err);

        setError(
          "Unable to load rooms from the server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter((room) =>
    `${room.number} ${room.type} ${room.status} ${room.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalRooms = rooms.length;

  const availableRooms = rooms.filter(
    (room) =>
      room.status.toLowerCase() === "available"
  ).length;

  const occupiedRooms = rooms.filter(
    (room) =>
      room.status.toLowerCase() === "occupied"
  ).length;

  const cleaningRooms = rooms.filter(
    (room) =>
      room.status.toLowerCase() === "cleaning"
  ).length;

  const getStatusClass = (status: string) => {
    const normalizedStatus =
      status.toLowerCase();

    if (normalizedStatus === "available") {
      return "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400";
    }

    if (normalizedStatus === "occupied") {
      return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400";
    }

    if (normalizedStatus === "cleaning") {
      return "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400";
    }

    return "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400";
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
            className="mb-1 flex items-center gap-3 rounded-xl bg-purple-50 px-4 py-3 text-sm font-medium text-[#5B21B6] dark:bg-[#241B3D]"
          >
            <span>🛏️</span>
            Rooms
          </Link>

          <Link
            href="/staff/checkin"
            className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-purple-50 hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D]"
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
          {/* Page Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold md:text-3xl">
              Rooms
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Check room availability and current room status.
            </p>
          </div>

          {/* Room Statistics */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Rooms
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {loading ? "..." : totalRooms}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl dark:bg-[#241B3D]">
                  🛏️
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Available
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {loading ? "..." : availableRooms}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl dark:bg-green-950/30">
                  ✓
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Occupied
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {loading ? "..." : occupiedRooms}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-xl dark:bg-red-950/30">
                  🔴
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cleaning
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {loading ? "..." : cleaningRooms}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-xl dark:bg-orange-950/30">
                  🧹
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-semibold">
                  Room List
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  View the current status of hotel rooms.
                </p>
              </div>

              <input
                type="text"
                placeholder="Search room, type or status..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm outline-none focus:border-[#5B21B6] md:w-80 dark:border-[#31265A] dark:bg-[#0F0B1F]"
              />
            </div>
          </div>

          {/* Rooms Table */}
          <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="bg-purple-50 dark:bg-[#241B3D]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase">
                      Room
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase">
                      Type
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase">
                      Price / Night
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
                        Loading rooms...
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
                    filteredRooms.map((room) => (
                      <tr
                        key={room.id}
                        className="border-t border-gray-100 dark:border-[#31265A]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-lg dark:bg-[#241B3D]">
                              🛏️
                            </div>

                            <span className="text-sm font-semibold">
                              Room {room.number}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm">
                          {room.type}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium">
                          {room.price}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              room.status
                            )}`}
                          >
                            {room.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              setSelectedRoom(room)
                            }
                            className="rounded-lg bg-[#5B21B6] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#4C1D95]"
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
              filteredRooms.length === 0 && (
                <div className="p-10 text-center text-sm text-gray-500">
                  No rooms found.
                </div>
              )}
          </div>
        </div>
      </main>

      {/* Room Details Modal */}
      {selectedRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedRoom(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#18132D]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  Room {selectedRoom.number}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Room ID: {selectedRoom.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedRoom(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#241B3D] dark:text-gray-300 dark:hover:bg-[#31265A]"
              >
                ✕
              </button>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-2xl dark:bg-[#241B3D]">
                🛏️
              </div>

              <div>
                <h4 className="text-lg font-bold">
                  {selectedRoom.type}
                </h4>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                    selectedRoom.status
                  )}`}
                >
                  {selectedRoom.status}
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-purple-50 p-4 dark:bg-[#241B3D]">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Room Number
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {selectedRoom.number}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-4 dark:bg-[#241B3D]">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Room Type
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {selectedRoom.type}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-4 dark:bg-[#241B3D]">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Price Per Night
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {selectedRoom.price}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-4 dark:bg-[#241B3D]">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Current Status
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {selectedRoom.status}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-purple-50 p-4 dark:bg-[#241B3D]">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Description
              </p>

              <p className="mt-1 text-sm">
                {selectedRoom.description}
              </p>
            </div>

            <button
              onClick={() => setSelectedRoom(null)}
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