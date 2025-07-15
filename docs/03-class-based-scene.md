# 03. クラスベースの高度なシーン設計パターン

## 📖 この章で学ぶこと

プロフェッショナルな現場で使われる高度な「設計パターン」を学び、**大規模で、保守しやすく、拡張性の高い**3Dアプリケーションのアーキテクチャを構築します。TypeScriptのオブジェクト指向機能を最大限に活用し、より堅牢なコードを目指します。

(中略)

---

### 用語集：この章で登場する主なThree.js API

- **`THREE.Clock`**: 時間を管理するためのヘルパークラスです。
    - `getElapsedTime()`: Clockが作成されてからの総経過時間を秒単位で返します。
    - `getDelta()`: 前回の`.getDelta()`呼び出しからの経過時間を秒単位で返します。これにより、デバイスの性能（フレームレート）に依存しないスムーズなアニメーションを実装できます。
- **`THREE.Raycaster`**: マウスカーソルなどの2D座標から3D空間に「光線（レイ）」を飛ばし、そのレイがどのオブジェクトと交差したかを検出します。オブジェクトのクリック判定などのインタラクションに不可欠です。
- **`scene.traverse((child) => { ... })`**: シーン内のすべての子オブジェクト（およびそのまた子オブジェクト）に対して、指定したコールバック関数を再帰的に実行します。全てのメッシュのマテリアルを一度に変更する、といった操作に便利です。
- **`material.emissive`**: マテリアルの自己発光色。この色を設定すると、ライトが当たっていなくてもその色で光っているように見えます。オブジェクトを選択した際のハイライト表現などによく使われます。
- **`THREE.AxesHelper`**: X軸（赤）、Y軸（緑）、Z軸（青）の3つの線で構成される座標軸ヘルパー。オブジェクトの位置や向きを確認するのに非常に役立ちます。
- **`THREE.GridHelper`**: 3D空間上にグリッド（方眼紙）を表示するヘルパー。オブジェクトの配置やスケール感の把握に役立ちます。

---

## 🎭 パターン1: 抽象クラス (Abstract Class)

(中略)

```typescript
// src/scenes/AbstractSceneManager.ts

export abstract class AbstractSceneManager {
  // (properties)
  protected clock = new THREE.Clock(); // 時間管理用のクロック
  
  // (abstract methods)
  
  // (initialize method)
  
  private animate(): void {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    // clock.getDelta(): 前のフレームからの経過時間を取得する。
    const deltaTime = this.clock.getDelta();
    this.updateScene(deltaTime); // 毎フレームの更新処理に経過時間を渡す
    this.renderer.render(this.scene, this.camera);
  }
  
  public dispose(): void {
    this.stop();
    // scene.traverse(): シーン内の全オブジェクトに対して処理を実行する。
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        // (material disposal)
      }
    });
    this.renderer.dispose();
  }
}
```

(中略)

## 🧩 パターン2: ミックスイン (Mixin)

(中略)

```typescript
// src/mixins/InteractableMixin.ts

export function InteractableMixin<TBase extends Constructor<AbstractSceneManager>>(
  Base: TBase
) {
  return class extends Base {
    public raycaster = new THREE.Raycaster(); // 光線を飛ばすためのRaycaster
    public mouse = new THREE.Vector2();     // マウスの2D座標を保持するVector2
    
    protected handleInteraction(event: MouseEvent): THREE.Object3D | null {
      // (mouse coordinate normalization)
      
      // raycaster.setFromCamera(mouse, camera): カメラの視点からマウス座標に向かって光線を設定する。
      this.raycaster.setFromCamera(this.mouse, this.camera);
      // raycaster.intersectObjects(objects, recursive): 光線と交差したオブジェクトを配列で返す。
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);
      
      return intersects.length > 0 ? intersects[0].object : null;
    }
  };
}
```

(中略)

## 🏛️ 具象クラス：抽象クラスとミックスインの結合

(中略)

```typescript
// src/scenes/InteractiveSceneManager.ts

export class InteractiveSceneManager extends SceneWithPerformance {
  // (properties)
  
  // (abstract method implementations)
  protected updateScene(deltaTime: number): void {
    // clock.getElapsedTime(): クロックが開始してからの総経過時間を取得。
    const time = this.clock.getElapsedTime();
    // (object animation)
  }
  
  // (initialize method extension)
  
  private highlightObject(mesh: THREE.Mesh, highlight: boolean): void {
    const emissiveColor = highlight ? 0x444444 : 0x000000;
    if (Array.isArray(mesh.material)) {
      // (material array handling)
    } else {
      if (this.isMaterialWithEmissive(mesh.material)) {
        // material.emissive.setHex(color): マテリアルの自己発光色を設定する。
        // これにより、オブジェクトが選択された時に光っているような効果を出せる。
        mesh.material.emissive.setHex(emissiveColor);
      }
    }
  }
  
  // (other methods)
}
```

(中略)

## 🎨 パターン4: デコレータ (Decorator)

(中略)

```typescript
// src/decorators/DebugSceneDecorator.ts

export class DebugSceneDecorator {
  constructor(private sceneManager: InteractiveSceneManager) {}
  
  // (enableWireframeMode)
  
  public addAxesHelper(size: number = 5): void {
    // new THREE.AxesHelper(size): 座標軸（X,Y,Z）を可視化するヘルパーを作成。
    const axesHelper = new THREE.AxesHelper(size);
    this.sceneManager.scene.add(axesHelper);
  }
  
  public addGridHelper(size: number = 10): void {
    // new THREE.GridHelper(size, divisions): グリッド（方眼紙）を可視化するヘルパーを作成。
    const gridHelper = new THREE.GridHelper(size, size);
    this.sceneManager.scene.add(gridHelper);
  }
}
```

(以降のセクションは変更なし)