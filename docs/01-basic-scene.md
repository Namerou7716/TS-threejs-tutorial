# 01. 基本的な3Dシーンの作成 - Three.jsハンズオン

## 📖 この章のゴール

この章では、Three.jsで3D空間を構築するための最も基本的な要素を学び、それを**再利用可能で本格的なシーン管理クラス**として構築します。単に3Dオブジェクトを表示するだけでなく、将来的に拡張しやすい「良い設計」を意識しながら、以下のことを達成します。

-   **シーン基盤クラスの構築:** 3D世界の土台となる、整理整頓されたクラスを作成します。
-   **型安全な設定システムの導入:** TypeScriptの力を借りて、シーンの設定（カメラ、背景色など）を安全かつ柔軟に変更できる仕組みを学びます。
-   **リソース管理の基礎:** 作成した3Dオブジェクトを適切に管理し、メモリリークを防ぐための初歩的な考え方を学びます。

---

### 用語集：この章で登場する主なThree.js API

Three.jsは多くのクラスや関数を提供していますが、この章で特に重要となる基本的なAPIをいくつか紹介します。これらは3Dシーンを構築する上で欠かせない要素です。

-   **`THREE.Scene`**: 3Dオブジェクト、ライト、カメラなどを配置するための「舞台」や「空間」そのものです。全てのオブジェクトは、このシーンに追加されることで描画対象となります。
-   **`THREE.PerspectiveCamera`**: 遠近感のある（遠くのものが小さく見える）3D空間を写すためのカメラです。人間の視界に最も近いカメラであり、3Dゲームやシミュレーションでよく使われます。
-   **`THREE.WebGLRenderer`**: 作成したシーンを、実際にブラウザの画面に描画（レンダリング）するための「映写機」です。WebGLという技術を使って高速な3D描画を行います。
-   **`THREE.Vector3`**: 3D空間内の位置や方向を示すための、x, y, zの3つの座標を持つオブジェクトです。オブジェクトの位置やカメラの向きなどを設定する際に頻繁に利用します。
-   **`THREE.Color`**: 色を表現するためのオブジェクトです。`0xff0000`（赤）のような16進数や、`'red'`のような文字列で色を指定できます。
-   **`THREE.AmbientLight`**: シーン全体を均一に照らす、影のない環境光です。シーンが真っ暗になるのを防ぎ、全体的な明るさを調整するのに使われます。
-   **`THREE.DirectionalLight`**: 特定の方向から照らす、太陽光のような平行光です。光源の位置ではなく、方向が重要で、影を落とすことができます。
-   **`THREE.BoxGeometry`**: 立方体や直方体の「形状（ジオメトリ）」を定義します。Three.jsには他にも球体（`SphereGeometry`）や円錐（`ConeGeometry`）など、様々なプリミティブジオメトリが用意されています。
-   **`THREE.PlaneGeometry`**: 平面の「形状（ジオメトリ）」を定義します。地面や壁など、平らな面を作成する際によく使われます。
-   **`THREE.MeshStandardMaterial`**: PBR（物理ベースレンダリング）に基づいた、リアルな質感を表現できる「材質（マテリアル）」です。光の反射などを物理的に正確に計算し、より自然な見た目を実現します。
-   **`THREE.Mesh`**: `Geometry`（形状）と`Material`（材質）を組み合わせた、最終的な3Dオブジェクトです。これをシーンに追加することで、画面に表示されます。

---

## 🚀 準備：プロジェクトをセットアップしよう

Three.jsとTypeScriptを使った開発を始めるために、まずはプロジェクトの基本的な環境をセットアップします。以下のコマンドをターミナルで実行してください。

