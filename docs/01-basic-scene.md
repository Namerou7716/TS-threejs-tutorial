# 01. 基本的な3Dシーンの作成 - Three.jsハンズオン

## 📖 この章で学ぶこと

Three.jsで3D空間を構築するための最も基本的な要素を学び、**再利用可能で本格的なシーン管理クラス**の土台を作成します。ただ動かすだけでなく、将来的に拡張しやすい「良い設計」を目指します。

**作成するもの:**
- **シーン基盤クラス:** 3D世界の土台となる、整理整頓されたクラス。
- **型安全な設定システム:** TypeScriptの力を借りて、安全にシーンの設定（カメラ、背景色など）を変更できる仕組み。
- **リソース管理の基礎:** 作成した3Dオブジェクトを適切に管理し、メモリリークを防ぐための初歩を学びます。

**学習のポイント:**
- **Three.jsの三大要素:** `Scene`（舞台）、`Camera`（撮影機材）、`Renderer`（映写機）の役割を理解します。
- **TypeScriptでのクラス設計:** なぜクラスを使うのか、そのメリット（コードの整理、再利用）を実感します。
- **インターフェースによる設定管理:** 設定を「設計図」として定義し、安全で分かりやすいコードを書く方法を学びます。
- **イベント処理の初歩:** ウィンドウサイズが変わった時などに自動で対応する仕組みを作ります。

**想定所要時間:** 45-60分  
**対象者:** [前の章](./00-typescript-basics.md)でTypeScriptの基本を学んだ方

---

## 🚀 準備：プロジェクトをセットアップしよう

Three.jsとTypeScriptを使うための環境を準備します。

```bash
# 1. プロジェクト用のフォルダを作成
mkdir threejs-foundation

# 2. 作成したフォルダに移動
cd threejs-foundation

# 3. プロジェクトを初期化
npm init -y

# 4. Three.js本体をインストール
npm install three

# 5. 開発に必要なツールをインストール
# - typescript: TypeScriptコンパイラ
# - @types/three: Three.js用の型定義ファイル
# - @types/node: Node.js環境用の型定義ファイル
# - vite: 高速な開発サーバー
npm install -D typescript @types/three @types/node vite

# 6. TypeScriptの設定ファイルを生成
npx tsc --init
```

---

## 🎯 プロジェクト1: シーンの基盤となるクラスを設計する

### Step 1-1: `interface`で、安全な設定の「設計図」を作る

最初に、シーンの設定を管理するためのTypeScriptの`インターフェース`を定義します。これにより、設定項目やその型が明確になり、タイプミスなどのヒューマンエラーを防ぎます。

