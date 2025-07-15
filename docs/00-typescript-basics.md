# 00. TypeScript基礎知識 - ハンズオンで学ぶ最初のステップ

## 📖 この章で学ぶこと

**実際に手を動かしながら**TypeScriptの基本的な考え方を学び、最終的に**シンプルな型安全ライブラリ**を自分で作れるようになることを目指します。

**作成するもの:**
- **型安全な計算機ライブラリ:** JavaScriptの問題点を体験し、TypeScriptで解決します。
- **ユーザー管理システム:** `インターフェース`や`クラス`を使い、現実的なデータ構造を学びます。
- **設定管理システム:** `ジェネリクス`を使い、再利用可能なコードの書き方を学びます。

**学習のポイント:**
- **TypeScriptとは？なぜ便利なの？:** JavaScriptとの違いを体感します。
- **基本的な型システム:** `number`, `string`, `boolean`など、プログラミングの基本要素を型で守る方法を学びます。
- **インターフェース:** オブジェクトの「設計図」の作り方を学びます。
- **クラス:** モノ（オブジェクト）を効率的に作るための「設計図」を学びます。
- **ジェネリクス:** 様々な型に対応できる、柔軟で型安全なコードの書き方を学びます。

**想定所要時間:** 30-45分  
**対象者:** TypeScriptをこれから始める方、JavaScriptの経験が少しある方

---

## 🚀 準備：開発環境を整えよう

まず、練習用のフォルダとTypeScriptを動かすための環境を準備します。

```bash
# 1. 練習用のフォルダを作成
mkdir typescript-practice

# 2. 作成したフォルダに移動
cd typescript-practice

# 3. プロジェクトを初期化（package.jsonが作られます）
npm init -y

# 4. TypeScriptと、Node.jsの型定義ファイルをインストール
npm install -D typescript @types/node

# 5. TypeScriptの設定ファイル（tsconfig.json）を生成
npx tsc --init
```
**ワンポイント:**
- `npm init -y`: プロジェクト管理ファイル`package.json`を自動で作成します。
- `npm install -D`: 開発時にのみ必要なツール（TypeScriptコンパイラなど）をインストールします。
- `npx tsc --init`: TypeScriptのコンパイル設定ファイル`tsconfig.json`を作成します。ここには「どのようにTypeScriptをJavaScriptに変換するか」のルールが書かれています。

---

## 🎯 プロジェクト1: 型安全な計算機を作ろう

### Step 1-1: JavaScriptの問題点を体験する

最初に、なぜTypeScriptが必要なのかを実感するために、JavaScriptが抱える「型」の問題を体験します。

`calculator.js`というファイルを作成し、以下のコードを書いてみましょう。

```javascript
// calculator.js - JavaScriptの「型」に関する問題点を体験するためのファイル

/**
 * 2つの値を足し算する関数
 * @param {*} a - 1つ目の値（数値を期待）
 * @param {*} b - 2つ目の値（数値を期待）
 * @returns {*} 計算結果
 * @problem JavaScriptでは、引数が文字列でもエラーにならず、意図しない結果を生むことがある。
 */
function add(a, b) {
    // 本来は数値同士の足し算を期待しているが、文字列が来ると連結してしまう。
    return a + b;
}

/**
 * 2つの値を掛け算する関数
 * @param {*} a - 1つ目の値（数値を期待）
 * @param {*} b - 2つ目の値（数値を期待）
 * @returns {*} 計算結果
 * @problem JavaScriptは自動で型を変換しようとする（暗黙的型変換）ため、予期しない結果やエラーの原因になる。
 */
function multiply(a, b) {
    return a * b;
}

// ===== 実行例とJavaScriptの問題点 =====
console.log('=== JavaScriptの問題点デモ ===');

// ケース1: 期待通りの動作（数値 + 数値）
console.log(`add(5, 3)       -> ${add(5, 3)}`); // 8 ✅

// ケース2: 意図しない結果（文字列 + 数値）
// "5"という文字列と3という数値が「連結」されてしまい、"53"という文字列になってしまう。
console.log(`add("5", 3)     -> "${add("5", 3)}"`); // "53" ❌

// ケース3: たまたま動くが、不安定（文字列 * 数値）
// JavaScriptが"2"を数値の2に自動変換してくれるため、偶然うまくいく。しかし、これは常に期待できる挙動ではない。
console.log(`multiply("2", 4)  -> ${multiply("2", 4)}`); // 8 ✅ (しかし、挙動としては不安定)

// ケース4: 実行時エラー
// "hello"は数値に変換できないため、計算結果がNaN（Not a Number）になる。
console.log(`multiply("hello", 3) -> ${multiply("hello", 3)}`); // NaN ❌

// 問題の根本原因：JavaScriptは「型」に寛容すぎるため、実行するまで間違いに気づけない。
console.log('\n=== なぜ問題が起きるのか？ ===');
console.log('typeof add(5, 3)       ->', typeof add(5, 3));           // "number" (期待通り)
console.log('typeof add("5", 3)     ->', typeof add("5", 3));       // "string" (いつの間にか文字列になっている)
console.log('typeof multiply("hello", 3) ->', typeof multiply("hello", 3)); // "number" (NaNも数値型として扱われる)
```

