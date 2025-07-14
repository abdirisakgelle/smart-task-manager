import React from "react";
import { Link } from "react-router-dom";

// Import Nasiye logo
import NasiyeLogo from "@/assets/images/logo/nasiye.png";

const SidebarLogo = ({ menuHover }) => {
  return (
    <div className="brand-header py-8">
      <Link to="/dashboard" className="flex justify-center items-center">
        <img
          src={NasiyeLogo}
          alt="Nasiye Logo"
          className={`transition-all duration-200 max-h-none ${
            menuHover ? 'w-[240px] px-2' : 'w-[50px]'
          }`}
          style={{ 
            objectFit: 'contain',
            filter: 'brightness(0) invert(1) contrast(1.2)'
          }}
        />
      </Link>
    </div>
  );
};

export default SidebarLogo;
