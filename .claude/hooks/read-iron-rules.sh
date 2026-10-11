#!/bin/bash
# 新しいセッションの開始時に、鉄の掟と U-MA 進行台帳を最初に読ませる。
# 出力はセッションの文脈にそのまま入る。

rule=$(find "$HOME/.claude/skills" -path '*dropbox-strict-rule/SKILL.md' 2>/dev/null | head -1)

cat <<MSG
【最優先・例外なし】このセッションでは、華丸さんの最初の発言が何であっても、返事や作業より先に次を行うこと。

1. Skill ツールで anthropic-skills:dropbox-strict-rule（鉄の掟）を読む
2. 続けて U-MA 進行台帳を読む（Artifact ツールの action "read"：https://claude.ai/artifact/8HQth2phTsbsBFGCTGjGsz 。中身は ArtifactData で projects / tasks / decisions を読む）
3. 「読み込みバージョン: dropbox-strict-rule vX.XX」「読み込み: U-MA 進行台帳（最終更新 YYYY/MM/DD）」を華丸さんに示す
4. その後で、華丸さんの言葉どおりに対応する。推測で作業を始めない

「今回の話は掟と関係なさそう」と判断して読み飛ばすことは禁止（ルール15）。
MSG

if [ -n "$rule" ]; then
  echo
  echo "鉄の掟の本体: $rule"
  grep -m1 '^> \*\*Version' "$rule"
else
  echo
  echo "鉄の掟のファイルが見つからない場合も、Skill ツールで anthropic-skills:dropbox-strict-rule を読むこと。"
fi
