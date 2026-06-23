全新的架构设计。                                               





当前问题分析                                                                  



 1 **package.json 重复** - 导致 npm install 失败                                                  

 2 **docker-compose.yml 重复** - 导致启动失败                                                   

 3 **prisma.config.ts 依赖缺失** - 需要 @prisma/config 包                                             

 4 **页面功能单薄** - 缺少企业主页、产品展示、数据看板等核心功能                                         

 5 **缺少企业入驻流程** - 企业无法自助注册和管理                                                 

 6 **缺少媒体矩阵** - 软文发布、媒体分发功能缺失                                                 

 7 **缺少评选系统** - 硬核芯评选功能缺失                                                     

 8 **缺少广告投放系统** - 广告位管理、效果追踪缺失                                                

 9 **缺少数据洞察** - 企业曝光数据、用户行为分析缺失                                               





全新架构设计                                                                  



**核心业务模块**                                                                  



​                                 

 模块      功能                    价值    

 ──────────────────────────────────────────────────────────────────── 

 **企业主页**    品牌展示、产品目录、新闻动态、数据看板   品牌曝光  

 **展会/发布会**  活动创建、报名管理、直播集成、活动回顾   行业影响力 

 **软文/媒体发布** 软文提交、媒体矩阵分发、效果追踪、SEO优化 媒体传播  

 **硬核芯评选**   评选页面、企业报名、投票系统、获奖标识   品牌公信力 

 **广告投放**    广告位管理、精准定向、效果追踪、A/B测试  精准触达  

 **数据/洞察**   行业报告、企业数据、市场分析、定制报告   决策支持  

 **招聘/雇主品牌** 职位发布、简历管理、雇主品牌展示      人才吸引  

​                                    



**技术栈升级**                                                                   



​                     

 层级 技术     版本  用途     

 ───────────────────────────────────────── 

 框架  Next.js    16.2.4 SSR/SSG/ISR 

 UI   React     19.2.4 组件化    

 样式  Tailwind CSS   4    原子化 CSS  

 语言   TypeScript    5    类型安全   

 数据库  PostgreSQL    16   主存储    

 ORM    Prisma      7.8.0  数据模型   

 缓存   Redis (Upstash) -    缓存/限流  

 认证   JWT + bcryptjs     -    无状态认证  

 验证   Zod           4.4.2  运行时验证  

 状态管理 Zustand         5.0.3  客户端状态  

 国际化  @formatjs/intl     3.1.4  中英文    

 测试   Vitest + Playwright   -    单元+E2E   

 部署   Docker + Vercel     -    容器化    

 搜索   Meilisearch       -    全文搜索   

 文件存储 AWS S3 / Cloudflare R2 -    文件上传   

 邮件   Resend / SendGrid    -    邮件通知   

 分析   Plausible / Umami    -    隐私分析   

​                            



**数据模型扩展**                                                                  



​                                                                        

// 企业系统（核心）                                                              

model Company {                                                                

 id     String  @id @default(cuid())                                                  

 name    String  @unique                                                         

 slug    String  @unique                                                         

 logo    String?                                                             

 description String?                                                             

 website   String?                                                             

 socialLinks Json?  // { "wechat": "...", "linkedin": "...", "twitter": "..." }                               

 status   Status  @default(PENDING)                                                    

 createdAt  DateTime @default(now())                                                     

 updatedAt  DateTime @updatedAt                                                       

​                                                                        

 products  Product[]                                                            

 news    CompanyNews[]                                                          

 events   Event[]                                                             

 jobs    Job[]                                                              

 awards   Award[]                                                             

 ads     Ad[]                                                               

 reports   Report[]                                                             

 // 新增                                                                   

 mediaKit  MediaKit?    // 媒体资料包                                                  

 brandAssets BrandAsset[]  // 品牌素材                                                   

 caseStudies CaseStudy[]   // 合作案例                                                   

 dataMetrics DataMetric[]  // 数据指标                                                   

}                                                                       

​                                                                        

// 媒体资料包                                                                 

