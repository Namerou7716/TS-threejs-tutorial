# 01.5 TypeScript × Three.js連携 - ハンズオン学習

## 📖 学習目標

**実際に小さなシーンを複数作りながら**、TypeScriptとThree.jsの連携を学び、段階的にライブラリに慣れていきます。

**作成するもの:**
- シンプルな回転キューブ（JS版 → TS版）
- カラフルな図形コレクション
- インタラクティブなシーン
- アニメーション付きシーン

**学習内容:**
- Three.jsでTypeScriptを使う理由
- 必要なパッケージ（three、@types/three）の理解
- Three.jsオブジェクトの型を理解する
- 型安全なコード作成パターン
- 設定オブジェクトの型安全な設計

**所要時間:** 45-60分  
**対象者:** TypeScript基礎を理解した方

## 🚀 セットアップ

作業用のフォルダを作成して、Three.jsをインストールしましょう：

```bash
mkdir threejs-practice
cd threejs-practice
npm init -y
npm install three
npm install -D typescript @types/three @types/node vite
npx tsc --init
```

## 🎯 プロジェクト1: 最初のシーン（JS → TS変換体験）

### Step 1-1: JavaScriptで基本シーンを作る

まず、JavaScriptでシンプルなThree.jsシーンを作成します：

**index.html**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Three.js Practice</title>
    <style>
        body { margin: 0; overflow: hidden; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script type="module" src="./scene1-js.js"></script>
</body>
</html>
```

**scene1-js.js**
```javascript
// scene1-js.js - JavaScript版の基本シーン
import * as THREE from 'three';

// 基本的な3つの要素
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// レンダラーの設定
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// キューブを作成
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// カメラの位置設定
camera.position.z = 5;

// アニメーションループ
function animate() {
    requestAnimationFrame(animate);
    
    // キューブを回転
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    renderer.render(scene, camera);
}

// 実行
animate();

console.log("JavaScript版完成！");
```

**実行してみよう：**
```bash
npx vite
```

### Step 1-2: TypeScript版に変換する

同じ機能をTypeScriptで書き直します：

**scene1-ts.ts**
```typescript
// scene1-ts.ts - TypeScript版の基本シーン
import * as THREE from 'three';

// 型を明示的に指定
const scene: THREE.Scene = new THREE.Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();

// レンダラーの設定
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// キューブを作成（型指定付き）
const geometry: THREE.BoxGeometry = new THREE.BoxGeometry(1, 1, 1);
const material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial> = new THREE.Mesh(geometry, material);
scene.add(cube);

// カメラの位置設定
camera.position.z = 5;

// アニメーションループ（型安全）
function animate(): void {
    requestAnimationFrame(animate);
    
    // キューブを回転（プロパティが自動補完される）
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    renderer.render(scene, camera);
}

// ウィンドウリサイズ処理（型安全）
window.addEventListener('resize', (): void => {
    const width: number = window.innerWidth;
    const height: number = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
});

// 実行
animate();

console.log("TypeScript版完成！キューブをクリックしてみてください！");

// 型安全性のテスト
// cube.rotation.z = "文字列"; // ❌ エラー: Type 'string' is not assignable to type 'number'
```

**💡 TypeScriptの利点を体験：**
- 自動補完が効く（`cube.rotation.`まで入力すると候補が表示）
- 型エラーでバグを事前に防げる
- IDEのリファクタリング支援

## 🎨 プロジェクト2: カラフルな図形コレクション

### Step 2-1: 設定オブジェクトパターンを学ぶ

複数の図形を型安全に管理するシステムを作ります：

**scene2-shapes.ts**
```typescript
// scene2-shapes.ts - 型安全な図形コレクション
import * as THREE from 'three';

// 図形の設定を型で定義
interface ShapeConfig {
    type: 'box' | 'sphere' | 'cone' | 'cylinder';
    color: number;
    position: {
        x: number;
        y: number;
        z: number;
    };
    scale?: number; // 省略可能
}

class TypeSafeShapeFactory {
    static createGeometry(type: ShapeConfig['type']): THREE.BufferGeometry {
        switch (type) {
            case 'box':
                return new THREE.BoxGeometry(1, 1, 1);
            case 'sphere':
                return new THREE.SphereGeometry(0.5, 32, 16);
            case 'cone':
                return new THREE.ConeGeometry(0.5, 1, 8);
            case 'cylinder':
                return new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
            default:
                // TypeScriptの網羅性チェック
                const _exhaustive: never = type;
                throw new Error(`Unknown shape type: ${_exhaustive}`);
        }
    }
    
    static createShape(config: ShapeConfig): THREE.Mesh {
        const geometry = this.createGeometry(config.type);
        const material = new THREE.MeshLambertMaterial({ color: config.color });
        const mesh = new THREE.Mesh(geometry, material);
        
        // 位置設定
        mesh.position.set(config.position.x, config.position.y, config.position.z);
        
        // スケール設定（デフォルトは1）
        const scale = config.scale ?? 1;
        mesh.scale.setScalar(scale);
        
        return mesh;
    }
}

// シーンセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ライティング追加
const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// 複数の図形を作成（型安全）
const shapeConfigs: ShapeConfig[] = [
    { type: 'box', color: 0xff0000, position: { x: -2, y: 0, z: 0 } },
    { type: 'sphere', color: 0x00ff00, position: { x: 0, y: 0, z: 0 }, scale: 1.2 },
    { type: 'cone', color: 0x0000ff, position: { x: 2, y: 0, z: 0 } },
    { type: 'cylinder', color: 0xffff00, position: { x: 0, y: 2, z: 0 }, scale: 0.8 }
];

// 図形を作成してシーンに追加
const shapes: THREE.Mesh[] = shapeConfigs.map(config => {
    const shape = TypeSafeShapeFactory.createShape(config);
    scene.add(shape);
    return shape;
});

// カメラ位置
camera.position.set(3, 3, 5);
camera.lookAt(0, 0, 0);

// アニメーション
function animate(): void {
    requestAnimationFrame(animate);
    
    // 各図形を回転
    shapes.forEach((shape, index) => {
        shape.rotation.x += 0.01 * (index + 1);
        shape.rotation.y += 0.01 * (index + 1);
    });
    
    renderer.render(scene, camera);
}

animate();

console.log(`${shapes.length}個の図形を作成しました！`);
```

### Step 2-2: 動的図形追加システム

ユーザーが図形を動的に追加できるシステムを作ります：

**scene3-interactive.ts**
```typescript
// scene3-interactive.ts - インタラクティブな図形追加
import * as THREE from 'three';

// より詳細な図形設定
interface AdvancedShapeConfig {
    type: 'box' | 'sphere' | 'cone';
    color: number;
    position: THREE.Vector3;
    rotation?: THREE.Vector3;
    wireframe?: boolean;
}

class InteractiveScene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private shapes: THREE.Mesh[] = [];
    
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        this.setup();
    }
    
    private setup(): void {
        // レンダラー設定
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        
        // ライティング
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
        
        // カメラ位置
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
        
        // イベントリスナー
        this.setupEventListeners();
    }
    
    private setupEventListeners(): void {
        // リサイズ処理
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // キーボードイベント
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            this.handleKeyPress(event.key);
        });
    }
    
    private handleKeyPress(key: string): void {
        const randomPosition = new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
        );
        
        const randomColor = Math.random() * 0xffffff;
        
        switch (key.toLowerCase()) {
            case 'b':
                this.addShape({
                    type: 'box',
                    color: randomColor,
                    position: randomPosition
                });
                break;
            case 's':
                this.addShape({
                    type: 'sphere',
                    color: randomColor,
                    position: randomPosition
                });
                break;
            case 'c':
                this.addShape({
                    type: 'cone',
                    color: randomColor,
                    position: randomPosition
                });
                break;
            case 'w':
                this.toggleWireframe();
                break;
            case 'r':
                this.clearAll();
                break;
        }
    }
    
    public addShape(config: AdvancedShapeConfig): THREE.Mesh {
        let geometry: THREE.BufferGeometry;
        
        switch (config.type) {
            case 'box':
                geometry = new THREE.BoxGeometry(1, 1, 1);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(0.5, 32, 16);
                break;
            case 'cone':
                geometry = new THREE.ConeGeometry(0.5, 1, 8);
                break;
        }
        
        const material = new THREE.MeshLambertMaterial({
            color: config.color,
            wireframe: config.wireframe ?? false
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(config.position);
        
        if (config.rotation) {
            mesh.rotation.copy(config.rotation);
        }
        
        this.scene.add(mesh);
        this.shapes.push(mesh);
        
        return mesh;
    }
    
    private toggleWireframe(): void {
        this.shapes.forEach(shape => {
            if (shape.material instanceof THREE.MeshLambertMaterial) {
                shape.material.wireframe = !shape.material.wireframe;
            }
        });
    }
    
    private clearAll(): void {
        this.shapes.forEach(shape => {
            this.scene.remove(shape);
            shape.geometry.dispose();
            if (shape.material instanceof THREE.Material) {
                shape.material.dispose();
            }
        });
        this.shapes = [];
    }
    
    public animate(): void {
        requestAnimationFrame(() => this.animate());
        
        // 図形をアニメーション
        this.shapes.forEach((shape, index) => {
            shape.rotation.x += 0.01;
            shape.rotation.y += 0.01;
            
            // 上下に動かす
            shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
        });
        
        this.renderer.render(this.scene, this.camera);
    }
    
    public getShapeCount(): number {
        return this.shapes.length;
    }
}

// 使用方法
const interactiveScene = new InteractiveScene();
interactiveScene.animate();

// 初期図形を追加
interactiveScene.addShape({
    type: 'box',
    color: 0xff0000,
    position: new THREE.Vector3(0, 0, 0)
});

// コントロール説明をコンソールに表示
console.log(`
=== インタラクティブシーンの操作方法 ===
B: ボックスを追加
S: 球体を追加  
C: 円錐を追加
W: ワイヤーフレーム切り替え
R: 全削除

現在の図形数: ${interactiveScene.getShapeCount()}個
`);
```

## 🎮 プロジェクト3: アニメーション管理システム

### Step 3-1: アニメーション設定の型定義

**scene4-animations.ts**
```typescript
// scene4-animations.ts - 型安全なアニメーション管理
import * as THREE from 'three';

// アニメーション設定の型定義
interface AnimationConfig {
    rotation?: {
        x?: number;
        y?: number;
        z?: number;
    };
    position?: {
        amplitude?: number;
        frequency?: number;
        axis?: 'x' | 'y' | 'z';
    };
    scale?: {
        min?: number;
        max?: number;
        frequency?: number;
    };
}

interface AnimatedObjectConfig {
    geometry: 'box' | 'sphere' | 'torus';
    material: {
        color: number;
        type: 'basic' | 'lambert' | 'phong';
    };
    position: THREE.Vector3;
    animation: AnimationConfig;
}

class AnimatedObject {
    public mesh: THREE.Mesh;
    private animationConfig: AnimationConfig;
    private startTime: number;
    
    constructor(config: AnimatedObjectConfig) {
        this.mesh = this.createMesh(config);
        this.animationConfig = config.animation;
        this.startTime = Date.now();
    }
    
    private createMesh(config: AnimatedObjectConfig): THREE.Mesh {
        // ジオメトリ作成
        let geometry: THREE.BufferGeometry;
        switch (config.geometry) {
            case 'box':
                geometry = new THREE.BoxGeometry(1, 1, 1);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(0.5, 32, 16);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
                break;
        }
        
        // マテリアル作成
        let material: THREE.Material;
        switch (config.material.type) {
            case 'basic':
                material = new THREE.MeshBasicMaterial({ color: config.material.color });
                break;
            case 'lambert':
                material = new THREE.MeshLambertMaterial({ color: config.material.color });
                break;
            case 'phong':
                material = new THREE.MeshPhongMaterial({ color: config.material.color });
                break;
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(config.position);
        return mesh;
    }
    
    public update(): void {
        const elapsed = (Date.now() - this.startTime) * 0.001; // 秒
        
        // 回転アニメーション
        if (this.animationConfig.rotation) {
            const rot = this.animationConfig.rotation;
            if (rot.x) this.mesh.rotation.x += rot.x;
            if (rot.y) this.mesh.rotation.y += rot.y;
            if (rot.z) this.mesh.rotation.z += rot.z;
        }
        
        // 位置アニメーション
        if (this.animationConfig.position) {
            const pos = this.animationConfig.position;
            const amplitude = pos.amplitude ?? 1;
            const frequency = pos.frequency ?? 1;
            const offset = Math.sin(elapsed * frequency) * amplitude;
            
            switch (pos.axis) {
                case 'x':
                    this.mesh.position.x += offset * 0.01;
                    break;
                case 'y':
                    this.mesh.position.y += offset * 0.01;
                    break;
                case 'z':
                    this.mesh.position.z += offset * 0.01;
                    break;
            }
        }
        
        // スケールアニメーション
        if (this.animationConfig.scale) {
            const scaleConfig = this.animationConfig.scale;
            const min = scaleConfig.min ?? 0.5;
            const max = scaleConfig.max ?? 1.5;
            const frequency = scaleConfig.frequency ?? 1;
            
            const scale = min + (max - min) * (Math.sin(elapsed * frequency) + 1) * 0.5;
            this.mesh.scale.setScalar(scale);
        }
    }
}

class AnimationScene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private animatedObjects: AnimatedObject[] = [];
    
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        this.setup();
        this.createAnimatedObjects();
    }
    
    private setup(): void {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        
        // ライティング
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 0.8, 100);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);
        
        this.camera.position.set(0, 0, 10);
    }
    
    private createAnimatedObjects(): void {
        const configurations: AnimatedObjectConfig[] = [
            // 回転するボックス
            {
                geometry: 'box',
                material: { color: 0xff0000, type: 'lambert' },
                position: new THREE.Vector3(-3, 0, 0),
                animation: {
                    rotation: { x: 0.02, y: 0.01 }
                }
            },
            // 上下に動く球体
            {
                geometry: 'sphere',
                material: { color: 0x00ff00, type: 'phong' },
                position: new THREE.Vector3(0, 0, 0),
                animation: {
                    position: { amplitude: 2, frequency: 2, axis: 'y' }
                }
            },
            // スケールが変わるトーラス
            {
                geometry: 'torus',
                material: { color: 0x0000ff, type: 'basic' },
                position: new THREE.Vector3(3, 0, 0),
                animation: {
                    scale: { min: 0.5, max: 1.5, frequency: 1.5 },
                    rotation: { z: 0.03 }
                }
            }
        ];
        
        configurations.forEach(config => {
            const animatedObject = new AnimatedObject(config);
            this.scene.add(animatedObject.mesh);
            this.animatedObjects.push(animatedObject);
        });
    }
    
    public animate(): void {
        requestAnimationFrame(() => this.animate());
        
        // 全アニメーションオブジェクトを更新
        this.animatedObjects.forEach(obj => obj.update());
        
        this.renderer.render(this.scene, this.camera);
    }
}

