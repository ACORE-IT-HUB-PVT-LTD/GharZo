
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

const CardCarousel = ({ items }) => {
  return (
    <Swiper
      modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
      spaceBetween={80}
      effect="coverflow"
      grabCursor
      centeredSlides
      slidesPerView="auto"
      loop
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      pagination={{ clickable: true }}
      navigation
      coverflowEffect={{
        rotate: 0,
        stretch: 0,
        depth: 100,
        modifier: 2.5,
      }}
      className="pb-16"
    >
      {items.map((property) => (
        <SwiperSlide key={property.id} style={{ width: "300px" }}>
          <div className="bg-gray-50 rounded-xl shadow hover:shadow-lg transition overflow-hidden">
            <img
              src={property.image}
              alt={property.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-[#5C4EFF] mb-2">
                {property.title}
              </h3>
              <p className="text-gray-700">{property.description}</p>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default CardCarousel;


