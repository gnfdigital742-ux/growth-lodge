export default function FeaturesPage() {
  const features = [
    {
      icon: "🏨",
      title: "Hotel Administration",
      description:
        "Manage your hotel's core information, settings, departments, and daily administrative activities from one organized platform.",
      items: [
        "Hotel profile management",
        "Departments and operations",
        "Hotel settings",
        "Administrative controls",
      ],
    },
    {
      icon: "🛏️",
      title: "Room Management",
      description:
        "Keep complete control of your rooms, room types, availability, pricing, and current room status.",
      items: [
        "Room registration",
        "Room categories",
        "Room availability",
        "Room status tracking",
      ],
    },
    {
      icon: "📅",
      title: "Reservations",
      description:
        "Manage reservations efficiently and keep track of upcoming, active, completed, and cancelled bookings.",
      items: [
        "Reservation management",
        "Check-in and check-out",
        "Booking status",
        "Reservation history",
      ],
    },
    {
      icon: "👥",
      title: "Guest Management",
      description:
        "Keep guest information organized and easily accessible while maintaining a clear history of guest activities.",
      items: [
        "Guest profiles",
        "Guest information",
        "Stay history",
        "Guest records",
      ],
    },
    {
      icon: "👨‍💼",
      title: "Staff Management",
      description:
        "Organize your hotel team, manage staff accounts, assign responsibilities, and control access based on roles.",
      items: [
        "Staff accounts",
        "Roles and permissions",
        "Staff information",
        "Department assignments",
      ],
    },
    {
      icon: "💳",
      title: "Payments & Finance",
      description:
        "Keep track of hotel payments, outstanding balances, transactions, and other important financial activities.",
      items: [
        "Payment tracking",
        "Transaction records",
        "Outstanding balances",
        "Financial overview",
      ],
    },
    {
      icon: "📊",
      title: "Reports & Analytics",
      description:
        "Turn hotel information into useful insights that help management understand performance and make better decisions.",
      items: [
        "Hotel performance",
        "Occupancy reports",
        "Revenue information",
        "Operational reports",
      ],
    },
    {
      icon: "🔔",
      title: "Notifications & Communication",
      description:
        "Help hotel teams stay informed with important updates, notifications, and communication across the platform.",
      items: [
        "System notifications",
        "Important updates",
        "Staff communication",
        "Reservation alerts",
      ],
    },
    {
      icon: "🔐",
      title: "Security & Access Control",
      description:
        "Protect hotel information by giving users access according to their responsibilities and assigned roles.",
      items: [
        "Role-based access",
        "User authentication",
        "Permission management",
        "Secure account access",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-white text-[#1E1B4B]">

      {/* ================= NAVIGATION ================= */}
      <nav className="border-b border-purple-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          {/* Logo */}
          <a
            href="/"
            className="text-2xl font-bold tracking-tight text-[#5B21B6]"
          >
            Growth Lodge
          </a>

          {/* Navigation */}
          <div className="hidden items-center gap-8 md:flex">

            <a
              href="/"
              className="font-medium text-gray-600 transition hover:text-[#5B21B6]"
            >
              Home
            </a>

            <a
              href="/about"
              className="font-medium text-gray-600 transition hover:text-[#5B21B6]"
            >
              About Us
            </a>

            <a
              href="/features"
              className="font-medium text-[#5B21B6]"
            >
              Features
            </a>

            <a
              href="/packages"
              className="font-medium text-gray-600 transition hover:text-[#5B21B6]"
            >
              Packages
            </a>

            <a
              href="/contact"
              className="font-medium text-gray-600 transition hover:text-[#5B21B6]"
            >
              Contact Us
            </a>

            <a
              href="/signin"
              className="rounded-lg bg-[#5B21B6] px-6 py-3 font-semibold text-white transition hover:bg-[#4C1D95]"
            >
              Sign In
            </a>

          </div>

          {/* Mobile Button */}
          <button
            type="button"
            className="rounded-lg border border-purple-200 px-3 py-2 text-xl text-[#5B21B6] md:hidden"
          >
            ☰
          </button>

        </div>
      </nav>


      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#5B21B6] via-[#6D28D9] to-[#A78BFA] px-6 py-24 text-white">

        {/* Decorative Shapes */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-white/10" />

        <div className="relative mx-auto max-w-5xl text-center">

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-purple-100">
            Growth Lodge Features
          </p>

          <h1 className="mt-5 text-5xl font-bold leading-tight md:text-6xl">
            Everything Your Hotel
            <span className="block text-[#F5F3FF]">
              Needs in One Platform
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-purple-50 md:text-xl">
            From rooms and reservations to staff, guests, payments,
            reports, and security, Growth Lodge brings essential hotel
            operations together in one powerful system.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">

            <a
              href="/contact"
              className="rounded-lg bg-white px-8 py-4 font-semibold text-[#5B21B6] shadow-lg transition hover:bg-[#F5F3FF]"
            >
              Get Started
            </a>

            <a
              href="/packages"
              className="rounded-lg border-2 border-white px-8 py-4 font-semibold text-white transition hover:bg-white hover:text-[#5B21B6]"
            >
              View Packages
            </a>

          </div>

        </div>

      </section>


      {/* ================= FEATURE OVERVIEW ================= */}
      <section className="bg-white px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#7C3AED]">
              Powerful Hotel Tools
            </p>

            <h2 className="mt-4 text-4xl font-bold text-[#1E1B4B] md:text-5xl">
              Manage Every Part of Your Hotel
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              Growth Lodge provides connected tools designed to help
              hotel owners, administrators, managers, and staff work
              more efficiently.
            </p>

          </div>


          {/* Feature Cards */}
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {features.map((feature) => (

              <div
                key={feature.title}
                className="group rounded-2xl border border-purple-100 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#A78BFA] hover:shadow-xl"
              >

                {/* Icon */}
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F3FF] text-3xl transition group-hover:bg-[#5B21B6]">
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="mt-6 text-2xl font-bold text-[#1E1B4B]">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mt-4 leading-7 text-gray-600">
                  {feature.description}
                </p>

                {/* Feature List */}
                <div className="mt-6 border-t border-gray-100 pt-5">

                  <ul className="space-y-3">

                    {feature.items.map((item) => (

                      <li
                        key={item}
                        className="flex items-center gap-3 text-sm text-gray-600"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F5F3FF] text-xs font-bold text-[#5B21B6]">
                          ✓
                        </span>

                        {item}
                      </li>

                    ))}

                  </ul>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ================= ROLE MANAGEMENT ================= */}
      <section className="bg-[#F5F3FF] px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="grid items-center gap-14 lg:grid-cols-2">

            {/* Content */}
            <div>

              <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#7C3AED]">
                Role-Based Management
              </p>

              <h2 className="mt-4 text-4xl font-bold leading-tight text-[#1E1B4B] md:text-5xl">
                Give Every Team Member
                <span className="text-[#5B21B6]">
                  {" "}the Right Access
                </span>
              </h2>

              <p className="mt-6 leading-8 text-gray-600">
                Growth Lodge is designed around different hotel roles.
                Each user can access the tools and information needed
                to perform their responsibilities.
              </p>

              <div className="mt-8 space-y-4">

                {[
                  ["👑", "Administrator", "Manage the hotel platform, users, settings, and overall operations."],
                  ["👨‍💼", "Hotel Staff", "Access the tools required for daily hotel activities."],
                  ["👤", "Customers / Guests", "Interact with the hotel services and relevant information."],
                ].map(([icon, title, text]) => (

                  <div
                    key={title}
                    className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm"
                  >

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#5B21B6] text-xl">
                      {icon}
                    </div>

                    <div>
                      <h3 className="font-bold text-[#1E1B4B]">
                        {title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {text}
                      </p>
                    </div>

                  </div>

                ))}

              </div>

            </div>


            {/* Dashboard Preview */}
            <div className="rounded-3xl bg-gradient-to-br from-[#5B21B6] to-[#A78BFA] p-5 shadow-xl">

              <div className="rounded-2xl bg-white p-6">

                <div className="flex items-center justify-between border-b border-gray-100 pb-5">

                  <div>
                    <p className="text-sm text-gray-500">
                      Growth Lodge
                    </p>

                    <h3 className="text-xl font-bold text-[#1E1B4B]">
                      Hotel Management
                    </h3>
                  </div>

                  <div className="rounded-full bg-[#F5F3FF] px-4 py-2 text-sm font-semibold text-[#5B21B6]">
                    Secure
                  </div>

                </div>


                <div className="mt-6 space-y-4">

                  <div className="rounded-xl bg-[#F5F3FF] p-5">

                    <div className="flex items-center justify-between">

                      <span className="font-semibold text-[#1E1B4B]">
                        Room Management
                      </span>

                      <span className="text-sm font-semibold text-green-600">
                        Active
                      </span>

                    </div>

                  </div>


                  <div className="rounded-xl bg-[#F5F3FF] p-5">

                    <div className="flex items-center justify-between">

                      <span className="font-semibold text-[#1E1B4B]">
                        Reservations
                      </span>

                      <span className="text-sm font-semibold text-[#5B21B6]">
                        Active
                      </span>

                    </div>

                  </div>


                  <div className="rounded-xl bg-[#F5F3FF] p-5">

                    <div className="flex items-center justify-between">

                      <span className="font-semibold text-[#1E1B4B]">
                        Staff Management
                      </span>

                      <span className="text-sm font-semibold text-[#7C3AED]">
                        Active
                      </span>

                    </div>

                  </div>


                  <div className="rounded-xl bg-[#F5F3FF] p-5">

                    <div className="flex items-center justify-between">

                      <span className="font-semibold text-[#1E1B4B]">
                        Reports
                      </span>

                      <span className="text-sm font-semibold text-[#5B21B6]">
                        Available
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= WHY FEATURES MATTER ================= */}
      <section className="bg-white px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#7C3AED]">
              Built for Hotel Growth
            </p>

            <h2 className="mt-4 text-4xl font-bold text-[#1E1B4B] md:text-5xl">
              More Than Just Management Software
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              Growth Lodge connects people, processes, and information
              so your hotel can operate with greater clarity and
              efficiency.
            </p>

          </div>


          <div className="mt-14 grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl bg-[#F5F3FF] p-8 text-center">

              <div className="text-4xl">
                ⚡
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Save Time
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Reduce unnecessary manual processes and keep important
                hotel information in one place.
              </p>

            </div>


            <div className="rounded-2xl bg-[#F5F3FF] p-8 text-center">

              <div className="text-4xl">
                📈
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Improve Performance
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Use organized information and reports to understand
                operations and improve performance.
              </p>

            </div>


            <div className="rounded-2xl bg-[#F5F3FF] p-8 text-center">

              <div className="text-4xl">
                🤝
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Work Better Together
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Give your hotel teams connected tools that make
                collaboration easier.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-6 py-24 text-white">

        <div className="mx-auto max-w-4xl text-center">

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-purple-200">
            Ready to Get Started?
          </p>

          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            Give Your Hotel a Smarter Way to Work
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-7 text-purple-100">
            Explore Growth Lodge and discover the tools designed to
            help your hotel operate more efficiently.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">

            <a
              href="/contact"
              className="rounded-lg bg-white px-8 py-4 font-semibold text-[#5B21B6] transition hover:bg-[#F5F3FF]"
            >
              Get Started
            </a>

            <a
              href="/signin"
              className="rounded-lg border-2 border-white px-8 py-4 font-semibold text-white transition hover:bg-white hover:text-[#5B21B6]"
            >
              Sign In
            </a>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="bg-[#1E1B4B] px-6 py-12 text-white">

        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">

          {/* Brand */}
          <div>

            <h2 className="text-2xl font-bold">
              Growth Lodge
            </h2>

            <p className="mt-4 leading-6 text-purple-200">
              Modern hotel management technology designed to help
              hotels operate smarter and grow.
            </p>

          </div>


          {/* Company */}
          <div>

            <h3 className="font-bold text-[#A78BFA]">
              Company
            </h3>

            <div className="mt-4 space-y-3 text-purple-200">

              <a
                href="/"
                className="block transition hover:text-white"
              >
                Home
              </a>

              <a
                href="/about"
                className="block transition hover:text-white"
              >
                About Us
              </a>

              <a
                href="/features"
                className="block transition hover:text-white"
              >
                Features
              </a>

              <a
                href="/packages"
                className="block transition hover:text-white"
              >
                Packages
              </a>

              <a
                href="/contact"
                className="block transition hover:text-white"
              >
                Contact Us
              </a>

            </div>

          </div>


          {/* Platform */}
          <div>

            <h3 className="font-bold text-[#A78BFA]">
              Platform
            </h3>

            <div className="mt-4 space-y-3 text-purple-200">

              <p>Hotel Administration</p>
              <p>Room Management</p>
              <p>Reservations</p>
              <p>Guest Management</p>
              <p>Staff Management</p>
              <p>Reports & Analytics</p>

            </div>

          </div>


          {/* Contact */}
          <div>

            <h3 className="font-bold text-[#A78BFA]">
              Contact Us
            </h3>

            <div className="mt-4 space-y-3 text-purple-200">

              <p>📧 info@growthlodge.com</p>

              <a
                href="tel:09114545197"
                className="block transition hover:text-white"
              >
                📞 09114545197
              </a>

              <p>📍 Nigeria</p>

            </div>

          </div>

        </div>


        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-sm text-purple-300">
          © 2026 Growth Lodge. All rights reserved.
        </div>

      </footer>

    </main>
  );
}