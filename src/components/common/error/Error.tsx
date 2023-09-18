import { FC } from "react";

const ERROR_STATUS = {
  NOT_FOUND: 404,
};

type Props = {
  errorStatus: (typeof ERROR_STATUS)[keyof typeof ERROR_STATUS];
};

export const Error: FC<Props> = ({ errorStatus }) => {
  const getErrorMessage = () => {
    switch (errorStatus) {
      case ERROR_STATUS.NOT_FOUND:
        return "ページが見つかりませんでした";
      default:
        return "エラーが発生しています。時間を置いて、再度アクセスしてみて下さい。";
    }
  };
  return <p>{getErrorMessage()}</p>;
};
