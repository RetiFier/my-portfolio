import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Testimonials Component
export const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO at TechFlow Solutions", 
      company: "TechFlow Solutions",
      image: "/images/testimonial-sarah.jpg",
      quote: "Reti transformed our legacy system into a modern, scalable platform. His technical expertise and problem-solving approach saved us months of development time.",
      project: "Platform Migration",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Product Manager at InnovateLab",
      company: "InnovateLab",
      image: "/images/testimonial-marcus.jpg", 
      quote: "Working with Reti was exceptional. He doesn't just code - he understands business needs and delivers solutions that drive real results.",
      project: "Analytics Dashboard",
      rating: 5
    },
    {
      name: "Dr. Elena Vasquez",
      role: "Founder at DataDriven Inc",
      company: "DataDriven Inc",
      image: "/images/testimonial-elena.jpg",
      quote: "Reti's expertise in both frontend and backend development, combined with his collaborative approach, made him an invaluable team member.",
      project: "Full-Stack Development",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What Clients & Colleagues Say</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take my word for it. Here's what people I've worked with have to say about the impact of our collaboration.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-gray-50 rounded-xl p-8 relative"
            >
              {/* Quote mark */}
              <div className="absolute top-4 right-4 text-4xl text-cyan-200">"</div>
              
              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>

              <blockquote className="text-gray-700 mb-6 italic">
                "{testimonial.quote}"
              </blockquote>

              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                  <span className="font-bold text-gray-600">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-xs text-cyan-600">{testimonial.project}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Video testimonial placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-8 text-center text-white"
        >
          <h3 className="text-2xl font-bold mb-4">Want to share your experience?</h3>
          <p className="mb-6">I'm always looking to improve and would love to hear about your experience working with me.</p>
          <button className="px-8 py-3 bg-white text-cyan-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Leave a Testimonial
          </button>
        </motion.div>
      </div>
    </section>
  );
};

// Open Source & Community Impact
export const CommunityImpact = () => {
  const contributions = [
    {
      project: "React Performance Toolkit",
      description: "Created an open-source toolkit for React performance optimization that's been used by 500+ developers",
      stats: { stars: 1200, forks: 89, downloads: "15K/month" },
      impact: "Helped developers reduce bundle sizes by average 30%"
    },
    {
      project: "API Gateway Patterns",
      description: "Published comprehensive guide and implementation patterns for microservices API gateways",
      stats: { stars: 800, forks: 156, downloads: "8K/month" },
      impact: "Referenced in 50+ company architecture decisions"
    },
    {
      project: "TypeScript Utils Library",
      description: "Utility library for common TypeScript patterns used in enterprise applications",
      stats: { stars: 650, forks: 73, downloads: "12K/month" },
      impact: "Improved type safety in 100+ projects"
    }
  ];

  const speaking = [
    {
      event: "React Conf 2023",
      topic: "Performance Optimization in Large React Applications",
      audience: "500+ developers",
      type: "Conference Talk"
    },
    {
      event: "DevTalk Monthly",
      topic: "Building Scalable Node.js APIs",
      audience: "200+ developers",
      type: "Technical Webinar"
    },
    {
      event: "Local Dev Meetup",
      topic: "TypeScript Best Practices",
      audience: "80+ developers",
      type: "Workshop"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Community Impact & Recognition</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            I believe in giving back to the developer community through open source contributions, 
            knowledge sharing, and mentoring the next generation of developers.
          </p>
        </motion.div>

        {/* Open Source Contributions */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Open Source Contributions</h3>
          <div className="grid gap-6">
            {contributions.map((contrib, index) => (
              <motion.div
                key={contrib.project}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm border"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{contrib.project}</h4>
                    <p className="text-gray-700">{contrib.description}</p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center text-gray-600">
                      ⭐ {contrib.stats.stars}
                    </span>
                    <span className="flex items-center text-gray-600">
                      🔀 {contrib.stats.forks}
                    </span>
                    <span className="flex items-center text-gray-600">
                      📥 {contrib.stats.downloads}
                    </span>
                  </div>
                </div>
                <div className="text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm inline-block">
                  {contrib.impact}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Speaking & Teaching */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Speaking Engagements & Teaching</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speaking.map((event, index) => (
              <motion.div
                key={event.event}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm border"
              >
                <div className="text-cyan-600 text-sm font-semibold mb-2">{event.type}</div>
                <h4 className="font-bold text-gray-900 mb-2">{event.event}</h4>
                <p className="text-gray-700 text-sm mb-4">"{event.topic}"</p>
                <div className="text-sm text-gray-600">{event.audience}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recognition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Industry Recognition</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-semibold">Top 1% Developer</div>
              <div className="text-sm opacity-90">Stack Overflow</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🌟</div>
              <div className="font-semibold">Community Champion</div>
              <div className="text-sm opacity-90">React Community</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-semibold">Innovation Award</div>
              <div className="text-sm opacity-90">TechCorp 2023</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