model MediaKit {                                                                

 id     String  @id @default(cuid())                                                  

 companyId  String  @unique                                                         

 company   Company @relation(fields: [companyId], references: [id])                                    

 pdfUrl   String?                                                             

 videoUrl  String?                                                             

 images   Json?  // 高清图片列表                                                     

 createdAt  DateTime @default(now())                                                     

 updatedAt  DateTime @updatedAt                                                       

}                                                                       

​                                                                        

// 品牌素材                                                                  

model BrandAsset {                                                               

 id    String  @id @default(cuid())                                                   

 companyId String                                                               

 company  Company @relation(fields: [companyId], references: [id])                                     

 type   AssetType                                                             

 url    String                                                               

 title   String?                                                              

 createdAt DateTime @default(now())                                                      

}                                                                       

​                                                                        

enum AssetType {                                                                

 LOGO                                                                     

 BANNER                                                                    

 PRODUCT_IMAGE                                                                

 TEAM_PHOTO                                                                  

 VIDEO                                                                    

 DOCUMENT                                                                   

}                                                                       

​                                                                        

// 合作案例                                                                  

model CaseStudy {                                                               

 id     String  @id @default(cuid())                                                  

 companyId  String                                                              

 company   Company @relation(fields: [companyId], references: [id])                                    

 title    String                                                              

 description String                                                              

 type    CaseType                                                             

 result   String? // 合作成果                                                       

 images   Json?                                                              

 publishedAt DateTime?                                                            

 createdAt  DateTime @default(now())                                                     

}                                                                       

​                                                                        

enum CaseType {                                                                

 SOFT_ARTICLE                                                                 

 EXHIBITION                                                                  

 AWARD                                                                    

 ADVERTISING                                                                 

 DATA_REPORT                                                                 

 OTHER                                                                    

}                                                                       

​                                                                        

// 数据指标                                                                  

model DataMetric {                                                               

 id    String  @id @default(cuid())                                                   

 companyId String                                                               

 company  Company @relation(fields: [companyId], references: [id])                                     

 date   DateTime                                                              

 type   MetricType                                                             

 value   Int                                                                

 createdAt DateTime @default(now())                                                      

​                                                                        

 @@unique([companyId, date, type])                                                      

}                                                                       

​                                                                        

enum MetricType {                                                               

 ARTICLE_VIEWS                                                                

 EVENT_PARTICIPANTS                                                              

 AD_CLICKS                                                                  

 AD_IMPRESSIONS                                                                

 AWARD_VOTES                                                                 

 JOB_APPLICATIONS                                                               

 REPORT_DOWNLOADS                                                               

}                                                                       

​                                                                        

// 软文/媒体发布                                                                

model SoftArticle {                                                              

 id     String  @id @default(cuid())                                                  

 companyId  String                                                              

 company   Company @relation(fields: [companyId], references: [id])                                    

 title    String                                                              

 content   String                                                              

 status   ArticleStatus @default(DRAFT)                                                  

 channels  Json?  // 发布渠道列表                                                     

 seoKeywords String?                                                             

 publishedAt DateTime?                                                            

 createdAt  DateTime @default(now())                                                     

 updatedAt  DateTime @updatedAt                                                       

​                                                                        

 metrics SoftArticleMetric[]                                                         

}                                                                       

​                                                                        

model SoftArticleMetric {                                                           

 id      String  @id @default(cuid())                                                 

 softArticleId String                                                             

 softArticle  SoftArticle @relation(fields: [softArticleId], references: [id])                                

 channel    String  // 公众号、头条、知乎等                                                

 views     Int   @default(0)                                                      

 shares    Int   @default(0)                                                      

 comments   Int   @default(0)                                                      

 createdAt   DateTime @default(now())                                                    

 updatedAt   DateTime @updatedAt                                                      

}                                                                       

​                                                                        

enum ArticleStatus {                                                              

 DRAFT                                                                    

 PENDING_REVIEW                                                                

 APPROVED                                                                   

 REJECTED                                                                   

 PUBLISHED                                                                  

 ARCHIVED                                                                   

}                                                                       

