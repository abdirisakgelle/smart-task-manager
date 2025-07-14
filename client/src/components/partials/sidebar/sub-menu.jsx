import React, { useState } from "react";
import { Collapse } from "react-collapse";
import { NavLink } from "react-router-dom";
import Icon from "@/components/ui/Icon";
import Multilevel from "./multi-lavel";

const Submenu = ({ activeSubmenu, item, i }) => {
  const [activeMultiMenu, setMultiMenu] = useState(null);

  const toggleMultiMenu = (j) => {
    if (activeMultiMenu === j) {
      setMultiMenu(null);
    } else {
      setMultiMenu(j);
    }
  };

  function LockLink({ to, children, subItem }) {
    if (subItem.badge) {
      return (
        <span className="text-sm flex items-center gap-3 px-4 py-2 text-white/50 cursor-not-allowed">
          <span className="w-2 h-2 rounded-full bg-white/60"></span>
          <div className="flex-1">
            {subItem.childtitle}
            <span className="badge bg-cyan-500/10 text-cyan-500 py-1 ml-2 rounded-full">
              {subItem.badge}
            </span>
          </div>
        </span>
      );
    } else {
      return <NavLink to={to}>{children}</NavLink>;
    }
  }

  return (
    <Collapse isOpened={activeSubmenu === i}>
      <ul className="sub-menu space-y-1 pl-12 pr-6">
        {item.child?.map((subItem, j) => (
          <li key={j} className="relative first:pt-3 last:pb-3">
            {subItem?.submenu ? (
              <div>
                <div
                  className="flex items-center gap-3 px-4 py-2 text-white/70 hover:text-white cursor-pointer"
                  onClick={() => toggleMultiMenu(j)}
                >
                  <span className="w-2 h-2 rounded-full bg-white/60"></span>
                  <span className="flex-1 text-sm">{subItem.childtitle}</span>
                  <span className="flex-none">
                    <Icon 
                      icon="CaretRight"
                      className={`transform transition-all duration-300 ${
                        activeMultiMenu === j ? "rotate-90" : ""
                      }`}
                      width="16"
                    />
                  </span>
                </div>
                <Multilevel
                  activeMultiMenu={activeMultiMenu}
                  j={j}
                  subItem={subItem}
                />
              </div>
            ) : (
              <LockLink to={subItem.childlink} subItem={subItem}>
                {({ isActive }) => (
                  <div className="flex items-center gap-3 px-4 py-2 text-white/70 hover:text-white">
                    <span className={`w-2 h-2 rounded-full ${
                      isActive ? "bg-white" : "bg-white/60"
                    }`}></span>
                    <span className="text-sm">
                      {subItem.childtitle}
                      {subItem.badge && (
                        <span className="badge bg-yellow-500/10 text-yellow-500 py-1 ml-2 rounded-full">
                          {subItem.badge}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </LockLink>
            )}
          </li>
        ))}
      </ul>
    </Collapse>
  );
};

export default Submenu;
