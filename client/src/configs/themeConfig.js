const themeConfig = {
  app: {
    name: "Nasiye Task Management System",
  },
  // layout
  layout: {
    isRTL: false,
    darkMode: false,
    semiDarkMode: false,
    contentWidth: "full",
    type: "vertical",
    menu: {
      isCollapsed: false,
      isHidden: false,
    },
    mobileMenu: false,
    customizer: false,
  },
  colors: {
    primary: "#D2232A",
    secondary: "#181818",
    danger: "#ef4444",
    black: "#181818",
    warning: "#eab308",
    info: "#06b6d4",
    light: "#FFFFFF",
    success: "#22c55e",
    chart_grid_light: "#FDE8E9",
    chart_grid_dark: "#222",
    chart_text_light: "#181818",
    chart_text_dark: "#fff",
    chart_palette: ["#D2232A", "#3b82f6", "#f59e42", "#22c55e", "#181818"],
  },
};

export default themeConfig;
