<div align="center">

# 🔗 linked-agent

### 在终端里发现、搜索和查看 Agent 档案

**一个面向开发者、AI 产品团队和 Agent 设计者的轻量级 CLI 工具。**  
无需手动翻 GitHub 仓库，直接在命令行中浏览 Agent、按关键词检索、查看完整 Markdown Profile，并将结果以 JSON 形式接入你的自动化流程。

<p>
  <a href="#快速开始"><img alt="Quick Start" src="https://img.shields.io/badge/快速开始-1分钟上手-0A66C2?style=for-the-badge"></a>
  <a href="#核心能力"><img alt="Features" src="https://img.shields.io/badge/Agent%20Discovery-CLI%20First-6C5CE7?style=for-the-badge"></a>
  <a href="#开发者"><img alt="Node" src="https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=for-the-badge&logo=node.js&logoColor=white"></a>
  <a href="./LICENSE"><img alt="License" src="https://img.shields.io/badge/License-MIT-black?style=for-the-badge"></a>
</p>

<p>
  <a href="#为什么需要-linked-agent">为什么需要它</a> ·
  <a href="#核心能力">核心能力</a> ·
  <a href="#快速开始">快速开始</a> ·
  <a href="#命令速查">命令速查</a> ·
  <a href="#缓存与数据源">缓存与数据源</a> ·
  <a href="#开发者">开发者</a>
</p>

</div>

---

## 为什么需要 linked-agent？

Agent 资料通常散落在 Markdown、YAML Frontmatter 或远程仓库里：

- 想找某个 Agent，要在目录和文件之间来回跳转；
- 想看 Agent 的职责、能力、服务和规则，需要手动打开 Markdown；
- 想把 Agent 列表接入脚本，需要自己解析文件；
- 想降低 GitHub API 请求成本，还要额外处理缓存和网络问题。

**linked-agent 把这些动作收敛成一个终端命令。**  
你可以像使用 `git`、`npm` 或 `rg` 一样，在命令行快速发现、筛选和消费 Agent 数据。

---

## 核心能力

<table>
  <tr>
    <td width="50%">
      <h3>🔎 终端优先的 Agent 浏览</h3>
      <p>一条命令列出所有 Agent，并支持分页、排序和按 division 过滤，适合快速盘点 Agent 仓库。</p>
      <pre><code>linked-agent list --division engineering</code></pre>
    </td>
    <td width="50%">
      <h3>🧠 按意图搜索</h3>
      <p>按名称、描述或 vibe 检索 Agent，快速找到“代码审查”“品牌系统”“销售支持”等相关角色。</p>
      <pre><code>linked-agent search reviewer</code></pre>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📄 查看完整 Agent Profile</h3>
      <p>直接在终端查看 Agent 的 frontmatter、服务信息和 Markdown sections，还能按 section 标题过滤。</p>
      <pre><code>linked-agent show engineering-code-reviewer --section mission</code></pre>
    </td>
    <td width="50%">
      <h3>⚡ 本地缓存 + JSON 输出</h3>
      <p>内置 24 小时缓存，减少重复请求；同时支持 JSON 输出，方便接入脚本、CI、数据管道和内部工具。</p>
      <pre><code>linked-agent list --json --limit 10</code></pre>
    </td>
  </tr>
</table>

---

## 适合谁使用？

| 角色 | 可以怎么用 |
| --- | --- |
| AI 产品经理 | 快速查看有哪些 Agent、它们分别解决什么问题。 |
| Agent / Prompt 设计者 | 检索类似 Agent，参考已有 profile、mission、rules 和 services。 |
| 前端 / 后端开发者 | 将 Agent 列表以 JSON 接入内部平台、脚本或自动化流程。 |
| 团队知识库维护者 | 用缓存和命令行查询能力管理远程 Markdown Agent 仓库。 |

---

## 快速开始

### 1. 安装

```bash
npm install -g linked-agent
```

本地开发或暂未发布到 npm 时，可以在仓库内链接使用：

```bash
npm install
npm run build
npm link
```

### 2. 查看帮助

```bash
linked-agent --help
```

### 3. 浏览 Agent

```bash
linked-agent list
```

示例输出结构：

```text
🔍 Found 24 agents

#     Emoji   Name                              Division          Description
────  ──────  ────────────────────────────────  ────────────────  ──────────────────────────────────────────────────
1     🧪      Code Reviewer                     engineering       Reviews pull requests and catches quality risks
2     🎨      Brand Guardian                    design            Protects brand systems and visual consistency
```

### 4. 搜索 Agent

```bash
linked-agent search reviewer
```

### 5. 查看详情

```bash
linked-agent show engineering-code-reviewer
```

### 6. 输出 JSON 给脚本使用

```bash
linked-agent list --json --limit 5
```

---

## 命令速查

### `linked-agent list`

列出 Agent，支持表格和 JSON 两种输出。

```bash
linked-agent list
linked-agent list --division engineering
linked-agent list --search reviewer
linked-agent list --sort division --limit 10 --offset 10
linked-agent list --json
linked-agent list --no-cache
```

| 参数 | 说明 |
| --- | --- |
| `--no-cache` | 跳过本地缓存，强制从 GitHub 重新拉取。 |
| `-d, --division <name>` | 按 division 名称过滤。 |
| `-s, --search <query>` | 按名称、描述或 vibe 搜索。 |
| `--sort <field>` | 按 `name` 或 `division` 排序，默认 `name`。 |
| `--limit <n>` | 每页最多显示多少条，默认 `20`。 |
| `--offset <n>` | 分页起始位置，默认 `0`。 |
| `--json` | 输出机器可读 JSON。 |