**src/types/scene-config.ts**
```typescript
// src/types/scene-config.ts - 型安全な設定を定義するためのファイル
import * as THREE from 'three';

/**
 * カメラ設定の設計図 (インターフェース)
 * カメラに必要な設定項目を定義します。
 */
export interface CameraConfig {
    type: 'perspective' | 'orthographic'; // カメラの種類
    fov?: number;          // 視野角 (PerspectiveCamera用)
    aspect?: number;       // アスペクト比 (通常はブラウザの幅/高さ)
    near: number;          // カメラに映る一番手前の距離
    far: number;           // カメラに映る一番奥の距離
    position: THREE.Vector3; // カメラの位置
    target?: THREE.Vector3; // カメラが注視する点
}

/**
 * レンダラー設定の設計図 (インターフェース)
 * 描画に関する設定項目を定義します。
 */
export interface RendererConfig {
    antialias: boolean; // アンチエイリアス (ギザギザを滑らかにするか)
    alpha: boolean;     // 背景を透過させるか
    shadowMap: {        // 影の描画設定
        enabled: boolean;
        type: THREE.ShadowMapType;
    };
}

/**
 * シーン設定の設計図 (インターフェース)
 * 3D空間全体に関する設定項目を定義します。
 */
export interface SceneConfig {
    background?: THREE.Color | THREE.Texture | null; // 背景色や背景画像
    fog?: { // 霧（フォグ）の設定
        type: 'linear' | 'exponential';
        color: THREE.Color;
        near?: number; // フォグが始まる距離
        far?: number;  // フォグが最大になる距離
        density?: number; // フォグの密度
    };
}

/**
 * 全ての設定を統合した、最終的な設計図 (インターフェース)
 * このインターフェースに従うことで、シーン作成に必要な設定が全て揃うことを保証します。
 */
export interface FoundationSceneConfig {
    camera: CameraConfig;
    renderer: RendererConfig;
    scene: SceneConfig;
    container?: HTMLElement; // レンダラーを描画するDOM要素
    autoResize: boolean;     // ウィンドウサイズ変更時に自動でリサイズするか
    stats?: boolean;          // パフォーマンス統計を表示するか
}

/**
 * デフォルト設定オブジェクト
 * ユーザーが何も指定しなかった場合に、この設定が使われます。
 * `FoundationSceneConfig`インターフェースに準拠しているため、型安全です。
 */
export const DEFAULT_CONFIG: FoundationSceneConfig = {
    camera: {
        type: 'perspective',
        fov: 75,
        aspect: window.innerWidth / window.innerHeight,
        near: 0.1,
        far: 1000,
        position: new THREE.Vector3(0, 0, 5)
    },
    renderer: {
        antialias: true,
        alpha: false,
        shadowMap: {
            enabled: true,
            type: THREE.PCFSoftShadowMap
        }
    },
    scene: {
        background: new THREE.Color(0x222222) // 暗いグレー
    },
    autoResize: true,
    stats: false
};
```
**💡 ここでの学び:** 設定をインターフェースとして定義することで、`FoundationScene`クラスに渡す設定オブジェクトの「形」を強制できます。これにより、必要なプロパティの不足や、型の間違いをコンパイル時に検出でき、非常に安全になります。

---

### Step 1-2: 基盤シーンクラスの骨格を実装する

いよいよ、Three.jsのコア要素を管理する`FoundationScene`クラスを作成します。このクラスが、今後の3Dプロジェクトすべての土台となります。

