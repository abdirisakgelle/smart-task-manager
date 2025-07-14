import { useState, useEffect } from "react";

export default function useWidth() {
  const [width, setWidth] = useState(() => {
    // Safely get initial width, fallback to 1024 if window is not available
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1024; // Default fallback
  });

  // breakpoints
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    // Only add event listener if window is available
    if (typeof window !== 'undefined') {
      window.addEventListener("resize", handleResize);
      
      // Cleanup function
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  return { width, breakpoints };
}
