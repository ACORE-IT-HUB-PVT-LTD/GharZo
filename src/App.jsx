import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import AboutUs from "./Components/User_Section/About/AboutUs";

// Auth context
import { AuthProvider } from "./Components/User_Section/Context/AuthContext";

// Layouts
import UserLayout from "./Components/User_Section/UserSection/UserLayout";
import Layout from "./Components/LandLoard/Layout/Layout";

// Main Website Components
import Navbar from "./Components/User_Section/Navbar/navbar";
import Footer from "./Components/User_Section/Footer/footer";
import MainPage from "./Components/User_Section/Main/MainPage";
import AllProperty from "./Components/User_Section/AllProperty/AllProperty";
import PropertyDetails from "./Components/User_Section/AllProperty/PropertyDetails";
import PG from "./Components/User_Section/PG/PG";
import Reel from "./Components/User_Section/Reels/Reel";
import PgDetails from "./Components/User_Section/PG/PgDetails";
import RentProperty from "./Components/User_Section/RentProperty/RentProperty";
import SellProperty from "./Components/User_Section/SellProperty/SellProperty";
import Contact from "./Components/User_Section/Contact/Contact";
import Hostel from "./Components/User_Section/Hostel/Hostel";
import HostelDetail from "./Components/User_Section/Hostel/HostelDetail";


import RentPropertyDetail from "./Components/User_Section/RentProperty/RentPropertyDetails";
import SellPropertyDetail from "./Components/User_Section/SellProperty/SellPropertyDetail";
import BlogPage from "./Components/User_Section/Blog.jsx";
import HowItWorks from "./Components/User_Section/HowItWorks";

// User Pages
import ProfilePage from "./Components/User_Section/UserSection/pages/ProfilePage";
import BookingsPage from "./Components/User_Section/UserSection/pages/BookingPage";
import PrivacyRefund from "./Components/User_Section/PrivacyRefund/PrivacyRefund.jsx";

// Landlord Pages
import Dashboard from "./Components/LandLoard/Dashboard/Dashboard";
import AddProperty from "./Components/LandLoard/Property/AddProperty";
import Tenants from "./Components/LandLoard/Tenant/Tenant";
import PropertyDetail from "./Components/LandLoard/Property/PropertyDetail";
import PropertyList from "./Components/LandLoard/Property/Propertylist";
import Property from "./Components/LandLoard/Property/Property";
import RoomOverview from "./Components/LandLoard/Property/RoomOverview";
import TenantForm from "./Components/LandLoard/Tenant/TenantForm";
import LandlordProfile from "./Components/LandLoard/Profile/LandlordProfile";
import LandlordReels from "./Components/LandLoard/Reels/LandlordReels";
import LandlordSubAdmin from "./Components/LandLoard/SubAdmin/SubAdminDashboard.jsx";
import TenantList from "./Components/LandLoard/Tenant/TenantList";
import TenantDetails from "./Components/LandLoard/Tenant/TenantDetails";
import RoomAdd from "./Components/LandLoard/Property/RoomAdd";

import EditProperty from "./Components/LandLoard/Property/EditProperty.jsx";
import SubAdminDashboard from "./Components/LandLoard/SubAdmin/SubAdminDashboard";
import SubAdminList from "./Components/LandLoard/SubAdmin/SubAdminList";
import AddSubAdmin from "./Components/LandLoard/SubAdmin/AddSubAdmin";
import AllComplaints from "./Components/LandLoard/Dashboard/AllComplaints.jsx";

// Tenant Section Components
import TenantLayout from "./Components/TenantSection/TenantLayout";
import TenantDashboard from "./Components/TenantSection/TenantDashboard";
import TenantProfile from "./Components/TenantSection/Profile/TenantProfile";
import TenantProperties from "./Components/TenantSection/Property/AllProperty";
import TenantPropertyDetails from "./Components/TenantSection/Property/PropertyDetails";
import RentPayments from "./Components/TenantSection/Rent/RentPayments";
import MaintenanceRequests from "./Components/TenantSection/Maintenance/MaintenanceRequests";
import RequestForm from "./Components/TenantSection/Maintenance/RequestForm";
import LeaseAgreement from "./Components/TenantSection/Lease/LeaseAgreement";
import Announcements from "./Components/TenantSection/Announcements";
import Support from "./Components/TenantSection/Support/Support";
import PropertyReviews from "./Components/LandLoard/Property/PropertyReviews";
import Documents from "./Components/TenantSection/Docqments/Documents";
import MyAgreement from "./Components/TenantSection/MyAgreement/MyAgreement.jsx"

// Seller Pages
import SellerLayout from "./Components/Seller_Section/Layout/SellerLayout";
import AddPropertySeller from "./Components/Seller_Section/Property/AddPropertySeller";
import SellerProperty from "./Components/Seller_Section/Property/SellerProperty";
import SellerPropertyDetail from "./Components/Seller_Section/Property/SellerPropertyDetail";
import EditPropertySeller from "./Components/Seller_Section/Property/EditpropertySeller";
import SellerProfile from "./Components/Seller_Section/Profile/SellerProfile";
import EnquiriesSeller from "./Components/Seller_Section/Property/EnquiriesSeller";
import SellerSubscription from "./Components/Seller_Section/Subscription/SellerSubscription";
import SellerHome from "./Components/Seller_Section/Home/SellerHome";

// login & signup
import LandloardLogin from "./Components/LandLoard/LandloardLogin&Reg/LandloardLogin.jsx";
import LandloardSignup from "./Components/LandLoard/LandloardLogin&Reg/LandloardSignup.jsx";
import SallerLogin from "./Components/Seller_Section/SellerLogin&Reg/SallerLogin.jsx";
import SallerSignup from "./Components/Seller_Section/SellerLogin&Reg/SallerSignup.jsx";
import TenantLogin from "./Components/TenantSection/TenantLogin&Reg/TenantLogin.jsx";
import TenantSignup from "./Components/TenantSection/TenantLogin&Reg/TenantSignup.jsx";
import PropertyDetailMain from "./Components/User_Section/Main/City/PropertyDetailMain.jsx";
import PropertyListMain from "./Components/User_Section/Main/City/PropertyListMain.jsx";
import Complaints from "./Components/TenantSection/Complaints/Complaints.jsx";
import TenantBills from "./Components/TenantSection/Bills/TenantBills.jsx";
import PropertyPage from "./Components/TenantSection/Property/Tenant Dashboard/PropertyPage.jsx";
import AnnouncementsPage from "./Components/TenantSection/Property/Tenant Dashboard/AnnouncementsPage.jsx";
import RentPage from "./Components/TenantSection/Property/Tenant Dashboard/RentPage.jsx";
import MaintenancePage from "./Components/TenantSection/Property/Tenant Dashboard/MaintenancePage.jsx";
import ContactsPage from "./Components/TenantSection/Property/Tenant Dashboard/ContactsPage.jsx";
import LeasePage from "./Components/TenantSection/Property/Tenant Dashboard/LeasePage.jsx";
import Login from "./Components/User_Section/Login&Signup/Login.jsx";
import UserSignup from "./Components/User_Section/Login&Signup/UserSignup.jsx";
import TenantRentPayments from "./Components/TenantSection/Rent/RentPayments";
import VisitRequest from "./Components/LandLoard/Property/VisitRequest.jsx";


