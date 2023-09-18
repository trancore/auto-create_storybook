import { useEffect, useState } from "react";

const BREAK_POINTS = {
  SP: "767px",
  TABLAT: "1179px",
  PC: "1180px",
};

export const useMediaQuery = () => {
  const matchMediaForSp = `screen and (max-width: ${BREAK_POINTS.SP})`;
  const matchMediaForTablet = `screen and (min-width: ${BREAK_POINTS.SP}) and (max-width: ${BREAK_POINTS.TABLAT})`;
  const matchMediaForPc = `screen and (max-width: ${BREAK_POINTS.PC})`;

  const [mediaQuery, setMediaQuery] = useState({
    isSp: window.matchMedia(matchMediaForSp).matches,
    isTablet: window.matchMedia(matchMediaForTablet).matches,
    isPc: window.matchMedia(matchMediaForPc).matches,
  });

  useEffect(() => {
    const onResize = () => {
      setMediaQuery({
        isSp: window.matchMedia(matchMediaForSp).matches,
        isTablet: window.matchMedia(matchMediaForTablet).matches,
        isPc: window.matchMedia(matchMediaForPc).matches,
      });
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  });

  return {
    isSp: mediaQuery.isPc,
    isTablet: mediaQuery.isTablet,
    isPc: mediaQuery.isPc,
  };
};
