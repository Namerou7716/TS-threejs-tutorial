# 01.5 TypeScriptとThree.jsの連携 - 実践ハンズオン

## 📖 この章のゴール

この章では、**実際に小さな3Dシーンを複数作りながら**、TypeScriptとThree.jsを連携させる方法を段階的に学びます。JavaScriptで書かれたThree.jsのコードをTypeScriptに移行する体験を通じて、TypeScriptがもたらす「型」の安全性のメリットを実感することが目標です。

具体的には、以下の点を重点的に学びます。

-   **なぜThree.jsでTypeScriptを使うのか？:** コード補完、エラーの事前検知など、TypeScriptが開発プロセスにもたらす具体的なメリットを体験します。
-   **Three.jsオブジェクトの型:** `THREE.Scene`や`THREE.Mesh`など、Three.jsが提供する豊富な型を正しく使う方法を学びます。
-   **型安全な設計パターン:** 設定をオブジェクトとして渡す方法など、安全で拡張しやすいコードの書き方を学びます。
-   **Three.jsの主要APIの理解:** シーン、カメラ、レンダラー、ジオメトリ、マテリアルといったThree.jsの基本的な構成要素と、それらを操作するAPIの役割を理解します。

---

## 🚀 準備：プロジェクトをセットアップしよう

Three.jsとTypeScriptを使った開発を始めるために、まずはプロジェクトの基本的な環境をセットアップします。以下のコマンドをターミナルで実行してください。

```bash
# 1. プロジェクト用の新しいフォルダを作成します。
mkdir threejs-practice

# 2. 作成したフォルダに移動します。
cd threejs-practice

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

## 🎯 プロジェクト1: 最初のシーン (JavaScriptからTypeScriptへ)

このプロジェクトでは、まずJavaScriptで書かれたシンプルなThree.jsのコードを見て、その後に同じ機能をTypeScriptで書き直します。この比較を通じて、TypeScriptが開発にもたらす具体的なメリットを体験しましょう。

### Step 1-1: JavaScriptで基本的なシーンを作る（比較のため）

まずは、Three.jsで最も基本的な3DシーンをJavaScriptで作成します。このコードは、シーン、カメラ、レンダラーを設定し、緑色の立方体を画面に表示して回転させるものです。

`index.html`というファイルをプロジェクトのルートに作成し、以下のコードを記述してください。

```html
<!DOCTYPE html>
<html>
<head>
    <title>Three.js Practice</title>
    <style>
        /* bodyとcanvasの余白をなくし、canvasをブロック要素にする */
        body { margin: 0; overflow: hidden; }
        canvas { display: block; }
    </style>
</head>
<body>
    <!-- このJavaScriptファイルを読み込みます -->
    <script type="module" src="./scene1-js.js"></script>
</body>
</html>
```

次に、`scene1-js.js`というファイルをプロジェクトのルートに作成し、以下のコードを記述してください。

```javascript
// scene1-js.js - JavaScriptで書かれた基本的なThree.jsシーン
import * as THREE from 'three';

// 1. シーン（舞台）、カメラ（撮影機材）、レンダラー（映写機）を用意します。
//    これらはThree.jsで3Dシーンを構築する上で最も基本的な3つの要素です。
const scene = new THREE.Scene();
// new THREE.PerspectiveCamera(fov, aspect, near, far):
// 遠近感のあるカメラを作成します。人間の視界に最も近いカメラです。
// - fov (視野角): カメラが見る範囲の角度。75度は一般的な値です。
// - aspect (アスペクト比): 描画領域の幅を高さで割った値。`window.innerWidth / window.innerHeight`で画面全体に合わせます。
// - near (近クリッピング面): カメラに映る最も手前の距離。これより近いオブジェクトは描画されません。
// - far (遠クリッピング面): カメラに映る最も遠い距離。これより遠いオブジェクトは描画されません。
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// new THREE.WebGLRenderer(): WebGLを使って3Dシーンを描画するレンダラーを作成します。
const renderer = new THREE.WebGLRenderer();

// 2. レンダラーの設定を行います。
// renderer.setSize(width, height): レンダラーの描画サイズを設定します。ここでは画面全体に設定しています。
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.domElement: レンダラーが描画を行うためのHTMLの`<canvas>`要素です。
// これをHTMLの`<body>`要素に追加することで、画面に3Dシーンが表示されます。
document.body.appendChild(renderer.domElement);

