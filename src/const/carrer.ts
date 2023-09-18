import { ComponentProps } from "react";

import { Table } from "~/components/common/table/Table";

/**
 * 学歴・職歴の定数
 */
export const CARRER_LIST: ComponentProps<typeof Table>["tableBodyRows"] = [
  {
    firstCell: "2015.03",
    secondCell: "医療系私立大学 医療工学系学科 卒業",
  },
  {
    firstCell: "2017.03",
    secondCell: "医療系大学大学院 医療系学科 卒業",
  },
  {
    firstCell: "2019.04 - 2019.07",
    secondCell: "1社目：医療機器メーカー 研究開発職",
  },
  {
    firstCell: "2020.01 - 2021.09",
    secondCell: "2社目：SI企業 Webアプリエンジニア職",
  },
  {
    firstCell: "2021.10 -",
    secondCell: "3社目：SI企業 Webアプリ / フロントエンドエンジニア職",
  },
];
