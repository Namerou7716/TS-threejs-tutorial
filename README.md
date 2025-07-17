# Three.js TypeScript Tutorial

**🎓 初学者から上級者まで - 型安全な3D Web開発への完全ガイド**

このチュートリアルは、Three.jsとTypeScriptを組み合わせた3D Web開発を、基礎から実践的なレベルまで段階的に学習できるように設計されています。プログラミング初心者でも安心して取り組めるよう、丁寧な説明と豊富なサンプルコードを提供しています。

## 📚 チュートリアル一覧

| セクション | 内容 | 難易度 | 所要時間 | 作成するもの |
|-----------|------|--------|----------|-------------|
| [00. TypeScript基礎知識](./docs/00-typescript-basics.md) | **ハンズオン**: 計算機・ユーザー管理・設定管理システム | 初級 | 30-45分 | 8つの実践プロジェクト |
| [01.5. TypeScript × Three.js連携](./docs/01-typescript-threejs-bridge.md) | **ハンズオン**: 5つの段階的シーン作成 | 初級 | 45-60分 | 6つの動く3Dシーン |
| [01. 基本シーンの作成](./docs/01-basic-scene.md) | **ハンズオン**: 本格的システム設計 | 初級 | 45-60分 | 企業レベルの基盤クラス |
| [02. 型安全なオブジェクト作成](./docs/02-typed-geometries.md) | **ハンズオン**: ファクトリーシステム構築 | 中級 | 60-90分 | 動的オブジェクト生成システム |
| [03. 高度な設計パターン](./docs/03-class-based-scene.md) | **ハンズオン**: エンタープライズ級アーキテクチャ | 上級 | 90-120分 | 総合3Dアプリケーション |

## 🎯 このチュートリアルの特徴

### 🚀 完全ハンズオン形式
- **実際にコードを書きながら学習**: 理論だけでなく実践重視
- **段階的プロジェクト作成**: 小さなものから始めて徐々に複雑化
- **動くモノづくり**: 各セクションで実際に動作するアプリケーションを作成
- **体験的学習**: 概念を実際のコード作成で理解

### 💡 実践的な内容
- **リアルなプロジェクト構造**: 実際の開発現場で使える構成
- **型安全性**: TypeScriptの力を最大限に活用
- **モダンな開発環境**: Vite、ESLint、Hot Reload対応
- **エンタープライズ級設計**: 大規模アプリケーションにも対応できる設計パターン

### 🔧 技術スタック
- **Three.js** `^0.178.0` - 3Dライブラリ
- **TypeScript** `^5.3.0` - 型安全なJavaScript
- **Vite** `^5.0.0` - 高速ビルドツール
- **ESLint** `^8.57.0` - コード品質管理

## 📚 学習の進め方（推奨順序）

### 📋 学習前の準備
1. **開発環境のセットアップ** - Node.js、エディタの準備
2. **基本知識の確認** - JavaScript、HTML/CSSの基礎

### 🎯 推奨学習パス

**完全ハンズオン形式**で、各セクションで実際にアプリケーションを作成しながら学習します：

1. **[TypeScript基礎](./docs/00-typescript-basics.md)**  
   → **8つのプロジェクト作成**: 計算機・ユーザー管理・設定管理・Three.jsヘルパー

2. **[TypeScript × Three.js連携](./docs/01-typescript-threejs-bridge.md)**  
   → **6つの3Dシーン作成**: JS→TS変換・図形コレクション・インタラクティブ・アニメーション・総合シーン

3. **[基本シーンの作成](./docs/01-basic-scene.md)**  
   → **企業レベル基盤クラス作成**: リソース管理・イベント処理・型安全設計

4. **[型安全なオブジェクト作成](./docs/02-typed-geometries.md)**  
   → **ファクトリーシステム構築**: 動的オブジェクト生成・型ガード・高度な型システム

5. **[高度な設計パターン](./docs/03-class-based-scene.md)**  
   → **総合3Dアプリケーション**: 抽象クラス・ミックスイン・デコレータ・パフォーマンス監視

**📁 作成成果物**: 合計20+個の動作するファイル・プロジェクト

## 📦 セットアップ

### 必要な環境
- **Node.js** 18.0以上
- **npm** または **yarn**
- **モダンブラウザ** (Chrome 90+, Firefox 88+, Safari 14+)
- **テキストエディタ** (VS Code推奨)

### インストール手順

```bash
# 1. 依存関係のインストール
npm install

# 2. 開発サーバーの起動
npm run dev
# → http://localhost:8080 でアクセス可能

# 3. TypeScript型チェック（任意）
npm run type-check

# 4. コード品質チェック（任意）
npm run lint
```

