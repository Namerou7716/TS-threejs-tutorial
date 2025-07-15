# 01.5 TypeScriptとThree.jsの連携 - 実践ハンズオン

## 📖 この章で学ぶこと

**実際に小さな3Dシーンを複数作りながら**、TypeScriptとThree.jsを連携させる方法を段階的に学びます。JavaScriptからの移行を体験し、TypeScriptがもたらす「型」の安全性のメリットを実感することが目標です。

(中略)

---

### 用語集：この章で登場する主なThree.js API

- **`THREE.MeshBasicMaterial`**: 最もシンプルな材質。光（ライト）の影響を受けず、設定した色でそのまま表示されます。デバッグや非常に軽量な表現に使われます。
- **`THREE.MeshLambertMaterial`**: 光の影響を受ける、光沢のない（マットな）材質です。`AmbientLight`や`DirectionalLight`などのライトがないと真っ黒に見えます。
- **`THREE.SphereGeometry`**: 球体の「形状」を定義します。
- **`THREE.ConeGeometry`**: 円錐の「形状」を定義します。
- **`object.rotation`**: オブジェクトの回転をラジアン単位で保持します。`object.rotation.x += 0.01`のようにしてアニメーションさせます。
- **`object.position`**: オブジェクトの3D空間内での位置を`THREE.Vector3`で保持します。
- **`object.scale`**: オブジェクトの拡大・縮小率を`THREE.Vector3`で保持します。
- **`object.geometry.dispose()`**: ジオメトリが使用しているメモリを解放します。オブジェクトを削除する際には、メモリリークを防ぐために呼び出すことが推奨されます。
- **`object.material.dispose()`**: マテリアルが使用しているメモリ（テクスチャなど）を解放します。同様に、オブジェクト削除時に呼び出します。

---

## 🎯 プロジェクト1: 最初のシーン (JavaScriptからTypeScriptへ)

### Step 1-1: JavaScriptで基本的なシーンを作る（比較のため）

**scene1-js.js**
```javascript
// (imports)

// 1. シーン、カメラ、レンダラーを用意
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// 2. レンダラーの設定
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 3. オブジェクトの作成
const geometry = new THREE.BoxGeometry(1, 1, 1);
// new THREE.MeshBasicMaterial({ color: ... }): 光源を必要としない、基本的な材質を作成。
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// 4. アニメーションループ
function animate() {
    requestAnimationFrame(animate);
    // cube.rotation.x: X軸周りの回転角度（ラジアン）
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();
```

(中略)

### Step 1-2: TypeScript版に変換し、「型」のメリットを体験する

**scene1-ts.ts**
```typescript
// (imports and setup)

// ウィンドウリサイズ時の処理
window.addEventListener('resize', (): void => {
    const width: number = window.innerWidth;
    const height: number = window.innerHeight;
    
    camera.aspect = width / height;
    // camera.updateProjectionMatrix(): カメラのプロパティ（画角やアスペクト比など）を変更した後に、
    // 変更を適用するために必ず呼び出す必要があるメソッド。
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
});

// (animate function)
```

(中略)

## 🎨 プロジェクト2: 型安全な図形コレクション

**scene2-shapes.ts**
```typescript
// (imports and interface)

class ShapeFactory {
    static createShape(config: ShapeConfig): THREE.Mesh {
        let geometry: THREE.BufferGeometry;
        switch (config.type) {
            case 'box': geometry = new THREE.BoxGeometry(1, 1, 1); break;
            // new THREE.SphereGeometry(radius, widthSegments, heightSegments): 球体の形状を作成。
            // widthSegments/heightSegmentsは球の滑らかさ。数値が大きいほど滑らかで、処理も重くなる。
            case 'sphere': geometry = new THREE.SphereGeometry(0.5, 32, 16); break;
            // new THREE.ConeGeometry(radius, height, radialSegments): 円錐の形状を作成。
            case 'cone': geometry = new THREE.ConeGeometry(0.5, 1, 8); break;
        }

        // new THREE.MeshLambertMaterial({ color: ... }): 光源の影響を受けるマットな材質を作成。
        const material = new THREE.MeshLambertMaterial({ color: config.color });
        
        const mesh = new THREE.Mesh(geometry, material);
        // mesh.position.set(x, y, z): オブジェクトの位置を一度に設定する。
        mesh.position.set(config.position.x, config.position.y, config.position.z);
        // mesh.scale.setScalar(value): オブジェクトのX, Y, Z軸の拡大率を同じ値に設定する。
        mesh.scale.setScalar(config.scale ?? 1);
        
        return mesh;
    }
}

// (scene setup)

// 4. ライトを追加（MeshLambertMaterialはライトが必要）
scene.add(new THREE.AmbientLight(0x404040, 1));
const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(5, 5, 5);
scene.add(light);

// (shape creation and animation)
```

(中略)

## 🎮 プロジェクト3: インタラクティブなシーン

**scene3-interactive.ts**
```typescript
// (imports and class definition)

class InteractiveScene {
    // (properties and constructor)

    // (init and setupEventListeners)

    // (handleKeyPress)

    // (addShape)
    
    // 全ての図形を削除するメソッド
    public clearAllShapes(): void {
        this.shapes.forEach(shape => {
            // scene.remove(shape): まずシーンからオブジェクトを削除する。
            this.scene.remove(shape);

            // --- メモリリーク対策：ここからが重要 ---
            // 不要になったオブジェクトが使用していたメモリを明示的に解放する。
            // これを怠ると、アプリケーションが長時間実行されるとメモリ使用量が増え続ける原因になる。
            
            // shape.geometry.dispose(): ジオメトリ（形状データ）のメモリを解放。
            shape.geometry.dispose();

            // shape.material.dispose(): マテリアル（材質データ）のメモリを解放。
            // マテリアルが配列の場合も考慮して、それぞれを解放する。
            if (Array.isArray(shape.material)) {
                shape.material.forEach(m => m.dispose());
            } else {
                shape.material.dispose();
            }
        });
        this.shapes = []; // 管理用の配列も空にする
        console.log("全ての図形を削除し、リソースを解放しました。");
    }
    
    // (animate)
}

// (execution)
```

(以降のセクションは変更なし)