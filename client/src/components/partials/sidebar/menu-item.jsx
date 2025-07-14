import React from "react";
import Icon from "@/components/ui/Icon";

const MenuItem = ({ activeSubmenu, i, item, toggleSubmenu }) => {
  return (
    <div
      className={`menu-link ${
        activeSubmenu === i ? "parent_active not-collapsed" : "collapsed"
      }`}
      onClick={() => toggleSubmenu(i)}
    >
      <div className="flex-1 flex items-center gap-3 px-4 py-3">
        <span className="menu-icon flex items-center justify-center w-5 h-5">
          <Icon icon={item.icon} className="text-current" width="18" />
        </span>
        <div className="text-sm font-medium">{item.title}</div>
      </div>
      <div className="flex-0 px-4">
        <div
          className={`menu-arrow transform transition-all duration-300 ${
            activeSubmenu === i ? "rotate-90" : ""
          }`}
        >
          <Icon icon="CaretRight" width="16" className="text-current" />
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
