# 申し送り書：u-ma.jp ブログ投稿（WP REST API）と note
作成：2026-10-30（前のセッションから） ／ 依頼者：華丸さん（藤井華丸、U-MA Inc.）

## 0. 最初に守ること
- **鉄の掟（dropbox-strict-rule）を先に読む**。とくに：成果物の生成・本番への反映・公開は、華丸さんのメッセージに「GO」が入ってから。分からないことを推測で埋めない。話を広げない。URLはマークダウンのリンクで。
- **返事は日本語**。専門用語（API・ブランチ・フリック等）は、指の動きや身近な言葉に置き換えて説明する。
- **台帳**「U-MA 進行台帳」 https://claude.ai/artifact/8HQth2phTsbsBFGCTGjGsz （ArtifactData、project id `uma-fv-puzzle`）。このブログの task は `umafv-t13`。記録は**聞かずに**更新する（華丸さんとの約束）。
- 関連スキル：`u-ma-renewal`（U-MA.ai さんの語り口・ブログ方針）、`uma-copywriter`（言葉の作法。「！」・告知調・「想い」「こだわり」等を使わない）。

## 1. やること
1. **ブログを u-ma.jp に WP REST API で投稿する**
   - まず**下書き（status: draft）**で入れ、華丸さんにプレビューURLを渡して確認してもらう
   - 「公開」は華丸さんの **GO** が出てから（status: publish に更新）
2. **note**：原稿はできている（`note.txt`）。華丸さんが「note生成」と言ったら、まず下の「未確定」を確認する

## 2. このフォルダのファイル（リポジトリ `handoff/2026-10-30_blog-note/`）
| ファイル | 中身 |
|---|---|
| `blog-custom-html.html` | ブログ本文（約3,400字）。`<div class="uma-blog">` の中に `<style>` と本文。YouTube埋め込み・GitHubの流れ図・華丸さんの指示一覧入り。先頭1行のHTMLコメント（貼り付け案内）は投稿時に除く |
| `blog-settings.txt` | タイトル・スラッグ・抜粋・アイキャッチ代替テキスト・All in One SEO の各項目・タグ案・手作業の投稿手順 |
| `U-MA_blog_eyecatch_1200x630.jpg` | アイキャッチ（映像の「AI」の場面） |
| `note.txt` | note 用原稿（約2,200字、タイトル・見出しの付け方・ハッシュタグ入り） |
| `U-MA_note_header_1280x670.jpg` | note 見出し画像（「GRAPHIC」の場面） |

ブログの要点（華丸さんの指定）：AIバイブコーディングで作った／以前は After Effects のタイムラインにキーフレーム／いまは Prompt Motion → Claude／GitHub の仕組みを詳しく／バックエンドやコーディングを知らなくてもここまでできる（2026年10月現在）／デザイナーの目＝ダメ出し、AIが指示どおりでもイメージどおりでなければNG／華丸さんが入れた具体的な指示を書く／締め「あなたのプロジェクトを成功させるのは、AIを使えるデザイナーだ。…ブレインが必要なのだ」。語り手は U-MA.ai。

## 3. 接続の情報
- 環境変数：`UMA_WP_URL`（= https://u-ma.jp）、`UMA_WP_USER`、`UMA_WP_APP_PASSWORD`（アプリケーションパスワード）。華丸さんが環境設定に保存済み。**値をチャットやログに出さない**。
- **`WP_URL` / `WP_USER` / `WP_APP_PASSWORD` は別サイト（grundtvig.co.jp）用。u-ma.jp には使わない。**
- 環境の Allowed domains に `u-ma.jp` と `www.u-ma.jp` を追加済み（華丸さん）。
- `https://u-ma.jp/` は `https://www.u-ma.jp/` にリダイレクトされる。API は **`https://www.u-ma.jp/wp-json/...`** で試すこと。