// 3. オブジェクト（緑色のキューブ）を作成して、シーンに追加します。
// new THREE.BoxGeometry(width, height, depth): 幅、高さ、奥行きを指定して立方体の「形状データ」を作成します。
const geometry = new THREE.BoxGeometry(1, 1, 1);
// new THREE.MeshBasicMaterial({ color: ... }):
// 光源を必要としない、最も基本的な「材質」を作成します。設定した色でそのまま表示されます。
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// new THREE.Mesh(geometry, material):
// 「形状」と「材質」を組み合わせて、最終的な3Dオブジェクト（メッシュ）を作成します。
const cube = new THREE.Mesh(geometry, material);
// scene.add(object): 作成したオブジェクトをシーンに追加します。これにより、レンダラーがそのオブジェクトを描画できるようになります。
scene.add(cube);

// カメラをZ軸方向に5単位の位置に配置します。これにより、キューブが画面に映るようになります。
camera.position.z = 5;

// 4. アニメーションループを設定します。
//    この関数は、ブラウザの描画サイクルに合わせて繰り返し実行され、オブジェクトの動きやシーンの更新を行います。
function animate() {
    // requestAnimationFrame(callback):
    // ブラウザに次の描画タイミングで指定したコールバック関数を実行するように要求します。
    // これを再帰的に呼び出すことで、ブラウザの描画サイクルに合わせたスムーズなアニメーションループが実現されます。
    requestAnimationFrame(animate);
    
    // cube.rotation.x/y: オブジェクトのX軸/Y軸周りの回転角度（ラジアン単位）です。
    // 毎フレーム少しずつ角度を増やすことで、キューブが回転しているように見えます。
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    // renderer.render(scene, camera):
    // 指定したシーンを、指定したカメラの視点から描画します。この処理が毎フレーム実行されることで、3Dシーンがアニメーションとして見えるようになります。
    renderer.render(scene, camera);
}

animate(); // アニメーションループを開始します。

console.log("JavaScript版の基本シーンが完成しました！");
```

**実行方法:**
1.  `package.json`の`scripts`セクションに、Vite開発サーバーを起動するためのコマンドを追加します。
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
2.  ターミナルで以下のコマンドを実行し、Vite開発サーバーを起動します。
    ```bash
    npm run dev
    ```
3.  ターミナルに表示されたURL（例: `http://localhost:5173`）をブラウザで開きます。

ブラウザに緑色の回転するキューブが表示されれば成功です。これがThree.jsで3Dシーンを作成する基本的な流れです。

### Step 1-2: TypeScript版に変換し、「型」のメリットを体験する

次に、先ほどのJavaScriptのコードをTypeScriptで書き直します。コードの見た目は大きく変わりませんが、TypeScriptの「型」を追加することで、開発体験が劇的に向上することを体験しましょう。

`scene1-ts.ts`というファイルをプロジェクトのルートに作成し、以下のコードを記述してください。

```typescript
// scene1-ts.ts - TypeScriptで書かれた型安全な基本シーン
import * as THREE from 'three';

// 変数宣言時に、`@types/three`から提供される「型」を明示的に指定します。
// これにより、TypeScriptがこれらの変数がどのようなオブジェクトであるかを理解し、
// コード補完や型チェックの恩恵を受けられるようになります。
const scene: THREE.Scene = new THREE.Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// オブジェクトの型も明示的に指定します。
const geometry: THREE.BoxGeometry = new THREE.BoxGeometry(1, 1, 1);
const material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// `THREE.Mesh`は、どの`Geometry`と`Material`を使うかをジェネリクス（`<...>`）で示すと、より厳密な型チェックが可能になります。
const cube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial> = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// アニメーションループも型安全に記述します。
// 関数の戻り値がない場合は `: void` を指定します。
function animate(): void {
    requestAnimationFrame(animate);
    
    // ここで`cube.`と入力してみてください。コードエディタが`rotation`や`position`などのプロパティ候補を自動で表示してくれるはずです。
    // これがTypeScriptによる強力なコード補完の恩恵です。
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    renderer.render(scene, camera);
}

// ウィンドウリサイズ時の処理も、型安全に書けます。
window.addEventListener('resize', (): void => {
    const width: number = window.innerWidth;
    const height: number = window.innerHeight;
    
    camera.aspect = width / height;
    // `camera.updateProjectionMatrix()`:
    // カメラのプロパティ（視野角やアスペクト比など）を変更した後に、
    // その変更をThree.jsの内部で反映させるために必ず呼び出す必要があるメソッドです。
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
});

animate();

console.log("TypeScript版の基本シーンが完成しました！");

// ===== TypeScriptの力を試してみよう =====
// 以下の行のコメントを外してみてください。コードエディタが即座にエラーを警告するはずです。
// cube.rotation.z = "hello";
// エラーメッセージ例: Type 'string' is not assignable to type 'number'.
// (意味: 「文字列型は、数値型には代入できません」)
// このように、プログラムを実行する前に型に関するバグを発見できるのが、TypeScriptの最大のメリットです。
```

