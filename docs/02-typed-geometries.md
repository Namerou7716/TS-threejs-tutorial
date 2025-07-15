# 02. 型安全なオブジェクト作成

## 📖 学習目標

高度なTypeScript機能を使用して、型安全で再利用可能な3Dオブジェクト作成システムを構築します。

**学習内容:**
- Union Types（合併型）の活用
- Factory Pattern（ファクトリーパターン）
- Type Guards（型ガード）
- Generic Constraints（ジェネリック制約）
- Conditional Types（条件付き型）

**所要時間:** 60-90分  
**対象者:** 基本シーンを完了した方

## 🎯 設計目標

従来の方法では、各ジオメトリとマテリアルを個別に作成する必要がありました：

```typescript
// 従来の方法: 繰り返しが多く、型安全性が低い
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const sphereGeometry = new THREE.SphereGeometry(1, 32, 16);
const basicMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const lambertMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });

const boxMesh = new THREE.Mesh(boxGeometry, basicMaterial);
const sphereMesh = new THREE.Mesh(sphereGeometry, lambertMaterial);
```

**目標**: 型安全で統一されたファクトリーシステムを構築する

## 🏗️ 型定義の設計

### Union Types（合併型）

サポートするジオメトリとマテリアルのタイプを定義します：

```typescript
/**
 * サポートされているジオメトリタイプ
 */
export type GeometryType = 
  | 'box'
  | 'sphere'
  | 'cone'
  | 'cylinder'
  | 'torus'
  | 'dodecahedron'
  | 'plane';

/**
 * サポートされているマテリアルタイプ
 */
export type MaterialType = 
  | 'basic'
  | 'lambert'
  | 'phong'
  | 'standard'
  | 'normal'
  | 'wireframe';
```

### 設定オブジェクトの型定義

各ジオメトリタイプに対応する設定インターフェースを定義：

```typescript
/**
 * ボックスジオメトリの設定
 */
export interface BoxGeometryConfig {
  width?: number;
  height?: number;
  depth?: number;
  widthSegments?: number;
  heightSegments?: number;
  depthSegments?: number;
}

/**
 * 球体ジオメトリの設定
 */
export interface SphereGeometryConfig {
  radius?: number;
  widthSegments?: number;
  heightSegments?: number;
  phiStart?: number;
  phiLength?: number;
  thetaStart?: number;
  thetaLength?: number;
}

/**
 * 統合ジオメトリ設定型（Union Types使用）
 */
export type GeometryConfig = 
  | { type: 'box'; config: BoxGeometryConfig }
  | { type: 'sphere'; config: SphereGeometryConfig }
  | { type: 'cone'; config: ConeGeometryConfig }
  | { type: 'torus'; config: TorusGeometryConfig }
  | { type: 'plane'; config: { width?: number; height?: number } };
```

## 🎭 Conditional Types（条件付き型）

TypeScriptの高度な機能を使用して、型に基づいて戻り値の型を決定します：

```typescript
/**
 * 型安全なジオメトリファクトリーの戻り値型
 * ジオメトリタイプに基づいて適切なThree.jsクラスを返す
 */
export type GeometryInstance<T extends GeometryType> = 
  T extends 'box' ? THREE.BoxGeometry :
  T extends 'sphere' ? THREE.SphereGeometry :
  T extends 'cone' ? THREE.ConeGeometry :
  T extends 'cylinder' ? THREE.CylinderGeometry :
  T extends 'torus' ? THREE.TorusGeometry :
  T extends 'plane' ? THREE.PlaneGeometry :
  THREE.BufferGeometry;

/**
 * 型安全なマテリアルファクトリーの戻り値型
 */
export type MaterialInstance<T extends MaterialType> = 
  T extends 'basic' ? THREE.MeshBasicMaterial :
  T extends 'lambert' ? THREE.MeshLambertMaterial :
  T extends 'phong' ? THREE.MeshPhongMaterial :
  T extends 'standard' ? THREE.MeshStandardMaterial :
  T extends 'normal' ? THREE.MeshNormalMaterial :
  THREE.Material;
```

## 🏭 TypedGeometryFactory クラス

型安全なジオメトリ作成を行うファクトリークラスです：

