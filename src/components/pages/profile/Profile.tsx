import { FC } from "react";

import { ReactComponent as Me } from "~/assets/images/icon/me_1024.svg";

import { framerMotion } from "~/libs/framer-motion";

import { CARRER_LIST, QUALIFICATION_LIST } from "~/const";

import { SimpleAnimation } from "~/components/common/animation/SimpleAnimation";
import { Table } from "~/components/common/table/Table";

import classes from "~/components/pages/profile/Profile.module.scss";

const DEFAULT_DELAY_SECOND = 0.5;

export const Profile: FC = () => {
  const { animationProperty } = framerMotion();

  const animationProps = animationProperty.riseFromBelow.animate;
  const initialProps = animationProperty.riseFromBelow.initial;

  const getTransitionProps = (delay: number) => {
    return { ...animationProperty.riseFromBelow.transition, delay: delay };
  };

  return (
    <div className={classes.content}>
      <div className={classes["left-content"]}>
        <SimpleAnimation
          componentType="p"
          animateProps={animationProps}
          transitionProps={getTransitionProps(0)}
          initialProps={initialProps}
        >
          Profile
        </SimpleAnimation>
        <SimpleAnimation
          componentType="div"
          animateProps={animationProps}
          transitionProps={getTransitionProps(DEFAULT_DELAY_SECOND)}
          initialProps={initialProps}
        >
          {/* TODO: 自画像に変更する */}
          <Me className={classes["profile-image"]} />
        </SimpleAnimation>
      </div>
      <div className={classes["right-content"]}>
        <SimpleAnimation
          componentType="div"
          animateProps={animationProps}
          transitionProps={getTransitionProps(DEFAULT_DELAY_SECOND + 0.5)}
          initialProps={initialProps}
        >
          <Table tableHeaderTitle="Career" tableBodyRows={CARRER_LIST} />
        </SimpleAnimation>
        <SimpleAnimation
          componentType="div"
          animateProps={animationProps}
          transitionProps={getTransitionProps(DEFAULT_DELAY_SECOND + 1.0)}
          initialProps={initialProps}
        >
          <Table
            tableHeaderTitle="Qualification"
            tableBodyRows={QUALIFICATION_LIST}
          />
        </SimpleAnimation>
      </div>
    </div>
  );
};
