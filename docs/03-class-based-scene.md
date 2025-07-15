# 03. 高度な設計パターン

## 📖 学習目標

エンタープライズレベルのTypeScript設計パターンを使用して、スケーラブルで保守性の高い3Dアプリケーションアーキテクチャを構築します。

**学習内容:**
- 抽象クラスと継承
- Mixins（ミックスイン）パターン
- Decorator Pattern（デコレータパターン）
- Builder Pattern（ビルダーパターン）
- パフォーマンスモニタリング

**所要時間:** 90-120分  
**対象者:** 中級者〜上級者

## 🏗️ アーキテクチャの概要

このセクションでは、以下のような高度な機能を持つシステムを構築します：

- **抽象基底クラス**: 共通機能の定義とテンプレートメソッドパターン
- **ミックスイン**: 複数の機能を組み合わせる柔軟な仕組み
- **デコレータ**: 既存オブジェクトに機能を動的に追加
- **ビルダー**: 複雑なオブジェクトの段階的構築
- **パフォーマンス監視**: リアルタイムの統計情報収集

## 🎭 抽象基底クラス（Abstract Base Class）

### AbstractSceneManager の設計

```typescript
/**
 * シーン管理の抽象基底クラス
 * テンプレートメソッドパターンを使用して共通の処理フローを定義
 */
export abstract class AbstractSceneManager {
  protected camera!: THREE.Camera;
  protected scene!: THREE.Scene;
  protected renderer!: THREE.WebGLRenderer;
  protected animationId: number | null = null;
  protected clock = new THREE.Clock();
  
  // 抽象メソッド（継承先で必ず実装する必要がある）
  protected abstract initializeScene(): void;
  protected abstract setupLighting(): void;
  protected abstract updateScene(deltaTime: number): void;
  
  /**
   * テンプレートメソッドパターン
   * 初期化の流れを定義し、具体的な実装は継承先に委ねる
   */
  public initialize(): void {
    this.initializeScene();    // 抽象メソッド
    this.setupLighting();     // 抽象メソッド
    this.setupEventListeners(); // 共通実装
  }
  
  /**
   * 共通のイベントリスナー設定
   */
  protected setupEventListeners(): void {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  
  /**
   * 共通のリサイズ処理
   */
  protected onWindowResize(): void {
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  /**
   * アニメーションの開始
   */
  public start(): void {
    this.animate();
  }
  
  /**
   * アニメーションの停止
   */
  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  /**
   * 内部アニメーションループ
   */
  private animate(): void {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    const deltaTime = this.clock.getDelta();
    this.updateScene(deltaTime); // 抽象メソッド
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * リソースのクリーンアップ
   */
  public dispose(): void {
    this.stop();
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
    this.renderer.dispose();
  }
}
```

## 🧩 Mixins（ミックスイン）パターン

ミックスインを使用して、クラスに複数の機能を組み合わせます。

### インタラクション機能のミックスイン

```typescript
/**
 * インタラクション機能のインターフェース
 */
export interface Interactable {
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  eventHandlers: EventHandlers;
  setupInteraction(): void;
  handleMouseEvent(event: MouseEvent, type: keyof EventHandlers): void;
}

/**
 * イベントハンドラーの型定義
 */
export interface EventHandlers {
  onClick?: (info: MouseEventInfo) => void;
  onHover?: (info: MouseEventInfo) => void;
  onMouseMove?: (info: MouseEventInfo) => void;
}

export interface MouseEventInfo {
  position: THREE.Vector2;
  normalized: THREE.Vector2;
  target?: THREE.Object3D;
}

/**
 * インタラクション機能のミックスイン関数
 */
export function InteractableMixin<TBase extends new (...args: any[]) => AbstractSceneManager>(
  Base: TBase
) {
  return class extends Base implements Interactable {
    public raycaster = new THREE.Raycaster();
    public mouse = new THREE.Vector2();
    public eventHandlers: EventHandlers = {};
    
    /**
     * インタラクション機能の初期化
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
     * マウスイベントの処理
     */
    public handleMouseEvent(event: MouseEvent, type: keyof EventHandlers): void {
      const rect = this.renderer.domElement.getBoundingClientRect();
      
      // マウス座標を正規化（-1 〜 1の範囲）
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // レイキャスティングで交差オブジェクトを検出
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);
      
      // イベントハンドラーの呼び出し
      const handler = this.eventHandlers[type];
      if (handler && intersects.length > 0) {
        handler({
          position: new THREE.Vector2(event.clientX, event.clientY),
          normalized: this.mouse.clone(),
          target: intersects[0].object
        });
      }
    }
    
    /**
     * イベントハンドラーの設定
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

### パフォーマンス監視のミックスイン

```typescript
/**
 * パフォーマンス統計情報
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

export type PerformanceCallback = (stats: RenderStats) => void;

/**
 * パフォーマンスモニタリング機能のミックスイン
 */
