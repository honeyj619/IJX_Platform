# Git 工作流程指南

## 避免同步冲突的最佳实践

### 1. 同步代码前的工作流程

每次开始新任务前，建议按以下步骤操作：

```bash
# 1. 确保在正确的工作分支
git checkout trae/solo-agent-FdyG43

# 2. 拉取最新代码（使用 rebase 避免合并）
git pull --rebase origin main

# 3. 如果有冲突，解决冲突后继续
git rebase --continue

# 4. 确认没有问题后开始工作
```

### 2. 已配置的 Git 设置

项目已配置以下 Git 设置以避免同步问题：

```bash
# 1. 自动使用 rebase 而非 merge
git config pull.rebase true

# 2. push 时推送当前分支
git config --global push.default current

# 3. 当前分支已追踪远程分支
git branch --set-upstream-to=origin/main
```

### 3. 提交和推送代码

```bash
# 1. 查看修改状态
git status

# 2. 添加修改的文件
git add <文件名>

# 3. 提交（使用清晰的提交信息）
git commit -m "feat: 描述你的修改"

# 4. 推送到远程
git push
```

### 4. 解决常见同步问题

#### 问题1：本地分支领先远程

如果看到 "Your branch is ahead of 'origin/xxx' by N commits"：
```bash
git push
```

#### 问题2：远程分支有新提交

如果看到 "Your branch is behind 'origin/xxx' by N commits"：
```bash
git pull --rebase
```

#### 问题3：rebase 冲突

解决冲突后：
```bash
git add <解决冲突的文件>
git rebase --continue
```

#### 问题4：rebase 失败想放弃

```bash
git rebase --abort
```

### 5. 推荐的工作流程

1. **每日开始**：先 pull 最新代码
2. **频繁提交**：每完成一个小功能就提交
3. **清晰信息**：使用语义化的提交信息
4. **及时推送**：避免本地积累太多提交
5. **定期同步**：每隔一段时间拉取最新代码

### 6. 注意事项

- ⚠️ 使用 `--force` 推送时要格外小心
- ⚠️ Rebase 会重写提交历史，不要对已共享的提交使用
- ⚠️ 解决冲突时要仔细，确保代码功能正常
- ✅ 始终使用 `pull --rebase` 而不是 `pull`（默认 merge）
- ✅ 保持提交粒度适中，不要一次性提交太多修改
