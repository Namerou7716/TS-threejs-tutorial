# 00. TypeScript基礎知識

## 📖 学習目標

Three.jsでTypeScriptを効果的に使用するために必要な基礎知識を習得します。

**学習内容:**
- TypeScriptとは何か？なぜ使うのか？
- 基本的な型システム（number, string, boolean）
- インターフェースの定義と使用方法
- クラスの作成と型安全な設計
- ジェネリクスの基本概念

**所要時間:** 30-45分  
**対象者:** TypeScript初心者

## 🎯 TypeScriptとは？

TypeScriptは、JavaScriptに**型システム**を追加したプログラミング言語です。

### JavaScriptの問題点

```javascript
// JavaScript: 実行時エラーが発生する可能性
function addNumbers(a, b) {
    return a + b;
}

const result = addNumbers("5", 3); // "53" (文字列結合)
console.log(result * 2); // NaN (期待していない結果)
```

### TypeScriptの利点

```typescript
// TypeScript: コンパイル時にエラーを検出
function addNumbers(a: number, b: number): number {
    return a + b;
}

const result = addNumbers("5", 3); // ❌ コンパイルエラー！
//                        ^^^
// Argument of type 'string' is not assignable to parameter of type 'number'
```

## 🔢 基本的な型システム

### プリミティブ型

```typescript
// 基本的な型の宣言
let age: number = 25;
let name: string = "太郎";
let isStudent: boolean = true;

// 型推論（TypeScriptが自動的に型を判定）
let score = 95; // number型として推論される
let message = "Hello"; // string型として推論される
```

### 配列とオブジェクト

```typescript
// 配列の型定義
let numbers: number[] = [1, 2, 3, 4, 5];
let names: Array<string> = ["Alice", "Bob", "Charlie"];

// オブジェクトの型定義
let person: {
    name: string;
    age: number;
    isActive: boolean;
} = {
    name: "田中",
    age: 30,
    isActive: true
};
```

## 🏗️ インターフェース

インターフェースは、オブジェクトの**構造**を定義する仕組みです。

```typescript
// ユーザー情報のインターフェース
interface User {
    id: number;
    name: string;
    email: string;
    isActive?: boolean; // ?は省略可能なプロパティ
}

// インターフェースを使用
const user: User = {
    id: 1,
    name: "山田太郎",
    email: "yamada@example.com"
    // isActiveは省略可能なので記述しなくてもOK
};

// 関数でインターフェースを使用
function displayUser(user: User): string {
    return `${user.name} (${user.email})`;
}

console.log(displayUser(user)); // "山田太郎 (yamada@example.com)"
```

### Three.jsでのインターフェース活用例

```typescript
// Three.jsのカメラ設定インターフェース
interface CameraConfig {
    fov: number;           // 視野角
    aspect: number;        // アスペクト比
    near: number;          // 近クリッピング面
    far: number;           // 遠クリッピング面
    position: {
        x: number;
        y: number;
        z: number;
    };
}

// 型安全なカメラ設定
const cameraSettings: CameraConfig = {
    fov: 75,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 0, z: 5 }
};
```

## 👥 クラス

TypeScriptのクラスは、JavaScriptのクラスに型情報を追加したものです。

```typescript
// シンプルなクラスの例
class Rectangle {
    // プロパティの型を明示
    public width: number;
    public height: number;

    // コンストラクタの引数に型を指定
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    // メソッドの戻り値型を明示
    public getArea(): number {
        return this.width * this.height;
    }

    // メソッドの引数と戻り値に型を指定
    public scale(factor: number): void {
        this.width *= factor;
        this.height *= factor;
    }
}

// クラスのインスタンス作成
const rect = new Rectangle(10, 5);
console.log(rect.getArea()); // 50

rect.scale(2);
console.log(rect.getArea()); // 200
```

### アクセス修飾子

