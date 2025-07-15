# 01. 基本シーンの作成

## 📖 学習目標

TypeScriptを使用してThree.jsの基本的な3Dシーンを作成する方法を学習します。

**学習内容:**
- Three.jsの基本要素（Scene、Camera、Renderer）
- TypeScriptでのクラス設計
- インターフェースを使った設定管理
- イベントハンドリングとリソース管理
- 型安全なメソッド設計

**所要時間:** 45-60分  
**対象者:** TypeScript × Three.js連携を理解した方

## 🎬 Three.jsの基本構成要素

Three.jsで3Dシーンを作成するには、必ず以下の3つの要素が必要です：

1. **Scene（シーン）**: 3Dオブジェクトを配置する空間
2. **Camera（カメラ）**: シーンを見る視点
3. **Renderer（レンダラー）**: シーンをcanvasに描画する機能

```typescript
import * as THREE from 'three';

// 基本的な3つの要素
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
```

## 🏗️ 型安全な設定インターフェース

設定オブジェクトをインターフェースで定義することで、型安全性を確保します。

```typescript
// シーンの設定を定義するインターフェース
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
```

## 👥 BasicSceneクラスの設計

クラスベースの設計で、再利用可能で保守しやすいコードを作成します。

```typescript
export class BasicScene {
  // readonly: 作成後に変更できないプロパティ
  public readonly camera: THREE.PerspectiveCamera;
  public readonly scene: THREE.Scene;
  public readonly renderer: THREE.WebGLRenderer;
  
  // private: クラス内部でのみアクセス可能
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

    // 3Dオブジェクトの作成
    this.cube = this.createCube();
    this.scene.add(this.cube);

    // イベントリスナーの設定
    this.setupEventListeners();
  }
}
```

### 設定のマージ機能

```typescript
/**
 * 設定のマージ（型安全）
 * デフォルト設定とユーザー設定を安全に結合
 */
private mergeConfig(defaultConfig: SceneConfig, userConfig: Partial<SceneConfig>): SceneConfig {
  return {
    camera: { ...defaultConfig.camera, ...userConfig.camera },
    renderer: { ...defaultConfig.renderer, ...userConfig.renderer },
    scene: { ...defaultConfig.scene, ...userConfig.scene }
  };
}
```

`Partial<T>`型を使用することで、ユーザーは必要な設定のみを指定できます。

## 🎲 3Dオブジェクトの作成

型を明示的に指定して、安全な3Dオブジェクトを作成します。

```typescript
/**
 * キューブの作成（型明示）
 * TypeScriptで明示的に型を指定した3Dオブジェクトの作成
 */
private createCube(): THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial> {
  // 1×1×1のボックスジオメトリを作成
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  
  // 緑色の基本マテリアルを作成
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  
  // ジオメトリとマテリアルからメッシュを作成
  return new THREE.Mesh(geometry, material);
}
```

### ジオメトリとマテリアルの理解

- **Geometry（ジオメトリ）**: 3Dオブジェクトの形状・構造
- **Material（マテリアル）**: 3Dオブジェクトの材質・見た目
- **Mesh（メッシュ）**: ジオメトリとマテリアルを組み合わせた3Dオブジェクト

## 🖱️ イベントハンドリング

ウィンドウのリサイズに対応する機能を実装します。

```typescript
/**
 * イベントリスナーの設定
 */
private setupEventListeners(): void {
  window.addEventListener('resize', this.onWindowResize.bind(this));
}

/**
 * ウィンドウリサイズ処理
 * カメラとレンダラーを新しいサイズに合わせる
 */
private onWindowResize(): void {
  // カメラのアスペクト比を更新
  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();
  
  // レンダラーのサイズを更新
  this.renderer.setSize(window.innerWidth, window.innerHeight);
}
```

### `bind(this)`の重要性

```typescript
// ❌ 間違った方法: thisが変わってしまう
window.addEventListener('resize', this.onWindowResize);

// ✅ 正しい方法: thisを固定
window.addEventListener('resize', this.onWindowResize.bind(this));

// ✅ アロー関数を使用する方法
window.addEventListener('resize', () => this.onWindowResize());
```

