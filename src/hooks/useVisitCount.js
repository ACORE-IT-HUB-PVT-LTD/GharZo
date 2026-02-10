import { useState, useEffect } from "react";

const useVisitCount = () => {
  const [visitCount, setVisitCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchVisitCount = async () => {
    const token = localStorage.getItem("usertoken");
    if (!token) {
      setVisitCount(0);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        "https://api.gharzoreality.com/api/visits/my-requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setVisitCount(data.count || 0);
      } else {
        setVisitCount(0);
      }
    } catch (error) {
      console.error("Error fetching visit count:", error);
      setVisitCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitCount();

    // Listen for visitBooked event to refetch count
    const handleVisitBooked = () => {
      fetchVisitCount();
    };

    window.addEventListener('visitBooked', handleVisitBooked);

    return () => {
      window.removeEventListener('visitBooked', handleVisitBooked);
    };
  }, []);

  return { visitCount, loading, refetch: fetchVisitCount };
};

export default useVisitCount;
