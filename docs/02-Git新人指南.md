# Git 新手参与指南（傻瓜版）

> 给第一次用 Git 的队友。照着做，不要跳步。  
> 推荐工具：GitHub Desktop + VS Code。不会命令行也完全能参与。

## 0. 先记住 8 句话

1. **main 是成品，不能直接改。**
2. **每次开工前先拉 main。**
3. **一个任务一条分支。**
4. **小步提交，每天推送。**
5. **写完开 PR，不自己合。**
6. **冲突找文件 owner，不硬覆盖。**
7. **不提交密码、密钥、大图。**
8. **卡住 15 分钟就求助，不要瞎 reset。**

## 1. Git 到底是什么（30 秒）

GitHub 是网站，Git 是版本管理工具。你可以把它理解成：

- **远程仓库**：云端的项目文件夹。
- **本地仓库**：你电脑上的同一份项目。
- **main**：正式作业，随时能交。
- **分支**：你的草稿纸，随便改，不影响别人。
- **commit**：给当前改动拍一张快照。
- **push**：把本地快照传到云端。
- **pull**：把云端别人的改动拉回本地。
- **PR**：请别人看你的改动，准备合进正式作业。
- **merge**：把草稿收进正式作业。

你不需要背命令。用 GitHub Desktop 点按钮就行。

## 2. 第一次配置（只做一次）

### 2.1 装三个东西

1. Git for Windows：https://git-scm.com/download/win
2. GitHub Desktop：https://desktop.github.com/
3. VS Code：https://code.visualstudio.com/

安装时一路默认即可。Git 安装选项看不懂就点 Next。

### 2.2 接受邀请

1. 找 A 要 GitHub 仓库邀请。
2. 打开邮箱，点 Accept invitation。
3. 没有 GitHub 账号就先注册，开 2FA。
4. 确认你能打开仓库页面。

### 2.3 登录 GitHub Desktop

1. 打开 GitHub Desktop。
2. File -> Options -> Accounts -> Sign in。
3. 浏览器登录 GitHub，授权。
4. 回到 GitHub Desktop，确认头像出现。

### 2.4 设置名字和邮箱

GitHub Desktop：File -> Options -> Git。

- Name：你的名字或昵称。
- Email：和 GitHub 账号一致的邮箱。

命令行用户也可以执行：

~~~bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
git config --global init.defaultBranch main
git config --global pull.rebase false
~~~

### 2.5 克隆项目

1. GitHub Desktop -> File -> Clone repository。
2. 选 GitHub.com，找到团队仓库。
3. Local path 选一个**英文路径**，例如 D:/projects/mutual-help。
4. 点 Clone。

不要放在中文路径或桌面深层目录里，避免依赖和脚本出问题。

### 2.6 第一次跑起来

1. GitHub Desktop 点 Open in Visual Studio Code。
2. VS Code 打开终端：Terminal -> New Terminal。
3. 安装依赖：

~~~bash
npm install
~~~

4. 复制环境变量文件：

~~~bash
copy .env.example .env.local
~~~

5. 找 A 要开发环境变量，填进 .env.local。不要把 .env.local 发给别人或提交。
6. 启动：

~~~bash
npm run dev
~~~

7. 浏览器打开终端里显示的地址，通常是 http://localhost:3000。

如果跑不起来，把完整报错截图发给 A，不要只说“跑不起来”。

## 3. 第一次练习 PR（不改代码）

先做一次纯文档 PR，确认整条链路通了。

1. 在 GitHub Desktop 确认当前分支是 main。
2. 点 Fetch origin，再点 Pull origin。
3. 点 Current Branch -> New Branch。
4. 分支名：docs/intro-你的名字。
5. 在 VS Code 里新建 docs/team/你的名字.md。
6. 写三行：

~~~markdown
# 你的名字

- 角色：
- 负责：
~~~

7. 回到 GitHub Desktop，左边 Changes 会显示这个文件。
8. 在左下角 Summary 写：docs(team): add 你的名字 intro。
9. 点 Commit to docs/intro-你的名字。
10. 点 Push origin。
11. 点 Create Pull Request，浏览器会打开 GitHub。
12. 填标题和描述，点 Create pull request。
13. 找 A 或 D review。
14. A 合并后，回 GitHub Desktop：
    - 切回 main。
    - Fetch origin。
    - Pull origin。
    - 删除本地分支（Branch -> Delete）。