import LandlordComplaints from "./Components/LandLoard/Property/LandlordComplaints.jsx";
import DuePackages from "./Components/LandLoard/Property/DuesPackages.jsx";
import Facilities from "./Components/TenantSection/Facilities/Facilities.jsx";
import Expenses from "./Components/LandLoard/Property/Expenses.jsx";
import Dues from "./Components/LandLoard/Property/Dues.jsx";
import LandLoardplan from "./Components/LandLoard/Subscription/MySubscriptions.jsx";
import LandLoardreelsub from "./Components/LandLoard/Subscription/MyReelSubscriptions.jsx";
// sub owner section self
import SubOwnerLayout from "./Components/Sub_owner/SubOwnerLayout/SubOwnerLayout.jsx";
import SubOwnerDashboard from "./Components/Sub_owner/SubOwnerPages/SubOwnerDashboard.jsx";
import SubOwnerProfile from "./Components/Sub_owner/SubOwnerPages/SubOwnerProfile.jsx";
import SubOwnerProperty from "./Components/Sub_owner/SubOwnerPages/SubOwnerProperty.jsx";
import SubOwnerComplaints from "./Components/Sub_owner/SubOwnerPages/SubOwnerComplaints.jsx";
import SubOwnerexpenses from "./Components/Sub_owner/SubOwnerPages/SubOwnerexpenses.jsx";
import SubOwnerMaintains from "./Components/Sub_owner/SubOwnerPages/SubOwnerMaintains.jsx";
import SubOwnerDues from "./Components/Sub_owner/SubOwnerPages/SubOwnerDues.jsx";
import SubOwnerCollections from "./Components/Sub_owner/SubOwnerPages/SubOwnerCollections.jsx";
import SubOwnerOwner from "./Components/Sub_owner/SubOwnerPages/SubOwnerOwner.jsx";
import SubOwnerLogin from "./Components/Sub_owner/SubOwnerLogin/SubOwnerLogin.jsx";
import SubOwnerAddTenant from "./Components/Sub_owner/SubOwnerPages/SubOwnerAddTenant.jsx";
import SubOwnerPropertyDetail from "./Components/Sub_owner/SubOwnerPages/SubOwnerPropertyDetail.jsx";
import EditTenant from "./Components/Sub_owner/SubOwnerPages/SubOwnerPropertyPage/EditTanant.jsx";
import SubOwnerAddRooms from "./Components/Sub_owner/SubOwnerPages/SubOwnerPropertyPage/SubOwnerAddRooms.jsx";
import SubscriptionPlans from "./Components/LandLoard/Subscription/SubscriptionPlans.jsx";

// Organization Pages
import OrganizationLogin from "./Components/Organization/OrganizationLogin&Reg/OrganizationLogin";
import OrganizationSignup from "./Components/Organization/OrganizationLogin&Reg/OrganizationSignup";
import OrganizationLayout from "./Components/Organization/Layout/OrganizationLayout.jsx";
import OrganizationDashboard from "./Components/Organization/Dashboard/OrganizationDashboard";
import OrganizationPropertyList from "./Components/Organization/Property/Propertylist";
import OrganizationAddProperty from "./Components/Organization/Property/AddProperty";
import RegionalManagerDashboardOrg from "./Components/Organization/RegionalManagerOrgside/RegionalManagerOrgside/RegionalManagerOrgCreate/RegionalManagerDashboardOrg.jsx";
import RegionalManagerList from "./Components/Organization/RegionalManagerOrgside/RegionalManagerOrgside/RegionalManagerOrgCreate/RegionalManagerList.jsx";
import AddRegionalManager from "./Components/Organization/RegionalManagerOrgside/RegionalManagerOrgside/RegionalManagerOrgCreate/AddRegionalManager.jsx";
import OrganizationPropertyDetail from "./Components/Organization/Property/PropertyDetail";
import OrganizationRoomOverview from "./Components/Organization/Property/RoomOverview";
import OrganizationRoomAdd from "./Components/Organization/Property/RoomAdd";
import OrganizationViewBeds from "./Components/Organization/Property/ViewBeds";
import OrganizationEditProperty from "./Components/Organization/Property/EditProperty";
import OrganizationVisitRequest from "./Components/Organization/Property/VisitRequest";
import OrganizationDuesPackages from "./Components/Organization/Property/DuesPackages";
import OrganizationExpenses from "./Components/Organization/Property/Expenses";
import OrganizationDues from "./Components/Organization/Property/Dues";
import OrganizationCollections from "./Components/Organization/Property/collections";

import OrganizationTenant from "./Components/Organization/Tenant/Tenant";
import OrganizationTenantForm from "./Components/Organization/Tenant/TenantForm";
import OrganizationTenantList from "./Components/Organization/Tenant/TenantList";
import OrganizationTenantDetails from "./Components/Organization/Tenant/TenantDetails";
import OrganizationReels from "./Components/Organization/Reels/OrganizationReels";
import OrgProfile from "./Components/Organization/OrganizationProfile/OrgProfile";
import OrganizationDepartments from "./Components/Organization/Property/OrganizationDepartments";
import WebProplist from "./Components/Organization/Property/WebProplist";
import WebsiteDetail from "./Components/Organization/Property/websitedetail";
import WebEditProp from "./Components/Organization/Property/WebEditProp";
import TabPropdtl from "./Components/Organization/Property/TabPropdtl";
import LandlordSwitchRequests from "./Components/LandLoard/Property/LandlordSwitchRequests.jsx";
import Roomswitch from "./Components/TenantSection/Roomswitch/Roomswitch.jsx";
import TenantDues from "./Components/LandLoard/Property/TenantDues.jsx";
import Collections from "./Components/LandLoard/Property/Collections.jsx";
import LandlordAnnouncements from "./Components/LandLoard/Property/LandlordAnnouncements.jsx";
import CreateWorkers from "./Components/Sub_owner/Workers/CreateWorkers.jsx";
import SubOwnerWorkers from "./Components/Sub_owner/Workers/SubOwnerWorkers.jsx";
import Sidebar from "./Components/Seller_Section/Sidebar/Sidebar.jsx";
import OrgSidebar from "./Components/Organization/sidebar/OrgSidebar.jsx";
import OrgAnnouncements from "./Components/Organization/Property/OrgAnnouncements.jsx";
import OrgComplaints from "./Components/Organization/Property/OrgComplaints.jsx";
import OrgSwitchRequests from "./Components/Organization/Property/OrgSwitchRequests.jsx";
import OrganizationPropertyFeedback from "./Components/Organization/Property/PropertyReviews.jsx";
import OrganizationTenantDues from "./Components/Organization/Property/TenantDues.jsx";
import OrgSubadminDashboard from "./Components/Organization/SubadminOrg/OrgSubadminDashboard";
import OrgAddSubadmin from "./Components/Organization/SubadminOrg/OrgAddSubadmin";
import OrgSubadminList from "./Components/Organization/SubadminOrg/OrgSubadminlist";
import OrgSubadminPermission from "./Components/Organization/SubadminOrg/OrgSubadminPermission";
import SellerReels from "./Components/Seller_Section/Property/Reels.jsx";
import EditpropertySeller from "./Components/Seller_Section/Property/EditpropertySeller";

