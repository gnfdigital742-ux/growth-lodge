
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/component/ThemeToggle";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Room = {
  id: number;
  hotel_id?: number;
  room_number: string;
  room_type: string;
  price: number | string;
  status: string;
  description?: string | null;
};

type RoomForm = {
  number: string;
  type: string;
  price: string;
  status: string;
  description: string;
};

const EMPTY_FORM: RoomForm = {
  number: "",
  type: "",
  price: "",
  status: "Available",
  description: "",
};

function getHotelId(): number | null {
  if (typeof window === "undefined") return null;

  const userKeys = [
    "user",
    "currentUser",
    "loggedInUser",
    "authUser",
    "adminUser",
  ];

  for (const key of userKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const user = JSON.parse(raw);
      const id =
        user?.hotel_id ??
        user?.hotelId ??
        user?.hotel?.id;

      const number = Number(id);

      if (Number.isInteger(number) && number > 0) {
        return number;
      }
    } catch {
      // Continue checking other supported storage keys.
    }
  }

  for (const key of [
    "hotel_id",
    "hotelId",
    "growth_lodge_hotel_id",
  ]) {
    const id = Number(localStorage.getItem(key));

    if (Number.isInteger(id) && id > 0) {
      return id;
    }
  }

  return null;
}

function RoomFields({
  form,
  setForm,
}: {
  form: RoomForm;
  setForm: (form: RoomForm) => void;
}) {
  const update = (field: keyof RoomForm, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100";

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1E1B4B]">
          Room Number *
        </label>
        <input
          value={form.number}
          onChange={(e) => update("number", e.target.value)}
          placeholder="e.g. 101"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1E1B4B]">
          Room Type *
        </label>
        <select
          value={form.type}
          onChange={(e) => update("type", e.target.value)}
          className={inputClass}
        >
          <option value="">Select room type</option>
          <option value="Standard">Standard</option>
          <option value="Deluxe">Deluxe</option>
          <option value="Executive">Executive</option>
          <option value="Suite">Suite</option>
          <option value="Royal Suite">Royal Suite</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1E1B4B]">
          Price per Night (₦) *
        </label>
        <input
          type="number"
          min="1"
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
          placeholder="e.g. 50000"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1E1B4B]">
          Status
        </label>
        <select
          value={form.status}
          onChange={(e) => update("status", e.target.value)}
          className={inputClass}
        >
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1E1B4B]">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) =>
            update("description", e.target.value)
          }
          placeholder="Optional room description"
          rows={3}
          className={inputClass}
        />
      </div>
    </div>
  );
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [newRoom, setNewRoom] = useState<RoomForm>({
    ...EMPTY_FORM,
  });
  const [editRoom, setEditRoom] = useState<RoomForm>({
    ...EMPTY_FORM,
  });

  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(
    null
  );

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [hotelMissing, setHotelMissing] = useState(false);
  const [loadProblem, setLoadProblem] = useState(false);

  const getHeaders = (hotelId: number) => ({
    "Content-Type": "application/json",
    "x-hotel-id": String(hotelId),
  });

  // An empty hotel workspace starts with zero rooms.
  // Missing hotel information is not treated as a loading failure.
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError("");
    setLoadProblem(false);

    const hotelId = getHotelId();

    if (!hotelId) {
      setRooms([]);
      setHotelMissing(true);
      setLoading(false);
      return;
    }

    setHotelMissing(false);

    try {
      const response = await fetch(
        `${API_URL}/api/rooms?hotel_id=${hotelId}`,
        {
          method: "GET",
          headers: { "x-hotel-id": String(hotelId) },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        // Handle an empty/uninitialized hotel workspace gracefully.
        if (
          /hotel is required|hotel workspace not found|no rooms found/i.test(
            String(data.message || "")
          )
        ) {
          setRooms([]);
          setHotelMissing(
            /hotel is required|hotel workspace not found/i.test(
              String(data.message || "")
            )
          );
          return;
        }

        throw new Error(
          data.message || "Unable to retrieve the room list."
        );
      }

      setRooms(Array.isArray(data.rooms) ? data.rooms : []);
    } catch (err) {
      console.error("Room list request failed:", err);
      setRooms([]);
      setLoadProblem(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRooms();
  }, [fetchRooms]);

  const validateRoom = (form: RoomForm): number | null => {
    if (!form.number.trim()) {
      setError("Enter a room number.");
      return null;
    }

    if (!form.type.trim()) {
      setError("Select a room type.");
      return null;
    }

    const price = Number(form.price);

    if (!form.price.trim() || !Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price greater than zero.");
      return null;
    }

    return price;
  };

  const handleAddRoom = async () => {
    setMessage("");
    setError("");

    const price = validateRoom(newRoom);
    if (price === null) return;

    const hotelId = getHotelId();

    if (!hotelId) {
      setHotelMissing(true);
      setError(
        "The hotel workspace has not been connected to this admin account. We need to set up the hotel ID before saving rooms."
      );
      return;
    }

    try {
      setAdding(true);

      const response = await fetch(`${API_URL}/api/rooms`, {
        method: "POST",
        headers: getHeaders(hotelId),
        body: JSON.stringify({
          hotel_id: hotelId,
          room_number: newRoom.number.trim(),
          room_type: newRoom.type.trim(),
          price,
          status: newRoom.status,
          description: newRoom.description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save this room.");
      }

      setMessage("Room added successfully.");
      setNewRoom({ ...EMPTY_FORM });
      setShowAddModal(false);
      await fetchRooms();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save this room."
      );
    } finally {
      setAdding(false);
    }
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setEditRoom({
      number: room.room_number || "",
      type: room.room_type || "",
      price: String(room.price ?? ""),
      status: room.status || "Available",
      description: room.description || "",
    });
    setError("");
    setMessage("");
    setShowEditModal(true);
  };

  const handleUpdateRoom = async () => {
    if (!editingRoom) return;

    setError("");
    setMessage("");

    const price = validateRoom(editRoom);
    if (price === null) return;

    const hotelId = getHotelId();

    if (!hotelId) {
      setError("The hotel workspace must be connected before editing rooms.");
      return;
    }

    try {
      setUpdating(true);

      const response = await fetch(
        `${API_URL}/api/rooms/${editingRoom.id}`,
        {
          method: "PUT",
          headers: getHeaders(hotelId),
          body: JSON.stringify({
            hotel_id: hotelId,
            room_number: editRoom.number.trim(),
            room_type: editRoom.type.trim(),
            price,
            status: editRoom.status,
            description: editRoom.description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update this room.");
      }

      setShowEditModal(false);
      setEditingRoom(null);
      setMessage("Room updated successfully.");
      await fetchRooms();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update this room."
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this room?")) {
      return;
    }

    const hotelId = getHotelId();

    if (!hotelId) {
      setError("The hotel workspace must be connected before deleting rooms.");
      return;
    }

    setMessage("");
    setError("");
    setDeletingId(id);

    try {
      const response = await fetch(
        `${API_URL}/api/rooms/${id}?hotel_id=${hotelId}`,
        {
          method: "DELETE",
          headers: { "x-hotel-id": String(hotelId) },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete this room.");
      }

      setMessage("Room deleted successfully.");
      await fetchRooms();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete this room."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const normalizedSearch = search.toLowerCase().trim();

  const filteredRooms = rooms.filter((room) =>
    [
      room.room_number,
      room.room_type,
      room.status,
    ].some((value) =>
      String(value || "").toLowerCase().includes(normalizedSearch)
    )
  );

  const availableRooms = rooms.filter(
    (room) => room.status?.toLowerCase() === "available"
  ).length;

  const occupiedRooms = rooms.filter(
    (room) => room.status?.toLowerCase() === "occupied"
  ).length;

  const maintenanceRooms = rooms.filter((room) =>
    ["maintenance", "under maintenance"].includes(
      room.status?.toLowerCase()
    )
  ).length;

  const statusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-700";
      case "occupied":
        return "bg-orange-100 text-orange-700";
      case "maintenance":
      case "under maintenance":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const closeAddModal = () => {
    if (adding) return;
    setShowAddModal(false);
    setError("");
  };

  const closeEditModal = () => {
    if (updating) return;
    setShowEditModal(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B]">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 bg-[#6D28D9] text-white md:block">
        <div className="flex h-20 items-center px-6">
          <div>
            <h1 className="text-2xl font-bold">Growth Lodge</h1>
            <p className="text-xs text-purple-200">Admin Panel</p>
          </div>
        </div>

        <nav className="px-4 py-4">
          {[
            ["Dashboard", "/admin"],
            ["Rooms", "/admin/rooms"],
            ["Reservations", "/admin/reservations"],
            ["Guests", "/admin/guests"],
            ["Staff", "/admin/staff"],
            ["Payments", "/admin/payments"],
            ["Reports", "/admin/reports"],
            ["Settings", "/admin/settings"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={`mb-2 flex rounded-xl px-4 py-3 text-sm font-medium ${
                href === "/admin/rooms"
                  ? "bg-white font-semibold text-[#6D28D9]"
                  : "text-purple-100 hover:bg-white/10"
              }`}
            >
              {label}
            </Link>
          ))}

          <Link
            href="/signin"
            className="mt-6 flex rounded-xl px-4 py-3 text-sm font-medium text-purple-100 hover:bg-white/10"
          >
            Sign Out
          </Link>
        </nav>
      </aside>

      <main className="min-h-screen md:ml-64">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-100 bg-white px-5 py-5 md:h-20 md:px-8 md:py-0">
          <div>
            <h2 className="text-2xl font-bold">Room Management</h2>
            <p className="text-sm text-gray-500">
              Add and manage your hotel rooms
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => void fetchRooms()}
              disabled={loading}
              className="rounded-xl border border-purple-200 px-4 py-2 text-sm font-medium text-[#6D28D9] hover:bg-purple-50 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={() => {
                setNewRoom({ ...EMPTY_FORM });
                setError("");
                setMessage("");
                setShowAddModal(true);
              }}
              className="rounded-xl bg-[#6D28D9] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5B21B6]"
            >
              + Add Room
            </button>
          </div>
        </header>

        <section className="p-5 md:p-8">
          {message && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && !showAddModal && !showEditModal && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {hotelMissing && !showAddModal && (
            <div className="mb-5 rounded-xl border border-purple-200 bg-purple-50 px-5 py-4 text-sm text-purple-900">
              <p className="font-semibold">Your room list is ready.</p>
              <p className="mt-1 text-sm">
                This workspace currently has no rooms. You can open the
                Add Room form now. Saving rooms requires the hotel
                workspace to be connected to your admin account.
              </p>
            </div>
          )}

          {loadProblem && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
              We could not contact the room service. The list is shown
              as empty for now. Check that your backend is running,
              then select Refresh to try again.
            </div>
          )}

          <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {[
              ["Total Rooms", rooms.length, "text-[#1E1B4B]"],
              ["Available", availableRooms, "text-green-600"],
              ["Occupied", occupiedRooms, "text-orange-500"],
              ["Maintenance", maintenanceRooms, "text-red-600"],
            ].map(([label, count, color]) => (
              <div
                key={String(label)}
                className="rounded-2xl bg-white p-5 shadow-sm md:p-6"
              >
                <p className="text-sm text-gray-500">{label}</p>
                <h3 className={`mt-2 text-3xl font-bold ${color}`}>
                  {count}
                </h3>
              </div>
            ))}
          </div>

          <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search room number, type or status..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-purple-50">
                    {[
                      "Room Number",
                      "Room Type",
                      "Price per Night",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 text-left text-sm font-semibold text-[#1E1B4B]"
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
                        colSpan={5}
                        className="px-6 py-12 text-center text-sm text-gray-500"
                      >
                        Checking your room list...
                      </td>
                    </tr>
                  ) : filteredRooms.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="mx-auto max-w-sm">
                          <div className="mb-3 text-4xl">🛏️</div>
                          <p className="font-semibold text-[#1E1B4B]">
                            {search
                              ? "No rooms match your search."
                              : "No rooms added yet"}
                          </p>
                          <p className="mt-2 text-sm text-gray-500">
                            {search
                              ? "Try another search term."
                              : "Your room count is zero. Add your first room when you're ready."}
                          </p>
                          {!search && (
                            <button
                              onClick={() => {
                                setError("");
                                setShowAddModal(true);
                              }}
                              className="mt-5 rounded-xl bg-[#6D28D9] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5B21B6]"
                            >
                              + Add Your First Room
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRooms.map((room) => (
                      <tr
                        key={room.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-purple-50/50"
                      >
                        <td className="px-5 py-5 text-sm font-semibold">
                          {room.room_number}
                        </td>
                        <td className="px-5 py-5 text-sm text-gray-600">
                          {room.room_type}
                        </td>
                        <td className="px-5 py-5 text-sm font-semibold text-[#6D28D9]">
                          ₦{Number(room.price).toLocaleString()}
                        </td>
                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                              room.status
                            )}`}
                          >
                            {room.status}
                          </span>
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(room)}
                              className="rounded-lg border border-purple-200 px-3 py-2 text-xs font-semibold text-[#6D28D9] hover:bg-purple-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                void handleDeleteRoom(room.id)
                              }
                              disabled={deletingId === room.id}
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId === room.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-8">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl md:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#1E1B4B]">
                  Add New Room
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the room details below.
                </p>
              </div>
              <button
                onClick={closeAddModal}
                disabled={adding}
                aria-label="Close add room form"
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <RoomFields form={newRoom} setForm={setNewRoom} />

            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={closeAddModal}
                disabled={adding}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleAddRoom()}
                disabled={adding}
                className="rounded-xl bg-[#6D28D9] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5B21B6] disabled:opacity-60"
              >
                {adding ? "Saving..." : "Save Room"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-8">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl md:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#1E1B4B]">
                  Edit Room
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Update room {editingRoom.room_number}.
                </p>
              </div>
              <button
                onClick={closeEditModal}
                disabled={updating}
                aria-label="Close edit room form"
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <RoomFields form={editRoom} setForm={setEditRoom} />

            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={closeEditModal}
                disabled={updating}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleUpdateRoom()}
                disabled={updating}
                className="rounded-xl bg-[#6D28D9] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5B21B6] disabled:opacity-60"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}