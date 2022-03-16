import React from "react";
import { format } from "date-fns";
import { GatsbyImage } from "gatsby-plugin-image";
import { EducationTypes } from "../../@types/education";
import { Box } from "../Box";

export const Course = ({
  institute,
  course,
  date,
  technologies,
}: EducationTypes) => {
  return (
    <Box>
      <div className="flex gap-4 items-center">
        {institute.logo && (
          <GatsbyImage
            image={institute.logo}
            alt={institute.name}
            className="rounded-md"
          />
        )}
        <div className="w-full mb-2">
          <div className="flex justify-between">
            <h3 className="font-bold">{course}</h3>
            <span>{format(new Date(date), "MMM yyyy")}</span>
          </div>
          <h4>
            {institute.url ? (
              <a
                href={institute.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underlined relative"
              >
                {institute.name}
              </a>
            ) : (
              <>{institute.name}</>
            )}
          </h4>
          <p className="text-sm">
            <strong>Course Contents: </strong>
            {technologies.join(", ")}
          </p>
        </div>
      </div>
    </Box>
  );
};
