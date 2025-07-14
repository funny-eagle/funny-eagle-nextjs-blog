// 导入 Node.js 文件系统模块中的写文件和创建目录方法
import { writeFileSync, mkdirSync } from 'fs'
// 导入 path 模块，用于处理文件路径
import path from 'path'
// 导入 github-slugger 库中的 slug 方法，用于生成标签的 slug
import { slug } from 'github-slugger'
// 导入 Pliny 工具库中的 escape 方法，用于 HTML 转义
import { escape } from 'pliny/utils/htmlEscaper.js'
// 导入站点元数据配置
import siteMetadata from '../data/siteMetadata.js'
// 导入标签数据，assert { type: 'json' } 用于确保以 JSON 格式导入
import tagData from '../app/tag-data.json' assert { type: 'json' }
// 导入所有博客文章数据，由 contentlayer 生成
import { allBlogs } from '../.contentlayer/generated/index.mjs'
// 导入 Pliny 工具库中的排序方法，用于排序文章
import { sortPosts } from 'pliny/utils/contentlayer.js'

// 生成单个 RSS item 的 XML 字符串
const generateRssItem = (config, post) => `
  <item>
    <guid>${config.siteUrl}/blog/${post.slug}</guid> <!-- 唯一标识符 -->
    <title>${escape(post.title)}</title> <!-- 文章标题，进行 HTML 转义 -->
    <link>${config.siteUrl}/blog/${post.slug}</link> <!-- 文章链接 -->
    ${post.summary && `<description>${escape(post.summary)}</description>`} <!-- 文章摘要（可选） -->
    <pubDate>${new Date(post.date).toUTCString()}</pubDate> <!-- 发布时间 -->
    <author>${config.email} (${config.author})</author> <!-- 作者信息 -->
    ${post.tags && post.tags.map((t) => `<category>${t}</category>`).join('')} <!-- 标签列表 -->
  </item>
`

// 生成整个 RSS 文件的 XML 字符串
const generateRss = (config, posts, page = 'feed.xml') => `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${escape(config.title)}</title> <!-- 频道标题 -->
      <link>${config.siteUrl}/blog</link> <!-- 频道链接 -->
      <description>${escape(config.description)}</description> <!-- 频道描述 -->
      <language>${config.language}</language> <!-- 频道语言 -->
      <managingEditor>${config.email} (${config.author})</managingEditor> <!-- 管理员信息 -->
      <webMaster>${config.email} (${config.author})</webMaster> <!-- 站点管理员 -->
      <lastBuildDate>${new Date(posts[0].date).toUTCString()}</lastBuildDate> <!-- 最后构建时间 -->
      <atom:link href="${config.siteUrl}/${page}" rel="self" type="application/rss+xml"/> <!-- Atom 链接 -->
      ${posts.map((post) => generateRssItem(config, post)).join('')} <!-- 所有文章的 item -->
    </channel>
  </rss>
`

// 异步生成 RSS 文件，包括主 feed 和标签分类 feed
async function generateRSS(config, allBlogs, page = 'feed.xml') {
  // 过滤出已发布的文章（draft !== true）
  const publishPosts = allBlogs.filter((post) => post.draft !== true)
  // 生成主博客 RSS 文件
  if (publishPosts.length > 0) {
    const rss = generateRss(config, sortPosts(publishPosts)) // 按时间排序
    writeFileSync(`./public/${page}`, rss) // 写入 public 目录
  }

  // 为每个标签生成单独的 RSS 文件
  if (publishPosts.length > 0) {
    for (const tag of Object.keys(tagData)) {
      // 过滤出包含该标签的文章
      const filteredPosts = allBlogs.filter((post) => post.tags.map((t) => slug(t)).includes(tag))
      // 生成标签对应的 RSS 文件
      const rss = generateRss(config, filteredPosts, `tags/${tag}/${page}`)
      const rssPath = path.join('public', 'tags', tag)
      mkdirSync(rssPath, { recursive: true }) // 创建标签目录
      writeFileSync(path.join(rssPath, page), rss) // 写入标签 RSS 文件
    }
  }
}

// 主入口函数，生成所有 RSS 文件
const rss = () => {
  generateRSS(siteMetadata, allBlogs)
  console.log('RSS feed generated...') // 输出生成完成信息
}
export default rss // 导出主函数，供外部调用
