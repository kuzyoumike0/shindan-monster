# あなたの心に住む、ちいさな怪物

GitHub → Railway で公開できる完成版です。

## 入っている機能

- 人型ゴスロリキャラ16種類、全24問の診断
- LINE風トーク画面（実際のLINEへの接続・送信はありません）
- 4要素の割合と、キャラ入り結果画像の保存
- 嫉妬・寂しさ・認めてほしい気持ち・考え込みやすさの追加8問と、気持ちに合わせたヒント
- 全キャラの一覧・詳細
- 「相性が合う相手」「すれ違いやすい相手」の画像カードと理由
- Xへの結果投稿、キャラ別リンクプレビュー
- 共有URLを開くと、同じキャラと割合を再表示

## 1. GitHubにアップロード

1. このZIPを展開します。
2. GitHubで新しいリポジトリを作ります。名前の例：`little-monsters`。
3. **展開したフォルダの中身**を、そのリポジトリの一番上にアップロードします。
4. `Dockerfile`・`package.json`・`railway.json`・`server.mjs`・`public` が同じ階層に見えることを確認して、コミットします。

ZIP自体をアップロードしても、Railwayでは起動しません。展開後の中身をアップロードしてください。

## 2. RailwayからGitHubを選ぶ

1. Railwayで **New Project → Deploy from GitHub repo** を選びます。
2. 上で作ったリポジトリを選びます。候補に出ない場合は、RailwayのGitHub連携でそのリポジトリへのアクセスを許可します。
3. 自動でDockerfileが検出され、ビルドと起動が行われます。
4. サービスの **Settings → Networking → Public Networking → Generate Domain** で公開URLを作ります。
5. ポートの入力を求められたら、実際のサービスのPORTを指定します。手動でPORTを追加していなければ、通常はRailwayが検出した値を使います。

Root Directoryは、フォルダの中身をリポジトリの一番上に置いた場合、空欄または `/` のままです。

### 設定値

| 項目 | 値 |
| --- | --- |
| Builder | Dockerfile（同梱設定で指定済み） |
| Dockerfile Path | Dockerfile |
| Start Command | 空欄（DockerfileのCMDを使用） |
| Healthcheck Path | /health（設定済み） |
| データベース | 不要 |
| APIキー | 不要 |
| PUBLIC_ORIGIN | 通常は不要。独自ドメイン使用時のみ `https://あなたのドメイン` |

Railwayの公開ドメインは自動で取得し、共有リンクとXプレビュー画像のURLへ反映します。旧サイトのアカウント名を含むURLは使用していません。

公開ドメイン作成後、もしXプレビューのURLに古いドメインが残る場合はサービスを一度Redeployしてください。独自ドメインを使う場合はPUBLIC_ORIGINを設定してRedeployします。

## 3. 更新

GitHubの接続ブランチに変更をコミットすると、Railwayの自動デプロイが有効な場合、更新されます。

## ローカルで動かす

Node.js 22以上を入れた環境で、以下を実行します。外部パッケージのインストールは不要です。

```bash
npm start
```

`http://localhost:3000` を開きます。

```bash
npm test
```

ヘルスチェック、16種類の共有ページ・画像、ドメイン反映、共有URLの引き継ぎを確認します。

## 編集する場所

- 質問・結果文：`public/data.js`
- デザイン・診断画面・相性カード：`public/index.html`
- キャラ画像：`public/assets/monsters-human.png` と `monsters-human-2.png`
- Xプレビュー画像：`public/assets/share-0.png` ～ `share-15.png`
- キャラ別共有ページ：`public/result/0/index.html` ～ `public/result/15/index.html`
- 配信サーバー：`server.mjs`

質問や紹介文を変更した場合、キャラ別共有ページにも同じ変更を反映してください。共有ページの`__PUBLIC_ORIGIN__`はサーバーが実際の公開URLに置き換えるため、そのまま残してください。

## Xの結果表示について

「Xに結果を投稿」で、キャラ名・4要素の割合・結果URLを含む投稿画面が開きます。最後の投稿操作は利用者が行います。リンクプレビューはキャラ別の画像と紹介文を使用します。回答ごとの割合は投稿本文とリンク先に表示されます。プレビューの反映時期や表示可否はX側の仕様・キャッシュによって変わります。

## 補足

診断は創作エンタメです。実際の性格評価や心理検査ではありません。回答はブラウザ内で処理し、このサーバーは回答をデータベースへ保存しません。共有URLには基本4項目と感情4項目の回答割合が含まれます。

Railway公式ガイド：
- https://docs.railway.com/quick-start
- https://docs.railway.com/guides/dockerfiles