**コマンドプロンプト（ターミナル）で実行してみましょう：**
```bash
node calculator.js
```
**ここでの学び:** JavaScriptは柔軟ですが、そのせいでプログラムが大規模になると、予期しない型の問題が原因でバグが発生しやすくなります。

---

### Step 1-2: TypeScriptで「型」の安全性を手に入れる

次に、同じ計算機をTypeScriptで作り、問題を解決します。`calculator.ts`というファイルを作成してください。

```typescript
// calculator.ts - TypeScriptで「型」の安全性を実現するファイル

/**
 * 2つの「数値」を足し算する型安全な関数
 * @param a: number - 第一引数。`: number`で「数値しか受け付けない」と宣言。
 * @param b: number - 第二引数。同じく数値のみ。
 * @returns number - 戻り値も「数値である」ことを保証。
 */
function add(a: number, b: number): number {
    return a + b;
}

/**
 * 2つの「数値」を掛け算する型安全な関数
 * @param a: number - 引数の型を明確に定義。
 * @param b: number - これで文字列などが間違って入るのを防ぐ。
 * @returns number - 戻り値の型も保証。
 */
function multiply(a: number, b: number): number {
    return a * b;
}

// ===== 型安全なコードの実行例 =====
console.log('=== TypeScriptによる型安全デモ ===');
console.log(`add(5, 3) -> ${add(5, 3)}`); // 8 ✅ 正常に動作

// ===== コンパイルエラーの例 =====
// 以下の行は、コードを書いた時点でエディタがエラーを教えてくれる。
// 実行する前に間違いに気づけるのがTypeScriptの最大のメリット。
// console.log(add("5", 3));
//             ~~~
// エラーメッセージ例: Argument of type 'string' is not assignable to parameter of type 'number'.
// (意味: 「文字列型の引数は、数値型のパラメータには渡せません」)

// ===== 変数宣言における型 =====

// 1. 明示的な型注釈：変数にも型を宣言できる
const result1: number = add(10, 20);

// 2. 型推論：TypeScriptが賢く型を予測してくれる
// add関数の戻り値はnumberだと分かっているので、書かなくても`autoResult1`はnumber型になる。
const autoResult1 = add(15, 25);

console.log(`\n明示的な型注釈: ${result1}`);
console.log(`型推論による結果: ${autoResult1}`);

// 型が正しくnumberになっているか確認
console.log('typeof result1    ->', typeof result1);      // "number"
console.log('typeof autoResult1 ->', typeof autoResult1); // "number"
```

**コンパイルして実行してみましょう：**
```bash
npx tsc calculator.ts

# 2. 生成されたJavaScriptファイルを実行する
node calculator.js
```

**💡 ここでの学び:**
- **型注釈:** `変数: 型` の形で、変数や関数の引数・戻り値が「どんな型か」を明示します。
- **コンパイル時エラー:** `tsc`コマンドでコンパイルする時や、対応エディタでコードを書いている時に、型の間違いを即座に発見できます。これにより、バグが大幅に減ります。

---

### Step 1-3: Union Typesで、より柔軟な計算機を作る

`'add'`や`'subtract'`のような決まった文字列だけを受け入れる、より実用的な関数を作ります。ここで`Union Types`（合併型）を学びます。

`advanced-calculator.ts`を作成してください。

