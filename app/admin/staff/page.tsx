"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Staff = {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at?: string;
  status?: string;
  is_active?: number | boolean;
};

type StaffResponse = {
  success?: boolean;
  message?: string;
  staff?: Staff[];
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
      const id =
        user?.hotel_id ??
        user?.hotelId ??
        user?.hotel?.id;

      if (
        id !== undefined &&
        id !== null &&
        String(id).trim()
      ) {
        return String(id).trim();
      }
    } catch {
      // Ignore values that are not JSON.
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

async function parseResponse<T>(
  response: Response
): Promise<T> {
  let data: T & {
    success?: boolean;
    message?: string;
  };

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `The server returned an invalid response (${response.status}).`
    );
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || `Request failed (${response.status}).`
    );
  }

  return data;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [newStaff, setNewStaff] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/staff`, {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
      });

      const data = await parseResponse<StaffResponse>(response);

      setStaff(Array.isArray(data.staff) ? data.staff : []);
    } catch (err) {
      console.error("Load staff error:", err);
      setStaff([]);

      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  const handleAddStaff = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!getHotelId()) {
      setError(
        "Hotel workspace not found. Please sign in again and ensure your account has a hotel ID."
      );
      return;
    }

    if (
      !newStaff.full_name.trim() ||
      !newStaff.email.trim() ||
      !newStaff.phone.trim() ||
      !newStaff.password ||
      !newStaff.confirmPassword
    ) {
      setError("Please fill in all staff information.");
      return;
    }

    if (newStaff.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (newStaff.password !== newStaff.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: getHeaders(true),
          body: JSON.stringify({
            full_name: newStaff.full_name.trim(),
            email: newStaff.email.trim(),
            phone: newStaff.phone.trim(),
            password: newStaff.password,
            role: "staff",
          }),
        }
      );

      const data = await parseResponse<{
        success?: boolean;
        message?: string;
      }>(response);

      setNewStaff({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      setShowModal(false);
      setMessage(
        data.message || "Staff account created successfully."
      );

      await loadStaff();
    } catch (err) {
      console.error("Add staff error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not create the staff account."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: Staff) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${member.full_name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    if (!getHotelId()) {
      setError(
        "Hotel workspace not found. Please sign in again and ensure your account has a hotel ID."
      );
      return;
    }

    try {
      setDeletingId(member.id);

      const response = await fetch(
        `${API_URL}/api/auth/users/${member.id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const data = await parseResponse<{
        success?: boolean;
        message?: string;
      }>(response);

      setMessage(
        data.message || "Staff member deleted successfully."
      );

      await loadStaff();
    } catch (err) {
      console.error("Delete staff error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not delete staff member."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const totalStaff = staff.length;

  const activeStaff = staff.filter((member) => {
    if (member.is_active !== undefined) {
      return (
        member.is_active === true ||
        Number(member.is_active) === 1
      );
    }

    if (member.status) {
      return member.status.toLowerCase() === "active";
    }

    return true;
  }).length;

  const inactiveStaff = totalStaff - activeStaff;

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100";

  return (
    <main className="min-h-screen bg-[#F5F3FF] p-6 text-[#1E1B4B] md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a
              href="/admin"
              className="text-sm font-medium text-purple-600 hover:text-purple-800"
            >
              Growth Lodge Admin
            </a>

            <h1 className="mt-2 text-3xl font-bold">
              Staff Management
            </h1>

            <p className="mt-2 text-gray-500">
              Manage hotel staff and staff accounts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setMessage("");
              setError("");
              setShowModal(true);
            }}
            className="rounded-xl bg-[#6D28D9] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#5B21B6]"
          >
            + Add Staff
          </button>
        </header>

        {/* MESSAGES */}
        {message && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        {/* STATISTICS */}
        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Staff</p>
            <h2 className="mt-2 text-3xl font-bold">
              {totalStaff}
            </h2>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Active Staff</p>
            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {activeStaff}
            </h2>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Inactive Staff</p>
            <h2 className="mt-2 text-3xl font-bold text-red-500">
              {inactiveStaff}
            </h2>
          </div>
        </section>

        {/* STAFF TABLE */}
        <section className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">
                Staff Members
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Staff accounts registered in the database.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadStaff()}
              disabled={loading}
              className="rounded-xl border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-50 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="bg-[#F5F3FF]">
                <tr className="text-left text-sm text-gray-500">
                  <th className="px-6 py-4 font-semibold">Staff</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Phone</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading && staff.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Loading staff...
                    </td>
                  </tr>
                ) : staff.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No staff members found. Select Add Staff to create
                      the first staff account.
                    </td>
                  </tr>
                ) : (
                  staff.map((member) => {
                    const isActive =
                      member.is_active !== undefined
                        ? member.is_active === true ||
                          Number(member.is_active) === 1
                        : member.status
                          ? member.status.toLowerCase() === "active"
                          : true;

                    return (
                      <tr
                        key={member.id}
                        className="border-t border-gray-100 transition hover:bg-purple-50/40"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">
                              {member.full_name
                                ?.charAt(0)
                                .toUpperCase() || "S"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {member.full_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Staff #{member.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                            {member.role || "Staff"}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-gray-600">
                          {member.email}
                        </td>

                        <td className="px-6 py-5 text-gray-600">
                          {member.phone || "—"}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <button
                            type="button"
                            onClick={() => void handleDelete(member)}
                            disabled={deletingId === member.id}
                            className="font-medium text-red-500 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === member.id
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
        </section>
      </div>

      {/* ADD STAFF MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-6 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#1E1B4B]">
                  Add New Staff
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Create a staff account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={saving}
                aria-label="Close form"
                className="text-2xl text-gray-400 hover:text-gray-700 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newStaff.full_name}
                  onChange={(e) =>
                    setNewStaff({
                      ...newStaff,
                      full_name: e.target.value,
                    })
                  }
                  placeholder="Enter full name"
                  required
                  autoComplete="name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) =>
                    setNewStaff({
                      ...newStaff,
                      email: e.target.value,
                    })
                  }
                  placeholder="staff@example.com"
                  required
                  autoComplete="email"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) =>
                    setNewStaff({
                      ...newStaff,
                      phone: e.target.value,
                    })
                  }
                  placeholder="08012345678"
                  required
                  autoComplete="tel"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  value={newStaff.password}
                  onChange={(e) =>
                    setNewStaff({
                      ...newStaff,
                      password: e.target.value,
                    })
                  }
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={newStaff.confirmPassword}
                  onChange={(e) =>
                    setNewStaff({
                      ...newStaff,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-[#6D28D9] px-4 py-3 font-semibold text-white transition hover:bg-[#5B21B6] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Creating..." : "Create Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}