import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, ArrowLeft, Star, Home, Square, Car } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import axios from "axios";
import baseurl from "../../../../BaseUrl";
import SellerScheduleTourBox from "../ScheduleTour/SellerScheduleTour";

const SellPropertyDetail = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams(); // Get dynamic propertyId from URL (e.g., 68c90ce0a7a9c05de7c3cc03)
  const [activeTab, setActiveTab] = useState("overview");
  const [property, setProperty] = useState(null);
  const [images, setImages] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    name: "",
    rating: 0,
    comment: "",
  });

  // Fetch property data from public API
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if propertyId is undefined or empty
        if (!propertyId) {
          throw new Error("Property ID is undefined. Please check the URL or navigation.");
        }

        const response = await axios.get(`${baseurl}api/public/properties/${propertyId}`);

        if (response.data.success && response.data.data?.property) {
          const property = response.data.data.property;
          setProperty(property);

          // Set images from property response (filter invalid ones)
          const validImages = (property.images || []).filter(
            (img) => img?.url && !img.url.includes("undefined")
          ).map(img => img.url);
          setImages(validImages);

          // Set reels if available
          if (response.data.data?.reels) {
            setReels(response.data.data.reels);
          }
        } else {
          throw new Error("Invalid property data received from the server.");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [propertyId]);

  // Load saved reviews from localStorage
  useEffect(() => {
    if (propertyId) {
      const saved = localStorage.getItem(`reviews_${propertyId}`);
      if (saved) {
        setReviews(JSON.parse(saved));
      }
    }
  }, [propertyId]);

  // Save review to localStorage
  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment || newReview.rating === 0) {
      alert("Please fill all fields and select rating!");
      return;
    }
    const updated = [...reviews, newReview];
    setReviews(updated);
    if (propertyId) {
      localStorage.setItem(`reviews_${propertyId}`, JSON.stringify(updated));
    }
    setNewReview({ name: "", rating: 0, comment: "" });
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error || !property) {
    return (
      <div className="text-center py-10 text-red-500">
        Error: {error || "Property not found"}
        <button
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          onClick={() => navigate("/sell-properties")}
        >
          Back to Properties
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT CONTENT */}
      <div className="lg:col-span-2 space-y-6">
        {/* Back Button */}
        <button
          className="flex items-center text-blue-600 mb-2 hover:underline"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> Back
        </button>

        {/* Image Carousel */}
        <div className="rounded-2xl overflow-hidden shadow-lg">
          {images.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              className="w-full h-96"
            >
              {images.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <img
                    src={img.startsWith('http') ? img : `${baseurl}${img}`}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-96 object-cover"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/800x600")}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
              <img
                src="https://via.placeholder.com/800x600"
                alt="No images available"
                className="w-48 h-48 object-cover"
              />
            </div>
          )}
        </div>

        {/* Title & Address */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
          <p className="flex items-center text-gray-600 mb-2">
            <MapPin className="mr-2 text-red-500 h-5 w-5" />
            {`${property.address}, ${property.city}, ${property.state} ${property.pinCode}`}
          </p>
          <div className="flex items-center gap-2">
            <Star className="text-yellow-500 h-5 w-5" />
            <span className="text-gray-700 font-medium">
              {property.ratingSummary.averageRating.toFixed(1)} / 5 (
              {property.ratingSummary.totalRatings} reviews)
            </span>
          </div>
        </div>

        {/* Overview Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
          <div className="bg-gray-100 p-3 rounded-xl text-center">
            <Home className="mx-auto text-blue-600 h-6 w-6" />
            <p className="text-sm mt-1">{property.type}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-xl text-center">
            <Square className="mx-auto text-green-600 h-6 w-6" />
            <p className="text-sm mt-1">{property.totalCapacity} Capacity</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-xl text-center">
            <Car className="mx-auto text-purple-600 h-6 w-6" />
            <p className="text-sm mt-1">Parking Info N/A</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-xl text-center">
            <Home className="mx-auto text-orange-600 h-6 w-6" />
            <p className="text-sm mt-1">{property.landmark}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b flex gap-6">
          {["overview", "gallery", "rooms", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 capitalize font-medium ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "overview" && (
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="text-xl font-semibold mb-2">Property Description</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.length > 0 ? (
                images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.startsWith('http') ? img : `${baseurl}${img}`}
                    alt={`Gallery ${idx}`}
                    className="rounded-lg shadow"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No images available.
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {/* Review Form */}
              <form
                onSubmit={handleAddReview}
                className="bg-white rounded-xl shadow p-5"
              >
                <h2 className="text-lg font-semibold mb-3">Add a Review</h2>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full border rounded p-2 mb-3"
                  value={newReview.name}
                  onChange={(e) =>
                    setNewReview({ ...newReview, name: e.target.value })
                  }
                />
                <textarea
                  placeholder="Your Comment"
                  className="w-full border rounded p-2 mb-3"
                  rows="3"
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                />

                {/* Rating Stars */}
                <div className="flex items-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      onClick={() =>
                        setNewReview({ ...newReview, rating: star })
                      }
                      className={`h-6 w-6 cursor-pointer ${
                        newReview.rating >= star
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-400"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Submit Review
                </button>
              </form>

              {/* Reviews List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">User Reviews</h3>
                {reviews.length === 0 ? (
                  <p className="text-gray-500">No reviews yet.</p>
                ) : (
                  reviews.map((r, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 border rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{r.name}</p>
                        <div className="flex">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 text-yellow-500 fill-yellow-500"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 mt-2">{r.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "rooms" && (
            <p className="text-gray-500">Rooms detail coming soon...</p>
          )}
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="lg:sticky lg:top-24 h-fit space-y-6">
        <SellerScheduleTourBox />

        {/* Manager Info */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-3">Area Manager</h2>
          <div className="flex items-center gap-3">
            <img
              src="https://source.unsplash.com/100x100/?person"
              alt="Manager"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900">{property.ownerName}</p>
              <p className="text-sm text-gray-500">contact@example.com</p>
              <p className="text-sm text-gray-500">{property.contactNumber}</p>
            </div>
          </div>
        </div>

        {/* Pricing Box (Price not in API, using placeholder) */}
       
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center lg:hidden">
        <span className="text-xl font-bold text-blue-700">Price: Contact for Details</span>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
          I&apos;m Interested
        </button>
      </div>
    </div>
  );
};

export default SellPropertyDetail;