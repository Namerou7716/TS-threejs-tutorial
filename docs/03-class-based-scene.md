# 03. クラスベースの高度なシーン設計パターン

## 📖 この章で学ぶこと

プロフェッショナルな現場で使われる高度な「設計パターン」を学び、**大規模で、保守しやすく、拡張性の高い**3Dアプリケーションのアーキテクチャを構築します。TypeScriptのオブジェクト指向機能を最大限に活用し、より堅牢なコードを目指します。

**学習する高度な設計パターン:**
- **抽象クラスと継承:** クラスの「設計図」を作り、共通の骨格を定義します。
- **Mixins（ミックスイン）パターン:** 必要な「機能」をパーツのようにクラスに組み込みます。
- **Decorator（デコレータ）パターン:** 既存のオブジェクトを「飾り付け」して、動的に機能を追加します。
- **Builder（ビルダー）パターン:** 複雑なオブジェクトの組み立て工程を、分かりやすく整理します。

**想定所要時間:** 90-120分  
**対象者:** TypeScriptのクラスに慣れ、より高度なソフトウェア設計を学びたい中級者以上の方

---

## 🏗️ アーキテクチャ概要：目指す全体像

この章では、これらの設計パターンを組み合わせ、以下のような柔軟で強力なシステムを構築します。

1.  **`AbstractSceneManager` (抽象クラス):** 全てのシーン管理クラスが従うべき基本ルール（初期化、アニメーションループなど）を定義した「大本の設計図」。
2.  **`InteractableMixin`, `PerformanceMonitorMixin` (ミックスイン):** 「マウス操作機能」や「パフォーマンス計測機能」といった独立した機能を、必要なクラスに後から「混ぜ込む」ための部品。
3.  **`InteractiveSceneManager` (具象クラス):** 抽象クラスを継承し、ミックスインを組み込むことで、具体的で高機能なシーン管理クラスを実装。
4.  **`SceneManagerBuilder` (ビルダー):** `InteractiveSceneManager`の複雑な初期設定を、メソッドチェーンで直感的に行えるようにする補助クラス。
5.  **`DebugSceneDecorator` (デコレータ):** 完成した`InteractiveSceneManager`のインスタンスに、後から「デバッグ用の表示機能」などを追加する。

---

## 🎭 パターン1: 抽象クラス (Abstract Class)

**目的:** 複数のクラスに共通する「骨格」や「処理の流れ（テンプレート）」を定義し、コードの重複をなくす。

### `AbstractSceneManager` の設計

`abstract`キーワードを使って、全てのシーン管理クラスの基盤となる抽象クラスを定義します。このクラスは、それ自体を`new`することはできません。あくまで継承されるための「設計図」です。

```typescript
// src/scenes/AbstractSceneManager.ts
import * as THREE from 'three';

/**
 * シーン管理の「抽象基底クラス」
 * 全てのシーンマネージャーが持つべき共通のプロパティとメソッドの骨格を定義する。
 */
export abstract class AbstractSceneManager {
  // 継承先クラスで必ず初期化されるプロパティ
  protected scene!: THREE.Scene;
  protected camera!: THREE.Camera;
  protected renderer!: THREE.WebGLRenderer;
  
  protected clock = new THREE.Clock();
  private animationId: number | null = null;
  
  // --- 抽象メソッド：継承先での実装を強制する --- 
  // `abstract`が付いたメソッドは、このクラスを継承したクラスで必ず実装しなければならない。
  
  /** シーンのオブジェクト配置や初期設定を行う */
  protected abstract initializeScene(): void;
  /** ライティングを設定する */
  protected abstract setupLighting(): void;
  /** 毎フレームの更新処理を行う */
  protected abstract updateScene(deltaTime: number): void;
  
  // --- テンプレートメソッド：処理の「流れ」を定義する --- 
  /**
   * 初期化処理の全体の流れを定義する「テンプレートメソッド」。
   * 具体的な処理（initializeSceneなど）は継承先に任せるが、呼び出す順番はここで決める。
   */
  public initialize(): void {
    this.initializeScene();    // (1) シーンの初期化
    this.setupLighting();      // (2) ライティングの設定
    this.setupEventListeners(); // (3) イベントリスナーの設定（共通処理）
    console.log("Scene initialized according to the template.");
  }
  
  // --- 共通メソッド：どの継承先でも共通で使える処理 ---
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
    if (this.animationId === null) {
      this.animate();
    }
  }
  
  public stop(): void {
    if (this.animationId !== null) {
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
  
  // ... dispose処理など ...
}
```
**💡 ここでの学び:** 抽象クラスを使うことで、シーン管理クラスの「あるべき姿」を定義できます。`initialize`のようなテンプレートメソッドは、処理の順序を保証し、`initializeScene`のような抽象メソッドは、個別の実装を強制することで、品質の高いコードを維持できます。

