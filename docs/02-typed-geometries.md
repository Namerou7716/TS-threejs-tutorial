# 02. 型安全な3Dオブジェクト作成ファクトリー

## 📖 この章で学ぶこと

TypeScriptの高度な型機能（ジェネリクス、条件付き型など）をフル活用して、**非常に型安全で、再利用可能な3Dオブジェクト作成システム（ファクトリー）**を構築します。少し発展的な内容ですが、これにより大規模で複雑なシーンでも、安全かつ効率的にオブジェクトを管理できるようになります。

**学習するTypeScriptの高度な機能:**
- **Union Types（合併型）:** 許可する型の種類を限定します。
- **Factory Pattern（ファクトリーパターン）:** オブジェクト作成のロジックを専門のクラスに集約します。
- **Generic Constraints（ジェネリクス制約）:** ジェネリクスに「特定の条件を満たす型」という制約を付けます。
- **Conditional Types（条件付き型）:** 型の定義にif文のような条件分岐を持ち込みます。

**想定所要時間:** 60-90分  
**対象者:** [基本シーンの作成](./01-basic-scene.md)を完了し、TypeScriptのクラスやインターフェースに慣れている方

---

## 🎯 設計目標：なぜ「ファクトリー」が必要なのか？

Three.jsでオブジェクトを一つ一つ作るのは、シンプルですが、数が増えると大変です。

**従来の方法の問題点:**
```typescript
// 毎回、GeometryとMaterialを個別にnewする必要がある
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const basicMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const boxMesh = new THREE.Mesh(boxGeometry, basicMaterial);

const sphereGeometry = new THREE.SphereGeometry(1, 32, 16);
const lambertMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const sphereMesh = new THREE.Mesh(sphereGeometry, lambertMaterial);

// ・コードが冗長になりやすい
// ・設定ミス（引数の順番など）が起きやすい
// ・一貫性のないオブジェクトが作られてしまう可能性がある
```

**この章でのゴール:**
この問題を解決するため、以下のような「設定オブジェクト」を渡すだけで、型安全に3Dオブジェクトを生成してくれる**「ファクトリー（工場）」**クラスを構築します。

```typescript
// 目指す未来のコード
const redBox = TypedObjectFactory.createMesh({
  geometry: { type: 'box', config: { width: 2 } },
  material: { type: 'basic', config: { color: 0xff0000 } }
});
```

---

## 🏗️ 型定義の設計：ファクトリーの「仕様書」を作る

まず、ファクトリーが受け入れることができるジオメトリ（形状）とマテリアル（材質）の種類を、`Union Types`を使って厳密に定義します。

### Step 1: サポートする種類をUnion Typesで定義する

```typescript
// types/geometry-types.ts (新しいファイル)

/**
 * このファクトリーが作成をサポートするジオメトリの種類
 * これ以外の文字列を指定すると、コンパイルエラーになる
 */
export type GeometryType = 
  | 'box'
  | 'sphere'
  | 'cone'
  | 'cylinder'
  | 'torus'
  | 'plane';

/**
 * このファクトリーが作成をサポートするマテリアルの種類
 */
export type MaterialType = 
  | 'basic'     // 最もシンプルなマテリアル
  | 'lambert'   // 光の当たり方を考慮するが、反射はしない
  | 'phong'     // 光沢のある反射（ハイライト）を表現できる
  | 'standard'; // PBR（物理ベース）の最もリアルなマテリアル
```
**💡 ここでの学び:** `Union Types`を使うことで、プログラムが扱うデータの種類を限定できます。これにより、タイプミスや未対応の種類の指定を防ぎ、コードの安全性を高めます。

### Step 2: 各種類の「設定」の型を`interface`で定義する

次に、それぞれのジオメトリやマテリアルが持つ固有の設定項目を`interface`で定義します。

```typescript
// types/geometry-types.ts (続き)
import * as THREE from 'three';

// --- ジオメトリ設定インターフェース ---
export interface BoxGeometryConfig { width?: number; height?: number; depth?: number; }
export interface SphereGeometryConfig { radius?: number; widthSegments?: number; heightSegments?: number; }
// ... Cone, Cylinder, Torus, Planeも同様に定義 ...

// --- マテリアル設定インターフェース ---
export interface BasicMaterialConfig { color?: number; wireframe?: boolean; }
export interface LambertMaterialConfig { color?: number; emissive?: number; }
// ... Phong, Standardも同様に定義 ...

/**
 * 全てのジオメトリ設定を統合する型
 * `type`プロパティによって、どの`config`を持つべきかが決まる（Discriminated Union）
 */
export type GeometryConfig = 
  | { type: 'box'; config?: BoxGeometryConfig }
  | { type: 'sphere'; config?: SphereGeometryConfig }
  | { type: 'cone'; config?: ConeGeometryConfig }
  // ... 他のジオメトリも同様 ...

/**
 * 全てのマテリアル設定を統合する型
 */
export type MaterialConfig = 
  | { type: 'basic'; config?: BasicMaterialConfig }
  | { type: 'lambert'; config?: LambertMaterialConfig }
  // ... 他のマテリアルも同様 ...
```
**💡 ここでの学び:** `Discriminated Union`（識別可能な合併型）は、`type`のような共通のプロパティを使って、どの型であるかを判別できるようにする強力なパターンです。TypeScriptはこれを賢く解釈し、`if (config.type === 'box')` のようなコードブロック内では、`config`が`BoxGeometryConfig`を持つことを自動的に理解してくれます。

