# 图片独立收藏与点赞设计

## 目标

为非遗项目图库中的每张图片提供独立收藏和点赞能力。图片级互动与现有项目级收藏、项目级点赞并存，互不覆盖。

## 用户体验

- 每张图库图片的名称旁显示“收藏”和“点赞数量”按钮。
- 点击图片进入全屏预览后，顶部栏显示当前图片自己的收藏和点赞状态。
- 未登录用户可以看到点赞数量；点击收藏或点赞时跳转登录页。
- 登录用户可以独立收藏、取消收藏、点赞和取消点赞每张图片。
- 详情页顶部现有按钮继续代表整个非遗项目。
- 个人中心新增“图片收藏”分组，展示缩略图、图片名称和所属非遗项目，并可进入对应项目详情。

## 图片标识

`HeritageGalleryImage` 增加 `id` 字段。仓储层将现有媒体记录 UUID 传递到页面，不使用图片 URL 作为主标识。这样图片标题或地址调整时，已有互动记录仍可保持稳定。

图片可能来自 `media_assets` 或兼容的旧媒体记录，因此图片互动表保存媒体 UUID 和所属项目 UUID，不对单一媒体表建立外键；项目删除时通过 `heritage_item_id` 级联清理。

## 数据设计

### 图片收藏

沿用 `user_favorites`：

- `target_type` 新增 `heritage_image`。
- `target_id` 保存图片 UUID。
- `heritage_item_id` 保存所属非遗项目 UUID，便于个人中心查询和项目删除清理。
- 延续 `(user_id, target_type, target_id)` 唯一约束与现有 RLS。

### 图片点赞

新增 `heritage_image_likes`：

- `id uuid` 主键。
- `user_id uuid` 关联登录用户，删除用户时级联。
- `heritage_item_id uuid` 关联非遗项目，删除项目时级联。
- `image_id uuid` 保存媒体 UUID。
- `created_at timestamptz`。
- `(user_id, image_id)` 唯一约束。
- 为 `image_id`、`heritage_item_id` 建立索引并启用 RLS。
- 图片点赞表不向客户端开放；读取和写入均经服务器 API 的 service-role 客户端，RLS 不创建 anon 或 authenticated 策略。
- 图片点赞状态由 `get_heritage_image_like_state` 和 `set_heritage_image_like_state` 两个 `SECURITY DEFINER` RPC 提供；撤销 `public`、`anon`、`authenticated` 的执行权限，仅授予 `service_role`。
- RPC 仅承认已发布项目中的图片，并同时兼容 `media_assets` 与 `heritage_media` 两套图片来源；未发布项目与伪造图片归属统一表现为不存在。
- `set_heritage_image_like_state` 在单个数据库事务中完成归属校验、点赞写入或删除及最新计数，避免 mutation 成功但计数读取失败或读到中间状态。

## 接口设计

新增 `/api/engagement/image-likes`：

- `GET ?heritageItemId=&imageId=` 返回 `count`、`liked`、`authenticated`。
- `POST` 接收 `heritageItemId`、`imageId`、`liked`。
- GET 允许游客读取数量；POST 必须携带有效登录令牌。
- GET 只返回聚合点赞数量和当前用户的点赞状态，不直接暴露图片点赞记录。
- 校验两个 UUID，并验证图片确实属于该项目，拒绝伪造关联。
- GET 和 POST 各调用一次对应 RPC；POST 不在路由中拆分 mutation 与 count 查询。
- GET 使用较高读取限额，POST 使用较低写入限额；POST 在解析正文前先限流并检查 Bearer token。
- 无效或过期凭据在 GET 中降级为游客、在 POST 中返回 401；鉴权服务网络或 5xx 故障返回 503。

图片收藏继续使用 Supabase 客户端和现有 RLS，由扩展后的 `FavoriteButton` 写入 `user_favorites`。

## 组件设计

- 新增 `HeritageImageActions`，统一管理某张图片的收藏和点赞状态。
- `CraftMediaGallery` 在每个图片标题行渲染该组件。
- 全屏预览根据 `selectedImage.id` 渲染同一图片的互动组件。
- 图片名称缺失时使用项目名称作为可访问标签。
- 桌面端按钮与名称同行；手机端空间不足时自然换行，不遮挡图片或关闭按钮。

## 状态一致性

同一张图片可能同时出现在标题行和全屏预览。组件通过浏览器自定义事件同步收藏、点赞和数量变化，避免一个位置操作后另一个位置仍显示旧状态。

## 个人中心

- 查询 `user_favorites` 时纳入 `heritage_image`。
- 从现有项目图库数据建立图片 ID 索引。
- 新增“图片收藏”分组卡片，显示缩略图、图片名称、所属项目名称和查看项目入口。
- 收藏总数包含图片收藏。
- 现有离线收藏仍只处理项目收藏，不自动缓存图片收藏，避免扩大离线存储范围。

## 错误处理

- 图片缺少稳定 UUID 时不显示图片级按钮，页面其余内容照常展示。
- 点赞接口失败时回滚乐观状态并显示简短错误。
- 收藏写入失败时保留原状态并记录现有客户端错误日志。
- 已删除或不属于项目的图片返回 `404` 或 `422`，不写入互动数据。

## 数据迁移与部署

- 新增一份幂等 Supabase 迁移，扩展收藏类型并创建图片点赞表和索引、启用 RLS 并清理客户端策略。
- 先在生产 Supabase 执行迁移，再部署前端和 API。
- 不修改现有非遗内容、图片文件、视频、CMS 字段、飞书同步或项目级互动数据。

## 验证范围

- 数据库结构、唯一约束、RLS 和项目级联清理测试。
- 图片点赞 API 的游客读取、登录限制、归属校验、点赞与取消测试。
- 图片收藏的独立状态与项目收藏互不影响。
- 图库标题行和全屏预览状态同步。
- 个人中心图片收藏分组。
- 桌面端和手机端视觉检查。
- 完整测试、类型检查和生产构建。
