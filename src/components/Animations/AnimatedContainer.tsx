import React, { useEffect, useRef } from "react";
import lottie from "lottie-web/build/player/lottie_light";

type AnimatedProps = {
  animationData: object;
  loop: boolean;
  autoplay: boolean;
};

const AnimatedContainer = ({
  animationData,
  loop,
  autoplay,
}: AnimatedProps) => {
  const animationContainer = useRef<HTMLDivElement>(null);
  const anim = useRef(null);
  useEffect(() => {
    if (animationContainer && animationContainer !== null) {
      lottie.loadAnimation({
        container: animationContainer.current as HTMLDivElement,
        renderer: "svg",
        loop: loop,
        autoplay: autoplay,
        animationData: animationData,
      });
    }
  }, [animationContainer]);
  return <div ref={animationContainer} />;
};

export default AnimatedContainer;
