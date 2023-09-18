import { FC, ReactNode } from "react";

import { AnimationProps, motion } from "framer-motion";

type Props = {
  componentType: string;
  animateProps: AnimationProps["animate"];
  transitionProps: AnimationProps["transition"];
  children: ReactNode;
  initialProps?: AnimationProps["initial"];
};

/**
 * SimpleAnimation Component
 * @description 属性を必要とするHTMl要素にこのコンポーネントを使用する場合は、componentType=divにし、childrenにその要素を渡す。
 * @prop {string} componentType コンポーネントの種類。ex: "p", "div"など
 * @prop {AnimationProps["animate"]} animateProps motionタグに設定するanimate属性の設定値。
 * @prop {AnimationProps["transition"]} transitionProps motionタグに設定するtransition属性の設定値。
 * @return SimpleAnimation
 */
export const SimpleAnimation: FC<Props> = ({
  componentType,
  animateProps,
  transitionProps,
  children,
  initialProps,
}) => {
  const MotionComponent = motion(componentType);

  return (
    <MotionComponent
      initial={initialProps}
      animate={animateProps}
      transition={transitionProps}
    >
      {children}
    </MotionComponent>
  );
};
