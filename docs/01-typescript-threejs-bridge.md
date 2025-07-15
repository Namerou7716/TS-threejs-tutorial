# 01.5 TypeScriptとThree.jsの連携 - 実践ハンズオン

## 📖 この章で学ぶこと

**実際に小さな3Dシーンを複数作りながら**、TypeScriptとThree.jsを連携させる方法を段階的に学びます。JavaScriptからの移行を体験し、TypeScriptがもたらす「型」の安全性のメリットを実感することが目標です。

**作成するもの:**
- **シンプルな回転キューブ:** JavaScript版とTypeScript版を比較し、違いを体験します。
- **カラフルな図形コレクション:** `interface`を使い、複数のオブジェクトを安全に管理します。
- **インタラクティブなシーン:** ユーザーのキーボード操作でオブジェクトを追加・削除できるようにします。
- **アニメーション付きシーン:** 様々な動きを型安全な設定で管理します。

**学習のポイント:**
- **なぜThree.jsでTypeScriptを使うのか？:** コード補完、エラーの事前検知など、具体的なメリットを学びます。
- **必須パッケージの理解:** `three`と`@types/three`の役割を理解します。
- **Three.jsオブジェクトの型:** `THREE.Scene`や`THREE.Mesh`など、Three.jsが提供する型を正しく使う方法を学びます。
- **型安全な設計パターン:** 設定をオブジェクトとして渡す方法など、安全で拡張しやすいコードの書き方を学びます。

**想定所要時間:** 45-60分  
**対象者:** TypeScriptの基本的な文法を理解している方

---

## 🚀 準備：プロジェクトをセットアップしよう

（このセットアップは前の章と同じです。既に環境がある場合はスキップできます）

```bash
mkdir threejs-practice
cd threejs-practice
npm init -y
npm install three
npm install -D typescript @types/three @types/node vite
npx tsc --init
```
**ワンポイント:**
- `three`: Three.jsライブラリ本体です。
- `@types/three`: Three.jsの全てのクラスや関数にTypeScriptの型定義を提供してくれる、非常に重要なパッケージです。これがあるおかげで、TypeScriptの恩恵を受けられます。
- `vite`: 開発用のWebサーバーです。ファイルの変更を検知して自動でブラウザを更新してくれるなど、開発を快適にします。

---

## 🎯 プロジェクト1: 最初のシーン (JavaScriptからTypeScriptへ)

### Step 1-1: JavaScriptで基本的なシーンを作る（比較のため）

まず、比較対象として、ごく一般的なJavaScriptで書かれたThree.jsのコードを見てみましょう。

**index.html** (プロジェクトルートに作成)
```html
<!DOCTYPE html>
<html>
<head>
    <title>Three.js Practice</title>
    <style> body { margin: 0; overflow: hidden; } </style>
</head>
<body>
    <!-- このJavaScriptファイルを読み込みます -->
    <script type="module" src="./scene1-js.js"></script>
</body>
</html>
```

**scene1-js.js**
```javascript
// scene1-js.js - JavaScriptで書かれた基本的なThree.jsシーン
import * as THREE from 'three';

// 1. シーン（舞台）、カメラ、レンダラー（映写機）を用意
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// 2. レンダラーを画面サイズに設定し、HTMLに追加
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 3. オブジェクト（緑色のキューブ）を作成して、シーンに追加
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5; // カメラを少し後ろに下げる

// 4. アニメーションループ：毎フレーム呼ばれる処理
function animate() {
    requestAnimationFrame(animate); // 次のフレームでもこの関数を呼ぶように予約
    
    // キューブを少しずつ回転させる
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    // シーンをレンダリング（描画）
    renderer.render(scene, camera);
}

animate(); // アニメーション開始
```

**Viteで実行してみましょう：**
```bash
# package.jsonのscriptsに `"dev": "vite"` を追加してから実行
npm run dev
```
ブラウザで緑色の回転するキューブが表示されれば成功です。

---

### Step 1-2: TypeScript版に変換し、「型」のメリットを体験する

同じ機能を、今度はTypeScriptで書いてみます。どこが変わるかに注目してください。