```bash
# 1. プロジェクト用の新しいフォルダを作成します。
#    このフォルダが、これから作成するThree.jsプロジェクトのルートになります。
mkdir threejs-foundation

# 2. 作成したフォルダに移動します。
cd threejs-foundation

# 3. Node.jsプロジェクトを初期化します。
#    `package.json`というファイルが作成され、プロジェクトのメタデータや依存関係が管理されます。
npm init -y

# 4. Three.js本体をインストールします。
#    これにより、Three.jsのライブラリが`node_modules`フォルダに追加され、コードから利用できるようになります。
npm install three

# 5. 開発に必要なツールをインストールします。
#    - `typescript`: TypeScriptのコードをJavaScriptに変換するためのコンパイラです。
#    - `@types/three`: Three.jsライブラリの型定義ファイルです。これがあることで、TypeScriptがThree.jsのAPIを理解し、コード補完や型チェックが可能になります。
#    - `@types/node`: Node.js環境用の型定義ファイルです。
#    - `vite`: 高速な開発サーバーとビルドツールです。開発中のコード変更を即座にブラウザに反映してくれます。
npm install -D typescript @types/three @types/node vite

# 6. TypeScriptの設定ファイルを生成します。
#    `tsconfig.json`というファイルが作成され、TypeScriptのコンパイルに関する詳細な設定（例: どのバージョンのJavaScriptに変換するか）を定義できます。
npx tsc --init
```

これらのステップが完了すると、Three.jsとTypeScriptを使った開発を始める準備が整います。

---

## 🎯 プロジェクト1: シーンの基盤となるクラスを設計する

このプロジェクトでは、Three.jsのコア要素（シーン、カメラ、レンダラー）を管理する`FoundationScene`という基盤クラスを設計します。このクラスは、今後の3Dプロジェクトすべての土台となり、コードの整理と再利用性を高めます。

### Step 1-1: `interface`で、安全な設定の「設計図」を作る

`FoundationScene`クラスを柔軟に使えるようにするため、外部から様々な設定を渡せるようにします。この設定の「形」をTypeScriptの`interface`を使って厳密に定義することで、型安全で分かりやすい設定システムを構築します。これにより、設定項目やその型が明確になり、タイプミスなどのヒューマンエラーを防ぎます。

まず、`src/types/scene-config.ts`というファイルを作成し、以下のコードを記述してください。

```typescript
// src/types/scene-config.ts - 型安全な設定を定義するためのファイル
import * as THREE from 'three';

/**
 * カメラ設定の設計図 (インターフェース)
 * Three.jsのカメラを作成する際に必要な設定項目を定義します。
 */
export interface CameraConfig {
    type: 'perspective' | 'orthographic'; // カメラの種類: 遠近法カメラか平行投影カメラか
    fov?: number;          // 視野角 (PerspectiveCamera用): カメラが見る範囲の角度。小さいほどズームイン。
    aspect?: number;       // アスペクト比: 通常は描画領域の幅を高さで割った値。
    near: number;          // 近クリッピング面: カメラに映る最も手前の距離。これより近いオブジェクトは描画されない。
    far: number;           // 遠クリッピング面: カメラに映る最も遠い距離。これより遠いオブジェクトは描画されない。
    position: THREE.Vector3; // カメラの3D空間における位置 (x, y, z座標)
    target?: THREE.Vector3; // カメラが注視する点: カメラがどの方向を向くかを指定します。
}

/**
 * レンダラー設定の設計図 (インターフェース)
 * Three.jsの描画エンジンであるレンダラーに関する設定項目を定義します。
 */
export interface RendererConfig {
    antialias: boolean; // アンチエイリアス: オブジェクトの輪郭のギザギザを滑らかにするか。
    alpha: boolean;     // アルファ（透明度）: レンダラーの背景を透過させるか。
    shadowMap: {        // 影の描画設定: シーン内で影を有効にするか、その品質などを設定します。
        enabled: boolean;
        type: THREE.ShadowMapType; // 影の計算方法や品質の種類
    };
}

/**
 * シーン設定の設計図 (インターフェース)
 * 3D空間全体（`THREE.Scene`）に関する設定項目を定義します。
 */
export interface SceneConfig {
    background?: THREE.Color | THREE.Texture | null; // 背景: シーンの背景色や背景画像を設定します。
    fog?: { // 霧（フォグ）の設定: 遠くのオブジェクトが霧で霞む効果を追加します。
        type: 'linear' | 'exponential'; // フォグの種類: 線形か指数関数的か
        color: THREE.Color; // 霧の色
        near?: number; // 線形フォグの場合: フォグが始まる距離
        far?: number;  // 線形フォグの場合: フォグが最大になる距離
        density?: number; // 指数関数的フォグの場合: フォグの密度
    };
}

/**
 * 全ての設定を統合した、最終的な設計図 (インターフェース)
 * `FoundationScene`クラスのコンストラクタに渡される設定オブジェクトの完全な形を定義します。
 * このインターフェースに従うことで、シーン作成に必要な設定が全て揃うことを保証します。
 */
export interface FoundationSceneConfig {
    camera: CameraConfig;
    renderer: RendererConfig;
    scene: SceneConfig;
    container?: HTMLElement; // レンダラーが描画されるHTML要素。指定がなければ`document.body`に描画されます。
    autoResize: boolean;     // ウィンドウサイズ変更時に、シーンが自動でリサイズされるようにするか。
    stats?: boolean;          // パフォーマンス統計（FPSなど）を表示するか。
}

/**
 * デフォルト設定オブジェクト
 * ユーザーが`FoundationScene`のインスタンスを作成する際に、
 * 特定の設定を省略した場合に自動的に適用される標準的な設定値です。
 * `FoundationSceneConfig`インターフェースに準拠しているため、型安全です。
 */
export const DEFAULT_CONFIG: FoundationSceneConfig = {
    camera: {
        type: 'perspective',
        fov: 75,
        aspect: window.innerWidth / window.innerHeight,
        near: 0.1,
        far: 1000,
        position: new THREE.Vector3(0, 0, 5) // カメラをZ軸方向に5単位の位置に配置
    },
    renderer: {
        antialias: true,
        alpha: false,
        shadowMap: {
            enabled: true,
            type: THREE.PCFSoftShadowMap // 影のタイプ: 柔らかい影を生成
        }
    },
    scene: {
        background: new THREE.Color(0x222222) // シーンの背景色を暗いグレーに設定
    },
    autoResize: true,
    stats: false
};
```

