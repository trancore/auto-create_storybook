import { FC } from "react";

import { Link } from "react-router-dom";

import { PAGE_PATH } from "~/const";

import { Icon } from "~/components/common/icon/Icon";

import classes from "~/components/common/header/Header.module.scss";

export const Header: FC = () => {
  return (
    <div className={classes.header}>
      <div className={classes.list}>
        <Link to={PAGE_PATH.TOP}>
          <Icon name="Home" />
        </Link>
        <Link to={PAGE_PATH.PROFILE}>
          <Icon name="Person" />
        </Link>
        <Link to={PAGE_PATH.PRODUCTS}>
          <Icon name="Products" />
        </Link>
      </div>
    </div>
  );
};
