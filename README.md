<div align="center">

# 🔗 linked-agent

### 在终端里发现、搜索和查看 Agent 档案

**一个面向开发者、AI 产品团队和 Agent 设计者的轻量级 CLI 工具。**  
无需手动翻 GitHub 仓库或 LobeHub 市场，直接在命令行中浏览 Agent、按关键词检索、查看完整 Profile，并将结果以 JSON 形式接入你的自动化流程。

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
  <a href="#agent-友好模式">Agent 友好模式</a> ·
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
- 想降低 GitHub / LobeHub Marketplace 请求成本，还要额外处理缓存和网络问题。

**linked-agent 把这些动作收敛成一个终端命令，并用远程索引 + 本地缓存管理多个人才库。**
你可以像使用 `git`、`npm` 或 `rg` 一样，在命令行快速发现、筛选和消费 Agent 数据。

---

## 核心能力

<table>
  <tr>
    <td width="50%">
      <h3>🔎 终端优先的 Agent 浏览</h3>
      <p>一条命令列出所有 Agent，并支持分页、排序和按 division 过滤，适合快速盘点 Agent 仓库。</p>
      <pre><code>linked-agent list --source lobehub --search frontend</code></pre>
    </td>
    <td width="50%">
      <h3>🧑‍💼 Agent 友好的招聘推荐</h3>
      <p>让 HR Agent 用招聘 brief 找到合适的人设候选，并获得推荐理由、匹配词和下一步 show 命令。</p>
      <pre><code>linked-agent hire "前端设计师" --json</code></pre>
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
      <p>内置按数据源隔离的 24 小时缓存，不把 4 万+ LobeHub 市场数据打进安装包；同时支持 JSON 输出。</p>
      <pre><code>linked-agent list --json --limit 10</code></pre>
    </td>
  </tr>
</table>

---

## 适合谁使用？

| 角色 | 可以怎么用 |
| --- | --- |
| AI 产品经理 | 快速查看有哪些 Agent、它们分别解决什么问题。 |
| Agent / Prompt 设计者 | 同时检索 agency-agents 与 LobeHub Agent Market，参考已有 profile、mission、rules 和 services。 |
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

### 4. 让 HR Agent 推荐人设

```bash
linked-agent hire "前端设计师" --source lobehub --skills "React,Figma,UI" --json
```

### 5. 搜索 Agent

```bash
linked-agent search reviewer
```

### 6. 查看详情

```bash
linked-agent show engineering-code-reviewer
```

### 7. 输出 JSON 给脚本使用

```bash
linked-agent list --json --limit 5
```

---

## Agent 友好模式

linked-agent 现在提供专门面向 AI Agent 的使用路径：命令帮助中会直接给出可复制的 Agent workflow，并且 `hire` 命令会输出适合机器读取的候选人设 JSON。

### HR Agent 招聘示例

如果你有一个 HR 职责的 Agent，想让它“招聘一个前端设计师”，可以让它先运行：

```bash
linked-agent hire "前端设计师" --source lobehub --goal "为招聘流程找到合适的人设" --skills "React,Figma,UI" --json
```

返回结果会包含：

- `candidates[]`：按匹配分数排序的人设候选；
- `rationale[]`：推荐理由，方便 Agent 判断是否合适；
- `nextCommands[]`：下一步应该执行的 `show` 命令；
- `agentInstructions[]`：给调用方 Agent 的简短决策指导。

然后 HR Agent 可以继续查看候选详情：

```bash
linked-agent show <slug> --json
```

最终它可以基于候选人设的 mission、skills、rules、services 和 vibe，输出“推荐使用哪个 Agent 人设，以及为什么”。

### 给 Agent 的推荐工作流

```text
1. linked-agent hire <role> --source lobehub --json
2. 读取 candidates[].nextCommands
3. linked-agent show <slug> --json
4. 对比 mission / capabilities / rules / vibe
5. 返回最终推荐的人设 slug 和理由
```

---

## 命令速查

### `linked-agent hire <role>`

根据角色或招聘 brief，从人才库里推荐最匹配的 Agent 人设。

```bash
linked-agent hire "前端设计师" --source lobehub --goal "帮 HR Agent 找招聘人设" --skills "React,Figma,UI"
linked-agent hire "frontend designer" --source all --json --limit 3
linked-agent hire "HR recruiter" --division hr --playbook
```

