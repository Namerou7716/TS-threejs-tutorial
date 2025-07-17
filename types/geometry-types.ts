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
 * Three.jsで使用できる基本的な3D形状の種類を定義
 */
export type GeometryType = 
  | 'box'          // 立方体・直方体
  | 'sphere'       // 球体
  | 'cone'         // 円錐
  | 'cylinder'     // 円柱
  | 'torus'        // トーラス（ドーナツ型）
  | 'dodecahedron' // 正十二面体
  | 'icosahedron'  // 正二十面体
  | 'octahedron'   // 正八面体
  | 'tetrahedron'  // 正四面体
  | 'plane'        // 平面
  | 'ring'         // リング（環状）
  | 'circle';      // 円

/**
 * サポートされているマテリアルタイプ
 * Three.jsで使用できる材質・質感の種類を定義
 */
export type MaterialType = 
  | 'basic'        // 基本マテリアル（ライティング無視）
  | 'lambert'      // Lambert反射モデル（拡散反射のみ）
  | 'phong'        // Phong反射モデル（拡散＋鏡面反射）
  | 'standard'     // PBRマテリアル（物理ベースレンダリング）
  | 'physical'     // 高度なPBRマテリアル
  | 'toon'         // トゥーンシェーディング（アニメ調）
  | 'normal'       // 法線ベクトルを色で表示
  | 'depth'        // 深度を色で表示
  | 'wireframe';   // ワイヤーフレーム表示

/**
 * 色の表現方法
 * Three.jsで色を指定するための型
 * 例: '#FF0000', 'red', 0xFF0000, new THREE.Color(1, 0, 0)
 */
export type ColorInput = THREE.ColorRepresentation | string | number;

/**
 * 位置・回転・スケールの3D座標
 * Three.jsのVector3クラスと互換性のある3次元ベクトル型
 */
export interface Vector3Like {
  /** X軸座標（横軸） */
  x: number;
  /** Y軸座標（縦軸） */
  y: number;
  /** Z軸座標（奥行き軸） */
  z: number;
}

// ===========================================
// ジオメトリ設定の型定義
// ===========================================

/**
 * ボックスジオメトリの設定
 * 立方体・直方体を作成するためのパラメータ
 */
export interface BoxGeometryConfig {
  /** 幅（X軸方向のサイズ） デフォルト: 1 */
  width?: number;
  /** 高さ（Y軸方向のサイズ） デフォルト: 1 */
  height?: number;
  /** 奥行き（Z軸方向のサイズ） デフォルト: 1 */
  depth?: number;
  /** 幅方向の分割数 デフォルト: 1 */
  widthSegments?: number;
  /** 高さ方向の分割数 デフォルト: 1 */
  heightSegments?: number;
  /** 奥行き方向の分割数 デフォルト: 1 */
  depthSegments?: number;
}

/**
 * 球体ジオメトリの設定
 * 球体を作成するためのパラメータ
 */
export interface SphereGeometryConfig {
  /** 球の半径 デフォルト: 1 */
  radius?: number;
  /** 水平方向の分割数 デフォルト: 32 */
  widthSegments?: number;
  /** 垂直方向の分割数 デフォルト: 16 */
  heightSegments?: number;
  /** 水平方向の開始角度（ラジアン） デフォルト: 0 */
  phiStart?: number;
  /** 水平方向の角度範囲（ラジアン） デフォルト: Math.PI * 2 */
  phiLength?: number;
  /** 垂直方向の開始角度（ラジアン） デフォルト: 0 */
  thetaStart?: number;
  /** 垂直方向の角度範囲（ラジアン） デフォルト: Math.PI */
  thetaLength?: number;
}

/**
 * 円錐ジオメトリの設定
 * 円錐形状を作成するためのパラメータ
 */
export interface ConeGeometryConfig {
  /** 底面の半径 デフォルト: 1 */
  radius?: number;
  /** 円錐の高さ デフォルト: 1 */
  height?: number;
  /** 放射方向の分割数 デフォルト: 32 */
  radialSegments?: number;
  /** 高さ方向の分割数 デフォルト: 1 */
  heightSegments?: number;
  /** 底面を開くかどうか デフォルト: false */
  openEnded?: boolean;
  /** 開始角度（ラジアン） デフォルト: 0 */
  thetaStart?: number;
  /** 角度範囲（ラジアン） デフォルト: Math.PI * 2 */
  thetaLength?: number;
}

/**
 * 円柱ジオメトリの設定
 * 円柱形状を作成するためのパラメータ
 */