export function PerformanceMonitorMixin<TBase extends new (...args: any[]) => AbstractSceneManager>(
  Base: TBase
) {
  return class extends Base {
    private performanceCallback?: PerformanceCallback;
    private frameCount = 0;
    private lastTime = performance.now();
    
    /**
     * パフォーマンスコールバックの設定
     */
    public setPerformanceCallback(callback: PerformanceCallback): void {
      this.performanceCallback = callback;
    }
    
    /**
     * パフォーマンス統計の更新
     */
    protected updatePerformanceStats(): void {
      this.frameCount++;
      const currentTime = performance.now();
      
      // 1秒ごとに統計を更新
      if (currentTime - this.lastTime >= 1000) {
        const stats: RenderStats = {
          fps: this.frameCount,
          frameTime: (currentTime - this.lastTime) / this.frameCount,
          triangles: this.getTriangleCount(),
          vertices: this.getVertexCount(),
          drawCalls: this.renderer.info.render.calls,
          memory: {
            geometries: this.renderer.info.memory.geometries,
            textures: this.renderer.info.memory.textures,
            materials: 0 // Three.jsはmaterial countを提供しない
          }
        };
        
        this.performanceCallback?.(stats);
        this.frameCount = 0;
        this.lastTime = currentTime;
      }
    }
    
    /**
     * シーン内の三角形数を計算
     */
    private getTriangleCount(): number {
      let count = 0;
      this.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const geometry = child.geometry;
          if (geometry.index) {
            count += geometry.index.count / 3;
          } else {
            count += geometry.attributes.position.count / 3;
          }
        }
      });
      return count;
    }
    
    /**
     * シーン内の頂点数を計算
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

## 🏛️ 具象実装クラス

ミックスインを組み合わせた具象クラスの実装：

```typescript
/**
 * インタラクティブな3Dシーンマネージャー
 * 複数のミックスインを組み合わせて高機能なシーン管理を実現
 */
