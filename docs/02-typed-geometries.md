# 02. 型安全な3Dオブジェクト作成ファクトリー

## 📖 この章のゴール

この章では、TypeScriptの高度な型機能（ジェネリクス、条件付き型など）をフル活用して、**非常に型安全で、再利用可能な3Dオブジェクト作成システム（ファクトリー）**を構築します。これは少し発展的な内容ですが、Three.jsアプリケーションが大規模になった際に、オブジェクトの管理を安全かつ効率的に行うための強力な武器となります。

具体的には、以下のTypeScriptの高度な機能を実践的に学びます。

-   **Union Types（合併型）:** 許可する型の種類を限定し、厳密なデータ構造を定義します。
-   **Factory Pattern（ファクトリーパターン）:** オブジェクト作成のロジックを専門のクラスに集約し、コードの整理と再利用性を高めます。
-   **Generic Constraints（ジェネリクス制約）:** ジェネリクスに「特定の条件を満たす型」という制約を付け、柔軟性と安全性を両立させます。
-   **Conditional Types（条件付き型）:** 型の定義にif文のような条件分岐を持ち込み、より動的な型推論を実現します。

---

## 🎯 設計目標：なぜ「ファクトリー」が必要なのか？

Three.jsで3Dオブジェクトを作成する際、通常は`new THREE.Geometry(...)`と`new THREE.Material(...)`を組み合わせて`new THREE.Mesh(...)`を作成します。しかし、様々な種類のオブジェクトを大量に作成する場合、この方法はコードが冗長になり、設定ミスも起こりやすくなります。

**従来の方法の課題:**

```typescript
// 毎回、GeometryとMaterialを個別にnewする必要があり、コードが冗長になりがちです。
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const basicMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const boxMesh = new THREE.Mesh(boxGeometry, basicMaterial);

const sphereGeometry = new THREE.SphereGeometry(1, 32, 16);
const lambertMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const sphereMesh = new THREE.Mesh(sphereGeometry, lambertMaterial);

// 課題点:
// ・コードが冗長になりやすい。
// ・設定ミス（引数の順番や型など）が起きやすい。
// ・一貫性のないオブジェクトが作られてしまう可能性がある。
```

**この章でのゴール:**

これらの課題を解決するため、私たちは「ファクトリー（工場）」という概念を導入します。以下のように、シンプルな「設定オブジェクト」を渡すだけで、型安全に3Dオブジェクトを生成してくれるシステムを構築することを目指します。

```typescript
// 目指す未来のコード：設定オブジェクトを渡すだけで、必要なオブジェクトが生成されます。
const redBox = TypedObjectFactory.createMesh({
  geometry: { type: 'box', config: { width: 2 } },
  material: { type: 'basic', config: { color: 0xff0000 } }
});
```

---

### 用語集：この章で登場する主なThree.js API

この章では、様々なジオメトリ（形状）とマテリアル（材質）が登場します。それぞれの特徴を理解することで、より表現豊かな3Dシーンを作成できるようになります。

-   **`THREE.MeshPhongMaterial`**: 光沢のある反射（スペキュラーハイライト）を表現できる、古典的なマテリアルです。プラスチックや金属のような光沢感を出すのに適しています。
    -   `specular`: ハイライトの色を設定します。通常は光源の色に近い色を指定します。
    -   `shininess`: ハイライトの鋭さ（光沢の強さ）を数値で設定します。値が大きいほどハイライトが小さく鋭くなり、光沢が強く見えます。
-   **`THREE.MeshStandardMaterial`**: PBR（物理ベースレンダリング）に基づいた、現在主流のリアルなマテリアルです。より直感的なパラメータで、現実世界に近い質感を制御できます。
    -   `roughness`: 表面の粗さ（ざらつき）を設定します。`0.0`で鏡面（完全に滑らか）、`1.0`で完全にマット（光を拡散）になります。
    -   `metalness`: 金属っぽさを設定します。`0.0`で非金属（誘電体）、`1.0`で金属になります。