```typescript
export class TypedGeometryFactory {
  
  /**
   * ジオメトリを作成（型安全）
   * ジェネリクスを使用して型安全な3Dジオメトリを作成
   */
  static createGeometry<T extends GeometryType>(
    type: T,
    config: GeometryConfig['config'] = {}
  ): GeometryInstance<T> {
    switch (type) {
      case 'box': {
        // Extract<>を使用して特定の設定型を抽出
        const cfg = config as Extract<GeometryConfig, { type: 'box' }>['config'];
        return new THREE.BoxGeometry(
          cfg.width ?? 1,
          cfg.height ?? 1,
          cfg.depth ?? 1,
          cfg.widthSegments ?? 1,
          cfg.heightSegments ?? 1,
          cfg.depthSegments ?? 1
        ) as GeometryInstance<T>;
      }
      
      case 'sphere': {
        const cfg = config as Extract<GeometryConfig, { type: 'sphere' }>['config'];
        return new THREE.SphereGeometry(
          cfg.radius ?? 1,
          cfg.widthSegments ?? 32,
          cfg.heightSegments ?? 16,
          cfg.phiStart ?? 0,
          cfg.phiLength ?? Math.PI * 2,
          cfg.thetaStart ?? 0,
          cfg.thetaLength ?? Math.PI
        ) as GeometryInstance<T>;
      }
      
      case 'torus': {
        const cfg = config as Extract<GeometryConfig, { type: 'torus' }>['config'];
        return new THREE.TorusGeometry(
          cfg.radius ?? 1,
          cfg.tube ?? 0.4,
          cfg.radialSegments ?? 8,
          cfg.tubularSegments ?? 6,
          cfg.arc ?? Math.PI * 2
        ) as GeometryInstance<T>;
      }
      
      default:
        // TypeScriptの網羅性チェック（コンパイル時に全ケースの処理を保証）
        const _exhaustiveCheck: never = type;
        throw new Error(`サポートされていないジオメトリタイプ: ${String(_exhaustiveCheck)}`);
    }
  }

  /**
   * マテリアルを作成（型安全）
   */
  static createMaterial<T extends MaterialType>(
    type: T,
    config: MaterialConfig['config'] = {}
  ): MaterialInstance<T> {
    const baseConfig = config as MaterialConfig['config'];
    
    switch (type) {
      case 'basic': {
        return new THREE.MeshBasicMaterial({
          color: baseConfig.color ?? 0xffffff,
          transparent: baseConfig.transparent ?? false,
          opacity: baseConfig.opacity ?? 1,
          wireframe: baseConfig.wireframe ?? false
        }) as MaterialInstance<T>;
      }
      
      case 'lambert': {
        const cfg = config as Extract<MaterialConfig, { type: 'lambert' }>['config'];
        return new THREE.MeshLambertMaterial({
          color: cfg.color ?? 0xffffff,
          emissive: cfg.emissive ?? 0x000000,
          emissiveIntensity: cfg.emissiveIntensity ?? 1,
          transparent: cfg.transparent ?? false,
          opacity: cfg.opacity ?? 1,
          map: cfg.map ?? null
        }) as MaterialInstance<T>;
      }
      
      case 'phong': {
        const cfg = config as Extract<MaterialConfig, { type: 'phong' }>['config'];
        return new THREE.MeshPhongMaterial({
          color: cfg.color ?? 0xffffff,
          emissive: cfg.emissive ?? 0x000000,
          specular: cfg.specular ?? 0x111111,
          shininess: cfg.shininess ?? 30,
          transparent: cfg.transparent ?? false,
          opacity: cfg.opacity ?? 1,
          map: cfg.map ?? null
        }) as MaterialInstance<T>;
      }
      
      default:
        const _exhaustiveCheck: never = type;
        throw new Error(`サポートされていないマテリアルタイプ: ${String(_exhaustiveCheck)}`);
    }
  }
}
```

## 🔧 TypedObjectFactory クラス

ジオメトリとマテリアルを組み合わせて完全な3Dオブジェクトを作成します：

