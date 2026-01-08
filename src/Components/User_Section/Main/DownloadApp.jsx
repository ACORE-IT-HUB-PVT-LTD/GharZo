import { motion } from "framer-motion";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { MdApartment, MdOutlineHotel, MdEventAvailable } from "react-icons/md";
import appMockup from "../../../assets/Images/appMockup.png"; // your app mockup image
import logo from "../../../assets/logo/logo.png";

const DownloadApp = () => {
  return (
    <section className="w-full bg-gradient-to-br from-[#1E3A5F] to-[#2a4f7a] text-white py-16 px-6 md:px-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          {/* Logo */}
          <img src={logo} alt="GharZo Logo" className="w-40 md:w-52" />

          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            Download{" "}
            <span className="bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
              GharZo App
            </span>
          </h2>
          <p className="text-gray-300 text-lg">
            Your trusted platform for exploring{" "}
            <span className="font-semibold">hostels</span>,{" "}
            <span className="font-semibold">PGs</span>,{" "},
            <span className="font-semibold">premium properties</span> across
            India. GharZo is your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-orange-500 bg-clip-text text-transparent">
              smart living solution.
            </span>
          </p>

          {/* Feature Icons */}
          <div className="flex gap-6">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="bg-gradient-to-r from-blue-500 to-orange-500 p-4 rounded-2xl shadow-lg"
            >
              <MdOutlineHotel size={30} />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="bg-gradient-to-r from-blue-500 to-orange-500 p-4 rounded-2xl shadow-lg"
            >
              <MdApartment size={30} />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="bg-gradient-to-r from-blue-500 to-orange-500 p-4 rounded-2xl shadow-lg"
            >
              <MdEventAvailable size={30} />
            </motion.div>
          </div>

          {/* Download Buttons */}
          <div className="flex gap-4 mt-6 flex-nowrap">
            <a
              href="https://play.google.com/store/apps/details?id=com.acore.draze&pcampaignid=web_share&pli=1"
              className="flex items-center gap-2 bg-white text-black px-4 py-2 md:px-5 md:py-3 rounded-xl shadow hover:scale-105 transition w-[140px] md:w-[180px] lg:w-[280px] lg:h-[80px]"
            >
              <FaApple size={20} className="md:size-24 lg:size-10" />
              <div className="leading-tight">
                <p className="text-[10px] md:text-xs">Download on the</p>
                <p className="font-semibold text-xs md:text-sm">App Store</p>
              </div>
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.acore.draze&pcampaignid=web_share&pli=1"
              className="flex items-center gap-2 bg-orange-700 px-4 py-2 md:px-5 md:py-3 rounded-xl shadow hover:scale-105 transition w-[140px] md:w-[180px] lg:w-[280px] lg:h-[80px]"
            >
              <FaGooglePlay size={20} className="md:size-24 lg:size-10" />
              <div className="leading-tight">
                <p className="text-[12px] md:text-xs">Get it on</p>
                <p className="font-semibold text-xs md:text-sm">Google Play</p>
              </div>
            </a>
          </div>
        </motion.div>

        {/* Right Mockup */}
        {/* <motion.div
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex justify-center md:justify-end"
        >
          <motion.img
            src={appMockup}
            alt="GharZo App Mockup"
            className="w-64 md:w-96 drop-shadow-2xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          />
        </motion.div> */}
      </div>
    </section>
  );
};

export default DownloadApp;
