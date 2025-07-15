# 03. クラスベースの高度なシーン設計パターン

## 📖 この章のゴール

この章では、プロフェッショナルな現場で使われる高度な「設計パターン」を学び、**大規模で、保守しやすく、拡張性の高い**3Dアプリケーションのアーキテクチャを構築します。TypeScriptのオブジェクト指向機能を最大限に活用し、より堅牢なコードを目指します。

具体的には、以下の設計パターンを実践的に学びます。

-   **抽象クラスと継承:** クラスの「設計図」を作り、共通の骨格を定義します。
-   **Mixins（ミックスイン）パターン:** 必要な「機能」をパーツのようにクラスに組み込みます。
-   **Decorator（デコレータ）パターン:** 既存のオブジェクトを「飾り付け」して、動的に機能を追加します。
-   **Builder（ビルダー）パターン:** 複雑なオブジェクトの組み立て工程を、分かりやすく整理します。

---

### 用語集：この章で登場する主なThree.js API

この章では、Three.jsの基本的なAPIに加えて、より高度なインタラクションやデバッグに役立つAPIが登場します。

-   **`THREE.Clock`**: 時間を管理するためのヘルパークラスです。アニメーションの経過時間を正確に計測し、デバイスの性能（フレームレート）に依存しないスムーズなアニメーションを実現するために使用します。
    -   `getElapsedTime()`: `Clock`が作成されてからの総経過時間を秒単位で返します。
    -   `getDelta()`: 前回の`.getDelta()`呼び出しからの経過時間を秒単位で返します。これにより、フレーム間の正確な時間差を取得できます。
-   **`THREE.Raycaster`**: マウスカーソルなどの2D座標から3D空間に「光線（レイ）」を飛ばし、そのレイがどのオブジェクトと交差したかを検出します。オブジェクトのクリック判定やホバーエフェクトなど、インタラクションの実装に不可欠です。
-   **`scene.traverse((child) => { ... })`**: シーン内のすべての子オブジェクト（およびそのまた子オブジェクト）に対して、指定したコールバック関数を再帰的に実行します。例えば、全てのメッシュのマテリアルを一度に変更する、といった操作に便利です。
-   **`material.emissive`**: マテリアルの自己発光色です。この色を設定すると、ライトが当たっていなくてもその色で光っているように見えます。オブジェクトを選択した際のハイライト表現などによく使われます。
-   **`THREE.AxesHelper`**: 3D空間のX軸（赤）、Y軸（緑）、Z軸（青）を可視化するヘルパーオブジェクトです。オブジェクトの位置や向きを確認する際のデバッグに非常に役立ちます。
-   **`THREE.GridHelper`**: 3D空間上にグリッド（方眼紙）を表示するヘルパーオブジェクトです。オブジェクトの配置やスケール感を把握するのに役立ちます。

---

## 🏗️ アーキテクチャ概要：目指す全体像

この章では、以下の設計パターンを組み合わせ、柔軟で強力な3Dアプリケーションのアーキテクチャを構築します。それぞれのパターンがどのように連携し、全体としてどのような役割を果たすのかを理解することが重要です。

1.  **`AbstractSceneManager` (抽象クラス):** 全てのシーン管理クラスが従うべき基本ルール（初期化、アニメーションループなど）を定義した「大本の設計図」です。共通の処理フローを強制し、コードの一貫性を保ちます。
2.  **`InteractableMixin`, `PerformanceMonitorMixin` (ミックスイン):** 「マウス操作機能」や「パフォーマンス計測機能」といった独立した機能を、必要なクラスに後から「混ぜ込む」ための部品です。これにより、クラスの機能を柔軟に拡張できます。
3.  **`InteractiveSceneManager` (具象クラス):** 抽象クラスを継承し、ミックスインを組み込むことで、具体的で高機能なシーン管理クラスを実装します。これがアプリケーションの主要なシーン管理を担います。
4.  **`SceneManagerBuilder` (ビルダー):** `InteractiveSceneManager`の複雑な初期設定を、メソッドチェーンで直感的に行えるようにする補助クラスです。設定の可読性と安全性を高めます。
5.  **`DebugSceneDecorator` (デコレータ):** 完成した`InteractiveSceneManager`のインスタンスに、後から「デバッグ用の表示機能」などを動的に追加するパターンです。既存のコードを変更せずに機能を追加できます。

---

## 🎭 パターン1: 抽象クラス (Abstract Class)

**目的:** 複数のクラスに共通する「骨格」や「処理の流れ（テンプレート）」を定義し、コードの重複をなくし、一貫性を強制します。

### `AbstractSceneManager` の設計

`abstract`キーワードを使って、全てのシーン管理クラスの基盤となる抽象クラスを定義します。このクラスは、それ自体を`new`することはできません。あくまで継承されるための「設計図」であり、共通のプロパティやメソッド、そして継承先で必ず実装すべき抽象メソッドを定義します。

`src/scenes/AbstractSceneManager.ts`というファイルを作成し、以下のコードを記述してください。

