# 01.5 TypeScript × Three.js連携

## 📖 学習目標

TypeScriptとThree.jsを組み合わせて使用する方法と、その利点を理解します。

**学習内容:**
- Three.jsでTypeScriptを使う理由
- 必要なパッケージ（three、@types/three）の理解
- Three.jsオブジェクトの型を理解する
- 型安全なコード作成パターン
- 設定オブジェクトの型安全な設計

**所要時間:** 20-30分  
**対象者:** TypeScript基礎を理解した方

## 🤝 なぜThree.jsにTypeScriptを使うのか？

### Three.jsの複雑性

Three.jsは非常に多機能なライブラリで、数百のクラス・メソッド・プロパティが存在します。

```javascript
// JavaScript: 何が使えるかわからない
const geometry = new THREE.BoxGeometry();
geometry.dispose(); // これは正しい？
geometry.remove();  // これは存在する？
geometry.scale();   // これはどう使う？
```

### TypeScriptによる解決

```typescript
// TypeScript: 自動補完とエラーチェック
const geometry = new THREE.BoxGeometry(1, 1, 1);

geometry.dispose();  // ✅ 正しいメソッド
geometry.remove();   // ❌ コンパイルエラー: removeメソッドは存在しない
geometry.scale(2, 2, 2); // ✅ 正しい使用方法
```

## 📦 必要なパッケージの理解

### 基本パッケージのインストール

```bash
# Three.js本体
npm install three

# TypeScript型定義ファイル
npm install --save-dev @types/three

# TypeScript本体（開発時）
npm install --save-dev typescript
```

### パッケージの役割

| パッケージ | 役割 | 必要性 |
|-----------|------|--------|
| `three` | Three.js本体のJavaScriptコード | 必須 |
| `@types/three` | Three.jsの型定義ファイル | TypeScript使用時必須 |
| `typescript` | TypeScriptコンパイラ | 開発時必須 |

## 🏗️ Three.jsオブジェクトの型システム

### 基本的なオブジェクトの型

```typescript
import * as THREE from 'three';

// 各オブジェクトには明確な型が定義されている
const scene: THREE.Scene = new THREE.Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();

// ジオメトリとマテリアルの型
const geometry: THREE.BoxGeometry = new THREE.BoxGeometry(1, 1, 1);
const material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// メッシュの型（ジェネリクスを使用）
const mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial> = 
    new THREE.Mesh(geometry, material);
```

### 型の利点：自動補完とエラー検出

```typescript
// 自動補完が効く
camera.position.set(0, 0, 5);  // position プロパティが自動で提案される
camera.lookAt(0, 0, 0);        // lookAt メソッドが自動で提案される

// 間違った使用方法はエラーになる
camera.position.set("x", "y", "z"); // ❌ エラー: string型は使用できない
camera.undefinedMethod();            // ❌ エラー: 存在しないメソッド
```

## 🛡️ 型安全な設定オブジェクトパターン

### 従来のJavaScript方式の問題

```javascript
// JavaScript: 設定ミスに気づけない
function createCamera(config) {
    return new THREE.PerspectiveCamera(
        config.fov,
        config.aspect,
        config.near,
        config.far
    );
}

// 呼び出し時にタイポや型の間違いがあっても気づけない
const camera = createCamera({
    fov: "75",           // 文字列（本来はnumber）
    aspact: 1.5,         // タイポ（aspectのつもり）
    near: 0.1,
    far: 1000
    // aspectが抜けているが気づけない
});
```

### TypeScriptによる型安全な設計

```typescript
// 設定オブジェクトのインターフェース定義
interface CameraConfig {
    fov: number;
    aspect: number;
    near: number;
    far: number;
    position?: THREE.Vector3; // 省略可能なプロパティ
}

// 型安全な関数
function createCamera(config: CameraConfig): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(
        config.fov,
        config.aspect,
        config.near,
        config.far
    );
    
    if (config.position) {
        camera.position.copy(config.position);
    }
    
    return camera;
}

// 型安全な呼び出し
const camera = createCamera({
    fov: 75,              // ✅ 数値
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
    position: new THREE.Vector3(0, 0, 5)
});

// エラーになる例
const badCamera = createCamera({
    fov: "75",           // ❌ エラー: string型は使用できない
    aspact: 1.5,         // ❌ エラー: 'aspact'は存在しない（aspectのタイポ）
    near: 0.1
    // ❌ エラー: 必須プロパティ'far'が不足
});
```

## 🎭 複雑なオブジェクトの型安全な作成

### マテリアル設定の型安全化

