import React from "react";
import useDarkMode from "@/hooks/useDarkMode";
import { Link } from "react-router-dom";
import useWidth from "@/hooks/useWidth";

import NasiyeLogoRed from "@/assets/images/logo/nasiye.png";
import NasiyeLogoWhite from "@/assets/images/logo/nasiye.png";

const Logo = () => {
  const [isDark] = useDarkMode();
  const { width, breakpoints } = useWidth();

  return (
    <div>
      <Link to="/dashboard">
        <img
          src={isDark ? NasiyeLogoWhite : NasiyeLogoRed}
          alt="Nasiye Logo"
          style={{ height: 36, maxWidth: 160 }}
        />
      </Link>
    </div>
  );
};

export default Logo;
