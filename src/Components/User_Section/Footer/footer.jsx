import {
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaGooglePlay,
  FaApple,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import logo from "../../../assets/logo/logo.png";

const Footer = () => {
  const socialLinks = [
    {
      Icon: FaFacebook,
      link: "https://www.facebook.com/share/1GGgYbG1Zb/?mibextid=wwXIfr",
      gradient: "from-blue-500 to-blue-700",
    },
    {
      Icon: FaInstagram,
      link: "https://www.instagram.com/gharzoreality?igsh=MTVnYnhoNXkzeDkydA==",
      gradient: "from-pink-500 via-purple-500 to-yellow-500",
    },
    {
      Icon: FaYoutube,
      link: "https://youtube.com/@gharzoreality?si=zUXs0B8C8rw8hf8x",
      gradient: "from-red-500 to-red-700",
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-[#1E3A5F] to-[#2a4f7a] text-gray-300 pt-14 pb-6 px-4 md:px-20 mt-16">
      <div className="grid md:grid-cols-5 gap-10">
        {/* Company Info */}
        <div>
          <div className="inline-flex items-center justify-center bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-lg mb-4">
            <img
              src={logo}
              alt="GharZo"
              className="w-28 mb-3 drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]"
            />
          </div>

          <p className="text-sm leading-relaxed text-gray-300">
            Your trusted platform for exploring hostels, PGs, and premium
            properties across India. GharZo is your smart living solution.
          </p>
        </div>

        {/* Top Areas */}
        <div>
          <h3 className="text-xl font-semibold inline-block mb-4 bg-gradient-to-r from-orange-400 to-blue-400 text-transparent bg-clip-text">
            Top Areas
          </h3>
          <ul className="space-y-2 text-gray-300 text-base font-medium">
            <li>Rajwada</li>
            <li>Vijay Nagar</li>
            <li>LIG</li>
            <li>Station</li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-xl font-semibold inline-block mb-4 bg-gradient-to-r from-orange-500 to-blue-400 text-transparent bg-clip-text">
            Services
          </h3>
          <ul className="space-y-2 text-gray-300 text-base font-medium">
            <li>
              <a href="/rent" className="hover:text-white transition">
                Rent
              </a>
            </li>
            <li>
              <a href="/sale" className="hover:text-white transition">
                Buy
              </a>
            </li>
            <li>
              <a href="/commercial" className="hover:text-white transition">
                Commercial
              </a>
            </li>
            <li>
              <a href="/pg" className="hover:text-white transition">
                PG/Hostel
              </a>
            </li>
            <li>
              <a href="/franchise-request" className="hover:text-white transition">
              Franchise 
              </a>
            </li>
            <li>
              <a href="/services" className="hover:text-white transition">
                Services
              </a>
            </li>
            <li>
              <a href="/home-loan" className="hover:text-white transition">
                Home Loan
              </a>
            </li>
          </ul>
        </div>

        {/* Useful Links */}
        <div>
          <h3 className="text-xl font-semibold inline-block mb-4 bg-gradient-to-r from-orange-500 to-blue-400 text-transparent bg-clip-text">
            Useful Links
          </h3>
          <ul className="space-y-2 text-gray-300 text-base font-medium">
            <li>
              <a href="/" className="hover:text-white transition">
                Home
              </a>
            </li>

            <li>
              <a href="/about" className="hover:text-white transition">
                About Us
              </a>
            </li>
            <li>
              <a href="/blog" className="hover:text-white transition">
                Blog
              </a>
            </li>
            <li>
              <a href="/how-it-works" className="hover:text-white transition">
                How It Works
              </a>
            </li>
            <li>
              <a href="/privacy_refund" className="hover:text-white transition">
                Privacy, Refund & Cancellation, T&C
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-semibold inline-block mb-4 bg-gradient-to-r from-orange-600 to-blue-400 text-transparent bg-clip-text">
            Contact
          </h3>
          <ul className="space-y-3 text-gray-300 text-base font-medium">
            <li className="flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
               ABC,Indore
            </li>
            <li className="flex items-center gap-2">
              <EnvelopeIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <a
                href="mailto:support@GharZo.in"
                className="hover:text-white transition"
              >
                support@GharZo.in
              </a>
            </li>
            <li className="flex items-center gap-2">
              <PhoneIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
              <a
                href="tel:+919876543210"
                className="hover:text-white transition"
              >
                +91 98765 43210
              </a>
            </li>
          </ul>

          {/* Social Icons */}
          <div className="flex gap-3 mt-4 text-xl flex-wrap">
            {socialLinks.map(({ Icon, link, gradient }, idx) => (
              <a
                href={link}
                key={idx}
                className={`bg-gradient-to-br ${gradient} p-2 rounded-full
                  text-white shadow-lg hover:shadow-xl
                  transition transform hover:scale-110 hover:rotate-6 active:scale-95`}
                style={{
                  boxShadow:
                    "0 6px 12px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.25)",
                }}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* App Download Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            {/* App Store Button */}
            {/* 
              href="#"
              className="flex items-center gap-3 bg-white text-black px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition transform hover:scale-105 active:scale-95"
            >
              <FaApple className="w-7 h-7" />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] uppercase font-medium">
                  Download on the
                </span>
                <span className="text-sm font-semibold">App Store</span>
              </div>
            </a> */}

            {/* Google Play Button */}
            {/* 
              href="https://play.google.com/store/apps/details?id=com.acore.draze&pcampaignid=web_share"
              className="flex items-center gap-3 bg-white text-black px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition transform hover:scale-105 active:scale-95"
            >
              <FaGooglePlay className="w-7 h-7" />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] uppercase font-medium">
                  GET IT ON
                </span>
                <span className="text-sm font-semibold">Google Play</span>
              </div>
            </a> */}
          </div>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="mt-10 border-t border-gray-700 pt-4 text-center text-sm text-white">
        © {new Date().getFullYear()} GharZo – All rights reserved
      </div>
    </footer>
  );
};

export default Footer;