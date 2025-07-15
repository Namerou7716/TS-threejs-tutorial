/**
 * Three.js TypeScript Tutorial - 03. Advanced Scene Manager
 *
 * このファイルでは、プロフェッショナルな開発で用いられる高度な設計パターンを学びます。
 * - Abstract Class（抽象クラス）: クラスの共通の骨格を定義します。
 * - Mixin（ミックスイン）: クラスに機能を追加・合成します。
 * - Builder（ビルダー）: 複雑なオブジェクトの生成過程を整理します。
 * - Decorator（デコレータ）: オブジェクトに動的に機能を追加します。
 *
 * これらのパターンを組み合わせることで、非常に柔軟で、拡張しやすく、
 * 保守性の高いアプリケーションアーキテクチャを構築できます。
 */

import * as THREE from 'three';
// 型定義は別のファイルからインポートすると、より整理されます。
import type { EventHandlers, RenderStats, PerformanceCallback } from '../types/geometry-types';

// ===================================================================
// Part 1: Abstract Base Class (抽象基底クラス)
// 目的: 全てのシーン管理クラスが従うべき「設計図」を定義する。
// ===================================================================

/**
 * シーン管理の「抽象基底クラス」。
 * `abstract`が付いているため、このクラス自体はインスタンス化(new)できません。
 * 必ずこのクラスを「継承」して使用します。
 */
export abstract class AbstractSceneManager {
  // protected: このクラスと、これを継承したクラス内でのみアクセス可能
  protected camera!: THREE.Camera;
  protected scene!: THREE.Scene;
  protected renderer!: THREE.WebGLRenderer;
  protected clock = new THREE.Clock();
  private animationId: number | null = null;
  
  // --- 抽象メソッド (Abstract Methods) ---
  // 処理の具体的な内容は定義せず、メソッド名と引数・戻り値の型だけを定義します。
  // このクラスを継承するクラスは、これらのメソッドを必ず実装しなければなりません。
  
  /** シーンにオブジェクトを配置し、初期設定を行う */
  protected abstract initializeScene(): void;
  /** シーンにライトを配置する */
  protected abstract setupLighting(): void;
  /** 毎フレーム実行される更新処理 */
  protected abstract updateScene(deltaTime: number): void;
  
  // --- テンプレートメソッド (Template Method) ---
  // 処理の「流れ」や「骨格」を定義するメソッド。
  
  /**
   * 初期化処理の全体の流れを定義します。
   * 具体的な処理は抽象メソッドに任せますが、呼び出す順番はここで保証します。
   */
  public initialize(): void {
    this.initializeScene();
    this.setupLighting();
    this.setupEventListeners();
  }
  
  // --- 共通メソッド (Common Methods) ---
  // どの継承クラスでも共通して使える具体的な処理を実装します。