export interface CylinderGeometryConfig {
  /** 上面の半径 デフォルト: 1 */
  radiusTop?: number;
  /** 底面の半径 デフォルト: 1 */
  radiusBottom?: number;
  /** 円柱の高さ デフォルト: 1 */
  height?: number;
  /** 放射方向の分割数 デフォルト: 32 */
  radialSegments?: number;
  /** 高さ方向の分割数 デフォルト: 1 */
  heightSegments?: number;
  /** 上下面を開くかどうか デフォルト: false */
  openEnded?: boolean;
  /** 開始角度（ラジアン） デフォルト: 0 */
  thetaStart?: number;
  /** 角度範囲（ラジアン） デフォルト: Math.PI * 2 */
  thetaLength?: number;
}

/**
 * トーラスジオメトリの設定
 * ドーナツ型（トーラス）を作成するためのパラメータ
 */
export interface TorusGeometryConfig {
  /** トーラスのメイン半径（中心からチューブ中心まで） デフォルト: 1 */
  radius?: number;
  /** チューブの半径（太さ） デフォルト: 0.4 */
  tube?: number;
  /** 放射方向の分割数 デフォルト: 12 */
  radialSegments?: number;
  /** チューブ方向の分割数 デフォルト: 48 */
  tubularSegments?: number;
  /** トーラスの弧の角度（ラジアン） デフォルト: Math.PI * 2 */
  arc?: number;
}

/**
 * 平面ジオメトリの設定
 * 平面を作成するためのパラメータ
 */
export interface PlaneGeometryConfig {
  /** 幅（X軸方向のサイズ） デフォルト: 1 */
  width?: number;
  /** 高さ（Y軸方向のサイズ） デフォルト: 1 */
  height?: number;
  /** 幅方向の分割数 デフォルト: 1 */
  widthSegments?: number;
  /** 高さ方向の分割数 デフォルト: 1 */
  heightSegments?: number;
}

/**
 * リングジオメトリの設定
 * リング（環状）を作成するためのパラメータ
 */
export interface RingGeometryConfig {
  /** 内側の半径 デフォルト: 0.5 */
  innerRadius?: number;
  /** 外側の半径 デフォルト: 1 */
  outerRadius?: number;
  /** 角度方向の分割数 デフォルト: 32 */
  thetaSegments?: number;
  /** 放射方向の分割数 デフォルト: 1 */
  phiSegments?: number;
  /** 開始角度（ラジアン） デフォルト: 0 */
  thetaStart?: number;
  /** 角度範囲（ラジアン） デフォルト: Math.PI * 2 */
  thetaLength?: number;
}

/**
 * 円ジオメトリの設定
 * 円形を作成するためのパラメータ
 */
export interface CircleGeometryConfig {
  /** 円の半径 デフォルト: 1 */
  radius?: number;
  /** 円周上の分割数 デフォルト: 32 */
  segments?: number;
  /** 開始角度（ラジアン） デフォルト: 0 */
  thetaStart?: number;
  /** 角度範囲（ラジアン） デフォルト: Math.PI * 2 */
  thetaLength?: number;
}

/**
 * 多面体ジオメトリの共通設定
 * 正多面体（正十二面体、正二十面体など）のパラメータ
 */
export interface PolyhedronGeometryConfig {
  /** 多面体の半径 デフォルト: 1 */
  radius?: number;
  /** 細分化レベル（高いほど滑らか） デフォルト: 0 */
  detail?: number;
}

/**
 * 統合ジオメトリ設定型（Union Types使用）
 */
export type GeometryConfig = 
  | { type: 'box'; config: BoxGeometryConfig }
  | { type: 'sphere'; config: SphereGeometryConfig }
  | { type: 'cone'; config: ConeGeometryConfig }
  | { type: 'cylinder'; config: CylinderGeometryConfig }
  | { type: 'torus'; config: TorusGeometryConfig }
  | { type: 'plane'; config: PlaneGeometryConfig }
  | { type: 'ring'; config: RingGeometryConfig }
  | { type: 'circle'; config: CircleGeometryConfig }
  | { type: 'dodecahedron'; config: PolyhedronGeometryConfig }
  | { type: 'icosahedron'; config: PolyhedronGeometryConfig }
  | { type: 'octahedron'; config: PolyhedronGeometryConfig }
  | { type: 'tetrahedron'; config: PolyhedronGeometryConfig };

// ===========================================
// マテリアル設定の型定義
// ===========================================

/**
 * 基本マテリアル設定
 * 全てのマテリアルに共通する基本的なプロパティ
 */
export interface BaseMaterialConfig {
  /** マテリアルの色 デフォルト: 0xffffff (白) */
  color?: ColorInput;
  /** 透明度を有効にするか デフォルト: false */
  transparent?: boolean;
  /** 不透明度 (0.0-1.0) デフォルト: 1.0 */
  opacity?: number;
  /** オブジェクトを表示するか デフォルト: true */
  visible?: boolean;
  /** レンダリングする面 (FrontSide, BackSide, DoubleSide) デフォルト: FrontSide */
  side?: THREE.Side;
  /** ワイヤーフレーム表示にするか デフォルト: false */
  wireframe?: boolean;
}

