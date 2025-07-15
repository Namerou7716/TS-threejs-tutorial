/**
 * Three.js TypeScript Tutorial - Typed Geometry Factory
 * 型安全なジオメトリとマテリアルファクトリー
 * 
 * このファイルでは以下の高度なTypeScript機能を学習します：
 * 1. Union Types（合併型）
 * 2. Conditional Types（条件付き型）
 * 3. Type Guards（型ガード）
 * 4. Factory Pattern（ファクトリーパターン）
 * 5. Generic Constraints（ジェネリック制約）
 */

import * as THREE from 'three';
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

/**
 * 型安全なジオメトリファクトリー
 * 静的メソッドを使用してジオメトリを作成
 */
export class TypedGeometryFactory {
  
  /**
   * ジオメトリを作成（型安全）
   * ジェネリクスを使用して型安全な3Dジオメトリを作成
   * @param type 作成するジオメトリのタイプ
   * @param config ジオメトリの設定オプション
   * @returns 指定されたタイプのジオメトリ
   */
  static createGeometry<T extends GeometryType>(
    type: T,
    config: GeometryConfig['config'] = {}
  ): GeometryInstance<T> {
    switch (type) {
      case 'box': {
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
      
      case 'cone': {
        const cfg = config as Extract<GeometryConfig, { type: 'cone' }>['config'];
        return new THREE.ConeGeometry(
          cfg.radius ?? 1,
          cfg.height ?? 1,
          cfg.radialSegments ?? 8,
          cfg.heightSegments ?? 1,
          cfg.openEnded ?? false,
          cfg.thetaStart ?? 0,
          cfg.thetaLength ?? Math.PI * 2
        ) as GeometryInstance<T>;
      }
      
      case 'cylinder': {
        const cfg = config as Extract<GeometryConfig, { type: 'cylinder' }>['config'];
        return new THREE.CylinderGeometry(
          cfg.radius ?? 1,
          cfg.radius ?? 1,
          cfg.height ?? 1,
          cfg.radialSegments ?? 8,
          cfg.heightSegments ?? 1,
          cfg.openEnded ?? false,
          cfg.thetaStart ?? 0,
          cfg.thetaLength ?? Math.PI * 2
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
      
      case 'dodecahedron': {
        const cfg = config as Extract<GeometryConfig, { type: 'dodecahedron' }>['config'];
        return new THREE.DodecahedronGeometry(
          cfg.radius ?? 1,
          cfg.detail ?? 0
        ) as GeometryInstance<T>;
      }
      
      case 'plane': {
        const cfg = config as Extract<GeometryConfig, { type: 'plane' }>['config'];
        return new THREE.PlaneGeometry(
          cfg.width ?? 1,
          cfg.height ?? 1
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
          visible: baseConfig.visible ?? true,
          side: baseConfig.side ?? THREE.FrontSide,
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
          visible: cfg.visible ?? true,
          side: cfg.side ?? THREE.FrontSide,
          wireframe: cfg.wireframe ?? false,
          map: cfg.map ?? null
        }) as MaterialInstance<T>;
      }
      
      case 'phong': {
        const cfg = config as Extract<MaterialConfig, { type: 'phong' }>['config'];
        return new THREE.MeshPhongMaterial({
          color: cfg.color ?? 0xffffff,
          emissive: cfg.emissive ?? 0x000000,
          emissiveIntensity: cfg.emissiveIntensity ?? 1,
          specular: cfg.specular ?? 0x111111,
          shininess: cfg.shininess ?? 30,
          transparent: cfg.transparent ?? false,
          opacity: cfg.opacity ?? 1,
          visible: cfg.visible ?? true,
          side: cfg.side ?? THREE.FrontSide,
          wireframe: cfg.wireframe ?? false,
          map: cfg.map ?? null
        }) as MaterialInstance<T>;
      }
      
      case 'standard': {
        const cfg = config as Extract<MaterialConfig, { type: 'standard' }>['config'];
        return new THREE.MeshStandardMaterial({
          color: cfg.color ?? 0xffffff,
          roughness: cfg.roughness ?? 1,
          metalness: cfg.metalness ?? 0,
          emissive: cfg.emissive ?? 0x000000,
          emissiveIntensity: cfg.emissiveIntensity ?? 1,
          envMapIntensity: cfg.envMapIntensity ?? 1,
          transparent: cfg.transparent ?? false,
          opacity: cfg.opacity ?? 1,
          visible: cfg.visible ?? true,
          side: cfg.side ?? THREE.FrontSide,
          wireframe: cfg.wireframe ?? false,
          map: cfg.map ?? null,
          normalMap: cfg.normalMap ?? null,
          roughnessMap: cfg.roughnessMap ?? null,
          metalnessMap: cfg.metalnessMap ?? null
        }) as MaterialInstance<T>;
      }
      
      case 'normal': {
        return new THREE.MeshNormalMaterial({
          transparent: baseConfig.transparent ?? false,
          opacity: baseConfig.opacity ?? 1,
          visible: baseConfig.visible ?? true,
          side: baseConfig.side ?? THREE.FrontSide,
          wireframe: baseConfig.wireframe ?? false
        }) as MaterialInstance<T>;
      }
      
      case 'wireframe': {
        return new THREE.MeshBasicMaterial({
          color: baseConfig.color ?? 0xffffff,
          wireframe: true,
          transparent: baseConfig.transparent ?? false,
          opacity: baseConfig.opacity ?? 1,
          visible: baseConfig.visible ?? true,
          side: baseConfig.side ?? THREE.FrontSide
        }) as MaterialInstance<T>;
      }
      
      default:
        // TypeScriptの網羅性チェック（コンパイル時に全ケースの処理を保証）
        const _exhaustiveCheck: never = type;
        throw new Error(`サポートされていないマテリアルタイプ: ${String(_exhaustiveCheck)}`);
    }
  }
}

/**
 * 型安全な3Dオブジェクトファクトリー
 */
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
    
    // 名前の設定
    if (config.name) {
      mesh.name = config.name;
    }
    
    // ユーザーデータの設定
    if (config.userData) {
      mesh.userData = { ...config.userData };
    }
    
    // 変換の適用
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
   * 変換の適用
   */
  private static applyTransform(object: THREE.Object3D, transform: ObjectConfig['transform']): void {
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