// 実行
const animationScene = new AnimationScene();
animationScene.animate();

console.log("アニメーションシーン開始！3つの異なるアニメーションが動作しています。");
```

## 🎯 プロジェクト4: 総合演習 - 中規模シーン作成

これまでの知識を組み合わせて、中規模のインタラクティブシーンを作成します：

**scene5-comprehensive.ts**
```typescript
// scene5-comprehensive.ts - 総合シーン（中規模）
import * as THREE from 'three';

// 包括的な設定型
interface ComprehensiveSceneConfig {
    camera: {
        position: THREE.Vector3;
        target: THREE.Vector3;
    };
    lighting: {
        ambient: { color: number; intensity: number };
        directional: { color: number; intensity: number; position: THREE.Vector3 };
    };
    objects: ObjectConfig[];
}

interface ObjectConfig {
    id: string;
    type: 'box' | 'sphere' | 'cone' | 'torus';
    material: MaterialConfig;
    transform: TransformConfig;
    animation?: AnimationConfig;
    interactive?: boolean;
}

interface MaterialConfig {
    type: 'basic' | 'lambert' | 'phong';
    color: number;
    wireframe?: boolean;
}

interface TransformConfig {
    position: THREE.Vector3;
    rotation?: THREE.Vector3;
    scale?: number;
}