```typescript
// advanced-calculator.ts - Union Typesと網羅性チェックを学ぶ

/**
 * 許可する計算操作の種類を定義する「Union Type」
 * これにより、`operation`引数は 'add', 'subtract', 'multiply', 'divide' の4種類しか受け付けなくなる。
 * タイプミス（例: 'addd'）や未定義の操作を防ぐことができる。
 */
type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

/**
 * 高度な計算機能を提供する関数
 * @param a 数値
 * @param b 数値
 * @param operation 実行する計算の種類（Operation型で定義された4種類のみ）
 * @returns 計算結果
 */
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
                throw new Error('ゼロで割ることはできません');
            }
            return a / b;
            
        default:
            // 網羅性チェック(Exhaustiveness Checking)
            // もし将来`Operation`に新しい型（例: 'power'）を追加した場合、
            // このdefault節がコンパイルエラーになる。
            // これにより、新しい操作の処理をswitch文に追加し忘れるのを防げる。
            const _exhaustiveCheck: never = operation;
            throw new Error(`未対応の演算です: ${_exhaustiveCheck}`);
    }
}

// ===== 使用例 =====
console.log('=== 高度な計算機のテスト ===');

try {
    const addResult = calculate(10, 5, 'add');
    console.log(`10 + 5 = ${addResult}`); // 15

    const divideResult = calculate(10, 2, 'divide');
    console.log(`10 / 2 = ${divideResult}`); // 5

    // エラーケース：ゼロ除算
    console.log('ゼロ除算を試みます...');
    calculate(10, 0, 'divide');

} catch (error) {
    // `throw new Error`で投げられたエラーをここで受け取る
    console.error('エラーが発生しました:', error.message);
}

// ===== コンパイルエラーの例 =====
// 以下のコードは、'invalid-op'がOperation型に存在しないため、コンパイルエラーになる。
// calculate(10, 5, 'invalid-op');
//                   ~~~~~~~~~~~~
// エラーメッセージ例: Argument of type '"invalid-op"' is not assignable to parameter of type 'Operation'.

console.log('\n=== Union Typesのメリット ===');
console.log('✅ タイプミスを防げる');
console.log('✅ エディタの入力補完が効く');
console.log('✅ 網羅性チェックで、将来の変更に強くなる');
```

**実行してみましょう：**
```bash
npx tsc advanced-calculator.ts && node advanced-calculator.js
```
**💡 ここでの学び:**
- **Union Types (`|`):** 「AまたはB」のように、複数の型を許容する場合に使います。特定の文字列リテラルを組み合わせることで、安全な選択肢を作れます。
- **網羅性チェック:** `switch`文などで、定義した型のすべてのケースを処理しているかTypeScriptにチェックさせるテクニックです。コードの品質を保つのに役立ちます。

---

## 🏗️ プロジェクト2: ユーザー管理システムを作ろう

### Step 2-1: `interface`でデータの「形」を定義する

`interface`（インターフェース）を使って、`User`（ユーザー）のような複雑なオブジェクトの「設計図」を定義する方法を学びます。

`user-manager.ts`を作成してください。

```typescript
// user-manager.ts - インターフェースを使ってデータ構造を定義する

/**
 * ユーザー情報を表すインターフェース（オブジェクトの設計図）
 * これにより、Userオブジェクトは必ず `id`, `name`, `email`, `age` を持つことが保証される。
 */
interface User {
    /** ユーザーの一意なID (読み取り専用にするとより安全) */
    readonly id: number;
    /** ユーザー名 */
    name: string;
    /** メールアドレス */
    email: string;
    /** 年齢 */
    age: number;
    /** アクティブ状態か (省略可能) */
    isActive?: boolean; // `?` は、このプロパティがなくても良い（省略可能）ことを示す
}

/**
 * 新しいユーザーオブジェクトを作成する関数
 * @param name ユーザー名
 * @param email メールアドレス
 * @param age 年齢
 * @returns Userインターフェースの形に沿った新しいユーザーオブジェクト
 */
function createUser(name: string, email: string, age: number): User {
    // この戻り値のオブジェクトは、Userインターフェースのルールに従っている必要がある
    return {
        id: Math.floor(Math.random() * 1000), // ランダムなIDを生成
        name,    // { name: name } の省略形
        email,   // { email: email } の省略形
        age,     // { age: age } の省略形
        isActive: true // デフォルトはアクティブ
    };
}

/**
 * ユーザー情報を分かりやすく表示する関数
 * @param user 表示するユーザーオブジェクト（User型であることが保証されている）
 * @returns フォーマットされた文字列
 */
function displayUser(user: User): string {
    // `isActive`が省略されている場合(undefined)も考慮して、`false`でない限り「有効」と表示
    const status = user.isActive !== false ? '有効' : '無効';
    return `ID: ${user.id}, 名前: ${user.name} (${user.age}歳), メール: ${user.email} [${status}]`;
}

// ===== 実行例 =====
console.log('=== インターフェースを使ったユーザー管理 ===');

// createUserはUser型のオブジェクトを返すことが保証されている
const user1: User = createUser("田中太郎", "tanaka@example.com", 25);
const user2: User = createUser("佐藤花子", "sato@example.com", 30);

// displayUserはUser型の引数を期待している
console.log(displayUser(user1));
console.log(displayUser(user2));

// ===== コンパイルエラーの例 =====
// ageが数値(number)ではなく文字列(string)なので、コンパイルエラーになる
// createUser("山田", "yamada@example.com", "30");
//                                        ~~~~
// エラーメッセージ例: Argument of type 'string' is not assignable to parameter of type 'number'.

// Userインターフェースに存在しないプロパティを追加しようとするとエラーになる
// const invalidUser: User = {
//     id: 1, name: "test", email: "test@test.com", age: 99,
//     address: "Tokyo" // `address`はUserインターフェースに定義されていない
//     ~~~~~~~~~
// };

console.log('\n=== インターフェースのメリット ===');
console.log('✅ オブジェクトの構造が明確になり、コードが読みやすくなる');
console.log('✅ プロパティのタイプミスや不足をコンパイル時に発見できる');
console.log('✅ エディタの強力なサポート（入力補完など）を受けられる');
```

