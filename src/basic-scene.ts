/**
 * Three.js TypeScript Tutorial - 01. Basic Scene
 * 
 * このファイルは、Three.jsで最も基本的な3Dシーンを構築し、
 * それをTypeScriptの「クラス」として整理する方法を学びます。
 * クラスにまとめることで、コードが再利用しやすく、管理しやすくなります。
 */

import * as THREE from 'three';

/**
 * カメラ設定のインターフェース
 * Three.jsのPerspectiveCameraを作成するために必要な設定項目を定義します。
 */
interface CameraConfig {
  /** 視野角（度）: カメラが見る範囲の角度。75度は一般的な値 */
  fov: number;
  /** アスペクト比: 通常は画面の幅/高さ */
  aspect: number;
  /** 近クリッピング面: カメラに映る最も手前の距離 */
  near: number;
  /** 遠クリッピング面: カメラに映る最も遠い距離 */
  far: number;
  /** カメラの3D空間での位置 */
  position: THREE.Vector3;
}

/**
 * レンダラー設定のインターフェース
 * WebGLRendererの初期化に必要な設定項目を定義します。
 */
interface RendererConfig {
  /** アンチエイリアス: 輪郭のギザギザを滑らかにするか */
  antialias: boolean;
  /** アルファチャンネル: 背景を透明にするか */
  alpha: boolean;
}

/**
 * シーン設定のインターフェース
 * Three.jsのSceneの初期化に必要な設定項目を定義します。
 */
interface SceneObjectConfig {
  /** シーンの背景色 */
  background: THREE.Color;
}

/**
 * BasicSceneクラス全体の設定インターフェース
 * すべての設定項目をまとめたトップレベルの設定です。
 */
interface SceneConfig {
  camera: CameraConfig;
  renderer: RendererConfig;
  scene: SceneObjectConfig;
}

/**
 * デフォルト設定値
 * ユーザーが設定を省略した場合に使用される標準的な値です。
 */
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
    background: new THREE.Color(0x000000) // 黒色の背景
  }
};

/**
 * 基本的なThree.jsシーンを管理するクラス。
 * シーン、カメラ、レンダラーといった基本要素と、それらを操作するロジックを一つにまとめます。
 */
export class BasicScene {
  public readonly camera: THREE.PerspectiveCamera;
  public readonly scene: THREE.Scene;
  public readonly renderer: THREE.WebGLRenderer;
  private cube: THREE.Mesh;
  private animationId: number | null = null;

  constructor(config: Partial<SceneConfig> = {}) {
    const mergedConfig = this.mergeConfig(defaultConfig, config);
    
    // --- コア要素の初期化 ---
    // 1. カメラを作成
    // new THREE.PerspectiveCamera(fov, aspect, near, far): 遠近感のあるカメラを作成
    // fov: 視野角, aspect: アスペクト比, near: 描画開始距離, far: 描画終了距離
    this.camera = new THREE.PerspectiveCamera(
      mergedConfig.camera.fov,
      mergedConfig.camera.aspect,
      mergedConfig.camera.near,
      mergedConfig.camera.far
    );
    // camera.position.copy(vector): カメラの位置をVector3オブジェクトで設定
    this.camera.position.copy(mergedConfig.camera.position);

    // 2. シーンを作成
    // new THREE.Scene(): 3Dオブジェクトやライトを配置する空間を作成
    this.scene = new THREE.Scene();
    // scene.background: シーンの背景色をTHREE.Colorで設定
    this.scene.background = mergedConfig.scene.background;

    // 3. レンダラーを作成
    // new THREE.WebGLRenderer({ antialias: ... }): WebGLで3Dシーンを描画するレンダラーを作成
    this.renderer = new THREE.WebGLRenderer(mergedConfig.renderer);
    // renderer.setPixelRatio(): デバイスのピクセル比を設定し、高解像度ディスプレイで鮮明に表示
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.setSize(): レンダラーの描画サイズをブラウザのウィンドウサイズに設定
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // --- オブジェクトの作成 ---
    this.cube = this.createCube();
    // scene.add(object): 作成したオブジェクトをシーンに追加。これで描画対象になる。
    this.scene.add(this.cube);

    this.setupEventListeners();
  }

  private mergeConfig(defaultConfig: SceneConfig, userConfig: Partial<SceneConfig>): SceneConfig {
    return {
      camera: { ...defaultConfig.camera, ...userConfig.camera },
      renderer: { ...defaultConfig.renderer, ...userConfig.renderer },
      scene: { ...defaultConfig.scene, ...userConfig.scene }
    };
  }

  private createCube(): THREE.Mesh {
    // new THREE.BoxGeometry(width, height, depth): 幅、高さ、奥行きを指定して立方体の「形状」を作成
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    // new THREE.MeshBasicMaterial({ color: ... }): 光源の影響を受けない最もシンプルな「材質」を作成
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // new THREE.Mesh(geometry, material): 「形状」と「材質」を組み合わせて3Dオブジェクト（メッシュ）を作成
    return new THREE.Mesh(geometry, material);
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    // camera.updateProjectionMatrix(): カメラのプロパティ（視野角、アスペクト比など）を変更した後に、
    // 変更を反映させるために必ず呼び出す必要がある。
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate(): void {
    // requestAnimationFrame(callback): ブラウザに次の描画タイミングでコールバックを実行するように要求する。
    // これにより、スムーズなアニメーションループが実現される。
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    
    // object.rotation.x/y/z: オブジェクトの各軸周りの回転角度（ラジアン単位）
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;

    // renderer.render(scene, camera): 指定されたシーンを、指定されたカメラの視点から描画する。
    // この処理が毎フレーム実行されることで、アニメーションとして見える。
    this.renderer.render(this.scene, this.camera);
  }

  public start(): void {
    // renderer.domElement: レンダラーが描画を行うためのcanvas要素。
    // これをHTMLのbodyに追加することで、画面に表示される。
    if (!document.body.contains(this.renderer.domElement)) {
      document.body.appendChild(this.renderer.domElement);
    }
    this.animate();
  }

  public stop(): void {
    if (this.animationId !== null) {
      // cancelAnimationFrame(id): requestAnimationFrameで予約されたコールバックをキャンセルする。
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public dispose(): void {
    this.stop();
    
    // scene.traverse(callback): シーン内の全ての子オブジェクトに対してコールバックを実行する。
    this.scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
            // geometry.dispose(): ジオメトリがGPUに確保したメモリを解放する。
            object.geometry.dispose();
            // material.dispose(): マテリアル（と関連するテクスチャなど）が確保したメモリを解放する。
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
        }
    });
    
    // renderer.dispose(): レンダラーが使用しているWebGLコンテキストとリソースを解放する。
    this.renderer.dispose();
    
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }

  public setCubeColor(color: THREE.ColorRepresentation): void {
    // material.color.set(color): マテリアルの色を新しい色に設定する。
    if (this.cube.material instanceof THREE.MeshBasicMaterial) {
      this.cube.material.color.set(color);
    }
  }

  public setCameraPosition(x: number, y: number, z: number): void {
    // object.position.set(x, y, z): オブジェクトの位置を一度に設定する。
    this.camera.position.set(x, y, z);
  }
}