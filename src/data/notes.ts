// src/data/notes.ts - Micro-notes and memos data
export interface Note {
  id: string;
  date: Date;
  title: string;
  content: string;
  tags: string[];
}

export const notes: Note[] = [
  {
    id: 'n1',
    date: new Date('2026-02-17T10:00:00'),
    title: 'Astro 重构博客',
    content: '开始尝试使用 Astro 重构博客，它的组件化思维和静态生成性能确实让人印象深刻。#Astro #WebDev',
    tags: ['Astro', 'WebDev']
  },
  {
    id: 'n2',
    date: new Date('2026-02-16T15:30:00'),
    title: '读书笔记 - 《有限与无限的游戏》',
    content: '最近在读《有限与无限的游戏》，感觉书中的视角非常有启发性：不仅要玩游戏，还要观察规则。#读书笔记 #哲学',
    tags: ['读书笔记', '哲学']
  },
  {
    id: 'n3',
    date: new Date('2026-02-15T09:45:00'),
    title: '上海的天气',
    content: '今天上海的天气不错，适合出门走走。#生活 #随笔',
    tags: ['生活', '随笔']
  },
  {
    id: 'n4',
    date: new Date('2026-02-14T20:15:00'),
    title: 'CSS Grid 的体验',
    content: '练习了一下 CSS Grid 布局，发现它在处理复杂的二维布局时比 Flexbox 方便得多。#CSS #Frontend',
    tags: ['CSS', 'Frontend']
  },
  {
    id: 'n5',
    date: new Date('2026-02-13T11:20:00'),
    title: 'DeepSeek 本地化部署',
    content: 'DeepSeek 的本地化部署初见成效，推理速度在 4090 上表现稳定。#AI #LLM',
    tags: ['AI', 'LLM']
  },
  {
    id: 'n6',
    date: new Date('2026-02-12T14:00:00'),
    title: 'Git 常用命令整理',
    content: '整理了一下常用的 Git 命令，感觉还是需要有一个自己的知识库。#Git #知识管理',
    tags: ['Git', '知识管理']
  }
];
