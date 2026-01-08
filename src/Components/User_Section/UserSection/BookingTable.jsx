import React from "react";

export default function BookingTable({ bookings }) {
  if (!bookings || bookings.length === 0) {
    return <p className="text-gray-500 mt-4">No bookings available.</p>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-md mt-4">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2">Booking ID</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{b.id}</td>
              <td className="px-4 py-2">{b.date}</td>
              <td className="px-4 py-2">₹{b.amount}</td>
              <td className="px-4 py-2">{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