## 🔄 アニメーションループ

3Dシーンに動きを与えるアニメーション機能を実装します。

```typescript
/**
 * アニメーションループ
 * ブラウザの画面更新と同期してアニメーションを実行
 */
private animate(): void {
  // 次のフレームでanimate関数を再度呼び出し
  this.animationId = requestAnimationFrame(this.animate.bind(this));
  
  // キューブの回転アニメーション
  this.cube.rotation.x += 0.01;
  this.cube.rotation.y += 0.01;

  // シーンをレンダリング
  this.renderer.render(this.scene, this.camera);
}

/**
 * シーンの開始
 */
public start(): void {
  // DOMにcanvas要素を追加
  if (!document.body.contains(this.renderer.domElement)) {
    document.body.appendChild(this.renderer.domElement);
  }
  
  // アニメーション開始
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
```

## 🧹 リソース管理とクリーンアップ

メモリリークを防ぐために、適切なリソース管理を実装します。

```typescript
/**
 * リソースのクリーンアップ
 * メモリリークを防ぐために必要なリソースを解放
 */
public dispose(): void {
  // アニメーションを停止
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
  window.removeEventListener('resize', this.onWindowResize.bind(this));
}
```

### リソース管理の重要性

Three.jsオブジェクトは、適切に破棄しないとメモリリークの原因となります：

- **Geometry**: 頂点データなどの大量のメモリを使用
- **Material**: テクスチャやシェーダーのデータを保持
- **Renderer**: WebGLコンテキストを管理

## 🎮 便利なメソッドの追加

シーンを操作するための便利なメソッドを実装します。

```typescript
/**
 * キューブの色を変更
 * Three.jsのColorRepresentation型を使用して型安全性を確保
 */
public setCubeColor(color: THREE.ColorRepresentation): void {
  this.cube.material.color.set(color);
}

/**
 * カメラ位置の設定
 * 3つの数値を受け取ってカメラ位置を変更
 */
public setCameraPosition(x: number, y: number, z: number): void {
  this.camera.position.set(x, y, z);
}

/**
 * シーンの統計情報を取得
 */
public getSceneInfo(): {
  objects: number;
  triangles: number;
  vertices: number;
} {
  let triangles = 0;
  let vertices = 0;
  
  this.scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      const geometry = object.geometry;
      if (geometry.index) {
        triangles += geometry.index.count / 3;
      } else {
        triangles += geometry.attributes.position.count / 3;
      }
      vertices += geometry.attributes.position.count;
    }
  });
  
  return {
    objects: this.scene.children.length,
    triangles: Math.floor(triangles),
    vertices
  };
}
```

## 💡 使用例

作成したBasicSceneクラスの使用方法：

```typescript
// 基本的な使用方法
const scene = new BasicScene();
scene.start();

// カスタム設定での作成
const customScene = new BasicScene({
  camera: {
    fov: 60,
    position: new THREE.Vector3(2, 2, 2)
  },
  scene: {
    background: new THREE.Color(0x0000ff)
  }
});

customScene.start();

// 動的な変更
customScene.setCubeColor(0xff0000);
customScene.setCameraPosition(0, 0, 10);

// 統計情報の表示
console.log(customScene.getSceneInfo());

// リソースのクリーンアップ
// customScene.dispose();
```

## 🎓 次のステップ

基本シーンの作成を理解したら、より高度な機能に進みましょう。

**次の学習項目:**
- [02. 型安全なオブジェクト作成](./02-typed-geometries.md)
- Factory Patternの実装
- Union Typesの活用
- 複数オブジェクトの管理

## 🔍 重要なポイント

1. **型安全性**: インターフェースと明示的な型指定で安全なコード
2. **クラス設計**: 責任の分離と再利用可能な設計
3. **設定管理**: `Partial<T>`型でユーザビリティを向上
4. **リソース管理**: メモリリークを防ぐ適切なクリーンアップ
5. **イベント処理**: ブラウザイベントへの適切な対応

このBasicSceneクラスは、より複雑な3Dアプリケーションの基盤として活用できます。