interface AnimationConfig {
    type: 'rotation' | 'oscillation' | 'orbit';
    speed: number;
    axis?: 'x' | 'y' | 'z';
    radius?: number;
}

class ComprehensiveScene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private objects: Map<string, { mesh: THREE.Mesh; config: ObjectConfig }> = new Map();
    private selectedObject: THREE.Mesh | null = null;
    
    constructor(config: ComprehensiveSceneConfig) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.setup(config);
        this.setupEventListeners();
    }
    
    private setup(config: ComprehensiveSceneConfig): void {
        // レンダラー設定
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
        
        // カメラ設定
        this.camera.position.copy(config.camera.position);
        this.camera.lookAt(config.camera.target);
        
        // ライティング設定
        const ambientLight = new THREE.AmbientLight(
            config.lighting.ambient.color,
            config.lighting.ambient.intensity
        );
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(
            config.lighting.directional.color,
            config.lighting.directional.intensity
        );
        directionalLight.position.copy(config.lighting.directional.position);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // 地面を追加
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // オブジェクト作成
        config.objects.forEach(objConfig => this.createObject(objConfig));
    }
    
    private createObject(config: ObjectConfig): void {
        // ジオメトリ作成
        let geometry: THREE.BufferGeometry;
        switch (config.type) {
            case 'box':
                geometry = new THREE.BoxGeometry(1, 1, 1);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(0.5, 32, 16);
                break;
            case 'cone':
                geometry = new THREE.ConeGeometry(0.5, 1, 8);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
                break;
        }
        
        // マテリアル作成
        let material: THREE.Material;
        switch (config.material.type) {
            case 'basic':
                material = new THREE.MeshBasicMaterial({
                    color: config.material.color,
                    wireframe: config.material.wireframe ?? false
                });
                break;
            case 'lambert':
                material = new THREE.MeshLambertMaterial({
                    color: config.material.color,
                    wireframe: config.material.wireframe ?? false
                });
                break;
            case 'phong':
                material = new THREE.MeshPhongMaterial({
                    color: config.material.color,
                    wireframe: config.material.wireframe ?? false
                });
                break;
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // 変換設定
        mesh.position.copy(config.transform.position);
        if (config.transform.rotation) {
            mesh.rotation.copy(config.transform.rotation);
        }
        if (config.transform.scale) {
            mesh.scale.setScalar(config.transform.scale);
        }
        
        mesh.castShadow = true;
        mesh.userData = { id: config.id, interactive: config.interactive ?? false };
        
        this.scene.add(mesh);
        this.objects.set(config.id, { mesh, config });
    }
    
    private setupEventListeners(): void {
        // リサイズ
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // マウスクリック
        window.addEventListener('click', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(
                Array.from(this.objects.values()).map(obj => obj.mesh)
            );
            
            if (intersects.length > 0) {
                const clickedObject = intersects[0].object as THREE.Mesh;
                if (clickedObject.userData.interactive) {
                    this.selectObject(clickedObject);
                }
            }
        });
        
        // キーボード
        window.addEventListener('keydown', (event) => {
            if (this.selectedObject) {
                switch (event.key.toLowerCase()) {
                    case 'delete':
                        this.deleteSelectedObject();
                        break;
                    case 'w':
                        this.toggleWireframe(this.selectedObject);
                        break;
                }
            }
        });
    }
    
    private selectObject(mesh: THREE.Mesh): void {
        // 前の選択を解除
        if (this.selectedObject) {
            this.highlightObject(this.selectedObject, false);
        }
        
        // 新しい選択
        this.selectedObject = mesh;
        this.highlightObject(mesh, true);
        
        console.log(`オブジェクト選択: ${mesh.userData.id}`);
    }
    
    private highlightObject(mesh: THREE.Mesh, highlight: boolean): void {
        if (mesh.material instanceof THREE.MeshLambertMaterial ||
            mesh.material instanceof THREE.MeshPhongMaterial) {
            mesh.material.emissive.setHex(highlight ? 0x444444 : 0x000000);
        }
    }
    
    private toggleWireframe(mesh: THREE.Mesh): void {
        if (mesh.material instanceof THREE.Material) {
            mesh.material.wireframe = !mesh.material.wireframe;
        }
    }
    
    private deleteSelectedObject(): void {
        if (!this.selectedObject) return;
        
        const objectData = Array.from(this.objects.entries()).find(
            ([_, data]) => data.mesh === this.selectedObject
        );
        
        if (objectData) {
            const [id, data] = objectData;
            this.scene.remove(data.mesh);
            data.mesh.geometry.dispose();
            if (data.mesh.material instanceof THREE.Material) {
                data.mesh.material.dispose();
            }
            this.objects.delete(id);
            this.selectedObject = null;
            console.log(`オブジェクト削除: ${id}`);
        }
    }
    
    public animate(): void {
        requestAnimationFrame(() => this.animate());
        
        const time = Date.now() * 0.001;
        
        // アニメーション処理
        this.objects.forEach(({ mesh, config }) => {
            if (config.animation) {
                this.updateAnimation(mesh, config.animation, time);
            }
        });
        
        this.renderer.render(this.scene, this.camera);
    }
    
    private updateAnimation(mesh: THREE.Mesh, animation: AnimationConfig, time: number): void {
        switch (animation.type) {
            case 'rotation':
                const axis = animation.axis || 'y';
                mesh.rotation[axis] += animation.speed;
                break;
                
            case 'oscillation':
                const oscillationAxis = animation.axis || 'y';
                mesh.position[oscillationAxis] += Math.sin(time * animation.speed) * 0.01;
                break;
                
            case 'orbit':
                const radius = animation.radius || 2;
                mesh.position.x = Math.cos(time * animation.speed) * radius;
                mesh.position.z = Math.sin(time * animation.speed) * radius;
                break;
        }
    }
    
    public getObjectCount(): number {
        return this.objects.size;
    }
}