/**
 * Lambert マテリアル設定
 * 拡散反射のみを考慮したライティングモデル
 */
export interface LambertMaterialConfig extends BaseMaterialConfig {
  /** 発光色 (ライティングに関係なく光る) デフォルト: 0x000000 (黒) */
  emissive?: ColorInput;
  /** 発光の強度 デフォルト: 1.0 */
  emissiveIntensity?: number;
  /** テクスチャマップ (色情報) */
  map?: THREE.Texture | null;
}

/**
 * Phong マテリアル設定
 * 拡散反射と鏡面反射を考慮したライティングモデル
 */
export interface PhongMaterialConfig extends LambertMaterialConfig {
  /** 鏡面反射色 (ハイライトの色) デフォルト: 0x111111 */
  specular?: ColorInput;
  /** 光沢度 (鏡面反射の鋭さ) デフォルト: 30 */
  shininess?: number;
}

/**
 * Standard マテリアル設定
 * PBR (Physically Based Rendering) モデルを使用したリアルなマテリアル
 */
export interface StandardMaterialConfig extends BaseMaterialConfig {
  /** 粗さ (0.0-1.0) 0=鏡面, 1=完全拡散 デフォルト: 1.0 */
  roughness?: number;
  /** 金属性 (0.0-1.0) 0=非金属, 1=金属 デフォルト: 0.0 */
  metalness?: number;
  /** 発光色 (ライティングに関係なく光る) デフォルト: 0x000000 (黒) */
  emissive?: ColorInput;
  /** 発光の強度 デフォルト: 1.0 */
  emissiveIntensity?: number;
  /** 環境マップの強度 デフォルト: 1.0 */
  envMapIntensity?: number;
  /** テクスチャマップ (色情報) */
  map?: THREE.Texture | null;
  /** 法線マップ (表面の凹凸情報) */
  normalMap?: THREE.Texture | null;
  /** 粗さマップ (粗さの空間変化) */
  roughnessMap?: THREE.Texture | null;
  /** 金属性マップ (金属性の空間変化) */
  metalnessMap?: THREE.Texture | null;
}

/**
 * 物理マテリアル設定（Standardの拡張版）
 * より高度なPBRマテリアル（クリアコート、透過など）
 */
export interface PhysicalMaterialConfig extends StandardMaterialConfig {
  /** クリアコート層の強度 (0.0-1.0) デフォルト: 0.0 */
  clearcoat?: number;
  /** クリアコート層の粗さ (0.0-1.0) デフォルト: 0.0 */
  clearcoatRoughness?: number;
  /** 透過度 (0.0-1.0) ガラスのような透明度 デフォルト: 0.0 */
  transmission?: number;
  /** 材質の厚み（透過計算に使用） デフォルト: 0.01 */
  thickness?: number;
}

/**
 * 統合マテリアル設定型
 */
export type MaterialConfig = 
  | { type: 'basic'; config: BaseMaterialConfig }
  | { type: 'lambert'; config: LambertMaterialConfig }
  | { type: 'phong'; config: PhongMaterialConfig }
  | { type: 'standard'; config: StandardMaterialConfig }
  | { type: 'physical'; config: PhysicalMaterialConfig }
  | { type: 'toon'; config: BaseMaterialConfig }
  | { type: 'normal'; config: BaseMaterialConfig }
  | { type: 'depth'; config: BaseMaterialConfig }
  | { type: 'wireframe'; config: BaseMaterialConfig };

// ===========================================
// メッシュオブジェクト関連の型
// ===========================================

/**
 * 3Dオブジェクトの変換情報
 * 位置、回転、スケールを統合した変換パラメータ
 */
export interface Transform {
  /** 3D空間内の位置 (x, y, z) */
  position?: Partial<Vector3Like>;
  /** 各軸周りの回転角度 (ラジアン) */
  rotation?: Partial<Vector3Like>;
  /** 各軸の拡大縮小率 (1.0 = 等倍) */
  scale?: Partial<Vector3Like>;
}

/**
 * アニメーション設定
 * オブジェクトの動的な変化を定義するパラメータ
 */
