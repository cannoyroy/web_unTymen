import { getCollection } from 'astro:content';

export async function GET() {
  const posts = await getCollection('blog');
  type SearchItem = {
    title: string;
    url: string;
    description?: string;
    tags?: string[];
  };

  const items: SearchItem[] = [
    { title: 'Home', url: '/' },
    { title: "unTymen's blog", url: '/blog/' },
    { title: 'About', url: '/about/' },
    { title: 'Experience', url: '/experience/' },
    { title: 'Moment', url: '/moment/' },
    { title: 'Tags', url: '/tags/' },
  ];

  posts.forEach((post) => {
    const tags = Array.isArray(post.data.tags) ? post.data.tags : [];
    const description = post.data.description ?? '';
    const slug = post.id.replace(/\.md$/, '');
    items.push({
      title: post.data.title ?? slug,
      url: `/posts/${slug}/`,
      description,
      tags,
    });
  });

  return new Response(JSON.stringify({ items }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
