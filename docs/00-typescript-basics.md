# 00. TypeScript基礎知識 - ハンズオン学習

## 📖 学習目標

**実際にコードを書きながら**TypeScriptの基礎を学び、最終的に**シンプルな型安全ライブラリ**を作成します。

**作成するもの:**
- 型安全な計算機ライブラリ
- ユーザー管理システム
- 設定管理システム

**学習内容:**
- TypeScriptとは何か？なぜ使うのか？
- 基本的な型システム（number, string, boolean）
- インターフェースの定義と使用方法
- クラスの作成と型安全な設計
- ジェネリクスの基本概念

**所要時間:** 30-45分  
**対象者:** TypeScript初心者

## 🚀 セットアップ

まず、作業用のフォルダを作成しましょう：

```bash
mkdir typescript-practice
cd typescript-practice
npm init -y
npm install -D typescript @types/node
npx tsc --init
```

## 🎯 プロジェクト1: 型安全な計算機を作ろう

### Step 1-1: JavaScriptの問題を体験

`calculator.js` を作成して、JavaScriptの問題点を確認しましょう：

```javascript
// calculator.js
function add(a, b) {
    return a + b;
}

function multiply(a, b) {
    return a * b;
}

// 使ってみる
console.log(add(5, 3));        // 8 ✅ 期待通り
console.log(add("5", 3));      // "53" ❌ 意図しない結果！
console.log(multiply("2", 4)); // 8 ✅ 運良く動作
console.log(multiply("hello", 3)); // NaN ❌ エラー！
```

**実行してみよう：**
```bash
node calculator.js
```

### Step 1-2: TypeScriptで型安全にしよう

同じ機能を`calculator.ts`でTypeScript化します：

```typescript
// calculator.ts

// 基本的な型注釈
function add(a: number, b: number): number {
    return a + b;
}

function multiply(a: number, b: number): number {
    return a * b;
}

// 使ってみる
console.log(add(5, 3));        // 8 ✅ 
console.log(add("5", 3));      // ❌ コンパイルエラー！
//          ^^^
// Argument of type 'string' is not assignable to parameter of type 'number'

// 正しい使用方法
const result1: number = add(10, 20);
const result2: number = multiply(5, 4);

console.log(`足し算の結果: ${result1}`);
console.log(`掛け算の結果: ${result2}`);
```

**コンパイルして実行：**
```bash
npx tsc calculator.ts
node calculator.js
```

**💡 ここで学ぶこと:**
- 型注釈の書き方 `変数: 型`
- 関数の引数と戻り値の型指定
- コンパイル時のエラーチェック

### Step 1-3: より高度な計算機を作ろう

演算の種類を増やして、Union Typesを学習します：

```typescript
// advanced-calculator.ts

// Union Types: 限定された選択肢を定義
type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

function calculate(a: number, b: number, operation: Operation): number {
    switch (operation) {
        case 'add':
            return a + b;
        case 'subtract':
            return a - b;
        case 'multiply':
            return a * b;
        case 'divide':
            if (b === 0) {
                throw new Error('0で割ることはできません');
            }
            return a / b;
        default:
            // TypeScriptの網羅性チェック
            const _exhaustive: never = operation;
            throw new Error(`未対応の演算: ${_exhaustive}`);
    }
}

// 使用例
console.log(calculate(10, 5, 'add'));      // 15
console.log(calculate(10, 5, 'divide'));   // 2
console.log(calculate(10, 5, 'invalid'));  // ❌ コンパイルエラー！
```

**実行してみよう：**
```bash
npx tsc advanced-calculator.ts && node advanced-calculator.js
```

## 🏗️ プロジェクト2: ユーザー管理システムを作ろう

### Step 2-1: インターフェースでデータ構造を定義

```typescript
// user-manager.ts

// ユーザー情報の構造を定義
interface User {
    id: number;
    name: string;
    email: string;
    age: number;
    isActive?: boolean; // ?は省略可能なプロパティ
}

// ユーザー作成関数（型安全）
function createUser(name: string, email: string, age: number): User {
    return {
        id: Math.floor(Math.random() * 1000),
        name,
        email,
        age,
        isActive: true
    };
}

// ユーザー情報表示関数
function displayUser(user: User): string {
    const status = user.isActive ? '有効' : '無効';
    return `${user.name} (${user.email}) - ${user.age}歳 [${status}]`;
}

// 実際に使ってみよう
const user1 = createUser("田中太郎", "tanaka@example.com", 25);
const user2 = createUser("佐藤花子", "sato@example.com", 30);

console.log(displayUser(user1));
console.log(displayUser(user2));

// 型安全性のテスト
const invalidUser = createUser("山田", "yamada@example.com", "25"); // ❌ エラー
//                                                        ^^^^
// Argument of type 'string' is not assignable to parameter of type 'number'
```