```typescript
// src/scenes/AbstractSceneManager.ts - シーン管理の抽象基底クラス
import * as THREE from 'three';

/**
 * シーン管理の「抽象基底クラス」。
 * `abstract`が付いているため、このクラス自体はインスタンス化(new)できません。
 * 必ずこのクラスを「継承」して使用します。
 */
export abstract class AbstractSceneManager {
  // protected: このクラスと、これを継承したクラス内でのみアクセス可能
  protected camera!: THREE.Camera; // シーンのカメラ
  protected scene!: THREE.Scene;   // 3Dオブジェクトを配置するシーン
  protected renderer!: THREE.WebGLRenderer; // シーンを描画するレンダラー
  
  // `new THREE.Clock()`: 時間を管理するヘルパーです。アニメーションの経過時間などを正確に計測するのに使います。
  protected clock = new THREE.Clock();
  private animationId: number | null = null; // `requestAnimationFrame`のID。アニメーションの停止に使う。
  
  // --- 抽象メソッド (Abstract Methods) ---
  // 処理の具体的な内容は定義せず、メソッド名と引数・戻り値の型だけを定義します。
  // このクラスを継承するクラスは、これらのメソッドを必ず実装しなければなりません。
  
  /** シーンにオブジェクトを配置し、初期設定を行う */
  protected abstract initializeScene(): void;
  /** ライティングを設定する */
  protected abstract setupLighting(): void;
  /** 毎フレーム実行される更新処理 */
  protected abstract updateScene(deltaTime: number): void;
  
  // --- テンプレートメソッド (Template Method) ---
  // 処理の「流れ」や「骨格」を定義するメソッドです。
  // 具体的な処理（`initializeScene`など）は継承先に任せますが、呼び出す順番はここで保証します。
  
  /**
   * シーンの初期化処理の全体の流れを定義します。
   * このメソッドを呼び出すことで、シーンが正しくセットアップされます。
   */
  public initialize(): void {
    this.initializeScene();    // (1) シーンのオブジェクト配置や初期設定
    this.setupLighting();      // (2) ライティングの設定
    this.setupEventListeners(); // (3) イベントリスナーの設定（共通処理）
    console.log("Scene initialized according to the template.");
  }
  
  // --- 共通メソッド (Common Methods) ---
  // どの継承クラスでも共通して使える具体的な処理を実装します。

  protected setupEventListeners(): void {
    // ウィンドウリサイズイベントを監視し、`onWindowResize`メソッドを呼び出すように設定します。
    // `bind(this)`を使うことで、`onWindowResize`が呼び出された際に`this`がこのクラスのインスタンスを指すようにします。
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  
  protected onWindowResize(): void {
    // カメラが`PerspectiveCamera`の場合、アスペクト比を更新し、投影行列を再計算します。
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
    // レンダラーのサイズをウィンドウサイズに合わせて更新します。
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  /**
   * アニメーションループを開始します。
   */
  public start(): void {
    if (this.animationId === null) {
      this.animate();
    }
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
   * 内部アニメーションループ。毎フレーム実行されます。
   */
  private animate(): void {
    // `requestAnimationFrame(callback)`: ブラウザの次の描画タイミングで指定したコールバック関数を実行するように要求します。
    // これを再帰的に呼び出すことで、ブラウザの描画サイクルに合わせたスムーズなアニメーションループが実現されます。
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    
    // `clock.getDelta()`: 前回の`getDelta()`呼び出しからの経過時間（秒）を取得します。
    // これをアニメーション計算に使うことで、フレームレートが変動しても動きの速度を一定に保てます。
    const deltaTime = this.clock.getDelta();
    
    // 継承先で実装された`updateScene`メソッドを呼び出し、シーンの更新を行います。
    this.updateScene(deltaTime);
    
    // シーンをレンダリングします。
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * シーンを破棄し、使用していたリソースを解放します。
   */
  public dispose(): void {
    this.stop(); // アニメーションを停止
    
    // `scene.traverse((child) => { ... })`: シーン内の全ての子オブジェクト（およびそのまた子オブジェクト）に対して、
    // 指定したコールバック関数を再帰的に実行します。ここでは、各メッシュのジオメトリとマテリアルを解放しています。
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    // レンダラーが使用しているWebGLコンテキストとリソースを解放します。メモリリークを防ぐために重要です。
    this.renderer.dispose();
    // HTMLからレンダラーのDOM要素（canvas）を削除します。
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    // イベントリスナーを削除します。
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }
}
```

**ここでの学び:**
-   **抽象クラスの役割:** `AbstractSceneManager`は、シーン管理クラスの「あるべき姿」を定義し、共通の処理フロー（テンプレートメソッドパターン）を強制します。これにより、コードの一貫性が保たれ、新しいシーンを作成する際のガイドラインとなります。
-   **`THREE.Clock`の活用:** `getDelta()`メソッドを使うことで、アニメーションの速度をフレームレートに依存させず、どの環境でも同じ速度で動くように制御できることを学びました。
-   **リソース解放の重要性:** `dispose()`メソッド内で`scene.traverse()`を使って全てのオブジェクトのリソースを解放し、`renderer.dispose()`でWebGLリソースを解放することの重要性を再確認しました。これはメモリリークを防ぐ上で不可欠な処理です。

---

## 🧩 パターン2: ミックスイン (Mixin)

**目的:** クラスに、多重継承のように複数の「機能」を合成（ミックス）します。TypeScriptでは、クラスを返す関数として実装するのが一般的です。これにより、クラスの機能を柔軟に拡張し、単一責任の原則を保ちやすくなります。

