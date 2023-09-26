import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { Project } from "ts-morph";
import { promisify } from "util";

/**
 * 自動生成したいcomponentファイルのパス
 */
const COMPONENTS_PATH = "/components/common/";
/**
 * 自動生成したいcomponentファイルの絶対パス
 */
const COMPONENT_DIRECTORY_PATH = path.join(
  __dirname,
  `../../src${COMPONENTS_PATH}`,
);
/**
 * アライアス
 */
const ALIAS = "~";
const PROJECT = new Project({
  tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
});

const createdStorybookFilePaths: string[] = [];

// ---
// function
// ---

/**
 * storybookを生成
 * @param directoryPath storybbokを生成したいコンポーネントが保存されたディレクトリパス
 * @param equalsToAbsolutePath storybookのサイドバー表示を、生成したいコンポーネントの絶対パスとするかどうか。falseの場合、自動生成したいコンポーネントのパスからの相対パスから表示される。
 * @param anotherStorybookPath storybookファイルを、生成したいコンポーネントと同じディレクトリに配置したくない場合、文字列を指定するとsrc配下にその文字列でディレクトリが生成される。
 */
const createStorybooks = (
  directoryPath: string,
  equalsToAbsolutePath: boolean = false,
  anotherStorybookPath?: string,
) => {
  // storybookを配置するパス。
  const storybookDirectoryPath = anotherStorybookPath
    ? directoryPath.replace("components", anotherStorybookPath)
    : directoryPath;

  // ディレクトリパスの読み込み
  const componentFileOrDirectoryNames = fs.readdirSync(directoryPath);

  // 読み込んだディレクトリを一つずつ処理する
  componentFileOrDirectoryNames.forEach(
    (componentFileOrDirectoryName: string) => {
      const fullPath = path.join(directoryPath, componentFileOrDirectoryName);
      const status = fs.statSync(fullPath);
      const sourceFile = PROJECT.getSourceFile(fullPath);

      // チェック処理
      // ディレクトリの場合は、そのディレクトリ内で再度生成処理を行う
      if (status.isDirectory()) {
        createStorybooks(fullPath, equalsToAbsolutePath, anotherStorybookPath);
      }
      // 読み込んだ対象がファイルでない場合、もしくはtsxファイルでない場合は無視する
      if (
        !status.isFile() ||
        path.extname(componentFileOrDirectoryName) !== ".tsx"
      ) {
        return;
      }
      // tsファイルとして読み込めなかった場合、警告を残しログを残す
      if (!sourceFile) {
        console.warn(`🚨 warn: not is TypeScript file (${fullPath}).`);
        return;
      }

      // 生成処理
      // ex: Table.tsx
      const componentFileName = componentFileOrDirectoryName;
      // ex: Table
      let componentFile = path.basename(componentFileName, ".tsx");

      if (componentFile === "index") {
        componentFile = path.basename(directoryPath);
      }

      // storybookファイルのパス。保存場所もここで決まる。
      fs.mkdirSync(storybookDirectoryPath, { recursive: true });
      const storybookFilePath = path.join(
        storybookDirectoryPath,
        `${componentFile}.stories.tsx`,
      );

      // 今処理しているファイルがstorybookファイルの場合は無視する
      if (componentFileName.includes(".stories.tsx")) {
        return;
      }

      // 今処理しているファイルのstorybookファイルがすでに存在している場合はログを残し、無視する
      if (fs.existsSync(storybookFilePath)) {
        console.log(
          `\n👮 info: already exist storybook file (${storybookFilePath}).`,
        );
        return;
      }

      // 生成したいコンポーネントディレクトリと処理しているコンポーネントとの相対パス
      const relativeDirectoryPath = path
        .relative(COMPONENT_DIRECTORY_PATH, directoryPath)
        .split(path.sep)
        .join("/");

      // meta title
      const title = relativeDirectoryPath
        ? `${relativeDirectoryPath}/${componentFile}`
        : `${componentFile}`;

      // -----

      // ファイル内のtypeを取得
      const typeAliases = sourceFile.getTypeAliases();
      const typeAliasesTypes: { typeName: string; typeText: string }[] =
        typeAliases.map((typeAlias) => {
          return {
            typeName: typeAlias.getName(),
            typeText: typeAlias.getText(),
          };
        });
      // Propsのみを取り出す
      const typeProps = typeAliasesTypes.filter(
        (typeAliasesType) => typeAliasesType.typeName === "Props",
      );
      const types =
        typeProps[0] !== undefined
          ? JSON.stringify(typeProps[0].typeText)
              .replace("type Props = {\\n", "")
              .replace("\\n};", "")
              // typeAliasesTypeTextsの"[]"と最初のkeyvalueのインデントを削除
              .slice(3, -1)
              .replace(/\\n/g, "\n")
              .split("\n")
              .map((typeText) => typeText.trim())
          : [];

      // 値がオブジェクトの場合は undefined を割り当てる
      // オブジェクトのネストにさらにp武ジェクトがあっても無視しています
      const objectStart = types.findIndex((type) => type.includes(": {"));
      const objectEnd =
        types.length -
        1 -
        types
          .concat()
          .reverse()
          .findIndex((type) => type.includes("}"));
      const typesFilterObjects =
        objectStart === -1
          ? types
          : types.filter(
              (_, index) => index < objectStart + 1 || index > objectEnd,
            );

      const argsObj: Record<string, unknown> = {};
      // TODO オブジェクトのないPropsでエラー
      typesFilterObjects.forEach((object) => {
        if (!object.includes(":")) {
          return;
        }

        const key = object.split(":")[0].trim();
        const value = object.split(":")[1].trim();

        // Optionalの場合は何もしない
        if (key.includes("?")) {
          return;
        }

        // storybook ファイルの args: {} に初期値を設定する
        switch (!!value) {
          case key.includes("children"):
            argsObj[key] = "ここにchildrenの内容が表示されます";
            break;
          case value.includes("number"):
            argsObj[key] = 1;
            break;
          case value.includes("number[]") || value.includes("Array<number>"):
            argsObj[key] = [1, 2, 3];
            break;
          case value.includes("string"):
            argsObj[key] = "ダミーデータ";
            break;
          case value.includes("string[]" || value.includes("Array<string>")):
            argsObj[key] = ["ダミーデータ１", "ダミーデータ2", "ダミーデータ3"];
            break;
          case value.includes("boolean"):
            argsObj[key] = false;
            break;
          default:
            // 未知の型または複雑な型の場合、手動で設定してもらう
            argsObj[key] = "手動で設定して下さい";
        }
      });

      // ---

      const importComponentName = path
        .relative(directoryPath, fullPath)
        .replace(".tsx", "");
      const typeName = typeProps[0] && typeProps[0].typeName;

      // ---

      // const importDeclarations = sourceFile.getImportDeclarations();
      // const importDeclarationsTexts = importDeclarations.map(
      //   (importDeclaration) => {
      //     const importModule = importDeclaration.getModuleSpecifierValue();
      //     if (importModule.includes("~/")) {
      //       return importDeclaration.getText();
      //     }
      //   },
      // );
      // // ex: ['import classes from "~/components/common/button/LinkButton.module.scss";']
      // const importDeclarationsText = importDeclarationsTexts.join("\n");

      // ---

      const argsObject = typeName ? `${JSON.stringify(argsObj, null, 2)},` : "";

      let argsText = "";
      for (const [key, value] of Object.entries(argsObj)) {
        if (key === "children") {
          break;
        }
        argsText += ` ${key}="${value}"`;
      }

      // ---

      const hasChildren = types.some((type) => /^children:/.test(type));
      const renderContent = hasChildren
        ? `<${componentFile} ${argsText}>{args.children}</${componentFile}>`
        : `<${componentFile} ${argsText} />`;

      // ---

      const importFile = fullPath.substring(
        fullPath.indexOf(COMPONENTS_PATH) + 1,
      );
      const importFilePath = importFile.substring(
        0,
        importFile.indexOf(componentFileName),
      );

      // ---

      const content = `
import { Meta, StoryObj } from '@storybook/react';
import { ${componentFile} } from '${ALIAS}/${importFilePath}${importComponentName}';

const meta: Meta<typeof ${componentFile}> = {
  ${equalsToAbsolutePath ? "" : `title: "${title}",`}
  component: ${componentFile},
  tags: ['autodocs'],
  // Add your own control here
}
export default meta;

type Story = StoryObj<typeof ${componentFile}>;

/**
 * パターン
 */
export const Selectable: Story = {
  args: ${argsObject}
};

export const Pattern1: Story = {
  render: () => {
    return (${renderContent});
  },
};
        `;

      fs.writeFileSync(storybookFilePath, content);
      createdStorybookFilePaths.push(storybookFilePath);
    },
  );
};

console.log(`\nstart create storybook.`);

createStorybooks(COMPONENT_DIRECTORY_PATH, false, "storybooks");

console.log("Done!");

console.log("\nRunning Prettier...");

(async () => {
  for (const storybook of createdStorybookFilePaths) {
    await promisify(exec)(`prettier --write ${storybook}`)
      .then((resolve) => {
        if (resolve.stderr) {
          console.log(`error: ${resolve.stderr.toString()}`);
          return;
        }
        if (resolve.stdout) {
          console.log(`stdout: ${resolve.stdout.toString()}`.replace("\n", ""));
          return;
        }
      })
      .catch((error) => {
        console.error(`error: ${error}`);
        return;
      });
  }
  console.log("Prettier completed!");
})();