// Organization manager section
import RegionalManagerLayout from "./Components/Organization/RegionalManager/RegionalManagerLayout/RegionalManagerLayout.jsx";
import RegionalManagerDashboard from "./Components/Organization/RegionalManager/RegionalManagerPages/RegionalManagerDashboard.jsx";
import RegionalManagerProfile from "./Components/Organization/RegionalManager/RegionalManagerPages/RegionalManagerProfile.jsx";
import RegionalManagerProperty from "./Components/Organization/RegionalManager/RegionalManagerPages/RegionalManagerProperty.jsx";
import RegionalManagerPropertyDetail from "./Components/Organization/RegionalManager/RegionalManagerPages/RegionalManagerPropertyDetail.jsx";
import RegionalManagerAddProperty from "./Components/Organization/RegionalManager/RegionalManagerPages/RegionalManagerAddProperty.jsx";
import RMEditProperty from "./Components/Organization/RegionalManager/RegionalManagerPages/RegionalManagerPropertyPage/RMEditProperty.jsx";
import RegionalManagerAddRooms from "./Components/Organization/RegionalManager/RegionalManagerPages/RegionalManagerPropertyPage/RegionalManagerAddRooms.jsx";
import RegionalManagerOwner from "./Components/Organization/RegionalManager/RegionalManagerPages/RegionalManagerOwner.jsx";
import RegionalManagerCollections from "./Components/Organization/RegionalManager/RegionalManagerPages/RegionalManagerCollections.jsx";
import RegionalManagerDues from "./Components/Organization/RegionalManager/RegionalManagerPages/RegionalManagerDues.jsx";
import RegionalManagerMaintains from "./Components/Organization/RegionalManager/RegionalManagerPages/RegionalManagerMaintains.jsx";
import RegionalManagerComplaints from "./Components/Organization/RegionalManager/RegionalManagerPages/RegionalManagerComplaints.jsx";
import RegionalManagerEditTenant from "./Components/Organization/RegionalManager/RegionalManagerPages/RegionalManagerPropertyPage/RegionalManagerEditTanant.jsx";
import RegionalManagerAddTenant from "./Components/Organization/RegionalManager/RegionalManagerPages/RegionalManagerAddTenant.jsx";
import RegionalManagerCreateWorkers from "./Components/Organization/RegionalManager/RegionalManagerWorkers/RegionalManagerCreateWorkers.jsx";
import RegionalManagerWorkers from "./Components/Organization/RegionalManager/RegionalManagerWorkers/RegionalManagerWorkers.jsx";
import RegionalManagerexpenses from "./Components/Organization/RegionalManager/RegionalManagerPages/RegionalManagerExpenses.jsx";
import RegionalManagerLogin from "./Components/Organization/RegionalManager/RegionalManagerLogin/RegionalManagerLogin.jsx";
import TeamManagement from "./Components/Organization/RegionalManager/TeamManagement/TeamManagement.jsx";
import AddManagerForm from "./Components/Organization/RegionalManager/TeamManagement/AddManagerForm.jsx";
import AddWorkerForm from "./Components/Organization/RegionalManager/TeamManagement/AddWorkerForm.jsx";
import ViewWorkers from "./Components/Organization/RegionalManager/TeamManagement/ViewWorkers.jsx";
import ViewManagers from "./Components/Organization/RegionalManager/TeamManagement/ViewManagers.jsx";
import ViewProperties from "./Components/Organization/RegionalManager/TeamManagement/ViewProperties.jsx";
import MyVisits from "./Components/User_Section/ScheduleTour/MyVisits.jsx";
import OrgWebsitePortal from "./Components/Organization/Property/OrgWebsitePortal.jsx";
import OrganizationWeb from "./Components/Organization/Property/OrganizationWeb.jsx";
import OrganizationNavbar from "./Components/Organization/Property/OrganizationNavbar.jsx";
import TenantOrgLogin from "./Components/Organization/Property/TenantOrgLogin.jsx"


// -------------------------------// Organization manager section End -----------------------------------------------

{
  /* // ------------------- Organization Property owner section ---------------  */
}
import PropertyOwnerLogin from "./Components/Organization/Property/PropertyOwnerSection/PropertyOwnerLogin.jsx";
import PropertyOwnerLayout from "./Components/Organization/Property/PropertyOwnerSection/PropertyOwnerLayout.jsx";
import PropertyOwnerDashboard from "./Components/Organization/Property/PropertyOwnerSection/PropertyOwnerDashboard.jsx";
import PropweryOwnerProfile from "./Components/Organization/Property/PropertyOwnerSection/PropweryOwnerProfile.jsx";
import CreateWebsite from "./Components/Organization/Property/CreateWebsite.jsx";
import OrgWebsite from "./Components/Organization/Property/OrgWebsite.jsx";
import AssignedPropertyDetail from "./Components/Organization/RegionalManager/RegionalManagerPages/AssignedPropertyDetail.jsx";
import AssignedAddRoom from "./Components/Organization/RegionalManager/RegionalManagerPages/AssignedAddRoom.jsx";
import TenantSidebar from "./Components/TenantSection/TenantSidebar.jsx";
import OrgPoliceVerification from "./Components/Organization/OrgPoliceVerification.jsx"

