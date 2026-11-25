# 校园互助平台 Git 项目管理流程

> 适用：5 人、6 天、Next.js + Supabase + Vercel、1 位内容同学不写代码。  
> 目标：每天能合并、main 随时可部署、D5 能冻结、D6 能提交。

## 0. 一页看懂

| 项目 | 规定 |
| --- | --- |
| 分支模型 | 主干开发 + 短分支 + PR，不用 Git Flow |
| main | 受保护，始终可部署，禁止直接 push |
| 分支寿命 | 不超过 24 小时，最多不超过 2 天 |
| 合并节奏 | 每天 12:30 和 21:00 两个窗口，小步合并 |
| 评审 | 每个 PR 至少 1 人 review，A 负责最终合并 |
| CI | lint、typecheck、build 必须绿；Vercel 预览必须能打开 |
| 任务 | P0 任务必须有 Issue；看板列：Backlog、Ready、In Progress、Review、Done、Blocked |
| 发布 | D3 打 P0 标签；D5 出 RC 并冻结；D6 打提交标签 |
| 开发日志 | 每天写，D5 汇总，D6 导 PDF 随邮件提交 |
| 禁止 | 直接 push main、force push main、自己合自己的代码 PR、提交密钥和大文件 |

**一句话：main 是成品，分支是草稿，PR 是交作业，合并是收作业。每天收一次，不要攒到最后一天。**

## 1. 为什么这样设计

你们是 6 天、5 人、一个内容同学不写代码的比赛团队。Git Flow 的 develop、release、长期 feature 分支太重，最后一定变成“大分支合并地狱”。这个项目采用轻量主干开发：

- 只有一条长期分支 main，随时可部署。
- 每个任务一条短分支，1 天内合回 main。
- 所有改动走 PR，至少 1 人看，CI 和预览环境把关。
- 每天合，D3 做 P0 基线，D5 冻结，D6 只提交。
- 内容同学不需要碰代码，只走文档/表格/内容分支。

这套流程的重点不是“流程好看”，而是三件事：

1. 任何人拉下 main 都能跑。
2. 任何功能坏了都能定位到一个小 PR。
3. 最后一天不需要做“大合并”。

## 2. 仓库、权限和 D0 配置

### 2.1 推荐仓库结构

~~~text
/
├─ apps/web/                 Next.js 前端和 API
├─ supabase/
│  ├─ migrations/            数据库迁移，只增不改
│  └─ seed/                  演示种子数据
├─ crawler/                  最小爬虫
├─ bot/                      群机器人
├─ data/seed/                CSV/JSON 种子数据
├─ docs/
│  ├─ devlog/                D0-D6 开发日志
│  ├─ content/               文案、分类、FAQ
│  └─ api/                   接口契约
├─ scripts/                  一次性脚本
├─ .github/
│  ├─ workflows/ci.yml
│  ├─ PULL_REQUEST_TEMPLATE.md
│  ├─ ISSUE_TEMPLATE/
│  └─ CODEOWNERS
├─ .env.example
├─ .gitignore
└─ README.md
~~~

如果实际项目是前后端分仓，把 apps/web 换成 frontend 和 backend 即可，规则不变。

### 2.2 权限

| 人 | GitHub 权限 | 说明 |
| --- | --- | --- |
| A（你） | Admin | 仓库设置、分支保护、Secrets、最终合并、Release |
| B | Write | 数据、爬虫、seed，可 review 数据类 PR |
| C | Write | 数据库、答疑、失物、机器人，可 review 后端 PR |
| D | Write | 委托前端、地图，可 review 前端 PR |
| E | Write | 只改 docs/content、data/seed、docs/devlog，不碰代码 |

规则：

- 仓库先设为 Private；如果比赛允许公开，公开仓库更容易用免费分支保护。
- 所有人开 2FA。
- 不拉外部 collaborator。
- A 之外的人不给 Admin。
- A 指定 B 为备份合并人；A 不在时由 B 代合，事后在群里说明。

### 2.3 GitHub 免费版的现实问题

GitHub Free 的私有仓库可能无法使用完整分支保护。你们是学生，优先用学校邮箱申请 GitHub Student Developer Pack，升级 GitHub Pro，私有仓库也能开分支保护。

