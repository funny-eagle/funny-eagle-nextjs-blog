// 表明该组件是一个客户端组件（Next.js 13+ 的特性），需要在浏览器端运行。
'use client'

import { Comments as CommentsComponent } from 'pliny/comments'
import { useState } from 'react'
import siteMetadata from '@/data/siteMetadata'

export default function Comments({ slug }: { slug: string }) {
  /**
   * 使用 useState 定义了一个状态变量 loadComments，初始值为 false。
   * loadComments：表示是否加载评论区。
   * setLoadComments：用于更新 loadComments 的函数。
   */
  const [loadComments, setLoadComments] = useState(false)

  // 检查站点元数据中是否配置了评论系统的 provider。如果没有配置，则组件不渲染任何内容
  if (!siteMetadata.comments?.provider) {
    return null
  }
  /**
   * return(...)是组件的返回部分，决定了组件在页面上渲染什么内容。
   * <> ... </> 这是 React Fragment 的简写形式，用于包裹多个子元素，但不会在最终的 HTML 结构中增加额外的节点。
   * <CommentsComponent commentsConfig={siteMetadata.comments} slug={slug} />
   * 当 loadComments 为 true 时，渲染评论组件。
   * commentsConfig={siteMetadata.comments}：将站点的评论配置传递给评论组件。
   * slug={slug}：将当前页面的唯一标识（slug）传递给评论组件，用于区分不同页面的评论。
   *
   * <button onClick={() => setLoadComments(true)}>Load Comments</button>
   *
   * 当 loadComments 为 false 时，渲染一个按钮。
   * onClick={() => setLoadComments(true)}：点击按钮时，将 loadComments 状态设置为 true，从而触发重新渲染，显示评论区。
   */
  return (
    <>
      {loadComments ? (
        <CommentsComponent commentsConfig={siteMetadata.comments} slug={slug} />
      ) : (
        <button onClick={() => setLoadComments(true)}>Load Comments</button>
      )}
    </>
  )
}
