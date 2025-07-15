# Three.js TypeScript Tutorial

**🎓 初学者から上級者まで - 型安全な3D Web開発への完全ガイド**

このチュートリアルは、Three.jsとTypeScriptを組み合わせた3D Web開発を、基礎から実践的なレベルまで段階的に学習できるように設計されています。プログラミング初心者でも安心して取り組めるよう、丁寧な説明と豊富なサンプルコードを提供しています。

## 🎯 このチュートリアルの特徴

### 🚀 初学者に優しい設計
- **段階的学習**: 基礎から順序立てて学習
- **日本語での詳細な説明**: 専門用語も丁寧に解説
- **インタラクティブなデモ**: 実際に動かしながら理解
- **豊富なコメント**: コードの意図を明確に記述

### 💡 実践的な内容
- **リアルなプロジェクト構造**: 実際の開発現場で使える構成
- **型安全性**: TypeScriptの力を最大限に活用
- **モダンな開発環境**: Vite、ESLint、Hot Reload対応
- **ベストプラクティス**: Three.js公式のコーディングスタイルに準拠

### 🔧 技術スタック
- **Three.js** `^0.178.0` - 3Dライブラリ
- **TypeScript** `^5.3.0` - 型安全なJavaScript
- **Vite** `^5.0.0` - 高速ビルドツール
- **ESLint** `^8.57.0` - コード品質管理

## 📚 学習の進め方（推奨順序）

### 📋 学習前の準備
1. **開発環境のセットアップ** - Node.js、エディタの準備
2. **基本知識の確認** - JavaScript、HTML/CSSの基礎

### 🎯 チュートリアル構成

#### 📖 00. TypeScript基礎知識（必須）
**ファイル:** `examples/00-typescript-basics.html`

**学習内容:**
- TypeScriptとは何か？なぜ使うのか？
- 基本的な型システム（number, string, boolean）
- インターフェースの定義と使用方法
- クラスの作成と型安全な設計
- ジェネリクスの基本概念

**所要時間:** 30-45分  
**対象者:** TypeScript初心者

---

#### 🔗 01.5. TypeScript × Three.js連携（推奨）
**ファイル:** `examples/01-5-typescript-threejs-bridge.html`

**学習内容:**
- Three.jsでTypeScriptを使う理由
- 必要なパッケージ（three、@types/three）の理解
- Three.jsオブジェクトの型を理解する
- 型安全なコード作成パターン
- 設定オブジェクトの型安全な設計

**所要時間:** 20-30分  
**対象者:** TypeScript基礎を理解した方

---

#### 🚀 01. 基本シーンの作成
**ファイル:** `examples/01-basic-scene-ts.html`

**学習内容:**
- Three.jsの基本要素（Scene、Camera、Renderer）
- TypeScriptでのクラス設計
- インターフェースを使った設定管理
- イベントハンドリングとリソース管理
- 型安全なメソッド設計

**所要時間:** 45-60分  
**対象者:** TypeScript × Three.js連携を理解した方

---

#### 🏭 02. 型安全なオブジェクト作成
**ファイル:** `examples/02-typed-geometries.html`

**学習内容:**
- Union Types（合併型）の活用
- Factory Pattern（ファクトリーパターン）
- Type Guards（型ガード）
- Generic Constraints（ジェネリック制約）
- Conditional Types（条件付き型）

**所要時間:** 60-90分  
**対象者:** 基本シーンを完了した方

---

#### 🏗️ 03. 高度な設計パターン
**ファイル:** `examples/03-class-based-scene.html`

**学習内容:**
- 抽象クラスと継承
- Mixins（ミックスイン）パターン
- Decorator Pattern（デコレータパターン）
- Builder Pattern（ビルダーパターン）
- パフォーマンスモニタリング

**所要時間:** 90-120分  
**対象者:** 中級者〜上級者

---

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
├── examples/                   # 📚 チュートリアルファイル
│   ├── 00-typescript-basics.html          # TypeScript基礎
│   ├── 01-5-typescript-threejs-bridge.html # TS×Three.js連携
│   ├── 01-basic-scene-ts.html             # 基本シーン
│   ├── 02-typed-geometries.html           # 型安全ファクトリー
│   └── 03-class-based-scene.html          # 高度な設計パターン
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

**examples/** - 学習用HTMLファイル
- **00-typescript-basics.html**: TypeScript基礎知識の学習
- **01-5-typescript-threejs-bridge.html**: Three.js×TypeScript連携の理解
- **01-basic-scene-ts.html**: 基本的な3Dシーンの作成
- **02-typed-geometries.html**: 型安全なオブジェクト作成システム
- **03-class-based-scene.html**: 高度な設計パターンの実装

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
A: 個人差がありますが、以下が目安です：
- TypeScript初心者: 全体で10-15時間
- JavaScript経験者: 5-8時間
- TypeScript経験者: 3-5時間

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