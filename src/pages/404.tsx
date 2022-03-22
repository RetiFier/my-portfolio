import * as React from "react";
import { Link } from "gatsby";
import { Button } from "../components/Button";

// styles
const pageStyles = {
  color: "#232129",
  padding: "96px",
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
};
const headingStyles = {
  marginTop: 0,
  marginBottom: 64,
  maxWidth: 320,
};

const codeStyles = {
  color: "#8A6534",
  padding: 4,
  backgroundColor: "#FFF4DB",
  fontSize: "1.25rem",
  borderRadius: 4,
};

// markup
const NotFoundPage = () => {
  return (
    <main style={pageStyles}>
      <div className="flex flex-col items-center">
        <h1 className="font-bold text-blue-600 text-9xl">404</h1>

        <h6 className="mb-2 text-2xl font-bold text-center text-gray-800 md:text-3xl">
          <span className="text-red-500">Oops!</span> Page not found
        </h6>
        <p>
          Sorry{" "}
          <span role="img" aria-label="Pensive emoji">
            😔
          </span>{" "}
          we couldn’t find what you were looking for.
          <br />
          {process.env.NODE_ENV === "development" ? (
            <>
              <br />
              Try creating a page in <code style={codeStyles}>src/pages/</code>.
              <br />
            </>
          ) : null}
          <br />
        </p>

        <button className=" block border-cyan-400 border-2 dark:border-indigo-400 transition transition-300 rounded-lg px-4 py-2 headline hover:gradient-bg hover:text-off-white">
          <Link to="/">Go Home</Link>.
        </button>
      </div>
    </main>
  );
};

export default NotFoundPage;
