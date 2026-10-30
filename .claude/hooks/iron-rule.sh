#!/bin/bash
# 会話の開始時に「鉄の掟」(dropbox-strict-rule) を自動で読み込ませる。
# Claude の判断に任せず、仕組みとして毎回コンテキストに入れるためのフック。

rule_file=$(find "$HOME/.claude/skills" -path '*dropbox-strict-rule/SKILL.md' 2>/dev/null | head -n 1)

echo "【最優先・鉄の掟】この会話の最初の操作として、以下を必ず行うこと（例外なし）。"
echo "1. 鉄の掟（dropbox-strict-rule）の本体を最後まで読む。説明文だけで読んだことにしない（ルール15）。"
echo "2. 続けて U-MA 進行台帳（https://claude.ai/artifact/8HQth2phTsbsBFGCTGjGsz）を Artifact の read で読む（ルール23）。"
echo "3. 読み込んだバージョンを華丸さんに提示してから、依頼された作業に入る。"
echo

if [ -n "$rule_file" ]; then
  echo "鉄の掟の場所: $rule_file"
  grep -m 1 'Version:' "$rule_file"
  echo
  echo "ルール見出し一覧（本体の代わりにはならない。必ず本体を読むこと）:"
  grep -E '^### ルール' "$rule_file"
else
  echo "鉄の掟のファイルが見つからない。Skill ツールで dropbox-strict-rule を読み込むこと。"
fi
