import React, { FC, useEffect } from "react";
import { ProfileType } from "../../@types/about";
import { JobType } from "../../@types/job";
import { ProjectType } from "../../@types/project";
import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Experience } from "../../components/Experience";
import { Project } from "../../components/Project";
import { Title } from "../../components/Title";
import { Typed } from "../../components/Typed";
import { BsFillCloudDownloadFill } from "react-icons/bs";
export interface AboutProps {
  profile: ProfileType;
  job: JobType[];
  project: ProjectType[];
}

export const About = ({ profile, job, project }: AboutProps) => {
  return (
    <Container>
      <h1 className="text-3xl md:text-5xl lg:text-6xl mt-8  poppinfont-400  ">
        Hey, I&apos;m&nbsp;
        <span className="uppercase">{profile.fname}</span>
        <span className="poppinfont-100 uppercase">{profile.lname}</span>
      </h1>
      <h2 className=" headline font-bold text-xl md:text-2xl mt-2">
        Just an Another {profile.profession}
      </h2>
      <p className=" my-4">
        {profile.about} Things I'm capable of Creating&nbsp;
        <span className="text-xl font-bold font-mono">
          &lt;
          <Typed
            loop
            typeSpeed={80}
            backSpeed={20}
            strings={profile.skills}
            smartBackspace
            backDelay={1000}
            loopCount={0}
            showCursor
            cursorChar=">_"
          />
        </span>
      </p>
      <Title>Experience</Title>
      <Experience jobs={job} />
      <Title>Project</Title>
      <Project project={project} />

      <div className="flex justify-center mt-8">
        <Button
          href="/cv-2021.pdf"
          download={true}
          className="group flex gap-2 whitespace-nowrap"
        >
          <div className="w-10 pt-1  text-blue-500 group-hover:text-off-white dark:from-gray-300   dark:to-indigo-900  group-hover:animate-bounce">
            <BsFillCloudDownloadFill />
          </div>
          <div className="block headline group-hover:text-off-white">
            Download my CV
          </div>
        </Button>
      </div>
    </Container>
  );
};
