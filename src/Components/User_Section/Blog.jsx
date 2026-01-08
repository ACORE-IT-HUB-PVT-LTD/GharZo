import React from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, TrendingUp, Bookmark } from "lucide-react";

const blogs = [
  {
    id: 1,
    title: "Why GharZo is the Future of Smart Living in India",
    summary:
      "Discover how GharZo is revolutionizing property search, offering a seamless experience for students, families, and event planners.",
    date: "August 1, 2025",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&q=80",
  },
  {
    id: 2,
    title: "Top Benefits of Booking PGs & Hostels through GharZo",
    summary:
      "From verified listings to real-time availability and secure bookings, learn why GharZo is trusted by thousands of students and working professionals.",
    date: "July 24, 2025",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&q=80",
  },
  {
    id: 3,
    title: "Planning a Wedding or Corporate Event? GharZo Has You Covered",
    summary:
      "Explore top  rental, event spaces, and customized booking services across major Indian cities with GharZo.",
    date: "July 10, 2025",
    image:
      "https://images.unsplash.com/photo-1556012018-4b3cd3042e78?auto=format&q=80",
  },
  {
    id: 4,
    title: "5 Things to Check Before Renting a Property on GharZo",
    summary:
      "Ensure a smooth move-in by knowing what to look for—lease terms, amenities, location insights, and more, all made simple through GharZo.",
    date: "June 28, 2025",
    image:
      "https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&q=80",
  },
  {
    id: 5,
    title: "GharZo Verified Properties: Why Verification Matters",
    summary:
      "We ensure peace of mind by verifying owners, documents, and locations—because your comfort and safety is our priority.",
    date: "June 10, 2025",
    image:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&q=80",
  },
  {
    id: 6,
    title: "How GharZo Supports Students Moving to New Cities",
    summary:
      "From local PGs to budget hostels with high-speed internet and food services, GharZo makes student life easier in metro cities.",
    date: "May 28, 2025",
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&q=80",
  },
];

const BlogPage = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
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

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 pb-20 px-6 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header Section - Magazine Style */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-20 max-w-4xl mx-auto relative z-10"
      >
  
        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
            GharZo Blog
          </span>
        </h1>

        {/* Decorative Line */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-cyan-500"></div>
          <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
          <div className="w-24 h-px bg-gradient-to-r from-cyan-500 to-blue-500"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="w-12 h-px bg-gradient-to-r from-blue-500 to-transparent"></div>
        </div>

        {/* Description */}
        <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
          Get expert tips, discover smart rental solutions, explore event planning guides, and stay ahead with real estate trends—only at GharZo.
        </p>

        {/* Stats Row */}
        <div className="flex items-center justify-center gap-8 mt-10">
          {[
            { label: "Articles", value: "50+" },
            { label: "Readers", value: "10K+" },
            { label: "Topics", value: "15+" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="text-center"
            >
              <p className="text-2xl md:text-3xl font-bold text-cyan-400">{stat.value}</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Blog Cards - Asymmetric Magazine Layout */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto relative z-10"
      >
        {/* Featured Post (First Blog - Large) */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="relative group overflow-hidden rounded-3xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Image Side */}
              <div className="relative h-80 lg:h-auto overflow-hidden">
                <img
                  src={blogs[0].image}
                  alt={blogs[0].title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                
                {/* Featured Badge */}
                <div className="absolute top-6 left-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                  ⭐ FEATURED
                </div>

                {/* Bookmark Icon */}
                <button className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-all duration-300">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>

              {/* Content Side */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                {/* Date */}
                <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{blogs[0].date}</span>
                </div>

                {/* Title */}
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-cyan-400 transition-colors duration-300">
                  {blogs[0].title}
                </h2>

                {/* Summary */}
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  {blogs[0].summary}
                </p>

                {/* Read More Button */}
                <button className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 group/btn w-fit">
                  <span>Read Full Story</span>
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Regular Posts Grid (Remaining Blogs) */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogs.slice(1).map((blog, index) => (
            <motion.div
              key={blog.id}
              variants={itemVariants}
              className="group"
            >
              <div className="relative h-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20">
                {/* Image Container */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent"></div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/80 via-blue-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Bookmark Button */}
                  <button className="absolute top-4 right-4 w-9 h-9 bg-slate-900/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-cyan-500 transition-all duration-300">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                    <Calendar className="w-3 h-3" />
                    <span>{blog.date}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors duration-300 line-clamp-2">
                    {blog.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                    {blog.summary}
                  </p>

                  {/* Read More Link */}
                  <button className="inline-flex items-center gap-2 text-cyan-400 font-semibold text-sm pt-2 group-hover:gap-3 transition-all duration-300">
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom Gradient Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Newsletter CTA Section */}
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
  className="mt-20 max-w-4xl mx-auto relative z-10"
>
  <div
    className="
      relative overflow-hidden rounded-3xl
      bg-gradient-to-r from-[#0f2a44] via-[#1e4b7a] to-[#ea580c]
      p-12 text-center shadow-2xl
    "
  >
    {/* Decorative glow elements */}
    <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
    <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

    <div className="relative z-10">
      <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
        Ready to Find Your Perfect Space?
      </h3>

      <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
        Join thousands of satisfied customers who found their ideal property with GharZo.
      </p>

      <button
        className="
          px-10 py-4 bg-white text-[#0f2a44]
          rounded-full font-bold text-lg
          shadow-xl transition-all duration-300
          hover:bg-orange-50 hover:scale-105
          active:scale-95
        "
      >
        Get Started Today
      </button>
    </div>
  </div>
</motion.div>



      {/* Custom CSS for animations */}
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

export default BlogPage;