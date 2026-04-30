import type { CollectionEntry } from 'astro:content';

type BlogPost = CollectionEntry<'blog'>;

export type TagNode = {
  name: string;
  path: string;
  slug: string;
  count: number;
  children: TagNode[];
};

const normalizeTag = (tag: string) =>
  tag
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join('/');

export const tagToSlug = (tag: string) =>
  normalizeTag(tag)
    .replace(/[^\w\u4e00-\u9fa5/-]/g, '-')
    .replace(/\//g, '--')
    .toLowerCase();

const expandTagPaths = (tag: string) => {
  const segments = normalizeTag(tag).split('/').filter(Boolean);
  return segments.map((_, index) => segments.slice(0, index + 1).join('/'));
};

export const getTagPathsFromPosts = (posts: BlogPost[]) => {
  const paths = new Set<string>();
  posts.forEach((post) => {
    post.data.tags.forEach((tag) => {
      expandTagPaths(tag).forEach((path) => paths.add(path));
    });
  });
  return [...paths].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
};

export const getPostsByTagPath = (posts: BlogPost[], tagPath: string) =>
  posts.filter((post) =>
    post.data.tags.some((tag) => {
      const normalized = normalizeTag(tag);
      return normalized === tagPath || normalized.startsWith(`${tagPath}/`);
    })
  );

export const buildTagTree = (posts: BlogPost[]): TagNode[] => {
  const tagPaths = getTagPathsFromPosts(posts);
  const pathMap = new Map<string, TagNode>();

  tagPaths.forEach((path) => {
    const segments = path.split('/');
    pathMap.set(path, {
      name: segments[segments.length - 1],
      path,
      slug: tagToSlug(path),
      count: getPostsByTagPath(posts, path).length,
      children: [],
    });
  });

  const roots: TagNode[] = [];
  tagPaths.forEach((path) => {
    const node = pathMap.get(path);
    if (!node) return;

    const parentPath = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : null;
    if (!parentPath) {
      roots.push(node);
      return;
    }

    const parent = pathMap.get(parentPath);
    if (parent) {
      parent.children.push(node);
    }
  });

  const sortNodes = (nodes: TagNode[]) => {
    nodes.sort((a, b) => a.path.localeCompare(b.path, 'zh-Hans-CN'));
    nodes.forEach((node) => sortNodes(node.children));
  };

  sortNodes(roots);
  return roots;
};