// シーン設定
const sceneConfig: ComprehensiveSceneConfig = {
    camera: {
        position: new THREE.Vector3(5, 5, 10),
        target: new THREE.Vector3(0, 0, 0)
    },
    lighting: {
        ambient: { color: 0x404040, intensity: 0.4 },
        directional: { color: 0xffffff, intensity: 0.8, position: new THREE.Vector3(5, 10, 5) }
    },
    objects: [
        {
            id: 'centerBox',
            type: 'box',
            material: { type: 'lambert', color: 0xff0000 },
            transform: { position: new THREE.Vector3(0, 0, 0) },
            animation: { type: 'rotation', speed: 0.02, axis: 'y' },
            interactive: true
        },
        {
            id: 'orbittingSphere',
            type: 'sphere',
            material: { type: 'phong', color: 0x00ff00 },
            transform: { position: new THREE.Vector3(2, 0, 0), scale: 0.7 },
            animation: { type: 'orbit', speed: 1, radius: 3 },
            interactive: true
        },
        {
            id: 'oscillatingCone',
            type: 'cone',
            material: { type: 'lambert', color: 0x0000ff },
            transform: { position: new THREE.Vector3(-2, 0, 0) },
            animation: { type: 'oscillation', speed: 2, axis: 'y' },
            interactive: true
        },
        {
            id: 'staticTorus',
            type: 'torus',
            material: { type: 'basic', color: 0xffff00 },
            transform: { position: new THREE.Vector3(0, 2, -2), scale: 1.2 },
            interactive: true
        }
    ]
};

