import React from "react";
import { Collapse } from "react-collapse";
import { NavLink } from "react-router-dom";

const Multilevel = ({ activeMultiMenu, j, subItem }) => {
  return (
    <Collapse isOpened={activeMultiMenu === j}>
      <ul className="space-y-1 pl-12">
        {subItem?.submenu?.map((item, i) => (
          <li key={i} className="first:pt-2">
            <NavLink to={item.subChildLink}>
              {({ isActive }) => (
                <div className="flex items-center gap-3 px-4 py-2 text-white/70 hover:text-white">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? "bg-white" : "bg-white/60"
                  }`}></span>
                  <span className="text-sm">{item.subChildTitle}</span>
                </div>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </Collapse>
  );
};

export default Multilevel;
