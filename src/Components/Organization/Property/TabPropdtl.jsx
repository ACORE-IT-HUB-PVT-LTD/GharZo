import { FaBed, FaMapMarkerAlt, FaRupeeSign, FaEdit } from "react-icons/fa";
import baseurl from "../../../../BaseUrl";

const tabList = [
  "Details",
  "Rooms",
  "TenantDues",
  "Tenant",
  "Complaints",
  "PropertyReviews",
  "Announcements",
  "PropertyExpenses",
];

const TabPropdtl = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Details");

  useEffect(() => {
    const fetchProperty = async () => {
      const token = localStorage.getItem("orgToken");
      if (!token) {
        console.error("No token found.");
        return;
      }

      try {
        const res = await fetch(
          `${baseurl}/landlord/property/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        if (data.success && data.property) {
          setProperty(data.property);
        } else {
          console.error("Failed to load property");
        }
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleEdit = () => {
    navigate(`/organization/edit-property/${id}`, { state: { property } });
  };

  if (loading) {
    return (
      <div className="text-center my-10">
        <div className="border-t-4 border-indigo-500 w-10 h-10 rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (!property) {
    return <p className="text-center text-red-500">Property not found.</p>;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "Details":
        return (
          <div>
            {property.images?.length > 0 ? (
              <img
                src={property.images[0]}
                alt={property.name || "Property Image"}
                className="w-full h-64 object-cover rounded mb-4"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded mb-4">
                No Image Available
              </div>
            )}

            <h2 className="text-2xl font-bold text-indigo-700 mb-2">
              {property.name}
            </h2>

            <p className="text-gray-600 mb-1 flex items-center">
              <FaMapMarkerAlt className="mr-2" />
              {property.address}, {property.city}, {property.state} -{" "}
              {property.pinCode}
            </p>

            <p className="text-gray-600 mb-1">
              <FaRupeeSign className="inline-block mr-1" />
              Rent: {property.rent || "N/A"} / month
            </p>

            <p className="text-gray-600 mb-1">
              <FaBed className="inline-block mr-1" />
              Rooms: {property.totalRooms} | Beds: {property.totalBeds}
            </p>

            <p className="text-gray-600 mb-1">
              Type: {property.type} | Furnished:{" "}
              {property.furnished ? "Yes" : "No"}
            </p>

            <p className="mt-4 text-gray-700">{property.description || ""}</p>
          </div>
        );

      case "Rooms":
        return <div>Rooms info goes here...</div>;
      case "TenantDues":
        return <div>TenantDues details go here...</div>
      case "Tenant":
        return <div>Tenant details go here...</div>;
        case "Complaints":
        return <div>Complaints details go here...</div>;
        case "PropertyReviews":
        return <div>Ratings & Reviews details go here...</div>;
        case "Announcements":
        return <div>Announcements details go here...</div>;
        case "PropertyExpenses":
        return <div>Property Expenses details go here...</div>;
        

      default:
        return null;
    }
  };

  return (
    <div className="px-4 py-6 md:px-8 bg-gray-50 min-h-screen">
      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 justify-center">
        {tabList.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? "bg-indigo-600 text-white shadow"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto bg-white shadow rounded p-4">
        {renderTabContent()}

        {activeTab === "Details" && (
          <div className="mt-6 flex justify-between items-center">
            <Link
              to="/landlord/property"
              className="text-indigo-600 hover:underline text-sm"
            >
              ← Back to Properties
            </Link>

            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              <FaEdit />
              Edit Property
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default TabPropdtl;