**ここでの学び:**
設定を`interface`として定義することで、`FoundationScene`クラスに渡す設定オブジェクトの「形」を厳密に強制できます。これにより、必要なプロパティの不足や、型の間違いをコンパイル時に検出でき、非常に安全なコードになります。また、`DEFAULT_CONFIG`を用意することで、利用者は必要な部分だけを上書きしてシーンをカスタマイズできるようになり、柔軟性が向上します。

### Step 1-2: 基盤シーンクラスの骨格を実装する

次に、Three.jsのコア要素（`THREE.Scene`、`THREE.Camera`、`THREE.WebGLRenderer`）を管理し、初期化、アニメーション、リソース管理といった共通の機能を提供する`FoundationScene`クラスを実装します。このクラスが、今後の3Dプロジェクトすべての土台となります。

`src/foundation-scene.ts`というファイルを作成し、以下のコードを記述してください。

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
    // --- Three.jsのコア要素 --- 
    // `public readonly`修飾子により、これらのプロパティはクラスの外部から参照可能ですが、
    // 直接変更することはできません。これにより、重要な要素の不変性を保証します。
    public readonly camera: THREE.Camera; // 3D空間を写すカメラ
    public readonly scene: THREE.Scene;   // 3Dオブジェクトを配置する舞台
    public readonly renderer: THREE.WebGLRenderer; // 実際にブラウザに描画するレンダラー
    
    // --- 内部状態管理用のプロパティ --- 
    // `private`修飾子により、これらのプロパティはクラスの内部でのみアクセス可能です。
    // 外部からの意図しない変更を防ぎ、クラスの内部実装を隠蔽します（カプセル化）。
    private animationId: number | null = null; // `requestAnimationFrame`のID。アニメーションの停止に使う。
    private clock: THREE.Clock = new THREE.Clock(); // アニメーションの時間管理用。経過時間などを計測。
    private config: FoundationSceneConfig; // このシーンインスタンスに適用される最終的な設定
    private isInitialized: boolean = false; // シーンが初期化済みかどうかのフラグ
    private isDisposed: boolean = false;    // シーンが破棄済みかどうかのフラグ
    
    // --- リソース管理用のプロパティ --- 
    private managedObjects: Map<string, THREE.Object3D> = new Map(); // シーンに追加されたオブジェクトをIDで管理
    
    // --- イベント処理用のプロパティ ---
    private resizeHandler: (() => void) | null = null; // ウィンドウリサイズ処理の関数を保持

    /**
     * コンストラクタ：`new FoundationScene()`でインスタンスが作成されるときに実行される初期化処理です。
     * @param userConfig ユーザーが指定するカスタム設定（部分的でも可）。省略した場合はデフォルト設定が適用されます。
     */
    constructor(userConfig: Partial<FoundationSceneConfig> = {}) {
        // ユーザー設定とデフォルト設定をマージ（統合）し、最終的な設定を決定します。
        this.config = this.mergeConfig(DEFAULT_CONFIG, userConfig);
        
        // --- コア要素の初期化 ---
        // 設定に基づいて、カメラ、シーン、レンダラーの各インスタンスを作成します。
        this.camera = this.createCamera(this.config.camera);
        this.scene = this.createScene(this.config.scene);
        this.renderer = this.createRenderer(this.config.renderer);
        
        // その他の初期化処理を実行します。
        this.initialize();
    }

    /**
     * ユーザー設定とデフォルト設定を安全にマージするプライベートメソッド。
     * @param defaultConfig 基本となるデフォルト設定オブジェクト
     * @param userConfig ユーザーが指定したカスタム設定オブジェクト（部分的な上書きが可能）
     * @returns マージ後の完全な設定オブジェクト
     */
    private mergeConfig(defaultConfig: FoundationSceneConfig, userConfig: Partial<FoundationSceneConfig>): FoundationSceneConfig {
        // スプレッド構文(...)を使って、ネストされたオブジェクトも安全にマージします。
        // これにより、デフォルト設定をベースに、ユーザーが指定した設定で上書きできます。
        return {
            ...defaultConfig,
            ...userConfig,
            camera: { ...defaultConfig.camera, ...userConfig.camera },
            renderer: { ...defaultConfig.renderer, ...userConfig.renderer },
            scene: { ...defaultConfig.scene, ...userConfig.scene },
        };
    }

    /**
     * 設定に基づいてThree.jsのカメラを作成するプライベートメソッド。
     * @param config カメラ設定オブジェクト
     * @returns 作成された`THREE.Camera`インスタンス
     */
    private createCamera(config: CameraConfig): THREE.Camera {
        let camera: THREE.Camera;
        if (config.type === 'perspective') {
            // `new THREE.PerspectiveCamera(fov, aspect, near, far)`:
            // 人間の視界に近い、遠近感のあるカメラを作成します。
            // - `fov`: 視野角（Field of View）。カメラが見る範囲の角度。小さいほどズームイン。
            // - `aspect`: アスペクト比。通常は描画領域の幅を高さで割った値。
            // - `near`: 近クリッピング面。カメラに映る最も手前の距離。これより近いオブジェクトは描画されない。
            // - `far`: 遠クリッピング面。カメラに映る最も遠い距離。これより遠いオブジェクトは描画されない。
            camera = new THREE.PerspectiveCamera(config.fov, config.aspect, config.near, config.far);
        } else {
            // `new THREE.OrthographicCamera(left, right, top, bottom, near, far)`:
            // 平行投影で、遠近感のないカメラを作成します。設計図や2Dゲームなどで使用されます。
            camera = new THREE.OrthographicCamera(-1, 1, 1, -1, config.near, config.far);
        }
        // `camera.position.copy(vector)`: 指定した`THREE.Vector3`の値をカメラの位置にコピーします。
        camera.position.copy(config.position);
        if (config.target) {
            // `camera.lookAt(vector)`: カメラを指定した`THREE.Vector3`の方向に向ける。
            // これにより、カメラが常に特定の点（例: シーンの中心）を注視するようになります。
            camera.lookAt(config.target);
        }
        return camera;
    }

    /**
     * 設定に基づいてThree.jsのシーンを作成するプライベートメソッド。
     * @param config シーン設定オブジェクト
     * @returns 作成された`THREE.Scene`インスタンス
     */
    private createScene(config: SceneConfig): THREE.Scene {
        // `new THREE.Scene()`: 3Dオブジェクト、ライト、カメラなどを配置するための3D空間のコンテナを作成します。
        const scene = new THREE.Scene();
        if (config.background) {
            // `scene.background`: シーンの背景を設定します。`THREE.Color`オブジェクトや`THREE.Texture`などを指定できます。
            scene.background = config.background;
        }
        if (config.fog) {
            // `scene.fog`: シーンに霧効果を追加します。遠くのオブジェクトが霞んで見え、奥行き感を演出できます。
            // `new THREE.Fog(color, near, far)`: 線形フォグを作成します。
            scene.fog = new THREE.Fog(config.fog.color, config.fog.near, config.fog.far);
        }
        return scene;
    }

    /**
     * 設定に基づいてThree.jsのレンダラーを作成するプライベートメソッド。
     * @param config レンダラー設定オブジェクト
     * @returns 作成された`THREE.WebGLRenderer`インスタンス
     */
    private createRenderer(config: RendererConfig): THREE.WebGLRenderer {
        // `new THREE.WebGLRenderer({ antialias: ..., alpha: ... })`:
        // WebGLを使って3Dシーンを描画するレンダラーを作成します。
        // - `antialias`: `true`に設定すると、オブジェクトの輪郭のギザギザを滑らかにします。
        // - `alpha`: `true`に設定すると、レンダラーの背景を透過させることができます。
        const renderer = new THREE.WebGLRenderer({ antialias: config.antialias, alpha: config.alpha });
        // `renderer.setPixelRatio()`: デバイスのピクセル比に合わせて解像度を調整し、
        // Retinaディスプレイなどの高解像度ディスプレイで鮮明に表示されるようにします。
        renderer.setPixelRatio(window.devicePixelRatio);
        // `renderer.setSize()`: レンダラーの描画サイズをブラウザのウィンドウサイズに設定します。
        // これにより、3Dシーンが画面いっぱいに表示されます。
        renderer.setSize(window.innerWidth, window.innerHeight);
        // `renderer.shadowMap.enabled`: シーン内で影を計算し、描画することを有効にします。
        renderer.shadowMap.enabled = config.shadowMap.enabled;
        // `renderer.shadowMap.type`: 影の品質や計算方法を設定します。
        renderer.shadowMap.type = config.shadowMap.type;
        return renderer;
    }

    /**
     * DOMへの追加やイベントリスナー設定などの初期化処理を実行するプライベートメソッド。
     */
    private initialize(): void {
        if (this.isInitialized) return; // 既に初期化済みなら何もしない

        // `renderer.domElement`: レンダラーが描画を行うためのHTMLの`<canvas>`要素です。
        // これをHTMLの`<body>`要素（または指定されたコンテナ）に追加することで、画面に3Dシーンが表示されます。
        const container = this.config.container || document.body;
        container.appendChild(this.renderer.domElement);
        
        // 自動リサイズが有効な場合、ウィンドウリサイズイベントを設定します。
        if (this.config.autoResize) {
            this.setupResizeHandler();
        }
        
        this.isInitialized = true;
        console.log("FoundationScene has been initialized.");
    }

    /**
     * ウィンドウリサイズ時の処理を設定するプライベートメソッド。
     * 画面サイズが変更された際に、カメラとレンダラーの表示を適切に調整します。
     */
    private setupResizeHandler(): void {
        // `this.onWindowResize.bind(this)`: イベントリスナーとしてメソッドを登録する際、
        // `this`のコンテキストを正しく保つために`bind`を使用します。
        this.resizeHandler = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            if (this.camera instanceof THREE.PerspectiveCamera) {
                // カメラのアスペクト比を現在のウィンドウサイズに合わせて更新します。
                this.camera.aspect = width / height;
                // `camera.updateProjectionMatrix()`: カメラのプロパティ（視野角、アスペクト比など）を変更した後に、
                // その変更をThree.jsの内部で反映させるために必ず呼び出す必要があるメソッドです。
                this.camera.updateProjectionMatrix();
            }
            // レンダラーの描画サイズもウィンドウサイズに合わせます。
            this.renderer.setSize(width, height);
        };
        window.addEventListener('resize', this.resizeHandler);
    }

    /**
     * シーンに3Dオブジェクトを追加するパブリックメソッド。
     * 追加されたオブジェクトは内部で管理され、後で削除することも可能です。
     * @param object 追加する`THREE.Object3D`インスタンス（`Mesh`、`Light`など）
     * @param id 管理用のユニークなID（省略可能）。指定がなければオブジェクトの`uuid`が使われます。
     * @returns オブジェクトの管理ID
     */
    public addObject(object: THREE.Object3D, id?: string): string {
        const objectId = id || object.uuid; // IDが指定されていなければ、Three.jsが自動生成するUUIDを使用
        // `scene.add(object)`: 指定したオブジェクトをシーンに追加します。これにより、レンダラーがそのオブジェクトを描画できるようになります。
        this.scene.add(object);
        this.managedObjects.set(objectId, object); // 内部のMapでオブジェクトを管理
        console.log(`Object added with ID: ${objectId}`);
        return objectId;
    }

    /**
     * シーンから3Dオブジェクトを削除するパブリックメソッド。
     * @param id 削除するオブジェクトの管理ID
     * @returns 削除に成功した場合は`true`、オブジェクトが見つからなかった場合は`false`
     */
    public removeObject(id: string): boolean {
        const object = this.managedObjects.get(id);
        if (object) {
            // `scene.remove(object)`: 指定したオブジェクトをシーンから削除します。これにより、そのオブジェクトは描画されなくなります。
            this.scene.remove(object);
            this.managedObjects.delete(id);
            console.log(`Object removed with ID: ${id}`);
            return true;
        }
        return false;
    }

    /**
     * アニメーションループを開始するパブリックメソッド。
     * 毎フレーム、シーンの更新と描画が行われます。
     */
    public startAnimation(): void {
        if (this.animationId !== null) return; // 既にアニメーションが開始済みなら何もしない
        
        const animate = (): void => {
            // `requestAnimationFrame(callback)`: ブラウザに次の描画タイミングで指定したコールバック関数を実行するように要求します。
            // これを再帰的に呼び出すことで、ブラウザの描画サイクルに合わせたスムーズなアニメーションループが実現されます。
            this.animationId = requestAnimationFrame(animate);
            
            // ここでオブジェクトの更新処理などを行う（後の章で実装されます）
            
            // `renderer.render(scene, camera)`: 指定したシーンを、指定したカメラの視点から描画します。
            // この処理が毎フレーム実行されることで、3Dシーンがアニメーションとして見えるようになります。
            this.renderer.render(this.scene, this.camera);
        };
        
        animate(); // アニメーションループを開始
        console.log("Animation started.");
    }

    /**
     * アニメーションループを停止するパブリックメソッド。
     */
    public stopAnimation(): void {
        if (this.animationId !== null) {
            // `cancelAnimationFrame(id)`: `requestAnimationFrame`で予約されたコールバックをキャンセルします。
            // これにより、アニメーションループが停止します。
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            console.log("Animation stopped.");
        }
    }

    /**
     * シーンを完全に破棄し、使用していたリソース（メモリ、WebGLコンテキストなど）を解放するパブリックメソッド。
     * アプリケーション終了時や、シーンを切り替える際などに呼び出すことで、メモリリークを防ぎます。
     */
    public dispose(): void {
        if (this.isDisposed) return; // 既に破棄済みなら何もしない

        this.stopAnimation(); // アニメーションを停止

        // 管理しているオブジェクトを全てシーンから削除します。
        this.managedObjects.forEach(obj => this.scene.remove(obj));
        this.managedObjects.clear(); // 管理Mapもクリア

        // `renderer.dispose()`: レンダラーが使用しているWebGLコンテキストと、
        // それに関連する全てのGPUリソースを解放します。非常に重要です。
        this.renderer.dispose();
        // レンダラーの`<canvas>`要素をHTMLから削除します。
        if (this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }

        // イベントリスナーを削除します。
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }

        this.isDisposed = true;
        console.log("FoundationScene disposed successfully.");
    }
}
```

**ここでの学び:**
-   **カプセル化:** `private`なメソッドやプロパティを使い、クラスの内部実装を隠蔽しています。これにより、クラスの利用者は`public`なメソッド（`addObject`, `startAnimation`など）だけを意識すればよく、安全で使いやすい部品になります。
-   **ライフサイクル管理:** `initialize`や`dispose`といったメソッドを用意することで、シーンの生成から破棄までの一連の流れを明確に管理できます。特に`dispose`は、Three.jsが使用するGPUメモリを適切に解放するために非常に重要です。
-   **Three.jsのコアAPIの役割:** `THREE.Scene`, `THREE.Camera`, `THREE.WebGLRenderer`がそれぞれ3Dシーンのどの部分を担っているのか、そしてそれらをどのように初期化・操作するのかを具体的に学びました。

---

## 🎯 プロジェクト2: 作成した基盤クラスを使ってシーンを動かす

このプロジェクトでは、先ほど作成した`FoundationScene`クラスを実際に使って、シンプルな3Dシーンを構築します。立方体（Cube）と地面を配置し、ライトを加えてみましょう。

### Step 2-1: 基盤クラスを実際に使ってみる

`examples/basic-foundation-demo.ts`というファイルを作成し、以下のコードを記述してください。

```typescript
// examples/basic-foundation-demo.ts - FoundationSceneクラスの実用例
import * as THREE from 'three';
import { FoundationScene } from '../src/foundation-scene';

