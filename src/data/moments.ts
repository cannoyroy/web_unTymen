// src/data/moments.ts - Moments data

export interface MomentComment {
  name: string;
  text: string;
  replyTo?: string;
}

export interface Moment {
  id: string;
  name: string;
  avatar: string;
  avatarBg: string;
  avatarColor: string;
  time: string;
  createdAt: string;
  text: string;
  images: string[];
  location?: string;
  likes: string[];
  comments: MomentComment[];
}

export const moments: Moment[] = [
  {
    id: "1",
    name: "林夏",
    avatar: "夏",
    avatarBg: "#d1fae5",
    avatarColor: "#065f46",
    time: "2小时前",
    createdAt: "2026-02-22T20:00:00+08:00",
    text: "今天的晚霞很好看，刚好赶上最后一抹橙色。",
    images: ["/moments/sunset-1.jpg", "/moments/sunset-2.jpg", "/moments/sunset-3.jpg"],
    location: "滨江步道",
    likes: ["阿泽", "Mia", "小李", "周南"],
    comments: [
      { name: "阿泽", text: "配色太治愈了。" },
      { name: "林夏", text: "下次一起去拍照。", replyTo: "阿泽" },
      { name: "Mia", text: "好美，求定位。" },
    ],
  },
  {
    id: "2",
    name: "周南",
    avatar: "南",
    avatarBg: "#dbeafe",
    avatarColor: "#1e40af",
    time: "昨天 23:16",
    createdAt: "2026-02-21T23:16:00+08:00",
    text: "加班结束，便利店热牛奶加饭团。",
    images: ["/moments/night-snack.jpg"],
    location: "",
    likes: ["Reid", "Cindy"],
    comments: [{ name: "Cindy", text: "辛苦啦，早点休息。" }],
  },
  {
    id: "3",
    name: "Reid",
    avatar: "R",
    avatarBg: "#fef3c7",
    avatarColor: "#92400e",
    time: "前天 18:42",
    createdAt: "2026-02-20T18:42:00+08:00",
    text: "新键盘到手，手感很不错。",
    images: ["/moments/keyboard-1.jpg", "/moments/keyboard-2.jpg"],
    location: "家里",
    likes: ["林夏", "阿泽", "Mia", "周南", "小李", "Cindy"],
    comments: [
      { name: "阿泽", text: "哪个型号？" },
      { name: "Reid", text: "IQUNIX F97，推荐。", replyTo: "阿泽" },
    ],
  },
  {
    id: "4",
    name: "Mia",
    avatar: "M",
    avatarBg: "#fce7f3",
    avatarColor: "#9d174d",
    time: "3天前",
    createdAt: "2026-02-19T14:30:00+08:00",
    text: "周末去了山里的咖啡馆，风景很治愈。",
    images: ["/moments/coffee-1.jpg", "/moments/coffee-2.jpg", "/moments/coffee-3.jpg", "/moments/coffee-4.jpg"],
    location: "山间咖啡馆",
    likes: ["林夏", "周南"],
    comments: [
      { name: "林夏", text: "这家店我也想去。" },
      { name: "Mia", text: "导航搜山间咖啡馆就能到。", replyTo: "林夏" },
    ],
  },
  {
    id: "5",
    name: "阿泽",
    avatar: "泽",
    avatarBg: "#e0e7ff",
    avatarColor: "#3730a3",
    time: "4天前",
    createdAt: "2026-02-18T16:00:00+08:00",
    text: "读完了《人生海海》，很有力量。",
    images: [],
    location: "",
    likes: ["Reid", "林夏", "Cindy", "Mia"],
    comments: [
      { name: "Reid", text: "这本书确实不错。" },
      { name: "林夏", text: "加入书单。" },
    ],
  },
  {
    id: "6",
    name: "Cindy",
    avatar: "C",
    avatarBg: "#fef9c3",
    avatarColor: "#854d0e",
    time: "5天前",
    createdAt: "2026-02-17T10:00:00+08:00",
    text: "团建烘焙课第一次做戚风蛋糕，味道不错。",
    images: [
      "/moments/baking-1.jpg",
      "/moments/baking-2.jpg",
      "/moments/baking-3.jpg",
      "/moments/baking-4.jpg",
      "/moments/baking-5.jpg",
      "/moments/baking-6.jpg",
      "/moments/baking-7.jpg",
      "/moments/baking-8.jpg",
      "/moments/baking-9.jpg"
    ],
    location: "甜蜜时光烘焙工坊",
    likes: ["阿泽", "Mia", "周南", "Reid", "林夏"],
    comments: [
      { name: "周南", text: "最后一张翻车了吧。" },
      { name: "Cindy", text: "那是艺术，你不懂。", replyTo: "周南" },
    ],
  },
];
