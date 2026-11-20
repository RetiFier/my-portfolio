/** @type {import('gatsby').GatsbyConfig} */
module.exports = {
  siteMetadata: {
    title: "Reti Fier",
    description:
      "Senior full-stack and product engineer with 7+ years building SaaS platforms, AI-powered applications and backend systems, from architecture to production.",
    locale: "en",
    author: "Reti Fier",
    name: "Reti Fier — Senior Full-Stack / Product Engineer",
    siteUrl: `https://retifier.dev`,
    image: "/og-image.png",
  },
  plugins: [
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: ["G-JVTZMNERDB"],
        gtagConfig: {
          anonymize_ip: true,
          cookie_expires: 0,
        },
        pluginConfig: {
          head: false,
          respectDNT: true,
        },
      },
    },
    "gatsby-plugin-robots-txt",
    "gatsby-plugin-postcss",
    "gatsby-plugin-image",
    `gatsby-transformer-yaml`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `./content`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/content/images`,
      },
    },
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    "gatsby-plugin-sitemap",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "Reti Fier — Senior Full-Stack / Product Engineer",
        short_name: "Reti Fier",
        start_url: "/",
        background_color: "#0a0a0a",
        theme_color: "#0a0a0a",
        display: "minimal-ui",
        icon: "content/images/icon.svg",
      },
    },
  ],
};
