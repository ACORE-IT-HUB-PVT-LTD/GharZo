
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../User_Section/Context/AuthContext.jsx";
import baseurl from "../../../../BaseUrl.js";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../../assets/logo/logo.png";
import signupbg from "../../../assets/Images/signupbg.jpg";

function Signup() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const mobileFromLogin = location.state?.mobile || "";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    aadhaar: "",
    mobile: mobileFromLogin,
    pan: "",
    address: "",
    pinCode: "",
    state: "",
    dob: "",
    gender: "",
    work: "",
    maritalStatus: "",
    fatherName: "",
    fatherMobile: "",
    motherName: "",
    motherMobile: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // ✅ Validation check
    if (name === "aadhaar" && value.length !== 12) {
      setErrors((prev) => ({ ...prev, aadhaar: "Aadhaar must be 12 digits" }));
    } else if (name === "aadhaar") {
      setErrors((prev) => ({ ...prev, aadhaar: "" }));
    }

    if (name === "pinCode" && value.length !== 6) {
      setErrors((prev) => ({ ...prev, pinCode: "Pin Code must be 6 digits" }));
    } else if (name === "pinCode") {
      setErrors((prev) => ({ ...prev, pinCode: "" }));
    }
  };

  const handlePhotoChange = (e) => setProfilePhoto(e.target.files[0]);

  const handleSignup = async (e) => {
    e.preventDefault();
    const fullName = `${form.firstName} ${form.lastName}`;

    const formData = new FormData();
    formData.append("name", fullName);
    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    if (profilePhoto) formData.append("profilePhoto", profilePhoto);

    try {
      const res = await axios.post(
        `${baseurl}api/tenant/register-s3`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.status === 201) {
        login({ ...form, name: fullName, isRegistered: true });
        if (res.data.token) localStorage.setItem("token", res.data.token);
        navigate("/tenant");
      } else {
        alert("Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.response?.data?.message || "Error while registering");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 relative">
      {/* ✅ Background */}
      <div
        className="absolute inset-0 bg-black/60"
        style={{
          backgroundImage: `url(${signupbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(6px)",
        }}
      ></div>

      {/* ✅ Main Box */}
      <div className="relative bg-gray-800 bg-opacity-40 border border-green-800 rounded-2xl shadow-4xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row z-10">
        {/* Left Branding */}
        <div className="md:w-1/3 bg-gradient-to-br from-[#5C4EFF] to-green-800 flex flex-col items-center justify-center p-6">
          <img
            src={logo}
            alt="logo"
            className="w-28 h-28 object-contain mb-4"
          />
          <h1 className="text-2xl font-extrabold text-white tracking-wide text-center">
            Tenant Portal
          </h1>
        </div>

        {/* Right Form */}
        <div className="md:w-2/3 p-4 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Complete Your Registration
          </h2>

          <form
            onSubmit={handleSignup}
            encType="multipart/form-data"
            className="space-y-4"
          >
            {/* First + Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleChange}
                className="p-2 bg-transparent border rounded-md text-white w-full"
              />
              <input
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleChange}
                className="p-2 bg-transparent border rounded-md text-white w-full"
              />
            </div>

            {/* Email + Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="p-2 bg-transparent border rounded-md text-white w-full"
              />
              <div className="flex">
                <select className="p-2 bg-transparent border rounded-md text-white w-24 mr-2">
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                </select>
                <input
                  name="mobile"
                  placeholder="Mobile Number"
                  value={form.mobile}
                  onChange={handleChange}
                  className="p-2 bg-transparent border rounded-md text-white flex-1"
                />
              </div>
            </div>

            {/* Aadhaar + PAN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input
                  name="aadhaar"
                  placeholder="Aadhaar (12 digits)"
                  value={form.aadhaar}
                  onChange={handleChange}
                  className="p-2 bg-transparent border rounded-md text-white w-full"
                />
                {errors.aadhaar && (
                  <p className="text-red-500 text-sm mt-1">{errors.aadhaar}</p>
                )}
              </div>
              <input
                name="pan"
                placeholder="PAN (10 characters)"
                value={form.pan}
                onChange={handleChange}
                className="p-2 bg-transparent border rounded-md text-white w-full"
              />
            </div>

            {/* Address */}
            <input
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              className="p-2 bg-transparent border rounded-md text-white w-full"
            />

            {/* Pin Code + State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input
                  name="pinCode"
                  placeholder="Pin Code (6 digits)"
                  value={form.pinCode}
                  onChange={handleChange}
                  className="p-2 bg-transparent border rounded-md text-white w-full"
                />
                {errors.pinCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.pinCode}</p>
                )}
              </div>
              <input
                name="state"
                placeholder="State"
                value={form.state}
                onChange={handleChange}
                className="p-2 bg-transparent border rounded-md text-white w-full"
              />
            </div>

            {/* DOB + Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className="p-2 bg-transparent border rounded-md text-white w-full"
              />
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="p-2 bg-transparent border rounded-md text-white w-full"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Work + Marital */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                name="work"
                placeholder="Work (e.g. Software Engineer)"
                value={form.work}
                onChange={handleChange}
                className="p-2 bg-transparent border rounded-md text-black w-full"
              />
              <select
                name="maritalStatus"
                value={form.maritalStatus}
                onChange={handleChange}
                className="p-2 bg-transparent border rounded-md text-white w-full"
              >
                <option value="">Select Marital Status</option>
                <option value="Unmarried">Unmarried</option>
                <option value="Married">Married</option>
              </select>
            </div>

            {/* Parents Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                name="fatherName"
                placeholder="Father's Name"
                value={form.fatherName}
                onChange={handleChange}
                className="p-2 bg-transparent border rounded-md text-white w-full"
              />
              <input
                name="fatherMobile"
                placeholder="Father's Mobile"
                value={form.fatherMobile}
                onChange={handleChange}
                className="p-2 bg-transparent border rounded-md text-white w-full"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                name="motherName"
                placeholder="Mother's Name"
                value={form.motherName}
                onChange={handleChange}
                className="p-2 bg-transparent border rounded-md text-white w-full"
              />
              <input
                name="motherMobile"
                placeholder="Mother's Mobile"
                value={form.motherMobile}
                onChange={handleChange}
                className="p-2 bg-transparent border rounded-md text-white w-full"
              />
            </div>

            {/* Profile Photo */}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="p-2 bg-transparent border rounded-md text-white w-full"
            />

            {/* Submit + Cancel */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="w-full hover:opacity-90 text-white py-2 rounded-lg font-medium transition duration-200 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400"
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
