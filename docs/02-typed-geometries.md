# 02. 型安全な3Dオブジェクト作成ファクトリー

## 📖 この章で学ぶこと

TypeScriptの高度な型機能（ジェネリクス、条件付き型など）をフル活用して、**非常に型安全で、再利用可能な3Dオブジェクト作成システム（ファクトリー）**を構築します。少し発展的な内容ですが、これにより大規模で複雑なシーンでも、安全かつ効率的にオブジェクトを管理できるようになります。

(中略)

---

### 用語集：この章で登場する主なThree.js API

- **`THREE.MeshPhongMaterial`**: 光沢のある反射（スペキュラーハイライト）を表現できる、古典的なマテリアルです。
    - `specular`: ハイライトの色を設定します。
    - `shininess`: ハイライトの鋭さ（光沢の強さ）を数値で設定します。
- **`THREE.MeshStandardMaterial`**: PBR（物理ベースレンダリング）に基づいた、現在主流のリアルなマテリアルです。より直感的なパラメータで質感を制御します。
    - `roughness`: 表面の粗さ（0.0で鏡面、1.0で完全にマット）。
    - `metalness`: 金属っぽさ（0.0で非金属、1.0で金属）。
- **`THREE.TorusGeometry`**: ドーナツ型の「形状」を定義します。
- **`object.name`**: オブジェクトに名前を付けるためのプロパティ。`scene.getObjectByName()`で後からオブジェクトを検索するのに便利です。
- **`object.userData`**: 開発者が任意のデータを格納できるオブジェクト。アプリケーション固有の情報（例: `{ interactive: true }`）を持たせるのに使います。

---

## 🏗️ 型定義の設計：ファクトリーの「仕様書」を作る

(中略)

### Step 2: 各種類の「設定」の型を`interface`で定義する

```typescript
// (imports)

// (Geometry Configs)

// --- マテリアル設定インターフェース ---
export interface BasicMaterialConfig { color?: number; wireframe?: boolean; }
export interface LambertMaterialConfig { color?: number; emissive?: number; } // emissive: 自己発光色
export interface PhongMaterialConfig { color?: number; specular?: number; shininess?: number; } // specular: 反射光の色, shininess: 光沢
export interface StandardMaterialConfig { color?: number; roughness?: number; metalness?: number; } // roughness: 粗さ, metalness: 金属っぽさ

// (Union Types for Configs)
```

(中略)

## 🏭 ファクトリークラスの実装

(中略)

### Step 3: `TypedGeometryFactory` - ジオメトリ部品を作る工場

**src/typed-geometry-factory.ts**
```typescript
// (imports and type definitions)

export class TypedGeometryFactory {
  
  // (createGeometry method)

  static createMaterial<T extends MaterialType>(
    type: T,
    config: Extract<MaterialConfig, { type: T }>['config']
  ): MaterialInstance<T> {
    switch (type) {
      // (case 'basic', 'lambert')

      case 'phong': {
        const cfg = config as PhongMaterialConfig || {};
        // new THREE.MeshPhongMaterial({ ... }): 光沢のあるマテリアルを作成。
        return new THREE.MeshPhongMaterial({
          color: cfg.color ?? 0xffffff,
          specular: cfg.specular ?? 0x111111, // ハイライトの色
          shininess: cfg.shininess ?? 30,     // 光沢の強さ
        }) as MaterialInstance<T>;
      }

      case 'standard': {
        const cfg = config as StandardMaterialConfig || {};
        // new THREE.MeshStandardMaterial({ ... }): 物理ベースのリアルなマテリアルを作成。
        return new THREE.MeshStandardMaterial({
          color: cfg.color ?? 0xffffff,
          roughness: cfg.roughness ?? 0.5,     // 表面の粗さ
          metalness: cfg.metalness ?? 0.5,     // 金属質
        }) as MaterialInstance<T>;
      }

      // (default case)
    }
  }
}
```

(中略)

### Step 4: `TypedObjectFactory` - 部品を組み立てて製品を作る工場

**src/typed-object-factory.ts**
```typescript
// (imports)

// (ObjectConfig interface)

export class TypedObjectFactory {
  static createMesh(config: ObjectConfig): THREE.Mesh {
    // (geometry and material creation)
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // object.name: オブジェクトにユニークな名前を付けることができる。
    if (config.name) mesh.name = config.name;
    // object.userData: アプリケーション固有のデータを自由に入れられる便利なプロパティ。
    if (config.userData) mesh.userData = { ...config.userData };
    // (transform application)
    
    return mesh;
  }
  
  // (createMeshes)
}
```

(中略)

## 💡 使い方とメリット

```typescript
// (example 1)

// 2. 複雑な設定を持つ光沢のある球体を作成
const shinySphere = TypedObjectFactory.createMesh({
  geometry: { type: 'sphere', config: { radius: 1.5, widthSegments: 64 } },
  material: { 
    type: 'phong', // 光沢のあるPhongマテリアルを選択
    config: { 
      color: 0x00ff00, 
      specular: 0x555555, // 少し暗めのグレーのハイライト
      shininess: 100       // 強い光沢
    }
  },
  transform: { position: { x: 2 } },
  name: 'ShinySphere',
  userData: { isInteractable: true } // クリック可能などのカスタムデータを設定
});

// (example 3)
const objects = TypedObjectFactory.createMeshes([
  // (cone)
  {
    geometry: { type: 'torus', config: { radius: 0.8, tube: 0.3 } },
    material: { 
      type: 'standard', // リアルなStandardマテリアルを選択
      config: { color: 0xffff00, roughness: 0.2, metalness: 0.8 } // 少しざらついた金属
    },
    transform: { position: { x: 0, y: 2, z: 0 } }
  }
]);

// (type safety benefits)
```

(以降のセクションは変更なし)