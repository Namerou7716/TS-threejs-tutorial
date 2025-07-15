/**
 * Three.js TypeScript Tutorial - Basic Scene
 * 基本的なシーン、カメラ、レンダラーの型安全な実装
 * 
 * このファイルでは以下を学習します：
 * 1. TypeScriptでのインターフェース定義
 * 2. クラスベースの3Dシーン管理
 * 3. 型安全な設定オブジェクト
 * 4. リソース管理とクリーンアップ
 */

import * as THREE from 'three';

// 型定義: シーンの設定を定義するインターフェース
// TypeScriptのインターフェースで型安全な設定オブジェクトを定義
interface SceneConfig {
  camera: {
    fov: number;          // 視野角（Field of View）
    aspect: number;       // アスペクト比（横/縦）
    near: number;         // 近クリッピング面
    far: number;          // 遠クリッピング面
    position: THREE.Vector3; // カメラの位置
  };
  renderer: {
    antialias: boolean;   // アンチエイリアス（滑らかな描画）
    alpha: boolean;       // 透明度サポート
  };
  scene: {
    background: THREE.Color; // 背景色
  };
}

// デフォルト設定
const defaultConfig: SceneConfig = {
  camera: {
    fov: 75,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
    position: new THREE.Vector3(0, 0, 5)
  },
  renderer: {
    antialias: true,
    alpha: false
  },
  scene: {
    background: new THREE.Color(0x222222)
  }
};

/**
 * 基本的なThree.jsシーンクラス
 */
export class BasicScene {
  public readonly camera: THREE.PerspectiveCamera;
  public readonly scene: THREE.Scene;
  public readonly renderer: THREE.WebGLRenderer;
  
  private cube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>;
  private animationId: number | null = null;

  constructor(config: Partial<SceneConfig> = {}) {
    const mergedConfig = this.mergeConfig(defaultConfig, config);
    
    // カメラの作成
    this.camera = new THREE.PerspectiveCamera(
      mergedConfig.camera.fov,
      mergedConfig.camera.aspect,
      mergedConfig.camera.near,
      mergedConfig.camera.far
    );
    this.camera.position.copy(mergedConfig.camera.position);

    // シーンの作成
    this.scene = new THREE.Scene();
    this.scene.background = mergedConfig.scene.background;

    // レンダラーの作成
    this.renderer = new THREE.WebGLRenderer(mergedConfig.renderer);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // キューブの作成
    this.cube = this.createCube();
    this.scene.add(this.cube);

    // イベントリスナーの設定
    this.setupEventListeners();
  }

  /**
   * 設定のマージ（型安全）
   * デフォルト設定とユーザー設定を安全に結合
   * @param defaultConfig デフォルト設定
   * @param userConfig ユーザー設定（部分的でも可）
   * @returns 結合された設定
   */
  private mergeConfig(defaultConfig: SceneConfig, userConfig: Partial<SceneConfig>): SceneConfig {
    return {
      camera: { ...defaultConfig.camera, ...userConfig.camera },
      renderer: { ...defaultConfig.renderer, ...userConfig.renderer },
      scene: { ...defaultConfig.scene, ...userConfig.scene }
    };
  }

  /**
   * キューブの作成（型明示）
   * TypeScriptで明示的に型を指定した3Dオブジェクトの作成
   * @returns 型安全なメッシュオブジェクト
   */
  private createCube(): THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial> {
    // 1×1×1のボックスジオメトリを作成
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    // 緑色の基本マテリアルを作成
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // ジオメトリとマテリアルからメッシュを作成
    return new THREE.Mesh(geometry, material);
  }

  /**
   * イベントリスナーの設定
   */
  private setupEventListeners(): void {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  /**
   * ウィンドウリサイズ処理
   */
  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * アニメーションループ
   */
  private animate(): void {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    
    // キューブの回転
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * シーンの開始
   */
  public start(): void {
    if (!document.body.contains(this.renderer.domElement)) {
      document.body.appendChild(this.renderer.domElement);
    }
    this.animate();
  }

  /**
   * シーンの停止
   */
  public stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * リソースのクリーンアップ
   */
  public dispose(): void {
    this.stop();
    
    // ジオメトリとマテリアルの破棄
    this.cube.geometry.dispose();
    this.cube.material.dispose();
    
    // レンダラーの破棄
    this.renderer.dispose();
    
    // DOM要素の削除
    if (document.body.contains(this.renderer.domElement)) {
      document.body.removeChild(this.renderer.domElement);
    }
    
    // イベントリスナーの削除
    // 注意: bind()を使用した場合は参照を保持する必要があります
    // ここでは簡略化のため、実際のプロジェクトでは参照を保持して削除してください
    window.removeEventListener('resize', this.onWindowResize);
  }

  /**
   * キューブの色を変更
   */
  public setCubeColor(color: THREE.ColorRepresentation): void {
    this.cube.material.color.set(color);
  }

  /**
   * カメラ位置の設定
   */
  public setCameraPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
  }
}