**scene1-ts.ts**
```typescript
// scene1-ts.ts - TypeScriptで書かれた型安全な基本シーン
import * as THREE from 'three';

// 変数宣言時に、`@types/three`から提供される「型」を明示的に指定する
const scene: THREE.Scene = new THREE.Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// オブジェクトの型も指定する
const geometry: THREE.BoxGeometry = new THREE.BoxGeometry(1, 1, 1);
const material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// Meshは、どのGeometryとMaterialを使うかをジェネリクスで示すと、より厳密になる
const cube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial> = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// 関数の戻り値がない場合は `: void` を指定する
function animate(): void {
    requestAnimationFrame(animate);
    
    // `cube.`と入力すると、エディタが`rotation`などのプロパティを補完してくれる！
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    renderer.render(scene, camera);
}

// ウィンドウリサイズ時の処理も、型安全に書ける
window.addEventListener('resize', (): void => {
    const width: number = window.innerWidth;
    const height: number = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix(); // カメラのプロパティ変更後に必須
    
    renderer.setSize(width, height);
});

animate();

// ===== TypeScriptの力を試してみよう =====
// 以下の行のコメントを外すと、すぐにコンパイルエラーになる
// cube.rotation.z = "hello"; // エラー: Type 'string' is not assignable to type 'number'.
// (意味: 「文字列型は、数値型には代入できません」)
// このように、実行前にバグを発見できるのが最大のメリット。
```
**💡 TypeScriptの利点:**
- **コード補完:** `cube.`のように入力すると、`rotation`や`position`などのプロパティ候補が表示され、タイプミスが減ります。
- **エラーの事前検知:** 数値を入れるべき場所に文字列を入れようとすると、実行する前にエディタがエラーを教えてくれます。
- **可読性の向上:** 変数がどんな型のオブジェクトなのかが一目瞭然になり、コードが読みやすくなります。

---

## 🎨 プロジェクト2: 型安全な図形コレクション

`interface`を使い、複数の異なる図形を安全に作成・管理する「ファクトリー」パターンを学びます。

**scene2-shapes.ts**
```typescript
// scene2-shapes.ts - interfaceを使って、型安全な図形コレクションを作る
import * as THREE from 'three';

// 1. 図形設定の「設計図」となるインターフェースを定義
interface ShapeConfig {
    type: 'box' | 'sphere' | 'cone'; // 図形の種類は、この3つに限定
    color: number; // 色は16進数の数値
    position: { x: number; y: number; z: number };
    scale?: number; // `?` は省略可能なプロパティ
}

// 2. 図形を作成するための静的クラス（ファクトリー）
//    設定オブジェクト(ShapeConfig)を受け取って、THREE.Meshを返す役割を持つ
class ShapeFactory {
    static createShape(config: ShapeConfig): THREE.Mesh {
        // 設定に応じてジオメトリ（形状）を決定
        let geometry: THREE.BufferGeometry;
        switch (config.type) {
            case 'box': geometry = new THREE.BoxGeometry(1, 1, 1); break;
            case 'sphere': geometry = new THREE.SphereGeometry(0.5, 32, 16); break;
            case 'cone': geometry = new THREE.ConeGeometry(0.5, 1, 8); break;
        }

        // マテリアル（材質）を作成
        const material = new THREE.MeshLambertMaterial({ color: config.color });
        
        // メッシュ（形状と材質を組み合わせたもの）を作成
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(config.position.x, config.position.y, config.position.z);
        mesh.scale.setScalar(config.scale ?? 1); // scaleが未指定なら1を適用
        
        return mesh;
    }
}

// 3. シーンのセットアップ（定型的な処理）
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0); // 背景を白っぽく
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

// 4. ライトを追加（MeshLambertMaterialはライトが必要）
scene.add(new THREE.AmbientLight(0x404040, 1));
const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(5, 5, 5);
scene.add(light);

// 5. ShapeConfigの配列を定義
//    この配列にあるオブジェクトは、すべてShapeConfigのルールに従っている必要がある
const shapeConfigs: ShapeConfig[] = [
    { type: 'box', color: 0xff0000, position: { x: -2, y: 0, z: 0 } },
    { type: 'sphere', color: 0x00ff00, position: { x: 0, y: 0, z: 0 }, scale: 1.2 },
    { type: 'cone', color: 0x0000ff, position: { x: 2, y: 0, z: 0 } },
    // { type: 'torus', ... } // エラー！ 'torus'はShapeConfigのtypeに定義されていない
];

// 6. 設定配列を元に、一括で図形を作成してシーンに追加
const shapes = shapeConfigs.map(config => {
    const shape = ShapeFactory.createShape(config);
    scene.add(shape);
    return shape;
});

camera.position.set(0, 2, 5);
camera.lookAt(0, 0, 0);

// 7. アニメーション
function animate(): void {
    requestAnimationFrame(animate);
    shapes.forEach(shape => { shape.rotation.y += 0.01; });
    renderer.render(scene, camera);
}
animate();
```
**💡 ここでの学び:**
- **設定オブジェクトパターン:** オブジェクトの作成に必要な情報を一つのオブジェクトにまとめる方法です。引数が多くなるのを防ぎ、コードが読みやすくなります。
- **ファクトリーパターン:** オブジェクトの作成処理を専門のクラス（`ShapeFactory`）に任せる方法です。作成ロジックが複雑になっても、使う側は`createShape`を呼ぶだけで済むので、コードが整理されます。

---

## 🎮 プロジェクト3: インタラクティブなシーン

クラスとイベントリスナーを使い、ユーザーの操作で動的にシーンが変化する、よりインタラクティブなアプリケーションを作成します。

