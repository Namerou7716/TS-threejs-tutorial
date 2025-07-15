/**
 * Three.js TypeScript Tutorial - 02. Typed Geometry Factory
 * (File overview...)
 */

import * as THREE from 'three';
import type { /* ...imports... */ } from '../types/geometry-types';

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
      // ... other geometries ...
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
      // ... other materials ...
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

  // (createMeshes and applyTransform)
}

// ===================================================================
// Part 3: Helper Utilities (便利な道具箱)
// ===================================================================

export const TypedHelpers = {
  // (validateColor and createVector3)
  
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