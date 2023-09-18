import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * graphql-codegen 設定ファイル
 */
const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      "src/libs/graphql/schema/github/schema.docs.graphql": {},
    },
  ],
  /** クエリ保存場所 */
  documents: "src/libs/graphql/documents/*.graphql",
  /** 生成先パス */
  generates: {
    "src/libs/graphql/generated/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;
