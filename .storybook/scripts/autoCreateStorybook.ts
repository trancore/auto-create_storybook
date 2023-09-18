import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { Project } from "ts-morph";

const componentsDir = path.join(__dirname, "../src/components");

const project = new Project({
  tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
});

const createdStoryFileNames: string[] = [];

const createStoryFiles = (dir: string) => {
  const items = fs.readdirSync(dir);

  items.forEach((item: string) => {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      createStoryFiles(fullPath);
    }

    if (
      stats.isFile() &&
      path.extname(item) === ".tsx" &&
      !item.endsWith(".test.tsx") &&
      !item.endsWith(".story.tsx")
    ) {
      let componentName = path.basename(item, ".tsx");

      if (componentName === "index") {
        componentName = path.basename(dir);
      }

      const storyFilePath = path.join(dir, `${componentName}.story.tsx`);

      if (fs.existsSync(storyFilePath)) return;

      const relativeDir = path
        .relative(componentsDir, dir)
        .split(path.sep)
        .join("/");

      const title = `${relativeDir}/${componentName}`;

      const sourceFile = project.getSourceFile(fullPath);

      if (!sourceFile) return;

      const typeAliases = sourceFile.getTypeAliases();
      const typeAliasesTypeNames: { getName: any }[] = [];
      const typeAliasesTypeTexts: { getText: any }[] = [];

      typeAliases.forEach((typeAlias: { getText: any; getName: any }) => {
        typeAliasesTypeNames.push(typeAlias.getName());
        typeAliasesTypeTexts.push(typeAlias.getText());
      });

      const typeItems = JSON.stringify(typeAliasesTypeTexts)
        .replace('"type Props = {\\n', "")
        .replace('\\n}"', "")
        .slice(1, -1)
        .replace(/\\n/g, "\n")
        .split("\n")
        .map((item) => item.trim());

      const argsObj: Record<string, unknown> = {};

      typeItems.forEach((item) => {
        if (!item.includes(":")) return;
        const key = item.split(":")[0].trim();
        const value = item.split(":")[1].trim();

        if (key.includes("?")) return;

        switch (
          !!value // ここでストーリーファイルの　args: {}　に当て込む初期値を設定しています
        ) {
          case key.includes("width"):
          case key.includes("height"):
            argsObj[key] = "100px";
            break;
          case key.includes("color"):
            argsObj[key] = "white";
            break;
          case key.includes("href"):
          case key.includes("src"):
          case key.includes("url"):
            argsObj[key] = "https://example.com";
            break;
          case key.includes("backgroundColor"):
            argsObj[key] = "#3460C5";
            break;
          case key.includes("margin"):
          case key.includes("padding"):
            argsObj[key] = "10px";
            break;
          case key.includes("children"):
            argsObj[key] = "ここにchildrenの内容が表示されます。";
            break;
          case value.includes("number"):
            argsObj[key] = 1;
            break;
          case value.includes("string"):
            argsObj[key] = "ダミーデータ";
            break;
          case value.includes("boolean"):
            argsObj[key] = false;
            break;
          default:
            // 未知の型または複雑な型の場合、一時的に null を割り当てる
            argsObj[key] = null;
        }
      });

      const importPath = path.relative(dir, fullPath).replace(".tsx", "");
      const typeName = typeAliasesTypeNames[0];
      const typeContent = typeAliasesTypeTexts.join("\n");

      const imports = sourceFile.getImportDeclarations();
      const importTypeTexts: string[] = [];
      const mantineCoreImportNames: string[] = [];
      const mantineTargetTypes = ["Sx", "MantineSize"];

      imports.forEach(
        (imp: {
          getModuleSpecifierValue: any;
          getText: any;
          getNamedImports: any;
        }) => {
          const importModule = imp.getModuleSpecifierValue();

          if (
            (typeContent && importModule.includes("@/types")) ||
            importModule === "@mantine/form/lib/types"
          ) {
            importTypeTexts.push(imp.getText());
          }
          if (importModule === "@mantine/core") {
            const namedImports = imp.getNamedImports();
            const importNames = namedImports.map(
              (namedImport: { getName: any }) => namedImport.getName(),
            );
            const filteredImportNames = importNames.filter((name: string) =>
              mantineTargetTypes.includes(name),
            );
            mantineCoreImportNames.push(...filteredImportNames);
          }
        },
      );

      const importTypePath = importTypeTexts.join("\n");
      const importMantineCore =
        mantineCoreImportNames.length > 0
          ? `import { ${mantineCoreImportNames.join(
              ", ",
            )} } from '@mantine/core';`
          : "";

      const argsBlock = typeName
        ? `args:
        ${JSON.stringify(argsObj, null, 2)}
      ,`
        : "";

      const hasChildren = typeItems.some((item) => /^children:/.test(item));

      const renderContent = hasChildren
        ? `<${componentName} {...args}>{args.children}</${componentName}>`
        : `<${componentName} {...args} />`;

      const content = `
  import { Meta, StoryObj } from '@storybook/react';
  import ${componentName} from './${importPath}';
  ${importTypePath}
  ${importMantineCore}

  ${typeContent}

  export default {
    title: '${title}',
    component: ${componentName},
    tags: ['autodocs'],
    ${argsBlock}
    // Add your own control here
  } as Meta;

  type Story = StoryObj<typeof ${componentName}>;

  export const Default: Story = {
    render: ${typeName ? `(args: ${typeName})` : "()"} => {
      /* eslint-disable react-hooks/rules-of-hooks */
      return (${renderContent});
    },
  };
  `;

      fs.writeFileSync(storyFilePath, content);
      createdStoryFileNames.push(storyFilePath);
    }
  });
};

console.log("Creating story files...");
createStoryFiles(componentsDir);
console.log("Done!");

console.log("Running Prettier...");
createdStoryFileNames.forEach((fileName) => {
  exec(
    `prettier --write ${fileName}`,
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
