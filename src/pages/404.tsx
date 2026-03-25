import * as React from "react";
import { Link, graphql, useStaticQuery } from "gatsby";
import { motion } from 'framer-motion';
import { SEO } from "../components/Seo";
import { Layout } from '../components/Layout';
import { FiHome } from "react-icons/fi";
import { ProfileType, SocialType } from '../@types/about';

const NotFoundPage = ({ location }: { location: Location }) => {
  const data = useStaticQuery(graphql`
    query NotFoundPageQuery {
      profile: allProfileYaml {
        nodes {
          profile {
            fname
            lname
            email
          }
        }
      }
      social: allSocialYaml {
        nodes {
          name
          url
        }
      }
    }
  `);

  const profile = (data.profile.nodes[0]?.profile || { fname: '', lname: '', email: '' }) as ProfileType;
  const social = data.social.nodes as SocialType[];

  return (
    <Layout social={social} profile={profile} location={location}>
      <SEO title="Not Found" />
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-[9px] sm:text-[10px] tracking-[0.4em] text-[#6b7280] uppercase mb-8">
            404
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl text-white font-normal mb-6">
            Page not found
          </h1>
          <p className="text-base text-[#6b7280] mb-10 max-w-md mx-auto leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 px-6 py-3 border border-[#1e1e1e] text-[#6b7280] hover:text-white hover:border-[#3b82f6] transition-all duration-300 text-sm tracking-wider"
          >
            <FiHome className="w-4 h-4" />
            Go Home
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