/**
 * このデモシーンを管理するクラス。
 * `FoundationScene`をインスタンス化し、その上に具体的な3Dオブジェクトを配置します。
 */
class BasicFoundationDemo {
    private foundationScene: FoundationScene;

    constructor() {
        // 1. `FoundationScene`のインスタンスを作成します。
        //    ここでは、`scene-config.ts`で定義されたデフォルト設定が自動的に適用されます。
        this.foundationScene = new FoundationScene();

        // 2. シーンに表示する3Dオブジェクト（ライト、キューブ、地面など）を作成し、追加します。
        this.createSceneContent();

        // 3. アニメーションループを開始します。これにより、シーンがブラウザに描画され続けます。
        this.foundationScene.startAnimation();
    }

    /**
     * シーンに表示する3Dオブジェクトを作成し、`FoundationScene`に追加するメソッド。
     */
    private createSceneContent(): void {
        // --- ライトの作成 ---
        // `new THREE.AmbientLight(color, intensity)`: シーン全体を均一に照らす環境光を作成します。
        // - `color`: ライトの色（例: `0xffffff`は白）。
        // - `intensity`: ライトの強度（0.0から1.0）。
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.foundationScene.addObject(ambientLight, 'ambientLight'); // `FoundationScene`の`addObject`でシーンに追加

        // `new THREE.DirectionalLight(color, intensity)`: 特定の方向から照らす平行光を作成します。
        // 太陽光のように、オブジェクトに影を落とすことができます。
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        // `light.position.set(x, y, z)`: ライトの3D空間における位置を設定します。
        directionalLight.position.set(5, 10, 7.5);
        // `light.castShadow = true`: このライトが影を生成するように設定します。
        directionalLight.castShadow = true;
        this.foundationScene.addObject(directionalLight, 'directionalLight');

        // --- オブジェクトの作成 ---
        // `new THREE.BoxGeometry(width, height, depth)`: 幅、高さ、奥行きを指定して立方体の「形状データ」を作成します。
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        // `new THREE.MeshStandardMaterial({ color: ... })`: PBRに基づいたリアルな質感の「材質」を作成します。
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // 緑色
        // `new THREE.Mesh(geometry, material)`: 「形状」と「材質」を組み合わせて、最終的な3Dオブジェクト（メッシュ）を作成します。
        const cube = new THREE.Mesh(geometry, material);
        // `mesh.castShadow = true`: このオブジェクトが他のオブジェクトに影を落とすように設定します。
        cube.castShadow = true;
        this.foundationScene.addObject(cube, 'myCube');

        // --- 地面の作成 ---
        // `new THREE.PlaneGeometry(width, height)`: 幅と高さを指定して平面の「形状データ」を作成します。
        const groundGeometry = new THREE.PlaneGeometry(10, 10);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 }); // グレー
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        // `object.rotation.x`: オブジェクトのX軸周りの回転角度をラジアン単位で設定します。
        // `-Math.PI / 2`は-90度を意味し、平面を水平に倒します。
        ground.rotation.x = -Math.PI / 2; 
        ground.position.y = -2; // 地面をY軸方向に少し下げる
        // `mesh.receiveShadow = true`: このオブジェクトが他のオブジェクトから落とされた影を受け取るように設定します。
        ground.receiveShadow = true;
        this.foundationScene.addObject(ground, 'ground');
    }

    /**
     * デモを終了し、`FoundationScene`が使用していたリソースを解放するメソッド。
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

// デバッグ用にグローバルスコープに公開（ブラウザのコンソールから`demo`や`foundationScene`にアクセスできます）
(window as any).demo = demo;
(window as any).foundationScene = demo['foundationScene'];
```

**ここでの学び:**
-   `FoundationScene`クラスを使うことで、Three.jsの基本的なセットアップ（シーン、カメラ、レンダラーの作成と設定）が非常に簡潔に行えることを確認しました。
-   `addObject`メソッドを通じて、ライトや3Dオブジェクトをシーンに簡単に追加できることを学びました。
-   `THREE.AmbientLight`と`THREE.DirectionalLight`を使ってシーンを照らし、`castShadow`と`receiveShadow`プロパティで影を有効にする方法を理解しました。
-   `THREE.BoxGeometry`と`THREE.MeshStandardMaterial`を使って基本的な3Dオブジェクトを作成し、`position`や`rotation`プロパティで配置や向きを調整する方法を学びました。

### Step 2-2: HTMLファイルを作成してブラウザで確認

作成したTypeScriptコードをブラウザで実行するために、HTMLファイルと開発サーバーの設定が必要です。`index.html`というファイルをプロジェクトのルートに作成し、以下のコードを記述してください。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three.js Foundation Demo</title>
    <style>
        /* bodyとcanvasの余白をなくし、canvasをブロック要素にする */
        body { margin: 0; overflow: hidden; }
        canvas { display: block; }
    </style>
