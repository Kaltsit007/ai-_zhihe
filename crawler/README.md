# 最小爬虫

目标：抓 1 个公开校园信息源，输出固定 JSON，写入 school_info。

## P0 范围

- 只抓公开页面，不登录、不绕验证码、不绕反爬。
- 按 source_url 去重。
- 限速，默认 1 请求/秒。
- 失败不影响主站，seed 数据兜底。
- 输出字段：title、summary、category、source_url、published_at。

## 运行

~~~powershell
python crawler/main.py --source notices --limit 50
~~~

## 约定

- 不把抓取结果直接写死在前端。
- 不提交大量原始 HTML。
- 记录来源和抓取时间。
- 只保留公开信息，不抓个人信息。
