"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type BrandItem = {
  name: string;
  image: string;
};

type BrandsCarouselProps = {
  brands: readonly BrandItem[];
};

function BrandRow({
  brands,
  reverse = false,
}: {
  brands: readonly BrandItem[];
  reverse?: boolean;
}) {
  const loopedBrands = [...brands, ...brands];

  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <motion.div
        className="flex w-max gap-5 py-3"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {loopedBrands.map((brand, index) => (
          <div
            key={`${brand.name}-${index}`}
            className="group relative h-32 w-64 flex-shrink-0 rounded-2xl border border-slate-200 bg-white/95 shadow-sm transition-all duration-500 [transform:perspective(900px)_rotateY(-8deg)] hover:-translate-y-1 hover:shadow-xl hover:[transform:perspective(900px)_rotateY(0deg)]"
          >
            <Image
              src={brand.image}
              alt={brand.name}
              fill
              loading="lazy"
              sizes="256px"
              className="object-contain p-4 transition duration-500 group-hover:scale-105"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function BrandsCarousel({ brands }: BrandsCarouselProps) {
  return (
    <div className="space-y-3">
      <BrandRow brands={brands} />
      <BrandRow brands={brands} reverse />
    </div>
  );
}
