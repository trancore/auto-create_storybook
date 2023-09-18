import { FC } from "react";

import { ReactComponent as Book } from "~/assets/images/icon/book_64.svg";
import { ReactComponent as Home } from "~/assets/images/icon/home_64.svg";
import { ReactComponent as Music } from "~/assets/images/icon/music_64.svg";
import { ReactComponent as Person } from "~/assets/images/icon/person_64.svg";
import { ReactComponent as Products } from "~/assets/images/icon/products_64.svg";

const ICONS = { Book, Home, Music, Person, Products };
const DEFAULT_ICON_SIZE = 44;

type IconName = keyof typeof ICONS;
type IconSize = 24 | typeof DEFAULT_ICON_SIZE;

type Props = {
  name: IconName;
  size?: IconSize;
  color?: string;
};

export const Icon: FC<Props> = ({
  name,
  size = DEFAULT_ICON_SIZE,
  color = "#FFFFFF",
}) => {
  const Icon = ICONS[name];
  return (
    <>
      <Icon width={size} height={size} fill={color} />
    </>
  );
};