---

### Step 2-2: `class`で、よりオブジェクト指向な管理をする

`class`（クラス）を使うと、データ（プロパティ）と、そのデータを操作するロジック（メソッド）を一つにまとめることができます。より整理されたコードを書くための強力な機能です。

`user-manager-class.ts`を作成してください。

```typescript
// user-manager-class.ts - クラスを使ってユーザー管理機能をまとめる

// 前のステップで定義したUserインターフェースを再利用
interface User {
    readonly id: number;
    name: string;
    email: string;
    age: number;
    isActive?: boolean;
}

/**
 * ユーザー管理を行うためのクラス
 * ユーザーデータの配列と、それらを操作するメソッドを内部に保持する
 */
class UserManager {
    // `private`修飾子：クラスの外部から直接アクセスできないようにする（データを保護するため）
    private users: User[] = [];
    private nextId: number = 1;

    /**
     * 新しいユーザーを追加するメソッド
     * @returns 追加されたユーザーオブジェクト
     */
    addUser(name: string, email: string, age: number): User {
        const newUser: User = {
            id: this.nextId++,
            name,
            email,
            age,
            isActive: true
        };
        this.users.push(newUser);
        console.log(`[INFO] ユーザーを追加しました: ${name}`);
        return newUser;
    }

    /**
     * IDでユーザーを検索するメソッド
     * @returns 見つかったUserオブジェクト、またはundefined
     */
    findUserById(id: number): User | undefined {
        return this.users.find(user => user.id === id);
    }

    /**
     * 全ユーザーのリストを取得するメソッド
     * @returns ユーザーの配列（元の配列のコピーを返すことで、外部からの変更を防ぐ）
     */
    getAllUsers(): readonly User[] {
        return [...this.users]; // `...`はスプレッド構文。配列のコピーを作成している。
    }

    /**
     * ユーザー数を取得するメソッド
     */
    getUserCount(): number {
        return this.users.length;
    }
}

// ===== 実際にクラスを使ってみよう！ =====
console.log("=== クラスによるユーザー管理システムの起動 ===");

// `new`キーワードでUserManagerクラスのインスタンス（実体）を作成
const userManager = new UserManager();

// メソッドを使ってユーザーを追加
userManager.addUser("田中太郎", "tanaka@example.com", 25);
userManager.addUser("佐藤花子", "sato@example.com", 30);

// 全ユーザーを取得して表示
const allUsers = userManager.getAllUsers();
console.log("\n=== 登録ユーザー一覧 ===");
allUsers.forEach(user => {
    console.log(`ID: ${user.id}, 名前: ${user.name}`);
});

// IDでユーザーを検索
const foundUser = userManager.findUserById(2);
console.log("\n=== ID:2のユーザーを検索 ===");
if (foundUser) {
    console.log(`ユーザーが見つかりました: ${foundUser.name}`);
} else {
    console.log("ユーザーが見つかりませんでした");
}

console.log(`\n現在の総ユーザー数: ${userManager.getUserCount()}人`);

// `private`なので、これはコンパイルエラーになる
// userManager.users.push(...); // 外部から直接データを変更することはできない
```