### `linked-agent show <agent-slug>`

查看单个 Agent 的完整详情。

```bash
linked-agent show engineering-code-reviewer
linked-agent show reviewer
linked-agent show engineering-code-reviewer --section mission
linked-agent show engineering-code-reviewer --json
linked-agent show engineering-code-reviewer --no-cache
```

| 参数 | 说明 |
| --- | --- |
| `--no-cache` | 跳过本地缓存，强制从 GitHub 重新拉取。 |
| `--json` | 输出机器可读 JSON。 |
| `--section <title>` | 只显示标题包含指定文本的 sections。 |

> 如果没有精确匹配 slug，`show` 会尝试大小写不敏感的部分匹配；多个候选时，普通终端模式会让你交互选择，JSON 模式会直接输出候选列表。

### `linked-agent search <query>`

按关键词搜索 Agent。

```bash
linked-agent search review
linked-agent search "brand systems"
linked-agent search visual --no-cache
```

| 参数 | 说明 |
| --- | --- |
| `--no-cache` | 跳过本地缓存，强制从 GitHub 重新拉取。 |

### `linked-agent cache`

管理本地缓存。

```bash
linked-agent cache status
linked-agent cache status --json
linked-agent cache clear
linked-agent cache --cache-dir ~/.cache/linked-agent status
```

| 参数 | 说明 |
| --- | --- |
| `--cache-dir <path>` | 为缓存子命令指定自定义缓存目录。 |
| `--json` | `cache status` 支持 JSON 输出。 |

---

## 缓存与数据源

linked-agent 会从 [`msitarzewski/agency-agents`](https://github.com/msitarzewski/agency-agents) 拉取 Agent Markdown 文件，并解析：

- YAML Frontmatter：`name`、`description`、`emoji`、`color`、`vibe`、`services` 等；
- Markdown Sections：`##` 和 `###` 标题下的正文内容；
- 文件路径：用于生成 `slug` 和 `division`。

默认缓存策略：

| 项目 | 默认值 |
| --- | --- |
| 缓存目录 | `~/.linked-agent/cache/` |
| 缓存文件 | `agents.json`、`meta.json` |
| 缓存有效期 | 24 小时 |

如果你经常刷新远程数据，建议配置 GitHub Token，降低 rate limit 风险：

```bash
GITHUB_TOKEN=github_pat_xxx linked-agent list --no-cache
```

网络请求内置超时和重试。遇到 DNS、GitHub 不可达或请求超时时，CLI 会输出更明确的错误信息并以非 0 状态码退出。

---

## 国内用户使用建议

- 第一次执行 `list` 或 `show` 需要访问 GitHub；如果网络不稳定，建议先配置可访问 GitHub 的网络环境。
- 成功拉取后会写入本地缓存，24 小时内再次查询会优先走缓存，速度更快也更稳定。
- 如果你只想在内部系统消费数据，优先使用 `--json` 输出，方便接入 Node.js、Python、Shell 或 CI。
- 如果团队维护自己的 Agent 仓库，后续可以把数据源抽象为配置项，复用现有 parser、cache 和 CLI 展示能力。

---

## 开发者

### 环境要求

- Node.js >= 18
- npm

### 本地开发

```bash
npm install
npm run build
npm link
```

### 常用脚本

```bash
npm run lint    # TypeScript 类型检查
npm test        # 编译测试产物并运行 Node test runner
npm run build   # 使用 tsup 构建 CLI
npm run dev     # watch 模式构建
```

测试套件会先把 TypeScript 编译到 `.test-dist/`，再运行 `test/*.test.mjs`。

---

## 项目结构

```text
linked-agent/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── test/
│   ├── cache.test.mjs
│   ├── parser.test.mjs
│   └── search.test.mjs
├── src/
│   ├── index.ts              # CLI 入口
│   ├── version.ts            # 版本号
│   ├── commands/
│   │   ├── cache.ts          # 缓存管理命令
│   │   ├── list.ts           # Agent 列表
│   │   ├── show.ts           # Agent 详情
│   │   ├── search.ts         # Agent 搜索
│   │   └── utils.ts          # 表格和 JSON 输出工具
│   ├── data/
│   │   ├── cache.ts          # 缓存读写和状态
│   │   ├── fetcher.ts        # GitHub API / Raw 内容拉取
│   │   ├── index.ts          # 数据层门面和搜索工具
│   │   ├── parser.ts         # Markdown / Frontmatter 解析
│   │   └── types.ts          # 共享类型和常量
│   └── utils/
│       └── logger.ts         # 统一输出工具
├── .gitignore
└── README.md
```

---

## 后续路线图

- [ ] 支持自定义数据源仓库和分支；
- [ ] 增加 `doctor` 命令，检查网络、缓存和 GitHub rate limit；
- [ ] 输出更漂亮的终端卡片和可选 compact 模式；
- [ ] 为 README 增加真实终端 GIF / SVG 演示图；
- [ ] 补充 `README.zh-CN.md` / `README.en-US.md` 多语言文档；
- [ ] 发布 npm 包后补充 npm version / downloads badges。

---

## License

MIT
