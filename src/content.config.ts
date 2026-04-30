// 导入 glob 加载器（loader）
import {glob} from "astro/loaders";
// 从 `astro:content` 导入工具函数
import {defineCollection} from "astro:content";
// 导入 Zod
import {z} from "astro/zod";
// 为每个集合定义一个 `loader` 和 `schema`
const blog = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: "./src/blog" }),
    schema: z.object({
      title: z.string(),
      pubDate: z.date(),
      updated: z.date().optional(),
      description: z.string(),
      author: z.string(),
      image: z.object({
        url: z.string(),
        alt: z.string()
      }).optional(),
      tags: z.array(z.string()),
      series: z.string().optional(),
      seriesOrder: z.number().int().optional(),
      changes: z.array(z.string()).optional(),
      draft: z.boolean().optional(),
      likeCount: z.number().int().min(0).optional(),
      shareCount: z.number().int().min(0).optional(),
      docked: z.boolean().optional()
    })
});
// 导出一个单独的 `collections` 对象用以注册你的集合（们）
export const collections = { blog };
