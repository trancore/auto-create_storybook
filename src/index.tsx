import React from "react";

import ReactDOM from "react-dom/client";
import { Provider } from "urql";

import { githubClient } from "~/libs/graphql/graphql";

import { Route } from "~/components/common/route/Route";

import "~/index.module.scss";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <Provider value={githubClient}>
      <Route />
    </Provider>
  </React.StrictMode>,
);

// https://create-react-app.dev/docs/measuring-performance/
// reportWebVitals();
