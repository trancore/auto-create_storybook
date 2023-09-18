import { FC } from "react";

import classes from "~/components/pages/music-player/MusicPlayer.module.scss";

export const MusicPlayer: FC = () => {
  return (
    <div className={classes.content}>
      <p>🎵</p>
      <p>只今作成中です。</p>
    </div>
  );
};