---

## 🧩 パターン2: ミックスイン (Mixin)

**目的:** クラスに、多重継承のように複数の「機能」を合成（ミックス）する。TypeScriptでは、クラスを返す関数として実装するのが一般的。

### インタラクション機能のミックスイン

マウス操作（クリック、ホバー）を処理する機能を、独立したミックスインとして定義します。

```typescript
// src/mixins/InteractableMixin.ts
import * as THREE from 'three';
import { AbstractSceneManager } from '../scenes/AbstractSceneManager';

// 型定義（コンストラクタを持つクラスの型）
type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * マウス操作機能を提供するミックスイン
 * @param Base 継承元となるクラス
 * @returns マウス操作機能が追加された新しいクラス
 */
export function InteractableMixin<TBase extends Constructor<AbstractSceneManager>>(
  Base: TBase
) {
  return class extends Base {
    public raycaster = new THREE.Raycaster();
    public mouse = new THREE.Vector2();
    
    // ... handleMouseEvent, setEventHandlerなどの実装 ...

    /**
     * マウスイベントを処理し、交差したオブジェクトに対してコールバックを実行する
     */
    protected handleInteraction(event: MouseEvent): THREE.Object3D | null {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);
      
      return intersects.length > 0 ? intersects[0].object : null;
    }
  };
}
```
**💡 ここでの学び:** ミックスインは、特定の機能（今回はマウス操作）をカプセル化するのに非常に便利です。「インタラクティブにしたい」クラスにこのミックスインを適用するだけで、機能を追加できます。継承が「is-a」（〜は〜の一種である）関係なのに対し、ミックスインは「has-a」（〜は〜の機能を持つ）関係を実現します。

---

## 🏛️ 具象クラス：抽象クラスとミックスインの結合

`AbstractSceneManager`を継承し、作成したミックスインを適用して、具体的な機能を持つシーン管理クラスを実装します。

```typescript
// src/scenes/InteractiveSceneManager.ts
import { AbstractSceneManager } from './AbstractSceneManager';
import { InteractableMixin } from '../mixins/InteractableMixin';
import { PerformanceMonitorMixin } from '../mixins/PerformanceMonitorMixin';

// 1. ミックスインを適用した基底クラスを作成
const SceneWithInteraction = InteractableMixin(AbstractSceneManager);
const SceneWithPerformance = PerformanceMonitorMixin(SceneWithInteraction);

/**
 * インタラクティブな3Dシーンマネージャー
 * 抽象クラスを継承し、複数のミックスインを組み合わせることで高機能を実現
 */
export class InteractiveSceneManager extends SceneWithPerformance {
  private objects: THREE.Mesh[] = [];
  private selectedObject: THREE.Mesh | null = null;
  
  // --- 抽象メソッドの実装 (ここから) ---
  protected initializeScene(): void { /* カメラ、シーン、レンダラーの初期化 */ }
  protected setupLighting(): void { /* ライトの配置 */ }
  protected updateScene(deltaTime: number): void { /* オブジェクトのアニメーション */ }
  // --- 抽象メソッドの実装 (ここまで) ---
  
  /**
   * 初期化処理を拡張し、インタラクション機能を有効化
   */
  public initialize(): void {
    super.initialize(); // 親クラス(AbstractSceneManager)のinitializeを呼び出す
    
    // マウスクリック時の処理を定義
    this.renderer.domElement.addEventListener('click', (event) => {
      const target = this.handleInteraction(event); // ミックスインの機能を利用
      if (target instanceof THREE.Mesh) {
        this.selectObject(target);
      }
    });
  }
  
  // ... selectObject, addObjectなどの独自メソッド ...
}
```
**💡 ここでの学び:** `extends`の右側でミックスイン関数を呼び出すことで、機能が合成されたクラスを継承できます。これにより、クラスの責務を明確に分離しつつ、必要な機能を柔軟に組み合わせることが可能になります。

---

## 🏗️ パターン3: ビルダー (Builder)

**目的:** 複雑なオブジェクトの生成プロセスを、ステップ・バイ・ステップのメソッドチェーンで表現し、可読性を向上させる。

