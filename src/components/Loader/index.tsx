import React, { FC } from "react";
import loading from "../../animationsContent/loading.json";

import AnimatedContainer from "../Animations/AnimatedContainer";

export const Loader: FC = () => {
  return (
    <div className="grid place-items-center  min-h-screen">
      <AnimatedContainer
        animationData={loading}
        autoplay
        loop
        className="lg:w-2/5 md:w-3/5 justify-center content-center"
      />
    </div>
  );
};