**ここでの学び:**
-   **型注釈の力:** `変数: 型` の形で、変数や関数の引数・戻り値が「どんな型か」を明示することで、コードの意図が明確になり、読みやすさが向上します。
-   **コンパイル時エラーの発見:** `tsc`コマンドでコンパイルする時や、対応するコードエディタ（VS Codeなど）でコードを書いている時に、型の間違いを即座に発見できます。これにより、JavaScriptで頻発するような実行時エラーを未然に防ぎ、デバッグ時間を大幅に削減できます。
-   **開発体験の向上:** 強力なコード補完機能により、Three.jsの複雑なAPIも迷うことなく記述できるようになります。

---

## 🎨 プロジェクト2: 型安全な図形コレクション

このプロジェクトでは、`interface`を使い、複数の異なる図形を安全に作成・管理する「ファクトリー」パターンを学びます。これにより、オブジェクトの作成ロジックを整理し、再利用性を高めることができます。

`scene2-shapes.ts`というファイルをプロジェクトのルートに作成し、以下のコードを記述してください。

```typescript
// scene2-shapes.ts - interfaceを使って、型安全な図形コレクションを作る
import * as THREE from 'three';

// 1. 図形設定の「設計図」となるインターフェースを定義します。
//    これにより、作成する図形の設定がどのようなプロパティを持つべきかが明確になります。
interface ShapeConfig {
    type: 'box' | 'sphere' | 'cone'; // 図形の種類は、この3つに限定されます（Union Type）
    color: number; // 色は16進数の数値で指定
    position: { x: number; y: number; z: number }; // 3D空間での位置
    scale?: number; // `?` は省略可能なプロパティ。図形の拡大率。
}

// 2. 図形を作成するための静的クラス（ファクトリー）を定義します。
//    このクラスは、設定オブジェクト(ShapeConfig)を受け取って、`THREE.Mesh`を返す役割を持ちます。
class ShapeFactory {
    /**
     * 設定に基づいてThree.jsのジオメトリ（形状）を作成します。
     * @param type 作成するジオメトリの種類
     * @returns 作成された`THREE.BufferGeometry`インスタンス
     */
    static createGeometry(type: ShapeConfig['type']): THREE.BufferGeometry {
        switch (type) {
            case 'box':
                // `new THREE.BoxGeometry(width, height, depth)`: 立方体の形状を作成。
                return new THREE.BoxGeometry(1, 1, 1);
            case 'sphere':
                // `new THREE.SphereGeometry(radius, widthSegments, heightSegments)`:
                // 球体の形状を作成します。`widthSegments`と`heightSegments`は球の滑らかさを決定する分割数です。
                // 数値が大きいほど滑らかになりますが、描画負荷も高くなります。
                return new THREE.SphereGeometry(0.5, 32, 16);
            case 'cone':
                // `new THREE.ConeGeometry(radius, height, radialSegments)`: 円錐の形状を作成します。
                return new THREE.ConeGeometry(0.5, 1, 8);
            default:
                // TypeScriptの網羅性チェック: `ShapeConfig['type']`に新しい値が追加された場合、
                // ここがコンパイルエラーになり、新しい図形タイプの処理を書き忘れるのを防げます。
                const _exhaustive: never = type;
                throw new Error(`Unknown shape type: ${_exhaustive}`);
        }
    }
    
    /**
     * 設定に基づいてThree.jsの`Mesh`（3Dオブジェクト）を作成します。
     * @param config 図形の設定オブジェクト
     * @returns 作成された`THREE.Mesh`インスタンス
     */
    static createShape(config: ShapeConfig): THREE.Mesh {
        // 設定に応じてジオメトリ（形状）を作成します。
        const geometry = this.createGeometry(config.type);
        // `new THREE.MeshLambertMaterial({ color: ... })`:
        // 光源の影響を受ける、光沢のない（マットな）材質を作成します。影や光の方向を表現できます。
        const material = new THREE.MeshLambertMaterial({ color: config.color });
        
        // ジオメトリとマテリアルを組み合わせてメッシュを作成します。
        const mesh = new THREE.Mesh(geometry, material);
        
        // `mesh.position.set(x, y, z)`: オブジェクトの3D空間における位置を一度に設定します。
        mesh.position.set(config.position.x, config.position.y, config.position.z);
        
        // `mesh.scale.setScalar(value)`: オブジェクトのX, Y, Z軸の拡大率を同じ値に設定します。
        // `?? 1`は、`config.scale`が`null`または`undefined`の場合に`1`を使用するという意味です。
        const scale = config.scale ?? 1;
        mesh.scale.setScalar(scale);
        
        return mesh;
    }
}

// 3. シーンのセットアップ（基本的なThree.jsの初期化処理）
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0); // 背景を明るいグレーに設定
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

// 4. ライトを追加します。
//    `MeshLambertMaterial`は光源の影響を受けるため、ライトがないとオブジェクトが真っ黒に見えます。
// `new THREE.AmbientLight(color, intensity)`: シーン全体を均一に照らす環境光。
scene.add(new THREE.AmbientLight(0x404040, 1));
// `new THREE.DirectionalLight(color, intensity)`: 特定の方向から照らす平行光。
const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(5, 5, 5);
scene.add(light);

// 5. `ShapeConfig`の配列を定義します。
//    この配列にあるオブジェクトは、すべて`ShapeConfig`のルールに従っている必要があります。
const shapeConfigs: ShapeConfig[] = [
    { type: 'box', color: 0xff0000, position: { x: -2, y: 0, z: 0 } },
    { type: 'sphere', color: 0x00ff00, position: { x: 0, y: 0, z: 0 }, scale: 1.2 },
    { type: 'cone', color: 0x0000ff, position: { x: 2, y: 0, z: 0 } },
    // 以下の行のコメントを外すと、コンパイルエラーになります。
    // `'torus'`は`ShapeConfig`の`type`に定義されていないためです。
    // { type: 'torus', color: 0xffff00, position: { x: 0, y: -2, z: 0 } },
];

// 6. 設定配列を元に、一括で図形を作成してシーンに追加します。
const shapes = shapeConfigs.map(config => {
    const shape = ShapeFactory.createShape(config);
    scene.add(shape);
    return shape;
});

camera.position.set(0, 2, 5);
camera.lookAt(0, 0, 0);

// 7. アニメーションループを設定します。
function animate(): void {
    requestAnimationFrame(animate);
    // シーン内の各図形をY軸周りに回転させます。
    shapes.forEach(shape => { shape.rotation.y += 0.01; });
    renderer.render(scene, camera);
}
animate();

console.log(`${shapes.length}個の図形を作成しました！`);
```

