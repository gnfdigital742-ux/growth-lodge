"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/component/ThemeToggle";

type User = {
  id: number;
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
};

type Room = {
  id: number;
  name: string;
  number: string;
  price: number;
  capacity: number;
  description: string;
  amenities: string[];
  available: boolean;
};

type BackendRoom = {
  id: number;
  room_number: string;
  room_type: string;
  price: number;
  status: string;
  description: string;
};

export default function CustomerRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/rooms");

      if (!response.ok) {
        throw new Error("Failed to load rooms");
      }

      const data = await response.json();

      const backendRooms: BackendRoom[] =
        data.rooms || data.data || data || [];

      const formattedRooms: Room[] = backendRooms.map((room) => ({
        id: room.id,
        name: room.room_type,
        number: room.room_number,
        price: Number(room.price),
        capacity: 6,
        description:
          room.description ||
          "A comfortable and well-equipped room for your stay.",
        amenities: [
          "Wi-Fi",
          "TV",
          "Air Conditioning",
          "Breakfast",
        ],
        available:
          room.status.toLowerCase() === "available",
      }));

      setRooms(formattedRooms);
    } catch (error) {
      console.error("Error loading rooms:", error);

      setMessage(
        "Unable to load rooms. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      room.number
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const handleBooking = async () => {
    if (!selectedRoom) return;

    setMessage("");

    // ========================================
    // VALIDATE DATES
    // ========================================

    if (!checkIn || !checkOut) {
      setMessage(
        "Please select both check-in and check-out dates."
      );
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setMessage(
        "Check-out date must be after the check-in date."
      );
      return;
    }

    // ========================================
    // VALIDATE GUESTS
    // ========================================

    const guestCount = Number(guests);

    if (
      !Number.isInteger(guestCount) ||
      guestCount < 1 ||
      guestCount > selectedRoom.capacity
    ) {
      setMessage(
        `This room can accommodate up to ${selectedRoom.capacity} guests.`
      );
      return;
    }

    // ========================================
    // GET LOGGED-IN USER
    // ========================================

    const storedUser =
      localStorage.getItem("growthLodgeUser");

    if (!storedUser) {
      setMessage(
        "Please sign in before making a reservation."
      );
      return;
    }

    let user: User | null = null;

    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error(
        "Could not read logged-in user:",
        error
      );

      setMessage(
        "Your login session is invalid. Please sign in again."
      );
      return;
    }

    // ========================================
    // MAKE SURE USER ID EXISTS
    // ========================================

    if (!user?.id) {
      console.error("Logged-in user has no ID:", user);

      setMessage(
        "Your account information is incomplete. Please sign in again."
      );
      return;
    }

    try {
      setBooking(true);

      // ========================================
      // CREATE RESERVATION
      // ========================================

      const response = await fetch(
        "http://localhost:5000/api/reservations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            room_id: selectedRoom.id,
            check_in: checkIn,
            check_out: checkOut,
            guests: guestCount,
            status: "pending",
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Reservation API response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Booking failed."
        );
      }

      alert(
        "Reservation submitted successfully!"
      );

      // ========================================
      // RESET FORM
      // ========================================

      setSelectedRoom(null);
      setCheckIn("");
      setCheckOut("");
      setGuests("1");
      setMessage("");

      // ========================================
      // GO TO RESERVATIONS
      // ========================================

      window.location.href =
        "/customer/reservations";
    } catch (error) {
      console.error(
        "Booking error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete reservation."
      );
    } finally {
      setBooking(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B] dark:bg-[#0F0B1F] dark:text-white">
      {/* HEADER */}
      <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-purple-100 bg-white dark:border-[#31265A] dark:bg-[#18132D]">
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <Link
            href="/customer"
            className="text-xl font-bold text-[#5B21B6] dark:text-[#A78BFA] md:text-2xl"
          >
            Growth Lodge
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5B21B6] font-semibold text-white">
                C
              </div>

              <div className="hidden lg:block">
                <p className="text-sm font-semibold">
                  Customer
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Guest Account
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className="fixed bottom-0 left-0 top-16 hidden w-64 border-r border-purple-100 bg-white dark:border-[#31265A] dark:bg-[#18132D] md:block">
        <div className="flex h-full flex-col">
          <nav className="flex-1 space-y-2 p-4">
            <Link
              href="/customer"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>🏠</span>
              Dashboard
            </Link>

            <Link
              href="/customer/reservations"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>📅</span>
              My Reservations
            </Link>

            <Link
              href="/customer/rooms"
              className="flex items-center gap-3 rounded-xl bg-[#5B21B6] px-4 py-3 font-semibold text-white"
            >
              <span>🛏️</span>
              Browse Rooms
            </Link>

            <Link
              href="/customer/payments"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>💳</span>
              Payments
            </Link>

            <Link
              href="/customer/profile"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition hover:bg-[#F5F3FF] hover:text-[#5B21B6] dark:text-gray-300 dark:hover:bg-[#241B3D] dark:hover:text-[#A78BFA]"
            >
              <span>👤</span>
              My Profile
            </Link>
          </nav>

          <div className="border-t border-purple-100 p-4 dark:border-[#31265A]">
            <Link
              href="/signin"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 transition hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            >
              <span>🚪</span>
              Sign Out
            </Link>
          </div>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="pt-16 md:ml-64">
        <div className="p-5 md:p-8">
          {/* PAGE HEADER */}
          <div className="mb-8">
            <p className="text-sm font-medium text-[#5B21B6] dark:text-[#A78BFA]">
              Customer Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold md:text-3xl">
              Browse Rooms
            </h1>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Find the perfect room for your stay.
            </p>
          </div>

          {/* MESSAGE */}
          {message && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {message}
            </div>
          )}

          {/* SEARCH */}
          <div className="mb-8 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-[#31265A] dark:bg-[#18132D]">
            <label
              htmlFor="search"
              className="mb-2 block text-sm font-semibold"
            >
              Search Rooms
            </label>

            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by room type or room number..."
              className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-[#1E1B4B] outline-none focus:border-[#5B21B6] focus:ring-2 focus:ring-purple-200 dark:border-[#31265A] dark:bg-[#241B3D] dark:text-white dark:placeholder:text-gray-500"
            />
          </div>

          {/* ROOM COUNT */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Available Rooms
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {filteredRooms.length} room
                {filteredRooms.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="rounded-2xl border border-purple-100 bg-white p-12 text-center dark:border-[#31265A] dark:bg-[#18132D]">
              <div className="text-4xl">
                🛏️
              </div>

              <p className="mt-4 font-semibold">
                Loading rooms...
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Getting the latest rooms from Growth Lodge.
              </p>
            </div>
          )}

          {/* ROOM GRID */}
          {!loading && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-[#31265A] dark:bg-[#18132D]"
                >
                  {/* ROOM IMAGE */}
                  <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[#5B21B6] to-[#A78BFA] text-6xl">
                    🛏️
                  </div>

                  {/* ROOM CONTENT */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold">
                          {room.name}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Room {room.number}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          room.available
                            ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        }`}
                      >
                        {room.available
                          ? "Available"
                          : "Occupied"}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-gray-500 dark:text-gray-400">
                      {room.description}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <span>👥</span>
                      <span>
                        {room.capacity} Guests
                      </span>
                    </div>

                    {/* AMENITIES */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {room.amenities.map(
                        (amenity) => (
                          <span
                            key={amenity}
                            className="rounded-lg bg-[#F5F3FF] px-2.5 py-1 text-xs text-[#5B21B6] dark:bg-[#241B3D] dark:text-[#A78BFA]"
                          >
                            {amenity}
                          </span>
                        )
                      )}
                    </div>

                    {/* PRICE */}
                    <div className="mt-6 flex items-center justify-between border-t border-purple-100 pt-5 dark:border-[#31265A]">
                      <div>
                        <span className="text-2xl font-bold">
                          ₦
                          {room.price.toLocaleString()}
                        </span>

                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          / night
                        </span>
                      </div>

                      <button
                        disabled={!room.available}
                        onClick={() => {
                          setSelectedRoom(room);
                          setMessage("");
                        }}
                        className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
                          room.available
                            ? "bg-[#5B21B6] hover:bg-[#4C1D95]"
                            : "cursor-not-allowed bg-gray-400"
                        }`}
                      >
                        {room.available
                          ? "Book Now"
                          : "Unavailable"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* NO RESULTS */}
          {!loading &&
            filteredRooms.length === 0 && (
              <div className="rounded-2xl border border-purple-100 bg-white p-12 text-center dark:border-[#31265A] dark:bg-[#18132D]">
                <div className="text-5xl">
                  🔍
                </div>

                <h2 className="mt-4 text-xl font-bold">
                  No rooms found
                </h2>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Try searching for another room type.
                </p>
              </div>
            )}
        </div>
      </main>

      {/* BOOKING MODAL */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#18132D]">
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Selected Room
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#5B21B6] dark:text-[#A78BFA]">
                  {selectedRoom.name}
                </h2>
              </div>

              <button
                onClick={() => {
                  setSelectedRoom(null);
                  setMessage("");
                }}
                className="text-2xl text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {/* ROOM */}
              <div className="rounded-xl bg-[#F5F3FF] p-4 dark:bg-[#241B3D]">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Room
                </p>

                <p className="mt-1 font-semibold">
                  Room {selectedRoom.number}
                </p>
              </div>

              {/* DATES */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="checkIn"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Check-in
                  </label>

                  <input
                    id="checkIn"
                    type="date"
                    value={checkIn}
                    onChange={(e) =>
                      setCheckIn(e.target.value)
                    }
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    className="w-full rounded-xl border border-purple-100 px-3 py-3 outline-none focus:border-[#5B21B6] dark:border-[#31265A] dark:bg-[#241B3D]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="checkOut"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Check-out
                  </label>

                  <input
                    id="checkOut"
                    type="date"
                    value={checkOut}
                    onChange={(e) =>
                      setCheckOut(e.target.value)
                    }
                    min={
                      checkIn ||
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    className="w-full rounded-xl border border-purple-100 px-3 py-3 outline-none focus:border-[#5B21B6] dark:border-[#31265A] dark:bg-[#241B3D]"
                  />
                </div>
              </div>

              {/* GUESTS */}
              <div>
                <label
                  htmlFor="guests"
                  className="mb-2 block text-sm font-semibold"
                >
                  Number of Guests
                </label>

                <input
                  id="guests"
                  type="number"
                  min="1"
                  max={selectedRoom.capacity}
                  value={guests}
                  onChange={(e) =>
                    setGuests(e.target.value)
                  }
                  className="w-full rounded-xl border border-purple-100 px-4 py-3 outline-none focus:border-[#5B21B6] dark:border-[#31265A] dark:bg-[#241B3D]"
                />

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Maximum{" "}
                  {selectedRoom.capacity} guests
                </p>
              </div>

              {/* PRICE */}
              <div className="flex items-center justify-between rounded-xl bg-[#F5F3FF] p-4 dark:bg-[#241B3D]">
                <span className="font-semibold">
                  Price per night
                </span>

                <span className="text-xl font-bold text-[#5B21B6] dark:text-[#A78BFA]">
                  ₦
                  {selectedRoom.price.toLocaleString()}
                </span>
              </div>

              {/* ERROR */}
              {message && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                  {message}
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setSelectedRoom(null);
                  setMessage("");
                }}
                disabled={booking}
                className="flex-1 rounded-xl border border-purple-200 px-5 py-3 font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#4B3B78] dark:text-gray-300 dark:hover:bg-[#241B3D]"
              >
                Cancel
              </button>

              <button
                onClick={handleBooking}
                disabled={booking}
                className="flex-1 rounded-xl bg-[#5B21B6] px-5 py-3 font-semibold text-white hover:bg-[#4C1D95] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {booking
                  ? "Booking..."
                  : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}