```typescript
/**
 * 3Dオブジェクトの完全な設定インターフェース
 */
export interface ObjectConfig {
  geometry: GeometryConfig;
  material: MaterialConfig;
  transform?: {
    position?: Partial<{ x: number; y: number; z: number }>;
    rotation?: Partial<{ x: number; y: number; z: number }>;
    scale?: Partial<{ x: number; y: number; z: number }>;
  };
  name?: string;
  userData?: Record<string, unknown>;
}

/**
 * 必須フィールドを持つ型を作成するユーティリティ型
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * 部分的に必須フィールドを持つオブジェクト設定型
 */
export type RequiredObjectConfig = RequiredFields<ObjectConfig, 'geometry' | 'material'>;

export class TypedObjectFactory {
  
  /**
   * メッシュオブジェクトを作成（型安全）
   */
  static createMesh(config: RequiredObjectConfig): THREE.Mesh {
    // ジオメトリの作成
    const geometry = TypedGeometryFactory.createGeometry(
      config.geometry.type,
      config.geometry.config
    );
    
    // マテリアルの作成
    const material = TypedGeometryFactory.createMaterial(
      config.material.type,
      config.material.config
    );
    
    // メッシュの作成
    const mesh = new THREE.Mesh(geometry, material);
    
    // オプション設定の適用
    if (config.name) {
      mesh.name = config.name;
    }
    
    if (config.userData) {
      mesh.userData = { ...config.userData };
    }
    
    if (config.transform) {
      this.applyTransform(mesh, config.transform);
    }
    
    return mesh;
  }
  
  /**
   * 複数のメッシュを作成
   */
  static createMeshes(configs: RequiredObjectConfig[]): THREE.Mesh[] {
    return configs.map(config => this.createMesh(config));
  }
  
  /**
   * 変換の適用（プライベートヘルパーメソッド）
   */
  private static applyTransform(
    object: THREE.Object3D, 
    transform: ObjectConfig['transform']
  ): void {
    if (!transform) return;
    
    // 位置の設定
    if (transform.position) {
      if (transform.position.x !== undefined) object.position.x = transform.position.x;
      if (transform.position.y !== undefined) object.position.y = transform.position.y;
      if (transform.position.z !== undefined) object.position.z = transform.position.z;
    }
    
    // 回転の設定
    if (transform.rotation) {
      if (transform.rotation.x !== undefined) object.rotation.x = transform.rotation.x;
      if (transform.rotation.y !== undefined) object.rotation.y = transform.rotation.y;
      if (transform.rotation.z !== undefined) object.rotation.z = transform.rotation.z;
    }
    
    // スケールの設定
    if (transform.scale) {
      if (transform.scale.x !== undefined) object.scale.x = transform.scale.x;
      if (transform.scale.y !== undefined) object.scale.y = transform.scale.y;
      if (transform.scale.z !== undefined) object.scale.z = transform.scale.z;
    }
  }
}
```

## 🛡️ Type Guards（型ガード）

実行時の型安全性を確保するための型ガード関数：

```typescript
/**
 * 便利な型安全ヘルパー関数群
 */
export const TypedHelpers = {
  /**
   * 色の検証と変換
   */
  validateColor(color: unknown): THREE.Color {
    if (color instanceof THREE.Color) {
      return color;
    }
    
    try {
      return new THREE.Color(color as THREE.ColorRepresentation);
    } catch {
      console.warn('Invalid color provided, using default white');
      return new THREE.Color(0xffffff);
    }
  },
  
  /**
   * Vector3の安全な作成
   */
  createVector3(x: number = 0, y: number = 0, z: number = 0): THREE.Vector3 {
    return new THREE.Vector3(
      Number.isFinite(x) ? x : 0,
      Number.isFinite(y) ? y : 0,
      Number.isFinite(z) ? z : 0
    );
  },
  
  /**
   * オブジェクトの型安全なクローン
   */
  cloneMesh<T extends THREE.Mesh>(mesh: T): T {
    const cloned = mesh.clone() as T;
    cloned.geometry = mesh.geometry.clone();
    cloned.material = (mesh.material as THREE.Material).clone();
    return cloned;
  }
} as const;
```

## 💡 使用例

作成したファクトリーシステムの実際の使用方法：