**ここでの学び:**
-   **設定オブジェクトパターン:** オブジェクトの作成に必要な情報を一つのオブジェクトにまとめることで、関数の引数が多くなるのを防ぎ、コードの可読性を高めます。
-   **ファクトリーパターン:** オブジェクトの作成処理を専門のクラス（`ShapeFactory`）に任せることで、作成ロジックが複雑になっても、使う側は`createShape`を呼ぶだけで済むようになります。これにより、コードが整理され、再利用性が向上します。
-   **`interface`と`Union Type`の活用:** `ShapeConfig`インターフェースと`type`プロパティの`Union Type`を組み合わせることで、作成できる図形の種類を制限し、型安全性を確保しながら柔軟なオブジェクト生成を実現しました。

---

## 🎮 プロジェクト3: インタラクティブなシーン

このプロジェクトでは、クラスとイベントリスナーを使い、ユーザーのキーボード操作で動的にシーンが変化する、よりインタラクティブなアプリケーションを作成します。オブジェクトの追加と削除を通じて、Three.jsにおけるリソース管理の重要性も学びます。

`scene3-interactive.ts`というファイルをプロジェクトのルートに作成し、以下のコードを記述してください。

```typescript
// scene3-interactive.ts - ユーザー操作で変化するインタラクティブなシーン
import * as THREE from 'three';

/**
 * このシーン全体を管理するクラス。
 * シーン、カメラ、レンダラー、そしてシーン内のオブジェクトの配列といった、
 * シーンに関連する全ての状態をこのクラスが管理します。
 */
class InteractiveScene {
    // `private`修飾子により、これらのプロパティはクラスの内部でのみ使用可能です。
    // 外部からの意図しない変更を防ぎ、クラスの内部実装を隠蔽します（カプセル化）。
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private shapes: THREE.Mesh[] = []; // シーンに追加された図形を管理する配列
    
    constructor() {
        // コンストラクタで基本的なThree.jsのセットアップを呼び出します。
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        this.init();
    }
    
    /**
     * Three.jsの基本的なセットアップを行うプライベートメソッド。
     */
    private init(): void {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        
        // ライトを追加します。
        this.scene.add(new THREE.AmbientLight(0x404040, 1));
        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(5, 5, 5);
        this.scene.add(light);
        
        // カメラの位置を設定し、シーンの中心を向かせます。
        this.camera.position.set(0, 2, 8);
        this.camera.lookAt(0, 0, 0);
        
        // イベントリスナー（ユーザーの操作やブラウザの状態変化を待つ仕組み）を設定します。
        this.setupEventListeners();
    }
    
    /**
     * キーボードイベントなどのイベントリスナーを設定するプライベートメソッド。
     */
    private setupEventListeners(): void {
        // `window.addEventListener('keydown', ...)`: キーボードが押された時に実行される処理を設定します。
        // `event: KeyboardEvent`と型を明記することで、`event.key`などのプロパティが安全に利用できます。
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            this.handleKeyPress(event.key);
        });
    }
    
    /**
     * キー入力に応じた処理を実行するプライベートメソッド。
     * @param key 押されたキーの文字列
     */
    private handleKeyPress(key: string): void {
        switch (key.toLowerCase()) {
            case 'b': // 'b'キーが押されたらボックスを追加
                this.addShape('box');
                break;
            case 's': // 's'キーが押されたら球体を追加
                this.addShape('sphere');
                break;
            case 'r': // 'r'キーが押されたら全ての図形を削除
                this.clearAllShapes();
                break;
        }
    }
    
    /**
     * 指定された種類の図形をシーンに追加するパブリックメソッド。
     * @param type 追加する図形の種類（'box'または'sphere'）
     */
    public addShape(type: 'box' | 'sphere'): void {
        let geometry: THREE.BufferGeometry;
        if (type === 'box') {
            geometry = new THREE.BoxGeometry(1, 1, 1);
        } else {
            geometry = new THREE.SphereGeometry(0.7, 32, 16);
        }
        
        // `new THREE.MeshLambertMaterial({ color: ... })`: 光源の影響を受ける材質。
        // `Math.random() * 0xffffff`でランダムな色を生成します。
        const material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
        const shape = new THREE.Mesh(geometry, material);
        
        // 図形をランダムな位置に配置します。
        shape.position.set(
            (Math.random() - 0.5) * 10, // -5から5の範囲
            (Math.random() - 0.5) * 5,  // -2.5から2.5の範囲
            (Math.random() - 0.5) * 5
        );
        
        this.scene.add(shape);
        this.shapes.push(shape); // 管理用の配列に追加
        console.log(`${type}を追加しました。現在の合計: ${this.shapes.length}個`);
    }
    
    /**
     * シーン内の全ての図形を削除し、関連するリソースを解放するパブリックメソッド。
     * メモリリークを防ぐために非常に重要です。
     */
    public clearAllShapes(): void {
        this.shapes.forEach(shape => {
            // `scene.remove(shape)`: まずシーンからオブジェクトを削除します。これにより、描画対象から外れます。
            this.scene.remove(shape);

            // --- メモリリーク対策：ここからが重要 ---
            // Three.jsのオブジェクト（ジオメトリやマテリアル）は、WebGLのGPUメモリを使用します。
            // シーンから削除するだけではGPUメモリは解放されないため、明示的に`dispose()`を呼び出す必要があります。
            // これを怠ると、アプリケーションが長時間実行されるとメモリ使用量が増え続け、パフォーマンス低下やクラッシュの原因になります。
            
            // `shape.geometry.dispose()`: ジオメトリ（形状データ）が使用しているGPUメモリを解放します。
            shape.geometry.dispose();

            // `shape.material.dispose()`: マテリアル（材質データ）が使用しているGPUメモリ（テクスチャなど）を解放します。
            // マテリアルが配列の場合も考慮して、それぞれを解放します。
            if (Array.isArray(shape.material)) {
                shape.material.forEach(m => m.dispose());
            } else {
                shape.material.dispose();
            }
        });
        this.shapes = []; // 管理用の配列も空にします。
        console.log("全ての図形を削除し、リソースを解放しました。");
    }
    
    /**
     * アニメーションループを開始するパブリックメソッド。
     */
    public animate(): void {
        // `requestAnimationFrame`を再帰的に呼び出すことで、アニメーションループを実現します。
        requestAnimationFrame(() => this.animate());
        
        // シーン内の各図形を回転させます。
        this.shapes.forEach(shape => { shape.rotation.x += 0.01; shape.rotation.y += 0.01; });
        
        // シーンをレンダリングします。
        this.renderer.render(this.scene, this.camera);
    }
}

// ===== 実行 =====
// `InteractiveScene`のインスタンスを作成し、アニメーションを開始します。
const scene = new InteractiveScene();
scene.animate();

// 初期表示としてボックスを一つ追加します。
scene.addShape('box');

// 操作説明をコンソールに表示します。
console.log(`
=== インタラクティブシーン ===
キーボード操作で図形を追加・削除できます。
  B: ボックスを追加
  S: 球体を追加
  R: 全ての図形を削除
