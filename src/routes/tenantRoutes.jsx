import { Route } from "react-router-dom";
import TenantLayout from "../Components/TenantSection/TenantLayout";
import TenantDashboard from "../Components/TenantSection/TenantDashboard";
import TenantProfile from "../Components/TenantSection/Profile/TenantProfile";
import TenantSidebar from "../Components/TenantSection/TenantSidebar.jsx";
import TenantProperties from "../Components/TenantSection/Property/AllProperty";
import TenantPropertyDetails from "../Components/TenantSection/Property/PropertyDetails";
import RentPayments from "../Components/TenantSection/Rent/RentPayments";
import TenantPoliceVerification from "../Components/TenantSection/Docqments/TenantPoliceVerification.jsx";
import Roomswitch from "../Components/TenantSection/Roomswitch/Roomswitch.jsx";
import MyAgreement from "../Components/TenantSection/MyAgreement/MyAgreement.jsx";
import MaintenanceRequests from "../Components/TenantSection/Maintenance/MaintenanceRequests";
import RequestForm from "../Components/TenantSection/Maintenance/RequestForm";
import LeaseAgreement from "../Components/TenantSection/Lease/LeaseAgreement";
import TenantBills from "../Components/TenantSection/Bills/TenantBills.jsx";
import PropertyPage from "../Components/TenantSection/Property/Tenant Dashboard/PropertyPage.jsx";
import RentPage from "../Components/TenantSection/Property/Tenant Dashboard/RentPage.jsx";
import PropertyReviews from "../Components/LandLoard/Property/PropertyReviews";
import MaintenancePage from "../Components/TenantSection/Property/Tenant Dashboard/MaintenancePage.jsx";
import ContactsPage from "../Components/TenantSection/Property/Tenant Dashboard/ContactsPage.jsx";
import AnnouncementsPage from "../Components/TenantSection/Property/Tenant Dashboard/AnnouncementsPage.jsx";
import LeasePage from "../Components/TenantSection/Property/Tenant Dashboard/LeasePage.jsx";
import Complaints from "../Components/TenantSection/Complaints/Complaints.jsx";
import LandlordComplaints from "../Components/LandLoard/Property/LandlordComplaints.jsx";
import Announcements from "../Components/TenantSection/Announcements";
import Support from "../Components/TenantSection/Support/Support";
import Documents from "../Components/TenantSection/Docqments/Documents";
import Facilities from "../Components/TenantSection/Facilities/Facilities.jsx";

export const tenantRoutes = (
  <Route key="tenant" path="/tenant" element={<TenantLayout />}>
    <Route index element={<TenantDashboard />} />
    <Route path="profile" element={<TenantProfile />} />
    <Route path="sidebar" element={<TenantSidebar />} />
    <Route path="properties" element={<TenantProperties />} />
    <Route path="properties/:id" element={<TenantPropertyDetails />} />
    <Route path="rent-payments/:tenantId" element={<RentPayments />} />
    <Route path="police-verification" element={<TenantPoliceVerification />} />
    <Route path="room-switch" element={<Roomswitch />} />
    <Route path="rent-agreement" element={<MyAgreement />} />
    <Route path="maintenance" element={<MaintenanceRequests />} />
    <Route path="maintenance/request" element={<RequestForm />} />
    <Route path="lease" element={<LeaseAgreement />} />
    <Route path="bills" element={<TenantBills />} />
    <Route path="property" element={<PropertyPage />} />
    <Route path="rent" element={<RentPage />} />
    <Route path="property-reviews/:propertyId" element={<PropertyReviews />} />
    <Route path="maintenance-dashboard" element={<MaintenancePage />} />
    <Route path="propertyreviews" element={<PropertyReviews />} />
    <Route path="contacts" element={<ContactsPage />} />
    <Route path="announcements-dashboard" element={<AnnouncementsPage />} />
    <Route path="lease-dashboard" element={<LeasePage />} />
    <Route path="complaints/:tenantId" element={<Complaints />} />
    <Route path="property/:id/complaints" element={<LandlordComplaints />} />
    <Route path="announcements/:tenantId" element={<Announcements />} />
    <Route path="support" element={<Support />} />
    <Route path="documents" element={<Documents />} />
    <Route path="facilities" element={<Facilities />} />
  </Route>
);