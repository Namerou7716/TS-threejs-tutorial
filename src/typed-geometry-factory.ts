/**
 * Three.js TypeScript Tutorial - 02. Typed Geometry Factory
 * (File overview...)
 */

import * as THREE from 'three';
import type {
  GeometryType,
  MaterialType,
  GeometryConfig,
  MaterialConfig,
  GeometryInstance,
  MaterialInstance,
  RequiredObjectConfig,
  ObjectConfig
} from '../types/geometry-types';

// ===================================================================
// Part 1: The "Parts" Factory (部品工場)
// ===================================================================

export class TypedGeometryFactory {
  
  static createGeometry<T extends GeometryType>(
    type: T,
    config: Extract<GeometryConfig, { type: T }>['config'] = {}
  ): GeometryInstance<T> {
    switch (type) {
      case 'box': {
        const cfg = config as any;
        // new THREE.BoxGeometry(width, height, depth): 立方体の形状を作成。
        return new THREE.BoxGeometry(cfg.width ?? 1, cfg.height ?? 1, cfg.depth ?? 1) as GeometryInstance<T>;
      }
      case 'sphere': {
        const cfg = config as any;
        // new THREE.SphereGeometry(radius, widthSegments, heightSegments): 球体の形状を作成。
        // widthSegments/heightSegmentsはポリゴンの分割数。大きいほど滑らかな球になる。
        return new THREE.SphereGeometry(cfg.radius ?? 1, cfg.widthSegments ?? 32, cfg.heightSegments ?? 16) as GeometryInstance<T>;
      }
      case 'cone': {
        const cfg = config as any;
        // new THREE.ConeGeometry(radius, height, radialSegments): 円錐の形状を作成。
        return new THREE.ConeGeometry(cfg.radius ?? 1, cfg.height ?? 1, cfg.radialSegments ?? 8) as GeometryInstance<T>;
      }
      case 'cylinder': {
        const cfg = config as any;
        // new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments): 円柱の形状を作成。
        return new THREE.CylinderGeometry(
          cfg.radiusTop ?? 1,
          cfg.radiusBottom ?? 1,
          cfg.height ?? 1,
          cfg.radialSegments ?? 8
        ) as GeometryInstance<T>;
      }
      case 'torus': {
        const cfg = config as any;
        // new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments): ドーナツ型の形状を作成。
        return new THREE.TorusGeometry(
          cfg.radius ?? 1,
          cfg.tube ?? 0.4,
          cfg.radialSegments ?? 8,
          cfg.tubularSegments ?? 6
        ) as GeometryInstance<T>;
      }
      case 'plane': {
        const cfg = config as any;
        // new THREE.PlaneGeometry(width, height): 平面の形状を作成。
        return new THREE.PlaneGeometry(
          cfg.width ?? 1,
          cfg.height ?? 1
        ) as GeometryInstance<T>;
      }
      case 'dodecahedron': {
        const cfg = config as any;
        // new THREE.DodecahedronGeometry(radius, detail): 十二面体の形状を作成。
        return new THREE.DodecahedronGeometry(
          cfg.radius ?? 1,
          cfg.detail ?? 0
        ) as GeometryInstance<T>;
      }
      case 'icosahedron': {
        const cfg = config as any;
        // new THREE.IcosahedronGeometry(radius, detail): 二十面体の形状を作成。
        return new THREE.IcosahedronGeometry(
          cfg.radius ?? 1,
          cfg.detail ?? 0
        ) as GeometryInstance<T>;
      }
      case 'octahedron': {
        const cfg = config as any;
        // new THREE.OctahedronGeometry(radius, detail): 八面体の形状を作成。
        return new THREE.OctahedronGeometry(
          cfg.radius ?? 1,
          cfg.detail ?? 0
        ) as GeometryInstance<T>;
      }
      case 'tetrahedron': {
        const cfg = config as any;
        // new THREE.TetrahedronGeometry(radius, detail): 四面体の形状を作成。
        return new THREE.TetrahedronGeometry(
          cfg.radius ?? 1,
          cfg.detail ?? 0
        ) as GeometryInstance<T>;
      }
      case 'ring': {
        const cfg = config as any;
        // new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments, phiSegments): リング（輪）の形状を作成。
        return new THREE.RingGeometry(
          cfg.innerRadius ?? 0.5,
          cfg.outerRadius ?? 1,
          cfg.thetaSegments ?? 8,
          cfg.phiSegments ?? 1
        ) as GeometryInstance<T>;
      }
      case 'circle': {
        const cfg = config as any;
        // new THREE.CircleGeometry(radius, segments, thetaStart, thetaLength): 円形の形状を作成。
        return new THREE.CircleGeometry(
          cfg.radius ?? 1,
          cfg.segments ?? 8,
          cfg.thetaStart ?? 0,
          cfg.thetaLength ?? Math.PI * 2
        ) as GeometryInstance<T>;
      }
      default: {
        const _exhaustiveCheck: never = type;
        throw new Error(`Unsupported geometry type: ${String(_exhaustiveCheck)}`);
      }
    }
  }

