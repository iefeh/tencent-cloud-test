This is a [Next.js](https://nextjs.org/) project bootstrapped
with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed
on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited
in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated
as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and
load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions
are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use
the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# 后端模块

## 代码结构

```shell
src ----
    |--- lib
        |--- models   # 数据库模型定义
        |--- kafka    # kafka客户端
        |--- redis    # redis客户端
        |--- mongodb  # mongodb客户端
        |--- logger   # 日志
        |--- middleware # 业务拦截器,如授权、错误
        |--- response   # 统一响应定义，含业务码
        |--- accerlator # 奖励加速器，当前包含NFT加速器
        |--- authorization # 社媒授权抽象定义
        |--- quests     # 任务抽象定义，包含各类任务的实现
    |--- pages/api    # API入口
        |--- auth     # 授权API入口，底层使用lib/authorization
            |--- callback  # 社媒授权回调处理
            |--- connect   # 用户绑定社媒账号
            |--- disconnect # 用户解绑社媒账号
            |--- signin     # 用户登录，包含社媒、邮件、钱包登录
        |--- badges   # 徽章API入口，包含徽章的领取、查询
        |--- quests   # 任务API入口，包含任务的查询、领取，底层使用lib/quests
        |--- campaigns # 活动API入口，包含活动的查询、领取奖励，底层共用任务抽象
```

## 代码规范

- 后端响应的所有的数据都是json格式，且统一的响应结构如下：

```json
// res.json(response.success())
{
  "code": 1,
  "msg": "Success",
  "data": any
}
```
- 后端的所有分页响应采用统一的分页响应结构，避免不同的分页结构增加前端的接入工作量：

```typescript
res.json(response.success({
        total: pagination.total,
        page_num: pageNum,
        page_size: pageSize,
        quests: quests,
    }));
```

- 后端请求与响应的所有的字段应采用蛇形命名法，如`user_id`，且应见名知意。
- 后端的所有API命名禁止采用驼峰命令，基本采用名词+动词的形式，目录结构命令，如
  - /api/auth/disconnect/:platform
  - /api/games/astrark/preregister
  - /api/quests/verify
  - /api/quests/list
  - /api/users/me

## 代码交付规则

- 开发新的功能需要创建新的git开发分支，常用命名规则 feat/xxx，如feat/quests.
- 确保负责的代码质量，交付功能不具备明显瑕疵，经过自测(目前API测未强制编写单元测试，需自行测试各种边界条件)。
- API侧完成后，需要在apifox编写完整的接口文档，包括请求参数、响应参数、是否要求授权，且各参数的含义应该编写说明。
- 代码提交：
  - dev提交，通过功能分支提交PR到dev分支，由vercel管理员后合并。
  - main提交，通过功能或DEV分支提交PR，具体流程视实际情况定。
    
    
    