### インタラクション機能のミックスイン

マウス操作（クリック、ホバー）を処理する機能を、独立したミックスインとして定義します。これにより、任意のシーン管理クラスにインタラクション機能を追加できるようになります。

`src/mixins/InteractableMixin.ts`というファイルを作成し、以下のコードを記述してください。

```typescript
// src/mixins/InteractableMixin.ts - マウス操作機能を提供するミックスイン
import * as THREE from 'three';
import { AbstractSceneManager } from '../scenes/AbstractSceneManager';
import type { EventHandlers, MouseEventInfo } from '../types/geometry-types'; // 型定義をインポート

// 型エイリアス: コンストラクタを持つクラスの型を定義します。
type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * マウス操作機能を提供するミックスイン関数。
 * この関数は、`AbstractSceneManager`を継承したクラスを受け取り、
 * マウス操作機能を追加した新しいクラスを返します。
 * 
 * @param Base 継承元となるクラス（`AbstractSceneManager`を継承している必要がある）
 * @returns マウス操作機能が追加された新しいクラス
 */
export function InteractableMixin<TBase extends Constructor<AbstractSceneManager>>(
  Base: TBase
) {
  // 無名クラスを返し、Baseクラスを継承します。
  return class extends Base {
    // `new THREE.Raycaster()`: 3D空間に光線（レイ）を飛ばしてオブジェクトとの交差を検出するクラスです。
    // マウスでのオブジェクト選択（ピッキング）に不可欠なツールです。
    public raycaster = new THREE.Raycaster();
    // `new THREE.Vector2()`: マウスの2D座標（x, y）を保持するオブジェクトです。
    public mouse = new THREE.Vector2();
    // イベントハンドラを格納するオブジェクト。キーはイベント名、値はコールバック関数。
    public eventHandlers: EventHandlers = {};
    
    /**
     * インタラクション機能の初期化。レンダラーのDOM要素にイベントリスナーを設定します。
     */
    public setupInteraction(): void {
      this.renderer.domElement.addEventListener('click', (e) => 
        this.handleMouseEvent(e, 'onClick')
      );
      this.renderer.domElement.addEventListener('mousemove', (e) => 
        this.handleMouseEvent(e, 'onMouseMove')
      );
    }
    
    /**
     * マウスイベントを処理し、交差したオブジェクトに対してコールバックを実行するプライベートメソッド。
     * @param event ブラウザのマウスイベントオブジェクト
     * @param type 呼び出すイベントハンドラのタイプ（'onClick'など）
     */
    protected handleMouseEvent(event: MouseEvent, type: keyof EventHandlers): void {
      const rect = this.renderer.domElement.getBoundingClientRect();
      
      // マウス座標を正規化（-1 〜 1の範囲）します。
      // Three.jsのRaycasterは、この正規化されたデバイス座標（NDC）を使用します。
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // `raycaster.setFromCamera(mouseCoords, camera)`:
      // カメラの視点から、正規化されたマウス座標に向かって光線（レイ）を設定します。
      this.raycaster.setFromCamera(this.mouse, this.camera);
      // `raycaster.intersectObjects(objects, recursive)`:
      // 設定された光線と、指定したオブジェクトの配列（ここではシーン内の全ての子オブジェクト）との交差を検出します。
      // `true`を指定すると、子オブジェクトも再帰的にチェックします。
      // 交差したオブジェクトは、カメラからの距離が近い順に配列として返されます。
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);
      
      // イベントハンドラが存在し、かつオブジェクトと交差した場合にコールバックを実行します。
      const handler = this.eventHandlers[type];
      if (handler && intersects.length > 0) {
        handler({
          position: new THREE.Vector2(event.clientX, event.clientY),
          normalized: this.mouse.clone(),
          target: intersects[0].object // 交差した最初のオブジェクト（最も近いオブジェクト）
        } as MouseEventInfo); // 型アサーション
      }
    }
    
    /**
     * 特定のイベントタイプに対するハンドラを設定します。
     * @param type イベントタイプ（'onClick', 'onHover'など）
     * @param handler 実行するコールバック関数
     */
    public setEventHandler(
      type: keyof EventHandlers, 
      handler: EventHandlers[typeof type]
    ): void {
      this.eventHandlers[type] = handler;
    }
  };
}
```

**ここでの学び:**
-   **ミックスインの仕組み:** クラスを返す関数としてミックスインを実装することで、TypeScriptで多重継承のような機能合成を実現できることを学びました。これにより、`AbstractSceneManager`の機能を汚染することなく、インタラクション機能を追加できます。
-   **`THREE.Raycaster`の活用:** マウスの2D座標を3D空間の光線に変換し、オブジェクトとの交差を検出する`Raycaster`の基本的な使い方を理解しました。これは、3Dシーンにおけるユーザーインタラクションの基盤となります。
-   **正規化されたデバイス座標 (NDC):** `Raycaster`が`-1`から`1`の範囲の正規化された座標を使用すること、そしてブラウザのイベント座標からこれを計算する方法を学びました。

### パフォーマンス監視のミックスイン

シーンのパフォーマンス（FPS、描画統計など）を監視する機能も、独立したミックスインとして定義できます。これにより、パフォーマンス監視が必要なシーンにのみこの機能を追加できるようになります。

