import { Route } from "react-router-dom";
import SubOwnerLayout from "../Components/Sub_owner/SubOwnerLayout/SubOwnerLayout.jsx";
import SubOwnerDashboard from "../Components/Sub_owner/SubOwnerPages/SubOwnerDashboard.jsx";
import SubOwnerProfile from "../Components/Sub_owner/SubOwnerPages/SubOwnerProfile.jsx";
import SubOwnerPoliceVerification from "../Components/Sub_owner/SubOwnerPages/SubOwnerPoliceVerification.jsx";
import SubOwnerProperty from "../Components/Sub_owner/SubOwnerPages/SubOwnerProperty.jsx";
import SubOwnerAddRooms from "../Components/Sub_owner/SubOwnerPages/SubOwnerPropertyPage/SubOwnerAddRooms.jsx";
import SubOwnerComplaints from "../Components/Sub_owner/SubOwnerPages/SubOwnerComplaints.jsx";
import SubOwnerMaintains from "../Components/Sub_owner/SubOwnerPages/SubOwnerMaintains.jsx";
import SubOwnerDues from "../Components/Sub_owner/SubOwnerPages/SubOwnerDues.jsx";
import SubOwnerCollections from "../Components/Sub_owner/SubOwnerPages/SubOwnerCollections.jsx";
import SubOwnerOwner from "../Components/Sub_owner/SubOwnerPages/SubOwnerOwner.jsx";
import EditTenant from "../Components/Sub_owner/SubOwnerPages/SubOwnerPropertyPage/EditTanant.jsx";
import SubOwnerPropertyDetail from "../Components/Sub_owner/SubOwnerPages/SubOwnerPropertyDetail.jsx";
import SubOwnerAddTenant from "../Components/Sub_owner/SubOwnerPages/SubOwnerAddTenant.jsx";
import CreateWorkers from "../Components/Sub_owner/Workers/CreateWorkers.jsx";
import SubOwnerexpenses from "../Components/Sub_owner/SubOwnerPages/SubOwnerexpenses.jsx";
import SubOwnerWorkers from "../Components/Sub_owner/Workers/SubOwnerWorkers.jsx";
import SubOwnerAnnouncements from "../Components/Sub_owner/SubOwnerPages/SubOwnerAnnouncements.jsx";
import Login from "../Components/User_Section/Login&Signup/Login.jsx";

const subOwnerMainRoutes = (
  <Route key="sub_owner-main" path="/sub_owner" element={<SubOwnerLayout />}>
    <Route index element={<SubOwnerDashboard />} />
    <Route path="dashboard" element={<SubOwnerDashboard />} />
    <Route path="sub_owner_profile" element={<SubOwnerProfile />} />
    <Route path="police-verification" element={<SubOwnerPoliceVerification />} />
    <Route path="sub_owner_property" element={<SubOwnerProperty />} />
    <Route path="property/:propertyId/add_room" element={<SubOwnerAddRooms />} />
    <Route path="complaints" element={<SubOwnerComplaints />} />
    <Route path="maintains" element={<SubOwnerMaintains />} />
    <Route path="dues" element={<SubOwnerDues />} />
    <Route path="collections" element={<SubOwnerCollections />} />
    <Route path="my_owner" element={<SubOwnerOwner />} />
    <Route path="edit-tenant" element={<EditTenant />} />
    <Route path="property/:propertyId" element={<SubOwnerPropertyDetail />} />
    <Route path="sub_owner_add_tenant" element={<SubOwnerAddTenant />} />
    <Route path="sub_owner_add_workers" element={<CreateWorkers />} />
    <Route path="sub_owner_expenses" element={<SubOwnerexpenses />} />
    <Route path="sub_owner_workers_list" element={<SubOwnerWorkers />} />
    <Route path="announcements" element={<SubOwnerAnnouncements />} />
  </Route>
);

const subOwnerLoginRoute = (
  <Route key="sub_owner_login" path="/login" element={<Login />} />
);

export const subOwnerRoutes = [subOwnerMainRoutes, subOwnerLoginRoute];