</head>
<body>
    <!-- ViteがこのTypeScriptファイルを読み込み、JavaScriptに変換してブラウザで実行します -->
    <script type="module" src="/examples/basic-foundation-demo.ts"></script>
</body>
</html>
```

次に、`package.json`ファイルを開き、`scripts`セクションに開発サーバーを起動するためのコマンドを追加します。

```json
// package.json
{
  // ... その他の設定 ...
  "scripts": {
    "dev": "vite", // `npm run dev`でVite開発サーバーを起動するコマンド
    "build": "tsc && vite build", // 本番環境用のビルドコマンド
    "preview": "vite preview" // ビルドしたものをプレビューするコマンド
  },
  // ... その他の設定 ...
}
```

**実行方法:**
1.  ターミナルで以下のコマンドを実行し、Vite開発サーバーを起動します。
    ```bash
    npm run dev
    ```
2.  ターミナルに表示されたURL（例: `http://localhost:5173`）をブラウザで開きます。

ブラウザに緑色の回転するキューブと、その下に影を落とす地面が表示されれば成功です。ウィンドウのサイズを変更すると、シーンが自動的にリサイズされることも確認してみてください。

---

## 🎓 まとめ: 堅牢なシーン基盤の構築

この章では、単に3Dオブジェクトを表示するだけでなく、将来の拡張性を見据えた「基盤クラス」を構築しました。これは、Three.jsアプリケーションをより大規模で管理しやすいものにするための重要なステップです。

