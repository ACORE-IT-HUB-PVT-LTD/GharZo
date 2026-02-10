import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "../Components/User_Section/Navbar/navbar";
import Footer from "../Components/User_Section/Footer/footer";
import AdsPopup from "../Components/User_Section/AdsPopup.jsx";
import MainPage from "../Components/User_Section/Main/MainPage";
import AllProperty from "../Components/User_Section/AllProperty/AllProperty";
import PropertyDetails from "../Components/User_Section/AllProperty/PropertyDetails";
import PG from "../Components/User_Section/PG/PG";
import Reel from "../Components/User_Section/Reels/Reel";
import PgDetails from "../Components/User_Section/PG/PgDetails";
import RentProperty from "../Components/User_Section/RentProperty/RentProperty";
import SellProperty from "../Components/User_Section/SellProperty/SellProperty";
import Contact from "../Components/User_Section/Contact/Contact";
import Hostel from "../Components/User_Section/Hostel/Hostel";
import HostelDetail from "../Components/User_Section/Hostel/HostelDetail";
import RentPropertyDetail from "../Components/User_Section/RentProperty/RentPropertyDetails";
import SellPropertyDetail from "../Components/User_Section/SellProperty/SellPropertyDetail";
import BlogPage from "../Components/User_Section/Blog.jsx";
import HowItWorks from "../Components/User_Section/HowItWorks";
import PrivacyRefund from "../Components/User_Section/PrivacyRefund/PrivacyRefund.jsx";
import AboutUs from "../Components/User_Section/About/AboutUs";
import AddChannelPartner from "../Components/User_Section/Main/AddChannelPartner.jsx";
import HomeLoan from "../Components/User_Section/Main/HomeLoan.jsx";
import FranchiseRequest from "../Components/User_Section/Main/FranchiseRequest.jsx";
import PropertyDetailMain from "../Components/User_Section/Main/City/PropertyDetailMain.jsx";
import PropertyListMain from "../Components/User_Section/Main/City/PropertyListMain.jsx";
import RentListingPage from "../Components/User_Section/Main/RentListingPage.jsx";
import SaleListingPage from "../Components/User_Section/Main/SaleListingPage.jsx";
import RoomsListingPage from "../Components/User_Section/Main/RoomsListingPage.jsx";
import CommercialListingPage from "../Components/User_Section/Main/CommercialListingPage.jsx";
import PGHostelSection from "../Components/User_Section/Main/PGHostelSection.jsx";
import HostelsListingPage from "../Components/User_Section/Main/HostelsListingPage.jsx";
import ServicesListingPage from "../Components/User_Section/Main/ServicesListingPage.jsx";
import AddListingForm from "../Components/User_Section/Main/AddListingForm.jsx";
import RentalPropety from "../Components/User_Section/Main/RentalPropety.jsx";
import Login from "../Components/User_Section/Login&Signup/Login.jsx";
import UserSignup from "../Components/User_Section/Login&Signup/UserSignup.jsx";
import LandloardLogin from "../Components/LandLoard/LandloardLogin&Reg/LandloardLogin.jsx";
import LandloardSignup from "../Components/LandLoard/LandloardLogin&Reg/LandloardSignup.jsx";
import TenantLogin from "../Components/TenantSection/TenantLogin&Reg/TenantLogin.jsx";
import TenantSignup from "../Components/TenantSection/TenantLogin&Reg/TenantSignup.jsx";
import MyVisits from "../Components/User_Section/ScheduleTour/MyVisits.jsx";
import FranchiseEnquiry from "../Components/User_Section/Enquiries/FranchiseEnquiry.jsx";
import HomeLoanEnquiry from "../Components/User_Section/Enquiries/HomeLoanEnquiry.jsx";
import ChannelPartnerEnquiry from "../Components/User_Section/Enquiries/ChannelPartnerEnquiry.jsx";
import PropertyRegistrationMortgage from "../Components/User_Section/Main/PropertyRegistrationMortgage.jsx";

const PublicLayout = () => {
  const location = useLocation();

  // /reels pe Navbar aur Footer dono hide
  const isReelsPage = location.pathname === "/reels";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar sirf tab show hoga jab /reels nahi hai */}
      {!isReelsPage && <Navbar />}

      <AdsPopup />

      {/* 
        pt-20 sirf tab lagega jab Navbar dikha raha ho.
        /reels pe Navbar nahi hai toh top padding 0 rakho taaki
        ReelsPage apna full-screen layout khud manage kar sake.
      */}
      <div className={`flex-grow ${isReelsPage ? "pt-0" : "pt-20"}`}>
        <Routes>
          <Route path="/add-channel-partner" element={<AddChannelPartner />} />
          <Route path="/home-loan" element={<HomeLoan />} />
          <Route path="/franchise-request" element={<FranchiseRequest />} />
          <Route path="/property-registration-mortgage" element={<PropertyRegistrationMortgage />} />
          <Route path="/enquiry/franchise" element={<FranchiseEnquiry />} />
          <Route path="/enquiry/home-loan" element={<HomeLoanEnquiry />} />
          <Route path="/enquiry/channel-partner" element={<ChannelPartnerEnquiry />} />
          <Route index element={<MainPage />} />
          <Route path="/properties" element={<AllProperty />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/reels" element={<Reel />} />
          <Route path="/pg" element={<PG />} />
          <Route path="/pg/:id" element={<PgDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/hostel" element={<Hostel />} />
          <Route path="/hostel/:id" element={<HostelDetail />} />
          <Route path="/toparea" element={<PropertyListMain />} />
          <Route path="/rentalpropety" element={<RentalPropety />} />
          <Route path="/details/:name" element={<PropertyDetailMain />} />
          <Route path="/rent" element={<RentListingPage />} />
          <Route path="/sale" element={<SaleListingPage />} />
          <Route path="/rooms" element={<RoomsListingPage />} />
          <Route path="/commercial" element={<CommercialListingPage />} />
          <Route path="/pg-hostel" element={<PGHostelSection />} />
          <Route path="/hostels" element={<HostelsListingPage />} />
          <Route path="/services" element={<ServicesListingPage />} />
          <Route path="/add-listing" element={<AddListingForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signupuser" element={<UserSignup />} />
          <Route path="/landlord_login" element={<LandloardLogin />} />
          <Route path="/landlord_signup" element={<LandloardSignup />} />
          <Route path="/tenant_login" element={<TenantLogin />} />
          <Route path="/tenant_signup" element={<TenantSignup />} />
          <Route path="/rent-property" element={<RentProperty />} />
          <Route path="/rent/:id" element={<RentPropertyDetail />} />
          <Route path="/sell-property" element={<SellProperty />} />
          <Route path="/sell/:propertyId" element={<SellPropertyDetail />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/my-visits" element={<MyVisits />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/privacy_refund" element={<PrivacyRefund />} />
        </Routes>
      </div>

      {/* Footer bhi /reels pe hide */}
      {!isReelsPage && <Footer />}
    </div>
  );
};

export const publicRoutes = (
  <Route path="*" element={<PublicLayout />} />
);