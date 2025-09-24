import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Skill {
  name: string;
  category: string;
  proficiency: number;
  yearsExperience: number;
  lastUsed: string;
  projects: number;
}

const skills: Skill[] = [
  // Frontend
  { name: 'React', category: 'Frontend', proficiency: 95, yearsExperience: 5, lastUsed: 'Current', projects: 25 },
  { name: 'TypeScript', category: 'Frontend', proficiency: 90, yearsExperience: 4, lastUsed: 'Current', projects: 30 },
  { name: 'Vue.js', category: 'Frontend', proficiency: 85, yearsExperience: 3, lastUsed: '2023', projects: 8 },
  { name: 'Next.js', category: 'Frontend', proficiency: 88, yearsExperience: 3, lastUsed: 'Current', projects: 15 },
  
  // Backend
  { name: 'Node.js', category: 'Backend', proficiency: 92, yearsExperience: 5, lastUsed: 'Current', projects: 28 },
  { name: 'Python', category: 'Backend', proficiency: 88, yearsExperience: 4, lastUsed: 'Current', projects: 12 },
  { name: 'Express.js', category: 'Backend', proficiency: 90, yearsExperience: 4, lastUsed: 'Current', projects: 20 },
  { name: 'GraphQL', category: 'Backend', proficiency: 85, yearsExperience: 3, lastUsed: 'Current', projects: 10 },
  
  // Database
  { name: 'PostgreSQL', category: 'Database', proficiency: 88, yearsExperience: 4, lastUsed: 'Current', projects: 22 },
  { name: 'MongoDB', category: 'Database', proficiency: 85, yearsExperience: 3, lastUsed: '2023', projects: 15 },
  { name: 'Redis', category: 'Database', proficiency: 82, yearsExperience: 3, lastUsed: 'Current', projects: 18 },
  
  // Cloud & DevOps
  { name: 'AWS', category: 'Cloud', proficiency: 87, yearsExperience: 4, lastUsed: 'Current', projects: 20 },
  { name: 'Docker', category: 'DevOps', proficiency: 85, yearsExperience: 3, lastUsed: 'Current', projects: 25 },
  { name: 'Kubernetes', category: 'DevOps', proficiency: 75, yearsExperience: 2, lastUsed: 'Current', projects: 8 },
];

