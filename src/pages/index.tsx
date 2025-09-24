// Redirect to enhanced portfolio
import React, { useEffect, useState } from "react";
import { navigate } from "gatsby";
import { motion } from "framer-motion";

const IndexPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add a small delay for a smoother transition
    const timer = setTimeout(() => {
      navigate("/enhanced-portfolio");
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1a1b26] z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-24 h-24 rounded-lg bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-3xl">RF</span>
        </div>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[#a9b1d6] font-medium"
        >
          Loading experience...
        </motion.div>
      </motion.div>
    </div>
  );
};

export default IndexPage;
