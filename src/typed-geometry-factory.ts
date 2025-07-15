/**
 * Three.js TypeScript Tutorial - 02. Typed Geometry Factory
 *
 * このファイルは、型安全な3Dオブジェクト作成システム（ファクトリー）の実装です。
 * TypeScriptの高度な型機能（ジェネリクス、条件付き型など）を活用して、
 * 設定オブジェクトから安全にThree.jsのオブジェクトを生成します。
 */

import * as THREE from 'three';
// 別のファイルで定義した、このファクトリーで使う型定義をインポートします。
import type {
  GeometryType,
  MaterialType,
  GeometryConfig,
  MaterialConfig,
  GeometryInstance,
  MaterialInstance,
  ObjectConfig,
  RequiredObjectConfig
} from '../types/geometry-types';

// ===================================================================
// Part 1: The "Parts" Factory (部品工場)
// 目的: ジオメトリ（形状）やマテリアル（材質）といった「部品」を作成する。
// ===================================================================

/**
 * 型安全なジオメトリとマテリアルの「部品工場」。
 * 静的メソッド（`new`せずに直接呼び出せるメソッド）として機能を提供します。
 */
export class TypedGeometryFactory {
  
  /**
   * 型安全なジオメトリ（形状）を作成します。
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
        const cfg = config as any; // 型推論を補助
        return new THREE.BoxGeometry(
          cfg.width ?? 1, // ?? はNull合体演算子。cfg.widthがnullかundefinedなら1を使う
          cfg.height ?? 1,
          cfg.depth ?? 1
        ) as GeometryInstance<T>; // 戻り値の型を正しく推論させるための型アサーション
      }
      
      case 'sphere': {
        const cfg = config as any;
        return new THREE.SphereGeometry(
          cfg.radius ?? 1,
          cfg.widthSegments ?? 32,
          cfg.heightSegments ?? 16
        ) as GeometryInstance<T>;
      }
      
      // ... cone, cylinder, torusなどの他の形状も同様に続く ...
      
      default:
        // 網羅性チェック: もし`GeometryType`に新しい型を追加した場合、
        // このdefault節がコンパイルエラーになります。
        // これにより、case文に新しい型の処理を書き忘れるのを防げます。
        const _exhaustiveCheck: never = type;
        throw new Error(`Unsupported geometry type: ${String(_exhaustiveCheck)}`);
    }
  }

  /**
   * 型安全なマテリアル（材質）を作成します。
   * @param type 作成したいマテリアルの種類 (例: 'basic', 'lambert')
   * @param config そのマテリアルに固有の設定 (例: { color: 0xff0000 })
   * @returns 指定された型に対応するThree.jsのマテリアルインスタンス
   */
  static createMaterial<T extends MaterialType>(
    type: T,
    config: Extract<MaterialConfig, { type: T }>['config'] = {}
  ): MaterialInstance<T> {
    const cfg = config as any;
    
    switch (type) {
      case 'basic': {
        return new THREE.MeshBasicMaterial({
          color: cfg.color ?? 0xffffff,
          wireframe: cfg.wireframe ?? false
        }) as MaterialInstance<T>;
      }
      
      case 'lambert': {
        return new THREE.MeshLambertMaterial({
          color: cfg.color ?? 0xffffff,
          emissive: cfg.emissive ?? 0x000000
        }) as MaterialInstance<T>;
      }

      // ... phong, standardなどの他の材質も同様に続く ...

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
 */
export class TypedObjectFactory {
  
  /**
   * 設定オブジェクトに基づいて、単一のMesh（最終製品）を作成します。
   * @param config ジオメトリ、マテリアル、その他の設定を含む完全なオブジェクト設定
   * @returns 作成されたTHREE.Meshインスタンス
   */
  static createMesh(config: RequiredObjectConfig): THREE.Mesh {
    // 1. 部品工場にジオメトリの作成を依頼
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
    
    // 4. 名前の設定や位置・回転・スケールの調整など、追加の組み立て作業を行う
    if (config.name) mesh.name = config.name;
    if (config.userData) mesh.userData = { ...config.userData };
    if (config.transform) this.applyTransform(mesh, config.transform);
    
    return mesh;
  }
  
  /**
   * 設定オブジェクトの配列から、複数のMeshを一括で作成します。
   */
  static createMeshes(configs: RequiredObjectConfig[]): THREE.Mesh[] {
    return configs.map(config => this.createMesh(config));
  }
  
  /**
   * オブジェクトの位置、回転、スケールを適用するプライベートヘルパーメソッド。
   */
  private static applyTransform(object: THREE.Object3D, transform: ObjectConfig['transform']): void {
    if (!transform) return;
    if (transform.position) object.position.set(transform.position.x ?? 0, transform.position.y ?? 0, transform.position.z ?? 0);
    if (transform.rotation) object.rotation.set(transform.rotation.x ?? 0, transform.rotation.y ?? 0, transform.rotation.z ?? 0);
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
   * Meshオブジェクトを、ジオメトリとマテリアルも含めて安全に複製（クローン）します。
   */
  cloneMesh<T extends THREE.Mesh>(mesh: T): T {
    const cloned = mesh.clone() as T;
    cloned.geometry = mesh.geometry.clone();
    cloned.material = (Array.isArray(mesh.material)
      ? mesh.material.map(m => m.clone())
      : mesh.material.clone()) as T['material'];
    return cloned;
  }
} as const;