如果来不及：

- 方案一：仓库公开，换分支保护。
- 方案二：私有仓库 + 团队规则，不依赖强制保护，但 A 必须每天检查 main。
- 不要假设“设置了保护就一定生效”，D0 要用一个测试 PR 验证：直接 push main 是否被拒绝。

### 2.4 D0 必须完成的配置

- [ ] 建仓库，加 README、.gitignore、.env.example。
- [ ] 邀请 B/C/D/E，确认都能 clone。
- [ ] 建 main 分支保护：Require PR、1 approval、CI 通过、对话解决、禁止 force push、禁止删除。
- [ ] 建标签：p0、p1、p2、module:task、module:map、module:qa、module:info、module:lost、module:bot、module:infra、type:feature、type:bug、type:data、type:docs、blocked、needs-review。
- [ ] 建 milestone：P0、P1、Submit。
- [ ] 建 Project 看板，列：Backlog、Ready、In Progress、Review、Done、Blocked。
- [ ] 加 PR 模板、Issue 模板、CODEOWNERS。
- [ ] 加 CI workflow，确认第一个 PR 能跑。
- [ ] 连 Vercel，main 自动 production，PR 自动 preview。
- [ ] 建 Supabase dev 和 prod 两个项目；本地和预览用 dev，main 用 prod。
- [ ] 配 GitHub Secrets 和 Vercel 环境变量。
- [ ] 让每个人做一次“只改文档”的第一次 PR。
- [ ] 用测试 PR 验证：CI 会跑、预览能开、main 不能直接 push。

### 2.5 分支保护怎么点

1. 打开仓库 Settings -> Branches。
2. 点 Add branch protection rule。
3. Branch name pattern 填 main。
4. 勾选 Require a pull request before merging，Required approvals 填 1。
5. 勾选 Require status checks to pass before merging，选 CI 的 build。
6. 勾选 Require conversation resolution before merging。
7. 勾选 Do not allow bypassing the above settings。
8. Allow force pushes 和 Allow deletions 都不要勾。
9. 保存。
10. 用本地 main 试 push 一次，应该被拒绝；被拒绝才说明保护生效。

如果 GitHub Free 私有仓库没有这些选项，按 2.3 处理。

## 3. 分支模型

| 分支 | 用途 | 谁用 | 寿命 | 合到 |
| --- | --- | --- | --- | --- |
| main | 可部署成品 | 所有人只读 | 长期 | 无 |
| feat/模块-简短说明 | 新功能 | B/C/D/A | 1 天内 | main |
| fix/模块-简短说明 | 修 bug | 所有人 | 1 天内 | main |
| data/来源-简短说明 | 爬虫、seed、数据清洗 | B/E | 1 天内 | main |
| docs/主题 | 文档、文案、开发日志 | E/A | 1 天内 | main |
| hotfix/简短说明 | D5 冻结后的阻塞修复 | A | 越短越好 | main |

命名示例：

- feat/task-form
- feat/task-map
- feat/qa-list
- feat/lost-found
- data/school-info-crawler
- docs/content-copy
- docs/devlog-d2
- fix/map-marker-offset
- hotfix/login-redirect

规则：

- 一律从最新 main 开分支，不从别人的 feature 分支开。
- 一个分支只做一个任务，不混重构、格式化、新功能。
- 分支超过 24 小时没合，就拆小或找 A。
- 合并后删除分支。
- 不建 develop，不建长期 release 分支；发布用 tag。
- D5 之后只允许 fix/ 和 hotfix/，A 合并。

## 4. Issue 和看板

### 4.1 什么时候必须开 Issue

- 所有 P0 功能。
- 所有跨模块改动。
- 所有数据库变更。
- 所有需要别人配合的任务。
- 10 分钟以内的小修可以不开，但要在开发日志里写一句。

### 4.2 Issue 必须写清楚

- 目标：要解决什么问题。
- 验收标准：怎么算完成，最好 3 条以内。
- 依赖：等谁的接口、数据、设计。
- 截止：D1/D2/D3。
- Owner：一个人，不要两个人共同负责。
- 演示方式：截图、录屏或操作路径。

### 4.3 看板列

