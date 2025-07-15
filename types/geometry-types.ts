/**
 * Three.js TypeScript Tutorial - Custom Geometry Types
 * カスタム型定義とユーティリティ型
 */

import * as THREE from 'three';

// ===========================================
// 基本的な型定義
// ===========================================

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
  | 'icosahedron'
  | 'octahedron'
  | 'tetrahedron'
  | 'plane'
  | 'ring'
  | 'circle';

/**
 * サポートされているマテリアルタイプ
 */
export type MaterialType = 
  | 'basic'
  | 'lambert'
  | 'phong'
  | 'standard'
  | 'physical'
  | 'toon'
  | 'normal'
  | 'depth'
  | 'wireframe';

/**
 * 色の表現方法
 */
export type ColorInput = THREE.ColorRepresentation | string | number;

/**
 * 位置・回転・スケールの3D座標
 */
export interface Vector3Like {
  x: number;
  y: number;
  z: number;
}

// ===========================================
// ジオメトリ設定の型定義
// ===========================================

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
 * 円錐ジオメトリの設定
 */
export interface ConeGeometryConfig {
  radius?: number;
  height?: number;
  radialSegments?: number;
  heightSegments?: number;
  openEnded?: boolean;
  thetaStart?: number;
  thetaLength?: number;
}

/**
 * トーラスジオメトリの設定
 */
export interface TorusGeometryConfig {
  radius?: number;
  tube?: number;
  radialSegments?: number;
  tubularSegments?: number;
  arc?: number;
}

/**
 * 統合ジオメトリ設定型（Union Types使用）
 */
export type GeometryConfig = 
  | { type: 'box'; config: BoxGeometryConfig }
  | { type: 'sphere'; config: SphereGeometryConfig }
  | { type: 'cone'; config: ConeGeometryConfig }
  | { type: 'torus'; config: TorusGeometryConfig }
  | { type: 'cylinder'; config: ConeGeometryConfig }
  | { type: 'dodecahedron'; config: { radius?: number; detail?: number } }
  | { type: 'plane'; config: { width?: number; height?: number } };

// ===========================================
// マテリアル設定の型定義
// ===========================================

/**
 * 基本マテリアル設定
 */
export interface BaseMaterialConfig {
  color?: ColorInput;
  transparent?: boolean;
  opacity?: number;
  visible?: boolean;
  side?: THREE.Side;
  wireframe?: boolean;
}

/**
 * Lambert マテリアル設定
 */
export interface LambertMaterialConfig extends BaseMaterialConfig {
  emissive?: ColorInput;
  emissiveIntensity?: number;
  map?: THREE.Texture | null;
}

/**
 * Phong マテリアル設定
 */
export interface PhongMaterialConfig extends LambertMaterialConfig {
  specular?: ColorInput;
  shininess?: number;
}

/**
 * Standard マテリアル設定
 */
export interface StandardMaterialConfig extends BaseMaterialConfig {
  roughness?: number;
  metalness?: number;
  emissive?: ColorInput;
  emissiveIntensity?: number;
  envMapIntensity?: number;
  map?: THREE.Texture | null;
  normalMap?: THREE.Texture | null;
  roughnessMap?: THREE.Texture | null;
  metalnessMap?: THREE.Texture | null;
}

/**
 * 統合マテリアル設定型
 */
export type MaterialConfig = 
  | { type: 'basic'; config: BaseMaterialConfig }
  | { type: 'lambert'; config: LambertMaterialConfig }
  | { type: 'phong'; config: PhongMaterialConfig }
  | { type: 'standard'; config: StandardMaterialConfig }
  | { type: 'normal'; config: BaseMaterialConfig }
  | { type: 'wireframe'; config: BaseMaterialConfig };

// ===========================================
// メッシュオブジェクト関連の型
// ===========================================

/**
 * 3Dオブジェクトの変換情報
 */
export interface Transform {
  position?: Partial<Vector3Like>;
  rotation?: Partial<Vector3Like>;
  scale?: Partial<Vector3Like>;
}

/**
 * アニメーション設定
 */
export interface AnimationConfig {
  enabled: boolean;
  rotation?: {
    x?: number;
    y?: number;
    z?: number;
  };
  position?: {
    amplitude?: number;
    frequency?: number;
    axis?: 'x' | 'y' | 'z';
  };
  scale?: {
    min?: number;
    max?: number;
    frequency?: number;
  };
}

/**
 * 3Dオブジェクトの完全な設定
 */
export interface ObjectConfig {
  geometry: GeometryConfig;
  material: MaterialConfig;
  transform?: Transform;
  animation?: AnimationConfig;
  name?: string;
  userData?: Record<string, unknown>;
}

// ===========================================
// ユーティリティ型とヘルパー
// ===========================================

/**
 * 型安全なジオメトリファクトリーの戻り値型
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

/**
 * 必須フィールドを持つ型を作成するユーティリティ型
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * 部分的に必須フィールドを持つオブジェクト設定型
 */
export type RequiredObjectConfig = RequiredFields<ObjectConfig, 'geometry' | 'material'>;

// ===========================================
// イベント関連の型定義
// ===========================================

/**
 * マウスイベントの情報
 */
export interface MouseEventInfo {
  position: THREE.Vector2;
  normalized: THREE.Vector2;
  target?: THREE.Object3D;
}

/**
 * インタラクションイベントのコールバック型
 */
export type InteractionCallback = (info: MouseEventInfo) => void;

/**
 * イベントハンドラーのマップ
 */
export interface EventHandlers {
  onClick?: InteractionCallback;
  onHover?: InteractionCallback;
  onMouseMove?: InteractionCallback;
}

// ===========================================
// パフォーマンス関連の型定義
// ===========================================

/**
 * レンダリング統計情報
 */
export interface RenderStats {
  fps: number;
  frameTime: number;
  triangles: number;
  vertices: number;
  drawCalls: number;
  memory: {
    geometries: number;
    textures: number;
    materials: number;
  };
}

/**
 * パフォーマンスモニターのコールバック
 */
export type PerformanceCallback = (stats: RenderStats) => void;