-   **`THREE.TorusGeometry`**: ドーナツ型の「形状」を定義します。ドーナツの半径やチューブの太さなどを設定できます。
-   **`THREE.ConeGeometry`**: 円錐の「形状」を定義します。底面の半径、高さ、分割数などを設定できます。
-   **`THREE.CylinderGeometry`**: 円柱の「形状」を定義します。上下の半径、高さ、分割数などを設定できます。
-   **`THREE.PlaneGeometry`**: 平面の「形状」を定義します。地面や壁など、平らな面を作成する際によく使われます。
-   **`object.name`**: Three.jsのオブジェクトに任意の名前を付けるためのプロパティです。`scene.getObjectByName()`メソッドを使って、後からシーン内のオブジェクトを名前で検索するのに便利です。
-   **`object.userData`**: 開発者が任意のデータを格納できるオブジェクトです。Three.jsの標準プロパティにはない、アプリケーション固有の情報（例: オブジェクトがクリック可能かどうかを示すフラグなど）を持たせるのに使います。

---

## 🏗️ 型定義の設計：ファクトリーの「仕様書」を作る

ファクトリーが受け入れることができるジオメトリ（形状）とマテリアル（材質）の種類、そしてそれぞれの設定項目を、TypeScriptの高度な型機能を使って厳密に定義します。これが、ファクトリーが正しく機能するための「仕様書」となります。

### Step 1: サポートする種類をUnion Typesで定義する

まず、このファクトリーが作成をサポートするジオメトリとマテリアルの種類を`Union Types`（合併型）を使って定義します。これにより、ファクトリーが受け入れることができる値が明確になり、それ以外の文字列を指定するとコンパイルエラーになるため、安全性が向上します。

`src/types/geometry-types.ts`というファイルを作成し、以下のコードを記述してください。

```typescript
// src/types/geometry-types.ts - ファクトリーの型定義ファイル
import * as THREE from 'three';

/**
 * このファクトリーが作成をサポートするジオメトリの種類を定義します。
 * これ以外の文字列を指定すると、コンパイルエラーになります。
 */
export type GeometryType = 
  | 'box'
  | 'sphere'
  | 'cone'
  | 'cylinder'
  | 'torus'
  | 'plane';

/**
 * このファクトリーが作成をサポートするマテリアルの種類を定義します。
 */
export type MaterialType = 
  | 'basic'     // 最もシンプルなマテリアル（光の影響を受けない）
  | 'lambert'   // 光の当たり方を考慮するが、反射はしないマットなマテリアル
  | 'phong'     // 光沢のある反射（ハイライト）を表現できるマテリアル
  | 'standard'; // PBR（物理ベース）の最もリアルなマテリアル
```

**ここでの学び:** `Union Types`を使うことで、プログラムが扱うデータの種類を限定できます。これにより、タイプミスや未対応の種類の指定を防ぎ、コードの安全性を高めます。例えば、`GeometryType`に`'pyramid'`と指定しようとすると、TypeScriptがエラーを教えてくれます。

### Step 2: 各種類の「設定」の型を`interface`で定義する

次に、それぞれのジオメトリやマテリアルが持つ固有の設定項目を`interface`で定義します。これにより、各タイプに必要なプロパティが明確になります。

