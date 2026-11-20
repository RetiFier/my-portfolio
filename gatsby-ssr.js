const React = require("react");

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..800&family=Geist:wght@300..700&family=Geist+Mono:wght@400;500&display=swap";

exports.onRenderBody = ({ setHtmlAttributes, setHeadComponents }) => {
  setHtmlAttributes({ lang: "en" });
  setHeadComponents([
    <link key="gf-preconnect" rel="preconnect" href="https://fonts.googleapis.com" />,
    <link
      key="gf-preconnect-static"
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossOrigin="anonymous"
    />,
    <link key="gf-fonts" rel="stylesheet" href={FONT_URL} />,
    <meta key="theme-color" name="theme-color" content="#0a0a0a" />,
  ]);
};