做完这次，你就已经会 Git 了 80%。

## 4. 每天的标准流程（GitHub Desktop）

### 4.1 开工前

1. 打开 GitHub Desktop。
2. 确认当前分支是 main。
3. 点 Fetch origin。
4. 点 Pull origin。
5. 看 Projects 看板，拿一个 Ready 的任务。
6. 在 Issue 里说一句“我来做”，把 Issue 移到 In Progress。

### 4.2 开分支

1. 点 Current Branch -> New Branch。
2. 命名：
   - 功能：feat/task-form
   - 修 bug：fix/map-offset
   - 数据：data/school-info
   - 文档：docs/content-copy
3. 点 Create Branch。

### 4.3 改文件

1. 点 Open in Visual Studio Code。
2. 只改你这个任务相关的文件。
3. 不要顺手改别人模块。
4. 不要改 .env、package.json、数据库迁移，除非 Issue 明确要求。
5. 改完在本地跑一遍：

~~~bash
npm run dev
~~~

6. 至少点一遍你改的页面，确认没白屏、没报错。

### 4.4 提交

1. 回 GitHub Desktop。
2. 左边 Changes 会列出改动文件。
3. **逐个点开看 diff**，确认没有多改、没有密钥、没有大文件。
4. 不相关的文件，右键 -> Discard changes（谨慎，确认是你不要的）。
5. 左下角 Summary 写 commit message，例如：

~~~text
feat(task): 增加委托发布表单
~~~

6. Description 可以写一句“为什么改/怎么验证”。
7. 点 Commit to 你的分支。

### 4.5 推送

1. 点 Push origin。
2. 如果是第一次推这个分支，按钮可能显示 Publish branch。
3. 推送成功后，GitHub Desktop 会显示 Create Pull Request。

### 4.6 开 PR

1. 点 Create Pull Request。
2. 浏览器打开 GitHub 对比页。
3. 标题用 commit 格式，例如 feat(task): 委托发布和列表。
4. 描述按模板填：
   - 关联 Issue：Closes #12
   - 改了什么
   - 怎么验证
   - 截图
   - 风险
5. 右侧 Reviewers 选 A 和模块 owner。
6. 没做完就选 Draft pull request。
7. 点 Create pull request。

### 4.7 等 review

1. 看 CI 是否绿；红了点 Details 看报错。
2. 看 Vercel Preview 是否能打开。
3. 在群里发 PR 链接，说“求 review”。
4. 有评论就改，改完 push 到同一分支，PR 会自动更新。
5. 不要自己点 Merge。

### 4.8 合并后

1. A 点 Squash and merge。
2. A 点 Delete branch。
3. 你回 GitHub Desktop：
   - 切 main。
   - Fetch origin。
   - Pull origin。
   - 删除本地分支。
4. 确认本地能跑。
5. 更新开发日志。
6. 把 Issue 移到 Done。

## 5. 命令行版（会用终端的人）

### 5.1 每天开工

~~~bash
git switch main
git pull origin main
git switch -c feat/task-form
~~~

### 5.2 写代码后

~~~bash
git status
git diff
git add .
git commit -m "feat(task): 增加委托发布表单"
git push -u origin feat/task-form
~~~

### 5.3 分支落后于 main

~~~bash
git switch main
git pull origin main
git switch feat/task-form
git merge main
~~~

有冲突就按第 8 节处理，然后：

~~~bash
git add .
git commit
git push
~~~

### 5.4 看状态

~~~bash
git status
git log --oneline --graph -10
git branch
~~~

### 5.5 撤销

- 没提交的改动想丢掉：git restore 文件名（谨慎）。
- 刚 commit 但没 push，想改 message：git commit --amend。
- 已经 push 的 commit，不要 reset；用 git revert。
- 不确定就停手，找 A。

### 5.6 绝对不要

~~~bash
git push --force origin main
git reset --hard
~~~

除非 A 明确让你这么做。

## 6. Commit 怎么写

格式：

~~~text
type(scope): 一句话
~~~

常用 type：

- feat：新功能
- fix：修 bug
- docs：文档
- data：数据/爬虫
- refactor：重构
- chore：配置/依赖

好例子：