**src/foundation-scene.ts**
```typescript
// src/foundation-scene.ts - 再利用可能なThree.jsシーン基盤クラス
import * as THREE from 'three';
import { FoundationSceneConfig, DEFAULT_CONFIG, CameraConfig, RendererConfig, SceneConfig } from './types/scene-config';

/**
 * 企業レベルの基盤シーンクラス
 * Three.jsのコア要素（シーン、カメラ、レンダラー）をカプセル化し、
 * 初期化、アニメーション、リソース管理、イベント処理などの共通機能を提供する。
 */
export class FoundationScene {
    // --- Three.jsのコア要素 --- (public readonlyで外部から変更不可)
    public readonly camera: THREE.Camera;
    public readonly scene: THREE.Scene;
    public readonly renderer: THREE.WebGLRenderer;
    
    // --- 内部状態管理用のプロパティ --- (privateで外部から隠蔽)
    private animationId: number | null = null; // requestAnimationFrameのID
    private clock: THREE.Clock = new THREE.Clock(); // アニメーションの時間管理用
    private config: FoundationSceneConfig; // このシーンインスタンスの設定
    private isInitialized: boolean = false; // 初期化済みかどうかのフラグ
    private isDisposed: boolean = false;    // 破棄済みかどうかのフラグ
    
    // --- リソース管理用のプロパティ --- 
    private managedObjects: Map<string, THREE.Object3D> = new Map(); // IDと3Dオブジェクトを紐付けて管理
    
    // --- イベント処理用のプロパティ ---
    private resizeHandler: (() => void) | null = null; // リサイズ処理の関数を保持

    /**
     * コンストラクタ：クラスが `new` で作成されるときに呼ばれる処理
     * @param userConfig ユーザーが指定するカスタム設定（省略可能）
     */
    constructor(userConfig: Partial<FoundationSceneConfig> = {}) {
        // ユーザー設定とデフォルト設定をマージ（統合）する
        this.config = this.mergeConfig(DEFAULT_CONFIG, userConfig);
        
        // コア要素を初期化
        this.camera = this.createCamera(this.config.camera);
        this.scene = this.createScene(this.config.scene);
        this.renderer = this.createRenderer(this.config.renderer);
        
        // その他の初期化処理を実行
        this.initialize();
    }

    /**
     * 設定をマージするプライベートメソッド
     */
    private mergeConfig(defaultConfig: FoundationSceneConfig, userConfig: Partial<FoundationSceneConfig>): FoundationSceneConfig {
        // スプレッド構文(...)を使って、ユーザー設定でデフォルト設定を上書きする
        return {
            ...defaultConfig,
            ...userConfig,
            camera: { ...defaultConfig.camera, ...userConfig.camera },
            renderer: { ...defaultConfig.renderer, ...userConfig.renderer },
            scene: { ...defaultConfig.scene, ...userConfig.scene },
        };
    }

    /**
     * 設定に基づいてカメラを作成するプライベートメソッド
     */
    private createCamera(config: CameraConfig): THREE.Camera {
        let camera: THREE.Camera;
        if (config.type === 'perspective') {
            // 人間の視界に近い、遠近感のあるカメラ
            camera = new THREE.PerspectiveCamera(config.fov, config.aspect, config.near, config.far);
        } else {
            // 平行投影で、遠近感のないカメラ（設計図や2Dゲームなどで使用）
            camera = new THREE.OrthographicCamera(-1, 1, 1, -1, config.near, config.far);
        }
        camera.position.copy(config.position);
        if (config.target) {
            camera.lookAt(config.target);
        }
        return camera;
    }

    /**
     * 設定に基づいてシーンを作成するプライベートメソッド
     */
    private createScene(config: SceneConfig): THREE.Scene {
        const scene = new THREE.Scene();
        if (config.background) {
            scene.background = config.background;
        }
        if (config.fog) {
            scene.fog = new THREE.Fog(config.fog.color, config.fog.near, config.fog.far);
        }
        return scene;
    }

    /**
     * 設定に基づいてレンダラーを作成するプライベートメソッド
     */
    private createRenderer(config: RendererConfig): THREE.WebGLRenderer {
        const renderer = new THREE.WebGLRenderer({
            antialias: config.antialias,
            alpha: config.alpha
        });
        renderer.setPixelRatio(window.devicePixelRatio); // デバイスの解像度に合わせて綺麗に表示
        renderer.setSize(window.innerWidth, window.innerHeight); // 画面いっぱいに表示
        renderer.shadowMap.enabled = config.shadowMap.enabled;
        renderer.shadowMap.type = config.shadowMap.type;
        return renderer;
    }

    /**
     * DOMへの追加やイベントリスナー設定などの初期化処理
     */
    private initialize(): void {
        if (this.isInitialized) return; // 既に初期化済みなら何もしない

        // レンダラーの描画領域(canvas)をHTMLのbodyに追加
        const container = this.config.container || document.body;
        container.appendChild(this.renderer.domElement);
        
        // 自動リサイズが有効なら、リサイズイベントを設定
        if (this.config.autoResize) {
            this.setupResizeHandler();
        }
        
        this.isInitialized = true;
        console.log("FoundationScene has been initialized.");
    }

    /**
     * ウィンドウリサイズ時の処理を設定するプライベートメソッド
     */
    private setupResizeHandler(): void {
        this.resizeHandler = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // カメラのアスペクト比を更新
            if (this.camera instanceof THREE.PerspectiveCamera) {
                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix(); // カメラの変更を適用
            }
            
            // レンダラーのサイズを更新
            this.renderer.setSize(width, height);
        };
        window.addEventListener('resize', this.resizeHandler);
    }

    /**
     * シーンにオブジェクトを追加するメソッド (外部から利用可能)
     * @param object 追加するThree.jsのオブジェクト
     * @param id 管理用のユニークなID（省略可能）
     * @returns オブジェクトの管理ID
     */
    public addObject(object: THREE.Object3D, id?: string): string {
        const objectId = id || object.uuid; // IDがなければオブジェクト固有のUUIDを利用
        this.scene.add(object);
        this.managedObjects.set(objectId, object);
        console.log(`Object added with ID: ${objectId}`);
        return objectId;
    }

    /**
     * シーンからオブジェクトを削除するメソッド (外部から利用可能)
     * @param id 削除するオブジェクトの管理ID
     * @returns 削除に成功したかどうか
     */
    public removeObject(id: string): boolean {
        const object = this.managedObjects.get(id);
        if (object) {
            this.scene.remove(object);
            this.managedObjects.delete(id);
            console.log(`Object removed with ID: ${id}`);
            return true;
        }
        return false;
    }

    /**
     * アニメーションループを開始するメソッド
     */
    public startAnimation(): void {
        if (this.animationId !== null) return; // 既に開始済みなら何もしない
        
        const animate = (): void => {
            this.animationId = requestAnimationFrame(animate);
            
            // ここでオブジェクトの更新処理などを行う（後の章で実装）
            
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
        console.log("Animation started.");
    }

    /**
     * アニメーションループを停止するメソッド
     */
    public stopAnimation(): void {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            console.log("Animation stopped.");
        }
    }

    /**
     * シーンを破棄し、リソースを解放するメソッド
     */
    public dispose(): void {
        if (this.isDisposed) return;

        this.stopAnimation();

        // 管理しているオブジェクトを全てシーンから削除
        this.managedObjects.forEach(obj => this.scene.remove(obj));
        this.managedObjects.clear();

        // レンダラーと関連リソースを破棄
        this.renderer.dispose();
        if (this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }

        // イベントリスナーを削除
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }

        this.isDisposed = true;
        console.log("FoundationScene disposed successfully.");
    }
}
```
**💡 ここでの学び:**
- **カプセル化:** `private`なメソッドやプロパティを使い、クラスの内部実装を隠蔽しています。これにより、クラスの利用者は`public`なメソッド（`addObject`, `startAnimation`など）だけを意識すればよく、安全で使いやすい部品になります。
- **ライフサイクル管理:** `initialize`, `dispose`メソッドを用意することで、シーンの生成から破棄までの一連の流れを明確に管理できます。これはメモリリークを防ぐ上で非常に重要です。

