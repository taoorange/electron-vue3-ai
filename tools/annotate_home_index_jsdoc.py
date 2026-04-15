#!/usr/bin/env python3
"""一次性为 src/views/home/index.vue 中 script 内的函数插入 JSDoc 注释（若尚未存在）。

模块级分区注释、类型说明与 watch 说明在 .vue 内手写维护；本脚本只处理 function/async function 声明。
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "src/views/home/index.vue"

# 函数名 -> 中文说明（单行摘要）
DESC: dict[str, str] = {
    "workflowStatusLabel": "将 Agent 工作流状态码转为界面展示文案。",
    "hasChineseText": "判断字符串是否包含中日韩统一表意文字。",
    "workflowIdentifierLabel": "将任务/步骤标识符（含 ASR/NOTE 等分段）转为可读中文标签。",
    "workflowTaskDisplayName": "解析任务节点，返回用于 UI 展示的任务名称。",
    "workflowHasPlan": "判断工作流是否已有可展示的计划（任务图、轨迹或主计划信息）。",
    "maybeAutoOpenTaskRail": "首次检测到有效工作流时自动展开右侧 Agent 轨道。",
    "workflowTaskPreview": "取任务图中前若干条用于侧栏预览。",
    "workflowRecentTrace": "取最近若干条执行轨迹（倒序）用于侧栏。",
    "workflowErrorPreview": "取最近若干条错误处理记录用于侧栏。",
    "workflowResourceToVideo": "将后端资源对象规范为 TopicSelectedVideo 结构。",
    "normalizeWorkflowStageLabel": "归一化学习阶段标题（去「第N步」前缀、空白等）便于匹配。",
    "workflowTraceStageVideos": "从分阶段检索类任务的执行轨迹中抽取候选视频列表。",
    "mergeWorkflowStageVideos": "合并多组阶段视频并去重、排序。",
    "workflowLearningPath": "从 final_output.attachments 中解析 learning_path 附件对象。",
    "workflowAllResourceVideos": "汇总 resource_recommendations 中playlist/single/course 并去重排序。",
    "workflowLearningPathSections": "按学习路径阶段组装每步标题、目标与关联视频。",
    "canRenderWorkflowMessageContent": "判断助手消息是否可渲染正文（非 pending/streaming 且有内容）。",
    "messageWorkflowLearningPathSections": "从单条消息的工作流元数据得到学习路径分区数据。",
    "shouldRenderWorkflowLearningPathSections": "是否应在气泡下展示「按学习步骤推荐」区块。",
    "shouldRenderWorkflowResourceCards": "是否应展示「推荐资源」卡片组。",
    "workflowSupplementalResourceCardGroups": "学习路径已展示之外的补充单视频/课程分组。",
    "workflowResourceCardGroups": "将 resource_recommendations 转为按标签分组的视频列表。",
    "workflowDecisionText": "读取主决策说明或理由文案。",
    "workflowCurrentStage": "当前主计划阶段的人类可读标签。",
    "workflowAllTasks": "返回完整任务图数组。",
    "workflowAllTraces": "返回完整执行轨迹数组。",
    "workflowAllErrors": "返回完整错误处理数组。",
    "workflowReplayCacheKey": "拼接 chat/job 与 stateKey 的缓存键。",
    "workflowReplayRecord": "读取已缓存的任务链回放记录。",
    "workflowReplayOpen": "某 scope+key 的回放面板是否展开。",
    "workflowReplayLoading": "某 scope+key 是否正在拉取回放数据。",
    "workflowReplayArtifactsPreview": "从回放记录的 artifacts 生成侧栏摘要键值对。",
    "ensureWorkflowReplay": "按需请求后端拉取 Agent 工作流状态并写入缓存。",
    "toggleMessageWorkflowReplay": "切换某条聊天消息关联的任务链回放展开状态。",
    "toggleCurrentJobWorkflowReplay": "切换当前任务 ID 对应的完整任务链回放。",
    "setSidebarLogViewMode": "设置侧栏日志为普通或详细（管理员）。",
    "formatAdminDetailLogMessage": "将管理端详细日志行格式化为可读文本。",
    "refreshSidebarDetailedLogs": "拉取当前任务的详细推送日志供侧栏展示。",
    "revokeComposerImagePreview": "释放 blob: 预览 URL 避免内存泄漏。",
    "isMessagesNearBottom": "判断消息列表是否接近底部（用于跟随时滚动）。",
    "queueMessagesScrollToBottom": "在下一帧将消息区滚动到底部（可强制）。",
    "beginAssistantReplyAutoFollow": "开始流式回复时开启自动跟随滚动。",
    "endAssistantReplyAutoFollow": "结束流式回复时关闭自动跟随。",
    "handleMessagesScroll": "用户滚动时若离开底部则取消自动跟随。",
    "makeComposerImageLocalId": "生成本地图片条目的唯一 ID。",
    "makeClientRequestId": "生成聊天流式请求的 client_request_id。",
    "cacheSessionMessages": "将会话消息快照写入内存缓存。",
    "summarizeQuote": "将引用内容截断为短摘要展示。",
    "closeQuoteContextMenu": "关闭「引用到输入框」右键菜单。",
    "openQuoteContextMenu": "在指定坐标打开引用上下文菜单并限制在视口内。",
    "handleGlobalPointerDown": "点击页面其他区域时关闭引用菜单。",
    "handleGlobalKeydown": "Escape 关闭引用菜单、图片与视频全屏预览。",
    "openImagePreview": "打开图片全屏预览层。",
    "closeImagePreview": "关闭图片预览。",
    "closeCandidateFullscreen": "关闭候选视频全屏预览层并重置状态。",
    "clearComposerQuote": "清空输入区上方的引用块。",
    "patchComposerImage": "按 localId 合并更新某张待发送图片的状态。",
    "removeComposerImage": "移除指定索引的图片并在已上传时调用删除接口。",
    "openComposerImagePicker": "触发隐藏 file input 选择图片。",
    "uploadComposerFiles": "将所选文件加入待发送列表并逐个上传。",
    "retryComposerImage": "对上传失败或待上传的图片重新走上传流程。",
    "handleComposerFileInputChange": "处理文件选择变更并开始上传。",
    "handleComposerPaste": "在输入区粘贴图片时拦截并上传。",
    "handleMessageContextMenu": "助手 Markdown 气泡右键打开引用菜单。",
    "quoteMarkdownIntoComposer": "将 Markdown 内容设为 composer 引用并聚焦输入框。",
    "handleRailMarkdownContextMenu": "侧栏 Markdown 预览区右键打开引用菜单。",
    "applyContextQuote": "从右键菜单把选中引用写入输入区。",
    "sanitizeEvidenceTagText": "流式/保存前对助手正文做清理（占位，可扩展）。",
    "sanitizeFirstStreamChunk": "对流式首包文本做清理（占位）。",
    "looksLikeMarkdownContent": "启发式判断字符串是否像 Markdown。",
    "syncUserSignatureFromAuth": "根据当前登录用户同步侧栏签名/角色展示文案。",
    "applyChatQuota": "从流式 meta 更新用户聊天额度并刷新签名。",
    "isHttpUrl": "判断是否为 http(s) URL。",
    "isRetryNotice": "判断是否为网络超时重试类提示文案。",
    "extractFirstUrl": "从文本中提取第一个 URL。",
    "pickUrlFromLogRow": "从搜索/任务日志行对象中抽取可展示的链接或重试说明。",
    "refreshActiveSearchTaskLogs": "轮询活跃搜索任务并汇总侧栏用日志行。",
    "startSearchTaskPolling": "启动搜索任务日志定时轮询。",
    "stopSearchTaskPolling": "停止搜索任务日志轮询。",
    "assistantProgressLine": "助手消息上展示的检索进度主行（焦点行或日志末条）。",
    "toggleTaskRail": "手动展开/收起右侧 Agent 轨道。",
    "toggleKnowledgeRetrieval": "开关「知识检索」模式并重置默认检索源。",
    "isActiveJobStatus": "任务是否处于运行/排队/等待选择等活跃状态。",
    "syncCurrentJobRuntime": "拉取当前任务快照并按状态连接或断开 SSE。",
    "scheduleResumeSync": "窗口聚焦等场景节流触发任务与 SSE 恢复同步。",
    "resumeSearchTaskPollingNow": "恢复搜索日志轮询（清除失败暂停）。",
    "handleWindowFocus": "窗口获得焦点时恢复任务与搜索轮询。",
    "handleDocumentVisibilityChange": "页面从隐藏切回可见时恢复任务与搜索轮询。",
    "bootstrapCurrentJob": "进入页面时若已有 currentJobId 则同步一次运行时。",
    "loadChatModels": "拉取可选聊天模型列表并设置默认选中。",
    "handleModelSelect": "下拉选择模型并持久化到 localStorage。",
    "handleNewChatRouteSignal": "响应路由上的 newChat 参数触发新开对话。",
    "startNewConversation": "重置会话、消息与任务相关 UI 状态。",
    "resetCurrentTaskState": "断开 SSE 并清空当前任务 ID 等。",
    "ensureChatSession": "若无 session 则创建并更新路由 query。",
    "loadSessionFromRoute": "按 URL 中的 session 加载历史消息与任务绑定。",
    "appendUiMessage": "向 messages 追加一条 UI 消息并写入会话缓存。",
    "mapAssistantMessage": "将服务端 ChatMessage 映射为 UI 消息并追加。",
    "stopCurrentReply": "调用接口停止当前流式回复。",
    "buildPendingAssistantPlaceholder": "根据是否自动任务与检索模式生成占位提示语。",
    "buildPendingSearchFocus": "根据检索模式生成进度条上的焦点说明。",
    "sendMessage": "发送用户消息、拉起流式助手回复并处理任务/工作流元事件。",
    "refreshCurrentJob": "手动刷新当前任务快照与侧栏日志/笔记。",
    "toggleCurrentJobSse": "切换当前任务的实时 SSE 连接。",
    "openJob": "跳转任务详情页并附带来源会话 query。",
    "jobVideoCandidates": "从任务快照或消息快照读取候选视频列表。",
    "jobQueueBatch": "读取任务结果中的队列批次摘要。",
    "jobQueueCompletedItems": "读取队列批次中已完成子项。",
    "candidateQueueItem": "在队列批次中查找与某候选视频 URL 对应的项。",
    "isTopicTask": "判断任务是否为 topic 类。",
    "isJobTerminal": "判断任务是否已结束（完成或失败）。",
    "shouldRenderCandidatePanel": "是否应在该条助手消息下展示候选视频面板。",
    "candidatePageSize": "候选列表每页条数。",
    "candidateTotalPages": "候选列表总页数。",
    "candidateCurrentPage": "当前页码（超出时钳制）。",
    "setCandidatePage": "设置某任务的候选列表页码。",
    "pagedJobVideoCandidates": "返回当前页的候选视频切片。",
    "videoPreviewKey": "用于内嵌预览状态的唯一键（页面 URL 等）。",
    "activeVideoPreviewKey": "某任务当前展开预览的视频键。",
    "candidateVideoUrls": "解析候选视频的 page/play/raw URL（含 ||| 分隔格式）。",
    "isDouyinCandidate": "根据 platform 或 URL 判断是否为抖音视频。",
    "extractBvid": "从文本中提取 B 站 BV 号。",
    "extractBiliPageNumber": "从 URL 或查询参数解析分 P 序号。",
    "videoPlayableUrl": "抖音返回经后端代理的可播放直链；非抖音返回空走 iframe。",
    "videoEmbedUrl": "B 站返回 player.bilibili.com 嵌入地址。",
    "canPreviewCandidate": "是否支持内嵌或全屏预览。",
    "toggleVideoPreview": "切换任务候选卡片上的内嵌预览展开状态。",
    "handleCandidateCoverClick": "点击封面：可预览则切换预览，否则打开原页。",
    "handleWorkflowResourceCoverClick": "工作流推荐卡片封面：合集则拉选集，否则预览或打开。",
    "openCandidateFullscreen": "在浮层中全屏播放可播或嵌入 URL。",
    "openCandidateFullscreenSource": "从全屏预览打开原视频页。",
    "openVideoUrl": "新窗口打开视频页面链接。",
    "canOpenVideoUrl": "是否存在合法 http(s) 页面链接。",
    "knowledgeHitKey": "知识命中卡片的列表 key。",
    "openKnowledgeHitSource": "新窗口打开知识命中来源链接。",
    "knowledgeHitDisplayTitle": "知识命中标题展示（处理纯统计数字标题）。",
    "downloadKnowledgeNote": "打开知识库 Markdown 下载链接。",
    "videoCoverUrl": "规范化封面 URL（补全协议与 B 站 CDN 前缀）。",
    "looksLikeStatsOnlyTitle": "判断标题是否像纯播放量等统计字符串。",
    "candidateDisplayTitle": "候选/资源标题展示，统计型标题用关键词或序号兜底。",
    "candidateStatItems": "将 stats 字符串拆成标签 chips 展示。",
    "candidateQueueStatusLabel": "队列项状态码转中文。",
    "candidateSelectKey": "候选多选状态在 job 内的唯一键。",
    "isSelectingCandidateVideo": "某候选是否正在提交「总结笔记」请求。",
    "workflowResourceSelectKey": "工作流资源「总结」请求的去重键。",
    "isSelectingWorkflowResource": "某工作流资源是否正在创建总结任务。",
    "looksLikePlaylistTitle": "启发式判断标题是否像合集/系列。",
    "isPlaylistResource": "是否为合集类资源（标记或标题）。",
    "workflowResourceGroupType": "归一化为 playlist / course / single_video。",
    "workflowPlaylistSeriesKey": "某父视频在本地展开选集的状态键。",
    "workflowPlaylistSeriesPanel": "已解析的合集面板数据（含分集）。",
    "workflowPlaylistSeriesItems": "合集分集列表。",
    "isWorkflowPlaylistOpen": "是否已展开选集 UI。",
    "isWorkflowPlaylistLoading": "是否正在请求解析合集。",
    "workflowPlaylistResolveError": "合集解析错误文案。",
    "workflowPlaylistActionLabel": "推送/收起选集按钮文案。",
    "playlistSeriesItemKey": "分集在列表中的 React key 用字符串。",
    "workflowPlaylistEpisodeKey": "单集唯一键（预览键或 url）。",
    "workflowPlaylistActiveEpisode": "当前选中的分集对象。",
    "workflowPlaylistActiveEpisodeKey": "当前选中分集的键。",
    "workflowPlaylistActivePlayableUrl": "当前分集可直播 URL。",
    "workflowPlaylistActiveEmbedUrl": "当前分集嵌入播放 URL。",
    "selectWorkflowPlaylistEpisode": "切换工作流合集内当前播放分集。",
    "initializeWorkflowPlaylistActiveEpisode": "解析合集后默认选中与父视频匹配或首集。",
    "playlistPreviewItems": "聊天内playlist 卡片的分集列表。",
    "playlistPreviewActiveEpisode": "playlist 预览当前选中分集。",
    "playlistPreviewActiveEpisodeKey": "playlist 预览当前分集键。",
    "playlistPreviewActivePlayableUrl": "playlist 预览当前分集直链。",
    "playlistPreviewActiveEmbedUrl": "playlist 预览当前分集嵌入 URL。",
    "selectPlaylistPreviewEpisode": "切换某条消息 playlist 的当前分集。",
    "playlistPreviewTab": "playlist 侧栏当前标签：选集/笔记。",
    "playlistPreviewSidebarOpen": "playlist 侧栏是否展开。",
    "setPlaylistPreviewSidebarOpen": "设置某条消息的 playlist 侧栏展开状态。",
    "togglePlaylistPreviewSidebar": "切换 playlist 侧栏展开。",
    "setPlaylistPreviewTab": "切换 tab 并展开侧栏、清理笔记阅读态。",
    "playlistPreviewSelectedMap": "分集多选勾选状态映射。",
    "isPlaylistPreviewEpisodeSelected": "某分集是否被勾选。",
    "togglePlaylistPreviewEpisodeSelected": "切换某分集勾选状态。",
    "clearPlaylistPreviewEpisodeSelection": "清空该消息的分集勾选。",
    "selectedPlaylistPreviewEpisodes": "已勾选的分集数组。",
    "selectedPlaylistPreviewEpisodeCount": "已勾选分集数量。",
    "playlistPreviewAllSelected": "是否已全选所有分集。",
    "toggleAllPlaylistPreviewEpisodes": "全选或清空分集勾选。",
    "playlistPreviewNotes": "该消息下已缓存的分集笔记列表（排序后）。",
    "playlistPreviewNoteCount": "笔记条数。",
    "playlistPreviewReadyNoteCount": "已生成完成的笔记条数。",
    "playlistPreviewNoteByEpisode": "按分集键查找笔记项。",
    "playlistPreviewEpisodeNoteStatus": "某分集笔记生成状态。",
    "playlistPreviewEpisodeNoteActionLabel": "分集「总结/查看」按钮文案。",
    "playlistPreviewEpisodeNoteStatusLabel": "分集笔记状态角标文案。",
    "playlistPreviewViewingNote": "当前正在查看的笔记项。",
    "openPlaylistPreviewNote": "打开某条已就绪笔记进入 Markdown 阅读态。",
    "backToPlaylistPreviewNoteList": "从笔记阅读返回笔记列表。",
    "upsertPlaylistPreviewNote": "插入或更新本地分集笔记缓存。",
    "removePlaylistPreviewNoteJobTracking": "子任务完成后清理 job 与解析中标记。",
    "formatPlaylistPreviewNoteTime": "格式化笔记时间用于卡片展示。",
    "mapPlaylistEpisodeNoteApiItem": "将接口返回的分集笔记映射为 UI 结构。",
    "hydratePlaylistPreviewNotes": "从服务端拉取某条消息的 playlist 笔记并填充状态。",
    "persistPlaylistPreviewEpisodeNoteBinding": "将分集笔记绑定持久化到后端。",
    "finalizePlaylistPreviewNoteJob": "子任务完成后拉取笔记正文并更新 UI 与持久化。",
    "markPlaylistPreviewNoteFailed": "子任务失败时标记笔记失败并同步后端。",
    "handlePlaylistPreviewEpisodeNoteAction": "单集总结：已就绪则打开，否则创建任务并跟踪。",
    "isPlaylistPreviewBatchSummarizing": "是否正在批量触发多集总结。",
    "summarizePlaylistPreviewEpisodes": "对指定分集批量启动总结（跳过已有/进行中）。",
    "summarizeSelectedPlaylistPreviewEpisodes": "总结当前勾选的分集。",
    "summarizeAllPlaylistPreviewEpisodes": "一键对全部分集启动总结。",
    "appendPlaylistPreviewMessage": "本地追加一条「已推送选集」助手消息。",
    "normalizeWorkflowPlaylistItems": "将接口 PlaylistSeriesItem 规范为 TopicSelectedVideo。",
    "playlistPreviewCardFromMeta": "从历史消息 meta.playlist_preview 恢复卡片数据。",
    "appendPersistedPlaylistPreviewMessage": "服务端保存后追加带 messageId 的 playlist 消息。",
    "pushWorkflowPlaylistSeries": "解析合集 URL、缓存分集并可写入会话与聊天消息。",
    "selectedCandidateMap": "某任务下候选多选状态。",
    "isCandidateSelected": "某候选是否被勾选加入队列。",
    "toggleCandidateSelected": "切换候选勾选状态。",
    "clearSelectedCandidates": "清空某任务的候选勾选。",
    "selectAllCandidates": "全选当前任务全部候选。",
    "selectedCandidates": "返回已勾选的候选视频数组。",
    "selectedCandidateCount": "已选候选数量。",
    "isBatchSelecting": "是否正在提交批量加入队列请求。",
    "applyQueueBatchToJobSnapshot": "将队列批次写回 jobsStore 中任务快照。",
    "selectCandidateVideosBatch": "批量提交选中候选进入处理队列并刷新任务。",
    "selectCandidateVideo": "单选候选视频创建子任务并更新 UI。",
    "startWorkflowResourceSummaryTask": "为工作流/playlist 中的视频 URL 创建总结 Job。",
    "summarizeWorkflowResource": "「总结笔记」入口，创建总结任务。",
    "clearInput": "清空输入框、引用与图片并释放 blob。",
    "loadCurrentJobNoteAssets": "任务完成后拉取笔记链接与正文并尝试同步到聊天。",
    "hasJobNoteMessageInCurrentChat": "当前会话是否已有某 job 的笔记消息。",
    "syncCurrentJobNoteIntoChatIfNeeded": "将当前任务 Markdown 以助手消息形式写入会话（去重）。",
    "addChildNoteToChat": "从侧栏已完成子任务拉取笔记并插入当前会话。",
    "childNoteDownloadUrl": "子任务笔记下载 URL。",
    "handleEnterSend": "输入框 Enter 发送（排除 IME 与 Shift+Enter）。",
    "onInputCompositionStart": "输入法组合开始，阻止误触发发送。",
    "onInputCompositionEnd": "输入法组合结束。",
    "tagType": "任务状态映射为 Naive UI Tag 的 type。",
    "statusLabel": "任务/工作流状态码转简短中文。",
    "humanizeStage": "任务 pipeline 阶段码转侧栏可读说明。",
    "humanizeDetail": "任务详情中的英文阶段 token 替换为中文。",
    "humanizeSidebarLog": "侧栏原始日志行润色为简短中文描述。",
}


def main() -> None:
    raw = TARGET.read_text(encoding="utf-8")
    m = re.search(r"(<script setup[^>]*>)([\s\S]*)(</script>)", raw)
    if not m:
        raise SystemExit("Could not find <script setup> block")

    prefix, script, suffix = m.group(1), m.group(2), m.group(3)

    lines = script.splitlines(keepends=True)
    out: list[str] = []
    i = 0
    func_pat = re.compile(r"^(\s*)(async\s+)?function\s+(\w+)\s*\(")

    while i < len(lines):
        line = lines[i]
        match = func_pat.match(line)
        if match:
            indent = match.group(1)
            name = match.group(3)
            # 若上一非空行已是 JSDoc 块（以 */ 结尾或含 /**），跳过避免重复插入
            j = len(out) - 1
            while j >= 0 and out[j].strip() == "":
                j -= 1
            prev_nonempty = out[j] if j >= 0 else ""
            if re.search(r"/\*\*", prev_nonempty) or re.search(r"\*/\s*$", prev_nonempty):
                out.append(line)
                i += 1
                continue

            desc = DESC.get(name)
            if not desc:
                desc = f"组件内方法「{name}」。"

            out.append(f"{indent}/**\n")
            out.append(f"{indent} * {desc}\n")
            out.append(f"{indent} */\n")
        out.append(line)
        i += 1

    new_script = "".join(out)
    new_raw = raw.replace(m.group(0), prefix + new_script + suffix, 1)
    TARGET.write_text(new_raw, encoding="utf-8")
    print(f"Annotated functions in {TARGET.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
