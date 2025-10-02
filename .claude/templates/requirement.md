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
- **要件依存**: なし（独立した要件）
- **外部サービス**:
  - Claude API（Claude Code環境経由）
  - Git（バージョン管理）
- **前提条件**:
  - `/sdp:steering` コマンドが実行済み
  - `.sdp/product.md`, `.sdp/tech.md`, `.sdp/structure.md` が存在する
  - `.claude/templates/requirement.md` テンプレートが存在する
- **技術的依存**:
  - Read, Write, Edit, Glob, Grep ツールが使用可能
  - Bashコマンドが実行可能

## Non-Functional Requirements

### Security
<セキュリティ要件>

例：
- 機密情報（APIキー、パスワード、個人情報）を要件ファイルに含めない
- ファイルパーミッションは644（owner: rw, group: r, others: r）
- ユーザー入力のサニタイゼーション（特殊文字のエスケープ）

### Observability
<監視・ロギング要件>

例：
- コマンド実行時に進捗状況をコンソールに出力
- エラー発生時に詳細なエラーメッセージとスタックトレースを表示
- 作成・更新されたファイルパスをログに記録
- 実行時間をメトリクスとして記録（パフォーマンス測定用）

### Performance
<パフォーマンス要件>

例：
- 要件生成は30秒以内に完了する（Claude API のレスポンスタイム含む）
- ファイルサイズは1MB以下に制限
- 同時に複数の要件生成を実行できる（並列処理対応）
- メモリ使用量は100MB以下

### Accessibility
<アクセシビリティ要件>

例：
- コンソール出力は日本語で表示（ユーザーの言語設定に従う）
- エラーメッセージは明確で実行可能な対処法を含む
- ファイルフォーマットはマークダウン（テキストエディタで編集可能）
- カラーコード出力は色覚特性に配慮（絵文字併用）

## Risks
<リスクを「発生確率」「影響度」「回避策」で記述>

例：

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Claude API のレート制限超過 | Medium | High | リトライロジック実装、エラーメッセージで再実行を促す |
| テンプレートファイルの不整合 | Low | Medium | テンプレート読み込み時にバリデーション実行 |
| 既存ファイル上書き時のデータ損失 | Medium | Medium | UPDATE modeで差分更新、バックアップ推奨メッセージ |
| 大量の要件生成によるディスク容量不足 | Low | Low | ディスク使用量の定期チェック、警告メッセージ |
| 不正な自然言語入力の処理失敗 | Medium | Low | 入力検証、Claude APIのエラーハンドリング強化 |

## Notes
<補足情報、実装時の注意事項、将来的な拡張案など>

例：
- **実装上の注意**:
  - `.sdp/requirements/` ディレクトリが存在しない場合は自動作成する
  - REQ-ID は既存ファイルを走査して次の番号を自動割り当て
  - テンプレート構造に厳密に従う（セクションの順序も維持）
- **将来の拡張案**:
  - 要件のバージョン管理機能（REQ-001-v2.md）
  - 要件間の関連性可視化（依存グラフ生成）
  - 多言語対応（英語、中国語など）
  - AIによる要件の自動精緻化提案
- **参考資料**:
  - `.claude/commands/sdp/requirement.md` - コマンド定義
  - `.claude/templates/requirement.md` - テンプレート構造
  - `.sdp/product.md` - ビジネスコンテキスト

---
*Created: YYYY-MM-DD*
*Last updated: YYYY-MM-DD*