import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { Project } from "ts-morph";

/**
 * 自動生成したいcomponentファイルの場所
 */
const COMPONENT_DIRECTORY_PATH = path.join(
  __dirname,
  "../../src/components/common/table",
);
const PROJECT = new Project({
  tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
});
/**
 * 自動生成したstorybookファイルの保管場所
 */
const STORED_STORYBOOK_DIRECTORY_PATH = path.join(
  __dirname,
  "../../src/components/ui",
);

const createdStorybookNames: string[] = [];

const createStorybooks = (directoryPath: string) => {
  const componentFileOrDirectoryNames = fs.readdirSync(directoryPath);

  componentFileOrDirectoryNames.forEach(
    (componentFileOrDirectoryName: string) => {
      const fullPath = path.join(directoryPath, componentFileOrDirectoryName);
      const status = fs.statSync(fullPath);

      if (status.isDirectory()) {
        createStorybooks(fullPath);
      }

      if (
        status.isFile() &&
        path.extname(componentFileOrDirectoryName) === ".tsx"
      ) {
        // ex: Table.tsx
        const componentFileName = componentFileOrDirectoryName;

        // ex: Table
        let componentFile = path.basename(componentFileName, ".tsx");

        if (componentFile === "index") {
          componentFile = path.basename(directoryPath);
        }

        const storybookFilePath = path.join(
          directoryPath,
          `${componentFile}.stories.tsx`,
        );

        // 今処理しているファイルがstorybookファイルの場合は無視する
        if (componentFileName.includes(".stories.tsx")) {
          return;
        }

        // 今処理しているファイルのstorybookファイルがすでに存在している場合
        if (fs.existsSync(storybookFilePath)) {
          console.log(
            `info: already exist storybook file (${storybookFilePath}).`,
          );
          return;
        }

        const relativeDirectoryPath = path
          .relative(COMPONENT_DIRECTORY_PATH, directoryPath)
          .split(path.sep)
          .join("/");

        const title = `${relativeDirectoryPath}/${componentFile}`;

        const sourceFile = PROJECT.getSourceFile(fullPath);

        if (!sourceFile) {
          console.log(`info: not exist storybook file (${storybookFilePath}).`);
          return;
        }

        // ファイル内のtypeを取得
        const typeAliases = sourceFile.getTypeAliases();

        // ex: ['Props']
        const typeAliasesTypeNames: string[] = [];
        // ex: [
        //   'type Props = {\n' +
        //   '  tableHeaderTitle: string;\n' +
        //   '  tableBodyRows: {\n' +
        //   '    firstCell: string;\n' +
        //   '    secondCell: string;\n' +
        //   '  }[];\n' +
        //   '  textSize?: typeof DEFAULT_TEXT_SIZE;\n' +
        //   '};'
        // ]
        const typeAliasesTypeTexts: string[] = [];

        typeAliases.forEach((typeAlias) => {
          typeAliasesTypeNames.push(typeAlias.getName());
          typeAliasesTypeTexts.push(typeAlias.getText());
        });

        // ex
        const types = JSON.stringify(typeAliasesTypeTexts)
          .replace("type Props = {\\n", "")
          .replace("\\n};", "")
          // typeAliasesTypeTextsの"[]"と最初のkeyvalueのインデントを削除
          .slice(4, -1)
          .replace(/\\n/g, "\n")
          .split("\n")
          .map((typeText) => typeText.trim());

        const argsObj: Record<string, unknown> = {};

        // 値がオブジェクトの場合はnullを割り当てる
        const objectStart = types.findIndex((type) => type.includes(": {"));
        const objectEnd = types.findIndex((type) => type.includes("}"));
        const typesFilterObject = types.filter(
          (_, index) => index < objectStart + 1 || index > objectEnd,
        );

        typesFilterObject.forEach((type) => {
          if (!type.includes(":")) {
            return;
          }

          const key = type.split(":")[0].trim();
          const value = type.split(":")[1].trim();

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
              argsObj[key] = [
                "ダミーデータ１",
                "ダミーデータ2",
                "ダミーデータ3",
              ];
              break;
            case value.includes("boolean"):
              argsObj[key] = false;
              break;
            default:
              // 未知の型または複雑な型の場合、手動で設定してもらう
              argsObj[key] = "手動で設定して下さい";
          }
        });

        const importComponentName = path
          .relative(directoryPath, fullPath)
          .replace(".tsx", "");
        // コンポーネント内の型定義はPropsだけとする
        const typeName = typeAliasesTypeNames[0];

        const importDeclarations = sourceFile.getImportDeclarations();
        const importDeclarationsTexts: string[] = [];

        importDeclarations.forEach((importDeclaration) => {
          const importModule = importDeclaration.getModuleSpecifierValue();
          // TODO: aliasを共通して取得できるようにする
          if (importModule.includes("~/")) {
            importDeclarationsTexts.push(importDeclaration.getText());
          }
        });

        // ex: ['import classes from "~/components/common/button/LinkButton.module.scss";']
        const importDeclarationsText = importDeclarationsTexts.join("\n");

        const argsBlock = typeName
          ? `args:${JSON.stringify(argsObj, null, 2)},`
          : "";

        const hasChildren = types.some((type) => /^children:/.test(type));

        const renderContent = hasChildren
          ? `<${componentFile} {...args}>{args.children}</${componentFile}>`
          : `<${componentFile} {...args} />`;

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
        createdStorybookNames.push(storybookFilePath);
      }
    },
  );
};

console.log("Creating story files...");
createStorybooks(COMPONENT_DIRECTORY_PATH);
console.log("Done!");

console.log("Running Prettier...");
createdStorybookNames.forEach((StorybookName) => {
  exec(
    `prettier --write ${StorybookName}`,
    (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    },
  );
});

console.log("Prettier completed!");
