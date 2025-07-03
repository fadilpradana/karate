// src/components/Tiptap/Figcaption.js

import { Node } from '@tiptap/core';

export const Figcaption = Node.create({
  name: 'figcaption',
  content: 'text*',
  parseHTML() {
    return [{ tag: 'figcaption' }];
  },
  renderHTML() {
    return ['figcaption', 0];
  },
  isolating: true,
});