| 列 | 含义 | 规则 |
| --- | --- | --- |
| Backlog | 想到但没排期 | 不着急做 |
| Ready | 可以开工 | 有验收标准、有 owner、依赖清楚 |
| In Progress | 正在做 | 每人最多 2 个 |
| Review | PR 已开，等 review | 作者要主动 ping |
| Done | 已合并并部署 | 必须满足 DoD |
| Blocked | 被卡住 | 写清楚卡在谁、卡什么 |

### 4.4 WIP 限制

- 每人同时最多 2 个 In Progress。
- P0 没做完，不接 P1。
- 被卡超过 30 分钟，移到 Blocked 并 @ 相关负责人。

### 4.5 Definition of Ready

任务可以开工，必须满足：

- 有明确验收标准。
- 有唯一 owner。
- 依赖的接口/数据有 mock 或已就绪。
- 知道改哪些文件，不会大面积碰别人模块。

### 4.6 Definition of Done

任务算完成，必须满足：

- 代码已合入 main。
- 已部署到 preview 或 production。
- 按验收标准自测通过。
- 没有提交密钥、大文件、调试代码。
- 开发日志有记录。
- 关联 Issue 已关闭。

## 5. 日常开发流程

1. 从 Ready 里拿一个任务，把 Issue 移到 In Progress。
2. 拉最新 main。
3. 开短分支，名字按规范。
4. 只改这个任务相关的文件。
5. 本地跑起来自测；改完再跑 build。
6. 小步 commit，写清楚改了什么。
7. 每天至少 push 一次；没做完也 push，开 Draft PR。
8. 在 GitHub 开 PR，填模板，关联 Issue，放截图。
9. 等 CI 绿，找 reviewer。
10. 根据 review 修改，push 到同一分支。
11. A 在合并窗口 squash merge；删除分支。
12. 拉最新 main，确认本地能跑；更新开发日志。

硬规则：

- 不在 main 上改代码。
- 不把没跑过的代码推上来。
- 不把多个不相关改动塞进一个 PR。
- 不在 PR 里顺手重构别人模块。
- 不自己合自己的代码 PR。
- 合并前必须把 main 合进自己的分支，解决冲突。

## 6. Commit 规范

格式：

~~~text
type(scope): 一句话说清楚

可选：为什么改、改了什么、怎么验证
~~~

type：

- feat：新功能
- fix：修 bug
- docs：文档、文案、开发日志
- data：爬虫、seed、数据清洗
- refactor：不改变行为的重构
- test：测试
- chore：依赖、配置、脚本

例子：

- feat(task): 增加委托发布表单
- feat(map): 增加分类筛选
- fix(map): 修复点位偏移
- data(crawler): 增加学校通知来源去重
- docs(devlog): 记录 D2 联调结果
- chore(ci): 增加 build 检查

要求：

- 不用“update”“修改”“111”这种 message。
- 一个 commit 只做一件事；做不到就至少让 message 说清楚。
- PR 用 Squash merge 后，PR 标题就是 main 上的 commit message，所以 PR 标题也要规范。
- 不提交 node_modules、.next、dist、.env、大图、日志文件。

## 7. PR 规范

### 7.1 PR 大小

- 目标：一个 PR 不超过 300 行有效改动。
- 超过 500 行，先拆；拆不了就在 PR 里说明原因。
- 数据库迁移、依赖升级、格式化不要和功能混在一起。

### 7.2 PR 标题

和 commit 一致：

- feat(task): 委托发布和列表
- fix(qa): 修复搜索空结果报错
- data(crawler): 学校信息公开源最小实现
- docs(content): 补充委托分类文案

### 7.3 PR 描述必须写

1. 关联 Issue：Closes #12。
2. 改了什么。
3. 为什么改。
4. 怎么验证：本地、预览、移动端。
5. 截图或录屏。
6. 影响范围：接口、数据库、其他页面。
7. 风险点。

### 7.4 Review 规则

- 每个 PR 至少 1 人 review；A 负责最终合并。
- 模块 PR 优先找模块 owner review：
  - 委托/地图：D。
  - 数据/爬虫/学校信息：B。
  - 数据库/答疑/失物/机器人：C。
  - 架构/接口/部署：A。
  - 内容/文案：E 提需求，D/A 技术 review。