**scene3-interactive.ts**
```typescript
// scene3-interactive.ts - ユーザー操作で変化するインタラクティブなシーン
import * as THREE from 'three';

// このシーン全体を管理するクラス
class InteractiveScene {
    // private修飾子で、クラスの外部から直接アクセスできないようにする
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private shapes: THREE.Mesh[] = [];
    
    constructor() {
        // コンストラクタで基本的なセットアップを呼び出す
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        this.init();
    }
    
    // 初期化処理をまとめたメソッド
    private init(): void {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        
        this.scene.add(new THREE.AmbientLight(0x404040, 1));
        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(5, 5, 5);
        this.scene.add(light);
        
        this.camera.position.set(0, 2, 8);
        this.camera.lookAt(0, 0, 0);
        
        // イベントリスナー（ユーザーの操作を待つ仕組み）を設定
        this.setupEventListeners();
    }
    
    // イベントリスナーをまとめたメソッド
    private setupEventListeners(): void {
        // キーボードが押された時の処理
        // eventの型を`KeyboardEvent`と明記することで、`event.key`などが安全に使える
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            this.handleKeyPress(event.key);
        });
    }
    
    // キー入力に応じた処理
    private handleKeyPress(key: string): void {
        switch (key.toLowerCase()) {
            case 'b': // Bキーでボックスを追加
                this.addShape('box');
                break;
            case 's': // Sキーでスフィアを追加
                this.addShape('sphere');
                break;
            case 'r': // Rキーで全て削除
                this.clearAllShapes();
                break;
        }
    }
    
    // 図形を追加するメソッド
    public addShape(type: 'box' | 'sphere'): void {
        let geometry: THREE.BufferGeometry;
        if (type === 'box') {
            geometry = new THREE.BoxGeometry(1, 1, 1);
        } else {
            geometry = new THREE.SphereGeometry(0.7, 32, 16);
        }
        
        const material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
        const shape = new THREE.Mesh(geometry, material);
        
        shape.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5
        );
        
        this.scene.add(shape);
        this.shapes.push(shape);
        console.log(`${type}を追加しました。現在の合計: ${this.shapes.length}個`);
    }
    
    // 全ての図形を削除するメソッド
    public clearAllShapes(): void {
        this.shapes.forEach(shape => {
            this.scene.remove(shape);
            // メモリリークを防ぐために、ジオメトリとマテリアルも破棄する
            shape.geometry.dispose();
            if (Array.isArray(shape.material)) {
                shape.material.forEach(m => m.dispose());
            } else {
                shape.material.dispose();
            }
        });
        this.shapes = []; // 配列を空にする
        console.log("全ての図形を削除しました。");
    }
    
    // アニメーションループ
    public animate(): void {
        requestAnimationFrame(() => this.animate());
        this.shapes.forEach(shape => { shape.rotation.x += 0.01; shape.rotation.y += 0.01; });
        this.renderer.render(this.scene, this.camera);
    }
}

// ===== 実行 =====
const scene = new InteractiveScene();
scene.animate();

// 最初の図形を追加
scene.addShape('box');

// 操作説明をコンソールに表示
console.log(`
=== インタラクティブシーン ===
操作方法:
  B: ボックスを追加
  S: 球体を追加
  R: 全ての図形を削除
`);
```
**💡 ここでの学び:**
- **クラスによる状態管理:** シーン、カメラ、オブジェクトの配列(`shapes`)といった、シーンに関連する全ての状態を`InteractiveScene`クラスが管理しています。これにより、コードが部品化され、見通しが良くなります。
- **メモリ管理の基礎:** `dispose()`メソッドを呼ぶことで、不要になったオブジェクトが使用していたメモリを解放できます。これは、複雑なアプリケーションを作る上で非常に重要です。

---

## 🎓 まとめ: TypeScriptとThree.jsの連携に慣れよう

この章では、JavaScriptからTypeScriptへの移行を体験し、TypeScriptがもたらす開発体験の向上を実感しました。

### ✅ 学んだこと
- **基本的な型付け:** Three.jsのオブジェクトに型を付けることで、コード補完とエラー防止の恩恵を受けられることを学びました。
- **`interface`による設計:** オブジェクトの設定を`interface`で定義することで、安全で分かりやすいデータ構造を作れるようになりました。
- **クラスによるカプセル化:** シーンのロジックをクラスにまとめることで、コードを整理し、再利用しやすくする方法を学びました。
- **動的なシーン構築:** イベントリスナーを使って、ユーザーのアクションに応じてシーンを変化させる方法を学びました。

TypeScriptの型システムは、一見すると少し手間が増えるように感じるかもしれません。しかし、プロジェクトが大きくなるほど、その安全性と開発効率の高さが強力な武器になります。

## 🚀 次のステップ

Three.jsとTypeScriptの基本的な連携に慣れたので、次はいよいよ、より本格的で再利用性の高い「基盤クラス」の設計に挑戦します。

**[01. 基本シーンの作成（基盤クラス編）](./01-basic-scene.md)** に進んで、プロフェッショナルなアプリケーション開発の第一歩を踏み出しましょう！
