/** @type {import('gatsby').GatsbyConfig} */
module.exports = {
  siteMetadata: {
    description: "Personal page of Reti Fier",
    locale: "en",
    title: "Reti Fier",
    author: "Reti Fier",
    name: "Reti Fier Portfolio",
    siteUrl: `https://www.yourdomain.tld`,
  },
  plugins: [
    //   {
    //   resolve: 'gatsby-plugin-google-analytics',
    //   options: {
    //     "trackingId": ""
    //   }
    // },
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
