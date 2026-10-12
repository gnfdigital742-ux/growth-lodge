"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/component/ThemeToggle";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Settings = {
  hotel_name: string;
  hotel_email: string;
  phone: string;
  address: string;
  email_notifications: boolean;
  booking_notifications: boolean;
  payment_notifications: boolean;
  currency: string;
  timezone: string;
  language: string;
};

type AdminUser = {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at?: string;
  hotel_id?: number | string;
  hotelId?: number | string;
};

type StoredUser = {
  id?: number | string;
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  role?: string;
  hotel_id?: number | string;
  hotelId?: number | string;
  hotel?: {
    id?: number | string;
    hotel_id?: number | string;
  };
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  settings?: Partial<Settings>;
  user?: AdminUser;
  data?: {
    settings?: Partial<Settings>;
    user?: AdminUser;
  };
};

function readStoredUser(): StoredUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const keys = [
    "growthLodgeUser",
    "user",
    "currentUser",
    "loggedInUser",
    "authUser",
    "adminUser",
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key);

    if (!value) continue;

    try {
      const parsed = JSON.parse(value);

      if (parsed && typeof parsed === "object") {
        return parsed as StoredUser;
      }
    } catch {
      console.warn(`Could not read stored user from ${key}.`);
    }
  }

  return null;
}