​                                                                        

// 评选系统                                                                  

model AwardVote {                                                               

 id    String  @id @default(cuid())                                                   

 awardId  String                                                               

 award   Award  @relation(fields: [awardId], references: [id])                                      

 userId  String                                                               

 user   User   @relation(fields: [userId], references: [id])                                       

 ip    String?                                                              

 createdAt DateTime @default(now())                                                      

​                                                                        

 @@unique([awardId, userId])                                                         

}                                                                       

​                                                                        

// 广告投放                                                                  

model AdCampaign {                                                               

 id     String  @id @default(cuid())                                                  

 companyId  String                                                              

 company   Company @relation(fields: [companyId], references: [id])                                    

 name    String                                                              

 budget   Float                                                              

 startDate  DateTime                                                             

 endDate   DateTime                                                             

 targetAudience Json? // 目标受众标签                                                     

 status   CampaignStatus @default(DRAFT)                                                  

 createdAt  DateTime @default(now())                                                     

 updatedAt  DateTime @updatedAt                                                       

​                                                                        

 ads Ad[]                                                                   

}                                                                       

​                                                                        

enum CampaignStatus {                                                             

 DRAFT                                                                    

 ACTIVE                                                                    

 PAUSED                                                                    

 ENDED                                                                    

}                                                                       

​                                                                        

// 扩展 Ad 模型                                                                

model Ad {                                                                   

 id     String  @id @default(cuid())                                                  

 campaignId String?                                                             

 campaign  AdCampaign? @relation(fields: [campaignId], references: [id])                                  

 title    String                                                              

 image    String?                                                             

 videoUrl  String?                                                             

 link    String                                                              

 position  AdPosition                                                            

 startDate  DateTime                                                             

 endDate   DateTime                                                             

 budget   Float?                                                              

 cost    Float?                                                              

 companyId  String                                                              

 company   Company  @relation(fields: [companyId], references: [id])                                    

 status   Status  @default(DRAFT)                                                    

 createdAt  DateTime @default(now())                                                    

 updatedAt  DateTime @updatedAt                                                       

 impressions Int    @default(0)                                                      

 clicks   Int    @default(0)                                                      

 // A/B 测试                                                                 

 abTestGroup String?  // A/B                                                         

 conversionRate Float? @default(0)                                                      

}                                                                       

​                                                                        

// 行业报告                                                                  

model Report {                                                                 

 id     String  @id @default(cuid())                                                  

 title    String                                                              

 description String                                                              

 fileUrl   String?                                                             

 price    Float?                                                              

 companyId  String?                                                             

 company   Company? @relation(fields: [companyId], references: [id])                                    

 category  ReportCategory?                                                         

 tags    String[]                                                             

 downloadCount Int  @default(0)                                                       

 publishedAt DateTime?                                                            

 createdAt  DateTime @default(now())                                                     

 updatedAt  DateTime @updatedAt                                                       

}                                                                       

​                                                                        

enum ReportCategory {                                                             

 INDUSTRY_TREND                                                                

 MARKET_ANALYSIS                                                               

 TECHNOLOGY_REVIEW                                                              

 COMPANY_PROFILE                                                               

 CUSTOM_REPORT                                                                

}                                                                       

​                                                                        



**页面架构**                                                                    



*前台页面（面向公众）*                                                              



​                                              

 页面   路由        功能                             

 ──────────────────────────────────────────────────────────────────────────────────────── 

 首页   **/**         Hero Banner、推荐企业、最新文章、活动预告、数据统计、广告位 

 企业列表 **/companies**     企业搜索、分类筛选、列表展示                 

 企业详情 **/companies/[slug]** 企业主页、产品展示、新闻动态、招聘信息、数据看板、合作案例  

 产品列表 **/products**     产品搜索、分类筛选                      

 产品详情 **/products/[id]**   产品参数、应用场景、所属企业                 

 文章列表 **/articles**     分类筛选、搜索、分页                     

 文章详情 **/articles/[slug]**  Markdown 渲染、相关文章                   

 活动列表 **/events**      时间线展示、筛选                       

 活动详情 **/events/[id]**    活动信息、报名入口、直播链接                 

 招聘列表 **/jobs**       职位搜索、企业筛选                      

 招聘详情 **/jobs/[id]**     职位描述、投递入口                      

 报告列表 **/reports**      行业报告下载                         

 报告详情 **/reports/[id]**   报告预览、付费下载                      

 评选   **/awards**      评选规则、奖项设置、投票入口                 

 评选详情 **/awards/[id]**    评选详情、投票                        

 广告   **/ads**        广告位展示                          

 关于我们 **/about**       平台介绍、联系方式                      

 搜索   **/search**      全文搜索（企业、产品、文章）                 