export class InteractiveSceneManager extends PerformanceMonitorMixin(
  InteractableMixin(AbstractSceneManager)
) {
  private objects: THREE.Mesh[] = [];
  private selectedObject: THREE.Mesh | null = null;
  
  /**
   * シーンの初期化（抽象メソッドの実装）
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
    this.camera.lookAt(0, 0, 0);
    
    // シーンの設定
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1a);
    
    // レンダラーの設定
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);
  }
  
  /**
   * ライティングの設定（抽象メソッドの実装）
   */
  protected setupLighting(): void {
    // 環境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);
    
    // 指向性ライト（影をサポート）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    
    // ポイントライト
    const pointLight = new THREE.PointLight(0x00aaff, 0.6, 50);
    pointLight.position.set(-5, 5, -5);
    this.scene.add(pointLight);
  }
  
  /**
   * シーンの更新（抽象メソッドの実装）
   */
  protected updateScene(deltaTime: number): void {
    const time = this.clock.getElapsedTime();
    
    // オブジェクトのアニメーション
    this.objects.forEach((obj, index) => {
      obj.rotation.x = time * 0.3 + index * 0.1;
      obj.rotation.y = time * 0.5 + index * 0.15;
      obj.position.y = Math.sin(time + index) * 0.5;
    });
    
    // パフォーマンス統計の更新（ミックスインから継承）
    this.updatePerformanceStats();
  }
  
  /**
   * 初期化の拡張（ミックスイン機能を追加）
   */
  public initialize(): void {
    super.initialize();
    this.setupInteraction(); // インタラクション機能を有効化
    
    // インタラクションハンドラーの設定
    this.setEventHandler('onClick', (info) => {
      if (info.target instanceof THREE.Mesh) {
        this.selectObject(info.target);
      }
    });
    
    this.setEventHandler('onHover', (info) => {
      document.body.style.cursor = info.target ? 'pointer' : 'default';
    });
  }
  
  /**
   * オブジェクトの選択機能
   */
  private selectObject(mesh: THREE.Mesh): void {
    // 前の選択を解除
    if (this.selectedObject) {
      this.highlightObject(this.selectedObject, false);
    }
    
    // 新しい選択
    this.selectedObject = mesh;
    this.highlightObject(mesh, true);
    
    console.log('Selected object:', mesh.name || 'Unnamed');
  }
  
  /**
   * オブジェクトのハイライト表示
   */
  private highlightObject(mesh: THREE.Mesh, highlight: boolean): void {
    const emissiveColor = highlight ? 0x444444 : 0x000000;
    
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(material => {
        if (this.isMaterialWithEmissive(material)) {
          material.emissive.setHex(emissiveColor);
        }
      });
    } else {
      if (this.isMaterialWithEmissive(mesh.material)) {
        mesh.material.emissive.setHex(emissiveColor);
      }
    }
  }
  
  /**
   * マテリアルがemissiveプロパティを持つかの型ガード
   */
  private isMaterialWithEmissive(
    material: THREE.Material
  ): material is THREE.MeshLambertMaterial | THREE.MeshPhongMaterial | THREE.MeshStandardMaterial {
    return 'emissive' in material;
  }
  
  /**
   * オブジェクトの追加
   */
  public addObject(mesh: THREE.Mesh): void {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.objects.push(mesh);
  }
  
  /**
   * 選択されたオブジェクトの削除
   */
  public removeSelectedObject(): void {
    if (!this.selectedObject) return;
    
    this.scene.remove(this.selectedObject);
    this.selectedObject.geometry.dispose();
    
    if (Array.isArray(this.selectedObject.material)) {
      this.selectedObject.material.forEach(material => material.dispose());
    } else {
      this.selectedObject.material.dispose();
    }
    
    const index = this.objects.indexOf(this.selectedObject);
    if (index > -1) {
      this.objects.splice(index, 1);
    }
    
    this.selectedObject = null;
  }
  
  /**
   * オブジェクト数の取得
   */
  public getObjectCount(): number {
    return this.objects.length;
  }
  
  /**
   * 選択されたオブジェクトの取得
   */
  public getSelectedObject(): THREE.Mesh | null {
    return this.selectedObject;
  }
}
```

## 🏗️ Builder Pattern（ビルダーパターン）

複雑なオブジェクトを段階的に構築するパターン：

```typescript
/**
 * シーンマネージャーのビルダークラス
 * 複雑な設定を段階的に構築
 */
export class SceneManagerBuilder {
  private config: {
    enableShadows: boolean;
    enableInteraction: boolean;
    enablePerformanceMonitoring: boolean;
    backgroundColor: THREE.Color;
    cameraPosition: THREE.Vector3;
  } = {
    enableShadows: true,
    enableInteraction: true,
    enablePerformanceMonitoring: false,
    backgroundColor: new THREE.Color(0x0a0a1a),
    cameraPosition: new THREE.Vector3(5, 5, 5)
  };
  
  /**
   * 影機能の有効/無効設定
   */
  public withShadows(enabled: boolean): this {
    this.config.enableShadows = enabled;
    return this;
  }
  
  /**
   * インタラクション機能の有効/無効設定
   */
  public withInteraction(enabled: boolean): this {
    this.config.enableInteraction = enabled;
    return this;
  }
  
  /**
   * パフォーマンス監視機能の有効/無効設定
   */
  public withPerformanceMonitoring(enabled: boolean): this {
    this.config.enablePerformanceMonitoring = enabled;
    return this;
  }
  
  /**
   * 背景色の設定
   */
  public withBackgroundColor(color: THREE.Color): this {
    this.config.backgroundColor = color;
    return this;
  }
  
  /**
   * カメラ位置の設定
   */
  public withCameraPosition(position: THREE.Vector3): this {
    this.config.cameraPosition = position;
    return this;
  }
  
  /**
   * シーンマネージャーの構築
   */
  public build(): InteractiveSceneManager {
    const manager = new InteractiveSceneManager();
    manager.initialize();
    
    // 設定の適用
    manager.scene.background = this.config.backgroundColor;
    manager.camera.position.copy(this.config.cameraPosition);
    manager.renderer.shadowMap.enabled = this.config.enableShadows;
    
    if (this.config.enablePerformanceMonitoring) {
      manager.setPerformanceCallback((stats) => {
        console.log('Performance Stats:', stats);
      });
    }
    
    return manager;
  }
}
```

## 🎨 Decorator Pattern（デコレータパターン）

既存のオブジェクトに機能を動的に追加するパターン：

```typescript
/**
 * デバッグ機能のデコレータ
 * 既存のシーンマネージャーにデバッグ機能を追加
 */
