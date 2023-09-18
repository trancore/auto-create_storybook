import { FC } from "react";

import { Error } from "~/components/common/error/Error";

export const NotFound: FC = () => {
  return <Error errorStatus={404}></Error>;
};
