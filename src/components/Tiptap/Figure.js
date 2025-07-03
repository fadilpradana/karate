// src/components/Tiptap/Figure.js

import { Node, mergeAttributes } from '@tiptap/core';

export const Figure = Node.create({
  name: 'figure',
  group: 'block',
  content: 'figcaption',
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        contentElement: 'figcaption',
        getAttrs: (dom) => {
          const img = dom.querySelector('img');
          return {
            src: img?.getAttribute('src'),
            alt: img?.getAttribute('alt'),
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    // --- INI BAGIAN YANG DIPERBAIKI ---
    // Atribut untuk tag <figure> luar
    const figureAttrs = mergeAttributes(HTMLAttributes);

    // Atribut khusus untuk tag <img> di dalam
    const imgAttrs = {
      src: node.attrs.src,
      alt: node.attrs.alt,
    };

    return [
      'figure',
      figureAttrs,
      ['img', imgAttrs],
      ['figcaption', 0], // '0' adalah slot untuk konten figcaption
    ];
  },

  addCommands() {
    return {
      setFigure: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
          content: [
            { type: 'figcaption', content: [] },
          ],
        });
      },
    };
  },
});