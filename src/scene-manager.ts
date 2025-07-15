/**
 * Three.js TypeScript Tutorial - 03. Advanced Scene Manager
 * (File overview...)
 */

import * as THREE from 'three';
import type { EventHandlers, RenderStats, PerformanceCallback } from '../types/geometry-types';

// ===================================================================
// Part 1: Abstract Base Class (抽象基底クラス)
// ===================================================================

export abstract class AbstractSceneManager {
  protected camera!: THREE.Camera;
  protected scene!: THREE.Scene;
  protected renderer!: THREE.WebGLRenderer;
  // new THREE.Clock(): 時間を管理するヘルパー。アニメーションの経過時間などを正確に計測する。
  protected clock = new THREE.Clock();
  private animationId: number | null = null;
  
  // (Abstract methods)
  
  public initialize(): void {
    this.initializeScene();
    this.setupLighting();
    this.setupEventListeners();
  }
  
  // (Common methods: setupEventListeners, onWindowResize, start, stop)
  
  private animate(): void {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    // clock.getDelta(): 前回のフレームからの経過時間（秒）を取得する。
    // これをアニメーション計算に使うことで、フレームレートが変動しても動きの速度を一定に保てる。
    const deltaTime = this.clock.getDelta();
    this.updateScene(deltaTime);
    this.renderer.render(this.scene, this.camera);
  }
  
  public dispose(): void {
    this.stop();
    // scene.traverse(callback): シーン内の全ての子オブジェクトに対して再帰的にコールバックを実行する。
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

// ===================================================================
// Part 2: Mixins (ミックスイン)
// ===================================================================

type Constructor<T = {}> = new (...args: any[]) => T;

export function InteractableMixin<TBase extends Constructor<AbstractSceneManager>>(Base: TBase) {
  return class extends Base {
    // new THREE.Raycaster(): 3D空間に光線（レイ）を飛ばしてオブジェクトとの交差を検出する。
    // マウスでのオブジェクト選択（ピッキング）に不可欠。
    public raycaster = new THREE.Raycaster();
    public mouse = new THREE.Vector2();
    public eventHandlers: EventHandlers = {};
    
    public setupInteraction(): void { /* ... */ }
    
    public handleMouseEvent(event: MouseEvent, type: keyof EventHandlers): void {
      // (mouse coordinate calculation)
      
      // raycaster.setFromCamera(mouseCoords, camera): カメラ視点からマウス座標に向かって光線を設定する。
      this.raycaster.setFromCamera(this.mouse, this.camera);
      // raycaster.intersectObjects(objects, recursive): 光線と交差したオブジェクトを距離の近い順で配列として返す。
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);
      
      // (handler call)
    }
    
    public setEventHandler(type: keyof EventHandlers, handler: any): void { /* ... */ }
  };
}

// (PerformanceMonitorMixin)

// ===================================================================
// Part 3: Concrete Implementation Class (具象実装クラス)
// ===================================================================

export class InteractiveSceneManager extends PerformanceMonitorMixin(InteractableMixin(AbstractSceneManager)) {
  // (properties)
  
  protected initializeScene(): void {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(5, 5, 5);
    // camera.lookAt(vector): カメラを指定したVector3の座標の方向に向ける。
    this.camera.lookAt(0, 0, 0);
    // (scene and renderer setup)
  }
  
  protected setupLighting(): void {
    this.scene.add(new THREE.AmbientLight(0x404040, 0.3));
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(10, 10, 5);
    this.scene.add(light);
  }
  
  protected updateScene(deltaTime: number): void {
    // clock.getElapsedTime(): Clockのインスタンスが作られてからの総経過時間を返す。
    const time = this.clock.getElapsedTime();
    this.objects.forEach((obj, i) => {
      obj.rotation.y = time * 0.5 + i * 0.15;
    });
    this.updatePerformanceStats();
  }
  
  public initialize(): void {
    super.initialize();
    this.setupInteraction();
    this.setEventHandler('onClick', (info) => {
      if (info.target instanceof THREE.Mesh) this.selectObject(info.target);
    });
  }
  
  private selectObject(mesh: THREE.Mesh): void { /* ... */ }
  
  private highlightObject(mesh: THREE.Mesh, highlight: boolean): void {
    const emissiveColor = highlight ? 0x444444 : 0x000000;
    if (Array.isArray(mesh.material)) {
      // (array material handling)
    } else {
      const material = mesh.material as THREE.MeshStandardMaterial;
      if (material.emissive) {
        // material.emissive.setHex(color): マテリアルの自己発光色を設定する。
        // ライトの影響とは無関係に、マテリアル自体がその色で発光しているように見える。
        // オブジェクトの選択状態を示すハイライトとしてよく利用される。
        material.emissive.setHex(emissiveColor);
      }
    }
  }
  
  // (other methods: addObject, removeSelectedObject, etc.)
}

// ===================================================================
// Part 4: Builder Pattern (ビルダーパターン)
// ===================================================================

// (SceneManagerBuilder class - no new APIs)

// ===================================================================
// Part 5: Decorator Pattern (デコレータパターン)
// ===================================================================

export class DebugSceneDecorator {
  constructor(private sceneManager: InteractiveSceneManager) {}
  
  public enableWireframeMode(): void {
    // scene.traverse(callback): シーン内の全オブジェクトに処理を実行する。
    this.sceneManager.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
        // material.wireframe = true: オブジェクトをワイヤーフレームで表示する。
        child.material.wireframe = true;
      }
    });
  }
  
  public addAxesHelper(size: number = 5): void {
    // new THREE.AxesHelper(size): 3D空間のX(赤), Y(緑), Z(青)の軸を可視化するヘルパーを追加する。
    // オブジェクトの配置や回転を確認する際のデバッグに非常に役立つ。
    const axesHelper = new THREE.AxesHelper(size);
    this.sceneManager.scene.add(axesHelper);
  }
}