export const SkillsAssessment = () => {
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [matchScore, setMatchScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const jobRequirements = [
    'React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'PostgreSQL', 
    'Express.js', 'Docker', 'GraphQL', 'MongoDB', 'Redux', 'Jest'
  ];

  const calculateMatch = () => {
    if (selectedRequirements.length === 0) return;

    const matchedSkills = selectedRequirements.filter(req => 
      skills.some(skill => skill.name.toLowerCase().includes(req.toLowerCase()))
    );
    
    const score = (matchedSkills.length / selectedRequirements.length) * 100;
    setMatchScore(Math.round(score));
    setShowResults(true);
  };

  const getMatchedSkills = () => {
    return selectedRequirements.map(req => {
      const skill = skills.find(s => s.name.toLowerCase().includes(req.toLowerCase()));
      return { requirement: req, skill };
    });
  };

  const toggleRequirement = (req: string) => {
    setSelectedRequirements(prev => 
      prev.includes(req) 
        ? prev.filter(r => r !== req)
        : [...prev, req]
    );
    setShowResults(false);
  };

  return (
    <section id="skills-assessment" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Skills Assessment Tool</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the skills required for your position to see how my expertise aligns with your needs.
            Get instant feedback on skill matches and experience levels.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Skills Matcher */}
          <div className="bg-gray-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Skills Matcher</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Required Skills:
              </label>
              <div className="flex flex-wrap gap-2">
                {jobRequirements.map(req => (
                  <button
                    key={req}
                    onClick={() => toggleRequirement(req)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedRequirements.includes(req)
                        ? 'bg-cyan-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {req}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={calculateMatch}
              disabled={selectedRequirements.length === 0}
              className="w-full py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Calculate Match Score
            </button>

            {/* Results */}
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-white rounded-lg border"
              >
                <div className="text-center mb-6">
                  <div className={`text-4xl font-bold ${matchScore >= 80 ? 'text-green-600' : matchScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {matchScore}%
                  </div>
                  <div className="text-gray-600">Skills Match Score</div>
                </div>

                <div className="space-y-3">
                  {getMatchedSkills().map(({ requirement, skill }) => (
                    <div key={requirement} className="flex justify-between items-center">
                      <span className="font-medium">{requirement}</span>
                      {skill ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${skill.proficiency}%` }}
                            />
                          </div>
                          <span className="text-sm text-green-600 font-medium">
                            {skill.yearsExperience}y exp
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-red-600">Not matched</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Detailed Skills Breakdown */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Skills Breakdown</h3>
            
            <div className="space-y-6">
              {['Frontend', 'Backend', 'Database', 'Cloud', 'DevOps'].map(category => {
                const categorySkills = skills.filter(s => s.category === category);
                
                return (
                  <div key={category} className="border rounded-lg p-6">
                    <h4 className="font-bold text-gray-900 mb-4">{category}</h4>
                    <div className="space-y-3">
                      {categorySkills.map(skill => (
                        <div key={skill.name} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{skill.name}</div>
                            <div className="text-sm text-gray-600">
                              {skill.yearsExperience} years • {skill.projects} projects • Last used: {skill.lastUsed}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-cyan-600 h-2 rounded-full"
                                style={{ width: `${skill.proficiency}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700 w-8">
                              {skill.proficiency}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Assessment Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-16 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-8 text-white"
        >
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">5+</div>
              <div className="text-cyan-100">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-cyan-100">Technologies Used</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">100+</div>
              <div className="text-cyan-100">Projects Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-cyan-100">Commitment Level</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export const RecruiterTools = () => {
  const [availability, setAvailability] = useState('available');
  
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Recruiter Resources</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to evaluate my fit for your team. From technical assessments to availability and references.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Quick Assessment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-8 shadow-sm"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Quick Assessment</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Technical Level</span>
                <span className="font-semibold text-green-600">Senior</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Leadership</span>
                <span className="font-semibold text-green-600">Team Lead Ready</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Communication</span>
                <span className="font-semibold text-green-600">Excellent</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Availability</span>
                <span className={`font-semibold ${availability === 'available' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {availability === 'available' ? 'Available' : 'Open to Opportunities'}
                </span>
              </div>
            </div>

            <button className="w-full mt-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors">
              Download Full Resume
            </button>
          </motion.div>

          {/* References */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-8 shadow-sm"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">References</h3>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-cyan-500 pl-4">
                <div className="font-semibold">Sarah Chen</div>
                <div className="text-sm text-gray-600">Former CTO at TechFlow</div>
                <div className="text-sm text-cyan-600">sarah.chen@techflow.com</div>
              </div>
              <div className="border-l-4 border-cyan-500 pl-4">
                <div className="font-semibold">Marcus Rodriguez</div>
                <div className="text-sm text-gray-600">Product Manager at InnovateLab</div>
                <div className="text-sm text-cyan-600">marcus.r@innovatelab.io</div>
              </div>
              <div className="border-l-4 border-cyan-500 pl-4">
                <div className="font-semibold">Dr. Elena Vasquez</div>
                <div className="text-sm text-gray-600">Founder at DataDriven Inc</div>
                <div className="text-sm text-cyan-600">elena@datadriven.com</div>
              </div>
            </div>

            <button className="w-full mt-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Request Reference Check
            </button>
          </motion.div>

          {/* Contact & Scheduling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-8 shadow-sm"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Let's Connect</h3>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Response Time</div>
                <div className="font-semibold text-green-600">Within 4 hours</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Interview Availability</div>
                <div className="font-semibold">Weekdays 9 AM - 6 PM EST</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Technical Interview</div>
                <div className="font-semibold text-cyan-600">Ready Anytime</div>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <button className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Schedule Interview
              </button>
              <button className="w-full py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors">
                Send Message
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