### Step 2-2: ユーザー管理クラスを作ろう

```typescript
// user-manager-class.ts

interface User {
    id: number;
    name: string;
    email: string;
    age: number;
    isActive?: boolean;
}

class UserManager {
    private users: User[] = [];
    private nextId: number = 1;

    // ユーザー追加
    addUser(name: string, email: string, age: number): User {
        const newUser: User = {
            id: this.nextId++,
            name,
            email,
            age,
            isActive: true
        };
        
        this.users.push(newUser);
        return newUser;
    }

    // ユーザー検索（ID）
    findUserById(id: number): User | undefined {
        return this.users.find(user => user.id === id);
    }

    // ユーザー検索（名前）
    findUserByName(name: string): User | undefined {
        return this.users.find(user => user.name === name);
    }

    // 全ユーザー取得
    getAllUsers(): User[] {
        return [...this.users]; // 配列のコピーを返す（カプセル化）
    }

    // アクティブユーザーのみ取得
    getActiveUsers(): User[] {
        return this.users.filter(user => user.isActive !== false);
    }

    // ユーザー数取得
    getUserCount(): number {
        return this.users.length;
    }
}

// 実際に使ってみよう！
const userManager = new UserManager();

// ユーザーを追加
const user1 = userManager.addUser("田中太郎", "tanaka@example.com", 25);
const user2 = userManager.addUser("佐藤花子", "sato@example.com", 30);
const user3 = userManager.addUser("山田次郎", "yamada@example.com", 28);

console.log("=== 全ユーザー ===");
userManager.getAllUsers().forEach(user => {
    console.log(`${user.id}: ${user.name} (${user.email})`);
});

console.log("\n=== ユーザー検索 ===");
const foundUser = userManager.findUserByName("佐藤花子");
if (foundUser) {
    console.log(`見つかりました: ${foundUser.name}`);
} else {
    console.log("ユーザーが見つかりませんでした");
}

console.log(`\n総ユーザー数: ${userManager.getUserCount()}人`);
```

**実行してみよう：**
```bash
npx tsc user-manager-class.ts && node user-manager-class.js
```

## 🎭 プロジェクト3: ジェネリクスで汎用ライブラリを作ろう

### Step 3-1: 型安全なコレクション管理

```typescript
// generic-collection.ts

// ジェネリクスを使用した汎用コレクションクラス
class SafeCollection<T> {
    private items: T[] = [];

    // アイテム追加
    add(item: T): void {
        this.items.push(item);
    }

    // アイテム取得（インデックス）
    get(index: number): T | undefined {
        return this.items[index];
    }

    // 最初のアイテム取得
    first(): T | undefined {
        return this.items[0];
    }

    // 最後のアイテム取得
    last(): T | undefined {
        return this.items[this.items.length - 1];
    }

    // アイテム数取得
    count(): number {
        return this.items.length;
    }

    // 全アイテム取得
    getAll(): T[] {
        return [...this.items];
    }

    // 条件に合うアイテムを検索
    find(predicate: (item: T) => boolean): T | undefined {
        return this.items.find(predicate);
    }

    // 条件に合うアイテムをすべて取得
    filter(predicate: (item: T) => boolean): T[] {
        return this.items.filter(predicate);
    }
}

// 使用例1: 数値のコレクション
const numbers = new SafeCollection<number>();
numbers.add(10);
numbers.add(20);
numbers.add(30);

console.log("=== 数値コレクション ===");
console.log(`最初の数値: ${numbers.first()}`);
console.log(`最後の数値: ${numbers.last()}`);
console.log(`20より大きい数値:`, numbers.filter(n => n > 20));

// 使用例2: 文字列のコレクション
const fruits = new SafeCollection<string>();
fruits.add("りんご");
fruits.add("バナナ");
fruits.add("オレンジ");

console.log("\n=== フルーツコレクション ===");
console.log(`全フルーツ:`, fruits.getAll());
console.log(`「バナナ」を検索:`, fruits.find(fruit => fruit === "バナナ"));

// 使用例3: ユーザーオブジェクトのコレクション
interface User {
    id: number;
    name: string;
    age: number;
}

const users = new SafeCollection<User>();
users.add({ id: 1, name: "田中", age: 25 });
users.add({ id: 2, name: "佐藤", age: 30 });
users.add({ id: 3, name: "山田", age: 28 });

console.log("\n=== ユーザーコレクション ===");
console.log(`25歳以上のユーザー:`, users.filter(user => user.age >= 25));

// 型安全性のテスト
numbers.add("文字列"); // ❌ コンパイルエラー！
fruits.add(123);       // ❌ コンパイルエラー！
```

