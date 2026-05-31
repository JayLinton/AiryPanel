import { Node, mergeAttributes } from '@tiptap/core';

export interface WikiLinkOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    wikiLink: {
      setWikiLink: (attributes: { docId: string; label: string }) => ReturnType;
    };
  }
}

export const WikiLink = Node.create<WikiLinkOptions>({
  name: 'wikiLink',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  inline: true,
  group: 'inline',
  draggable: true,

  addAttributes() {
    return {
      docId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-doc-id'),
        renderHTML: (attributes) => {
          if (!attributes.docId) return {};
          return { 'data-doc-id': attributes.docId };
        },
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes) => {
          if (!attributes.label) return {};
          return { 'data-label': attributes.label };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-wiki-link]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        {
          'data-wiki-link': '',
          class: 'wiki-link',
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      0,
    ];
  },

  addCommands() {
    return {
      setWikiLink:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },

  addNodeView() {
    return ({ node }) => {
      const span = document.createElement('span');
      span.classList.add('wiki-link');
      span.setAttribute('data-doc-id', node.attrs.docId || '');
      span.setAttribute('data-label', node.attrs.label || '');
      span.textContent = `[[${node.attrs.label || ''}]]`;
      span.style.color = 'var(--accent)';
      span.style.cursor = 'pointer';
      span.style.textDecoration = 'underline';
      span.style.textUnderlineOffset = '2px';

      // 点击跳转
      span.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (node.attrs.docId) {
          // 触发自定义事件跳转到文档
          const event = new CustomEvent('wiki-link-click', {
            detail: { docId: node.attrs.docId },
            bubbles: true,
          });
          span.dispatchEvent(event);
        }
      });

      return {
        dom: span,
      };
    };
  },
});

export default WikiLink;
