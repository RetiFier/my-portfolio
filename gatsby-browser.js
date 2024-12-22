import "./src/styles/global.css";

export const onClientEntry = () => {
  const darkMode = localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (darkMode) {
    document.documentElement.classList.add('dark');
  }
};