​                                              



*企业后台（面向入驻企业）*                                                            



​                            

 页面    路由          功能        

 ───────────────────────────────────────────────────── 

 企业登录  **/enterprise/login**   企业账号登录    

 企业注册  **/enterprise/register**  企业入驻申请    

 企业控制台 **/enterprise/dashboard** 数据看板、快捷操作 

 企业信息  **/enterprise/profile**  编辑企业信息    

 产品管理  **/enterprise/products**  CRUD 产品      

 新闻管理  **/enterprise/news**    发布新闻、软文   

 活动管理  **/enterprise/events**   申请活动、查看报名 

 招聘管理  **/enterprise/jobs**    发布职位、查看简历 

 广告管理  **/enterprise/ads**    投放广告、查看效果 

 报告管理  **/enterprise/reports**  查看报告、定制需求 

 数据看板  **/enterprise/analytics** 曝光数据、用户行为 

 合作案例  **/enterprise/cases**   管理合作案例    

​                            



*管理后台（面向芯师爷运营）*                                                           



​                         

 页面   路由       功能           

 ─────────────────────────────────────────────────── 

 登录   **/admin/login**   邮箱密码登录       

 控制台  **/admin/dashboard** 数据统计、快捷操作    

 企业管理 **/admin/companies** CRUD 企业信息、审核入驻 

 产品管理 **/admin/products**  CRUD 产品信息      

 文章管理 **/admin/articles**  CRUD 文章        

 活动管理 **/admin/events**   CRUD 活动、报名管理   

 招聘管理 **/admin/jobs**    CRUD 职位、简历管理   

 广告管理 **/admin/ads**    广告位配置、投放管理   

 报告管理 **/admin/reports**  报告上传、定价      

 评选管理 **/admin/awards**   评选配置、投票管理    

 用户管理 **/admin/users**   用户列表、角色分配    

 媒体管理 **/admin/media**   媒体渠道管理       

 设置   **/admin/settings**  网站配置、SEO 设置    

​                           



**开发顺序**                                                                    



​                                     

 阶段   任务                         预计时长 

 ─────────────────────────────────────────────────────────────────────── 

 Phase 1 修复项目基础（package.json、docker-compose、prisma） 1 天   

 Phase 2  核心数据模型 + 种子数据                1 天   

 Phase 3  认证系统（企业 + 管理）                2 天   

 Phase 4  企业主页 + 产品展示                  3 天   

 Phase 5  软文/媒体发布系统                   2 天   

 Phase 6  展会/发布会管理                    2 天   

 Phase 7  硬核芯评选系统                    2 天   

 Phase 8  广告投放系统                     2 天   

 Phase 9  数据/洞察服务                     2 天   

 Phase 10 招聘/雇主品牌                     1 天   

 Phase 11 企业后台                       3 天   

 Phase 12 管理后台                       3 天   

 Phase 13 搜索 + 国际化                     2 天   

 Phase 14 测试 + 部署                      3 天   

 **总计**                              **29 天**   

​                                      



**下一步**                                                                     



如果您同意以上方案，我将开始：                                                         



 1 修复 package.json 和 docker-compose.yml 的重复问题                                             

 2 更新 Prisma schema 以包含所有新模型                                                     

 3 创建企业后台页面                                                              

 4 创建评选系统                                                                

 5 创建广告投放系统                                                              

 6 创建数据看板                