| 参数 | 说明 |
| --- | --- |
| `--source <name>` | 人才库来源：`agency`、`lobehub` 或 `all`；hire 默认 `all`。 |
| `--goal <text>` | 招聘目标或任务上下文。 |
| `--skills <list>` | 逗号分隔的技能关键词，例如 `React,Figma,UI`。 |
| `-d, --division <name>` | 只在指定 division 中推荐。 |
| `--limit <n>` | 返回推荐数量，默认 `5`。 |
| `--cache-dir <path>` | 指定候选人设数据缓存目录。 |
| `--no-cache` | 跳过本地缓存，强制从 GitHub 重新拉取。 |
| `--json` | 输出 Agent 友好的 JSON。 |
| `--playbook` | 输出一段可交给其他 Agent 的操作提示。 |

### `linked-agent list`

列出 Agent，支持表格和 JSON 两种输出。

```bash
linked-agent list
linked-agent list --source lobehub --search frontend
linked-agent list --source all --search designer
linked-agent list --division engineering
linked-agent list --search reviewer
linked-agent list --sort division --limit 10 --offset 10
linked-agent list --json
linked-agent list --no-cache
```

| 参数 | 说明 |
| --- | --- |
| `--source <name>` | 数据源：`agency`、`lobehub` 或 `all`；list 默认 `agency`，避免首次安装后自动拉取大市场索引。 |
| `--no-cache` | 跳过本地缓存，强制从远程重新拉取。 |
| `-d, --division <name>` | 按 division / category 名称过滤。 |
| `-s, --search <query>` | 按名称、描述或 vibe 搜索。 |
| `--sort <field>` | 按 `name` 或 `division` 排序，默认 `name`。 |
| `--limit <n>` | 每页最多显示多少条，默认 `20`。 |
| `--offset <n>` | 分页起始位置，默认 `0`。 |
| `--json` | 输出机器可读 JSON。 |

### `linked-agent show <agent-slug>`

查看单个 Agent 的完整详情。

```bash
linked-agent show engineering-code-reviewer
linked-agent show lobehub/frontend-development-expert
linked-agent show reviewer
linked-agent show engineering-code-reviewer --section mission
linked-agent show engineering-code-reviewer --json
linked-agent show engineering-code-reviewer --no-cache
```

| 参数 | 说明 |
| --- | --- |
| `--source <name>` | 数据源：`agency`、`lobehub` 或 `all`；show 默认 `all`，便于通过 slug/sourceId 查找。 |
| `--no-cache` | 跳过本地缓存，强制从远程重新拉取。 |
| `--json` | 输出机器可读 JSON。 |
| `--section <title>` | 只显示标题包含指定文本的 sections。 |

> 如果没有精确匹配 slug，`show` 会尝试大小写不敏感的部分匹配；多个候选时，普通终端模式会让你交互选择，JSON 模式会直接输出候选列表。

### `linked-agent search <query>`

按关键词搜索 Agent。

```bash
linked-agent search review
linked-agent search "frontend design" --source lobehub
linked-agent search "brand systems"
linked-agent search visual --no-cache
```

| 参数 | 说明 |
| --- | --- |
| `--source <name>` | 数据源：`agency`、`lobehub` 或 `all`；search 默认 `all`。 |
| `--no-cache` | 跳过本地缓存，强制从远程重新拉取。 |

### `linked-agent cache`

管理本地缓存。

```bash
linked-agent cache status
linked-agent cache --source lobehub status
linked-agent cache status --json
linked-agent cache clear
linked-agent cache --source lobehub clear
linked-agent cache clear --all
linked-agent cache --cache-dir ~/.cache/linked-agent status
```

| 参数 | 说明 |
| --- | --- |
| `--cache-dir <path>` | 为缓存子命令指定自定义缓存目录。 |
| `--source <name>` | 查看或清理指定数据源缓存：`agency` 或 `lobehub`。 |
| `--all` | `cache clear` 可用，删除整个缓存目录。 |
| `--json` | `cache status` 支持 JSON 输出。 |

---

## 缓存与数据源

