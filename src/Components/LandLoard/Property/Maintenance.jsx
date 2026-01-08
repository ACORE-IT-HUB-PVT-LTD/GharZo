import React, { useState } from "react";
import { FaMoneyCheckAlt, FaRupeeSign, FaCalendarAlt } from "react-icons/fa";

const Expenses = () => {
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      title: "Electricity Bill - Green Residency",
      amount: "1200",
      date: "2025-08-01",
    },
    {
      id: 2,
      title: "Plumbing Repair - PG Room 2A",
      amount: "850",
      date: "2025-07-28",
    },
    {
      id: 3,
      title: "Water Tanker - Villa 3 Lake View",
      amount: "1500",
      date: "2025-08-02",
    },
    {
      id: 4,
      title: "AC Maintenance - Flat 402 Sky Heights",
      amount: "700",
      date: "2025-07-30",
    },
    {
      id: 5,
      title: "Cleaning Service - Lotus Hostel",
      amount: "600",
      date: "2025-07-27",
    },
  ]);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.date) return;

    const newExpense = {
      ...formData,
      id: Date.now(),
    };

    setExpenses((prev) => [...prev, newExpense]);
    setFormData({ title: "", amount: "", date: "" });
  };

  return (
    <div className="p-0 md:p-6">
      {/* Heading */}
      <h2 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2 text-black">
        <FaMoneyCheckAlt className="text-green-600" /> Expenses
      </h2>
      <p className="text-gray-600 text-sm md:text-base mb-4">
        Record and manage all property-related expenses.
      </p>

      {/* Expense Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 p-4 rounded-lg shadow-md mb-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            name="title"
            placeholder="Expense Title"
            value={formData.title}
            onChange={handleChange}
            className="border bg-gray-50 text-black text-sm md:text-base p-2 rounded w-full focus:ring-2 focus:ring-green-400 outline-none"
            required
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            className="border bg-gray-50 text-black text-sm md:text-base p-2 rounded w-full focus:ring-2 focus:ring-green-400 outline-none"
            required
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border bg-gray-50 text-black text-sm md:text-base p-2 rounded w-full focus:ring-2 focus:ring-green-400 outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-green-400 text-white px-4 py-2 rounded-lg hover:opacity-90 transition text-sm md:text-base"
        >
          Add Expense
        </button>
      </form>

      {/* Expense List */}
      {expenses.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-md">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b text-gray-700">
                  <th className="text-left p-3">Title</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3 text-black">{expense.title}</td>
                    <td className="p-3 font-medium text-green-600 flex items-center gap-1">
                      <FaRupeeSign /> {expense.amount}
                    </td>
                    <td className="p-3 flex items-center gap-2 text-gray-600">
                      <FaCalendarAlt /> {expense.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="block md:hidden divide-y">
            {expenses.map((expense) => (
              <div key={expense.id} className="p-3 flex flex-col gap-2">
                <h3 className="font-semibold text-black">{expense.title}</h3>
                <p className="flex items-center gap-1 text-green-600 text-sm">
                  <FaRupeeSign /> {expense.amount}
                </p>
                <p className="flex items-center gap-2 text-gray-600 text-xs">
                  <FaCalendarAlt /> {expense.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 text-sm">
          No expenses added yet.
        </p>
      )}
    </div>
  );
};

export default Expenses;
