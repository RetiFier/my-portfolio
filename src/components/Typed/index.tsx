import React, { useRef, useEffect } from "react";

import Type from "typed.js";

export interface TypedProps {
  startDelay?: number;
  typeSpeed?: number;
  backSpeed?: number;
  backDelay?: number;
  strings: string[];
  loop?: boolean;
  smartBackspace?: boolean;
  loopCount?: number;
  showCursor?: boolean;
  cursorChar?: string;
}

export const Typed = ({
  startDelay,
  typeSpeed,
  backSpeed,
  backDelay,
  strings,
  loop,
  smartBackspace,
  loopCount,
  showCursor,
  cursorChar,
}: TypedProps) => {
  // Create Ref element.
  const el = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (null !== el.current) {
      const typed = new Type(el.current, {
        strings: strings,
        startDelay: startDelay,
        typeSpeed: typeSpeed,
        backSpeed: backSpeed,
        backDelay: backDelay,
        loop: loop,
        smartBackspace: smartBackspace,
        loopCount: loopCount,
        showCursor: showCursor,
        cursorChar: cursorChar,
      });

      // Destropying
      return () => {
        typed.destroy();
      };
    }
  }, []);
  return <span ref={el}></span>;
};
