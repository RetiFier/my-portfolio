import React, { FC } from "react";
import { format } from "date-fns";

import { JobType } from "../../@types/job";
import { Box } from "../Box";
import { GatsbyImage } from "gatsby-plugin-image";

const Job: FC<Omit<JobType, "description">> = ({
  company,
  jobTitle,
  fromDate,
  toDate,
  technologies,
  children,
}) => {
  console.log(company.logo);
  return (
    <Box>
      <div className="flex gap-4 items-start md:items-center">
        {company.logo && (
          <GatsbyImage
            image={company.logo.childImageSharp.gatsbyImageData}
            alt={company.name}
            className="rounded-md"
          />
        )}
        <div className="w-full mb-2">
          <div className="flex flex-col-reverse md:flex-row justify-between">
            <h3 className="font-bold">{jobTitle}</h3>
            <span className="text-sm md:text-base">
              {`${format(new Date(fromDate), "MMM yyyy")} — ${
                toDate ? format(new Date(toDate), "MMM yyyy") : "present"
              }`}
            </span>
          </div>
          <h4>
            {company.url ? (
              <a
                href={company.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underlined relative"
              >
                {company.name}
              </a>
            ) : (
              <>{company.name}</>
            )}
          </h4>
          <p className="hidden md:block text-sm">
            <strong>Technologies: </strong>
            {technologies.join(", ")}
          </p>
        </div>
      </div>
      <p className="md:hidden text-sm">
        <strong>Technologies: </strong>
        {technologies.join(", ")}
      </p>
      {children}
    </Box>
  );
};

export { Job };
