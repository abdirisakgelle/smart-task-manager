import React from "react";
import Icon from "@/components/ui/Icon";

const Swicth = ({
  value,
  onChange,
  label,
  id,
  disabled,
  wrapperClass,
  labelClass,
  activeClass = "bg-indigo-500",
  activeThumb = "bg-white",
  badge,
  prevIcon,
  nextIcon,
  outline,
}) => {
  const classChange = () => {
    if (value) {
      return "translate-x-6";
    } else {
      return "translate-x-1";
    }
  };

  return (
    <div>
      <label
        className={
          `flex items-center space-x-2 rtl:space-x-reverse ` + wrapperClass
        }
        id={id}
      >
        <input
          type="checkbox"
          className="hidden"
          checked={value}
          onChange={onChange}
          htmlFor={id}
          disabled={disabled}
        />
        <React.Fragment>
          {outline ? (
            <div
              className={`relative inline-flex h-5 border  items-center rounded-full transition-all duration-150
          
          ${value ? activeClass : "border-indigo-200"}
          ${badge ? "w-11" : "min-w-[36px]"}
           ${disabled ? " cursor-not-allowed opacity-50" : "cursor-pointer "}
          `}
            >
              {badge && value && (
                <span className="absolute leading-[1px] left-1 top-1/2 -translate-y-1/2 capitalize font-bold text-white tracking-[1px]">
                  {prevIcon ? (
                    <Icon icon={prevIcon} />
                  ) : (
                    <span className="text-xs">on</span>
                  )}
                </span>
              )}
              {badge && !value && (
                <span className="absolute right-1 leading-[1px] top-1/2 -translate-y-1/2 capitalize font-bold text-gray-900 tracking-[1px]">
                  {nextIcon ? (
                    <Icon icon={nextIcon} />
                  ) : (
                    <span className="text-xs">Off</span>
                  )}
                </span>
              )}

              <span
                className={`inline-block h-3 w-3 transform rounded-full transition-all duration-150 
          ${classChange()}  ${
                  value ? `bg-opacity-100 ${activeThumb}` : "  bg-indigo-200"
                }
          `}
              />
            </div>
          ) : (
            <div
              className={`relative inline-flex h-5   items-center rounded-full transition-all duration-150
          
          ${value ? activeClass : "bg-indigo-200"}
          ${badge ? "w-11" : "min-w-[36px]"}
           ${disabled ? " cursor-not-allowed opacity-50" : "cursor-pointer "}
          `}
            >
              {badge && value && (
                <span className="absolute leading-[1px] left-1 top-1/2 -translate-y-1/2 capitalize font-bold text-white tracking-[1px]">
                  {prevIcon ? (
                    <Icon icon={prevIcon} />
                  ) : (
                    <span className="text-xs">on</span>
                  )}
                </span>
              )}
              {badge && !value && (
                <span className="absolute right-1 leading-[1px] top-1/2 -translate-y-1/2 capitalize font-bold text-gray-900 tracking-[1px]">
                  {nextIcon ? (
                    <Icon icon={nextIcon} />
                  ) : (
                    <span className="text-xs">Off</span>
                  )}
                </span>
              )}

              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-all duration-150 
          ${classChange()}
          `}
              />
            </div>
          )}
        </React.Fragment>

        {label && <span className={labelClass}>{label}</span>}
      </label>
    </div>
  );
};

export default Swicth;
