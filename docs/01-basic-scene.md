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

---

### 用語集：この章で登場する主なThree.js API

- **`THREE.Scene`**: 3Dオブジェクト、ライト、カメラなどを配置するための「舞台」や「空間」そのものです。全てのオブジェクトは、このシーンに追加されることで描画対象となります。
- **`THREE.PerspectiveCamera`**: 遠近感のある（遠くのものが小さく見える）3D空間を写すためのカメラです。人間の視界に最も近いカメラです。
- **`THREE.WebGLRenderer`**: 作成したシーンを、実際にブラウザの画面に描画（レンダリング）するための「映写機」です。WebGLという技術を使って高速な3D描画を行います。
- **`THREE.Vector3`**: 3D空間内の位置や方向を示すための、x, y, zの3つの座標を持つオブジェクトです。
- **`THREE.Color`**: 色を表現するためのオブジェクトです。`0xff0000`（赤）のような16進数や、`'red'`のような文字列で色を指定できます。
- **`THREE.AmbientLight`**: シーン全体を均一に照らす、影のない環境光です。真っ暗になるのを防ぎます。
- **`THREE.DirectionalLight`**: 特定の方向から照らす、太陽光のような平行光です。影を落とすことができます。
- **`THREE.BoxGeometry`**: 立方体や直方体の「形状（ジオメトリ）」を定義します。
- **`THREE.PlaneGeometry`**: 平面の「形状（ジオメトリ）」を定義します。地面などによく使われます。
- **`THREE.MeshStandardMaterial`**: PBR（物理ベースレンダリング）に基づいた、リアルな質感を表現できる「材質（マテリアル）」です。光の反射などをリアルに計算します。
- **`THREE.Mesh`**: `Geometry`（形状）と`Material`（材質）を組み合わせた、最終的な3Dオブジェクトです。これをシーンに追加します。

---

## 🚀 準備：プロジェクトをセットアップしよう

(省略)

---

## 🎯 プロジェクト1: シーンの基盤となるクラスを設計する

### Step 1-1: `interface`で、安全な設定の「設計図」を作る

(省略)

### Step 1-2: 基盤シーンクラスの骨格を実装する

**src/foundation-scene.ts**
```typescript
// (imports)

export class FoundationScene {
    // (properties)

    constructor(userConfig: Partial<FoundationSceneConfig> = {}) {
        // (config merge)
        
        // --- コア要素の初期化 ---
        this.camera = this.createCamera(this.config.camera);
        this.scene = this.createScene(this.config.scene);
        this.renderer = this.createRenderer(this.config.renderer);
        
        this.initialize();
    }

    // (mergeConfig)

    private createCamera(config: CameraConfig): THREE.Camera {
        let camera: THREE.Camera;
        if (config.type === 'perspective') {
            // new THREE.PerspectiveCamera(fov, aspect, near, far)
            // fov: 視野角。数値が小さいほどズームイン。
            // aspect: アスペクト比。通常は画面の幅/高さ。
            // near: カメラに映る最も近い距離。
            // far: カメラに映る最も遠い距離。
            camera = new THREE.PerspectiveCamera(config.fov, config.aspect, config.near, config.far);
        } else {
            camera = new THREE.OrthographicCamera(-1, 1, 1, -1, config.near, config.far);
        }
        // camera.position.copy(vector): 指定したVector3の値をカメラの位置にコピーする。
        camera.position.copy(config.position);
        if (config.target) {
            // camera.lookAt(vector): カメラを指定したVector3の方向に向ける。
            camera.lookAt(config.target);
        }
        return camera;
    }

    private createScene(config: SceneConfig): THREE.Scene {
        // new THREE.Scene(): 3D空間のコンテナを作成する。
        const scene = new THREE.Scene();
        if (config.background) {
            // scene.background: シーンの背景を設定。THREE.Colorオブジェクトなどを指定。
            scene.background = config.background;
        }
        if (config.fog) {
            // scene.fog: シーンに霧効果を追加する。
            scene.fog = new THREE.Fog(config.fog.color, config.fog.near, config.fog.far);
        }
        return scene;
    }

    private createRenderer(config: RendererConfig): THREE.WebGLRenderer {
        // new THREE.WebGLRenderer({ antialias: ... }): WebGLを使って描画するレンダラーを作成。
        // antialias: trueで物体の輪郭を滑らかにする。
        const renderer = new THREE.WebGLRenderer({ antialias: config.antialias, alpha: config.alpha });
        // renderer.setPixelRatio(): デバイスのピクセル比に合わせて解像度を調整し、高解像度ディスプレイで綺麗に表示する。
        renderer.setPixelRatio(window.devicePixelRatio);
        // renderer.setSize(): レンダラーの描画サイズをブラウザのウィンドウサイズに設定する。
        renderer.setSize(window.innerWidth, window.innerHeight);
        // renderer.shadowMap.enabled: シーン内で影を計算し、描画することを有効にする。
        renderer.shadowMap.enabled = config.shadowMap.enabled;
        renderer.shadowMap.type = config.shadowMap.type;
        return renderer;
    }

    private initialize(): void {
        if (this.isInitialized) return;
        const container = this.config.container || document.body;
        // renderer.domElement: レンダラーが描画するcanvas要素。これをHTMLに追加して表示する。
        container.appendChild(this.renderer.domElement);
        
        if (this.config.autoResize) {
            this.setupResizeHandler();
        }
        this.isInitialized = true;
    }

    private setupResizeHandler(): void {
        this.resizeHandler = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            if (this.camera instanceof THREE.PerspectiveCamera) {
                this.camera.aspect = width / height;
                // camera.updateProjectionMatrix(): カメラのプロパティ（aspectなど）を変更した後に必ず呼び出す必要がある。
                this.camera.updateProjectionMatrix();
            }
            this.renderer.setSize(width, height);
        };
        window.addEventListener('resize', this.resizeHandler);
    }

    public addObject(object: THREE.Object3D, id?: string): string {
        const objectId = id || object.uuid;
        // scene.add(object): 指定したオブジェクト（Mesh, Lightなど）をシーンに追加する。
        this.scene.add(object);
        this.managedObjects.set(objectId, object);
        return objectId;
    }

    public removeObject(id: string): boolean {
        const object = this.managedObjects.get(id);
        if (object) {
            // scene.remove(object): 指定したオブジェクトをシーンから削除する。
            this.scene.remove(object);
            this.managedObjects.delete(id);
            return true;
        }
        return false;
    }

    public startAnimation(): void {
        if (this.animationId !== null) return;
        const animate = (): void => {
            // requestAnimationFrame(callback): ブラウザの次の描画タイミングで指定したコールバック関数を実行する。
            this.animationId = requestAnimationFrame(animate);
            // renderer.render(scene, camera): 指定したシーンを、指定したカメラの視点から描画する。
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }

    // (stopAnimation)

    public dispose(): void {
        if (this.isDisposed) return;
        this.stopAnimation();
        this.managedObjects.forEach(obj => this.scene.remove(obj));
        this.managedObjects.clear();

        // renderer.dispose(): レンダラーが確保したWebGLのリソースを解放する。メモリリークを防ぐために重要。
        this.renderer.dispose();
        if (this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        this.isDisposed = true;
    }
}
```