### Step 3-2: 設定管理システム

```typescript
// config-manager.ts

// 設定の型を定義
interface AppConfig {
    theme: 'light' | 'dark';
    language: 'ja' | 'en' | 'zh';
    notifications: boolean;
    maxRetries: number;
}

interface DatabaseConfig {
    host: string;
    port: number;
    username: string;
    ssl: boolean;
}

// ジェネリクスを使った設定管理クラス
class ConfigManager<T> {
    private config: Partial<T> = {};
    private defaultConfig: T;

    constructor(defaultConfig: T) {
        this.defaultConfig = defaultConfig;
    }

    // 設定値を設定
    set<K extends keyof T>(key: K, value: T[K]): void {
        this.config[key] = value;
    }

    // 設定値を取得（デフォルト値も考慮）
    get<K extends keyof T>(key: K): T[K] {
        return this.config[key] ?? this.defaultConfig[key];
    }

    // 複数の設定を一度に更新
    update(newConfig: Partial<T>): void {
        this.config = { ...this.config, ...newConfig };
    }

    // 現在の設定を全て取得
    getAll(): T {
        return { ...this.defaultConfig, ...this.config };
    }

    // 設定をリセット
    reset(): void {
        this.config = {};
    }

    // 設定を JSON 文字列として出力
    toJSON(): string {
        return JSON.stringify(this.getAll(), null, 2);
    }
}

// アプリ設定の管理
const appDefaults: AppConfig = {
    theme: 'light',
    language: 'ja',
    notifications: true,
    maxRetries: 3
};

const appConfigManager = new ConfigManager<AppConfig>(appDefaults);

console.log("=== アプリ設定管理 ===");
console.log("初期設定:", appConfigManager.getAll());

// 設定を変更
appConfigManager.set('theme', 'dark');
appConfigManager.set('language', 'en');

console.log("\n設定変更後:");
console.log(`テーマ: ${appConfigManager.get('theme')}`);
console.log(`言語: ${appConfigManager.get('language')}`);

// 複数設定を一度に更新
appConfigManager.update({
    notifications: false,
    maxRetries: 5
});

console.log("\n一括更新後:");
console.log(appConfigManager.toJSON());

// データベース設定の管理
const dbDefaults: DatabaseConfig = {
    host: 'localhost',
    port: 5432,
    username: 'user',
    ssl: false
};

const dbConfigManager = new ConfigManager<DatabaseConfig>(dbDefaults);
dbConfigManager.update({
    host: 'production-db.example.com',
    ssl: true
});

console.log("\n=== データベース設定 ===");
console.log(dbConfigManager.toJSON());
```

**実行してみよう：**
```bash
npx tsc config-manager.ts && node config-manager.js
```

## 🎯 プロジェクト4: 総合演習 - Three.js用の型安全ヘルパー

最後に、Three.jsで使えそうな型安全ヘルパーライブラリを作ってみましょう：

```typescript
// threejs-helpers.ts

// 3D座標の型定義
interface Vector3 {
    x: number;
    y: number;
    z: number;
}

// 色の型定義
type Color = string | number;

// ジオメトリの基本情報
interface GeometryInfo {
    type: string;
    vertexCount: number;
    triangleCount: number;
}

// 3D数学ヘルパークラス
class Vector3Helper {
    // ベクトル作成
    static create(x: number = 0, y: number = 0, z: number = 0): Vector3 {
        return { x, y, z };
    }

    // ベクトルの長さ計算
    static length(v: Vector3): number {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    // ベクトル正規化
    static normalize(v: Vector3): Vector3 {
        const len = this.length(v);
        if (len === 0) return { x: 0, y: 0, z: 0 };
        
        return {
            x: v.x / len,
            y: v.y / len,
            z: v.z / len
        };
    }

    // ベクトル加算
    static add(a: Vector3, b: Vector3): Vector3 {
        return {
            x: a.x + b.x,
            y: a.y + b.y,
            z: a.z + b.z
        };
    }

    // 2点間の距離計算
    static distance(a: Vector3, b: Vector3): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
}

// 色ヘルパークラス
class ColorHelper {
    // 16進数文字列を数値に変換
    static hexToNumber(hex: string): number {
        return parseInt(hex.replace('#', ''), 16);
    }

    // 数値を16進数文字列に変換
    static numberToHex(num: number): string {
        return `#${num.toString(16).padStart(6, '0')}`;
    }

    // RGB値から16進数に変換
    static rgbToHex(r: number, g: number, b: number): string {
        const toHex = (n: number) => n.toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    // ランダムな色を生成
    static random(): number {
        return Math.floor(Math.random() * 0xffffff);
    }
}

