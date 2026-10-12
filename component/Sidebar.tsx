"use client";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-5">
      <h1 className="text-2xl font-bold mb-8">
        Hotel Management
      </h1>

      <nav className="space-y-3">
        <a href="#" className="block p-3 rounded-lg hover:bg-slate-800">
          Dashboard
        </a>

        <a href="#" className="block p-3 rounded-lg hover:bg-slate-800">
          Rooms
        </a>

        <a href="#" className="block p-3 rounded-lg hover:bg-slate-800">
          Bookings
        </a>

        <a href="#" className="block p-3 rounded-lg hover:bg-slate-800">
          Customers
        </a>

        <a href="#" className="block p-3 rounded-lg hover:bg-slate-800">
          Staff
        </a>

        <a href="#" className="block p-3 rounded-lg hover:bg-slate-800">
          Reports
        </a>
      </nav>
    </aside>
  );
}