```typescript
class BankAccount {
    public readonly accountNumber: string;  // 読み取り専用
    private balance: number;                // プライベート（外部からアクセス不可）
    protected owner: string;                // 継承先からアクセス可能

    constructor(accountNumber: string, owner: string, initialBalance: number = 0) {
        this.accountNumber = accountNumber;
        this.owner = owner;
        this.balance = initialBalance;
    }

    // パブリックメソッド（外部からアクセス可能）
    public getBalance(): number {
        return this.balance;
    }

    public deposit(amount: number): boolean {
        if (amount > 0) {
            this.balance += amount;
            return true;
        }
        return false;
    }

    // プライベートメソッド（クラス内部でのみ使用）
    private validateAmount(amount: number): boolean {
        return amount > 0 && amount <= 1000000;
    }
}
```

## 🎭 ジェネリクス（Generics）

ジェネリクスは、**型を変数のように扱う**仕組みです。

### 基本的なジェネリクス

```typescript
// ジェネリック関数：どんな型でも受け入れる
function identity<T>(value: T): T {
    return value;
}

// 使用例
const numberResult = identity<number>(42);        // number型
const stringResult = identity<string>("Hello");   // string型
const booleanResult = identity<boolean>(true);    // boolean型

// 型推論を利用（型を省略可能）
const autoNumber = identity(123);     // 自動的にnumber型と推論
const autoString = identity("World"); // 自動的にstring型と推論
```

### 配列処理のジェネリクス

```typescript
// 配列の最初の要素を取得するジェネリック関数
function getFirst<T>(array: T[]): T | undefined {
    return array.length > 0 ? array[0] : undefined;
}

const numbers = [1, 2, 3, 4, 5];
const strings = ["apple", "banana", "cherry"];

const firstNumber = getFirst(numbers);  // number | undefined
const firstString = getFirst(strings);  // string | undefined
```

### Three.jsでのジェネリクス活用例

```typescript
// Three.jsのオブジェクト作成用ジェネリッククラス
class ObjectFactory<TGeometry, TMaterial> {
    create(geometry: TGeometry, material: TMaterial): THREE.Mesh<TGeometry, TMaterial> {
        return new THREE.Mesh(geometry, material);
    }
}

// 使用例
import * as THREE from 'three';

const factory = new ObjectFactory<THREE.BoxGeometry, THREE.MeshBasicMaterial>();
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const basicMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

const mesh = factory.create(boxGeometry, basicMaterial);
// mesh は THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial> 型
```

## 🛠️ 実践的なTypeScript使用例

### Union Types（合併型）

```typescript
// 複数の型を受け入れる
type Status = "loading" | "success" | "error";
type ID = string | number;

function setStatus(status: Status): void {
    console.log(`Current status: ${status}`);
}

setStatus("loading");  // ✅ OK
setStatus("success");  // ✅ OK
setStatus("pending");  // ❌ エラー: "pending"は定義されていない
```

### Type Guards（型ガード）

```typescript
// 型を安全にチェックする関数
function isString(value: unknown): value is string {
    return typeof value === "string";
}

function processValue(value: string | number): string {
    if (isString(value)) {
        // この時点でvalueはstring型として扱われる
        return value.toUpperCase();
    } else {
        // この時点でvalueはnumber型として扱われる
        return value.toString();
    }
}
```

## 🎓 次のステップ

TypeScriptの基礎を理解したら、次は**Three.jsとの連携**を学習しましょう。

**次の学習項目:**
- [01.5 TypeScript × Three.js連携](./01-5-typescript-threejs-bridge.md)
- Three.jsオブジェクトの型活用
- 設定オブジェクトの型安全な設計
- エラーハンドリングとデバッグ

## 🔍 重要なポイント

1. **型の明示**: 可能な限り型を明示的に記述する
2. **インターフェース活用**: 複雑なオブジェクトはインターフェースで定義
3. **ジェネリクス**: 再利用可能な関数やクラスで活用
4. **TypeScript特有の機能**: Union Types、Type Guardsを適切に使用
5. **段階的導入**: 既存のJavaScriptコードを徐々にTypeScript化

これらの概念を理解することで、Three.jsをより安全で効率的に使用できるようになります。