`src/mixins/PerformanceMonitorMixin.ts`というファイルを作成し、以下のコードを記述してください。

```typescript
// src/mixins/PerformanceMonitorMixin.ts - パフォーマンス監視機能を提供するミックスイン
import * as THREE from 'three';
import { AbstractSceneManager } from '../scenes/AbstractSceneManager';
import type { RenderStats, PerformanceCallback } from '../types/geometry-types'; // 型定義をインポート

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * パフォーマンスモニタリング機能を提供するミックスイン関数。
 * @param Base 継承元となるクラス
 * @returns パフォーマンス監視機能が追加された新しいクラス
 */
export function PerformanceMonitorMixin<TBase extends Constructor<AbstractSceneManager>>(
  Base: TBase
) {
  return class extends Base {
    private performanceCallback?: PerformanceCallback; // パフォーマンス統計を通知するコールバック
    private frameCount = 0; // フレーム数カウンター
    private lastTime = performance.now(); // 前回の計測時刻
    
    /**
     * パフォーマンス統計を通知するコールバック関数を設定します。
     * @param callback 統計情報を受け取る関数
     */
    public setPerformanceCallback(callback: PerformanceCallback): void {
      this.performanceCallback = callback;
    }
    
    /**
     * 毎フレーム呼び出され、パフォーマンス統計を更新します。
     * 1秒ごとに統計情報を計算し、設定されたコールバックに通知します。
     */
    protected updatePerformanceStats(): void {
      this.frameCount++;
      const currentTime = performance.now();
      
      // 1秒ごとに統計を更新します。
      if (currentTime - this.lastTime >= 1000) {
        const stats: RenderStats = {
          fps: this.frameCount, // 1秒間のフレーム数
          frameTime: (currentTime - this.lastTime) / this.frameCount, // 1フレームあたりの平均時間
          triangles: this.getTriangleCount(), // シーン内の総三角形数
          vertices: this.getVertexCount(),   // シーン内の総頂点数
          drawCalls: this.renderer.info.render.calls, // 描画呼び出し回数
          memory: {
            geometries: this.renderer.info.memory.geometries, // ジオメトリのメモリ使用量
            textures: this.renderer.info.memory.textures,     // テクスチャのメモリ使用量
            materials: 0 // Three.jsはマテリアル数を直接提供しないため、ここでは0
          }
        };
        
        // 設定されたコールバックがあれば、統計情報を通知します。
        this.performanceCallback?.(stats);
        this.frameCount = 0;
        this.lastTime = currentTime;
      }
    }
    
    /**
     * シーン内の全てのメッシュの三角形数を計算します。
     * @returns 総三角形数
     */
    private getTriangleCount(): number {
      let count = 0;
      // `this.scene.traverse()`: シーン内の全ての子オブジェクトを再帰的に走査します。
      this.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const geometry = child.geometry;
          // ジオメトリがインデックスを持つ場合（ほとんどのジオメトリ）
          if (geometry.index) {
            count += geometry.index.count / 3; // 3つのインデックスで1つの三角形
          } else {
            // インデックスを持たない場合（例: Points）
            count += geometry.attributes.position.count / 3; // 3つの頂点で1つの三角形
          }
        }
      });
      return count;
    }
    
    /**
     * シーン内の全てのメッシュの頂点数を計算します。
     * @returns 総頂点数
     */
    private getVertexCount(): number {
      let count = 0;
      this.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          count += child.geometry.attributes.position.count;
        }
      });
      return count;
    }
  };
}
```

**ここでの学び:**
-   **パフォーマンス監視の重要性:** 3Dアプリケーションでは、FPS（フレームレート）やメモリ使用量といったパフォーマンス指標を監視することが非常に重要です。これにより、最適化のボトルネックを特定し、ユーザー体験を向上させることができます。
-   **`renderer.info`の活用:** Three.jsのレンダラーは、`renderer.info`プロパティを通じて、描画呼び出し回数やメモリ使用量など、様々なパフォーマンス統計情報を提供していることを学びました。
-   **`scene.traverse()`の再利用:** `getTriangleCount()`や`getVertexCount()`のように、シーン内の全オブジェクトを走査して情報を集める際に`scene.traverse()`が非常に便利であることを再確認しました。

---

## 🏛️ 具象クラス：抽象クラスとミックスインの結合

これまでに定義した`AbstractSceneManager`（抽象クラス）を継承し、`InteractableMixin`と`PerformanceMonitorMixin`を適用することで、具体的な機能を持つシーン管理クラス`InteractiveSceneManager`を実装します。このクラスが、アプリケーションの主要なシーン管理を担います。

`src/scenes/InteractiveSceneManager.ts`というファイルを作成し、以下のコードを記述してください。

