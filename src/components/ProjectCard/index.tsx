import React from "react";
import { format } from "date-fns";
import { GatsbyImage } from "gatsby-plugin-image";
import { ProjectType } from "../../@types/project";
import { Box } from "../Box";
import AnimatedContainer from "../Animations/AnimatedContainer";
import gitHubAnimation from "../../animationsContent/github.json";
import developAnimation from "../../animationsContent/develop.json";

export const ProjectCard = ({
  project,
  name,
  date,
  technologies,
  description,
}: ProjectType) => {
  return (
    <Box>
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underlined relative"
      >
        <div className="flex gap-4 items-center">
          {project.logo ? (
            <GatsbyImage
              image={project.logo.childImageSharp.gatsbyImageData}
              alt={project.name}
              className="rounded-md"
            />
          ) : (
            <AnimatedContainer
              animationData={developAnimation}
              autoplay
              loop
              className="rounded-md w-20"
            />
          )}
          <div className="w-full mb-2">
            <div className="flex justify-between">
              <span className="font-bold">{name}</span>
              <span>{format(new Date(date), "MMM yyyy")}</span>
            </div>
            <span>{project.name}</span>
            <div className="flex justify-between">
              <span className="text-sm">
                <strong>Technologies Usage: </strong>
                {technologies.join(", ")}
              </span>
              <div className="w-14 h-8 pb-3 ">
                <AnimatedContainer
                  animationData={gitHubAnimation}
                  autoplay
                  loop
                />
              </div>
            </div>
          </div>
        </div>
      </a>
    </Box>
  );
};