// ジオメトリ情報管理クラス
class GeometryManager {
    private geometries: Map<string, GeometryInfo> = new Map();

    // ジオメトリ情報を登録
    register(name: string, info: GeometryInfo): void {
        this.geometries.set(name, info);
    }

    // ジオメトリ情報を取得
    get(name: string): GeometryInfo | undefined {
        return this.geometries.get(name);
    }

    // 全ジオメトリのリストを取得
    list(): string[] {
        return Array.from(this.geometries.keys());
    }

    // 統計情報を取得
    getStats(): { total: number; totalVertices: number; totalTriangles: number } {
        let totalVertices = 0;
        let totalTriangles = 0;

        for (const info of this.geometries.values()) {
            totalVertices += info.vertexCount;
            totalTriangles += info.triangleCount;
        }

        return {
            total: this.geometries.size,
            totalVertices,
            totalTriangles
        };
    }
}

// 実際に使ってみよう！
console.log("=== Vector3Helper のテスト ===");
const pos1 = Vector3Helper.create(1, 2, 3);
const pos2 = Vector3Helper.create(4, 5, 6);

console.log("位置1:", pos1);
console.log("位置2:", pos2);
console.log("長さ:", Vector3Helper.length(pos1));
console.log("正規化:", Vector3Helper.normalize(pos1));
console.log("加算:", Vector3Helper.add(pos1, pos2));
console.log("距離:", Vector3Helper.distance(pos1, pos2));

console.log("\n=== ColorHelper のテスト ===");
console.log("赤色(16進):", ColorHelper.numberToHex(0xff0000));
console.log("RGB to Hex:", ColorHelper.rgbToHex(255, 128, 0));
console.log("ランダム色:", ColorHelper.numberToHex(ColorHelper.random()));

console.log("\n=== GeometryManager のテスト ===");
const geoManager = new GeometryManager();

geoManager.register("box", { type: "box", vertexCount: 8, triangleCount: 12 });
geoManager.register("sphere", { type: "sphere", vertexCount: 382, triangleCount: 760 });
geoManager.register("plane", { type: "plane", vertexCount: 4, triangleCount: 2 });

console.log("登録されたジオメトリ:", geoManager.list());
console.log("ボックス情報:", geoManager.get("box"));
console.log("統計:", geoManager.getStats());
```

**実行してみよう：**
```bash
npx tsc threejs-helpers.ts && node threejs-helpers.js
```

## 🎓 まとめ: 学んだことの確認

このハンズオンで以下を実際に体験しました：

### ✅ 基本的な型システム
- `number`, `string`, `boolean` の使い方
- 関数の引数と戻り値の型指定
- Union Types（`'add' | 'subtract'`）

### ✅ インターフェース
- オブジェクトの構造定義（`User`, `AppConfig`）
- 省略可能プロパティ（`isActive?`）
- インターフェースを使った型安全な関数設計

### ✅ クラス
- プロパティとメソッドの型指定
- アクセス修飾子（`private`, `public`）
- カプセル化とデータ保護

### ✅ ジェネリクス
- 型を変数として扱う（`SafeCollection<T>`）
- 制約のあるジェネリクス（`K extends keyof T`）
- 再利用可能なコード設計

## 🚀 次のステップ

TypeScriptの基礎を実際に体験したので、次は：
**[01. TypeScript × Three.js連携](./01-typescript-threejs-bridge.md)** に進んで、Three.jsでこれらの知識を活用しましょう！

**実際に作ったファイル:**
- `calculator.ts` - 基本的な型注釈
- `user-manager-class.ts` - インターフェースとクラス
- `generic-collection.ts` - ジェネリクス
- `threejs-helpers.ts` - 総合演習

これらのファイルを実際に動かして、TypeScriptの型安全性を体感できましたね！