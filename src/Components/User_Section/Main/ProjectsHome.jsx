import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://api.gharzoreality.com/api/projects'
        );
        const data = await response.json();

        if (data.success && data.data) {
          // Sort by createdAt (most recent first) and take top 5
          const recentProjects = data.data
            .filter((project) => project.visibility === 'Published' && !project.isDeleted)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

          setProjects(recentProjects);
        } else {
          setError('Failed to fetch projects');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleViewDetails = (project) => {
    navigate('/projects', {
      state: {
        openProject: project,
        openProjectId: project?._id || null,
        openProjectSlug: project?.slug || null,
      },
    });
  };

  const handleViewAll = () => {
    navigate('/projects');
  };

  // Get primary image from project media
  const getPrimaryImage = (project) => {
    if (project.media?.images && project.media.images.length > 0) {
      const primaryImage = project.media.images.find((img) => img.isPrimary);
      return primaryImage
        ? primaryImage.url
        : project.media.images[0].url;
    }
    return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';
  };

  // Get price range string
  const getPriceRange = (project) => {
    const pricing = project.pricing?.priceRange;
    if (!pricing) return null;
    const formatPrice = (val) => {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(0)} L`;
      return `₹${val.toLocaleString()}`;
    };
    return `${formatPrice(pricing.min)} – ${formatPrice(pricing.max)}`;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Ready to Move':
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'Under Construction':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    }
  };

  if (loading) {
    return (
      <section className="py-20 px-6 bg-gradient-to-b from-[#0c2344] to-[#0b4f91] text-white overflow-hidden min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-400/30 border-t-orange-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-400 font-semibold">Loading projects...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 px-6 bg-gradient-to-b from-[#0c2344] to-[#0b4f91] text-white overflow-hidden min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-semibold">Error: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-[#0c2344] to-[#0b4f91] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-orange-400 font-semibold text-sm uppercase tracking-wider">
            ✨ Explore New Projects
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mt-4">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Featured Projects
            </span>
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto mt-6 rounded-full" />
          <p className="mt-6 text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Discover premium residential projects crafted for modern living — luxury, comfort and connectivity at every corner
          </p>
        </motion.div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {projects.map((project, index) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.7 }}
                    className="group relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer h-80 sm:h-96 md:h-[500px] bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${getPrimaryImage(project)})`,
                    }}
                  >
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* Status Badge - Top Left */}
                    {project.projectStatus?.status && (
                      <div className="absolute top-4 left-4 z-10">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm ${getStatusColor(
                            project.projectStatus.status
                          )}`}
                        >
                          {project.projectStatus.status}
                        </span>
                      </div>
                    )}

                    {/* Premium / Featured Badge - Top Right */}
                    {(project.isFeatured || project.isPremium) && (
                      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 items-end">
                        {project.isFeatured && (
                          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-500/30 text-orange-300 border border-orange-500/40 backdrop-blur-sm">
                            ⭐ Featured
                          </span>
                        )}
                        {project.isPremium && (
                          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/30 text-purple-300 border border-purple-500/40 backdrop-blur-sm">
                            👑 Premium
                          </span>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-left">
                      <h3 className="text-xl sm:text-2xl md:text-4xl font-bold text-white line-clamp-2">
                        {project.projectName}
                      </h3>

                      {project.tagline && (
                        <p className="text-orange-300 text-xs sm:text-sm italic mt-1 line-clamp-1">
                          "{project.tagline}"
                        </p>
                      )}

                      <p className="text-sm sm:text-base md:text-lg text-gray-200 mt-2">
                        {project.location?.locality || project.location?.area || 'Unknown'},{' '}
                        {project.location?.city || ''}
                      </p>

                      {/* Property Types */}
                      {project.propertyTypes && project.propertyTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.propertyTypes.slice(0, 3).map((type, i) => (
                            <span
                              key={i}
                              className="text-xs bg-white/10 text-white px-2 py-0.5 rounded-full border border-white/20"
                            >
                              {type}
                            </span>
                          ))}
                          {project.propertyTypes.length > 3 && (
                            <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded-full border border-white/20">
                              +{project.propertyTypes.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price Range */}
                      {getPriceRange(project) && (
                        <p className="text-orange-400 font-bold text-lg sm:text-xl md:text-2xl mt-3">
                          {getPriceRange(project)}
                        </p>
                      )}

                      {/* Developer & Button Row */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 md:mt-8">
                        <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-tight">
                          By{' '}
                          <span className="font-semibold text-white">
                            {project.developer?.name || 'Developer'}
                          </span>
                        </p>

                        <button
                          onClick={() => handleViewDetails(project)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg flex items-center gap-3 transition-all hover:shadow-xl whitespace-nowrap"
                        >
                          <svg
                            className="w-3 h-3 md:w-4 md:h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View Details
                        </button>
                      </div>
                    </div>

                    {/* Next arrow (only on non-last items) */}
                    {index < projects.length - 1 && (
                      <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* View All Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex justify-center mt-12 md:mt-16"
            >
              <button
                onClick={handleViewAll}
                className="group bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold px-8 md:px-12 py-3 md:py-4 rounded-xl shadow-lg flex items-center gap-3 transition-all hover:shadow-2xl text-base md:text-lg"
              >
                <span>View All Projects</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center py-12"
          >
            <p className="text-gray-300 text-lg font-medium">
              No projects found
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Projects;