### ✅ この章で作成したシステムのポイント
1.  **型安全な設定システム:** `interface`を使い、安全で分かりやすい設定管理を実現しました。これにより、設定ミスによるバグをコンパイル時に防ぐことができます。
2.  **カプセル化されたクラス:** Three.jsの複雑な初期化や管理ロジックを`FoundationScene`クラスに隠蔽しました。利用者は簡単なメソッドを呼ぶだけでシーンを操作できるようになり、コードの見通しが良くなりました。
3.  **ライフサイクル管理:** `initialize`から`dispose`まで、シーンのライフサイクルを明確に管理する仕組みを導入しました。特に`dispose`メソッドは、Three.jsが使用するGPUメモリを適切に解放し、メモリリークを防ぐ上で非常に重要です。

### ✅ この章で学んだ重要概念
-   **関心の分離:** 設定、コアロジック、デモ実装をそれぞれ別のファイルに分離し、コードの見通しを良くしました。これにより、各部分の変更が他の部分に与える影響を最小限に抑えられます。
-   **型安全性:** TypeScriptの型システムをフル活用し、実行時エラーを未然に防ぐことの重要性を再確認しました。
-   **再利用性:** `FoundationScene`クラスは、今後のどんなThree.jsプロジェクトでも再利用できる、強力な土台となります。一度作った基盤を使い回すことで、開発効率が大幅に向上します。

---

## 🚀 次のステップ

堅牢なシーンの基盤ができたので、次はいよいよ、この基盤の上で様々な3Dオブジェクトを効率的に作成する方法を学びます。

**[02. 型安全なオブジェクト作成ファクトリー](./02-typed-geometries.md)** に進んで、より複雑なシーンを構築していきましょう！
