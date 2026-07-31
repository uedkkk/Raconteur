import MarkdownIt from 'markdown-it'
import markdownItLinkAttributes from 'markdown-it-link-attributes'

let md: MarkdownIt | null = null

function getRenderer(): MarkdownIt {
  if (!md) {
    md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    })

    md.use(markdownItLinkAttributes, {
      attrs: {
        target: '_blank',
        rel: 'noopener',
      },
    })
  }
  return md
}

export function renderMarkdown(content: string): string {
  if (!content) return ''
  return getRenderer().render(content)
}

export function renderMarkdownInline(content: string): string {
  if (!content) return ''
  return getRenderer().renderInline(content)
}

export function generateExcerpt(content: string, maxLength = 200): string {
  if (!content) return ''
  const html = renderMarkdown(content)
  const text = html.replace(/<[^>]+>/g, '').trim()
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}
