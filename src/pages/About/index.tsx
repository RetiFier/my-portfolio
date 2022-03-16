import React, { FC, useEffect } from "react";
import { Container } from "../../components/Container";

export const About: FC = ({ children }) => {
  return (
    <Container>
      <h1 className="headline  text-3xl md:text-5xl lg:text-6xl mt-8">
        Hey, I&apos;m Reti Fier
      </h1>
      <h2 className="font-bold text-xl md:text-2xl mt-2">
        Front-End Developer
      </h2>
      <p className=" my-4">
        As a young bloke with immense interest in Information Technology,
        enrolled in university of Lithan to pursue a career in web/application
        development industry. Combined with the experience I had and my endless
        exploration into the heart of technologies, I wanted to learn more and
        took a gap and utilize it. In that brief period, I was able to
        successfully launch and develop an entire project . With all the
        wondering of what’s going to be next, the journey awaits.
      </p>

      <h2 className="headline mt-12 mb-4 text-4xl">Experience</h2>
      <h2 className="headline mt-12 mb-4 text-4xl">Project</h2>
      <h2 className="headline mt-12 mb-4 text-4xl">Education</h2>
      <p className="mb-6">
        I am mostly self-taught, but here are some of the most relevant
        certifications I have achieved:
      </p>

      <div className="flex justify-center mt-8"></div>
    </Container>
  );
};