### 🚀 クイックスタート

初回セットアップ後、すぐに動作を確認したい場合は：

```bash
# 開発サーバーを起動
npm run dev

# ブラウザで http://localhost:8080 にアクセス
# または直接 index.html をブラウザで開く
```

**動作確認のポイント：**
- 緑色の立方体が回転しているか確認
- コントロールパネルで色やカメラ位置を変更
- ブラウザのコンソールでログを確認

### 🚨 トラブルシューティング

**Q: npm installが失敗する**
```bash
# Node.jsのバージョンを確認
node --version
# 18.0以上であることを確認

# キャッシュをクリア
npm cache clean --force
npm install
```

**Q: 開発サーバーが起動しない**
```bash
# ポートが使用中の場合
npm run dev -- --port 3000
```

## 🏗️ プロジェクト構造

```
threejs-typescript-tutorial/
├── docs/                       # 📚 チュートリアル文書（Markdown形式）
│   ├── 00-typescript-basics.md         # TypeScript基礎
│   ├── 01-typescript-threejs-bridge.md # TS×Three.js連携
│   ├── 01-basic-scene.md              # 基本シーン
│   ├── 02-typed-geometries.md         # 型安全ファクトリー
│   ├── 03-class-based-scene.md        # 高度な設計パターン
│   └── FAQ.md                         # よくある質問集
├── src/                        # 💻 TypeScriptソースコード
│   ├── basic-scene.ts          # 基本シーンクラス
│   ├── typed-geometry-factory.ts # 型安全ファクトリー
│   └── scene-manager.ts        # 高度なシーン管理
├── types/                      # 📝 カスタム型定義
│   └── geometry-types.ts       # ジオメトリ関連の型
├── dist/                       # 📦 ビルド出力（自動生成）
├── package.json               # プロジェクト設定
├── tsconfig.json              # TypeScript設定
├── vite.config.ts             # Vite設定
└── README.md                  # このファイル
```

### 📁 ファイル説明

