# 05 · 分支流程：develop 集成 → main 发布

> 2026-11-25 起生效。本文替代 01/02 中“只有 main”的写法，其余规则（commit、review、冲突、冻结）不变。

## 一句话

**每个人从 develop 开自己的分支 → PR 合回 develop → 你（A）确认后，里程碑再把 develop 合进 main。**

## 分支表

| 分支 | 用途 | 谁用 | 从哪来 | 合到哪 |
| --- | --- | --- | --- | --- |
| main | 成品、可部署 | 所有人只读 | develop | 无 |
| develop | 集成分支 | 所有人提 PR | main | main（仅里程碑） |
| feat/* fix/* data/* docs/* | 个人任务 | 各自 | develop | develop |

## 每天怎么做（命令行）

~~~bash
# 1. 先拉 develop
git switch develop
git pull origin develop

# 2. 从 develop 开自己的分支
git switch -c feat/task-form-D

# 3. 改完提交、推送
git add -A
git commit -m "feat(task): 增加委托发布表单"
git push -u origin feat/task-form-D
~~~

4. 在 GitHub 开 PR，**base 一定选 develop**（不是 main）
5. A review 后 Squash merge → 删除分支
6. 回到 develop 再 pull 一次，继续下一个任务

GitHub Desktop 用户：Current Branch 里先切到 develop 并 Fetch/Pull，再 New Branch，其余步骤一样。

## 分支命名（加名字后缀，避免撞名）

- B：data/school-info-B、feat/crawler-B
- C：feat/qa-detail-C、feat/lost-claim-C、feat/bot-C
- D：feat/task-form-D、feat/map-D
- E：docs/content-E
- A：feat/auth-A、chore/deploy-A

## 什么时候合进 main

只有三个时间点，由 A 操作，平时 main 不动：

| 时间 | 动作 | 标签 |
| --- | --- | --- |
| D3 中午 | A 开 PR develop → main，标题 release: D3 P0 基线 | v0.1.0-p0 |
| D5 晚上 | release: D5 冻结版 | v1.0.0-rc1 |
| D6 提交前 | release: v1.0.0 | v1.0.0 |

合并方式：Squash merge，CI 绿才合。

## 保护规则（已生效）

| 分支 | 必须 PR | 批准数 | CI | 禁止 force/删除 |
| --- | --- | --- | --- | --- |
| main | ✅ | 1 | build | ✅ |
| develop | ✅ | 1 | build | ✅ |

A 是管理员，保留应急直推能力（enforce_admins 关闭）；正常情况仍走 PR，别养成直推习惯。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| PR 的 base 选成了 main | 在 PR 页面点 Edit，把 base 改成 develop |
| 我的分支落后了 | git switch 我的分支 && git merge develop |
| 合并冲突 | 找该文件 owner（见 01 第 11 节） |
| 我的 PR 合了，但本地 develop 没变 | 正常，切到 develop 后 git pull |
| 想直接 push develop | 会被拒绝，这正是保护生效；走 PR |
| 有人把 feature 合进了 main | 告诉 A，用 revert PR 回滚，不要 force |

## 和旧文档的差异

- 01 第 3 节“不建 develop”：作废，现在就是 develop 模型。
- 02 第 0 节“开工先拉 main”：改为先拉 develop。
- 其它（commit 规范、review 清单、合并窗口、D5 冻结）全部不变。