```typescript
// src/scenes/InteractiveSceneManager.ts - インタラクティブな3Dシーンマネージャー
import * as THREE from 'three';
import { AbstractSceneManager } from './AbstractSceneManager';
import { InteractableMixin } from '../mixins/InteractableMixin';
import { PerformanceMonitorMixin } from '../mixins/PerformanceMonitorMixin';

// 1. ミックスインを適用した基底クラスを作成します。
//    `PerformanceMonitorMixin`が`InteractableMixin`を適用したクラスを継承し、
//    その結果として得られるクラスが`AbstractSceneManager`を継承します。
const SceneWithInteraction = InteractableMixin(AbstractSceneManager);
const SceneWithPerformance = PerformanceMonitorMixin(SceneWithInteraction);

/**
 * インタラクティブな3Dシーンマネージャー。
 * `AbstractSceneManager`を継承し、`InteractableMixin`と`PerformanceMonitorMixin`の機能を併せ持つことで、
 * マウス操作やパフォーマンス監視が可能な高機能なシーン管理を実現します。
 */
export class InteractiveSceneManager extends SceneWithPerformance {
  private objects: THREE.Mesh[] = []; // シーン内のオブジェクトを管理する配列
  private selectedObject: THREE.Mesh | null = null; // 現在選択されているオブジェクト
  
  // --- 抽象メソッドの実装 (Implementation of Abstract Methods) ---
  // `AbstractSceneManager`で定義された抽象メソッドを、ここで具体的に実装します。

  /**
   * シーンの初期設定（カメラ、シーン、レンダラーの初期化）を行います。
   */
  protected initializeScene(): void {
    // カメラの設定
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(5, 5, 5);
    // `camera.lookAt(vector)`: カメラを指定した`THREE.Vector3`の座標の方向に向ける。
    // ここでは原点(0,0,0)を向かせています。
    this.camera.lookAt(0, 0, 0);
    
    // シーンの設定
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1a); // 暗い青色の背景
    
    // レンダラーの設定
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);
  }
  
  /**
   * ライティングの設定を行います。
   */
  protected setupLighting(): void {
    // 環境光: シーン全体を均一に照らす
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);
    
    // 指向性ライト: 太陽光のように特定の方向から照らす。影を落とすことができる。
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    
    // ポイントライト: 特定の点から全方向に光を放つ。
    const pointLight = new THREE.PointLight(0x00aaff, 0.6, 50);
    pointLight.position.set(-5, 5, -5);
    this.scene.add(pointLight);
  }
  
  /**
   * 毎フレーム実行されるシーンの更新処理。
   * オブジェクトのアニメーションやパフォーマンス統計の更新を行います。
   * @param deltaTime 前のフレームからの経過時間
   */
  protected updateScene(deltaTime: number): void {
    // `clock.getElapsedTime()`: `THREE.Clock`のインスタンスが作られてからの総経過時間を返します。
    // これをアニメーションの基準時間として使うことで、オブジェクトの動きを同期させることができます。
    const time = this.clock.getElapsedTime();
    
    // シーン内のオブジェクトをアニメーションさせます。
    this.objects.forEach((obj, i) => {
      obj.rotation.y = time * 0.5 + i * 0.15; // Y軸周りに回転
      obj.position.y = Math.sin(time + i) * 0.5; // 上下に揺れる動き
    });
    
    // パフォーマンス統計を更新します（`PerformanceMonitorMixin`から継承したメソッド）。
    this.updatePerformanceStats();
  }
  
  // --- メソッドのオーバーライドと拡張 ---
  /**
   * `AbstractSceneManager`の`initialize`メソッドをオーバーライドし、
   * ミックスインによって追加されたインタラクション機能を有効化します。
   */
  public initialize(): void {
    super.initialize(); // 親クラス(`AbstractSceneManager`)の`initialize`を実行します。
    this.setupInteraction(); // `InteractableMixin`によって追加されたメソッドを呼び出し、インタラクション機能を有効化します。
    
    // マウスクリック時の具体的な処理を定義します。
    this.setEventHandler('onClick', (info) => {
      if (info.target instanceof THREE.Mesh) {
        this.selectObject(info.target);
      }
    });
    
    // マウスホバー時の処理を定義します。
    this.setEventHandler('onHover', (info) => {
      // オブジェクトにホバーしている場合はカーソルを`pointer`に、そうでない場合は`default`に戻します。
      document.body.style.cursor = info.target ? 'pointer' : 'default';
    });
  }
  
  // --- このクラス独自のメソッド ---
  /**
   * オブジェクトを選択するプライベートメソッド。
   * 選択されたオブジェクトをハイライト表示します。
   * @param mesh 選択された`THREE.Mesh`インスタンス
   */
  private selectObject(mesh: THREE.Mesh): void {
    // 前に選択されていたオブジェクトがあれば、ハイライトを解除します。
    if (this.selectedObject) {
      this.highlightObject(this.selectedObject, false);
    }
    
    // 新しいオブジェクトを選択し、ハイライト表示します。
    this.selectedObject = mesh;
    this.highlightObject(mesh, true);
    
    console.log('Selected object:', mesh.name || 'Unnamed');
  }
  
  /**
   * オブジェクトをハイライト表示するプライベートメソッド。
   * `material.emissive`プロパティを使って、オブジェクトが光っているように見せます。
   * @param mesh ハイライトする`THREE.Mesh`インスタンス
   * @param highlight `true`ならハイライト、`false`なら解除
   */
  private highlightObject(mesh: THREE.Mesh, highlight: boolean): void {
    // ハイライト時の自己発光色を設定します。
    const emissiveColor = highlight ? 0x444444 : 0x000000;
    
    // マテリアルが配列の場合と単一の場合で処理を分けます。
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(material => {
        // `material.emissive.setHex(color)`: マテリアルの自己発光色を設定します。
        // ライトの影響とは無関係に、マテリアル自体がその色で発光しているように見えます。
        // オブジェクトの選択状態を示すハイライトとしてよく利用されます。
        if (this.isMaterialWithEmissive(material)) {
          material.emissive.setHex(emissiveColor);
        }
      });
    } else {
      const material = mesh.material;
      if (this.isMaterialWithEmissive(material)) {
        material.emissive.setHex(emissiveColor);
      }
    }
  }
  
  /**
   * マテリアルが`emissive`プロパティを持つかどうかの型ガード関数。
   * これにより、`emissive`プロパティに安全にアクセスできます。
   */
  private isMaterialWithEmissive(
    material: THREE.Material
  ): material is THREE.MeshLambertMaterial | THREE.MeshPhongMaterial | THREE.MeshStandardMaterial {
    return 'emissive' in material;
  }
  
  /**
   * シーンに`THREE.Mesh`オブジェクトを追加します。
   * @param mesh 追加する`THREE.Mesh`インスタンス
   */
  public addObject(mesh: THREE.Mesh): void {
    // 影を落とし、影を受け取るように設定します。
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.objects.push(mesh);
  }
  
  /**
   * 現在選択されているオブジェクトをシーンから削除します。
   */
  public removeSelectedObject(): void {
    if (!this.selectedObject) return;
    
    this.scene.remove(this.selectedObject);
    // メモリリークを防ぐため、ジオメトリとマテリアルを解放します。
    this.selectedObject.geometry.dispose();
    if (Array.isArray(this.selectedObject.material)) {
      this.selectedObject.material.forEach(material => material.dispose());
    } else {
      this.selectedObject.material.dispose();
    }
    
    // 管理配列から削除します。
    const index = this.objects.indexOf(this.selectedObject);
    if (index > -1) {
      this.objects.splice(index, 1);
    }
    
    this.selectedObject = null;
  }
  
  /**
   * シーン内の全てのオブジェクトをクリアします。
   */
  public clearAllObjects(): void {
    this.objects.forEach(obj => {
      this.scene.remove(obj);
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach(material => material.dispose());
      } else {
        obj.material.dispose();
      }
    });
    
    this.objects = [];
    this.selectedObject = null;
  }
  
  /**
   * シーン内のオブジェクト数を取得します。
   */
  public getObjectCount(): number {
    return this.objects.length;
  }
  
  /**
   * 現在選択されているオブジェクトを取得します。
   */
  public getSelectedObject(): THREE.Mesh | null {
    return this.selectedObject;
  }
}

---

## 🏗️ パターン3: ビルダー (Builder)

**目的:** 複雑なオブジェクトの生成プロセスを、ステップ・バイ・ステップのメソッドチェーンで表現し、可読性と安全性を向上させます。特に、多くのオプションを持つオブジェクトを作成する際に有効です。

`src/builders/SceneManagerBuilder.ts`というファイルを作成し、以下のコードを記述してください。

```typescript
// src/builders/SceneManagerBuilder.ts - シーンマネージャーのビルダークラス
import * as THREE from 'three';
import { InteractiveSceneManager } from '../scenes/InteractiveSceneManager';
import type { PerformanceCallback } from '../types/geometry-types'; // 型定義をインポート