**docs/** - 学習用Markdownファイル（GitHub上で読みやすい形式）
- **00-typescript-basics.md**: TypeScript基礎知識の学習
- **01-typescript-threejs-bridge.md**: Three.js×TypeScript連携の理解
- **01-basic-scene.md**: 基本的な3Dシーンの作成
- **02-typed-geometries.md**: 型安全なオブジェクト作成システム
- **03-class-based-scene.md**: 高度な設計パターンの実装
- **FAQ.md**: よくある質問と回答集

**src/** - TypeScriptソースコード
- **basic-scene.ts**: 基本シーンクラスの実装
- **typed-geometry-factory.ts**: 型安全なファクトリーパターン
- **scene-manager.ts**: 高度なシーン管理システム

**types/** - 型定義ファイル
- **geometry-types.ts**: ジオメトリとマテリアルの型定義

## 🔧 開発環境設定

### TypeScript設定 (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "declaration": true,
    "sourceMap": true
  }
}
```

### Vite設定 (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 8080,
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
```

## 🎨 設計パターン

### Abstract Classes (抽象クラス)

```typescript
export abstract class AbstractSceneManager {
  protected abstract initializeScene(): void;
  protected abstract setupLighting(): void;
  protected abstract updateScene(deltaTime: number): void;
  
  // テンプレートメソッドパターン
  public initialize(): void {
    this.initializeScene();
    this.setupLighting();
    this.setupEventListeners();
  }
}
```

### Mixins (ミックスイン)

```typescript
export function InteractableMixin<TBase extends Constructor>(Base: TBase) {
  return class extends Base implements Interactable {
    public raycaster = new THREE.Raycaster();
    public mouse = new THREE.Vector2();
    
    public setupInteraction(): void {
      // インタラクション機能の実装
    }
  };
}
```

### Factory Pattern (ファクトリーパターン)

```typescript
export class TypedGeometryFactory {
  static createGeometry<T extends GeometryType>(
    type: T,
    config: GeometryConfig['config']
  ): GeometryInstance<T> {
    // 型安全なジオメトリ生成
  }
}
```

## 📋 TypeScript機能

### 高度な型システム

```typescript
// Union Types
type GeometryType = 'box' | 'sphere' | 'cone' | 'cylinder';

// Conditional Types
type GeometryInstance<T extends GeometryType> = 
  T extends 'box' ? THREE.BoxGeometry :
  T extends 'sphere' ? THREE.SphereGeometry :
  THREE.BufferGeometry;

// Generic Constraints
interface ObjectConfig<T extends GeometryType> {
  geometry: { type: T; config: GeometryConfigMap[T] };
  material: MaterialConfig;
}
```

### インターフェース設計

```typescript
interface SceneConfig {
  camera: {
    fov: number;
    aspect: number;
    near: number;
    far: number;
    position: THREE.Vector3;
  };
  renderer: {
    antialias: boolean;
    alpha: boolean;
  };
  scene: {
    background: THREE.Color;
  };
}
```

## 🚀 パフォーマンス最適化

- **Tree Shaking**: 使用されないコードの自動除去
- **Type-Only Imports**: 型定義のみのインポート
- **Strict Mode**: 厳密な型チェックでランタイムエラーの削減
- **Hot Module Replacement**: 開発時の高速リロード

## 🧪 テストとデバッグ

### 型チェック

```bash
npm run type-check
```

### リント

```bash
npm run lint
npm run lint:fix
```

### デバッグ機能

- パフォーマンスモニタリング
- ワイヤーフレーム表示
- バウンディングボックス表示
- 座標軸ヘルパー

## 🎓 学習サポート

### 💡 学習のコツ
1. **順序を守る**: 00 → 01.5 → 01 → 02 → 03 の順で学習
2. **手を動かす**: 実際にコードを書いて動かしてみる
3. **理解を深める**: なぜそのようなコードになるのかを考える
4. **エラーを恐れない**: エラーメッセージから学ぶ

### 🤔 よくある質問

**Q: TypeScriptは必須ですか？**
A: Three.js自体はJavaScriptで書かれていますが、TypeScriptを使うことで型安全性、自動補完、リファクタリング支援などの恩恵を受けられます。

**Q: 数学の知識は必要ですか？**
A: 基本的な座標（x, y, z）の概念があれば十分です。高度な数学は段階的に学習できます。

**Q: どのエディタを使うべきですか？**
A: Visual Studio Code (VS Code) を推奨します。TypeScriptの補完機能が充実しています。

**Q: 学習にはどのくらい時間がかかりますか？**
A: ハンズオン形式により、以下が目安です：
- TypeScript初心者: 全体で8-12時間（実際にコードを書く時間含む）
- JavaScript経験者: 4-6時間（プロジェクト作成含む）
- TypeScript経験者: 3-4時間（応用プロジェクトに集中）

**Q: 理論だけ学習したい場合は？**
A: このチュートリアルは実践重視です。理論は実際のコード作成を通じて自然に身につく設計になっています。

### 📚 参考リソース

#### 公式ドキュメント
- [Three.js 公式ドキュメント](https://threejs.org/docs/) - Three.jsの全機能について
- [TypeScript 公式ドキュメント](https://www.typescriptlang.org/docs/) - TypeScriptの詳細な仕様
- [Vite 公式ドキュメント](https://vitejs.dev/guide/) - ビルドツールの使い方

#### 学習リソース
- [Three.js Journey](https://threejs-journey.com/) - Three.jsの包括的な学習コース
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) - TypeScriptの深い理解
- [MDN Web Docs - WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) - WebGLの基礎知識

### 🛠️ 開発環境の推奨設定

#### VS Code 拡張機能
- **TypeScript Importer** - 自動インポート機能
- **Bracket Pair Colorizer** - 括弧の色分け
- **Error Lens** - エラーの可視化
- **Prettier** - コードフォーマット
- **ESLint** - コード品質チェック

#### ブラウザ開発者ツール
- **Chrome DevTools** - Three.jsのデバッグに最適
- **Firefox Developer Edition** - WebGLの詳細な分析

## 🤝 コントリビューション

このプロジェクトへの貢献を歓迎します！

### 貢献方法
1. Issue を確認して、既存の問題や改善提案を確認
2. Fork してローカルで開発
3. わかりやすいコミットメッセージで変更を記録
4. Pull Request を作成

### 貢献できる内容
- **バグ修正**: 動作しないコードの修正
- **説明の改善**: より分かりやすい解説の追加
- **新機能の追加**: 新しい学習例の作成
- **翻訳**: 他言語への翻訳

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 🙏 謝辞

このプロジェクトは以下の素晴らしいプロジェクトの恩恵を受けています：
- [Three.js](https://threejs.org/) - 素晴らしい3Dライブラリ
- [TypeScript](https://www.typescriptlang.org/) - 型安全なJavaScript
- [Vite](https://vitejs.dev/) - 高速なビルドツール

---

**🚀 Three.js TypeScript Tutorial で、型安全な3D Web開発を始めましょう！**