import React, { useState } from 'react';

function ExperienceItem({ role, company, duration, location, description, skills, onExpand }) {
  return (
    <article className="experience-item">
      <h3>{role}</h3>
      <p>
        <strong>{company}</strong><br />
        <em>{duration}</em><br />
        {location && <span>{location}<br /></span>}
      </p>
      <p>{description}</p>
      {skills && (
        <p>
          <strong>Skills:</strong> {skills.join(' · ')}
        </p>
      )}
      <button onClick={onExpand} className="expand-button">More Details</button>
    </article>
  );
}

function Experiences() {
  const [selectedExperience, setSelectedExperience] = useState(null);

  const experiences = [
    {
      role: 'Full Stack Engineer',
      company: 'Real Life Robotics · Internship',
      duration: 'Sept 2024 - Dec 2024 · 4 mos',
      location: 'Toronto, Ontario, Canada · Hybrid',
      description: '🦓 Zoober Project',
      detailedDescription: `Real Life Robotics is a cutting-edge technology startup specializing in autonomous robotic solutions for last-mile delivery. The company aims to revolutionize the logistics and delivery industry by developing sustainable, cost-efficient, and innovative robotic platforms that reduce environmental impact.

      I am part of the Zoober Project Team, which is responsible for deploying the company's flagship delivery robot platform, BUBS, at the Toronto Zoo. This initiative aligns with the Zoo's vision of becoming one of the most technologically advanced conservation campuses in the world, supporting its broader sustainability goals. The Zoober project focuses on automating the delivery of 1 to 1.5 tonnes of food daily to animal habitats across the Zoo's 500-acre campus, significantly reducing emissions from traditional fossil fuel-based transportation.

      The Zoober program is part of the Toronto Zoo's larger commitment to achieving Net Zero emissions by 2030, demonstrating how organizations with large campuses are turning to autonomous robots for environmentally friendly and economical delivery solutions. As a member of this team, I contribute to enhancing the integration between the robot and the Zoo's order management systems while also conducting demos for stakeholders and ensuring the smooth operation of robotic deliveries.`,
      skills: ['Robot Operating System (ROS)', 'Node.js', 'Microsoft Azure', 'Asana', 'Project Management', 'Snowflake', 'User Acceptance Testing'],
    },
    {
      role: 'Cloud Infrastructure Analyst',
      company: 'Municipal Property Assessment Corporation · Internship',
      duration: 'Jan 2024 - Apr 2024 · 4 mos',
      location: 'Pickering, Ontario, Canada · Hybrid',
      description: '☁️ Cloud Operations',
      detailedDescription: `As a Cloud Infrastructure Analyst, I worked on automating cloud infrastructure provisioning using Terraform and AWS services. My role involved creating scalable, secure, and efficient cloud environments, supporting MPAC's data-driven decision-making processes.

      Key responsibilities included optimizing serverless architecture, automating cloud cost analysis with Python Boto3 scripts, and integrating React.js dashboards for real-time infrastructure monitoring. My work directly contributed to enhancing operational efficiency and reducing cloud resource costs.`,
      skills: ['Python Boto3', 'React.js', 'Jira', 'Confluence', 'MySQL', 'Amazon Web Services (AWS)', 'Terraform'],
    },
    {
      role: 'Software Development Engineer Intern',
      company: 'Amazon Web Services (AWS) · Internship',
      duration: 'May 2023 - Aug 2023 · 4 mos',
      location: 'Vancouver, British Columbia, Canada · On-site',
      description: '⏰️ Distributed Job Scheduler',
      detailedDescription: `At AWS, I contributed to the Distributed Job Scheduler project, which optimizes large-scale distributed systems to schedule and execute complex tasks. I developed and maintained Ruby scripts for job automation, ensuring low latency and high reliability in cloud-native environments.

      My contributions also included refactoring legacy systems, implementing Bash scripts for deployment automation, and collaborating with a global team to enhance system scalability. This internship provided invaluable insights into building robust, enterprise-grade cloud solutions.`,
      skills: ['Ruby', 'Git', 'JavaScript', 'Haml', 'Bash'],
    },
    {
      role: 'Quality Assurance Automation Analyst',
      company: 'Home Trust Company · Internship',
      duration: 'Jan 2023 - Apr 2023 · 4 mos',
      location: 'Toronto, Ontario, Canada · Hybrid',
      description: '💸 Digital Banking Services',
      detailedDescription: `As a QA Automation Analyst, I focused on enhancing the digital banking services offered by Home Trust Company. My role involved designing and executing automated test cases using CodeceptJS and Postman API to ensure seamless integration of new features.

      I also collaborated with cross-functional teams to identify and resolve performance bottlenecks in the MongoDB-based backend system. My efforts ensured the reliability and efficiency of the banking platform, enhancing user satisfaction.`,
      skills: ['CodeceptJS', 'Postman API', 'SAP', 'JSON', 'MongoDB', 'Microsoft Azure'],
    },
  ];

  const handleExpand = (experience) => {
    setSelectedExperience(experience);
  };

  const closeWidget = () => {
    setSelectedExperience(null);
  };

  return (
    <div className="experiences">
      <h1>My Experiences</h1>
      <section id="university">
        <div className="experience-list">
          {experiences.map((exp, index) => (
            <ExperienceItem
              key={index}
              {...exp}
              onExpand={() => handleExpand(exp)}
            />
          ))}
        </div>
      </section>

      {selectedExperience && (
        <div className="widget-overlay">
          <div className="widget">
            <h2>{selectedExperience.role}</h2>
            <p>{selectedExperience.detailedDescription}</p>
            <button onClick={closeWidget} className="close-button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Experiences;
