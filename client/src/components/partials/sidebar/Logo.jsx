import React from "react";
import { Link } from "react-router-dom";
import useDarkMode from "@/hooks/useDarkMode";
import useSidebar from "@/hooks/useSidebar";
import useSemiDark from "@/hooks/useSemiDark";

// Nasiye logo assets
import NasiyeLogoRed from "@/assets/images/logo/nasiye.png";
import NasiyeLogoWhite from "@/assets/images/logo/nasiye.png";

const SidebarLogo = ({ menuHover }) => {
  const [isDark] = useDarkMode();
  const [collapsed, setMenuCollapsed] = useSidebar();
  const [isSemiDark] = useSemiDark();

  return (
    <div
      className={`logo-segment flex flex-col items-center justify-center bg-white dark:bg-gray-800 z-[9] py-6 px-4 ${menuHover ? "logo-hovered" : ""}`}
    >
      <Link to="/dashboard">
        <div className="flex flex-col items-center justify-center">
          <div className="logo-icon h-[40px] flex items-center justify-center">
            <img
              src={isDark || isSemiDark ? NasiyeLogoWhite : NasiyeLogoRed}
              alt="Nasiye Logo"
              className="h-full"
              style={{ maxHeight: 40 }}
            />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SidebarLogo;