export class DebugSceneDecorator {
  constructor(private sceneManager: InteractiveSceneManager) {}
  
  /**
   * ワイヤーフレーム表示の有効化
   */
  public enableWireframeMode(): void {
    this.sceneManager.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => {
            material.wireframe = true;
          });
        } else {
          child.material.wireframe = true;
        }
      }
    });
  }
  
  /**
   * バウンディングボックスの表示
   */
  public showBoundingBoxes(): void {
    this.sceneManager.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const box = new THREE.BoxHelper(child, 0xffff00);
        this.sceneManager.scene.add(box);
      }
    });
  }
  
  /**
   * 座標軸ヘルパーの追加
   */
  public addAxesHelper(size: number = 5): void {
    const axesHelper = new THREE.AxesHelper(size);
    this.sceneManager.scene.add(axesHelper);
  }
  
  /**
   * グリッドヘルパーの追加
   */
  public addGridHelper(size: number = 10, divisions: number = 10): void {
    const gridHelper = new THREE.GridHelper(size, divisions);
    this.sceneManager.scene.add(gridHelper);
  }
}
```

## 💡 使用例

高度な設計パターンを組み合わせた実際の使用例：

```typescript
// 1. ビルダーパターンでシーンマネージャーを構築
const sceneManager = new SceneManagerBuilder()
  .withShadows(true)
  .withInteraction(true)
  .withPerformanceMonitoring(true)
  .withBackgroundColor(new THREE.Color(0x001122))
  .withCameraPosition(new THREE.Vector3(8, 6, 8))
  .build();

// 2. オブジェクトの追加（ファクトリーパターンと組み合わせ）
const objects = [
  TypedObjectFactory.createMesh({
    geometry: { type: 'box', config: { width: 1, height: 1, depth: 1 } },
    material: { type: 'standard', config: { color: 0xff0000, roughness: 0.5 } },
    transform: { position: { x: -2, y: 0, z: 0 } }
  }),
  TypedObjectFactory.createMesh({
    geometry: { type: 'sphere', config: { radius: 0.8 } },
    material: { type: 'standard', config: { color: 0x00ff00, metalness: 0.7 } },
    transform: { position: { x: 0, y: 0, z: 0 } }
  }),
  TypedObjectFactory.createMesh({
    geometry: { type: 'cone', config: { radius: 0.6, height: 1.2 } },
    material: { type: 'standard', config: { color: 0x0000ff, roughness: 0.3 } },
    transform: { position: { x: 2, y: 0, z: 0 } }
  })
];

objects.forEach(obj => sceneManager.addObject(obj));

// 3. デコレータパターンでデバッグ機能を追加
const debugDecorator = new DebugSceneDecorator(sceneManager);
debugDecorator.addAxesHelper(3);
debugDecorator.addGridHelper(10, 10);

// 4. シーン開始
sceneManager.start();

// 5. パフォーマンス監視の設定
sceneManager.setPerformanceCallback((stats) => {
  document.getElementById('fps')!.textContent = `FPS: ${stats.fps}`;
  document.getElementById('triangles')!.textContent = `Triangles: ${stats.triangles}`;
  document.getElementById('vertices')!.textContent = `Vertices: ${stats.vertices}`;
});

// 6. 動的な機能の有効化
if (process.env.NODE_ENV === 'development') {
  debugDecorator.enableWireframeMode();
  debugDecorator.showBoundingBoxes();
}
```

## 🎓 次のステップ

高度な設計パターンを理解したら、実際のプロジェクトで活用してみましょう。

**推奨される学習と実践:**
- 実際のプロジェクトでパターンを組み合わせて使用
- カスタムミックスインの作成
- より複雑なデコレータの実装
- パフォーマンス最適化の実践

## 🔍 重要なポイント

1. **抽象クラス**: 共通機能の定義とテンプレートメソッドパターン
2. **ミックスイン**: 多重継承的な機能組み合わせ
3. **ビルダーパターン**: 複雑なオブジェクトの段階的構築
4. **デコレータパターン**: 既存オブジェクトへの動的機能追加
5. **型安全性**: 全てのパターンでTypeScriptの型システムを活用

これらの設計パターンを組み合わせることで、大規模で複雑な3Dアプリケーションでも保守しやすく拡張性の高いコードベースを構築できます。