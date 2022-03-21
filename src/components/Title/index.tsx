import React, { FC, useEffect } from "react";
import { Footer } from "../Footer";

export const Title: FC = ({ children }) => {
  return <h2 className="headline mt-12 mb-4 text-4xl">{children}</h2>;
};
