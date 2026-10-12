const rooms = [
  {
    name: "Deluxe King Room",
    description:
      "A spacious and elegant room designed for a relaxing and comfortable stay.",
    price: "₦85,000",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85",
    amenities: ["King Bed", "Free Wi-Fi", "Breakfast"],
  },
  {
    name: "Executive Suite",
    description:
      "Enjoy extra space, elegant furnishings, and a premium hotel experience.",
    price: "₦120,000",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85",
    amenities: ["King Bed", "Living Area", "Breakfast"],
  },
  {
    name: "Premium Twin Room",
    description:
      "A comfortable choice for friends, colleagues, or guests travelling together.",
    price: "₦75,000",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=85",
    amenities: ["Twin Beds", "Free Wi-Fi", "Room Service"],
  },
  {
    name: "Presidential Suite",
    description:
      "Our most luxurious accommodation, created for an unforgettable stay.",
    price: "₦180,000",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
    amenities: ["King Bed", "Private Lounge", "Premium Service"],
  },
];

export default function FeaturedRooms() {
  return (
    <section id="rooms" className="bg-[#F7F4EE] px-6 py-24">
      <div className="mx-auto max-w-7xl">

        {/* Section Heading */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#C9A24B]">
            Stay With Us
          </p>

          <h2 className="text-4xl font-bold text-[#102A43] md:text-5xl">
            Featured Rooms & Suites
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-gray-600">
            Discover beautifully designed rooms and suites created to give
            every guest comfort, elegance, and a memorable stay.
          </p>
        </div>

        {/* Room Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {rooms.map((room) => (
            <div
              key={room.name}
              className="overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >

              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={room.image}
                  alt={room.name}
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />

                <div className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#102A43] shadow">
                  ⭐ {room.rating}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">

                <h3 className="text-xl font-bold text-[#102A43]">
                  {room.name}
                </h3>

                <p className="mt-3 min-h-[72px] text-sm leading-6 text-gray-600">
                  {room.description}
                </p>

                {/* Amenities */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {room.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-full bg-[#F7F4EE] px-3 py-1 text-xs font-medium text-[#0F4C5C]"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* Price */}
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <p className="text-sm text-gray-500">
                    Starting from
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#0F4C5C]">
                    {room.price}
                    <span className="text-sm font-normal text-gray-500">
                      {" "}
                      / night
                    </span>
                  </p>
                </div>

                {/* Buttons */}
                <div className="mt-5 flex gap-3">
                  <a
                    href="#"
                    className="flex-1 rounded-lg border border-[#0F4C5C] px-3 py-3 text-center text-sm font-semibold text-[#0F4C5C] transition hover:bg-[#0F4C5C] hover:text-white"
                  >
                    View Room
                  </a>

                  <a
                    href="/signin"
                    className="flex-1 rounded-lg bg-[#C9A24B] px-3 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#B38D3B]"
                  >
                    Book Now
                  </a>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}