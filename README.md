## 🔈概要

- [ReactのコンポーネントからStorybookのファイルを自動生成してみた](https://zenn.dev/ot_offcial/articles/b4fbbc06d1eb8e)の記事を読み、`storybook`の自動生成を自分でも試してみたくなりました。
- 基本的には写経しているものになりますが、一部カスタマイズしている部分があります。

## 📡使用ライブラリ、フレームワーク
|ライブラリ・フレームワーク|用途|
|---|---|
|React.js|JavaScriptライブラリ。|
|Storybook|UIコンポーネントカタログ。|
|Node.js|JavaScriptランタイム。Scriptを実行する。|
|esbuild|JavaScriptバンドラ。|
|esbuild-register|esbuildでTypeScriptをトランスパイルしながら実行できるようにする。|
|ts-morph|TypeScriptコードを操作および解析するためのライブラリ。|

## 📝スクリプトについて

### 😺`npm scripts`

```zsh
node --loader esbuild-register/loader -r esbuild-register .storybook/scripts/autoCreateStorybook.ts"
```

このファイルは、`node.js`で実行することを想定しています。

その際、`esbuild-register`を使用することで、`TypeScript`のまま実行できるようにしています。

### 😻説明

`Storybook`ファイルを自動生成するスクリプトは、`/.storybook/scripts/autoCreateStorybook.ts`に記載しています。

コードの詳細は、上記ファイルを参照してください。

ここでは、このスクリプトを使ってできることを説明していきます  
（これも上記ファイルを読んでいただければ分かりますが、理解が容易になるためここでも記載しています）。

#### 🛣️ファイルパスについて

まず、`COMPONENTS_PATH`に自動生成したいコンポーネントが配置されている親ディレクトリを指定してください。  
これを指定することで、そのディレクトリ配下にあるコンポーネントファイルの`storybook`ファイルを自動生成します。

`COMPONENT_DIRECTORY_PATH`は、環境によっては修正する必要があります。  
今の設定値では、実行するファイルからの相対パスを使用して`COMPONENTS_PATH`までのパスを指定しています。なので、ディレクトリ構成が異なる場合は、これらを考慮する必要があります。

#### 🪢引数について

このスクリプト（`npm scripts`）を実行すると、このスクリプトの`main`関数である`createStorybooks`関数が実行されます。  
その際、3つの引き数が必要になります。

- `directoryPath`  
    `storybbok`を生成したいコンポーネントが保存されたディレクトリパス。`COMPONENTS_PATH`と同じです(!?)。
- `equalsToAbsolutePath`  
    `storybook`のサイドバー表示をディレクトリと同じにする。
    |true|false|
    |:---:|:---:|
    |![true](/docs/assets/true-equals-to-absolute-path.png)|![false](/docs/assets/false-equals-to-absolute-path.png)|
- `anotherStorybookPath`  
    `storybook`ファイルを、生成したいコンポーネントと同じディレクトリに配置したくない場合、文字列を指定すると`src`配下にその文字列でディレクトリが生成されます。
    |`storybooks`を指定|何も指定しない|
    |:---:|:---:|
    |![`storybooks`を指定](/docs/assets/storybooks-another-storybook-path.png)|![何も指定しない](/docs/assets/non-another-storybook-path.png)|

#### 🍤テンプレートについて

実際に`Storybook`ファイルとして生成されるテンプレートは、テンプレートリテラルで記載されている箇所になります。

このテンプレートに`Selectable`と`Pattern1`を記載しています。  
`Selectable`は、`StorybookWeb`ツールで任意にコントロール値を変えるためのコンポーネントを意図して、作成しています。  
一方`Pattern1`は、そのコンポーネントを使って特定のパターンを作成することが決まっている場合に、カタログとして登録することを意図して、作成しています。

#### 🙅‍♂️このスプリクトでできないこと

このスクリプトでは、あまり複雑なことはできません。例えば、以下のようなことになります。

- オブジェクトや独自の型には対応していないため、その部分は自動生成できません（手動で記載するようにしています）。  
※ 他のデータ型については対応できていないだけです（Dateなど）。。。
    - 理由としては、以下になります。
        - この辺りの型やモックデータ生成は文字列操作してコード生成しているため、対応に終わりがなくなってしまう。
        - 特にオブジェクトの場合、ネストなど再帰的な対応が必要になり、これを文字列操作で実現するのは辛い。
        - 上記よりスクリプトが肥大化してしまう恐れがある。
- 自動生成時は、デフォルトに設定されているモックデータしか表示できません。
    - 例えば、いろいろな文言をテキスト表示したい、という場合や、配列の要素をよしなに出す、というようなことはできません。
    - これは、Storybookのコンポーネントカタログとしてパターン表示する機能があり、それを充実していただいた方が良いと思っています。
    - なので、その機能でもってデータパターンなどを作成していただくため、ここでは簡易的なモックデータしか設定していません。
- 自動でコンポーネントカタログドキュメントを作成してくれる`autodocs`ですが、任意のコンポーネントパターンを表示しない、ということはまだできません。
    - そのため、ドキュメントには`Selectable`は不要なのですが、残ったままになってしまっています。
    - ちなみに、この件に関しては、[issueが建てられており、P-Rにも上がっている](https://github.com/storybookjs/storybook/issues/21085)ようです。