## 4. わかっている問題（前のセッションで確認）
- `https://u-ma.jp/wp-json/` と `https://u-ma.jp/wp-json/wp/v2/users/me` が、**エックスサーバーの「403 Forbidden」ページ**を返した（WordPress ではなくサーバー側の拒否）。`/?rest_route=/` はトップページの HTML が返った。
- **www.u-ma.jp 側では未確認**（前のセッションでは確認の途中で止まった）。
- 原因の推定（未確認）：エックスサーバーの「WordPressセキュリティ設定」にある **REST API へのアクセス制限（国外IPからのアクセス制限）**。このセッションの通信は海外のサーバーから出るため。
  - 403 が続く場合は、華丸さんに次を案内する（推定である旨も伝える）：エックスサーバーの **サーバーパネル → WordPressセキュリティ設定 → u-ma.jp → 「REST API アクセス制限」をOFF**（または「国外IPアクセス制限」をOFF）。投稿が終わったら元に戻してよい。
  - それでもだめなら、手作業での投稿（`blog-settings.txt` の手順、1〜2分）に切り替える。

## 5. 投稿の手順（API）
1. 接続確認：`GET /wp-json/wp/v2/users/me?context=edit`（Basic 認証。ユーザー名とアプリケーションパスワード）。ロールが投稿できるもの（administrator / editor / author）か確認
2. アイキャッチ：`POST /wp-json/wp/v2/media`（`Content-Disposition: attachment; filename=U-MA_blog_eyecatch_1200x630.jpg`）→ 返った id に `alt_text` を設定（`blog-settings.txt` の代替テキスト）
3. カテゴリ：`GET /wp-json/wp/v2/categories?per_page=100` で一覧を取り、**どれにするかは華丸さんに聞く**（前のセッションでは一覧を見られていない。推測で決めない）
4. タグ：`blog-settings.txt` のタグ案を `GET/POST /wp-json/wp/v2/tags` で用意
5. 投稿：`POST /wp-json/wp/v2/posts`
   - `title` / `slug`（`vibe-coding-first-view`）/ `excerpt` / `status: "draft"` / `featured_media` / `categories` / `tags`
   - `content` は**カスタムHTMLブロック**で包む：`<!-- wp:html -->` + 本文（先頭のHTMLコメント行を除く）+ `<!-- /wp:html -->`
   - 注意：u-ma.jp は Uncode + WPBakery。投稿がクラシックエディタの場合も、上の形のままHTMLとして表示されるはず。プレビューで崩れていないか必ず華丸さんに確認してもらう
6. **All in One SEO**：REST で書き込めるかは**未確認**（AIOSEO のバージョン次第）。投稿の応答や `GET /wp-json/wp/v2/posts/<id>` に AIOSEO 用のフィールドがあれば、それで SEOタイトル・メタディスクリプション・フォーカスキーフレーズ・SNS設定を入れる。無ければ `blog-settings.txt` を見て華丸さんに手で入れてもらう（無理に別の方法を作らない）
7. 下書きのプレビューURL（`link` + `&preview=true` など）を華丸さんに渡す → GO で `status: "publish"`
8. 台帳 `umafv-t13` を更新

## 6. 未確定（華丸さんに聞くこと）
- ブログのカテゴリ
- note の語り手：今は U-MA.ai。**note が華丸さん個人のアカウントなら、華丸さんの一人称で書き直す**か確認
- note への投稿はこちらからはできない（API なし）。原稿と見出し画像を渡して、華丸さんに貼ってもらう

## 7. 背景（ここまでの流れ）
- u-ma.jp トップのFV：コードで動く15秒のショーリール（白地・黒・赤、公式ロゴSVGの部品を使用）。GitHub Pages（このリポジトリの main）から `uma-fv/uma-hero.js` を読み込む。WordPress の Raw HTML は2行のまま
- 最初の画面は赤丸＋「Click me !」、再生後は「Play again ! / ● / Scroll down ↓」。本番反映済み（main d2a1b49）
- 2ndビュー：デザインパズル（`uma-fv/uma-puzzle.js`）
- インスタ・YouTube 用の縦長MP4（1080×1920、15秒）を納品済み。YouTubeショート：https://youtube.com/shorts/iLshcUwn18k
- 縦長レイアウトのコードは作業ブランチ `claude/graphic-designer-game-bj4ybw`（8d64e6e〜）。サイトのスマホ縦長版への適用は未（GO待ち）
- 作業ブランチ：`claude/graphic-designer-game-bj4ybw`。**main は本番（u-ma.jp が読む）**なので、GO なしに main へ push しない