```typescript
// src/builders/SceneManagerBuilder.ts
import { InteractiveSceneManager } from '../scenes/InteractiveSceneManager';

/**
 * シーンマネージャーの「ビルダークラス」
 * 複雑な設定を、メソッドチェーンで段階的に構築する
 */
export class SceneManagerBuilder {
  private manager: InteractiveSceneManager;

  constructor() {
    this.manager = new InteractiveSceneManager();
  }

  /** 背景色を設定する */
  public withBackgroundColor(color: number): this {
    // initializeが完了するのを待つ必要があるため、一旦コールバックとして保持
    this.manager.setOnInitialized(() => {
        this.manager.scene.background = new THREE.Color(color);
    });
    return this; // `this`を返すことでメソッドチェーンを可能にする
  }

  /** カメラ位置を設定する */
  public withCameraPosition(x: number, y: number, z: number): this {
    this.manager.setOnInitialized(() => {
        this.manager.camera.position.set(x, y, z);
    });
    return this;
  }

  /** パフォーマンス監視を設定する */
  public withPerformanceMonitoring(callback: (stats: any) => void): this {
    this.manager.setOnInitialized(() => {
        this.manager.setPerformanceCallback(callback);
    });
    return this;
  }

  /** 最終的に設定済みのマネージャーインスタンスを構築して返す */
  public build(): InteractiveSceneManager {
    this.manager.initialize();
    return this.manager;
  }
}
```
**💡 使い方:**
```typescript
const manager = new SceneManagerBuilder()
  .withBackgroundColor(0x001122)
  .withCameraPosition(8, 6, 8)
  .withPerformanceMonitoring(stats => console.log(stats.fps))
  .build();
```
**💡 ここでの学び:** ビルダーパターンを使うと、コンストラクタの引数が長くなるのを防ぎ、どんな設定でオブジェクトが作られるのかが一目瞭然になります。「何を」「どのように」設定しているかが明確になるため、非常に可読性の高いコードになります。

---

## 🎨 パターン4: デコレータ (Decorator)

**目的:** 既存のオブジェクトの機能を変更せずに、新しい責任（機能）を動的に追加する。オブジェクトを別のクラスで「包む（ラップする）」ことで実現する。

```typescript
// src/decorators/DebugSceneDecorator.ts
import { InteractiveSceneManager } from '../scenes/InteractiveSceneManager';

/**
 * シーンマネージャーにデバッグ機能を追加する「デコレータ」
 */
export class DebugSceneDecorator {
  // デコレート（装飾）対象のインスタンスを保持
  constructor(private sceneManager: InteractiveSceneManager) {}
  
  /** ワイヤーフレーム表示を有効にする */
  public enableWireframeMode(): void {
    this.sceneManager.scene.traverse(child => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
        child.material.wireframe = true;
      }
    });
  }
  
  /** 座標軸ヘルパーを追加する */
  public addAxesHelper(size: number = 5): void {
    this.sceneManager.scene.add(new THREE.AxesHelper(size));
  }
  
  /** グリッドヘルパーを追加する */
  public addGridHelper(size: number = 10): void {
    this.sceneManager.scene.add(new THREE.GridHelper(size, size));
  }
}
```
**💡 使い方:**
```typescript
// 1. まずは通常のマネージャーをビルド
const manager = new SceneManagerBuilder().build();

// 2. デコレータでマネージャーを「包んで」、デバッグ機能を追加
const debugManager = new DebugSceneDecorator(manager);
debugManager.addAxesHelper();
debugManager.addGridHelper();

manager.start();
```
**💡 ここでの学び:** デコレータパターンは、元のクラスのコードを一切変更することなく、機能を追加できるのが最大の利点です。特に、デバッグ機能のように、開発時にだけ必要で、本番環境では不要な機能を分離するのに非常に有効です。

---

## 🎓 まとめ: 高度な設計パターンによる恩恵

この章では、TypeScriptのオブジェクト指向機能を活用した4つの高度な設計パターンを学びました。

1.  **抽象クラス:** コードの共通基盤を固め、一貫性を保つ。
2.  **ミックスイン:** 必要な機能を柔軟に組み合わせ、クラスの肥大化を防ぐ。
3.  **ビルダー:** 複雑な初期化処理を分かりやすく、直感的にする。
4.  **デコレータ:** 既存のクラスに手を加えることなく、新しい機能を安全に追加する。

これらの設計パターンを適切に使い分けることで、アプリケーションが大規模化・複雑化しても、変更に強く、誰が見ても理解しやすい、プロフェッショナルなコードベースを維持することができます。
