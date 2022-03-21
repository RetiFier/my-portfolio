import React, { useEffect, useRef } from "react";
import lottie from "lottie-web/build/player/lottie_light";
import classNames from "classnames";

type AnimatedProps = {
  animationData: object;
  loop: boolean;
  autoplay: boolean;
  className?: string;
};

const AnimatedContainer = ({
  animationData,
  loop,
  autoplay,
  className,
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
  return <div ref={animationContainer} className={classNames(className)} />;
};

export default AnimatedContainer;