- feat(map): 增加分类筛选
- fix(qa): 修复空搜索结果报错
- docs(devlog): 记录 D2 联调
- data(crawler): 增加来源去重

坏例子：

- update
- 修改
- 111
- 最终版
- 真的最终版

要求：

- 一个 commit 只做一件事。
- 提交前看 diff。
- 不把 node_modules、.next、.env 提交上去。
- 不把格式化整个文件和功能混在一个 commit。

## 7. 怎么保持分支最新

PR 合并前，必须把最新 main 合进你的分支。

GitHub Desktop：

1. 切到你的分支。
2. Fetch origin。
3. Branch -> Update from main。
4. 如果没有这个选项，就切 main -> Pull origin -> 切回你的分支 -> Branch -> Merge into current branch -> 选 main。
5. 有冲突按第 8 节处理。
6. 解决后 push。

命令行：

~~~bash
git switch main
git pull origin main
git switch feat/task-form
git merge main
~~~

不要用 rebase 除非你会；新手统一用 merge。

## 8. 冲突怎么解决

冲突不可怕，它只是 Git 不知道你要哪一行。

冲突文件里会出现：

~~~text
<<<<<<< HEAD
你分支里的内容
=======
main 里的内容
>>>>>>> main
~~~

处理步骤：

1. 不要慌，不要删整个文件。
2. 在 VS Code 打开冲突文件。
3. 看清两边逻辑：
   - Accept Current Change：保留你的。
   - Accept Incoming Change：保留 main 的。
   - Accept Both：两个都留。
4. 大多数情况不能无脑选，要手工改成最终正确版本。
5. 删除 <<<<<<<、=======、>>>>>>> 这些标记。
6. 保存，跑 npm run dev 和 npm run build。
7. 回 GitHub Desktop，确认文件已修改。
8. Commit merge，Push。
9. 如果 15 分钟搞不定，找文件 owner 一起看。

规则：

- 不改别人模块的冲突，找 owner。
- 不为了消冲突删别人代码。
- 不直接关闭 PR 重开。
- 不对 main force push。

## 9. 常见错误急救

| 现象 | 原因 | 怎么办 |
| --- | --- | --- |
| Push rejected / non-fast-forward | 远程有你没有的提交 | 先 pull main 合进分支，解决冲突再 push；不要 force |
| You have divergent branches | 本地和远程分叉 | git pull --no-rebase，或 GitHub Desktop Pull |
| Detached HEAD | 切到了某个 commit | git switch main，再重新开分支 |
| 合并冲突 | 两人改了同一处 | 按第 8 节处理 |
| 我提交到 main 了 | 忘了开分支 | 没 push 就赶紧开分支；已 push 就告诉 A，不要自己 reset |
| 我提交了密钥 | 危险 | 立刻告诉 A，先轮换密钥，再清历史 |
| 我提交了大图 | 仓库变大 | 告诉 A，从历史移除；图片改放 Storage |
| 我丢代码了 | 可能切错分支/丢弃 | 不要操作，找 A 用 reflog 找回 |
| CI 红了 | 代码/环境问题 | 点 Details 看第一条报错，本地复现 |
| 预览打不开 | build 或环境变量 | 看 Vercel 日志，找 A |
| Permission denied | 没权限/没登录 | 确认接受邀请，重新登录 GitHub Desktop |
| 找不到仓库 | 没接受邀请 | 检查邮箱和 GitHub 通知 |

求助模板：

~~~text
我想做什么：
我点了什么/运行了什么：
完整报错或截图：
当前分支：
我已经试过：
~~~

## 10. 内容同学专用路线

你不需要写代码，也不需要会命令行。你只维护内容。

### 10.1 你可以改的目录

- docs/content/：文案、分类、FAQ、页面说明。
- data/seed/：CSV/JSON 种子数据。
- docs/devlog/：开发日志。
- public/images/：只有在 D 或 A 明确让你放图时才放。

### 10.2 你绝对不要改的目录

- apps/web/ 或 frontend/ 下的代码。
- supabase/。
- crawler/。
- bot/。
- .env、package.json、lockfile。
- 任何你没看懂的配置文件。

### 10.3 路线 A：完全不装软件（最简单）

只改文字时用 GitHub 网页：

