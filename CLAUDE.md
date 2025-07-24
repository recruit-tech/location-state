# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際のガイダンスを提供します。

## プロジェクト構成

これは、ブラウザ履歴とロケーション状態と同期するReact状態管理ライブラリのmonorepoです。プロジェクトは以下を使用しています：

- **pnpm** パッケージマネージャー（必須、バージョン 10.13.1）
- **Turbo** monorepoビルドオーケストレーション
- **Biome** リンティングとフォーマット
- **TypeScript** 厳密な設定
- **Vitest** ユニットテスト
- **Playwright** サンプルアプリのインテグレーションテスト

### 主要ディレクトリ

- `packages/` - コアライブラリパッケージ
  - `location-state-core/` - Next.js App Router用メインライブラリ
  - `location-state-next/` - Next.js Pages Router用アダプター
  - `location-state-conform/` - Conformフォームライブラリとの統合
  - `test-utils/` - 共有テストユーティリティ
  - `utils/` - 共有ユーティリティ関数
  - `configs/` - 共有TypeScript設定
- `apps/` - 使用例を示すサンプルアプリケーション
  - `example-next-basic/` - 基本的なNext.jsサンプル
  - `example-next-conform/` - Conform統合サンプル
  - `example-next-custom-store/` - カスタムストアサンプル
  - `example-next-unsafe-navigation/` - unsafe navigationサンプル

## 開発コマンド

### パッケージ管理
```bash
# 依存関係インストール（必須 - npm/yarnは使用不可）
pnpm install

# パッケージのみ開発モード
pnpm dev:packages
```

### ビルド・型チェック
```bash
# 全パッケージ・アプリをビルド
pnpm build

# パッケージのみビルド
pnpm build:packages

# TypeScript宣言ファイル生成
turbo dts

# 型チェック
pnpm typecheck
```

### テスト
```bash
# 全ユニットテスト実行
pnpm test

# インテグレーションテスト実行（Playwright）
pnpm integration-test

# 単一テストファイル実行（パッケージディレクトリから）
cd packages/location-state-core
pnpm test src/hooks.test.ts
```

### リンティング・フォーマット
```bash
# コードスタイル・リントチェック
pnpm check

# コードスタイル・リント問題の自動修正
pnpm check:apply

# フルCIチェック（lint + typecheck + build + test）
pnpm ci-check

# プリコミットチェック（lint + typecheck + test）
pnpm commit-check
```

## コアアーキテクチャ

ライブラリは以下の主要コンポーネントで状態同期システムを実装しています：

### Stores (`packages/location-state-core/src/stores/`)
- `URLStore` - URLクエリパラメータと状態を同期
- `StorageStore` - sessionStorage/localStorageと状態を同期
- `InMemoryStore` - インメモリ状態管理
- 各ストアは`subscribe`、`get`、`set`メソッドを持つ`Store`インターフェースを実装

### Syncers (`packages/location-state-core/src/syncers/`)
- `NavigationSyncer` - App Router用ブラウザナビゲーションイベント処理
- 異なるルーティングシステム用カスタムシンカーを実装可能

### プロバイダーパターン
- `LocationStateProvider` アプリをラップし、Reactコンテキスト経由でストアを提供
- `useLocationState` フック選択されたストア経由で状態にアクセス・管理
- デフォルトストア：`session` (sessionStorage) と `url` (URLパラメータ)

### パッケージエクスポート
- メインエクスポート：`@location-state/core` - App Router対応
- `@location-state/core/unsafe-navigation` - 実験的Navigation API使用
- `@location-state/next` - Pages Routerアダプター
- `@location-state/conform` - フォーム統合

## パッケージ開発

各パッケージは以下の構造に従います：
- `src/` - TypeScriptソースファイル
- `dist/` - ビルド済みJavaScript出力（CJS/ESM）
- `types/` - 生成されたTypeScript宣言
- `tsup.config.ts` - ビルド設定
- `vitest.config.mts` - テスト設定（テストを持つパッケージ）

## 開発ルール

### TDD実践（和田卓人さんのアプローチ）
- 新機能開発時は**Red-Green-Refactor**サイクルを厳密に守る
- **失敗するテストを最初に書く（Red）**
- **最小限のコードでテストを通す（Green）**
- **動作を変えずにコードを改善（Refactor）**
- テストファーストでAPIを設計し、使いやすさを検証する
- テストは仕様書として機能させる - 明確で読みやすく書く
- モックは最小限に留め、実際の動作をテストする

### 変更時の手順：
1. `src/`内のソースファイルを変更
2. **TDD実践時：テストを先に書き、失敗を確認してから実装**
3. `pnpm typecheck` でTypeScriptを検証
4. `pnpm test` でユニットテストを実行
5. `pnpm build` で出力を生成
6. 必要に応じてサンプルアプリで統合テスト