  static createMaterial<T extends MaterialType>(
    type: T,
    config: Extract<MaterialConfig, { type: T }>['config'] = {}
  ): MaterialInstance<T> {
    const cfg = config as any;
    switch (type) {
      case 'basic': {
        // new THREE.MeshBasicMaterial({ ... }): 光源の影響を受けない、最もシンプルなマテリアル。
        return new THREE.MeshBasicMaterial({ color: cfg.color ?? 0xffffff, wireframe: cfg.wireframe ?? false }) as MaterialInstance<T>;
      }
      case 'lambert': {
        // new THREE.MeshLambertMaterial({ ... }): 光を拡散的に反射する、光沢のないマットなマテリアル。
        return new THREE.MeshLambertMaterial({ color: cfg.color ?? 0xffffff, emissive: cfg.emissive ?? 0x000000 }) as MaterialInstance<T>;
      }
      case 'phong': {
        // new THREE.MeshPhongMaterial({ ... }): 光沢のある反射（ハイライト）を表現できるマテリアル。
        return new THREE.MeshPhongMaterial({
          color: cfg.color ?? 0xffffff,
          specular: cfg.specular ?? 0x111111, // ハイライトの色
          shininess: cfg.shininess ?? 30,     // ハイライトの鋭さ・強さ
        }) as MaterialInstance<T>;
      }
      case 'standard': {
        // new THREE.MeshStandardMaterial({ ... }): 物理ベースの、最もリアルな質感を表現できるマテリアル。
        return new THREE.MeshStandardMaterial({
          color: cfg.color ?? 0xffffff,
          roughness: cfg.roughness ?? 0.5,     // 表面の粗さ (0:鏡面, 1:完全な拡散)
          metalness: cfg.metalness ?? 0.5,     // 金属質 (0:非金属, 1:金属)
        }) as MaterialInstance<T>;
      }
      case 'physical': {
        // new THREE.MeshPhysicalMaterial({ ... }): StandardMaterialの拡張版で、より高度な物理的プロパティを持つ。
        return new THREE.MeshPhysicalMaterial({
          color: cfg.color ?? 0xffffff,
          roughness: cfg.roughness ?? 0.5,
          metalness: cfg.metalness ?? 0.5,
        }) as MaterialInstance<T>;
      }
      case 'toon': {
        // new THREE.MeshToonMaterial({ ... }): トゥーンシェーディング（アニメ調）のマテリアル。
        return new THREE.MeshToonMaterial({
          color: cfg.color ?? 0xffffff,
        }) as MaterialInstance<T>;
      }
      case 'normal': {
        // new THREE.MeshNormalMaterial({ ... }): 法線ベクトルをRGB色として表示するマテリアル（デバッグ用）。
        return new THREE.MeshNormalMaterial() as MaterialInstance<T>;
      }
      case 'depth': {
        // new THREE.MeshDepthMaterial({ ... }): 深度をグレースケールで表示するマテリアル（デバッグ用）。
        return new THREE.MeshDepthMaterial() as MaterialInstance<T>;
      }
      case 'wireframe': {
        // new THREE.MeshBasicMaterial({ wireframe: true }): ワイヤーフレーム表示専用のマテリアル。
        return new THREE.MeshBasicMaterial({
          color: cfg.color ?? 0xffffff,
          wireframe: true
        }) as MaterialInstance<T>;
      }
      default: {
        const _exhaustiveCheck: never = type;
        throw new Error(`Unsupported material type: ${String(_exhaustiveCheck)}`);
      }
    }
  }
}

