import React, { useState, useEffect, FC } from "react";

interface IThemeContext {
  theme: string;
  setTheme: (theme: string) => void;
}

export const ThemeContext = React.createContext<IThemeContext>({
  theme: "",
  setTheme: () => {},
});
const ThemeContextProvider: FC = ({ children }) => {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    function loadTheme() {
      const theme = localStorage.getItem("theme");
      return theme || "dark";
    }
    setTheme(loadTheme());
  }, []);

  useEffect(() => {
    if (window === undefined) return;
    const root = window.document.documentElement;
    const isDark = theme === "dark";

    root.classList.remove(isDark ? "light" : "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme: theme, setTheme: setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
export default ThemeContextProvider;