```typescript
// src/types/geometry-types.ts (続き)
import * as THREE from 'three';

// --- ジオメトリ設定インターフェース ---
// 各ジオメトリタイプに対応する設定プロパティを定義します。
export interface BoxGeometryConfig { width?: number; height?: number; depth?: number; }
export interface SphereGeometryConfig { radius?: number; widthSegments?: number; heightSegments?: number; }
export interface ConeGeometryConfig { radius?: number; height?: number; radialSegments?: number; }
export interface CylinderGeometryConfig { radiusTop?: number; radiusBottom?: number; height?: number; radialSegments?: number; }
export interface TorusGeometryConfig { radius?: number; tube?: number; radialSegments?: number; tubularSegments?: number; }
export interface PlaneGeometryConfig { width?: number; height?: number; }

// --- マテリアル設定インターフェース ---
// 各マテリアルタイプに対応する設定プロパティを定義します。
export interface BasicMaterialConfig { color?: number; wireframe?: boolean; }
export interface LambertMaterialConfig { color?: number; emissive?: number; }
export interface PhongMaterialConfig { color?: number; specular?: number; shininess?: number; }
export interface StandardMaterialConfig { color?: number; roughness?: number; metalness?: number; }

/**
 * 全てのジオメトリ設定を統合する型（Discriminated Union）
 * `type`プロパティによって、どの`config`を持つべきかが決まるようにします。
 * これにより、TypeScriptが設定オブジェクトの型を賢く推論できるようになります。
 */
export type GeometryConfig = 
  | { type: 'box'; config?: BoxGeometryConfig }
  | { type: 'sphere'; config?: SphereGeometryConfig }
  | { type: 'cone'; config?: ConeGeometryConfig }
  | { type: 'cylinder'; config?: CylinderGeometryConfig }
  | { type: 'torus'; config?: TorusGeometryConfig }
  | { type: 'plane'; config?: PlaneGeometryConfig };

/**
 * 全てのマテリアル設定を統合する型（Discriminated Union）
 */
export type MaterialConfig = 
  | { type: 'basic'; config?: BasicMaterialConfig }
  | { type: 'lambert'; config?: LambertMaterialConfig }
  | { type: 'phong'; config?: PhongMaterialConfig }
  | { type: 'standard'; config?: StandardMaterialConfig };

// (GeometryInstance and MaterialInstance types - 後述のファクトリークラスで詳細を説明)
```

**ここでの学び:** `Discriminated Union`（識別可能な合併型）は、`type`のような共通のプロパティを使って、どの型であるかを判別できるようにする強力なパターンです。TypeScriptはこれを賢く解釈し、例えば`if (config.type === 'box')`のようなコードブロック内では、`config`が`BoxGeometryConfig`のプロパティを持つことを自動的に理解してくれます。これにより、非常に柔軟かつ厳密な型チェックが可能になります。

---

## 🏭 ファクトリークラスの実装

設計した型定義を元に、実際にオブジェクトを作成するファクトリークラスを実装します。ここでは、役割を明確にするために2つのファクトリークラスを作成します。

### Step 3: `TypedGeometryFactory` - ジオメトリ部品を作る工場

まず、ジオメトリやマテリアルといった「部品」を作成する専門のファクトリークラス`TypedGeometryFactory`を作成します。このクラスは、Three.jsの`new THREE.BoxGeometry(...)`のような具体的なAPI呼び出しを内部に隠蔽し、より抽象的なインターフェースを提供します。

`src/typed-geometry-factory.ts`というファイルを作成し、以下のコードを記述してください。