---

## 🏭 ファクトリークラスの実装

設計した型定義を元に、実際にオブジェクトを作成するファクトリークラスを実装します。

### Step 3: `TypedGeometryFactory` - ジオメトリ部品を作る工場

まずは、ジオメトリやマテリアルといった「部品」を作成する専門のファクトリーを作ります。

**src/typed-geometry-factory.ts**
```typescript
// src/typed-geometry-factory.ts
import * as THREE from 'three';
import { GeometryType, GeometryConfig, MaterialType, MaterialConfig } from '../types/geometry-types';

// TypeScriptの高度な型。少し難しいですが、「型レベルの三項演算子」のようなものです。
// `T`が'box'なら`THREE.BoxGeometry`、'sphere'なら`THREE.SphereGeometry`...という型を返す。
type GeometryInstance<T extends GeometryType> = 
  T extends 'box' ? THREE.BoxGeometry :
  T extends 'sphere' ? THREE.SphereGeometry :
  // ... 他のジオメトリも続く ...
  THREE.BufferGeometry; // どれにも当てはまらない場合のデフォルト

// マテリアル版も同様
type MaterialInstance<T extends MaterialType> = 
  T extends 'basic' ? THREE.MeshBasicMaterial :
  T extends 'lambert' ? THREE.MeshLambertMaterial :
  // ... 他のマテリアルも続く ...
  THREE.Material;

/**
 * 型安全なジオメトリ・マテリアル作成ファクトリー
 */
export class TypedGeometryFactory {
  
  /**
   * 型安全なジオメトリを作成する静的メソッド
   * `<T extends GeometryType>` はジェネリクス制約で、TがGeometryTypeのいずれかであることを保証する
   */
  static createGeometry<T extends GeometryType>(
    type: T,
    // `Extract`はUnion型から特定の型だけを抜き出すユーティリティ型
    config: Extract<GeometryConfig, { type: T }>['config']
  ): GeometryInstance<T> {
    switch (type) {
      case 'box': {
        const cfg = config as BoxGeometryConfig || {};
        return new THREE.BoxGeometry(cfg.width ?? 1, cfg.height ?? 1, cfg.depth ?? 1) as GeometryInstance<T>;
      }
      case 'sphere': {
        const cfg = config as SphereGeometryConfig || {};
        return new THREE.SphereGeometry(cfg.radius ?? 1, cfg.widthSegments ?? 32, cfg.heightSegments ?? 16) as GeometryInstance<T>;
      }
      // ... 他のジオメトリのcaseも続く ...
      default: {
        // 網羅性チェック：もし新しいGeometryTypeを追加して、ここのcase文で処理を書き忘れるとコンパイルエラーになる
        const _exhaustiveCheck: never = type;
        throw new Error(`Unsupported geometry type: ${_exhaustiveCheck}`);
      }
    }
  }

  /**
   * 型安全なマテリアルを作成する静的メソッド
   */
  static createMaterial<T extends MaterialType>(
    type: T,
    config: Extract<MaterialConfig, { type: T }>['config']
  ): MaterialInstance<T> {
    // ... createGeometryと同様の実装 ...
  }
}
```
**💡 ここでの学び:**
- **Conditional Types (`extends ? :`)**: 型定義の中で条件分岐を行うための機能です。`createGeometry('box', ...)`と呼んだ時に、戻り値の型が自動的に`THREE.BoxGeometry`であるとTypeScriptが推論してくれるようになります。
- **ジェネリクス (`<T>`)**: このメソッドが様々な`type`に対応できる、再利用可能な部品であることを示します。

### Step 4: `TypedObjectFactory` - 部品を組み立てて製品を作る工場

次に、`TypedGeometryFactory`が作った部品（ジオメトリとマテリアル）を組み立てて、最終製品である`THREE.Mesh`を作成するファクトリーを作ります。