export interface AnimationConfig {
  /** アニメーションを有効にするか */
  enabled: boolean;
  /** 各軸周りの回転速度 (ラジアン/秒) */
  rotation?: Partial<Vector3Like>;
  /** 位置の振動アニメーション */
  position?: {
    /** 振動の振幅 */
    amplitude?: number;
    /** 振動の周波数 (Hz) */
    frequency?: number;
    /** 振動する軸 */
    axis?: 'x' | 'y' | 'z';
  };
  /** スケールの周期的変化 */
  scale?: {
    /** 最小スケール */
    min?: number;
    /** 最大スケール */
    max?: number;
    /** スケール変化の周波数 (Hz) */
    frequency?: number;
  };
}

/**
 * 3Dオブジェクトの完全な設定
 * ジオメトリ、マテリアル、変換、アニメーションを統合した設定
 */
export interface ObjectConfig {
  /** ジオメトリ（形状）の設定 */
  geometry: GeometryConfig;
  /** マテリアル（材質）の設定 */
  material: MaterialConfig;
  /** 初期の変換状態（位置、回転、スケール） */
  transform?: Transform;
  /** アニメーションの設定 */
  animation?: AnimationConfig;
  /** オブジェクトの名前（デバッグや管理用） */
  name?: string;
  /** カスタムデータを格納するオブジェクト */
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
  T extends 'ring' ? THREE.RingGeometry :
  T extends 'circle' ? THREE.CircleGeometry :
  T extends 'dodecahedron' ? THREE.DodecahedronGeometry :
  T extends 'icosahedron' ? THREE.IcosahedronGeometry :
  T extends 'octahedron' ? THREE.OctahedronGeometry :
  T extends 'tetrahedron' ? THREE.TetrahedronGeometry :
  THREE.BufferGeometry;

/**
 * 型安全なマテリアルファクトリーの戻り値型
 */
export type MaterialInstance<T extends MaterialType> = 
  T extends 'basic' ? THREE.MeshBasicMaterial :
  T extends 'lambert' ? THREE.MeshLambertMaterial :
  T extends 'phong' ? THREE.MeshPhongMaterial :
  T extends 'standard' ? THREE.MeshStandardMaterial :
  T extends 'physical' ? THREE.MeshPhysicalMaterial :
  T extends 'toon' ? THREE.MeshToonMaterial :
  T extends 'normal' ? THREE.MeshNormalMaterial :
  T extends 'depth' ? THREE.MeshDepthMaterial :
  T extends 'wireframe' ? THREE.MeshBasicMaterial :
  THREE.Material;

/**
 * 必須フィールドを持つ型を作成するユーティリティ型
 * 指定したプロパティを必須にし、他はオプショナルのままにする
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * 部分的に必須フィールドを持つオブジェクト設定型
 * geometryとmaterialを必須にしたObjectConfig
 */
export type RequiredObjectConfig = RequiredFields<ObjectConfig, 'geometry' | 'material'>;

// ===========================================
// イベント関連の型定義
// ===========================================

/**
 * マウスイベントの情報
 * マウス操作に関する情報をまとめた型
 */
export interface MouseEventInfo {
  /** スクリーン座標系でのマウス位置 */
  position: THREE.Vector2;
  /** 正規化された座標 (-1 〜 1) */
  normalized: THREE.Vector2;
  /** クリックされた3Dオブジェクト (レイキャスト結果) */
  target?: THREE.Object3D;
}

/**
 * インタラクションイベントのコールバック型
 * マウスイベントが発生した時に呼び出される関数の型
 */
export type InteractionCallback = (info: MouseEventInfo) => void;

/**
 * イベントハンドラーのマップ
 * 3Dオブジェクトに登録できるイベントハンドラーの組み合わせ
 */
export interface EventHandlers {
  /** クリック時のコールバック */
  onClick?: InteractionCallback;
  /** ホバー時のコールバック */
  onHover?: InteractionCallback;
  /** マウス移動時のコールバック */
  onMouseMove?: InteractionCallback;
}

// ===========================================
// パフォーマンス関連の型定義
// ===========================================

/**
 * レンダリング統計情報
 * レンダリングパフォーマンスの監視に使用するメトリクス
 */
export interface RenderStats {
  /** 1秒あたりのフレーム数 (Frames Per Second) */
  fps: number;
  /** 1フレームの描画時間 (ミリ秒) */
  frameTime: number;
  /** 描画された三角形の数 */
  triangles: number;
  /** 描画された頂点の数 */
  vertices: number;
  /** GPUへの描画呼び出し回数 */
  drawCalls: number;
  /** メモリ使用量情報 */
  memory: {
    /** ジオメトリが使用するメモリ量 (MB) */
    geometries: number;
    /** テクスチャが使用するメモリ量 (MB) */
    textures: number;
    /** マテリアルが使用するメモリ量 (MB) */
    materials: number;
  };
}

/**
 * パフォーマンスモニターのコールバック
 * レンダリング統計が更新された時に呼び出される関数の型
 */
export type PerformanceCallback = (stats: RenderStats) => void;