---

## 🎯 プロジェクト2: 作成した基盤クラスを使ってシーンを動かす

### Step 2-1: 基盤クラスを実際に使ってみる

**examples/basic-foundation-demo.ts**
```typescript
// (imports)

class BasicFoundationDemo {
    private foundationScene: FoundationScene;

    constructor() {
        this.foundationScene = new FoundationScene();
        this.createSceneContent();
        this.foundationScene.startAnimation();
    }

    private createSceneContent(): void {
        // --- ライトの作成 ---
        // new THREE.AmbientLight(color, intensity): シーン全体を照らす環境光を作成。
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.foundationScene.addObject(ambientLight, 'ambientLight');

        // new THREE.DirectionalLight(color, intensity): 特定方向からの平行光を作成。
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        // light.position.set(x, y, z): ライトの位置を設定。
        directionalLight.position.set(5, 10, 7.5);
        // light.castShadow = true: このライトが影を生成するように設定。
        directionalLight.castShadow = true;
        this.foundationScene.addObject(directionalLight, 'directionalLight');

        // --- オブジェクトの作成 ---
        // new THREE.BoxGeometry(width, height, depth): 立方体の形状データを作成。
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        // new THREE.MeshStandardMaterial({ color: ... }): リアルな質感の材質を作成。
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        // new THREE.Mesh(geometry, material): 形状と材質を組み合わせて3Dオブジェクトを作成。
        const cube = new THREE.Mesh(geometry, material);
        // mesh.castShadow = true: このオブジェクトが影を落とすように設定。
        cube.castShadow = true;
        this.foundationScene.addObject(cube, 'myCube');

        // --- 地面の作成 ---
        // new THREE.PlaneGeometry(width, height): 平面の形状データを作成。
        const groundGeometry = new THREE.PlaneGeometry(10, 10);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        // object.rotation.x: オブジェクトのX軸周りの回転をラジアン単位で設定。
        ground.rotation.x = -Math.PI / 2; // 90度回転させて水平にする
        ground.position.y = -2;
        // mesh.receiveShadow = true: このオブジェクトが他のオブジェクトの影を受け取るように設定。
        ground.receiveShadow = true;
        this.foundationScene.addObject(ground, 'ground');
    }

    // (dispose)
}

// (demo execution)
```

(以降のセクションは変更なし)