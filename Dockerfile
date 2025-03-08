# 使用官方 Node.js 镜像
FROM node:18 AS build

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制整个项目文件到容器中
COPY . .

# 构建 Next.js 应用
RUN npm run build

# 设置生产环境运行时
FROM node:18

# 设置工作目录
WORKDIR /app

# 复制构建好的应用文件
COPY --from=build /app ./

# 安装生产环境依赖
RUN npm install --production

# 暴露应用端口
EXPOSE 3000

# 启动 Next.js 应用
CMD ["npm", "start"]
