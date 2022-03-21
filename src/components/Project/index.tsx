import React from "react";
import classNames from "classnames";

import { ProjectType } from "../../@types/project";
import { ProjectCard } from "../ProjectCard";

export interface ProjectProps {
  project: ProjectType[];
}

export const Project = ({ project }: ProjectProps) => {
  return (
    <>
      {project.map(
        ({ name, date, project, technologies, description }, index: number) => (
          <div
            className={classNames(
              "flex transition-all transform md:hover:scale-[1.01]",
              {
                "justify-end": index % 2 !== 0,
              },
            )}
            key={name}
          >
            <ProjectCard
              name={name}
              date={date}
              project={project}
              technologies={technologies}
              description={description}
            />
          </div>
        ),
      )}
    </>
  );
};