{
  /* // ------------------- Organization Property manager section ---------------  */
}
import PropertyManagerLogin from "./Components/Organization/PropertyManagerDashboard/PropertyManagerLogin.jsx";
import PropertyManagerDashboard from "./Components/Organization/PropertyManagerDashboard/PropertyManagerDashboard.jsx";
import PropertyManagerLayout from "./Components/Organization/PropertyManagerDashboard/PropertyManagerLayout.jsx";
import PropweryManagerProfile from "./Components/Organization/PropertyManagerDashboard/PropweryManagerProfile.jsx";
import PropertyManagerAddTenant from "./Components/Organization/PropertyManagerDashboard/PropertyManagerAddTenant.jsx";
import PropweryManagerAddWorker from "./Components/Organization/PropertyManagerDashboard/PropweryManagerAddWorker.jsx";
import PropertyManagerWorkersList from "./Components/Organization/PropertyManagerDashboard/PropertyManagerWorkersList.jsx";
import PropertyManagerDuas from "./Components/Organization/PropertyManagerDashboard/PropertyManagerDuas.jsx";
import PropertyManagerPropertyLIst from "./Components/Organization/PropertyManagerDashboard/PropertyManagerProperes/PropertyManagerPropertyLIst.jsx";
import PropertyManagerPropertyDetails from "./Components/Organization/PropertyManagerDashboard/PropertyManagerProperes/PropertyManagerPropertyDetails.jsx";
import PropertyManagerPropertyduesin from "./Components/Organization/PropertyManagerDashboard/PropertyManagerProperes/PropertyManagerPropertyduesin.jsx";
import PropertyManagerRoomOwerView from "./Components/Organization/PropertyManagerDashboard/PropertyManagerProperes/PropertyManagerRoomOwerView.jsx";
import PropertyManagerRoomDetailPage from "./Components/Organization/PropertyManagerDashboard/PropertyManagerProperes/PropertyManagerRoomDetailPage";


import PropertyManagerRoomTenant from "./Components/Organization/PropertyManagerDashboard/PropertyManagerProperes/PropertyManagerRoomTenant.jsx";
import PropertyManagerPropertyAnnouncements from "./Components/Organization/PropertyManagerDashboard/PropertyManagerProperes/PropertyManagerPropertyAnnouncements.jsx";
import PropertyManagerPropertyComplaints from "./Components/Organization/PropertyManagerDashboard/PropertyManagerProperes/PropertyManagerPropertyComplaints.jsx";
import PropertyManagerRoomSwitch from "./Components/Organization/PropertyManagerDashboard/PropertyManagerRoomSwitch.jsx";
import PropertyMangerPoliceVerification from "./Components/Organization/PropertyManagerDashboard/PropertyMangerPoliceVerification.jsx"

import PropertyManagerPropertyRoomForm from "./Components/Organization/PropertyManagerDashboard/PropertyManagerProperes/PropertyManagerPropertyRoomForm.jsx";
import SellerMySubscriptions from "./Components/Seller_Section/Subscription/SellerMySubscription.jsx";
import PropertyManagerCollection from "./Components/Organization/PropertyManagerDashboard/PropertyManagerCollection.jsx";
import PropertyManagerExpenses from "./Components/Organization/PropertyManagerDashboard/PropertyManagerProperes/PropertyManagerExpenses.jsx";
import PropertyManagerPropertyExpenses from "./Components/Organization/PropertyManagerDashboard/PropertyManagerProperes/PropertyManagerPropertyExpenses.jsx";
import PropertyManagerTenants from "./Components/Organization/PropertyManagerDashboard/PropertyManagerProperes/PropertyManagerTenants.jsx";
import PropertyManagerTenantDetails from "./Components/Organization/PropertyManagerDashboard/PropertyManagerProperes/PropertyManagerTenantDetails.jsx";
import PropertyMangerDashCmpln from "./Components/Organization/PropertyManagerDashboard/PropertyMangerDashCmpln.jsx";
import PropertyManagerBedListPage from "./Components/Organization/PropertyManagerDashboard/PropertyManagerProperes/PropertyManagerBedListPage.jsx";
// import PropertyMangerDashCmpln from "./Components/Organization/PropertyManagerDashboard/PropertyMangerDashCmpln.jsx";




//  Property Manager Tenant setion .......... 
import PmTenantLayout from "./Components/Organization/PmTenant/PmTenantLayout.jsx"
import PmTenantDashboard from "./Components/Organization/PmTenant/PmTenantDashboard.jsx"
import PmTenantProfile from "./Components/Organization/PmTenant/Profile/PmTenantProfile.jsx"
import PmTenantSidebar from "./Components/Organization/PmTenant/PmTenantSidebar.jsx"
import PmTenantProperties from "./Components/Organization/PmTenant/Property/PmTenantProperties.jsx"
import PmTenantPropertyDetails from "./Components/Organization/PmTenant/Property/PmTenantPropertyDetails.jsx"
import PmRentPayments from "./Components/Organization/PmTenant/Rent/PmRentPayments.jsx"
import PmRoomswitch from "./Components/Organization/PmTenant/Roomswitch/PmRoomswitch.jsx"
import PmMyAgreement from "./Components/Organization/PmTenant/MyAgreement/PmMyAgreement.jsx"
import PmMaintenanceRequests from "./Components/Organization/PmTenant/Maintenance/PmMaintenanceRequests.jsx"
import PmRequestForm from "./Components/Organization/PmTenant/Maintenance/PmRequestForm.jsx"
import PmLeaseAgreement from "./Components/Organization/PmTenant/Lease/PmLeaseAgreement.jsx"
import PmTenantBills from "./Components/Organization/PmTenant/Bills/PmTenantBills.jsx"
import PmPropertyPage from "./Components/Organization/PmTenant/Property/Tenant Dashboard/PmPropertyPage.jsx"
import PmRentPage from "./Components/Organization/PmTenant/Property/Tenant Dashboard/PmRentPage.jsx"
import PmMaintenancePage from "./Components/Organization/PmTenant/Property/Tenant Dashboard/PmMaintenancePage.jsx"
import PmAnnouncementsPage from "./Components/Organization/PmTenant/Property/Tenant Dashboard/PmAnnouncementsPage.jsx"
import PmContactsPage from "./Components/Organization/PmTenant/Property/Tenant Dashboard/PmContactsPage.jsx"
import PmLeasePage from "./Components/Organization/PmTenant/Property/Tenant Dashboard/PmLeasePage.jsx"
import PmComplaints from "./Components/Organization/PmTenant/Complaints/PmComplaints.jsx"
import PmAnnouncements from "./Components/Organization/PmTenant/PmAnnouncements.jsx"
import PmSupport from "./Components/Organization/PmTenant/Support/PmSupport.jsx"
import PmDocuments from "./Components/Organization/PmTenant/Docqments/PmDocuments.jsx"
import PmFacilities from "./Components/Organization/PmTenant/Facilities/PmFacilities.jsx"
import PropertyManagerPropertyDocuments from "./Components/Organization/PropertyManagerDashboard/PropertyManagerProperes/PropertyManagerPropertyDocuments.jsx";


