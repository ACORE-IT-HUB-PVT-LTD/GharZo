import React from "react";
import { CheckCircle, ShieldCheck, UserPlus, Search, CalendarCheck, CreditCard, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const HowItWorks = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const steps = [
    {
      icon: Search,
      title: "Explore Properties",
      description: "Browse verified PGs, hostels, and premium rentals across top cities. Use filters for budget, location, amenities, and more.",
      color: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    {
      icon: CalendarCheck,
      title: "Check Availability",
      description: "Real-time calendar view helps you confirm availability instantly. Plan your bookings around your schedule hassle-free.",
      color: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50"
    },
    {
      icon: CreditCard,
      title: "Secure Booking",
      description: "Pay securely via UPI, cards, or net banking. Booking confirmation and property details are sent instantly to your inbox.",
      color: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50"
    }
  ];

  const trustFeatures = [
    {
      icon: ShieldCheck,
      text: "Verified listings & reviews",
      color: "text-green-600"
    },
    {
      icon: CheckCircle,
      text: "Instant booking confirmation",
      color: "text-blue-600"
    },
    {
      icon: UserPlus,
      text: "Friendly onboarding for hosts",
      color: "text-purple-600"
    }
  ];

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-20 px-6 md:px-16 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20 max-w-4xl mx-auto relative z-10"
      >
        <h1 className="text-4xl md:text-6xl font-bold bg-blue-900 bg-clip-text text-transparent mb-6">
          How GharZo Works
        </h1>
        <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
          Your complete guide to discovering and booking the perfect stay, venue, or rental property — powered by technology and trust.
        </p>
      </motion.div>

      {/* Steps with connecting lines */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative max-w-7xl mx-auto mb-32"
      >
        {/* Desktop connecting line */}
        <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-emerald-200 z-0"></div>
        
        <div className="grid gap-8 md:grid-cols-3 relative z-10">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative group"
            >
              {/* Step Number Badge */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-white to-gray-100 rounded-full shadow-lg flex items-center justify-center border-4 border-white z-20">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {index + 1}
                </span>
              </div>

              {/* Card */}
              <div className={`relative bg-gradient-to-br ${step.bgGradient} rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 backdrop-blur-sm overflow-hidden`}>
                {/* Decorative corner gradient */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${step.color} opacity-10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2`}></div>
                
                {/* Icon Container */}
                <div className={`relative w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="text-white w-8 h-8" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow indicator (visible on hover) */}
                <div className="mt-4 flex items-center gap-2 text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm">Learn more</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Trust Section with modern layout */}
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&q=80"
                alt="Trust and Support"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 via-transparent to-transparent"></div>
              
              {/* Floating badge */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md rounded-2xl px-6 py-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Verified Properties</p>
                    <p className="text-2xl font-bold text-gray-800">10,000+</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-3xl opacity-20 -z-10"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 -z-10"></div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verified</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
              Built on Trust<br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                & Support
              </span>
            </h2>

            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Every GharZo-listed property is verified and reviewed. Our support team is available 24/7 to help you with any issues — from booking to moving in.
            </p>

            {/* Trust Features */}
            <div className="space-y-4">
              {trustFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ x: 10 }}
                  className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color === 'text-green-600' ? 'from-green-100 to-emerald-100' : feature.color === 'text-blue-600' ? 'from-blue-100 to-cyan-100' : 'from-purple-100 to-pink-100'} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`${feature.color} w-6 h-6`} />
                  </div>
                  <span className="text-gray-700 font-semibold text-lg">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-6">
              {[
                { label: "Happy Users", value: "50K+" },
                { label: "Properties", value: "10K+" },
                { label: "Cities", value: "100+" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Call to Action - Uncomment if needed */}
      {/* <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-32 text-center relative z-10"
      >
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 rounded-3xl p-12 shadow-2xl">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to start your smart living journey?
          </h3>
          <p className="text-blue-100 text-lg mb-8">
            Discover verified properties and book your perfect stay today
          </p>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/properties"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:shadow-xl transition-all duration-300"
          >
            <span>Explore Listings</span>
            <ArrowRight className="w-5 h-5" />
          </motion.a>
        </div>
      </motion.div> */}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

export default HowItWorks;