```typescript
// 1. 基本的なオブジェクト作成
const redBox = TypedObjectFactory.createMesh({
  geometry: {
    type: 'box',
    config: { width: 2, height: 1, depth: 1 }
  },
  material: {
    type: 'basic',
    config: { color: 0xff0000 }
  },
  name: 'RedBox'
});

// 2. 複雑な設定でのオブジェクト作成
const decorativeSphere = TypedObjectFactory.createMesh({
  geometry: {
    type: 'sphere',
    config: { 
      radius: 1.5, 
      widthSegments: 32, 
      heightSegments: 16 
    }
  },
  material: {
    type: 'phong',
    config: { 
      color: 0x00ff00,
      specular: 0x222222,
      shininess: 100
    }
  },
  transform: {
    position: { x: 2, y: 0, z: 0 },
    rotation: { x: 0.5, y: 0.5, z: 0 }
  },
  name: 'DecorativeSphere',
  userData: { type: 'decoration', interactive: true }
});

// 3. 複数オブジェクトの一括作成
const objects = TypedObjectFactory.createMeshes([
  {
    geometry: { type: 'box', config: { width: 1, height: 1, depth: 1 } },
    material: { type: 'basic', config: { color: 0xff0000 } },
    transform: { position: { x: -2, y: 0, z: 0 } }
  },
  {
    geometry: { type: 'sphere', config: { radius: 0.8 } },
    material: { type: 'lambert', config: { color: 0x00ff00 } },
    transform: { position: { x: 0, y: 0, z: 0 } }
  },
  {
    geometry: { type: 'cone', config: { radius: 0.6, height: 1.2 } },
    material: { type: 'phong', config: { color: 0x0000ff } },
    transform: { position: { x: 2, y: 0, z: 0 } }
  }
]);

// 4. シーンへの追加
objects.forEach(obj => scene.add(obj));
```

## 🔍 高度な使用パターン

### 動的オブジェクト生成

```typescript
/**
 * ランダムなオブジェクトを生成する関数
 */
function createRandomObject(): THREE.Mesh {
  const geometryTypes: GeometryType[] = ['box', 'sphere', 'cone', 'torus'];
  const materialTypes: MaterialType[] = ['basic', 'lambert', 'phong'];
  
  const randomGeometry = geometryTypes[Math.floor(Math.random() * geometryTypes.length)];
  const randomMaterial = materialTypes[Math.floor(Math.random() * materialTypes.length)];
  const randomColor = Math.random() * 0xffffff;
  
  return TypedObjectFactory.createMesh({
    geometry: {
      type: randomGeometry,
      config: {} // デフォルト設定を使用
    },
    material: {
      type: randomMaterial,
      config: { color: randomColor }
    },
    transform: {
      position: {
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10,
        z: (Math.random() - 0.5) * 10
      }
    }
  });
}

// 使用例: 10個のランダムオブジェクトを作成
const randomObjects = Array.from({ length: 10 }, () => createRandomObject());
randomObjects.forEach(obj => scene.add(obj));
```

### 設定の検証機能

```typescript
/**
 * オブジェクト設定の検証
 */
function validateObjectConfig(config: unknown): config is RequiredObjectConfig {
  if (!config || typeof config !== 'object') return false;
  
  const obj = config as any;
  
  // 必須フィールドの確認
  if (!obj.geometry || !obj.material) return false;
  if (!obj.geometry.type || !obj.material.type) return false;
  
  // 有効なタイプかチェック
  const validGeometryTypes: GeometryType[] = ['box', 'sphere', 'cone', 'cylinder', 'torus', 'plane'];
  const validMaterialTypes: MaterialType[] = ['basic', 'lambert', 'phong', 'standard', 'normal', 'wireframe'];
  
  return validGeometryTypes.includes(obj.geometry.type) && 
         validMaterialTypes.includes(obj.material.type);
}

// JSONからの安全なオブジェクト作成
function createMeshFromJSON(jsonString: string): THREE.Mesh | null {
  try {
    const config = JSON.parse(jsonString);
    
    if (validateObjectConfig(config)) {
      return TypedObjectFactory.createMesh(config);
    } else {
      console.error('Invalid object configuration');
      return null;
    }
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
}
```

## 🎓 次のステップ

型安全なオブジェクト作成システムを理解したら、さらに高度な設計パターンに進みましょう。

**次の学習項目:**
- [03. 高度な設計パターン](./03-class-based-scene.md)
- 抽象クラスと継承
- Mixins（ミックスイン）パターン
- Decorator Pattern（デコレータパターン）

## 🔍 重要なポイント

1. **Union Types**: 限定された選択肢を型安全に表現
2. **Conditional Types**: 入力型に基づいて出力型を決定
3. **Factory Pattern**: オブジェクト作成ロジックの統一と再利用
4. **Type Guards**: 実行時の型安全性確保
5. **Generic Constraints**: ジェネリクスの型制約で柔軟性と安全性を両立

このシステムにより、Three.jsオブジェクトの作成が型安全かつ効率的になり、大規模なアプリケーションでも保守しやすいコードを書けるようになります。