// Worker dashboard section .............. Org .................
import WorkerDashboardLogin from "./Components/Organization/WorkerDashboard/WorkerDashboardLogin.jsx"
import WorkerDashboard from "./Components/Organization/WorkerDashboard/WorkerDashboard.jsx"
import WorkerLayout from "./Components/Organization/WorkerDashboard/WorkerLayout.jsx"
import WorkerProfile from "./Components/Organization/WorkerDashboard/WorkerProfile.jsx"

// draze Worker dashboard section .............. Org .................
import WorkerDashboardLoginDr from "./Components/Organization/WorkerDashboard/WorkerDashboardLogin.jsx"
import WorkerDashboardDr from "./Components/Organization/WorkerDashboard/WorkerDashboard.jsx"
import DrWorkerLayout from "./Components/Organization/WorkerDashboard/WorkerLayout.jsx"
import DrWorkerProfile from "./Components/Organization/WorkerDashboard/WorkerProfile.jsx"
import OrgSubscriptionPlans from "./Components/Organization/Subscriptions/OrgSubscriptionPlans.jsx";
import OrgMyReelSubscriptions from "./Components/Organization/Subscriptions/OrgMyReelSubscriptions.jsx";
import SellerMyReelSubscription from "./Components/Seller_Section/Subscription/SellerMyReelSubscription.jsx";
import PoliceVerification from "./Components/LandLoard/Property/PoliceVerification.jsx";
import TenantPoliceVerification from "./Components/TenantSection/Docqments/TenantPoliceVerification.jsx";
import PmTenantPoliceVerification from "./Components/Organization/PmTenant/Docqments/PmTenantPoliceVerification.jsx";
import SubOwnerPoliceVerification from "./Components/Sub_owner/SubOwnerPages/SubOwnerPoliceVerification.jsx";


// ScrollToTop Component
const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);
  return null;
};