- Review 在 2 小时内响应；超过 2 小时在群里 ping。
- 评论分三级：
  - Blocking：必须改，不改不能合。
  - Should fix：应该改，可以另开 Issue。
  - Nit：建议，不改也行。
- 作者负责解决评论；解决后回复“已改”，不要静默修改。

### 7.5 Review 检查清单

- [ ] 是否满足 Issue 的验收标准。
- [ ] 是否改了不该改的文件。
- [ ] 是否提交了密钥、.env、大文件。
- [ ] 是否有 console.log、调试代码、死代码。
- [ ] 是否影响接口字段或数据库结构。
- [ ] 空状态、错误状态、移动端是否可用。
- [ ] 预览环境是否能打开。
- [ ] 是否更新开发日志。

### 7.6 合并方式

- 统一用 Squash and merge，保持 main 线性、干净。
- 合并后删除远程分支。
- 合并人：A；A 不在时 B 代合。
- 不允许自己合自己的代码 PR；文档 PR 也至少让 A 或 D 看一眼。
- 合并前确认：CI 绿、预览能开、冲突已解决、Issue 已关联。

### 7.7 A 的合并动作

1. 看 PR 标题是否规范，描述是否填完整。
2. 看 Files changed，确认没有 .env、密钥、大图、无关文件。
3. 看 CI 是否绿；红了不打勾。
4. 点 Vercel 预览，走一遍主流程。
5. 看截图/录屏，确认 UI 没坏。
6. 看是否关联 Issue，是否更新开发日志。
7. 点 Squash and merge，确认 commit message 干净。
8. 点 Delete branch。
9. 等 production 部署完成，打开首页点一遍。
10. 把 Issue 移到 Done，在群里说一句“已上线”。

## 8. CI/CD 与环境

### 8.1 三个环境

| 环境 | 用途 | 数据库 | 部署 |
| --- | --- | --- | --- |
| local | 个人开发 | Supabase dev | 本地 |
| preview | PR 预览 | Supabase dev | Vercel Preview |
| production | 提交和演示 | Supabase prod | Vercel Production |

规则：

- 本地和 preview 不写 production 数据库。
- production 只由 main 部署。
- 预览环境可以脏，但不能把脏数据带到 prod。
- D5 前把 prod 数据重置为演示 seed，保证演示稳定。

### 8.2 必过检查

PR 必须通过：

- lint
- typecheck
- build
- Vercel Preview 可打开

如果项目有测试，再加 test；没有测试不强行补，但 P0 主流程必须手工验收。

### 8.3 CI 失败怎么办

1. 点 Details 看第一条报错，不要从最后一行猜。
2. 本地复现：npm ci、npm run lint、npm run typecheck、npm run build。
3. 修完 push 到同一分支，CI 自动重跑。
4. 如果是环境变量缺失，找 A 配 Secrets，不要把密钥写进代码。
5. 如果 CI 本身坏了，A 先修 CI，不要绕过检查合并。

### 8.4 main 挂了怎么办

main 挂了就是“停线”：

1. 立刻在群里说：main 挂了，暂停合并。
2. A 找到最后一个绿的部署或最后一个可疑 PR。
3. 能 revert 就 revert，先恢复可用。
4. 修复用 fix/ 分支，走 PR。
5. 恢复后补一条开发日志：原因、影响、修复、怎么防。
6. 不在 main 上直接改。

### 8.5 回滚

- 前端/部署：Vercel 直接 Rollback 到上一个 Deployment。
- 代码：GitHub 上 Revert 对应 PR，生成新 PR，走流程。
- 数据库：迁移只向前，不删已应用的迁移；写补偿迁移。
- 不在 main 上 git reset --hard。

## 9. 数据库和数据变更

- 数据库 schema 由 C 负责，A review。
- 迁移文件放 supabase/migrations，命名带时间戳。
- 已合并的迁移不能改，只能新增迁移。
- 迁移 PR 必须写：改了什么表、是否破坏性、怎么回滚、对 seed 的影响。
- 本地先跑通，再合 main；合 main 后由 C 在 prod 执行，A 确认。
- seed 数据放 data/seed 或 supabase/seed，不写死在前端。
- 爬虫只写公开信息，保留 source_url，按 URL 去重。
- 大文件、图片不进 Git；图片进 Supabase Storage。
- 不把 service_role key 放前端；RLS 必须开。
- D5 前备份一次 prod 数据库；D6 不再做破坏性迁移。