// シーン実行
const comprehensiveScene = new ComprehensiveScene(sceneConfig);
comprehensiveScene.animate();

console.log(`
=== 総合シーン完成！ ===
- ${comprehensiveScene.getObjectCount()}個のオブジェクト
- インタラクティブ操作可能
- 3種類のアニメーション

操作方法:
- オブジェクトをクリック: 選択
- W: ワイヤーフレーム切り替え
- Delete: 選択オブジェクト削除
`);
```

## 🎓 まとめ: 段階的に学んだこと

### ✅ プロジェクト1: 基礎学習
- JavaScript → TypeScript変換体験
- 基本的な型注釈の効果

### ✅ プロジェクト2: 設定管理
- 型安全な設定オブジェクト
- ファクトリーパターンの活用

### ✅ プロジェクト3: インタラクティビティ
- イベント処理の型安全化
- 動的オブジェクト管理

### ✅ プロジェクト4: アニメーション
- 複雑な設定型の設計
- 時間ベースのアニメーション

### ✅ プロジェクト5: 総合演習
- 全機能を組み合わせた中規模シーン
- 設定駆動型アーキテクチャ

## 🚀 次のステップ

小さなシーンを複数作成してThree.jsに慣れたので、次は：
**[01. 基本シーンの作成](./01-basic-scene.md)** で、より本格的なシステム設計を学びましょう！

**作成したファイル一覧:**
- `scene1-js.js` - JavaScript基本シーン
- `scene1-ts.ts` - TypeScript基本シーン
- `scene2-shapes.ts` - 型安全図形コレクション
- `scene3-interactive.ts` - インタラクティブシーン
- `scene4-animations.ts` - アニメーション管理
- `scene5-comprehensive.ts` - 総合シーン

実際に様々なシーンを作成しながら、TypeScript × Three.jsの強力な組み合わせを体験できました！