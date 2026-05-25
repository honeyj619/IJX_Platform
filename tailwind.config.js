/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    fontSize: {
      '3xs': ['0.5625rem', { lineHeight: '0.75rem' }],   // 9px
      '2xs': ['0.625rem', { lineHeight: '0.875rem' }],    // 10px
      'xs': ['0.75rem', { lineHeight: '1rem' }],
      'sm': ['0.8125rem', { lineHeight: '1.25rem' }],
      'base': ['0.875rem', { lineHeight: '1.5rem' }],
      'lg': ['0.9375rem', { lineHeight: '1.75rem' }],
      'xl': ['1rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.125rem', { lineHeight: '2rem' }],
      '3xl': ['1.25rem', { lineHeight: '2rem' }],
      '4xl': ['1.5rem', { lineHeight: '2rem' }],
      '5xl': ['1.75rem', { lineHeight: '2.25rem' }],
      '6xl': ['2rem', { lineHeight: '2.5rem' }],
    },
    extend: {
      screens: {
        '3xl': '1920px',   // 大屏优化
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
        '12': '3rem',
        '14': '3.5rem',
        '16': '4rem',
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
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