`);
```

**ここでの学び:**
-   **クラスによる状態管理:** シーン、カメラ、レンダラー、そしてシーン内のオブジェクトの配列(`shapes`)といった、シーンに関連する全ての状態を`InteractiveScene`クラスが管理しています。これにより、コードが部品化され、見通しが良くなります。
-   **イベントリスナーの活用:** `window.addEventListener`を使ってキーボードイベントを捕捉し、ユーザーの操作に応じて動的に3Dシーンを変化させる方法を学びました。
-   **メモリ管理の重要性:** Three.jsでオブジェクトを削除する際には、`scene.remove()`だけでなく、`geometry.dispose()`や`material.dispose()`を呼び出してGPUメモリを明示的に解放することが非常に重要であることを学びました。これは、複雑なアプリケーションを作る上でメモリリークを防ぐための必須知識です。

---

## 🎓 まとめ: TypeScriptとThree.jsの連携に慣れよう

この章では、JavaScriptからTypeScriptへの移行を体験し、TypeScriptがもたらす開発体験の向上を実感しました。基本的な3Dシーンの構築から、インタラクティブな要素の追加、そしてリソース管理の重要性まで、Three.jsを使った開発の基礎を幅広く学びました。

### ✅ この章で学んだこと
-   **基本的な型付け:** Three.jsのオブジェクトに型を付けることで、コード補完とエラー防止の恩恵を受けられることを学びました。
-   **`interface`による設計:** オブジェクトの設定を`interface`で定義することで、安全で分かりやすいデータ構造を作れるようになりました。
-   **クラスによるカプセル化:** シーンのロジックをクラスにまとめることで、コードを整理し、再利用しやすくする方法を学びました。
-   **動的なシーン構築:** イベントリスナーを使って、ユーザーのアクションに応じてシーンを変化させる方法を学びました。
-   **Three.jsのリソース管理:** `dispose()`メソッドを使って、不要になったオブジェクトのGPUメモリを解放する重要性を理解しました。

TypeScriptの型システムは、一見すると少し手間が増えるように感じるかもしれません。しかし、プロジェクトが大きくなるほど、その安全性と開発効率の高さが強力な武器になります。Three.jsのような大規模なライブラリを扱う際には、特にその恩恵を強く感じられるでしょう。

---

## 🚀 次のステップ

Three.jsとTypeScriptの基本的な連携に慣れたので、次はいよいよ、より本格的で再利用性の高い「基盤クラス」の設計に挑戦します。

**[01. 基本シーンの作成（基盤クラス編）](./01-basic-scene.md)** に進んで、プロフェッショナルなアプリケーション開発の第一歩を踏み出しましょう！
