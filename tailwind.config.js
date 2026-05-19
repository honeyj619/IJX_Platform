/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // 温和的莫兰迪色系主题
        theme: {
          50: '#f5f8f7',
          100: '#e8f0ef',
          200: '#d4e5e2',
          300: '#b8d4cf',
          400: '#8fbfb8',
          500: '#7BA3A8',     // 主色
          600: '#5B8589',     // 深主色
          700: '#4a7075',
          800: '#3d5d60',
          900: '#354d4f',
          950: '#1a2829',
        },
        // 柔和珊瑚色 - 用于文件、警告等
        coral: {
          50: '#fdf8f6',
          100: '#f9ece8',
          200: '#f2d5cd',
          300: '#e8b8ac',
          400: '#D4A59A',     // 主色
          500: '#c28575',
          600: '#a86858',
          700: '#8b5244',
        },
        // 柔和薄荷绿 - 用于我的消息背景
        mint: {
          50: '#f4f9f8',
          100: '#e6f2f0',
          200: '#cde5e1',
          300: '#b4d7d2',
          400: '#D4EDE9',     // 主色
          500: '#a8d4cd',
          600: '#85bfb6',
          700: '#6a9f97',
        },
        // 柔和边框色
        border: {
          DEFAULT: '#E8E5E2',
          light: '#f0ede9',
          dark: '#d4d0cb',
        },
      },
    },
  },
  plugins: [],
};