function getHotelId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const storedUser = readStoredUser();

  const candidates = [
    localStorage.getItem("hotel_id"),
    localStorage.getItem("hotelId"),
    localStorage.getItem("growth_lodge_hotel_id"),
    storedUser?.hotel_id,
    storedUser?.hotelId,
    storedUser?.hotel?.id,
    storedUser?.hotel?.hotel_id,
  ];

  for (const candidate of candidates) {
    if (
      candidate !== null &&
      candidate !== undefined &&
      String(candidate).trim() !== ""
    ) {
      return String(candidate).trim();
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

async function parseResponse<T>(
  response: Response
): Promise<T> {
  const text = await response.text();

  let data: ApiResponse = {};

  if (text.trim()) {
    try {
      data = JSON.parse(text) as ApiResponse;
    } catch {
      throw new Error(
        `The server returned an invalid response (${response.status}).`
      );
    }
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message ||
        `Request failed with status ${response.status}.`
    );
  }

  return data as T;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Hotel");

  const [hotelName, setHotelName] = useState("Growth Lodge");
  const [hotelEmail, setHotelEmail] = useState(
    "info@growthlodge.com"
  );
  const [phone, setPhone] = useState("09114545197");
  const [address, setAddress] = useState("Nigeria");

  const [emailNotifications, setEmailNotifications] =
    useState(true);
  const [bookingNotifications, setBookingNotifications] =
    useState(true);
  const [paymentNotifications, setPaymentNotifications] =
    useState(true);

  const [currency, setCurrency] = useState(
    "Nigerian Naira (₦)"
  );
  const [timezone, setTimezone] = useState(
    "West Africa Time (WAT)"
  );
  const [language, setLanguage] = useState("English");

  const [adminId, setAdminId] = useState<number | null>(null);
  const [adminName, setAdminName] = useState("Administrator");
  const [adminEmail, setAdminEmail] = useState(
    "admin@growthlodge.com"
  );
  const [adminPhone, setAdminPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accountSaving, setAccountSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [saved, setSaved] = useState(false);
  const [accountSaved, setAccountSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Load settings and the currently signed-in administrator.
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");
      setNotice("");

      try {
        const storedUser = readStoredUser();
        const storedId = Number(storedUser?.id);

        if (Number.isFinite(storedId) && storedId > 0) {
          setAdminId(storedId);
          setAdminName(
            storedUser?.full_name ||
              storedUser?.name ||
              "Administrator"
          );
          setAdminEmail(storedUser?.email || "");
          setAdminPhone(storedUser?.phone || "");
        }

        const settingsResponse = await fetch(
          `${API_URL}/api/settings`,
          {
            method: "GET",
            headers: getRequestHeaders(),
            cache: "no-store",
          }
        );

        const settingsData =
          await parseResponse<ApiResponse>(settingsResponse);

        if (cancelled) return;

        const settings =
          settingsData.settings ||
          settingsData.data?.settings ||
          {};

        setHotelName(settings.hotel_name || "Growth Lodge");
        setHotelEmail(
          settings.hotel_email || "info@growthlodge.com"
        );
        setPhone(settings.phone || "09114545197");
        setAddress(settings.address || "Nigeria");

        setEmailNotifications(
          settings.email_notifications !== false
        );
        setBookingNotifications(
          settings.booking_notifications !== false
        );
        setPaymentNotifications(
          settings.payment_notifications !== false
        );

        setCurrency(
          settings.currency || "Nigerian Naira (₦)"
        );
        setTimezone(
          settings.timezone || "West Africa Time (WAT)"
        );
        setLanguage(settings.language || "English");

        if (Number.isFinite(storedId) && storedId > 0) {
          try {
            const accountResponse = await fetch(
              `${API_URL}/api/auth/users/${storedId}`,
              {
                method: "GET",
                headers: getRequestHeaders(),
                cache: "no-store",
              }
            );

            const accountData =
              await parseResponse<ApiResponse>(accountResponse);

            if (cancelled) return;

            const user =
              accountData.user || accountData.data?.user;

            if (user) {
              setAdminId(Number(user.id));
              setAdminName(user.full_name || "");
              setAdminEmail(user.email || "");
              setAdminPhone(user.phone || "");
            }
          } catch (accountError) {
            console.error(
              "Could not load administrator account:",
              accountError
            );

            if (!cancelled) {
              setNotice(
                "Hotel settings loaded, but account details could not be refreshed. You can still review the saved account information."
              );
            }
          }
        } else {
          setNotice(
            "Hotel settings loaded. Sign in again if you want to update your administrator account or password."
          );
        }
      } catch (loadError) {
        console.error("Failed to load settings:", loadError);

        if (!cancelled) {
          setError(
            getErrorMessage(loadError) ||
              "Could not load settings from the backend."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  async function saveSettings(
    settingsToSave: Record<string, unknown>
  ) {
    try {
      setSaving(true);
      setError("");
      setNotice("");
      setSaved(false);

      const response = await fetch(
        `${API_URL}/api/settings`,
        {
          method: "PUT",
          headers: getRequestHeaders(true),
          body: JSON.stringify(settingsToSave),
        }
      );

      await parseResponse<ApiResponse>(response);

      setSaved(true);
      setNotice("Settings saved successfully.");
    } catch (saveError) {
      console.error("Failed to save settings:", saveError);
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveHotel() {
    if (!hotelName.trim()) {
      setError("Hotel name is required.");
      return;
    }

    if (!hotelEmail.trim()) {
      setError("Hotel email is required.");
      return;
    }

    await saveSettings({
      hotel_name: hotelName.trim(),
      hotel_email: hotelEmail.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
  }

  async function handleSaveNotifications() {
    await saveSettings({
      email_notifications: emailNotifications,
      booking_notifications: bookingNotifications,
      payment_notifications: paymentNotifications,
    });
  }

  async function handleSaveSystem() {
    await saveSettings({
      currency,
      timezone,
      language,
    });
  }

  async function handleUpdateAccount() {
    if (!adminId) {
      setError(
        "Admin account could not be identified. Please sign in again."
      );
      return;
    }

    if (!adminName.trim() || !adminEmail.trim()) {
      setError("Full name and email are required.");
      return;
    }

    try {
      setAccountSaving(true);
      setError("");
      setNotice("");
      setAccountSaved(false);

      const response = await fetch(
        `${API_URL}/api/auth/users/${adminId}`,
        {
          method: "PUT",
          headers: getRequestHeaders(true),
          body: JSON.stringify({
            full_name: adminName.trim(),
            email: adminEmail.trim(),
            phone: adminPhone.trim(),
          }),
        }
      );

      await parseResponse<ApiResponse>(response);

      const storedUser = readStoredUser();

      if (storedUser) {
        const updatedUser = {
          ...storedUser,
          id: adminId,
          full_name: adminName.trim(),
          email: adminEmail.trim(),
          phone: adminPhone.trim(),
        };

        localStorage.setItem(
          "growthLodgeUser",
          JSON.stringify(updatedUser)
        );
      }

      setAccountSaved(true);
      setNotice("Administrator account updated successfully.");
    } catch (accountError) {
      console.error("Failed to update account:", accountError);
      setError(getErrorMessage(accountError));
    } finally {
      setAccountSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!adminId) {
      setError(
        "Admin account could not be identified. Please sign in again."
      );
      return;
    }

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setError(
        "Your new password must be different from your current password."
      );
      return;
    }

    try {
      setPasswordSaving(true);
      setError("");
      setNotice("");
      setPasswordSaved(false);

      const response = await fetch(
        `${API_URL}/api/auth/users/${adminId}/password`,
        {
          method: "PUT",
          headers: getRequestHeaders(true),
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      await parseResponse<ApiResponse>(response);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordSaved(true);
      setNotice("Password changed successfully.");
    } catch (passwordError) {
      console.error(
        "Failed to change password:",
        passwordError
      );
      setError(getErrorMessage(passwordError));
    } finally {
      setPasswordSaving(false);
    }
  }

  function TabButton({
    name,
    label,
  }: {
    name: string;
    label: string;
  }) {
    return (
      <button
        type="button"
        onClick={() => {
          setActiveTab(name);
          setError("");
          setNotice("");
          setSaved(false);
          setAccountSaved(false);
          setPasswordSaved(false);
        }}
        className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
          activeTab === name
            ? "bg-purple-600 text-white shadow-md"
            : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
        }`}
      >
        {label}
      </button>
    );
  }

  function Toggle({
    enabled,
    onChange,
  }: {
    enabled: boolean;
    onChange: () => void;
  }) {
    return (
      <button
        type="button"
        onClick={onChange}
        aria-pressed={enabled}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled ? "bg-purple-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100";

  const labelClass =
    "mb-2 block text-sm font-semibold text-gray-700";

  const panelClass =
    "max-w-4xl rounded-2xl border border-purple-100 bg-white p-8 shadow-sm";

  const buttonClass =
    "rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B]">
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[#0F0B1F] text-white">
        <div className="border-b border-[#31265A] px-6 py-6">
          <h1 className="text-2xl font-bold">Growth Lodge</h1>
          <p className="mt-1 text-sm text-purple-300">
            Admin Dashboard
          </p>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          {[
            { label: "Dashboard", href: "/admin" },
            { label: "Staff", href: "/admin/staff" },
            { label: "Rooms", href: "/admin/rooms" },
            { label: "Guests", href: "/admin/guests" },
            {
              label: "Reservations",
              href: "/admin/reservations",
            },
            { label: "Payments", href: "/admin/payments" },
            { label: "Reports", href: "/admin/reports" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-[#18132D] hover:text-white"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/admin/settings"
            className="flex items-center rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-md"
          >
            Settings
          </Link>
        </nav>

        <div className="border-t border-[#31265A] p-4">
          <ThemeToggle />
          <Link
            href="/signin"
            className="mt-3 block rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-[#18132D] hover:text-white"
          >
            Sign Out
          </Link>
        </div>
      </aside>

      <main className="ml-64 min-h-screen">
        <header className="border-b border-purple-100 bg-white px-8 py-6">
          <p className="text-sm font-medium text-purple-600">
            Admin / Settings
          </p>

          <h2 className="mt-1 text-3xl font-bold text-[#1E1B4B]">
            Settings
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Manage your hotel information, notifications and
            system settings.
          </p>
        </header>

        <div className="p-8">
          <div className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-purple-100 bg-white p-2 shadow-sm">
            <TabButton name="Hotel" label="Hotel Information" />
            <TabButton
              name="Notifications"
              label="Notifications"
            />
            <TabButton name="Account" label="Account" />
            <TabButton name="Security" label="Security" />
            <TabButton name="System" label="System" />
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 max-w-4xl rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
            >
              {error}
            </div>
          )}

          {notice && !error && (
            <div
              role="status"
              className="mb-6 max-w-4xl rounded-xl border border-purple-200 bg-purple-50 px-5 py-4 text-sm font-medium text-purple-800"
            >
              {notice}
            </div>
          )}

          {activeTab === "Hotel" && (
            <section className={panelClass}>
              <div className="mb-8">
                <h3 className="text-xl font-bold">
                  Hotel Information
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Update the basic information of your hotel.
                </p>
              </div>

              {loading ? (
                <div className="rounded-xl bg-purple-50 p-5 text-sm text-purple-700">
                  Loading hotel settings...
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Hotel Name
                    </label>
                    <input
                      value={hotelName}
                      onChange={(e) =>
                        setHotelName(e.target.value)
                      }
                      className={inputClass}
                      placeholder="Growth Lodge"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={hotelEmail}
                      onChange={(e) =>
                        setHotelEmail(e.target.value)
                      }
                      className={inputClass}
                      placeholder="info@growthlodge.com"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass}
                      placeholder="Hotel phone number"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Hotel Address
                    </label>
                    <input
                      value={address}
                      onChange={(e) =>
                        setAddress(e.target.value)
                      }
                      className={inputClass}
                      placeholder="Hotel address"
                    />
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleSaveHotel}
                  disabled={loading || saving}
                  className={buttonClass}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                {saved && (
                  <span className="text-sm font-semibold text-green-700">
                    Changes saved successfully!
                  </span>
                )}
              </div>
            </section>
          )}

          {activeTab === "Notifications" && (
            <section className={panelClass}>
              <div className="mb-8">
                <h3 className="text-xl font-bold">
                  Notifications
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose which notifications you want to receive.
                </p>
              </div>

              <div className="space-y-5">
                {[
                  {
                    title: "Email Notifications",
                    description:
                      "Receive important updates by email.",
                    enabled: emailNotifications,
                    toggle: () =>
                      setEmailNotifications(
                        !emailNotifications
                      ),
                  },
                  {
                    title: "Booking Notifications",
                    description:
                      "Get notified when reservations are created.",
                    enabled: bookingNotifications,
                    toggle: () =>
                      setBookingNotifications(
                        !bookingNotifications
                      ),
                  },
                  {
                    title: "Payment Notifications",
                    description:
                      "Get notified about payment activity.",
                    enabled: paymentNotifications,
                    toggle: () =>
                      setPaymentNotifications(
                        !paymentNotifications
                      ),
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 p-5"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.description}
                      </p>
                    </div>
                    <Toggle
                      enabled={item.enabled}
                      onChange={item.toggle}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleSaveNotifications}
                  disabled={saving}
                  className={buttonClass}
                >
                  {saving
                    ? "Saving..."
                    : "Save Notifications"}
                </button>
                {saved && (
                  <span className="text-sm font-semibold text-green-700">
                    Notifications saved!
                  </span>
                )}
              </div>
            </section>
          )}

          {activeTab === "Account" && (
            <section className={panelClass}>
              <div className="mb-8">
                <h3 className="text-xl font-bold">
                  Administrator Account
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your administrator account information.
                </p>
              </div>

              {loading ? (
                <div className="rounded-xl bg-purple-50 p-5 text-sm text-purple-700">
                  Loading administrator account...
                </div>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        Full Name
                      </label>
                      <input
                        value={adminName}
                        onChange={(e) =>
                          setAdminName(e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) =>
                          setAdminEmail(e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={adminPhone}
                        onChange={(e) =>
                          setAdminPhone(e.target.value)
                        }
                        className={inputClass}
                        placeholder="Phone number"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Role
                      </label>
                      <input
                        value="Administrator"
                        disabled
                        className={`${inputClass} bg-gray-50 text-gray-500`}
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={handleUpdateAccount}
                      disabled={accountSaving}
                      className={buttonClass}
                    >
                      {accountSaving
                        ? "Updating..."
                        : "Update Account"}
                    </button>

                    {accountSaved && (
                      <span className="text-sm font-semibold text-green-700">
                        Account updated successfully!
                      </span>
                    )}
                  </div>
                </>
              )}
            </section>
          )}

          {activeTab === "Security" && (
            <section className={panelClass}>
              <div className="mb-8">
                <h3 className="text-xl font-bold">Security</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Change your administrator password.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={labelClass}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(e.target.value)
                    }
                    placeholder="Enter current password"
                    className={`${inputClass} max-w-xl`}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    New Password
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    placeholder="At least 8 characters"
                    className={`${inputClass} max-w-xl`}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm new password"
                    className={`${inputClass} max-w-xl`}
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={passwordSaving}
                  className={buttonClass}
                >
                  {passwordSaving
                    ? "Changing..."
                    : "Change Password"}
                </button>

                {passwordSaved && (
                  <span className="text-sm font-semibold text-green-700">
                    Password changed successfully!
                  </span>
                )}
              </div>
            </section>
          )}

          {activeTab === "System" && (
            <section className={panelClass}>
              <div className="mb-8">
                <h3 className="text-xl font-bold">
                  System Settings
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configure general system preferences.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) =>
                      setCurrency(e.target.value)
                    }
                    className={inputClass}
                  >
                    <option>Nigerian Naira (₦)</option>
                    <option>US Dollar ($)</option>
                    <option>British Pound (£)</option>
                    <option>Euro (€)</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Time Zone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) =>
                      setTimezone(e.target.value)
                    }
                    className={inputClass}
                  >
                    <option>West Africa Time (WAT)</option>
                    <option>UTC</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) =>
                      setLanguage(e.target.value)
                    }
                    className={inputClass}
                  >
                    <option>English</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 rounded-xl bg-purple-50 p-5">
                <p className="text-sm font-semibold text-purple-800">
                  Growth Lodge System
                </p>
                <p className="mt-1 text-sm text-purple-600">
                  Frontend Version 1.0.0
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleSaveSystem}
                  disabled={saving}
                  className={buttonClass}
                >
                  {saving
                    ? "Saving..."
                    : "Save System Settings"}
                </button>

                {saved && (
                  <span className="text-sm font-semibold text-green-700">
                    System settings saved!
                  </span>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}