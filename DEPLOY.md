# 部署指南

## 项目概述
这是一个基于 React + TypeScript + Vite 的企业级应用，包含以下功能：
- 消息中心
- 企业门户
- 日历系统
- 知识库
- 业务中心
- 智能体广场
- 如意空间
- 个人设置

## 构建产物

项目已成功构建，产物位于 `dist/` 目录：

```
dist/
├── assets/
│   ├── index-[hash].css       # 样式文件
│   ├── index-[hash].js        # 主应用文件
│   └── index-[hash].js.map    # Source Map
├── assistant-avatar.png       # 如意助手头像
├── assistant-avatar.svg       # 如意助手头像 SVG
├── favicon.svg                # 网站图标
└── index.html                 # 入口 HTML
```

## 部署方案

### 方案一：Vercel（推荐）

1. 将代码推送到 GitHub / GitLab / Bitbucket
2. 在 Vercel 中导入项目
3. Vercel 会自动检测 Vite 项目并部署
4. 访问生成的 URL

### 方案二：Netlify

1. 将代码推送到 GitHub / GitLab / Bitbucket
2. 在 Netlify 中导入项目
3. Netlify 会自动检测 Vite 项目并部署
4. 访问生成的 URL

### 方案三：阿里云 / 腾讯云 / AWS

#### 静态网站托管（推荐）

1. 将 `dist/` 目录的内容上传到云存储桶
2. 配置静态网站托管
3. 配置 CDN（可选）
4. 访问站点

#### Nginx 部署

在服务器上创建 Nginx 配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 方案四：Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 部署前检查清单

- [ ] `npm run build` 成功执行
- [ ] `dist/` 目录包含所有必要文件
- [ ] 环境变量配置正确
- [ ] 路由配置正确（SPA 需要支持 History API）
- [ ] 所有图片资源可访问
- [ ] 静态资源已压缩优化
- [ ] 配置了正确的 CORS 策略

## 注意事项

1. **SPA 路由配置**：这是一个单页应用，需要确保服务器正确处理路由，所有非静态资源请求都返回 `index.html`
2. **HTTPS**：生产环境建议使用 HTTPS
3. **CDN**：为静态资源配置 CDN，提高加载速度
4. **缓存策略**：为静态资源设置合理的缓存策略
5. **监控**：添加错误监控和性能监控
6. **备份**：定期备份重要数据

## 性能优化建议

- 启用 Gzip / Brotli 压缩
- 配置 HTTP/2
- 使用 CDN 加速静态资源
- 配置合理的缓存头
- 图片优化（WebP 格式）
- 代码分割和懒加载

## 支持

如有部署问题，请检查：
1. 浏览器控制台错误
2. 服务器日志
3. 网络请求状态
