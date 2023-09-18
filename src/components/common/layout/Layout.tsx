import { FC } from "react";

import { Outlet, useLocation } from "react-router-dom";

import { PATH } from "~/const";

import { Header } from "~/components/common/header/Header";

import classes from "~/components/common/layout/Layout.module.scss";

export const Layout: FC = () => {
  const { pathname } = useLocation();

  return (
    <div className={classes.page}>
      {pathname !== PATH.TOP && <Header />}
      <main>
        <Outlet />
      </main>
    </div>
  );
};
