# REQ-XXX: <要件タイトル>

## Goal
<この要件が達成すべきビジネスゴールまたはユーザーゴールを明確に記述>

例：
- ユーザーが自然言語で入力した要件を、構造化された仕様書として自動生成する
- プロジェクトマネージャーがタスクの見積もりと依存関係を可視化できるようにする
- 開発チームが要件をGitHub Issuesに一括登録し、進捗管理を効率化する

## Done Criteria
<完了条件をテスト可能な粒度で列挙。チェックリスト形式で記述>

例：
- [ ] 自然言語の要件入力を受け付けるコマンドが動作する
- [ ] `.sdp/requirements/REQ-xxx.md` に構造化された仕様書が生成される
- [ ] 生成された仕様書が `.claude/templates/requirement.md` の構造に従っている
- [ ] Done Criteria, Acceptance Scenarios, NFRs, Risks, Dependencies が全て含まれている
- [ ] `.sdp/product.md` と `.sdp/tech.md` の制約に矛盾がない
- [ ] コンソールに「REQ-ID: REQ-xxx」が出力される
- [ ] 次のステップ（`/sdp:estimate`）への案内が表示される

## Acceptance Scenarios
<受け入れシナリオをGherkin形式（Given/When/Then）で記述。複数シナリオ推奨>

### Scenario 1: 新規要件の作成
```gherkin
Given ユーザーがプロジェクトのルートディレクトリにいる
And .sdp/product.md と .sdp/tech.md が存在する
When `/sdp:requirement "ユーザー認証機能を追加する"` を実行する
Then .sdp/requirements/REQ-001.md が作成される
And ファイルには Goal, Done Criteria, Acceptance Scenarios が含まれている
And コンソールに "REQ-ID: REQ-001" が表示される
```

### Scenario 2: 既存要件の更新
```gherkin
Given .sdp/requirements/REQ-001.md が既に存在する
When `/sdp:requirement .sdp/requirements/REQ-001.md` を実行する
Then REQ-001.md の内容が更新される
And 既存のカスタマイズ内容が保持される
And 更新日時がファイルに記録される
```

### Scenario 3: ファイルパスからの読み込み
```gherkin
Given draft-requirement.md というファイルが存在する
When `/sdp:requirement draft-requirement.md` を実行する
Then ファイルの内容が読み込まれる
And 内容が精緻化されて .sdp/requirements/REQ-002.md に保存される
```

## Dependencies
<この要件が依存する他の要件、外部サービス、または前提条件>

例：
- **要件依存**: REQ-001（ユーザー認証機能）が完了していること
- **外部サービス**:
  - Stripe API（決済処理）
  - SendGrid（メール送信）
- **前提条件**:
  - データベーススキーマが定義済み
  - 開発環境が構築済み

## Non-Functional Requirements

### Security
<セキュリティ要件>

例：
- 個人情報は暗号化して保存する
- 認証トークンは1時間で期限切れにする
- 全ての通信はHTTPSで行う

### Observability
<監視・ロギング要件>

例：
- エラー発生時にログに記録する
- API呼び出しの応答時間を監視する
- 重要な操作は監査ログに記録する

### Performance
<パフォーマンス要件>

例：
- ページ読み込み時間は2秒以内
- API応答時間は200ms以内
- 1000件のデータを5秒以内に処理できる

### Accessibility
<アクセシビリティ要件>

例：
- WCAG 2.1 Level AA に準拠する
- キーボード操作のみで全機能が利用可能
- スクリーンリーダーに対応する

## Risks
<リスクを「発生確率」「影響度」「回避策」で記述>

例：

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| 外部API障害による機能停止 | Medium | High | リトライ処理、フォールバック機能の実装 |
| データ移行時の不整合 | Low | High | 移行前のバックアップ、段階的ロールアウト |
| パフォーマンス劣化 | Medium | Medium | 負荷テストの実施、キャッシング戦略の導入 |

## Notes
<補足情報、実装時の注意事項、将来的な拡張案など>

例：
- **UI/UX上の注意**:
  - モバイル表示を優先する
  - 入力フォームのバリデーションはリアルタイムで行う
- **将来の拡張案**:
  - 多言語対応（英語、中国語など）
  - エクスポート機能（CSV、PDF）
- **参考資料**:
  - 類似機能の実装例: https://example.com/docs

---
*Created: YYYY-MM-DD*
*Last updated: YYYY-MM-DD*