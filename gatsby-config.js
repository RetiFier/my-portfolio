/** @type {import('gatsby').GatsbyConfig} */
module.exports = {
  siteMetadata: {
    description: "Personal page of Reti Fier",
    locale: "en",
    title: "Reti Fier",
    author: "Reti Fier",
    name: "Reti Fier Portfolio",
    siteUrl: `https://retifier.com/`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: ["G-JVTZMNERDB"],
        gtagConfig: {
          optimize_id: "OPT-W2TVR6F",
          anonymize_ip: true,
          cookie_expires: 0,
        },
        pluginConfig: {
          head: false,

          respectDNT: true,

          exclude: ["/preview/**", "/do-not-track/me/too/"],
        },
      },
    },
    "gatsby-plugin-robots-txt",
    "gatsby-plugin-postcss",
    "gatsby-plugin-image",
    "gatsby-plugin-react-helmet",
    `gatsby-transformer-yaml`,
    {
      resolve: `gatsby-plugin-offline`,
      options: {
        precachePages: [`/`],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `./content`,
      },
    },
    "gatsby-plugin-sitemap",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "content/images/icon.svg",
      },
    },
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./content/images/",
      },
      __key: "images",
    },
  ],
};
