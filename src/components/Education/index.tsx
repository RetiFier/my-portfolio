import React from "react";
import classNames from "classnames";

import { EducationTypes } from "../../@types/education";
import { Course } from "../Course";

export interface EducationProps {
  education: EducationTypes[];
}

export const Education = ({ education }: EducationProps) => {
  return (
    <>
      {education.map(
        ({ course, date, institute, technologies }, index: number) => (
          <div
            className={classNames(
              "flex transition-all transform md:hover:scale-[1.01]",
              {
                "justify-end": index % 2 !== 0,
              },
            )}
            key={course}
          >
            <Course
              course={course}
              date={date}
              institute={institute}
              technologies={technologies}
            />
          </div>
        ),
      )}
    </>
  );
};