---

## 🎯 プロジェクト2: 作成した基盤クラスを使ってシーンを動かす

### Step 2-1: 基盤クラスを実際に使ってみる

`FoundationScene`クラスを使って、具体的な3Dシーンを作成します。立方体（Cube）を一つ表示してみましょう。

**examples/basic-foundation-demo.ts**
```typescript
// examples/basic-foundation-demo.ts - FoundationSceneクラスの実用例
import * as THREE from 'three';
import { FoundationScene } from '../src/foundation-scene';

/**
 * デモシーンを管理するクラス
 */
class BasicFoundationDemo {
    private foundationScene: FoundationScene;

    constructor() {
        // 1. FoundationSceneのインスタンスを作成
        //    ここではデフォルト設定をそのまま利用する
        this.foundationScene = new FoundationScene();

        // 2. シーンに必要なオブジェクトを作成・追加
        this.createSceneContent();

        // 3. アニメーションを開始
        this.foundationScene.startAnimation();
    }

    /**
     * シーンに表示する3Dオブジェクトを作成し、追加するメソッド
     */
    private createSceneContent(): void {
        // --- ライトの作成 ---
        // 環境光：シーン全体を均一に照らすライト
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.foundationScene.addObject(ambientLight, 'ambientLight');

        // 平行光：一方向から照らす、太陽光のようなライト
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true; // このライトは影を落とす
        this.foundationScene.addObject(directionalLight, 'directionalLight');

        // --- オブジェクトの作成 ---
        // BoxGeometry: 立方体の形状データ
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        // MeshStandardMaterial: PBR（物理ベースレンダリング）に対応したリアルな質感のマテリアル
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // 緑色
        // Mesh: 形状(Geometry)と材質(Material)を組み合わせた3Dオブジェクト
        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true; // このオブジェクトは影を落とす
        
        // 作成したキューブをシーンに追加
        this.foundationScene.addObject(cube, 'myCube');

        // --- 地面の作成 ---
        const groundGeometry = new THREE.PlaneGeometry(10, 10);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2; // X軸を中心に90度回転させて地面にする
        ground.position.y = -2;
        ground.receiveShadow = true; // このオブジェクトは影を受け取る
        this.foundationScene.addObject(ground, 'ground');
    }

    /**
     * デモを破棄するメソッド
     */
    public dispose(): void {
        this.foundationScene.dispose();
    }
}

// デモを実行
const demo = new BasicFoundationDemo();

console.log(`
=== 基本的な基盤シーンデモ ===
緑色のキューブと地面が表示されます。
ウィンドウサイズを変更すると、シーンも追従してリサイズされます。
`);

// デバッグ用にグローバルスコープに公開
(window as any).demo = demo;
```

