import { FC } from "react";

import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { PATH } from "~/const";

import { Layout } from "~/components/common/layout/Layout";
import { NotFound } from "~/components/pages/error/NotFound";
import { MusicPlayer } from "~/components/pages/music-player/MusicPlayer";
import { Products } from "~/components/pages/products/Products";
import { Profile } from "~/components/pages/profile/Profile";
import { Top } from "~/components/pages/top/Top";

export const Route: FC = () => {
  const router = createBrowserRouter([
    {
      path: PATH.TOP,
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Top />,
        },
        {
          path: PATH.PROFILE,
          element: <Profile />,
        },
        {
          path: PATH.PRODUCTS,
          element: <Products />,
        },
        { path: PATH.MUSIC_PLAYER, element: <MusicPlayer /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};