## 10. 发布与冻结

### 10.1 三个标签

| 时间 | 标签 | 含义 |
| --- | --- | --- |
| D3 中午 | v0.1.0-p0 | P0 基线，可演示 |
| D5 晚上 | v1.0.0-rc1 | 候选提交版，冻结 |
| D6 提交前 | v1.0.0 | 最终提交版 |

### 10.2 D5 冻结规则

D5 之后：

- 不加新功能。
- 不做重构。
- 不升级依赖。
- 不做破坏性数据库变更。
- 只修 P0 阻塞 bug、安全问题、部署问题。
- 所有修复走 fix/ 或 hotfix/，A 合并。
- 每修一个，必须回归 P0 主流程。

### 10.3 发布检查清单

- [ ] main 最新，CI 绿。
- [ ] production 部署成功。
- [ ] P0 主流程走通。
- [ ] 演示账号能登录。
- [ ] seed 数据完整。
- [ ] 机器人测试群能收到消息。
- [ ] 爬虫能跑一次。
- [ ] README 和 .env.example 是最新的。
- [ ] 开发日志汇总完成。
- [ ] 源码 zip 和 Release 备份完成。

### 10.4 提交包

- 公网链接。
- 源码仓库链接。
- README。
- 演示账号。
- 开发日志 PDF。
- 数据来源和合规说明。
- 可选演示视频。
- 源码 zip 备份。

## 11. 冲突与文件所有权

| 文件/目录 | Owner | 规则 |
| --- | --- | --- |
| apps/web/app/tasks、map | D | 委托和地图页面由 D 改 |
| apps/web/app/qa、lost-found | C | 答疑和失物页面由 C 改 |
| apps/web/components | D | 共用组件由 D 统一改 |
| supabase/migrations | C | 只增不改，A review |
| crawler/ | B | 爬虫输出格式由 B 定 |
| data/seed/ | B/E | E 提内容，B 导入 |
| docs/content/ | E | E 主写，D/A 导入 |
| docs/devlog/ | E | E 汇总，A 检查 |
| package.json、lockfile | A | 依赖变更先问 A |
| .env.example | A | 新增变量必须同步 |
| README | A/E | A 定结构，E 补内容 |

冲突处理：

1. 先看冲突文件是谁的模块，找 owner。
2. 把 main 合进自己的分支，不要反过来。
3. 在 VS Code 里逐个文件解决，保留正确逻辑，不是简单“全要”。
4. 删掉冲突标记，跑 build，自测。
5. git add、commit、push。
6. 超过 15 分钟搞不定，找 owner 一起看。
7. 不准为了消除冲突删除别人的代码。
8. 不准对 main force push。

## 12. 安全与合规

- 不提交 .env、密钥、Token、数据库密码。
- service_role key 只在服务端；前端只用 anon key。
- 机器人 webhook、地图 Key 只放环境变量。
- 开 RLS，公开表也要限制写权限。
- 上传图片限制类型和大小，压缩后再传。
- 只抓公开信息，保留 source_url，不抓个人信息。
- 页面加数据来源和免责声明。
- 如果密钥泄露：先轮换密钥，再清历史，再通知全员；不要只删文件。
- 不在 Issue、PR、群聊里贴密钥。
- 依赖能不升就不升；必须升由 A 决定。

## 13. 质量和监控

- 每天检查一次 main 是否可部署。
- 每天检查一次 production 首页、委托、地图、答疑、失物、管理页。
- P0 bug 优先级最高；P1 可以记录不修。
- 不追求测试覆盖率，追求 P0 主流程稳定。
- 每个 PR 至少一张截图；UI 改动必须有前后对比。
- 开发日志记录失败和回滚，不要只写成功。

## 14. 六天节奏

