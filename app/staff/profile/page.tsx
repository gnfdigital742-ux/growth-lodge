"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/component/ThemeToggle";

type StaffProfile = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
};

export default function StaffProfilePage() {
  const router = useRouter();

  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadStaffProfile();
  }, []);

  const loadStaffProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const savedStaff = localStorage.getItem("growthLodgeStaff");
      let staffId = localStorage.getItem("growthLodgeStaffId");

      if (!staffId && savedStaff) {
        try {
          const parsedStaff = JSON.parse(savedStaff);

          if (parsedStaff?.id) {
            staffId = String(parsedStaff.id);
          }
        } catch {
          console.log("Unable to read saved staff information.");
        }
      }

      if (!staffId) {
        staffId = "2";
        localStorage.setItem("growthLodgeStaffId", "2");
      }

      const response = await fetch(
        `http://localhost:5000/api/auth/users/${staffId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load staff profile."
        );
      }

      const profile: StaffProfile = data.user;

      if (!profile) {
        throw new Error("Staff profile was not returned by the server.");
      }

      setStaff(profile);
      setFullName(profile.full_name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");

      localStorage.setItem(
        "growthLodgeStaff",
        JSON.stringify(profile)
      );

      localStorage.setItem(
        "growthLodgeStaffId",
        String(profile.id)
      );
    } catch (err) {
      console.error("Staff profile error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the Growth Lodge server."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staff) return;

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError("Full name is required.");
      return;
    }

    if (!trimmedEmail) {
      setError("Email address is required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/users/${staff.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: trimmedName,
            email: trimmedEmail,
            phone: trimmedPhone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update profile."
        );
      }

      const updatedProfile: StaffProfile = {
        ...staff,
        full_name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
      };

      setStaff(updatedProfile);
      setFullName(updatedProfile.full_name);
      setEmail(updatedProfile.email);
      setPhone(updatedProfile.phone);

      localStorage.setItem(
        "growthLodgeStaff",
        JSON.stringify(updatedProfile)
      );

      localStorage.setItem(
        "growthLodgeStaffId",
        String(updatedProfile.id)
      );

      setSuccess("Profile updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Update profile error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("growthLodgeStaff");
    localStorage.removeItem("growthLodgeStaffId");
    router.push("/staff/signin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3FF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#A78BFA] border-t-[#6D28D9] rounded-full animate-spin mx-auto mb-4" />

          <p className="text-[#1E1B4B] font-medium">
            Loading staff profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B]">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="w-64 bg-[#1E1B4B] text-white hidden md:flex flex-col">
          <div className="px-6 py-6 border-b border-white/10">
            <h1 className="text-2xl font-bold">
              Growth Lodge
            </h1>

            <p className="text-sm text-purple-200 mt-1">
              Staff Management System
            </p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link
              href="/staff"
              className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
            >
              Dashboard
            </Link>

            <Link
              href="/staff/reservations"
              className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
            >
              Reservations
            </Link>

            <Link
              href="/staff/guests"
              className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
            >
              Guests
            </Link>

            <Link
              href="/staff/rooms"
              className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
            >
              Rooms
            </Link>

            <Link
              href="/staff/checkin"
              className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
            >
              Check-in / Check-out
            </Link>

            <Link
              href="/staff/payments"
              className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
            >
              Payments
            </Link>

            <Link
              href="/staff/profile"
              className="block px-4 py-3 rounded-xl bg-[#6D28D9] font-semibold"
            >
              My Profile
            </Link>
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition text-left"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          <header className="bg-white border-b border-purple-100 px-6 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                My Profile
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Manage your Growth Lodge staff account
              </p>
            </div>

            <ThemeToggle />
          </header>

          <div className="p-6 max-w-5xl mx-auto">

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 px-5 py-4">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-6 rounded-xl bg-green-50 border border-green-200 text-green-700 px-5 py-4">
                {success}
              </div>
            )}

            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">

                <div className="w-20 h-20 rounded-full bg-[#6D28D9] text-white flex items-center justify-center text-3xl font-bold">
                  {fullName
                    ? fullName.charAt(0).toUpperCase()
                    : "S"}
                </div>

                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-bold">
                    {fullName || "Staff Member"}
                  </h3>

                  <p className="text-gray-500 mt-1">
                    {email || "No email available"}
                  </p>

                  <span className="inline-block mt-3 px-3 py-1 rounded-full bg-purple-100 text-[#6D28D9] text-sm font-semibold capitalize">
                    {staff?.role || "Staff"}
                  </span>
                </div>

              </div>
            </div>

            {/* Profile Form */}
            <form
              onSubmit={handleSave}
              className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 mb-6"
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold">
                  Personal Information
                </h3>

                <p className="text-gray-500 text-sm mt-1">
                  Update your staff account information.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Phone Number
                  </label>

                  <input
                    type="text"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Account Role
                  </label>

                  <input
                    type="text"
                    value="Staff"
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
                  />
                </div>

              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>

            {/* Account Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">

              <h3 className="text-xl font-bold mb-2">
                Account Information
              </h3>

              <p className="text-gray-500 text-sm mb-6">
                Information about your Growth Lodge staff account.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Staff ID */}
                <div className="p-4 rounded-xl bg-[#F5F3FF]">
                  <p className="text-sm text-gray-500">
                    Staff ID
                  </p>

                  <p className="font-bold text-lg mt-1">
                    {staff?.id ?? "-"}
                  </p>
                </div>

                {/* Account Type */}
                <div className="p-4 rounded-xl bg-[#F5F3FF]">
                  <p className="text-sm text-gray-500">
                    Account Type
                  </p>

                  <p className="font-bold text-lg mt-1 capitalize">
                    {staff?.role || "Staff"}
                  </p>
                </div>

                {/* Created */}
                <div className="p-4 rounded-xl bg-[#F5F3FF]">
                  <p className="text-sm text-gray-500">
                    Account Created
                  </p>

                  <p className="font-bold text-lg mt-1">
                    {staff?.created_at
                      ? new Date(
                          staff.created_at
                        ).toLocaleDateString()
                      : "-"}
                  </p>
                </div>

              </div>

              {/* Status */}
              <div className="mt-5 p-4 rounded-xl bg-green-50 border border-green-100">
                <p className="text-sm text-gray-500">
                  Account Status
                </p>

                <p className="font-bold text-green-700 mt-1">
                  Active
                </p>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}