linked-agent 现在支持多个远程人才库，但**不会把这些数据打包进 npm 安装包**。CLI 只保留拉取和归一化逻辑，首次使用某个数据源时拉取远程索引，然后按数据源写入本地缓存。

| Source | 远程来源 | 适合场景 | 默认缓存文件 |
| --- | --- | --- | --- |
| `agency` | [`msitarzewski/agency-agents`](https://github.com/msitarzewski/agency-agents) | 结构化 Markdown Agent 档案、services、sections | `agents.json` / `meta.json` |
| `lobehub` | [LobeHub Agent Market](https://lobehub.com/agent) / 远程 agents-index | 4 万+ 市场 Agent，适合快速搜索职业、技能、行业人设 | `agents.lobehub.json` / `meta.lobehub.json` |
| `all` | 合并 `agency` + `lobehub` | HR Agent 或自动化流程希望扩大候选池 | 分别复用各 source 缓存 |

默认缓存策略：

| 项目 | 默认值 |
| --- | --- |
| 缓存目录 | `~/.linked-agent/cache/` |
| 缓存有效期 | 24 小时 |
| LobeHub 默认索引 | `https://registry.npmmirror.com/@lobehub/agents-index/v1/files/public/index.zh-CN.json` |
| 自定义 LobeHub 索引 | `LINKED_AGENT_LOBE_INDEX_URL=<url>` |

为什么这样管理数据源：

- **安装包更小**：不内置 LobeHub 4 万+ Agent 数据，只在需要时拉取远程索引；
- **首次可控**：`list` 默认只查 `agency`，避免用户安装后无意拉取大市场索引；
- **招聘更快**：`hire` / `search` 可以指定 `--source lobehub` 或使用缓存后的 `--source all` 快速命中候选；
- **缓存隔离**：不同 source 使用不同 cache 文件，清理和排查更明确。

如果你经常刷新 GitHub 数据，建议配置 GitHub Token，降低 rate limit 风险：

```bash
GITHUB_TOKEN=github_pat_xxx linked-agent list --source agency --no-cache
```

网络请求内置超时和重试。遇到 DNS、GitHub、LobeHub 索引不可达或请求超时时，CLI 会输出更明确的错误信息并以非 0 状态码退出。

---

## 国内用户使用建议

- 第一次执行 `list --source lobehub`、`search --source lobehub` 或 `hire --source lobehub` 需要访问 LobeHub 索引；国内用户默认走 npmmirror 索引地址。
- 成功拉取后会按 source 写入本地缓存，24 小时内再次查询会优先走缓存，速度更快也更稳定。
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
│   ├── matcher.test.mjs
│   ├── parser.test.mjs
│   ├── source.test.mjs
│   └── search.test.mjs
├── src/
│   ├── index.ts              # CLI 入口
│   ├── version.ts            # 版本号
│   ├── commands/
│   │   ├── cache.ts          # 缓存管理命令
│   │   ├── hire.ts           # 按角色推荐 Agent 人设
│   │   ├── list.ts           # Agent 列表
│   │   ├── show.ts           # Agent 详情
│   │   ├── search.ts         # Agent 搜索
│   │   └── utils.ts          # 表格和 JSON 输出工具
│   ├── data/
│   │   ├── cache.ts          # 缓存读写和状态
│   │   ├── fetcher.ts        # GitHub API / Raw 内容拉取
│   │   ├── index.ts          # 数据层门面和搜索工具
│   │   ├── matcher.ts        # 招聘/角色匹配打分
│   │   ├── parser.ts         # Markdown / Frontmatter 解析
│   │   └── types.ts          # 共享类型和常量
│   └── utils/
│       └── logger.ts         # 统一输出工具
├── .gitignore
└── README.md
```

---

## 后续路线图

- [x] 支持 LobeHub Agent Market 作为远程数据源；
- [ ] 支持更多自定义数据源仓库和分支；
- [ ] 增加 `doctor` 命令，检查网络、缓存和 GitHub rate limit；
- [ ] 输出更漂亮的终端卡片和可选 compact 模式；
- [ ] 为 README 增加真实终端 GIF / SVG 演示图；
- [ ] 补充 `README.zh-CN.md` / `README.en-US.md` 多语言文档；
- [ ] 发布 npm 包后补充 npm version / downloads badges。

---

## License

MIT
