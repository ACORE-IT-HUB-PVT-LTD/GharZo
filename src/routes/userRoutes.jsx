import { Route } from "react-router-dom";
import UserLayout from "../Components/User_Section/UserSection/UserLayout";
import ProfilePage from "../Components/User_Section/UserSection/pages/ProfilePage";
import BookingsPage from "../Components/User_Section/UserSection/pages/BookingPage";

export const userRoutes = (
  <Route path="/user" element={<UserLayout />}>
    <Route path="profile" element={<ProfilePage />} />
    <Route path="bookings" element={<BookingsPage />} />
  </Route>
);