**src/typed-object-factory.ts**
```typescript
// src/typed-object-factory.ts
import * as THREE from 'three';
import { TypedGeometryFactory } from './typed-geometry-factory';
import { GeometryConfig, MaterialConfig } from '../types/geometry-types';

/**
 * 3Dオブジェクト（Mesh）の完全な設定インターフェース
 */
export interface ObjectConfig {
  geometry: GeometryConfig;
  material: MaterialConfig;
  transform?: { /* ... position, rotation, scale ... */ };
  name?: string;
}

/**
 * 型安全なオブジェクト（Mesh）作成ファクトリー
 */
export class TypedObjectFactory {
  
  /**
   * 設定オブジェクトに基づいて、単一のMeshを作成する
   */
  static createMesh(config: ObjectConfig): THREE.Mesh {
    // 1. 部品工場(TypedGeometryFactory)にジオメトリの作成を依頼
    const geometry = TypedGeometryFactory.createGeometry(
      config.geometry.type,
      config.geometry.config
    );
    
    // 2. 部品工場にマテリアルの作成を依頼
    const material = TypedGeometryFactory.createMaterial(
      config.material.type,
      config.material.config
    );
    
    // 3. 部品を組み立ててMeshを作成
    const mesh = new THREE.Mesh(geometry, material);
    
    // 4. その他の設定（名前や位置など）を適用
    if (config.name) mesh.name = config.name;
    // ... transformの適用 ...
    
    return mesh;
  }
  
  /**
   * 設定オブジェクトの配列から、複数のMeshを一括で作成する
   */
  static createMeshes(configs: ObjectConfig[]): THREE.Mesh[] {
    return configs.map(config => this.createMesh(config));
  }
}
```
**💡 ここでの学び:** ファクトリーを「部品工場」と「組立工場」に分けることで、それぞれの責任が明確になります。`TypedObjectFactory`を使う側は、複雑なジオメトリやマテリアルの作成方法を知らなくても、ただ設定オブジェクトを渡すだけで欲しい`Mesh`を手に入れることができます。

---

## 💡 使い方とメリット

作成したファクトリーシステムを使ってみましょう。コードがいかに簡潔で安全になるかを確認してください。

```typescript
// --- 使用例 ---

// 1. 単純な赤いボックスを作成
const redBox = TypedObjectFactory.createMesh({
  geometry: { type: 'box', config: { width: 2 } },
  material: { type: 'basic', config: { color: 0xff0000 } },
  name: 'RedBox'
});

// 2. 複雑な設定を持つ光沢のある球体を作成
const shinySphere = TypedObjectFactory.createMesh({
  geometry: { type: 'sphere', config: { radius: 1.5, widthSegments: 64 } },
  material: { type: 'phong', config: { color: 0x00ff00, shininess: 100 } },
  transform: { position: { x: 2 } }
});

// 3. 複数のオブジェクトを一括作成
const objects = TypedObjectFactory.createMeshes([
  { geometry: { type: 'cone' }, material: { type: 'lambert', config: { color: 0x0000ff } } },
  { geometry: { type: 'torus' }, material: { type: 'standard', config: { color: 0xffff00 } } }
]);

// --- 型安全性のメリット ---

// エラー例1: サポートされていないジオメトリタイプ
// const invalidObject = TypedObjectFactory.createMesh({
//   geometry: { type: 'pyramid', ... } // 'pyramid'はGeometryTypeにないのでコンパイルエラー
// });

// エラー例2: `type`と`config`の不一致
// const mismatchedConfig = TypedObjectFactory.createMesh({
//   geometry: { type: 'box', config: { radius: 1 } }, // Boxにradiusプロパティはないのでコンパイルエラー
//   ...
// });
```

## 🎓 まとめ: 高度な型システムによる恩恵

この章では、TypeScriptの少し難しいけれど強力な型機能を使って、非常に堅牢なオブジェクト作成システムを構築しました。

- **再利用性の向上:** オブジェクトの作成ロジックが一元化され、どこからでも同じ品質のオブジェクトを簡単に作れるようになりました。
- **可読性の向上:** `new THREE.BoxGeometry(...)`のような具体的な実装がファクトリー内部に隠蔽され、利用側は「どんなオブジェクトが欲しいか」という宣言的な設定を書くだけで済むようになりました。
- **究極の型安全性:** ジェネリクスと条件付き型を組み合わせることで、設定のタイプミスや矛盾をコンパイル段階で完全に排除できるようになりました。

このようなファクトリーパターンは、特に大規模なプロジェクトや、複数人で開発する際に、コードの品質と一貫性を保つための強力な武器となります。

## 🚀 次のステップ

型安全なオブジェクト作成の基盤ができたので、次はこの基盤をさらに発展させ、よりオブジェクト指向的なアプローチでシーンを構築する方法を学びます。

**[03. クラスベースのシーン設計](./03-class-based-scene.md)** に進み、抽象クラスや継承といった概念をThree.jsの世界に応用していきましょう！