```typescript
// src/typed-geometry-factory.ts - ジオメトリとマテリアルの部品工場
import * as THREE from 'three';
import type {
  GeometryType,
  MaterialType,
  GeometryConfig,
  MaterialConfig,
  GeometryInstance,
  MaterialInstance // これらの型は`../types/geometry-types`で定義されています
} from '../types/geometry-types';

/**
 * 型安全なジオメトリとマテリアルの「部品工場」。
 * 静的メソッド（`new`せずに直接呼び出せるメソッド）として機能を提供します。
 */
export class TypedGeometryFactory {
  
  /**
   * 型安全なジオメトリ（形状）を作成します。
   * `T extends GeometryType`はジェネリクス制約で、`T`が`GeometryType`のいずれかであることを保証します。
   * `GeometryInstance<T>`は、`T`の型に応じて戻り値のThree.jsジオメトリの型を決定する「条件付き型」です。
   * 
   * @param type 作成したいジオメトリの種類 (例: 'box', 'sphere')
   * @param config そのジオメトリに固有の設定 (例: { width: 2 })
   * @returns 指定された型に対応するThree.jsのジオメトリインスタンス
   */
  static createGeometry<T extends GeometryType>(
    type: T,
    config: Extract<GeometryConfig, { type: T }>['config'] = {}
  ): GeometryInstance<T> {
    // `type`の値に応じて、どのジオメトリを作成するかを分岐します。
    switch (type) {
      case 'box': {
        const cfg = config as any; // 型推論を補助するための型アサーション
        // `new THREE.BoxGeometry(width, height, depth)`: 幅、高さ、奥行きを指定して立方体の形状を作成します。
        // `?? 1`はNull合体演算子で、`cfg.width`が`null`または`undefined`の場合に`1`を使用します。
        return new THREE.BoxGeometry(
          cfg.width ?? 1,
          cfg.height ?? 1,
          cfg.depth ?? 1
        ) as GeometryInstance<T>; // 戻り値の型を正しく推論させるための型アサーション
      }
      
      case 'sphere': {
        const cfg = config as any;
        // `new THREE.SphereGeometry(radius, widthSegments, heightSegments)`: 球体の形状を作成します。
        // `widthSegments`と`heightSegments`はポリゴンの分割数で、大きいほど滑らかな球になりますが、描画負荷も高くなります。
        return new THREE.SphereGeometry(
          cfg.radius ?? 1,
          cfg.widthSegments ?? 32,
          cfg.heightSegments ?? 16
        ) as GeometryInstance<T>;
      }
      
      case 'cone': {
        const cfg = config as any;
        // `new THREE.ConeGeometry(radius, height, radialSegments)`: 円錐の形状を作成します。
        return new THREE.ConeGeometry(
          cfg.radius ?? 1,
          cfg.height ?? 1,
          cfg.radialSegments ?? 8
        ) as GeometryInstance<T>;
      }

      case 'cylinder': {
        const cfg = config as any;
        // `new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)`: 円柱の形状を作成します。
        return new THREE.CylinderGeometry(
          cfg.radiusTop ?? 1,
          cfg.radiusBottom ?? 1,
          cfg.height ?? 1,
          cfg.radialSegments ?? 8
        ) as GeometryInstance<T>;
      }

      case 'torus': {
        const cfg = config as any;
        // `new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments)`: ドーナツ型の形状を作成します。
        return new THREE.TorusGeometry(
          cfg.radius ?? 1,
          cfg.tube ?? 0.4,
          cfg.radialSegments ?? 8,
          cfg.tubularSegments ?? 6
        ) as GeometryInstance<T>;
      }

      case 'plane': {
        const cfg = config as any;
        // `new THREE.PlaneGeometry(width, height)`: 平面の形状を作成します。
        return new THREE.PlaneGeometry(
          cfg.width ?? 1,
          cfg.height ?? 1
        ) as GeometryInstance<T>;
      }
      
      default:
        // 網羅性チェック: もし`GeometryType`に新しい型を追加した場合、
        // この`default`節がコンパイルエラーになります。これにより、`case`文に新しい型の処理を
        // 書き忘れるのを防げます。`_exhaustiveCheck`は`never`型になるはずです。
        const _exhaustiveCheck: never = type;
        throw new Error(`Unsupported geometry type: ${String(_exhaustiveCheck)}`);
    }
  }

  /**
   * 型安全なマテリアル（材質）を作成します。
   * `MaterialInstance<T>`は、`T`の型に応じて戻り値のThree.jsマテリアルの型を決定する「条件付き型」です。
   * 
   * @param type 作成したいマテリアルの種類 (例: 'basic', 'lambert')
   * @param config そのマテリアルに固有の設定 (例: { color: 0xff0000 })
   * @returns 指定された型に対応するThree.jsのマテリアルインスタンス
   */
  static createMaterial<T extends MaterialType>(
    type: T,
    config: Extract<MaterialConfig, { type: T }>['config'] = {}
  ): MaterialInstance<T> {
    const cfg = config as any; // 型推論を補助
    
    switch (type) {
      case 'basic': {
        // `new THREE.MeshBasicMaterial({ color: ... })`: 光源の影響を受けない、最もシンプルなマテリアル。
        // デバッグ用途や、常に一定の色で表示したい場合に便利です。
        return new THREE.MeshBasicMaterial({
          color: cfg.color ?? 0xffffff,
          wireframe: cfg.wireframe ?? false // ワイヤーフレーム表示にするか
        }) as MaterialInstance<T>;
      }
      
      case 'lambert': {
        // `new THREE.MeshLambertMaterial({ color: ..., emissive: ... })`:
        // 光を拡散的に反射する、光沢のないマットなマテリアルです。影や光の方向を表現できます。
        // `emissive`: 自己発光色。ライトが当たっていなくても、その色で光っているように見えます。
        return new THREE.MeshLambertMaterial({
          color: cfg.color ?? 0xffffff,
          emissive: cfg.emissive ?? 0x000000
        }) as MaterialInstance<T>;
      }
      
      case 'phong': {
        // `new THREE.MeshPhongMaterial({ color: ..., specular: ..., shininess: ... })`:
        // 光沢のある反射（スペキュラーハイライト）を表現できるマテリアルです。プラスチックや金属のような光沢感を出すのに適しています。
        // `specular`: ハイライトの色を設定します。通常は光源の色に近い色を指定します。
        // `shininess`: ハイライトの鋭さ（光沢の強さ）を数値で設定します。値が大きいほどハイライトが小さく鋭くなり、光沢が強く見えます。
        return new THREE.MeshPhongMaterial({
          color: cfg.color ?? 0xffffff,
          specular: cfg.specular ?? 0x111111,
          shininess: cfg.shininess ?? 30,
        }) as MaterialInstance<T>;
      }
      
      case 'standard': {
        // `new THREE.MeshStandardMaterial({ color: ..., roughness: ..., metalness: ... })`:
        // PBR（物理ベースレンダリング）に基づいた、現在主流のリアルなマテリアルです。より直感的なパラメータで、現実世界に近い質感を制御できます。
        // `roughness`: 表面の粗さ（ざらつき）を設定します。`0.0`で鏡面（完全に滑らか）、`1.0`で完全にマット（光を拡散）になります。
        // `metalness`: 金属っぽさを設定します。`0.0`で非金属（誘電体）、`1.0`で金属になります。
        return new THREE.MeshStandardMaterial({
          color: cfg.color ?? 0xffffff,
          roughness: cfg.roughness ?? 0.5,
          metalness: cfg.metalness ?? 0.5,
        }) as MaterialInstance<T>;
      }
      
      default:
        const _exhaustiveCheck: never = type;
        throw new Error(`Unsupported material type: ${String(_exhaustiveCheck)}`);
    }
  }
}

// ===================================================================
// Part 2: The "Assembly" Factory (組立工場)
// 目的: 「部品工場」で作られた部品を組み立てて、最終製品（Mesh）を作成する。
// ===================================================================

/**
 * 型安全な3Dオブジェクト（Mesh）の「組立工場」。
 * `TypedGeometryFactory`を使ってジオメトリとマテリアルを作成し、それらを組み合わせて`THREE.Mesh`を生成します。
 */
export class TypedObjectFactory {
  
  /**
   * 設定オブジェクトに基づいて、単一の`THREE.Mesh`（最終製品）を作成します。
   * @param config ジオメトリ、マテリアル、その他の設定を含む完全なオブジェクト設定
   * @returns 作成された`THREE.Mesh`インスタンス
   */
  static createMesh(config: RequiredObjectConfig): THREE.Mesh {
    // 1. 部品工場(`TypedGeometryFactory`)にジオメトリの作成を依頼します。
    const geometry = TypedGeometryFactory.createGeometry(
      config.geometry.type,
      config.geometry.config
    );
    
    // 2. 部品工場にマテリアルの作成を依頼します。
    const material = TypedGeometryFactory.createMaterial(
      config.material.type,
      config.material.config
    );
    
    // 3. ジオメトリ（形状）とマテリアル（材質）を組み合わせて、最終的な3Dオブジェクトであるメッシュを作成します。
    const mesh = new THREE.Mesh(geometry, material);
    
    // 4. 名前の設定や位置・回転・スケールの調整など、追加の組み立て作業を行います。
    // `mesh.name`: オブジェクトに任意の名前を付けることができます。`scene.getObjectByName()`で後から検索するのに便利です。
    if (config.name) mesh.name = config.name;
    // `mesh.userData`: 開発者が任意のデータを格納できるオブジェクトです。Three.jsの標準プロパティにはない、
    // アプリケーション固有の情報（例: オブジェクトがクリック可能かどうかを示すフラグなど）を持たせるのに使います。
    if (config.userData) mesh.userData = { ...config.userData };
    // `transform`プロパティがあれば、位置、回転、スケールを適用します。
    if (config.transform) this.applyTransform(mesh, config.transform);
    
    return mesh;
  }
  
  /**
   * 設定オブジェクトの配列から、複数の`THREE.Mesh`を一括で作成します。
   * @param configs 複数のオブジェクト設定を含む配列
   * @returns 作成された`THREE.Mesh`インスタンスの配列
   */
  static createMeshes(configs: RequiredObjectConfig[]): THREE.Mesh[] {
    return configs.map(config => this.createMesh(config));
  }
  
  /**
   * オブジェクトの位置、回転、スケールを適用するプライベートヘルパーメソッド。
   * @param object 変換を適用する`THREE.Object3D`インスタンス
   * @param transform 変換設定オブジェクト
   */
  private static applyTransform(object: THREE.Object3D, transform: ObjectConfig['transform']): void {
    if (!transform) return;
    // `object.position.set(x, y, z)`: オブジェクトの3D空間における位置を一度に設定します。
    if (transform.position) object.position.set(transform.position.x ?? 0, transform.position.y ?? 0, transform.position.z ?? 0);
    // `object.rotation.set(x, y, z)`: オブジェクトの回転をラジアン単位で設定します。
    if (transform.rotation) object.rotation.set(transform.rotation.x ?? 0, transform.rotation.y ?? 0, transform.rotation.z ?? 0);
    // `object.scale.set(x, y, z)`: オブジェクトの拡大・縮小率をX, Y, Z軸それぞれに設定します。
    if (transform.scale) object.scale.set(transform.scale.x ?? 1, transform.scale.y ?? 1, transform.scale.z ?? 1);
  }
}

// ===================================================================
// Part 3: Helper Utilities (便利な道具箱)
// 目的: よく使う処理を、安全で便利な関数として提供する。
// ===================================================================

/**
 * 型安全なヘルパー関数を集めたオブジェクト。
 * `as const` を付けることで、プロパティが読み取り専用になり、より安全になります。
 */
export const TypedHelpers = {
  /**
   * 様々な形式の色の入力を、安全に`THREE.Color`オブジェクトに変換します。
   * @param color 色の入力 (例: 0xff0000, 'red', '#ff0000')
   * @returns `THREE.Color`インスタンス。無効な場合は白を返す。
   */
  validateColor(color: unknown): THREE.Color {
    try {
      return new THREE.Color(color as THREE.ColorRepresentation);
    } catch {
      console.warn('Invalid color provided, using default white');
      return new THREE.Color(0xffffff);
    }
  },
  
  /**
   * 数値以外の値（`NaN`, `Infinity`など）が入らない、安全な`THREE.Vector3`を作成します。
   */
  createVector3(x = 0, y = 0, z = 0): THREE.Vector3 {
    return new THREE.Vector3(
      Number.isFinite(x) ? x : 0,
      Number.isFinite(y) ? y : 0,
      Number.isFinite(z) ? z : 0
    );
  },
  
  /**
   * `THREE.Mesh`オブジェクトを、ジオメトリとマテリアルも含めて安全に複製（クローン）します。
   * @param mesh クローンする`THREE.Mesh`インスタンス
   * @returns 完全に複製された`THREE.Mesh`インスタンス
   */
  cloneMesh<T extends THREE.Mesh>(mesh: T): T {
    // `mesh.clone()`: オブジェクトのトランスフォーム（位置、回転、スケール）や名前などの基本情報をコピーします。
    // ただし、ジオメトリとマテリアルは参照がコピーされるだけ（シャローコピー）です。
    const cloned = mesh.clone() as T;
    // `geometry.clone()`: ジオメトリデータを完全に複製（ディープコピー）します。
    // これにより、元のジオメトリを変更してもクローンに影響しません。
    cloned.geometry = mesh.geometry.clone();
    // `material.clone()`: マテリアルデータを完全に複製します。
    // マテリアルが配列の場合（複数のマテリアルを持つ場合）も考慮して処理します。
    cloned.material = (Array.isArray(mesh.material)
      ? mesh.material.map(m => m.clone())
      : mesh.material.clone()) as T['material'];
    return cloned;
  }
} as const;