1. 打开仓库页面。
2. 进入 docs/content/。
3. 点 Add file -> Create new file，或打开已有文件点铅笔。
4. 写内容。
5. 页面底部选 Create a new branch for this commit。
6. 分支名：docs/content-你的名字-日期。
7. 点 Propose changes。
8. 点 Create pull request。
9. 找 D 或 A review。
10. 合并后，你的内容就进 main 了。

适合：改文案、加 FAQ、改分类说明。

### 10.4 路线 B：GitHub Desktop（适合批量改 CSV/图片）

1. 按第 2 节克隆项目。
2. 每次先 Pull main。
3. 新建分支 docs/content-你的名字-日期。
4. 在 VS Code 里只改 docs/content/ 或 data/seed/。
5. Commit：docs(content): 补充委托分类文案。
6. Push。
7. 开 PR，找 D/A review。
8. 合并后 Pull main。

### 10.5 内容格式要求

- 文件用 UTF-8。
- CSV 一行一条记录，不要合并单元格。
- 图片用小写英文名，不要空格，例如 task-moving-01.jpg。
- 图片先压缩，单张建议小于 1 MB。
- 文案按页面分节：首页、委托、答疑、失物、关于。
- 不要把联系方式、身份证号等敏感信息写进公开 seed。

### 10.6 如果你不想碰 Git

也可以把内容写在共享文档/表格里，发给 D 或 A，由他们导入。Git 不是内容同学的硬门槛，但你要知道内容最终会进 docs/content 或 data/seed。

## 11. 绝对不要做的 10 件事

1. 不要直接改 main。
2. 不要 force push main。
3. 不要自己合自己的代码 PR。
4. 不要把 .env、密钥、Token 提交上去。
5. 不要把 node_modules、.next、dist 提交上去。
6. 不要上传几百 MB 的图片/视频。
7. 不要为了消冲突删别人的代码。
8. 不要用 git reset --hard 解决你不懂的问题。
9. 不要在一个 PR 里混五个不相关的功能。
10. 不要卡住一小时还不问。

## 12. 一页速查卡

| 我想做 | GitHub Desktop | 命令行 |
| --- | --- | --- |
| 看当前分支 | 顶部 Current Branch | git branch |
| 拉最新 main | 切 main -> Fetch -> Pull | git switch main && git pull |
| 开新分支 | Current Branch -> New Branch | git switch -c feat/xxx |
| 看改了什么 | Changes 里点文件 | git diff |
| 提交 | Summary + Commit | git add . && git commit -m |
| 推送 | Push origin | git push -u origin 分支 |
| 开 PR | Create Pull Request | 浏览器开 |
| 更新分支 | Branch -> Update from main | git merge main |
| 看历史 | History | git log --oneline |
| 丢弃未提交改动 | 右键 Discard | git restore 文件 |

每日检查：

- [ ] 我在自己的分支，不在 main。
- [ ] 我 pull 过 main。
- [ ] 我只改了该改的文件。
- [ ] 我没提交密钥和大文件。
- [ ] 本地能跑。
- [ ] 我 push 了。
- [ ] 我开了 PR。
- [ ] 我写了开发日志。

## 13. 第一次参与任务清单

### D0

- [ ] 装 Git、GitHub Desktop、VS Code。
- [ ] 接受仓库邀请。
- [ ] 克隆项目。
- [ ] npm install，复制 .env.example，跑起来。
- [ ] 完成第一次 docs PR。

### D1

- [ ] 从看板拿一个 P0 任务。
- [ ] 开分支，改代码/内容。
- [ ] 开 PR，找 review。
- [ ] 合并后拉 main。
- [ ] 写开发日志。

### 每天

- [ ] 早上 Pull main。
- [ ] 开分支。
- [ ] 小步 commit。
- [ ] 晚上 push，开 Draft PR 也可以。
- [ ] 更新看板和开发日志。

## 14. 给 A 的提醒

- 不要所有 review 都自己扛；让模块 owner 先看。
- 不要所有合并都等到晚上；两个窗口，小步合。
- 不要让别人在 main 上改；第一次发现就纠正。
- 不要用“最后一天大合并”兜底；D5 必须冻结。
- 新人不熟 Git，就让他先做 docs PR，不要一上来改核心代码。
- 内容同学不写代码不是问题；把他的内容路径和验收标准定清楚。
