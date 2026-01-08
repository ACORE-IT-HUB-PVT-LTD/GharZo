import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";

function ExploreCities() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const cities = [
    {
      id: 1,
      name: "Rajwada",
      description: "Historic area famous for Rajwada Palace and local markets.",
      image:
        "https://i.pinimg.com/736x/9b/03/57/9b0357e5e8a16af898e492e75192f7b7.jpg",
    },
    {
      id: 2,
      name: "Vijay Nagar",
      description:"A modern area with malls, offices, and good connectivity.",
      image:
        "https://i.pinimg.com/736x/5d/37/da/5d37da5c6d71701f213a392418647c59.jpg",
    },
    {
      id: 3,
      name: "Station",
      description:  "Central area with railway station and public transport.",
      image:
        "https://www.addressofchoice.com/aoc_assets/elevation/68271/1653477187_e1.jpg",
    },
    {
      id: 4,
      name: "LIG",
      description: "Peaceful residential area with daily facilities nearby.",
      image:
        "https://i.pinimg.com/1200x/79/ca/73/79ca739016fa63e9e7ffb6d7f1d9eeda.jpg",
    },
  ];

  const handleCityClick = (cityName) => {
    const destination = `/toparea?city=${encodeURIComponent(cityName)}`;
    if (isAuthenticated) {
      navigate(destination);
    } else {
      navigate("/login", { state: { from: destination } });
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900">
            <span className="bg-gradient-to-b from-[#0c2344] to-[#0b4f91] bg-clip-text text-transparent">
              Explore Areas
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Discover properties in top areas tailored for lifestyle, work, and comfort.
          </p>
          <div className="w-32 h-1.5 bg-gradient-to-b from-[#0c2344] to-[#0b4f91] mx-auto mt-8 rounded-full" />
        </div>

        {/* Compact City Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cities.map((city) => (
            <div
              key={city.id}
              onClick={() => handleCityClick(city.name)}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl cursor-pointer overflow-hidden transition-all duration-500 hover:-translate-y-3"
            >
              {/* Image on Top */}
              <div className="relative overflow-hidden">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Content Below */}
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {city.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {city.description}
                </p>

                {/* Explore Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCityClick(city.name);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-b from-[#0c2344] to-[#0b4f91] text-white font-semibold rounded-full shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Explore →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ExploreCities;