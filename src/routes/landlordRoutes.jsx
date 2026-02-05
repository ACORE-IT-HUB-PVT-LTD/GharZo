import { Route } from "react-router-dom";
import Layout from "../Components/LandLoard/Layout/Layout";
import Dashboard from "../Components/LandLoard/Dashboard/Dashboard";
import LandlordProfile from "../Components/LandLoard/Profile/LandlordProfile";
import LandlordReels from "../Components/LandLoard/Reels/LandlordReels";
import LandlordSubAdmin from "../Components/LandLoard/SubAdmin/SubAdminDashboard.jsx";
import LandLoardplan from "../Components/LandLoard/Subscription/MySubscriptions.jsx";
import LandLoardreelsub from "../Components/LandLoard/Subscription/MyReelSubscriptions.jsx";
import PropertyList from "../Components/LandLoard/Property/Propertylist";
import AddProperty from "../Components/LandLoard/Property/AddProperty";
import PoliceVerification from "../Components/LandLoard/Property/PoliceVerification.jsx";
import EditProperty from "../Components/LandLoard/Property/EditProperty.jsx";
import RoomOverview from "../Components/LandLoard/Property/RoomOverview";
import Property from "../Components/LandLoard/Property/Property";
import Expenses from "../Components/LandLoard/Property/Expenses.jsx";
import LandlordAnnouncements from "../Components/LandLoard/Property/LandlordAnnouncements.jsx";
import Dues from "../Components/LandLoard/Property/Dues.jsx";
import TenantDues from "../Components/LandLoard/Property/TenantDues.jsx";
import LandlordSwitchRequests from "../Components/LandLoard/Property/LandlordSwitchRequests.jsx";
import PropertyDetail from "../Components/LandLoard/Property/PropertyDetail";
import VisitRequest from "../Components/LandLoard/Property/VisitRequest.jsx";
import Collections from "../Components/LandLoard/Property/Collections.jsx";
import AllComplaints from "../Components/LandLoard/Dashboard/AllComplaints.jsx";
import DuePackages from "../Components/LandLoard/Property/DuesPackages.jsx";
import RoomAdd from "../Components/LandLoard/Property/RoomAdd";
import Tenants from "../Components/LandLoard/Tenant/Tenant";
import TenantForm from "../Components/LandLoard/Tenant/TenantForm";
import TenantList from "../Components/LandLoard/Tenant/TenantList";
import Reel from "../Components/User_Section/Reels/Reel";
import TenantDetails from "../Components/LandLoard/Tenant/TenantDetails";
import SubAdminDashboard from "../Components/LandLoard/SubAdmin/SubAdminDashboard";
import SubAdminList from "../Components/LandLoard/SubAdmin/SubAdminList";
import AddSubAdmin from "../Components/LandLoard/SubAdmin/AddSubAdmin";
import SubscriptionPlans from "../Components/LandLoard/Subscription/SubscriptionPlans.jsx";

const landlordMainRoutes = (
    <Route key="landlord-main" path="/landlord" element={<Layout />}>
    <Route index element={<Dashboard />} />
    <Route path="landlord-profile" element={<LandlordProfile />} />
    <Route path="landlord_reels" element={<LandlordReels />} />
    <Route path="landlord_subadmin" element={<LandlordSubAdmin />} />
    <Route path="my-subscriptions/:id" element={<LandLoardplan />} />
    <Route path="my-reel-subscriptions" element={<LandLoardreelsub />} />
    <Route path="property-list" element={<PropertyList />} />
    <Route path="add-property" element={<AddProperty />} />
    <Route path="police-verification" element={<PoliceVerification />} />
    <Route path="property/edit/:id" element={<AddProperty />} />
    <Route path="property/:id/edit" element={<EditProperty />} />
    <Route path="room-overview" element={<RoomOverview />} />
    <Route path="property" element={<Property />} />
    <Route path="expenses" element={<Expenses />} />
    <Route path="announcement" element={<LandlordAnnouncements />} />
    <Route path="dues" element={<Dues />} />
    <Route path="tenantdues/:propertyId" element={<TenantDues />} />
    <Route path="switch-requests" element={<LandlordSwitchRequests />} />
    <Route path="property/:id" element={<PropertyDetail />} />
    <Route path="property/:propertyId/rooms" element={<RoomOverview />} />
    <Route path="visit-requests" element={<VisitRequest />} />
    <Route path="collections" element={<Collections />} />
    <Route path="allComplaints" element={<AllComplaints />} />
    <Route path="duespackages" element={<DuePackages />} />
    <Route path="property/:propertyId/add-room" element={<RoomAdd />} />
    <Route path="roomform" element={<PropertyDetail />} />
    <Route path="tenants" element={<Tenants />} />
    <Route path="tenant-form" element={<TenantForm />} />
    <Route path="tenant-list" element={<TenantList />} />
    <Route path="reels" element={<Reel />} />
    <Route path="tenant-details/:tenancyId" element={<TenantDetails />} />
    <Route path="tenancy-details/:tenancyId" element={<TenantDetails />} />
  </Route>
);


const subAdminRoutes = [
  <Route key="subadmin-dashboard" path="/landlord/subadmin" element={<SubAdminDashboard />} />,
  <Route key="subadmin-list" path="/landlord/subadmin/list" element={<SubAdminList />} />,
  <Route key="subadmin-add" path="/landlord/subadmin/add" element={<AddSubAdmin />} />,
  <Route key="subscription-plans" path="/landlord/subscription-plans" element={<SubscriptionPlans />} />
];

export const landlordRoutes = [landlordMainRoutes, ...subAdminRoutes];