```typescript
// マテリアルの種類を型で定義
type MaterialType = 'basic' | 'lambert' | 'phong' | 'standard';

// 各マテリアルの設定インターフェース
interface BasicMaterialConfig {
    type: 'basic';
    color?: THREE.ColorRepresentation;
    transparent?: boolean;
    opacity?: number;
}

interface LambertMaterialConfig {
    type: 'lambert';
    color?: THREE.ColorRepresentation;
    emissive?: THREE.ColorRepresentation;
    transparent?: boolean;
    opacity?: number;
}

// Union Typesで統合
type MaterialConfig = BasicMaterialConfig | LambertMaterialConfig;

// 型安全なマテリアル作成関数
function createMaterial(config: MaterialConfig): THREE.Material {
    switch (config.type) {
        case 'basic':
            return new THREE.MeshBasicMaterial({
                color: config.color ?? 0xffffff,
                transparent: config.transparent ?? false,
                opacity: config.opacity ?? 1
            });
            
        case 'lambert':
            return new THREE.MeshLambertMaterial({
                color: config.color ?? 0xffffff,
                emissive: config.emissive ?? 0x000000,
                transparent: config.transparent ?? false,
                opacity: config.opacity ?? 1
            });
            
        default:
            // TypeScriptの網羅性チェック
            const _exhaustive: never = config;
            throw new Error(`Unsupported material type: ${JSON.stringify(_exhaustive)}`);
    }
}

// 使用例
const basicMaterial = createMaterial({
    type: 'basic',
    color: 0xff0000,
    transparent: true,
    opacity: 0.8
});

const lambertMaterial = createMaterial({
    type: 'lambert',
    color: 0x00ff00,
    emissive: 0x111111
});
```

## 🔄 エラーハンドリングとデバッグ

### Three.jsオブジェクトの型ガード

```typescript
// オブジェクトの型を安全にチェック
function isMesh(object: THREE.Object3D): object is THREE.Mesh {
    return object instanceof THREE.Mesh;
}

function isCamera(object: THREE.Object3D): object is THREE.Camera {
    return object instanceof THREE.Camera;
}

// 安全な型変換
function processSceneObjects(scene: THREE.Scene): void {
    scene.traverse((object) => {
        if (isMesh(object)) {
            // この時点でobjectはTHREE.Mesh型として扱われる
            console.log(`Mesh found: ${object.geometry.type}`);
            object.material.dispose(); // 型安全にアクセス可能
        } else if (isCamera(object)) {
            // この時点でobjectはTHREE.Camera型として扱われる
            console.log(`Camera found: ${object.type}`);
        }
    });
}
```

### リソース管理の型安全性

```typescript
// 破棄可能なリソースのインターフェース
interface Disposable {
    dispose(): void;
}

// 型ガード関数
function isDisposable(obj: any): obj is Disposable {
    return obj && typeof obj.dispose === 'function';
}

// 安全なリソース破棄
function cleanupResources(objects: THREE.Object3D[]): void {
    objects.forEach(obj => {
        if (isMesh(obj)) {
            // ジオメトリの破棄
            if (isDisposable(obj.geometry)) {
                obj.geometry.dispose();
            }
            
            // マテリアルの破棄
            if (Array.isArray(obj.material)) {
                obj.material.forEach(material => {
                    if (isDisposable(material)) {
                        material.dispose();
                    }
                });
            } else if (isDisposable(obj.material)) {
                obj.material.dispose();
            }
        }
    });
}
```

## 📈 パフォーマンスと開発効率

### コンパイル時最適化

```typescript
// TypeScriptの設定例（tsconfig.json）
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,           // 厳密な型チェック
    "noImplicitAny": true,    // any型の暗黙的使用を禁止
    "strictNullChecks": true, // null/undefinedの厳密チェック
    "noUnusedLocals": true,   // 未使用変数の検出
    "noUnusedParameters": true // 未使用パラメータの検出
  }
}
```

### デバッグ時の型情報活用

```typescript
// 開発時のデバッグヘルパー
function debugObject(obj: THREE.Object3D): void {
    console.group(`Object Debug: ${obj.constructor.name}`);
    console.log('Type:', obj.type);
    console.log('Position:', obj.position);
    console.log('Rotation:', obj.rotation);
    console.log('Scale:', obj.scale);
    
    if (isMesh(obj)) {
        console.log('Geometry:', obj.geometry.type);
        console.log('Material:', obj.material.type);
        console.log('Vertices:', obj.geometry.attributes.position.count);
    }
    
    console.groupEnd();
}

// 使用例
const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);

debugObject(mesh); // 型安全なデバッグ情報を出力
```

## 🎓 次のステップ

TypeScriptとThree.jsの連携を理解したら、実際のシーン作成に移りましょう。

**次の学習項目:**
- [01. 基本シーンの作成](./01-basic-scene.md)
- 型安全なシーン管理クラスの実装
- インターフェースを使った設定管理
- リソース管理とクリーンアップ

## 🔍 重要なポイント

1. **型定義の活用**: `@types/three`で得られる型情報を最大限活用
2. **設定オブジェクト**: インターフェースで型安全な設定を実現
3. **型ガード**: 実行時の型安全性を確保
4. **エラー検出**: コンパイル時にエラーを発見してバグを防ぐ
5. **開発効率**: 自動補完とリファクタリング支援で開発速度向上

TypeScriptを使うことで、Three.jsの複雑なAPIを安全かつ効率的に使用できるようになります。