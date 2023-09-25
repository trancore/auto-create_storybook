import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { Project } from "ts-morph";
import { promisify } from "util";

const PROJECT = new Project({
  tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
});
/**
 * 自動生成したいcomponentファイルの場所
 */
const COMPONENT_DIRECTORY_PATH = path.join(
  __dirname,
  "../../src/components/common/table",
);
/**
 * 自動生成したstorybookファイルの保管場所
 */
const STORED_STORYBOOK_DIRECTORY_PATH = path.join(
  __dirname,
  "../../src/storybook",
);

const createdStorybookFilePaths: string[] = [];

// ---
// function
// ---

/**
 * storybookを生成
 * @param directoryPath 自動生成したいコンポーネントが保存されたディレクトリパス
 */
const createStorybooks = (directoryPath: string) => {
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
        createStorybooks(fullPath);
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
      const storybookFilePath = path.join(
        directoryPath,
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
      const types = JSON.stringify(typeProps[0].typeText)
        .replace("type Props = {\\n", "")
        .replace("\\n};", "")
        // typeAliasesTypeTextsの"[]"と最初のkeyvalueのインデントを削除
        .slice(3, -1)
        .replace(/\\n/g, "\n")
        .split("\n")
        .map((typeText) => typeText.trim());

      // 値がオブジェクトの場合は undefined を割り当てる
      const objectStart = types.findIndex((type) => type.includes(": {"));
      const objectEnd =
        types.length -
        1 -
        types
          .concat()
          .reverse()
          .findIndex((type) => type.includes("}"));
      const typesFilterObjects = types.filter(
        (_, index) => index < objectStart + 1 || index > objectEnd,
      );

      const argsObj: Record<string, unknown> = {};
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
      const typeName = typeProps[0].typeName;

      // ---

      const importDeclarations = sourceFile.getImportDeclarations();
      const importDeclarationsTexts = importDeclarations.map(
        (importDeclaration) => {
          const importModule = importDeclaration.getModuleSpecifierValue();
          if (importModule.includes("~/")) {
            return importDeclaration.getText();
          }
        },
      );
      // ex: ['import classes from "~/components/common/button/LinkButton.module.scss";']
      const importDeclarationsText = importDeclarationsTexts.join("\n");
      const argsBlock = typeName
        ? `args:${JSON.stringify(argsObj, null, 2)},`
        : "";

      // ---

      const hasChildren = types.some((type) => /^children:/.test(type));
      const renderContent = hasChildren
        ? `<${componentFile} {...args}>{args.children}</${componentFile}>`
        : `<${componentFile} {...args} />`;
      // ---

      const content = `
import { ComponentProps } from "react";
import { Meta, StoryObj } from '@storybook/react';
import { ${componentFile} } from './${importComponentName}';
${importDeclarationsText}

type Props = ComponentProps<typeof ${componentFile}>

export default {
  title: '${title}',
  component: ${componentFile},
  tags: ['autodocs'],
  ${argsBlock}
  // Add your own control here
} as Meta;

type Story = StoryObj<typeof ${componentFile}>;

export const Default: Story = {
  render: ${typeName ? `(args: ${typeName})` : "()"} => {
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

createStorybooks(COMPONENT_DIRECTORY_PATH);

console.log("\nDone!");

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
          console.log(`stdout: ${resolve.stdout.toString()}`);
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