function App() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="">
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Website */}
            <Route
              path="*"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <div className="flex-grow pt-20">
                    <Routes>
                      <Route index element={<MainPage />} />
                      <Route path="/properties" element={<AllProperty />} />
                      <Route
                        path="/property/:id"
                        element={<PropertyDetails />}
                      />
                      <Route path="/reels" element={<Reel />} />
                      <Route path="/pg" element={<PG />} />
                      <Route path="/pg/:id" element={<PgDetails />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/hostel" element={<Hostel />} />
                      <Route path="/hostel/:id" element={<HostelDetail />} />
                      <Route path="/toparea" element={<PropertyListMain />} />
                      <Route
                        path="/details/:name"
                        element={<PropertyDetailMain />}
                      />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signupuser" element={<UserSignup />} />
                      <Route
                        path="/landlord_login"
                        element={<LandloardLogin />}
                      />
                      <Route
                        path="/landlord_signup"
                        element={<LandloardSignup />}
                      />
                      <Route path="/seller_login" element={<SallerLogin />} />
                      <Route path="/seller_signup" element={<SallerSignup />} />
                      <Route path="/tenant_login" element={<TenantLogin />} />
                      <Route path="/tenant_signup" element={<TenantSignup />} />

                      <Route path="/rent" element={<RentProperty />} />
                      <Route
                        path="/rent/:id"
                        element={<RentPropertyDetail />}
                      />
                      <Route path="/sell" element={<SellProperty />} />
                      <Route
                        path="/sell/:propertyId"
                        element={<SellPropertyDetail />}
                      />
                      <Route path="/about" element={<AboutUs />} />
                      <Route path="/my-visits" element={<MyVisits />} />
                      <Route path="/blog" element={<BlogPage />} />
                      <Route path="/how-it-works" element={<HowItWorks />} />
                      <Route
                        path="/privacy_refund"
                        element={<PrivacyRefund />}
                      />
                    </Routes>
                  </div>
                  <Footer />
                </div>
              }
            />
            {/* User Section */}
            <Route path="/user" element={<UserLayout />}>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="bookings" element={<BookingsPage />} />
            </Route>
            {/* Landlord Dashboard Section */}
            <Route path="/landlord" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="landlord-profile" element={<LandlordProfile />} />
              <Route
                path="/landlord/landlord_reels"
                element={<LandlordReels />}
              />
              <Route
                path="/landlord/landlord_subadmin"
                element={<LandlordSubAdmin />}
              />
              <Route
                path="/landlord/my-subscriptions/:id"
                element={<LandLoardplan />}
              />
              <Route
                path="/landlord/my-reel-subscriptions"
                element={<LandLoardreelsub />}
              />


              <Route path="property-list" element={<PropertyList />} />
              <Route path="add-property" element={<AddProperty />} />
              <Route path="police-verification" element={<PoliceVerification />} />

              <Route
                path="/landlord/property/edit/:id"
                element={<AddProperty />}
              />
              <Route
                path="/landlord/property/:id/edit"
                element={<EditProperty />}
              />
              <Route
                path="/landlord/property/edit/:id"
                element={<AddProperty />}
              />
              <Route path="room-overview" element={<RoomOverview />} />
              <Route path="property" element={<Property />} />
              <Route path="/landlord/expenses" element={<Expenses />} />
              <Route
                path="/landlord/announcement"
                element={<LandlordAnnouncements />}
              />
              <Route path="/landlord/dues" element={<Dues />} />
              <Route
                path="/landlord/tenantdues/:propertyId"
                element={<TenantDues />}
              />
              <Route
                path="/landlord/switch-requests"
                element={<LandlordSwitchRequests />}
              />
              <Route
                path="/landlord/switch-requests"
                element={<LandlordSwitchRequests />}
              />
              <Route path="property/:id" element={<PropertyDetail />} />
              <Route
                path="/landlord/property/:propertyId/rooms"
                element={<RoomOverview />}
              />
              <Route
                path="/landlord/visit-requests"
                element={<VisitRequest />}
              />
              <Route path="/landlord/collections" element={<Collections />} />
              <Route
                path="/landlord/allComplaints"
                element={<AllComplaints />}
              />
              <Route path="/landlord/duespackages" element={<DuePackages />} />
              <Route
                path="property/:propertyId/add-room"
                element={<RoomAdd />}
              />

              <Route path="roomform" element={<PropertyDetail />} />
              <Route path="tenants" element={<Tenants />} />
              <Route path="tenant-form" element={<TenantForm />} />
              <Route path="tenant-list" element={<TenantList />} />
              <Route path="reels" element={<Reel />} />
              <Route
                path="tenant-details/:tenantId"
                element={<TenantDetails />}
              />
            </Route>
            {/* Sub-Admin */}
            <Route path="/landlord/subadmin" element={<SubAdminDashboard />} />
            <Route path="/landlord/subadmin/list" element={<SubAdminList />} />
            <Route path="/landlord/subadmin/add" element={<AddSubAdmin />} />
            {/* Tenant Dashboard Section */}
            <Route
              path="/landlord/subscription-plans"
              element={<SubscriptionPlans />}
            />



            <Route path="/tenant" element={<TenantLayout />}>
              <Route index element={<TenantDashboard />} />
              <Route path="profile" element={<TenantProfile />} />
              <Route path="sidebar" element={<TenantSidebar />} />
              <Route path="properties" element={<TenantProperties />} />
              <Route
                path="properties/:id"
                element={<TenantPropertyDetails />}
              />
              <Route
                path="rent-payments/:tenantId"
                element={<RentPayments />}
              />
              <Route path="/tenant/police-verification" element={<TenantPoliceVerification />} />
              <Route path="/tenant/room-switch" element={<Roomswitch />} />
              <Route path="/tenant/rent-agreement" element={<MyAgreement />} />
              <Route path="maintenance" element={<MaintenanceRequests />} />
              <Route path="maintenance/request" element={<RequestForm />} />
              <Route path="lease" element={<LeaseAgreement />} />
              <Route path="bills" element={<TenantBills />} />
              <Route path="property" element={<PropertyPage />} />
              <Route path="rent" element={<RentPage />} />
              <Route
                path="property-reviews/:propertyId"
                element={<PropertyReviews />}
              />
              <Route
                path="maintenance-dashboard"
                element={<MaintenancePage />}
              />
              <Route path="propertyreviews" element={<PropertyReviews />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route
                path="announcements-dashboard"
                element={<AnnouncementsPage />}
              />
              <Route path="lease-dashboard" element={<LeasePage />} />
              <Route path="complaints/:tenantId" element={<Complaints />} />
              <Route
                path="property/:id/complaints"
                element={<LandlordComplaints />}
              />
              <Route
                path="announcements/:tenantId"
                element={<Announcements />}
              />
              <Route path="support" element={<Support />} />
              <Route path="/tenant/documents" element={<Documents />} />
              <Route path="/tenant/facilities" element={<Facilities />} />
            </Route>


            {/* PM Tenant  section ......------........................---  */}
            <Route path="/tenant_org_login" element={<TenantOrgLogin />} />
            <Route path="/pm_tenant" element={<PmTenantLayout />}>
              <Route index element={<PmTenantDashboard />} />
              <Route path="profile" element={<PmTenantProfile />} />
              <Route path="sidebar" element={<PmTenantSidebar />} />
              <Route path="properties" element={<PmTenantProperties />} />
              <Route
                path="properties/:id"
                element={<PmTenantPropertyDetails />}
              />
              <Route
                path="rent-payments/:tenantId"
                element={<PmRentPayments />}
              />
              <Route path="/pm_tenant/police-verification" element={<PmTenantPoliceVerification />} />

              <Route path="/pm_tenant/room-switch" element={<PmRoomswitch />} />
              <Route path="/pm_tenant/rent-agreement" element={<PmMyAgreement />} />
              <Route path="maintenance" element={<PmMaintenanceRequests />} />
              <Route path="maintenance/request" element={<PmRequestForm />} />
              <Route path="lease" element={<PmLeaseAgreement />} />
              <Route path="bills" element={<PmTenantBills />} />
              <Route path="property" element={<PmPropertyPage />} />
              <Route path="rent" element={<PmRentPage />} />
              {/* <Route
                path="property-reviews/:propertyId"
                element={<PmPropertyReviews />}
              /> */}
              <Route
                path="maintenance-dashboard"
                element={<PmMaintenancePage />}
              />
              {/* <Route path="propertyreviews" element={<PmPropertyReviews />} /> */}
              <Route path="contacts" element={<PmContactsPage />} />
              <Route
                path="announcements-dashboard"
                element={<PmAnnouncementsPage />}
              />
              <Route path="lease-dashboard" element={<PmLeasePage />} />
              <Route path="complaints/:tenantId" element={<PmComplaints />} />
              {/* <Route
                path="property/:id/complaints"
                element={<PmLandlordComplaints />}
              /> */}
              <Route
                path="announcements/:tenantId"
                element={<PmAnnouncements />}
              />
              <Route path="support" element={<PmSupport />} />
              <Route path="/pm_tenant/documents" element={<PmDocuments />} />
              <Route path="/pm_tenant/facilities" element={<PmFacilities />} />
            </Route>

            {/* ------------------------------------- PM tenant section ---END --------------  */}

            {/* Organization Section */}
            <Route path="/organization/login" element={<OrganizationLogin />} />
            <Route
              path="/organization/signup"
              element={<OrganizationSignup />}
            />


            {/* Moved here: top-level, absolute path */}
            <Route path="/organization" element={<OrganizationLayout />}>
              <Route
                path="/organization/organizationweb"
                element={<OrganizationWeb />}
              />
              <Route
                path="/organization/create-website"
                element={<CreateWebsite />}
              />

              <Route path="orgpolice-verification" element={<OrgPoliceVerification />} />
              <Route
                path="/organization/subscription-plans"
                element={<OrgSubscriptionPlans />}
              />
              <Route
                path="/organization/my-reel-subscriptions"
                element={<OrgMyReelSubscriptions />}
              />
              <Route
                path="/organization/organizationnavbar"
                element={<OrganizationNavbar />}
              />
              <Route path="sidebar" element={<OrgSidebar />} />
              <Route index element={<OrganizationDashboard />} />
              <Route path="dashboard" element={<OrganizationDashboard />} />
              <Route
                path="property-list"
                element={<OrganizationPropertyList />}
              />
              <Route
                path="add-property"
                element={<OrganizationAddProperty />}
              />
              <Route
                path="property-detail/:id"
                element={<OrganizationPropertyDetail />}
              />
              <Route
                path="property-reviews/:propertyId"
                element={<OrganizationPropertyFeedback />}
              />
              <Route
                path="property/:propertyId/rooms"
                element={<OrganizationRoomOverview />}
              />
              <Route
                path="property/:propertyId/room-add"
                element={<OrganizationRoomAdd />}
              />
              <Route
                path="property/:propertyId/rooms/:roomId/beds"
                element={<OrganizationViewBeds />}
              />
              <Route
                path="edit-property/:id"
                element={<OrganizationAddProperty />}
              />
              <Route
                path="visit-requests"
                element={<OrganizationVisitRequest />}
              />
              <Route
                path="dues-packages"
                element={<OrganizationDuesPackages />}
              />
              <Route path="announcements" element={<OrgAnnouncements />} />
              <Route path="switch-requests" element={<OrgSwitchRequests />} />
              <Route
                path="property/:id/complaints"
                element={<OrgComplaints />}
              />
              <Route path="expenses" element={<OrganizationExpenses />} />
              <Route path="dues" element={<OrganizationDues />} />
              <Route
                path="/organization/tenantdues/:propertyId"
                element={<OrganizationTenantDues />}
              />
              <Route path="collections" element={<OrganizationCollections />} />
              <Route path="tenants" element={<OrganizationTenant />} />
              <Route path="tenant-form" element={<OrganizationTenantForm />} />
              <Route path="tenant-list" element={<OrganizationTenantList />} />
              <Route
                path="tenant-details/:tenantId"
                element={<OrganizationTenantDetails />}
              />
              <Route path="reels" element={<OrganizationReels />} />
              <Route path="/organization/profile" element={<OrgProfile />} />
              //Organzation subadmin
              <Route
                path="add-regionalManager"
                element={<RegionalManagerDashboardOrg />}
              />
              <Route
                path="/organization/add-regionalManager"
                element={<AddRegionalManager />}
              />
              <Route
                path="/organization/list-RegionalManager"
                element={<RegionalManagerList />}
              />
              //Organization
              <Route path="departments" element={<OrganizationDepartments />} />
              <Route
                path="/organization/property/web-property-list"
                element={<WebProplist />}
              />
              <Route path="website-detail/:id" element={<WebsiteDetail />} />
              <Route
                path="/organization/property/web-edit-property/:id"
                element={<WebEditProp />}
              />
              Debugging Steps
              <Route path="property/tab-detail" element={<TabPropdtl />} />
            </Route>
            {/* Seller Section */}
            <Route path="/seller" element={<SellerLayout />}>
              <Route index element={<SellerHome />} />
              <Route path="home" element={<SellerHome />} />
              <Route path="sidebar" element={<Sidebar />} />
              <Route path="add-property" element={<AddPropertySeller />} />
              <Route path="edit-listings" element={<EditpropertySeller />} />
              <Route path="property" element={<SellerProperty />} />
              <Route path="property/:id" element={<SellerPropertyDetail />} />
              <Route path="reels" element={<SellerReels />} />

              <Route
                path="edit-property/:id"
                element={<EditPropertySeller />}
              />
              <Route path="seller-profile" element={<SellerProfile />} />
              <Route path="enquiries" element={<EnquiriesSeller />} />
              <Route path="subscription" element={<SellerSubscription />} />
              <Route path="/seller/my-subscriptions" element={<SellerMySubscriptions />} />
              <Route path="/seller/my-reel-subscriptions" element={<SellerMyReelSubscription />} />
            </Route>
            {/* Sub Owner Routes with Layout */}
            <Route path="/sub_owner" element={<SubOwnerLayout />}>
              <Route index element={<SubOwnerDashboard />} />
              <Route path="dashboard" element={<SubOwnerDashboard />} />
              <Route path="sub_owner_profile" element={<SubOwnerProfile />} />
              <Route path="police-verification" element={<SubOwnerPoliceVerification />} />
              <Route path="sub_owner_property" element={<SubOwnerProperty />} />
              <Route
                path="/sub_owner/property/:propertyId/add_room"
                element={<SubOwnerAddRooms />}
              />
              <Route path="complaints" element={<SubOwnerComplaints />} />
              <Route path="maintains" element={<SubOwnerMaintains />} />
              <Route path="dues" element={<SubOwnerDues />} />
              <Route path="collections" element={<SubOwnerCollections />} />
              <Route path="my_owner" element={<SubOwnerOwner />} />

              <Route path="/sub_owner/edit-tenant" element={<EditTenant />} />
              <Route
                path="/sub_owner/property/:propertyId"
                element={<SubOwnerPropertyDetail />}
              />
              <Route
                path="/sub_owner/sub_owner_add_tenant"
                element={<SubOwnerAddTenant />}
              />

              <Route
                path="/sub_owner/sub_owner_add_workers"
                element={<CreateWorkers />}
              />
              <Route
                path="/sub_owner/sub_owner_expenses"
                element={<SubOwnerexpenses />}
              />
              <Route
                path="/sub_owner/sub_owner_workers_list"
                element={<SubOwnerWorkers />}
              />
            </Route>
            {/* Login separate without sidebar */}
            <Route path="/sub_owner_login" element={<SubOwnerLogin />} />
            {/* // Organization manager route section  */}
            <Route path="/regional_manager" element={<RegionalManagerLayout />}>
              <Route index element={<RegionalManagerDashboard />} />
              <Route path="dashboard" element={<RegionalManagerDashboard />} />
              <Route
                path="regional_manager_profile"
                element={<RegionalManagerProfile />}
              />
              <Route
                path="regional_manager_property"
                element={<RegionalManagerProperty />}
              />
              <Route
                path="/regional_manager/property/:propertyId"
                element={<RegionalManagerPropertyDetail />}
              />
              <Route
                path="/regional_manager/assigned-property/:id"
                element={<AssignedPropertyDetail />}
              />
              <Route
                path="/regional_manager/add_property"
                element={<RegionalManagerAddProperty />}
              />
              <Route
                path="/regional_manager/edit-property"
                element={<RMEditProperty />}
              />

              <Route
                path="/regional_manager/property/:propertyId/add_room"
                element={<RegionalManagerAddRooms />}
              />
              <Route
                path="/regional_manager/assigned-add-room/:propertyId"
                element={<AssignedAddRoom />}
              />
              <Route
                path="complaints"
                element={<RegionalManagerComplaints />}
              />
              <Route path="maintains" element={<RegionalManagerMaintains />} />
              <Route path="dues" element={<RegionalManagerDues />} />
              <Route
                path="collections"
                element={<RegionalManagerCollections />}
              />
              <Route path="my_owner" element={<RegionalManagerOwner />} />
              <Route
                path="/regional_manager/edit-tenant"
                element={<RegionalManagerEditTenant />}
              />
              <Route
                path="/regional_manager/regional_manager_add_tenant"
                element={<RegionalManagerAddTenant />}
              />
              <Route
                path="/regional_manager/team_management"
                element={<TeamManagement />}
              />
              {/* <Route
  path="/regional_manager/team_management/View_workers"
  element={<ViewWorkers />}
/> */}
              <Route
                path="/regional_manager/team_management/view_managers"
                element={<ViewManagers />}
              />
              {/* <Route
  path="/regional_manager/team_management/add_worker_form"
  element={<AddWorkerForm />}
/> */}
              <Route
                path="/regional_manager/team_management/add_manager_form"
                element={<AddManagerForm />}
              />
              <Route
                path="/regional_manager/team_management/view_properties"
                element={<ViewProperties />}
              />

              {/* <Route
                path="/regional_manager/add_workers"
                element={<RegionalManagerCreateWorkers />}
              /> */}
              <Route
                path="/regional_manager/regional_manager_expenses"
                element={<RegionalManagerexpenses />}
              />
              <Route
                path="/regional_manager/regional_manager_workers_list"
                element={<RegionalManagerWorkers />}
              />
            </Route>
            {/* Login separate without sidebar */}
            <Route
              path="/regional_manager_login"
              element={<RegionalManagerLogin />}
            />
            {/* // -------------------------------// Organization manager route section End -----------------------------------------------  */}

            {/* //-------------------- Organization Propery owner route section-------------------------  */}
            <Route path="/property-owner" element={<PropertyOwnerLayout />}>
              <Route index element={<PropertyOwnerDashboard />} />
              <Route
                path="/property-owner/dashboard"
                element={<PropertyOwnerDashboard />}
              />
              <Route
                path="/property-owner/profile"
                element={<PropweryOwnerProfile />}
              />
            </Route>
            <Route
              path="/Property_Owner_login"
              element={<PropertyOwnerLogin />}
            />

            {/* // -------------------------------// Organization Propery owner route section End -----------------------------------------------  */}

            {/* //-------------------- Organization Propery worker Dashboard route section-------------------------  */}
            <Route path="/worker-dashboard" element={<WorkerLayout />}>
              <Route index element={<WorkerDashboard />} />
              <Route
                path="/worker-dashboard/dashboard"
                element={<WorkerDashboard />}
              />
              <Route
                path="/worker-dashboard/profile"
                element={<WorkerProfile />}
              />
            </Route>
            <Route
              path="/worker_login"
              element={<WorkerDashboardLogin />}
            />

            {/* // -------------------------------// Organization Propery owner route section End -----------------------------------------------  */}

            {/* //-------------------- Draze worker Dashboard route section-------------------------  */}
            <Route path="/dr-worker-dashboard" element={<DrWorkerLayout />}>
              <Route index element={<WorkerDashboardDr />} />
              <Route
                path="/dr-worker-dashboard/dashboard"
                element={<WorkerDashboardDr />}
              />
              <Route
                path="/dr-worker-dashboard/profile"
                element={<DrWorkerProfile />}
              />
            </Route>
            <Route
              path="/dr_worker_login"
              element={<WorkerDashboardLoginDr />}
            />

            {/* // -------------------------------// Organization Propery owner route section End -----------------------------------------------  */}

            {/* //--------------------------------// Organization tenant route section Start -----------------------------------------------  */}
            {/* //-------------------- Organization Propery mananger route section-------------------------  */}
            <Route path="/property-manager" element={<PropertyManagerLayout />}>
              <Route index element={<PropertyManagerDashboard />} />
              <Route
                path="/property-manager/dashboard"
                element={<PropertyManagerDashboard />}
              />
              <Route
                path="/property-manager/propertylist"
                element={<PropertyManagerPropertyLIst />}
              />
              <Route
                path="/property-manager/propertylist/:propertyId"
                element={<PropertyManagerPropertyDetails />}
              />

              <Route
                path="/property-manager/propertylist/:propertyId/roomowerview"
                element={<PropertyManagerRoomOwerView />}
              />
              <Route
                path="/property-manager/propertylist/:propertyId/room-form"
                element={<PropertyManagerPropertyRoomForm />}
              />
              // In your router (React‑Router v6)
              <Route
                path="/property-manager/propertylist/property/:propertyId/room/:roomId"
                element={<PropertyManagerRoomDetailPage />}
              />
              <Route
                path="/property-manager/propertylist/property/:propertyId/rooms/:roomId/beds"
                element={<PropertyManagerBedListPage />}
              />

              <Route
                path="/property-manager/dashdocument"
                element={<PropertyManagerPropertyDocuments />}
              />
              <Route
                path="/property-manager/propertylist/:propertyId/tenant"
                element={<PropertyManagerRoomTenant />}
              />
              <Route
                path="/property-manager/propertylist/:propertyId/announcements"
                element={<PropertyManagerPropertyAnnouncements />}
              />
              <Route
                path="/property-manager/propertylist/:propertyId/complaints"
                element={<PropertyManagerPropertyComplaints />}
              />
              <Route
                path="/property-manager/propertylist/:propertyId/duesin"
                element={<PropertyManagerPropertyduesin />}
              />
              <Route
                path="/property-manager/propertylist/:propertyId/PropertyExpenses"
                element={<PropertyManagerPropertyExpenses />}
              />

              <Route path="/property-manager/collection" element={<PropertyManagerCollection />} />
              <Route path="/property-manager/expenses" element={<PropertyManagerExpenses />} />
              <Route path="/property-manager/tenants" element={<PropertyManagerTenants />} />
              <Route path="/property-manager/tenant-details/:propertyId/:tenantId" element={<PropertyManagerTenantDetails />} />

              <Route
                path="/property-manager/profile"
                element={<PropweryManagerProfile />}
              />

              <Route
                path="/property-manager/roomswitch"
                element={<PropertyManagerRoomSwitch />}
              />
               <Route
                path="/property-manager/police-verfication"
                element={<PropertyMangerPoliceVerification />}
              />

              <Route
                path="/property-manager/dash-cmpln"
                element={<PropertyMangerDashCmpln />}
              />

              {/* <Route path="/property-manager/dash-cmpln" element={<PropertyMangerDashCmpln />} /> */}

              <Route
                path="/property-manager/pmadd-tenant"
                element={<PropertyManagerAddTenant />}
              />
              <Route
                path="/property-manager/add_workers"
                element={<PropweryManagerAddWorker />}
              />
              <Route
                path="/property-manager/workersList"
                element={<PropertyManagerWorkersList />}
              />
              <Route
                path="/property-manager/Dues"
                element={<PropertyManagerDuas />}
              />
            </Route>

            <Route
              path="/Property_manager_login"
              element={<PropertyManagerLogin />}
            />
            <Route path="/website/:orgId" element={<OrgWebsitePortal />} />

            {/* // -------------------------------// Organization Propery owner route section End -----------------------------------------------  */}
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;   
