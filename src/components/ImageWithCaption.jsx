import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import React from 'react';

// [PERUBAHAN] Komponen dirender dengan React untuk menangkap event klik
const ImageWithCaptionComponent = ({ node, getPos, editor }) => {
  const { src, alt, title } = node.attrs;

  const handleClick = () => {
    // Memanggil command yang akan kita definisikan di editor utama
    // untuk menangani klik, baik di desktop maupun mobile.
    editor.commands.handleImageClick(getPos());
  };

  return (
    <NodeViewWrapper as="figure" data-type="image-with-caption" className="my-4 cursor-pointer">
      <img
        src={src}
        alt={alt}
        title={title}
        className="rounded-md"
        onClick={handleClick}
      />
      {/* NodeViewContent akan merender konten dari node (yaitu, caption) */}
      <NodeViewContent as="figcaption" />
    </NodeViewWrapper>
  );
};

export const ImageWithCaption = Node.create({
  name: 'imageWithCaption',
  group: 'block',
  content: 'text*',
  draggable: true,
  isolating: true,
  
  // [PERUBAHAN] Menambahkan command baru
  addCommands() {
    return {
      handleImageClick: (pos) => ({ editor, commands }) => {
        // Command ini akan di-override di konfigurasi editor utama
        // untuk memicu modal atau aksi lainnya.
        return true;
      },
    };
  },

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'figure[data-type="image-with-caption"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'figure',
      { 'data-type': 'image-with-caption' },
      ['img', mergeAttributes(HTMLAttributes)],
      ['figcaption', 0],
    ];
  },

  // [PERUBAHAN] Menggunakan ReactNodeViewRenderer
  addNodeView() {
    return ReactNodeViewRenderer(ImageWithCaptionComponent);
  },
});

export default ImageWithCaption;