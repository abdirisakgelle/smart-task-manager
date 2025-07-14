import React from "react";
import * as PhosphorIcons from "@phosphor-icons/react";

const Icon = ({ icon, className = "", width = "24", rotate, hFlip, vFlip }) => {
  // Convert icon name to proper format (e.g., "squares-four" -> "SquaresFour")
  const formatIconName = (name) => {
    // Remove "ph:" prefix if present
    const cleanName = name.startsWith("ph:") ? name.slice(3) : name;
    
    // Convert kebab-case to PascalCase
    return cleanName
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  };

  const iconName = formatIconName(icon);
  const PhosphorIcon = PhosphorIcons[iconName];

  if (!PhosphorIcon) {
    console.warn(`Icon not found: ${icon}`);
    return null;
  }

  return (
    <PhosphorIcon
      className={className}
      size={width}
      style={{
        transform: `
          ${rotate ? `rotate(${rotate}deg)` : ''}
          ${hFlip ? 'scaleX(-1)' : ''}
          ${vFlip ? 'scaleY(-1)' : ''}
        `
      }}
    />
  );
};

export default Icon;
