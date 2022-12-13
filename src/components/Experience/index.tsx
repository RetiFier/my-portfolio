import React from "react";

import classNames from "classnames";

import { JobType } from "../../@types/job";
import { Job } from "./Job";

export interface ExperienceProps {
  jobs: JobType[];
}

export const Experience = ({ jobs }: ExperienceProps) => {
  return (
    <>
      {jobs
        .reverse()
        .map(
          (
            { company, jobTitle, fromDate, toDate, technologies, description },
            index,
          ) => (
            <div
              className={classNames(
                "flex transition-all transform md:hover:scale-[1.01]",
                {
                  "justify-end": index % 2 !== 0,
                },
              )}
              key={`${company.name} ${jobTitle}`}
            >
              <Job
                company={company}
                jobTitle={jobTitle}
                fromDate={fromDate}
                toDate={toDate}
                technologies={technologies}
              >
                <p className="text-sm antialiased whitespace-normal tracking-wide text-justify ">
                  {description}
                </p>
              </Job>
            </div>
          ),
        )}
    </>
  );
};