**実行してみましょう：**
```bash
npx tsc user-manager-class.ts && node user-manager-class.js
```
**💡 ここでの学び:**
- **クラス:** データ（`users`配列）とロジック（`addUser`メソッドなど）をひとまとめにすることで、コードが整理され、再利用しやすくなります。
- **`private`:** クラスの内部だけで使いたい変数やメソッドに付けます。これにより、意図しない場所からデータが変更されるのを防ぎ、安全なコードになります（カプセル化）。
- **インスタンス:** `new UserManager()` のようにクラスから作られた具体的な「モノ」のことです。

---

## 🎭 プロジェクト3: `ジェネリクス`で汎用的なライブラリを作ろう

### Step 3-1: 型安全な汎用コレクションを作る

`ジェネリクス`を使うと、`number`専用、`string`専用ではなく、**様々な型に対応できる**柔軟なクラスや関数を作ることができます。まるで「型の変数」のようなものです。

`generic-collection.ts`を作成してください。

```typescript
// generic-collection.ts - ジェネリクスを使って汎用的なコレクションクラスを作成する

/**
 * ジェネリクスを使った汎用コレクションクラス
 * `<T>` が「型の変数（型引数）」で、このクラスがどんな型を扱うかを後から決められる。
 * Tは `Type` の略でよく使われる。
 */
class SafeCollection<T> {
    private items: T[] = [];

    // `T`型のアイテムを追加する
    add(item: T): void {
        this.items.push(item);
    }

    // `T`型のアイテムを取得する
    get(index: number): T | undefined {
        return this.items[index];
    }

    // `T`型のアイテムの配列を返す
    getAll(): readonly T[] {
        return this.items;
    }

    count(): number {
        return this.items.length;
    }
}

// ===== 使用例1: 数値(number)のコレクション =====
console.log("=== 数値コレクション ===");
// `SafeCollection<number>` とすることで、このインスタンスは数値しか扱えなくなる
const numberCollection = new SafeCollection<number>();
numberCollection.add(10);
numberCollection.add(20);
// numberCollection.add("30"); // コンパイルエラー！ stringはnumberではない

console.log(`数値アイテム数: ${numberCollection.count()}`);
console.log(`最初のアイテム: ${numberCollection.get(0)}`);


// ===== 使用例2: 文字列(string)のコレクション =====
console.log("\n=== 文字列コレクション ===");
// 今度は `<string>` を指定したので、文字列専用のコレクションになる
const stringCollection = new SafeCollection<string>();
stringCollection.add("りんご");
stringCollection.add("バナナ");
// stringCollection.add(123); // コンパイルエラー！ numberはstringではない

console.log(`文字列アイテム: ${stringCollection.getAll().join(", ")}`);


// ===== 使用例3: ユーザー(User)オブジェクトのコレクション =====
console.log("\n=== ユーザーコレクション ===");
interface User { name: string; age: number; }

// 複雑なオブジェクトでも、型さえ指定すれば何でも扱える
const userCollection = new SafeCollection<User>();
userCollection.add({ name: "田中", age: 25 });
userCollection.add({ name: "佐藤", age: 30 });

console.log("ユーザーコレクション:", userCollection.getAll());

console.log('\n=== ジェネリクスのメリット ===');
console.log('✅ 一つのクラスで、様々な型を安全に扱える');
console.log('✅ コードの再利用性が劇的に向上する');
console.log('✅ 型安全なので、間違った型のデータを追加しようとするとコンパイルエラーになる');
```

---

### Step 3-2: ジェネリクスで設定管理システムを作る

より実践的な例として、アプリケーションの設定を管理するクラスをジェネリクスを使って作ってみましょう。

`config-manager.ts`を作成してください。