  protected setupEventListeners(): void {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  
  protected onWindowResize(): void {
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  public start(): void {
    if (!this.animationId) this.animate();
  }
  
  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  private animate(): void {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    const deltaTime = this.clock.getDelta();
    this.updateScene(deltaTime); // 継承先で実装された更新処理を呼び出す
    this.renderer.render(this.scene, this.camera);
  }
  
  public dispose(): void { /* ...リソース解放処理... */ }
}

// ===================================================================
// Part 2: Mixins (ミックスイン)
// 目的: クラスに、後から機能の「部品」を「混ぜ込む(Mix-in)」
//       TypeScriptでは、クラスを返す関数として実装するのが一般的です。
// ===================================================================

// 型エイリアス: コンストラクタを持つクラスの型を定義
type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * マウス操作機能を提供する「インタラクション・ミックスイン」。
 * @param Base 継承元となるクラス（`AbstractSceneManager`を継承している必要がある）
 * @returns マウス操作機能が追加された新しいクラス
 */
export function InteractableMixin<TBase extends Constructor<AbstractSceneManager>>(Base: TBase) {
  return class extends Base {
    public raycaster = new THREE.Raycaster();
    public mouse = new THREE.Vector2();
    public eventHandlers: EventHandlers = {};
    
    public setupInteraction(): void { /* ...イベントリスナー設定... */ }
    public handleMouseEvent(event: MouseEvent, type: keyof EventHandlers): void { /* ...マウスイベント処理... */ }
    public setEventHandler(type: keyof EventHandlers, handler: any): void { /* ...ハンドラ設定... */ }
  };
}

/**
 * パフォーマンス計測機能を提供する「パフォーマンスモニター・ミックスイン」。
 */
export function PerformanceMonitorMixin<TBase extends Constructor<AbstractSceneManager>>(Base: TBase) {
  return class extends Base {
    private performanceCallback?: PerformanceCallback;
    private frameCount = 0;
    private lastTime = performance.now();
    
    public setPerformanceCallback(callback: PerformanceCallback): void { /* ... */ }
    protected updatePerformanceStats(): void { /* ...パフォーマンス計算とコールバック実行... */ }
    private getTriangleCount(): number { /* ... */ return 0; }
    private getVertexCount(): number { /* ... */ return 0; }
  };
}

// ===================================================================
// Part 3: Concrete Implementation Class (具象実装クラス)
// 目的: 抽象クラスを継承し、ミックスインを適用して、具体的な機能を持つクラスを作成する。
// ===================================================================

/**
 * インタラクティブな3Dシーンマネージャー。
 * `AbstractSceneManager`を継承し、`InteractableMixin`と`PerformanceMonitorMixin`の機能を併せ持つ。
 */
export class InteractiveSceneManager extends PerformanceMonitorMixin(InteractableMixin(AbstractSceneManager)) {
  private objects: THREE.Mesh[] = [];
  private selectedObject: THREE.Mesh | null = null;
  
  // --- 抽象メソッドの実装 (Implementation of Abstract Methods) ---
  // `AbstractSceneManager`で定義された抽象メソッドを、ここで具体的に実装します。

  protected initializeScene(): void {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1a);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }
  
  protected setupLighting(): void {
    this.scene.add(new THREE.AmbientLight(0x404040, 0.3));
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(10, 10, 5);
    this.scene.add(light);
  }
  
  protected updateScene(deltaTime: number): void {
    const time = this.clock.getElapsedTime();
    this.objects.forEach((obj, i) => {
      obj.rotation.y = time * 0.5 + i * 0.15;
    });
    this.updatePerformanceStats(); // PerformanceMonitorMixinから来たメソッド
  }
  
  // --- メソッドのオーバーライドと拡張 ---
  public initialize(): void {
    super.initialize(); // まず親(AbstractSceneManager)のinitializeを実行
    this.setupInteraction(); // 次にMixin(InteractableMixin)の機能で初期化を拡張
    
    // クリックイベントの具体的な処理を定義
    this.setEventHandler('onClick', (info) => {
      if (info.target instanceof THREE.Mesh) this.selectObject(info.target);
    });
  }
  
  // --- このクラス独自のメソッド ---
  private selectObject(mesh: THREE.Mesh): void { /* ...選択処理... */ }
  private highlightObject(mesh: THREE.Mesh, highlight: boolean): void { /* ...ハイライト処理... */ }
  public addObject(mesh: THREE.Mesh): void { /* ...オブジェクト追加処理... */ }
  public removeSelectedObject(): void { /* ...オブジェクト削除処理... */ }
}

// ===================================================================
// Part 4: Builder Pattern (ビルダーパターン)
// 目的: 複雑なオブジェクトの生成過程を、ステップ・バイ・ステップのメソッドチェーンで表現する。
// ===================================================================

/**
 * `InteractiveSceneManager`のインスタンスを構築するためのビルダークラス。
 */
export class SceneManagerBuilder {
  private manager: InteractiveSceneManager;

  constructor() {
    this.manager = new InteractiveSceneManager();
  }

  /** 背景色を設定する */
  public withBackgroundColor(color: number): this {
    this.manager.scene.background = new THREE.Color(color);
    return this; // `this`を返すことでメソッドチェーン (`.with...().with...()`) を可能にする
  }

  /** カメラ位置を設定する */
  public withCameraPosition(x: number, y: number, z: number): this {
    this.manager.camera.position.set(x, y, z);
    return this;
  }

  /** パフォーマンス監視を設定する */
  public withPerformanceMonitoring(callback: PerformanceCallback): this {
    this.manager.setPerformanceCallback(callback);
    return this;
  }

  /**
   * 全ての設定を適用し、最終的な`InteractiveSceneManager`インスタンスを返す。
   */
  public build(): InteractiveSceneManager {
    this.manager.initialize();
    return this.manager;
  }
}

// ===================================================================
// Part 5: Decorator Pattern (デコレータパターン)
// 目的: 既存のオブジェクトの機能を変更せずに、新しい機能（責任）を動的に「飾り付け」する。
// ===================================================================

/**
 * `InteractiveSceneManager`にデバッグ機能を追加するデコレータクラス。
 */
export class DebugSceneDecorator {
  // 装飾対象のインスタンスをコンストラクタで受け取る
  constructor(private sceneManager: InteractiveSceneManager) {}

  /** ワイヤーフレーム表示を有効にする */
  public enableWireframeMode(): void {
    this.sceneManager.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
        child.material.wireframe = true;
      }
    });
  }

  /** 座標軸ヘルパーを追加する */
  public addAxesHelper(size: number = 5): void {
    this.sceneManager.scene.add(new THREE.AxesHelper(size));
  }
}