/**
 * `InteractiveSceneManager`のインスタンスを構築するためのビルダークラス。
 * メソッドチェーンを使って、複雑な設定を段階的に適用できます。
 */
export class SceneManagerBuilder {
  private manager: InteractiveSceneManager; // 構築中のシーンマネージャーインスタンス
  private initializers: (() => void)[] = []; // initialize後に実行する処理を保持

  constructor() {
    this.manager = new InteractiveSceneManager();
  }

  /**
   * シーンの背景色を設定します。
   * @param color 背景色（16進数）
   * @returns ビルダーインスタンス自身（メソッドチェーンのため）
   */
  public withBackgroundColor(color: number): this {
    // initializeが完了するのを待つ必要があるため、処理をキューに格納します。
    this.initializers.push(() => {
        this.manager.scene.background = new THREE.Color(color);
    });
    return this; // `this`を返すことでメソッドチェーン (`.with...().with...()`) を可能にします。
  }

  /**
   * カメラの位置を設定します。
   * @param x X座標
   * @param y Y座標
   * @param z Z座標
   * @returns ビルダーインスタンス自身
   */
  public withCameraPosition(x: number, y: number, z: number): this {
    this.initializers.push(() => {
        this.manager.camera.position.set(x, y, z);
    });
    return this;
  }

  /**
   * パフォーマンス監視機能を有効にし、コールバックを設定します。
   * @param callback パフォーマンス統計を受け取る関数
   * @returns ビルダーインスタンス自身
   */
  public withPerformanceMonitoring(callback: PerformanceCallback): this {
    this.initializers.push(() => {
        this.manager.setPerformanceCallback(callback);
    });
    return this;
  }

