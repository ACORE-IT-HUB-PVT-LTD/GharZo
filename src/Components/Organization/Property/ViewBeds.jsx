import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function OrganizationViewBeds() {
  const { propertyId, roomId } = useParams();
  const [beds, setBeds] = useState([]);

  useEffect(() => {
    // Placeholder: Fetch beds for roomId in propertyId
    // setBeds(fetchedBeds);
  }, [propertyId, roomId]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Beds in Room</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {beds.map((bed) => (
          <div key={bed.id} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold">Bed {bed.number}</h2>
            <p>Status: {bed.status || "Available"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrganizationViewBeds;