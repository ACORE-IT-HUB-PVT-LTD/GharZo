import React from "react";
import Navbar from "../Navbar/navbar";
import Footer from "../Footer/footer";
import { Outlet } from "react-router-dom";

const UserLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <div className="flex-grow ">
      <Outlet />
    </div>
    <Footer />
  </div>
);

export default UserLayout;
