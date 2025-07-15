/**
 * Three.js TypeScript Tutorial - Advanced Scene Manager
 * 高度なクラスベース実装：継承、抽象クラス、ミックスイン、デコレータパターン
 */

import * as THREE from 'three';
import type { EventHandlers, RenderStats, PerformanceCallback } from '../types/geometry-types';

// ===========================================
// 抽象基底クラス
// ===========================================

/**
 * シーン管理の抽象基底クラス
 */
export abstract class AbstractSceneManager {
  protected camera!: THREE.Camera;
  protected scene!: THREE.Scene;
  protected renderer!: THREE.WebGLRenderer;
  protected animationId: number | null = null;
  protected clock = new THREE.Clock();
  
  // 抽象メソッド
  protected abstract initializeScene(): void;
  protected abstract setupLighting(): void;
  protected abstract updateScene(deltaTime: number): void;
  
  // テンプレートメソッドパターン
  public initialize(): void {
    this.initializeScene();
    this.setupLighting();
    this.setupEventListeners();
  }
  
  protected setupEventListeners(): void {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  
  protected onWindowResize(): void {
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  public start(): void {
    this.animate();
  }
  
  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  private animate(): void {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    const deltaTime = this.clock.getDelta();
    this.updateScene(deltaTime);
    this.renderer.render(this.scene, this.camera);
  }
  
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

// ===========================================
// ミックスイン（Mixins）
// ===========================================

/**
 * インタラクション機能のミックスイン
 */
export interface Interactable {
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  eventHandlers: EventHandlers;
  setupInteraction(): void;
  handleMouseEvent(event: MouseEvent, type: keyof EventHandlers): void;
}

/**
 * インタラクション機能の実装
 */
export function InteractableMixin<TBase extends new (...args: any[]) => AbstractSceneManager>(Base: TBase) {
  return class extends Base implements Interactable {
    public raycaster = new THREE.Raycaster();
    public mouse = new THREE.Vector2();
    public eventHandlers: EventHandlers = {};
    
    public setupInteraction(): void {
      this.renderer.domElement.addEventListener('click', (e) => this.handleMouseEvent(e, 'onClick'));
      this.renderer.domElement.addEventListener('mousemove', (e) => this.handleMouseEvent(e, 'onMouseMove'));
    }
    
    public handleMouseEvent(event: MouseEvent, type: keyof EventHandlers): void {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);
      
      const handler = this.eventHandlers[type];
      if (handler && intersects.length > 0) {
        handler({
          position: new THREE.Vector2(event.clientX, event.clientY),
          normalized: this.mouse.clone(),
          target: intersects[0].object
        });
      }
    }
    
    public setEventHandler(type: keyof EventHandlers, handler: EventHandlers[typeof type]): void {
      this.eventHandlers[type] = handler;
    }
  };
}

/**
 * パフォーマンスモニタリング機能のミックスイン
 */
export function PerformanceMonitorMixin<TBase extends new (...args: any[]) => AbstractSceneManager>(Base: TBase) {
  return class extends Base {
    private performanceCallback?: PerformanceCallback;
    private frameCount = 0;
    private lastTime = performance.now();
    
    public setPerformanceCallback(callback: PerformanceCallback): void {
      this.performanceCallback = callback;
    }
    
    protected updatePerformanceStats(): void {
      this.frameCount++;
      const currentTime = performance.now();
      
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

// ===========================================
// 具象実装クラス
// ===========================================

/**
 * インタラクティブな3Dシーンマネージャー
 */
export class InteractiveSceneManager extends PerformanceMonitorMixin(InteractableMixin(AbstractSceneManager)) {
  private objects: THREE.Mesh[] = [];
  private selectedObject: THREE.Mesh | null = null;
  
  protected initializeScene(): void {
    // カメラ
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);
    
    // シーン
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1a);
    
    // レンダラー
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);
  }
  
  protected setupLighting(): void {
    // 環境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);
    
    // 指向性ライト
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
  
  protected updateScene(deltaTime: number): void {
    const time = this.clock.getElapsedTime();
    
    // オブジェクトのアニメーション
    this.objects.forEach((obj, index) => {
      obj.rotation.x = time * 0.3 + index * 0.1;
      obj.rotation.y = time * 0.5 + index * 0.15;
      obj.position.y = Math.sin(time + index) * 0.5;
    });
    
    // パフォーマンス統計の更新
    this.updatePerformanceStats();
  }
  
  public initialize(): void {
    super.initialize();
    this.setupInteraction();
    
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
   * オブジェクトの選択
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
   * オブジェクトのハイライト
   */
  private highlightObject(mesh: THREE.Mesh, highlight: boolean): void {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(material => {
        if (material instanceof THREE.MeshLambertMaterial || 
            material instanceof THREE.MeshPhongMaterial ||
            material instanceof THREE.MeshStandardMaterial) {
          material.emissive.setHex(highlight ? 0x444444 : 0x000000);
        }
      });
    } else {
      const material = mesh.material;
      if (material instanceof THREE.MeshLambertMaterial || 
          material instanceof THREE.MeshPhongMaterial ||
          material instanceof THREE.MeshStandardMaterial) {
        material.emissive.setHex(highlight ? 0x444444 : 0x000000);
      }
    }
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
   * 全オブジェクトのクリア
   */
  public clearAllObjects(): void {
    this.objects.forEach(obj => {
      this.scene.remove(obj);
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach(material => material.dispose());
      } else {
        obj.material.dispose();
      }
    });
    
    this.objects = [];
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

// ===========================================
// ファクトリーパターンとビルダーパターン
// ===========================================

/**
 * シーンマネージャーのビルダークラス
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
  
  public withShadows(enabled: boolean): this {
    this.config.enableShadows = enabled;
    return this;
  }
  
  public withInteraction(enabled: boolean): this {
    this.config.enableInteraction = enabled;
    return this;
  }
  
  public withPerformanceMonitoring(enabled: boolean): this {
    this.config.enablePerformanceMonitoring = enabled;
    return this;
  }
  
  public withBackgroundColor(color: THREE.Color): this {
    this.config.backgroundColor = color;
    return this;
  }
  
  public withCameraPosition(position: THREE.Vector3): this {
    this.config.cameraPosition = position;
    return this;
  }
  
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

// ===========================================
// デコレータパターン（実装例）
// ===========================================

/**
 * デバッグ機能のデコレータ
 */
export class DebugSceneDecorator {
  constructor(private sceneManager: InteractiveSceneManager) {}
  
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
  
  public showBoundingBoxes(): void {
    this.sceneManager.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const box = new THREE.BoxHelper(child, 0xffff00);
        this.sceneManager.scene.add(box);
      }
    });
  }
  
  public addAxesHelper(size: number = 5): void {
    const axesHelper = new THREE.AxesHelper(size);
    this.sceneManager.scene.add(axesHelper);
  }
  
  public addGridHelper(size: number = 10, divisions: number = 10): void {
    const gridHelper = new THREE.GridHelper(size, divisions);
    this.sceneManager.scene.add(gridHelper);
  }
}