```typescript
// config-manager.ts - ジェネリクスを使った実践的な設定管理クラス

// アプリ設定の「設計図」
interface AppConfig {
    theme: 'light' | 'dark';
    language: 'ja' | 'en';
    notifications: boolean;
}

// DB設定の「設計図」
interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
}

/**
 * 汎用的な設定管理クラス
 * `<T>` には AppConfig や DatabaseConfig のような設定インターフェースが入る
 */
class ConfigManager<T> {
    private config: Partial<T>; // `Partial<T>`は、Tのプロパティをすべて省略可能にする便利な型
    private defaultConfig: T;

    constructor(defaultConfig: T) {
        this.defaultConfig = defaultConfig;
        this.config = {}; // 最初は空の設定
    }

    // `K extends keyof T` は「KはTのキーのいずれかである」という制約
    // これにより、`key`に存在しないプロパティ名を書くとエラーになる
    set<K extends keyof T>(key: K, value: T[K]): void {
        this.config[key] = value;
    }

    get<K extends keyof T>(key: K): T[K] {
        // ユーザー設定があればそれを返し、なければデフォルト値を返す
        return this.config[key] ?? this.defaultConfig[key];
    }

    // 現在の全設定（デフォルト値とユーザー設定をマージしたもの）を取得
    getAll(): T {
        return { ...this.defaultConfig, ...this.config };
    }
}

// ===== アプリ設定(AppConfig)を管理するインスタンス =====
console.log("=== アプリ設定管理 ===");
const appConfigManager = new ConfigManager<AppConfig>({
    theme: 'light',
    language: 'ja',
    notifications: true
});

// 設定を変更
appConfigManager.set('theme', 'dark');
// appConfigManager.set('theme', 'blue'); // エラー！ 'blue'は 'light'|'dark' ではない
// appConfigManager.set('font-size', 16); // エラー！ 'font-size'はAppConfigにない

console.log("現在のテーマ:", appConfigManager.get('theme')); // dark
console.log("現在の言語:", appConfigManager.get('language')); // ja (デフォルト値)
console.log("全設定:", appConfigManager.getAll());


// ===== DB設定(DatabaseConfig)を管理するインスタンス =====
console.log("\n=== データベース設定管理 ===");
const dbConfigManager = new ConfigManager<DatabaseConfig>({
    host: 'localhost',
    port: 5432,
    user: 'admin'
});

dbConfigManager.set('host', 'production.db.com');
console.log("DBホスト:", dbConfigManager.get('host')); // production.db.com
console.log("全設定:", dbConfigManager.getAll());
```

**実行してみましょう：**
```bash
npx tsc config-manager.ts && node config-manager.js
```
**💡 ここでの学び:**
- **`Partial<T>`:** `T`のプロパティをすべてオプショナル（`?`が付いた状態）にするユーティリティ型。一部だけ設定を更新したい場合に便利です。
- **`keyof T`:** `T`のキー（プロパティ名）のUnion Typeを生成します（例: `keyof AppConfig` は `'theme' | 'language' | 'notifications'` になります）。
- **`T[K]`:** `T`の`K`というキーに対応する値の型を取得します（ルックアップ型）。
- **ジェネリクス制約 (`extends`):** 型引数`K`が`keyof T`の条件を満たすことを保証します。これにより、さらに安全なコードが書けます。

---

## 🎓 まとめ: この章でできるようになったこと

このハンズオンを通じて、あなたは以下のTypeScriptの強力な機能を実際に体験しました。

### ✅ 基本的な型システム
- `number`, `string` などの基本的な型を使って、変数の間違いを防げるようになった。
- 関数の引数と戻り値に型を付けることで、安全な関数を作れるようになった。
- `Union Types` (`|`) を使って、複数の型や値を安全に扱えるようになった。

### ✅ インターフェース (`interface`)
- オブジェクトの「設計図」を定義し、データの構造を明確にできるようになった。
- 他の人がコードを読んでも、どんなデータが必要なのかが一目でわかるようになった。

### ✅ クラス (`class`)
- データと、そのデータを操作するメソッドを一つにまとめることで、コードを整理できるようになった。
- `private` を使って、外部からデータを守る「カプセル化」の考え方を学んだ。

### ✅ ジェネリクス (`<T>`)
- 様々な型に対応できる、再利用性の高いコードを書けるようになった。
- 型安全性を保ちながら、柔軟なプログラムを設計できるようになった。

これらの知識は、バグが少なく、メンテナンスしやすいコードを書くための強力な武器になります。

## 🚀 次のステップ

TypeScriptの基礎を体験した今、いよいよThree.jsの世界でその力を発揮する時です！

**[01. TypeScript × Three.js連携](./01-typescript-threejs-bridge.md)** に進んで、今日学んだ知識を3Dプログラミングで活用していきましょう！