| 时间 | Git 动作 | 产出 |
| --- | --- | --- |
| D0 11/24 | 建仓库、保护 main、标签、看板、CI、Vercel、Supabase | 第 1 个测试 PR 合并 |
| D1 11/25 | 每个人完成第一次真实 PR；CI 绿 | 骨架和 mock 数据 |
| D2 11/26 | 每天两次合并；第一条端到端 | 委托、答疑、失物可走通 |
| D3 11/27 中午 | P0 验收；打 v0.1.0-p0 | P0 基线 |
| D3 下午-D4 11/28 | 细节 PR；每天合；不合大分支 | 地图筛选、机器人、归档 |
| D5 11/29 | 冻结；打 v1.0.0-rc1；回归 | RC 和提交包 v1 |
| D6 11/30 | 只修阻塞；打 v1.0.0；提交 | 最终提交 |

每天固定动作：

- 12:30 合并窗口。
- 21:00 合并窗口。
- 21:30 前开发日志。
- 睡前 push，不把工作留在本地。

## 15. 角色与 Git 职责

| 事项 | A | B | C | D | E |
| --- | --- | --- | --- | --- | --- |
| 仓库和权限 | R | C | C | C | I |
| 分支保护、Secrets | R | I | I | I | I |
| 架构和接口契约 | R | C | C | C | I |
| 数据/爬虫 PR | 审批 | R | C | I | C |
| 数据库/答疑/失物/机器人 PR | 审批 | C | R | I | C |
| 委托/地图 PR | 审批 | I | I | R | C |
| 内容/文档 PR | 审批 | C | C | C | R |
| 最终合并 | R | 备份 | I | I | I |
| 发布和提交 | R | C | C | C | C |
| 开发日志 | 审批 | C | C | C | R |

R 负责，审批 最终拍板，C 协作，I 知会。

## 16. 故障处理

| 情况 | 处理 |
| --- | --- |
| 推到 main 被拒绝 | 正常，说明保护生效；开分支走 PR |
| push 被拒绝 non-fast-forward | 先 pull main 合并进分支，解决冲突再 push；不要 force |
| CI 红了 | 看第一条报错，本地复现，修完再 push |
| 预览打不开 | 看 Vercel 日志；检查环境变量和 build |
| 合并冲突 | 找文件 owner，按第 11 节处理 |
| 误提交密钥 | 立刻告诉 A，先轮换，再清历史 |
| 误提交大文件 | 不要继续 push；找 A 从历史移除 |
| main 挂了 | 停线，revert，修复，补日志 |
| GitHub 挂了 | 本地继续写，分支留好，恢复后 push |
| Vercel 挂了 | 用本地 build 截图留证；A 决定是否换部署 |
| A 不在 | B 代合；重大变更等 A 回来 |
| 不知道怎么操作 | 停止，截图，按求助模板问；不要瞎 reset |

## 17. D0 配置清单（A 照着做）

- [ ] 建私有仓库，初始化 README。
- [ ] 加 .gitignore：node_modules、.next、.env、dist、大图、日志。
- [ ] 加 .env.example，写清楚每个变量。
- [ ] 邀请 B/C/D/E。
- [ ] 开 2FA。
- [ ] 建 main 保护规则。
- [ ] 建 labels。
- [ ] 建 milestones：P0、P1、Submit。
- [ ] 建 Project 看板。
- [ ] 加 PR 模板、Issue 模板、CODEOWNERS。
- [ ] 加 CI workflow。
- [ ] 连 Vercel，确认 preview 和 production。
- [ ] 建 Supabase dev/prod，配环境变量。
- [ ] 用测试 PR 验证保护、CI、预览。
- [ ] 让每个人做一次 docs 第一次 PR。
- [ ] 把本流程和新人指南发群里，置顶。

## 18. 模板和附录

本目录的 templates 下提供可直接复制的文件：

- PULL_REQUEST_TEMPLATE.md
- ISSUE_TEMPLATE/task.md
- ISSUE_TEMPLATE/bug.md
- CODEOWNERS
- ci.yml
- gitignore.txt

复制到仓库的 .github/ 对应位置即可。CODEOWNERS 里的用户名要换成真实 GitHub 用户名。

发布说明模板：

~~~markdown
# v1.0.0 校园互助平台

## 新增
-

## 修复
-

## 已知问题
-

## 演示账号
-

## 数据来源
-
~~~