  /**
   * 全ての設定を適用し、最終的な`InteractiveSceneManager`インスタンスを返します。
   * このメソッドを呼び出すことで、構築プロセスが完了します。
   * @returns 構築された`InteractiveSceneManager`インスタンス
   */
  public build(): InteractiveSceneManager {
    this.manager.initialize(); // シーンマネージャーを初期化
    // キューに格納された初期化処理を実行します。
    this.initializers.forEach(init => init());
    return this.manager;
  }
}
```

**ここでの学び:**
-   **ビルダーパターンの利点:** コンストラクタの引数が多くなるのを防ぎ、どんな設定でオブジェクトが作られるのかが一目瞭然になります。メソッドチェーンを使うことで、設定の順序を意識しやすく、非常に可読性の高いコードになります。
-   **段階的な構築:** `build()`メソッドが呼ばれるまで実際の初期化処理を遅延させることで、柔軟な設定が可能になります。

---

## 🎨 パターン4: デコレータ (Decorator)

**目的:** 既存のオブジェクトの機能を変更せずに、新しい責任（機能）を動的に追加します。オブジェクトを別のクラスで「包む（ラップする）」ことで実現します。これにより、元のクラスのコードを汚染することなく、機能を追加・削除できます。

`src/decorators/DebugSceneDecorator.ts`というファイルを作成し、以下のコードを記述してください。

```typescript
// src/decorators/DebugSceneDecorator.ts - シーンマネージャーにデバッグ機能を追加するデコレータ
import * as THREE from 'three';
import { InteractiveSceneManager } from '../scenes/InteractiveSceneManager';

/**
 * シーンマネージャーにデバッグ機能を追加する「デコレータ」クラス。
 * `InteractiveSceneManager`のインスタンスをラップし、デバッグ用のヘルパーを追加します。
 */
export class DebugSceneDecorator {
  // デコレート（装飾）対象のインスタンスをコンストラクタで受け取り、プライベートプロパティとして保持します。
  constructor(private sceneManager: InteractiveSceneManager) {}
  
  /**
   * シーン内の全てのメッシュをワイヤーフレーム表示に切り替えます。
   */
  public enableWireframeMode(): void {
    // `this.sceneManager.scene.traverse((child) => { ... })`:
    // ラップしているシーンマネージャーのシーン内の全ての子オブジェクトを再帰的に走査します。
    this.sceneManager.scene.traverse((child) => {
      // オブジェクトがメッシュであり、かつマテリアルを持っている場合
      if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
        // `material.wireframe = true`: マテリアルをワイヤーフレーム表示に設定します。
        child.material.wireframe = true;
      }
    });
  }
  
  /**
   * 3D空間の座標軸（X, Y, Z）を可視化するヘルパーを追加します。
   * @param size 軸の長さ
   */
  public addAxesHelper(size: number = 5): void {
    // `new THREE.AxesHelper(size)`: 3D空間のX(赤), Y(緑), Z(青)の軸を可視化するヘルパーを作成します。
    // オブジェクトの配置や回転を確認する際のデバッグに非常に役立ちます。
    const axesHelper = new THREE.AxesHelper(size);
    this.sceneManager.scene.add(axesHelper);
  }
  
  /**
   * 3D空間にグリッド（方眼紙）を可視化するヘルパーを追加します。
   * @param size グリッドのサイズ
   * @param divisions グリッドの分割数
   */
  public addGridHelper(size: number = 10, divisions: number = 10): void {
    // `new THREE.GridHelper(size, divisions)`: グリッド（方眼紙）を可視化するヘルパーを作成します。
    // オブジェクトの配置やスケール感の把握に役立ちます。
    const gridHelper = new THREE.GridHelper(size, divisions);
    this.sceneManager.scene.add(gridHelper);
  }
}
```

**ここでの学び:**
-   **デコレータパターンの利点:** 元のクラスのコードを一切変更することなく、機能を追加できるのが最大の利点です。特に、デバッグ機能のように、開発時にだけ必要で、本番環境では不要な機能を分離するのに非常に有効です。
-   **Three.jsのデバッグヘルパー:** `THREE.AxesHelper`や`THREE.GridHelper`といったツールが、3Dシーンの開発をいかに効率化するかを学びました。

---

## 💡 総合的な使用例

これまでに学んだ高度な設計パターンを組み合わせて、実際のアプリケーションでどのように利用するかを見てみましょう。これにより、各パターンがどのように連携し、より大規模で管理しやすいコードベースを構築するのかを理解できます。

```typescript
// main.ts (またはアプリケーションのエントリポイント)
import * as THREE from 'three';
import { SceneManagerBuilder } from './builders/SceneManagerBuilder';
import { TypedObjectFactory } from './typed-geometry-factory'; // 前の章で作成したファクトリー
import { DebugSceneDecorator } from './decorators/DebugSceneDecorator';

// 1. ビルダーパターンを使ってシーンマネージャーを構築します。
//    メソッドチェーンで、背景色、カメラ位置、パフォーマンス監視などの初期設定を直感的に行えます。
const sceneManager = new SceneManagerBuilder()
  .withBackgroundColor(0x001122) // 暗い青色の背景
  .withCameraPosition(8, 6, 8)   // カメラを特定の場所に配置
  .withPerformanceMonitoring((stats) => {
    // パフォーマンス統計が更新されるたびにコンソールに出力
    console.log('Performance Stats:', stats);
    // 必要であれば、HTML要素にFPSなどを表示することもできます
    // document.getElementById('fps-display').textContent = `FPS: ${stats.fps}`;
  })
  .build(); // 構築プロセスを完了し、設定済みのシーンマネージャーインスタンスを取得