### Step 2-2: HTMLファイルを作成してブラウザで確認

最後に、このTypeScriptを実行するためのHTMLファイルを作成します。

**index.html** (プロジェクトのルートに作成)
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three.js Foundation Demo</title>
    <style>
        body { margin: 0; }
        canvas { display: block; }
    </style>
</head>
<body>
    <!-- ViteがこのTypeScriptファイルを読み込んで実行します -->
    <script type="module" src="/examples/basic-foundation-demo.ts"></script>
</body>
</html>
```

**実行方法:**
1.  `package.json`の`scripts`に以下を追加します:
    ```json
    "scripts": {
      "dev": "vite"
    },
    ```
2.  ターミナルで以下のコマンドを実行します:
    ```bash
    npm run dev
    ```
3.  表示されたURL（例: `http://localhost:5173`）をブラウザで開きます。

---

## 🎓 まとめ: 堅牢なシーン基盤の構築

この章では、単に3Dオブジェクトを表示するだけでなく、将来の拡張性を見据えた「基盤クラス」を構築しました。

### ✅ 作成したシステムのポイント
1.  **型安全な設定システム:** `interface`を使い、安全で分かりやすい設定管理を実現しました。
2.  **カプセル化されたクラス:** Three.jsの複雑な部分を`FoundationScene`クラスに隠蔽し、利用者は簡単なメソッドを呼ぶだけでシーンを操作できるようにしました。
3.  **ライフサイクル管理:** `initialize`から`dispose`まで、シーンのライフサイクルを管理し、リソースリークを防ぐ仕組みを導入しました。

### ✅ 学んだ重要概念
- **関心の分離:** 設定、コアロジック、デモ実装をそれぞれ別のファイルに分離し、コードの見通しを良くしました。
- **型安全性:** TypeScriptの型システムをフル活用し、実行時エラーを未然に防ぎました。
- **再利用性:** `FoundationScene`クラスは、今後のどんなThree.jsプロジェクトでも再利用できる、強力な土台となります。

## 🚀 次のステップ

堅牢なシーンの基盤ができたので、次はいよいよ、この基盤の上で様々な3Dオブジェクトを効率的に作成する方法を学びます。

**[02. 型安全なオブジェクト作成ファクトリー](./02-typed-geometries.md)** に進んで、より複雑なシーンを構築していきましょう！