// ===================================================================
// Part 2: The "Assembly" Factory (組立工場)
// ===================================================================

export class TypedObjectFactory {
  static createMesh(config: RequiredObjectConfig): THREE.Mesh {
    const geometry = TypedGeometryFactory.createGeometry(config.geometry.type, config.geometry.config);
    const material = TypedGeometryFactory.createMaterial(config.material.type, config.material.config);
    
    // new THREE.Mesh(geometry, material): ジオメトリ（形状）とマテリアル（材質）を組み合わせて、
    // 最終的な3Dオブジェクトであるメッシュを作成する。
    const mesh = new THREE.Mesh(geometry, material);
    
    if (config.name) mesh.name = config.name;
    if (config.userData) mesh.userData = { ...config.userData };
    if (config.transform) this.applyTransform(mesh, config.transform);
    
    return mesh;
  }

  static createMeshes(configs: RequiredObjectConfig[]): THREE.Mesh[] {
    return configs.map(config => this.createMesh(config));
  }
  
  private static applyTransform(object: THREE.Object3D, transform: ObjectConfig['transform']): void {
    if (!transform) return;
    // object.position.set(x, y, z): オブジェクトの3D空間における位置を一度に設定。
    if (transform.position) {
      object.position.set(
        transform.position.x ?? 0,
        transform.position.y ?? 0,
        transform.position.z ?? 0
      );
    }
    // object.rotation.set(x, y, z): オブジェクトの回転をラジアン単位で設定。
    if (transform.rotation) {
      object.rotation.set(
        transform.rotation.x ?? 0,
        transform.rotation.y ?? 0,
        transform.rotation.z ?? 0
      );
    }
    // object.scale.set(x, y, z): オブジェクトの拡大・縮小率をX, Y, Z軸それぞれに設定。
    if (transform.scale) {
      object.scale.set(
        transform.scale.x ?? 1,
        transform.scale.y ?? 1,
        transform.scale.z ?? 1
      );
    }
  }
}

// ===================================================================
// Part 3: Helper Utilities (便利な道具箱)
// ===================================================================

export const TypedHelpers = {
  /**
   * 様々な形式の色の入力を、安全にTHREE.Colorオブジェクトに変換します。
   * @param color 色の入力 (例: 0xff0000, 'red', '#ff0000')
   * @returns THREE.Colorインスタンス。無効な場合は白を返す。
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
   * 数値以外の値（NaN, Infinityなど）が入らない、安全なTHREE.Vector3を作成します。
   */
  createVector3(x = 0, y = 0, z = 0): THREE.Vector3 {
    return new THREE.Vector3(
      Number.isFinite(x) ? x : 0,
      Number.isFinite(y) ? y : 0,
      Number.isFinite(z) ? z : 0
    );
  },
  
  cloneMesh<T extends THREE.Mesh>(mesh: T): T {
    // mesh.clone(): オブジェクトのトランスフォーム（位置、回転、スケール）や名前などの基本情報をコピーする。
    // ただし、ジオメトリとマテリアルは参照がコピーされるだけ（シャローコピー）。
    const cloned = mesh.clone() as T;
    // geometry.clone(): ジオメトリデータを完全に複製（ディープコピー）する。
    cloned.geometry = mesh.geometry.clone();
    // material.clone(): マテリアルデータを完全に複製する。
    cloned.material = (Array.isArray(mesh.material)
      ? mesh.material.map(m => m.clone())
      : mesh.material.clone()) as T['material'];
    return cloned;
  }
} as const;