// 2. オブジェクトの追加（前の章で作成したファクトリーパターンと組み合わせます）。
//    ファクトリーを使うことで、複雑なオブジェクトもシンプルな設定で作成できます。
const objects = [
  TypedObjectFactory.createMesh({
    geometry: { type: 'box', config: { width: 1, height: 1, depth: 1 } },
    material: { type: 'standard', config: { color: 0xff0000, roughness: 0.5 } },
    transform: { position: { x: -2, y: 0, z: 0 } },
    name: 'RedBox'
  }),
  TypedObjectFactory.createMesh({
    geometry: { type: 'sphere', config: { radius: 0.8 } },
    material: { type: 'standard', config: { color: 0x00ff00, metalness: 0.7 } },
    transform: { position: { x: 0, y: 0, z: 0 } },
    name: 'GreenSphere'
  }),
  TypedObjectFactory.createMesh({
    geometry: { type: 'cone', config: { radius: 0.6, height: 1.2 } },
    material: { type: 'standard', config: { color: 0x0000ff, roughness: 0.3 } },
    transform: { position: { x: 2, y: 0, z: 0 } },
    name: 'BlueCone'
  })
];

// 作成したオブジェクトをシーンマネージャーに追加します。
objects.forEach(obj => sceneManager.addObject(obj));

// 3. デコレータパターンを使って、シーンマネージャーにデバッグ機能を追加します。
//    既存の`sceneManager`インスタンスを`DebugSceneDecorator`でラップすることで、
//    元のコードを変更せずにデバッグ用のヘルパーを追加できます。
const debugDecorator = new DebugSceneDecorator(sceneManager);
debugDecorator.addAxesHelper(3); // 座標軸ヘルパーを追加
debugDecorator.addGridHelper(10, 10); // グリッドヘルパーを追加

// 4. シーンのアニメーションを開始します。
sceneManager.start();

// 5. (オプション) 開発環境でのみワイヤーフレーム表示を有効にする例
//    `process.env.NODE_ENV`はViteなどのビルドツールによって設定されます。
if (process.env.NODE_ENV === 'development') {
  debugDecorator.enableWireframeMode();
  // debugDecorator.showBoundingBoxes(); // 必要であればバウンディングボックスも表示
}

console.log(`
=== 高度な設計パターンデモ ===
- ビルダーパターンでシーンを構築
- ファクトリーパターンでオブジェクトを生成
- デコレータパターンでデバッグヘルパーを追加
- マウスでオブジェクトをクリックするとハイライトされます。
- パフォーマンス統計がコンソールに出力されます。
`);
```

**ここでの学び:**
-   **パターン間の連携:** 抽象クラス、ミックスイン、ビルダー、デコレータといった異なる設計パターンが、どのように連携して一つのアプリケーションを構築するのかを具体的に学びました。
-   **コードの整理と拡張性:** 各パターンがコードの特定の側面（共通の骨格、機能の追加、オブジェクトの生成、デバッグ機能など）を担当することで、コードが整理され、将来の機能追加や変更が容易になることを実感しました。
-   **プロフェッショナルな開発:** これらの設計パターンは、大規模なプロジェクトやチーム開発において、コードの品質、保守性、拡張性を高めるために不可欠な知識です。

---

## 🎓 まとめ: 高度な設計パターンによる恩恵

この章では、TypeScriptのオブジェクト指向機能を活用した4つの高度な設計パターンを学びました。

1.  **抽象クラス:** コードの共通基盤を固め、一貫性を保ちます。これにより、新しいシーン管理クラスを作成する際の「型」が提供されます。
2.  **ミックスイン:** 必要な機能を柔軟に組み合わせ、クラスの肥大化を防ぎます。例えば、インタラクション機能やパフォーマンス監視機能を、必要なクラスにだけ「混ぜ込む」ことができます。
3.  **ビルダー:** 複雑な初期化処理を分かりやすく、直感的にします。多くの設定オプションを持つオブジェクトを、メソッドチェーンで段階的に構築できるため、コードの可読性が大幅に向上します。
4.  **デコレータ:** 既存のクラスに手を加えることなく、新しい機能を安全に追加します。特に、デバッグ機能のように、開発時にだけ必要で、本番環境では不要な機能を分離するのに非常に有効です。

これらの設計パターンを適切に使い分けることで、アプリケーションが大規模化・複雑化しても、変更に強く、誰が見ても理解しやすい、プロフェッショナルなコードベースを維持することができます。

---

## 🚀 次のステップ

Three.jsとTypeScriptを使った高度な設計パターンを理解した今、あなたは複雑な3Dアプリケーションを構築するための強力なツールを手に入れました。これらの知識を実際のプロジェクトで活用し、さらに深い理解を目指しましょう。

**推奨される学習と実践:**
-   このチュートリアルで学んだパターンを、あなた自身のThree.jsプロジェクトに応用してみる。
-   カスタムのミックスインやデコレータを作成し、独自の機能を実装してみる。
-   Three.jsの他の高度な機能（ポストプロセス、シェーダーなど）と組み合わせてみる。

これで、Three.jsとTypeScriptのハンズオンチュートリアルは完了です。お疲れ様でした！
