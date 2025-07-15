/**
 * Three.js TypeScript Tutorial - 01. Basic Scene
 * 
 * このファイルは、Three.jsで最も基本的な3Dシーンを構築し、
 * それをTypeScriptの「クラス」として整理する方法を学びます。
 * クラスにまとめることで、コードが再利用しやすく、管理しやすくなります。
 */

import * as THREE from 'three';

// --- 型定義 --- 
// シーンに必要な設定を「インターフェース」として定義します。
// これにより、設定オブジェクトの形が統一され、型ミスを防ぎます。
interface SceneConfig {
  camera: {
    fov: number;          // 視野角（数値が小さいほどズームイン）
    aspect: number;       // アスペクト比（通常はブラウザの幅 / 高さ）
    near: number;         // カメラに映る一番手前の距離
    far: number;          // カメラに映る一番奥の距離
    position: THREE.Vector3; // カメラの3D空間における位置
  };
  renderer: {
    antialias: boolean;   // アンチエイリアスを有効にするか（trueで物体の輪郭が滑らかに）
    alpha: boolean;       // 背景を透過させるか
  };
  scene: {
    background: THREE.Color; // シーンの背景色
  };
}

// --- デフォルト設定 ---
// ユーザーが設定を省略した場合に使用される、標準的な設定値です。
const defaultConfig: SceneConfig = {
  camera: {
    fov: 75,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
    position: new THREE.Vector3(0, 0, 5) // Z軸方向に5の位置から原点を見る
  },
  renderer: {
    antialias: true,
    alpha: false
  },
  scene: {
    background: new THREE.Color(0x222222) // 暗いグレー
  }
};

/**
 * 基本的なThree.jsシーンを管理するクラス。
 * シーン、カメラ、レンダラーといった基本要素と、それらを操作するロジックを一つにまとめます。
 */
export class BasicScene {
  // --- publicプロパティ：クラスの外部から参照可能 ---
  public readonly camera: THREE.PerspectiveCamera; // 3D空間を写すカメラ
  public readonly scene: THREE.Scene;             // 3Dオブジェクトを配置する舞台
  public readonly renderer: THREE.WebGLRenderer;    // 実際にブラウザに描画するレンダラー
  
  // --- privateプロパティ：クラスの内部でのみ使用 ---
  private cube: THREE.Mesh; // シーンに表示する立方体オブジェクト
  private animationId: number | null = null; // アニメーションループのID

  /**
   * コンストラクタ：`new BasicScene()`でインスタンスが作成されるときに実行される初期化処理です。
   * @param config ユーザーが指定するカスタム設定（省略可能）
   */
  constructor(config: Partial<SceneConfig> = {}) {
    // ユーザー設定とデフォルト設定を安全にマージ（統合）する
    const mergedConfig = this.mergeConfig(defaultConfig, config);
    
    // --- コア要素の初期化 ---
    // 1. カメラを作成
    this.camera = new THREE.PerspectiveCamera(
      mergedConfig.camera.fov,
      mergedConfig.camera.aspect,
      mergedConfig.camera.near,
      mergedConfig.camera.far
    );
    this.camera.position.copy(mergedConfig.camera.position);

    // 2. シーンを作成
    this.scene = new THREE.Scene();
    this.scene.background = mergedConfig.scene.background;

    // 3. レンダラーを作成
    this.renderer = new THREE.WebGLRenderer(mergedConfig.renderer);
    this.renderer.setPixelRatio(window.devicePixelRatio); // デバイスの解像度に合わせて綺麗に表示
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // --- オブジェクトの作成 ---
    this.cube = this.createCube();
    this.scene.add(this.cube); // 作成したキューブをシーンに追加

    // --- イベントリスナーの設定 ---
    this.setupEventListeners();
  }

  /**
   * ユーザー設定とデフォルト設定をマージするプライベートメソッド。
   * @param defaultConfig 基本となるデフォルト設定
   * @param userConfig ユーザーが指定したカスタム設定
   * @returns マージ後の完全な設定オブジェクト
   */
  private mergeConfig(defaultConfig: SceneConfig, userConfig: Partial<SceneConfig>): SceneConfig {
    // スプレッド構文(...)を使って、ネストされたオブジェクトも安全にマージする
    return {
      camera: { ...defaultConfig.camera, ...userConfig.camera },
      renderer: { ...defaultConfig.renderer, ...userConfig.renderer },
      scene: { ...defaultConfig.scene, ...userConfig.scene }
    };
  }

  /**
   * シーンに表示するキューブを作成するプライベートメソッド。
   * @returns 作成されたキューブのMeshオブジェクト
   */
  private createCube(): THREE.Mesh {
    // Geometry: オブジェクトの「形状」を定義するデータ（例：立方体、球体）
    const geometry = new THREE.BoxGeometry(1, 1, 1); // 幅1, 高さ1, 奥行き1の立方体の形状
    // Material: オブジェクトの「材質」を定義するデータ（例：色、質感）
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // 緑色のシンプルな材質
    // Mesh: GeometryとMaterialを組み合わせた、実際にシーンに表示される3Dオブジェクト
    return new THREE.Mesh(geometry, material);
  }

  /**
   * イベントリスナー（ユーザーの操作やブラウザの状態変化を待つ仕組み）を設定します。
   */
  private setupEventListeners(): void {
    // ウィンドウサイズが変更された時に`onWindowResize`メソッドを呼ぶように設定
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  /**
   * ウィンドウリサイズ時に実行される処理です。
   */
  private onWindowResize(): void {
    // カメラのアスペクト比を現在のウィンドウサイズに合わせて更新
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix(); // カメラのプロパティ変更を適用するために必要

    // レンダラーの描画サイズもウィンドウサイズに合わせる
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * アニメーションループ。毎フレームこの中の処理が実行されます。
   */
  private animate(): void {
    // `requestAnimationFrame`にこのメソッド自身を渡すことで、ループ処理を実現する
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    
    // キューブを少しずつ回転させる
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;

    // 現在のシーンとカメラの状態をレンダラーに描画させる
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * シーンを開始し、アニメーションループをスタートさせます。
   */
  public start(): void {
    // レンダラーのDOM要素(canvas)がまだHTMLに追加されていなければ追加する
    if (!document.body.contains(this.renderer.domElement)) {
      document.body.appendChild(this.renderer.domElement);
    }
    // アニメーションを開始
    this.animate();
  }

  /**
   * アニメーションループを停止します。
   */
  public stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * シーンを破棄し、メモリを解放します。
   * アプリケーション終了時などに呼び出すことで、メモリリークを防ぎます。
   */
  public dispose(): void {
    this.stop();
    
    // シーン内のオブジェクトが使用しているメモリを解放
    this.scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            // マテリアルが配列の場合も考慮
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
        }
    });
    
    // レンダラーが使用しているリソースを解放
    this.renderer.dispose();
    
    // HTMLからcanvas要素を削除
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    
    // イベントリスナーを削除
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }

  // --- ユーティリティメソッド --- 

  /**
   * キューブの色を外部から変更するためのメソッド。
   * @param color 新しい色（例: 0xff0000 や 'red'）
   */
  public setCubeColor(color: THREE.ColorRepresentation): void {
    this.cube.material.color.set(color);
  }

  /**
   * カメラの位置を外部から設定するためのメソッド。
   */
  public setCameraPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
  }
}
