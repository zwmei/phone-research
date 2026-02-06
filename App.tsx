import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, User, LayoutDashboard, PlusCircle, Users, Smartphone, 
  FileText, Settings, Menu, Save, Play, Download, 
  Briefcase, Baby, Monitor, Activity, Video, RefreshCw, 
  ChevronRight, GripVertical, CheckCircle, XCircle, Search,
  MousePointer2, Shuffle, Power, AlertTriangle, ChevronDown, ChevronUp, Share2, FileDown, Check,
  Edit2, Trash2, X, Plus, Layers, Battery, Maximize2, ChevronLeft, Calendar, Clock, ArrowRight, List,
  BrainCircuit, MessageSquare, GitMerge, Fingerprint, Zap
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { storage } from './services/storage';
import { Persona, Device, FlowNode, TaskDraft, LogEntry, Scenario, QueuedTask, QADialogue, TaskExecutionStep, TaskExecutionPhase, DeviceExecutionLog, TaskStep, SubTask, UsabilityScore, SatisfactionScore, ExperienceIssue, CompetitorComparison, HighlightDiscovery } from './types';

// --- Constants & Mock Data ---

const INITIAL_PERSONAS: Persona[] = [
  { 
    id: 'elderly', 
    name: '老年用户', 
    icon: '👴', 
    description: '年龄 65+，操作谨慎，需要大字体和清晰的引导', 
    features: ['慢速操作', '大字体需求', '易迷失'], 
    age: '65+', 
    occupation: '退休', 
    gender: 'other',
    visionStatus: 'moderate',
    operationSpeed: 'slow',
    missTouchRate: 35,
    gesturePreference: ['单指点击', '简单滑动'],
    patience: 65,
    newFeatureAcceptance: 'low'
  },
  { 
    id: 'geek', 
    name: '极客用户', 
    icon: '💻', 
    description: '技术敏感，喜欢探索新功能和深度定制', 
    features: ['高频操作', '深层设置', '复杂手势'], 
    age: '20-35', 
    occupation: 'IT从业者', 
    gender: 'other',
    visionStatus: 'normal',
    operationSpeed: 'fast',
    missTouchRate: 10,
    gesturePreference: ['多指手势', '快速滑动', '长按', '双击'],
    patience: 40,
    newFeatureAcceptance: 'high'
  },
  { 
    id: 'child', 
    name: '儿童用户', 
    icon: '👶', 
    description: '好奇心强，操作随意性大，容易误触', 
    features: ['乱序点击', '长时间停留', '重复操作'], 
    age: '5-12', 
    occupation: '学生', 
    gender: 'other',
    visionStatus: 'normal',
    operationSpeed: 'medium',
    missTouchRate: 75,
    gesturePreference: ['随机点击', '拖拽'],
    patience: 30,
    newFeatureAcceptance: 'high'
  },
  { 
    id: 'business', 
    name: '商务人士', 
    icon: '💼', 
    description: '追求效率，目标明确，对卡顿和错误容忍度低', 
    features: ['目标明确', '多任务切换', '敏感与隐私'], 
    age: '30-50', 
    occupation: '企业管理', 
    gender: 'other',
    visionStatus: 'normal',
    operationSpeed: 'fast',
    missTouchRate: 15,
    gesturePreference: ['快速点击', '多任务切换手势'],
    patience: 35,
    newFeatureAcceptance: 'medium'
  },
];

const INITIAL_SCENARIOS: Scenario[] = [
  { 
    id: 'shopping', 
    name: '网购下单', 
    icon: '🛍️', 
    description: '模拟用户完整的网购流程，从商品搜索到支付完成', 
    complexity: 'Medium',
    category: 'app',
    estimatedDuration: 180,
    steps: ['打开电商App', '搜索目标商品', '浏览商品详情', '加入购物车', '进入购物车', '选择收货地址', '提交订单', '选择支付方式', '完成支付'],
    preconditions: ['已安装电商App', '账号已登录', '已绑定支付方式'],
    expectedResult: '成功完成商品购买，收到订单确认通知',
    checkpoints: ['搜索结果加载速度', '图片加载流畅度', '支付流程无卡顿', '订单确认页面展示正确'],
    networkRequirement: 'any',
    priority: 'high',
    deviceTypes: ['手机', '平板']
  },
  { 
    id: 'gaming', 
    name: '重度游戏', 
    icon: '🎮', 
    description: '测试设备在高性能游戏场景下的稳定性和流畅度', 
    complexity: 'High',
    category: 'entertainment',
    estimatedDuration: 1800,
    steps: ['启动大型3D游戏', '进入游戏主界面', '开始一局游戏', '持续运行30分钟', '切换到后台', '返回游戏', '检查游戏状态'],
    preconditions: ['已安装游戏', '设备电量充足', '游戏已更新至最新版本'],
    expectedResult: '游戏全程流畅运行，帧率稳定，后台切换正常',
    checkpoints: ['帧率保持60fps以上', '发热控制在合理范围', '电量消耗正常', '后台恢复无异常'],
    networkRequirement: 'wifi',
    priority: 'high',
    deviceTypes: ['手机', '平板']
  },
  { 
    id: 'social', 
    name: '社交分享', 
    icon: '💬', 
    description: '测试拍照、编辑、发布动态的完整社交流程', 
    complexity: 'Low',
    category: 'communication',
    estimatedDuration: 90,
    steps: ['打开相机', '拍摄照片', '打开社交App', '选择照片', '添加滤镜', '编辑文案', '添加标签', '发布动态'],
    preconditions: ['已授权相机权限', '已登录社交账号', '网络连接正常'],
    expectedResult: '动态成功发布，好友可见',
    checkpoints: ['相机启动速度', '照片处理流畅度', '发布成功率', '动态展示正常'],
    networkRequirement: 'any',
    priority: 'medium',
    deviceTypes: ['手机']
  },
  { 
    id: 'nav', 
    name: '驾车导航', 
    icon: '🚗', 
    description: '测试地图导航功能的准确性和语音交互体验', 
    complexity: 'Medium',
    category: 'app',
    estimatedDuration: 120,
    steps: ['打开地图App', '授权定位权限', '输入目的地', '选择驾车模式', '开始导航', '模拟行驶', '接收语音播报', '到达目的地'],
    preconditions: ['已安装地图App', 'GPS定位已开启', '网络连接正常'],
    expectedResult: '导航路线准确，语音播报清晰及时',
    checkpoints: ['定位精度', '路线规划合理性', '语音播报延迟', '界面流畅度'],
    networkRequirement: 'any',
    priority: 'high',
    deviceTypes: ['手机', '智能手表']
  },
  { 
    id: 'call', 
    name: '拨打电话', 
    icon: '📞', 
    description: '测试基础通话功能的可用性和通话质量', 
    complexity: 'Low',
    category: 'communication',
    estimatedDuration: 60,
    steps: ['打开拨号盘', '输入电话号码', '点击拨打', '等待接通', '保持通话30秒', '挂断电话'],
    preconditions: ['SIM卡已插入', '信号正常', '有充足话费或套餐'],
    expectedResult: '通话成功建立，音质清晰，无异常断线',
    checkpoints: ['拨号响应速度', '接通时间', '通话音质', '信号稳定性'],
    networkRequirement: 'mobile',
    priority: 'critical',
    deviceTypes: ['手机']
  },
];

const DEVICES: Device[] = [
  { id: 'd1', model: 'ZTE Axon 50 Ultra', version: 'Android 14', isOnline: true, battery: 85 },
  { id: 'd2', model: 'ZTE Axon 50 Ultra', version: 'Android 14', isOnline: true, battery: 78 },
  { id: 'd3', model: 'ZTE Axon 50 Ultra', version: 'Android 14', isOnline: true, battery: 92 },
  { id: 'd4', model: 'ZTE Nubia Z60', version: 'Android 14', isOnline: true, battery: 42 },
  { id: 'd5', model: 'ZTE Nubia Z60', version: 'Android 14', isOnline: true, battery: 67 },
  { id: 'd6', model: 'ZTE Nubia Z60', version: 'Android 14', isOnline: true, battery: 88 },
  { id: 'd7', model: 'ZTE Blade V50', version: 'Android 13', isOnline: false, battery: 0 },
  { id: 'd8', model: 'ZTE Blade V50', version: 'Android 13', isOnline: true, battery: 55 },
  { id: 'd9', model: 'ZTE Axon 40 Pro', version: 'Android 13', isOnline: true, battery: 90 },
  { id: 'd10', model: 'ZTE Axon 40 Pro', version: 'Android 13', isOnline: true, battery: 72 },
  { id: 'd11', model: 'ZTE Axon 40 Pro', version: 'Android 13', isOnline: true, battery: 81 },
  { id: 'd12', model: 'Z80 Ultra', version: 'Android 15', isOnline: true, battery: 98 },
  { id: 'd13', model: 'Z80 Ultra', version: 'Android 15', isOnline: true, battery: 85 },
  { id: 'd14', model: 'Z80 Ultra', version: 'Android 15', isOnline: true, battery: 91 },
  { id: 'd15', model: 'Z80 Ultra', version: 'Android 15', isOnline: true, battery: 76 },
  { id: 'd16', model: 'nubia Air', version: 'Android 14', isOnline: true, battery: 65 },
  { id: 'd17', model: 'nubia Air', version: 'Android 14', isOnline: true, battery: 82 },
  { id: 'd18', model: 'nubia Air', version: 'Android 14', isOnline: true, battery: 58 },
  { id: 'd19', model: 'Z70 Ultra', version: 'Android 15', isOnline: true, battery: 88 },
  { id: 'd20', model: 'Z70 Ultra', version: 'Android 15', isOnline: true, battery: 94 },
  { id: 'd21', model: 'Z70 Ultra', version: 'Android 15', isOnline: true, battery: 71 },
];

const MOCK_LOGS: LogEntry[] = [
  { id: 1, time: '10:00:01', level: 'info', message: '任务初始化...' },
  { id: 2, time: '10:00:02', level: 'info', message: '连接设备: ZTE Axon 50 Ultra' },
  { id: 3, time: '10:00:03', level: 'success', message: '设备连接成功' },
  { id: 4, time: '10:00:05', level: 'info', message: '加载用户画像: 极客用户' },
];

const RADAR_DATA = [
  { subject: '任务成功率', A: 92, fullMark: 100 },
  { subject: '操作效率', A: 85, fullMark: 100 },
  { subject: '用户满意度', A: 82, fullMark: 100 },
  { subject: '路径清晰度', A: 88, fullMark: 100 },
  { subject: '操作准确率', A: 92, fullMark: 100 },
];

const PERSONA_STATS = [
  { id: 'elderly', name: '老年用户', icon: '👴', successRate: 68, time: '4分12秒', steps: 8, sat: 65, status: 'warning' },
  { id: 'geek', name: '极客用户', icon: '💻', successRate: 98, time: '1分45秒', steps: 5, sat: 92, status: 'success' },
  { id: 'child', name: '儿童用户', icon: '👶', successRate: 85, time: '3分20秒', steps: 7, sat: 78, status: 'neutral' },
  { id: 'business', name: '商务人士', icon: '💼', successRate: 94, time: '2分05秒', steps: 5, sat: 88, status: 'success' },
];

const COMPLETED_TASKS = [
  { id: 't1', name: '开启省电模式测试', time: '2026-01-30 15:30:25', deviceCount: 50, successCount: 46, status: 'completed', score: 87.3, rating: 'A-', duration: '2分35秒' },
  { id: 't2', name: '应用启动速度压力测试', time: '2026-01-29 10:15:00', deviceCount: 32, successCount: 32, status: 'completed', score: 94.5, rating: 'A+', duration: '1分12秒' },
  { id: 't3', name: '弱网环境下视频通话测试', time: '2026-01-28 14:20:10', deviceCount: 20, successCount: 15, status: 'warning', score: 72.1, rating: 'B', duration: '5分40秒' },
  { id: 't4', name: '多任务后台切换稳定性', time: '2026-01-27 09:45:33', deviceCount: 45, successCount: 42, status: 'completed', score: 89.0, rating: 'A', duration: '3分05秒' },
];

// 可用性评分数据
const MOCK_USABILITY_SCORE: UsabilityScore = {
  taskSuccessRate: 92,
  operationEfficiency: 78,
  lostDegree: 35, // 越低越好
  errorRate: 18, // 越低越好
  overall: 82
};

// 满意度评分数据
const MOCK_SATISFACTION_SCORE: SatisfactionScore = {
  npsScore: 45, // NPS: -100 to 100
  emotionalPleasure: 68,
  cognitiveLoad: 42, // 越低越好
  frustrationLevel: 38, // 越低越好
  overall: 72
};

// 体验卡点数据
const MOCK_EXPERIENCE_ISSUES: ExperienceIssue[] = [
  {
    id: 'issue1',
    title: '省电模式入口层级过深',
    severity: 'high',
    category: 'entry',
    description: '用户需要点击"设置 > 电池 > 高级设置"才能找到省电模式开关，路径过长导致发现性差。',
    location: '设置 > 电池 > 高级设置 > 省电模式',
    videoClip: '00:08 - 00:20',
    impactedUsers: ['老年用户', '新手用户'],
    recommendation: '建议将省电模式提升至"电池"一级菜单，或在设置首页添加快捷入口'
  },
  {
    id: 'issue2',
    title: '"高级设置"命名产生心理门槛',
    severity: 'medium',
    category: 'wording',
    description: '"高级"二字暗示复杂性，导致用户犹豫是否进入该菜单，产生心理负担。',
    location: '设置 > 电池 > 高级设置',
    videoClip: '00:15 - 00:18',
    impactedUsers: ['老年用户', '商务人士'],
    recommendation: '改名为"更多设置"或"其他选项"，降低心理门槛'
  },
  {
    id: 'issue3',
    title: '设置项列表过长缺乏搜索功能',
    severity: 'medium',
    category: 'logic',
    description: '设置页面包含30+项，用户需要逐项浏览才能找到目标功能，效率低下。',
    location: '设置主页',
    videoClip: '00:05 - 00:12',
    impactedUsers: ['所有用户'],
    recommendation: '增加搜索框，支持关键词快速定位设置项'
  },
  {
    id: 'issue4',
    title: '电池图标与文字对比度不足',
    severity: 'low',
    category: 'visual',
    description: '在强光环境下，电池选项的图标颜色与背景对比度较低，不易识别。',
    location: '设置主页 > 电池选项',
    impactedUsers: ['老年用户', '视力障碍用户'],
    recommendation: '提高图标对比度，或增加文字标签尺寸'
  }
];

// 体验亮点发现数据
const MOCK_HIGHLIGHTS: HighlightDiscovery[] = [
  {
    id: 'highlight1',
    title: '电池状态可视化设计出色',
    category: 'design',
    description: '电池页面使用直观的环形进度条和剩余时间预估，用户无需复杂计算即可了解设备续航状态。图标设计清晰，不同电量状态用渐变色区分，视觉效果优秀。',
    impact: 'high',
    userGroups: ['所有用户'],
    evidence: '92%的测试用户表示能快速理解电池状态，平均查看时间仅1.2秒'
  },
  {
    id: 'highlight2',
    title: '一键返回桌面手势流畅',
    category: 'interaction',
    description: '底部上滑返回桌面的手势响应迅速，无延迟感，且支持中途取消操作。手势轨迹跟手性好，即使是老年用户也能轻松掌握。',
    impact: 'high',
    userGroups: ['老年用户', '新手用户'],
    evidence: '手势识别准确率98.5%，平均响应时间80ms，老年用户成功率达95%'
  },
  {
    id: 'highlight3',
    title: '应用后台保活机制合理',
    category: 'performance',
    description: '测试过程中发现系统对常用应用的后台保活策略合理，切换回应用时无需重新加载，显著提升多任务效率。',
    impact: 'medium',
    userGroups: ['极客用户', '商务人士'],
    evidence: '常用应用后台保活率达85%，恢复速度比行业平均快40%'
  },
  {
    id: 'highlight4',
    title: '通知权限引导设计人性化',
    category: 'accessibility',
    description: '首次启动应用时的通知权限请求采用情景化引导，清晰说明权限用途，而非简单弹窗。拒绝后也不会反复骚扰用户，体验友好。',
    impact: 'medium',
    userGroups: ['所有用户'],
    evidence: '权限授予率达78%，高于行业平均15个百分点；用户反馈满意度91%'
  },
  {
    id: 'highlight5',
    title: '系统级深色模式适配完善',
    category: 'innovation',
    description: '深色模式下的颜色对比度控制得当，既保护眼睛又不失美观。系统级应用全部适配深色模式，切换流畅无闪烁。',
    impact: 'high',
    userGroups: ['极客用户', '重度使用者'],
    evidence: '深色模式使用率62%，眼部疲劳度降低35%（长时间使用场景）'
  }
];

// 竞品对比数据
const MOCK_COMPETITOR_DATA: CompetitorComparison[] = [
  {
    competitorName: '华为 Mate 60 Pro',
    competitorModel: 'HarmonyOS 4.0',
    metrics: {
      taskCompletionTime: 18,
      stepCount: 4,
      successRate: 98,
      userSatisfaction: 88
    },
    advantage: [],
    disadvantage: ['完成任务比竞品多点3次', '完成时间慢约12秒', '用户满意度低6分']
  },
  {
    competitorName: '小米 14 Pro',
    competitorModel: 'MIUI 15',
    metrics: {
      taskCompletionTime: 22,
      stepCount: 5,
      successRate: 95,
      userSatisfaction: 85
    },
    advantage: ['完成时间快约1秒', '操作步骤少1步'],
    disadvantage: ['成功率略低3%', '用户满意度低3分']
  },
  {
    competitorName: 'OPPO Find X7',
    competitorModel: 'ColorOS 14',
    metrics: {
      taskCompletionTime: 25,
      stepCount: 6,
      successRate: 90,
      userSatisfaction: 80
    },
    advantage: ['完成时间快约4秒', '成功率高2%', '用户满意度高8分'],
    disadvantage: []
  }
];

// Mock Task Execution Steps with QA Dialogues
const MOCK_EXECUTION_STEPS: TaskExecutionStep[] = [
  {
    id: 'step1',
    stepNumber: 1,
    stepName: '打开设置应用',
    status: 'completed',
    duration: 2300,
    userAction: '点击桌面"设置"图标',
    hesitation: false
  },
  {
    id: 'step2',
    stepNumber: 2,
    stepName: '查找电池选项',
    status: 'completed',
    duration: 8500,
    userAction: '向下滚动设置列表',
    hesitation: true,
    qaDialogues: [
      {
        id: 'qa1',
        timestamp: '10:05:12',
        interviewer: '我注意到您刚才在设置页面停留了较长时间，是在寻找什么吗？',
        userResponse: '是的，我在找"电池"选项，但是设置项太多了，需要仔细看。',
        context: '用户在设置页面停留8.5秒，多次上下滚动',
        sentiment: 'neutral'
      }
    ]
  },
  {
    id: 'step3',
    stepNumber: 3,
    stepName: '进入电池设置',
    status: 'completed',
    duration: 1800,
    userAction: '点击"电池"菜单项',
    hesitation: false
  },
  {
    id: 'step4',
    stepNumber: 4,
    stepName: '展开高级选项',
    status: 'completed',
    duration: 6200,
    userAction: '点击"高级设置"折叠项',
    hesitation: true,
    qaDialogues: [
      {
        id: 'qa2',
        timestamp: '10:05:20',
        interviewer: '您刚才在"高级设置"这里犹豫了一下，是什么原因呢？',
        userResponse: '我不确定省电模式是不是在高级设置里，担心点错了。而且"高级"两个字让我觉得可能很复杂。',
        context: '用户在高级设置按钮上悬停3秒后才点击',
        sentiment: 'negative'
      }
    ]
  },
  {
    id: 'step5',
    stepNumber: 5,
    stepName: '开启省电模式',
    status: 'completed',
    duration: 2100,
    userAction: '切换省电模式开关',
    hesitation: false,
    qaDialogues: [
      {
        id: 'qa3',
        timestamp: '10:05:24',
        interviewer: '成功开启了省电模式，整个过程感觉如何？',
        userResponse: '还行吧，但是步骤有点多，如果能在第一屏就看到省电模式就更好了。',
        context: '任务完成后的总体反馈',
        sentiment: 'neutral'
      }
    ]
  }
];

// 四阶段执行时间轴
const MOCK_EXECUTION_PHASES: TaskExecutionPhase[] = [
  {
    id: 'phase1',
    phaseNumber: 1,
    phaseName: '任务理解与规划',
    description: '解析测试需求，自动配置用户画像与场景环境，生成详细的任务执行方案',
    status: 'completed',
    startTime: '10:00:00',
    endTime: '10:00:15',
    duration: 15000
  },
  {
    id: 'phase2',
    phaseNumber: 2,
    phaseName: 'AI用户体验真机',
    description: '将任务拆解分发，调度AI用户操作真实设备，还原人类行为进行业务测试',
    status: 'completed',
    startTime: '10:00:15',
    endTime: '10:05:30',
    duration: 315000,
    deviceLogs: [
      {
        deviceId: 'device-001',
        deviceModel: 'iPhone 14 Pro',
        personaId: 'elderly',
        personaName: '老年用户',
        personaIcon: '👴',
        status: 'success',
        startTime: '10:00:15',
        endTime: '10:04:45',
        duration: 270000,
        screenshot: '📱',
        taskSteps: [
          {
            id: 'task1-device001',
            taskNumber: 1,
            taskName: '启动与登录',
            status: 'completed',
            totalDuration: 45000,
            subTasks: [
              { 
                id: 'st1-1', 
                name: '解锁设备', 
                description: 'AI用户拿起iPhone → 屏幕自动亮起显示锁屏界面 → 系统启动面容识别 → 面容识别成功 → 屏幕显示解锁动画 → 设备解锁进入主屏幕',
                status: 'completed', 
                duration: 3000 
              },
              { 
                id: 'st1-2', 
                name: '确认主屏幕状态', 
                description: '观察主屏幕布局 → 确认所有应用图标正常显示 → 状态栏显示时间和信号 → 准备寻找"设置"应用',
                status: 'completed', 
                duration: 1000 
              }
            ]
          },
          {
            id: 'task2-device001',
            taskNumber: 2,
            taskName: '进入设置应用',
            status: 'running',
            totalDuration: 85000,
            subTasks: [
              { 
                id: 'st2-1', 
                name: '寻找设置图标', 
                description: '开始扫描主屏幕 → 从上到下逐行查看应用图标 → 在第二行发现灰色齿轮图标 → 识别为"设置"应用 → 准备点击',
                status: 'completed', 
                duration: 8000 
              },
              { 
                id: 'st2-2', 
                name: '点击设置图标', 
                description: '手指移动到"设置"图标位置 → 轻点图标 → 图标出现点击高亮效果 → 屏幕开始切换动画',
                status: 'completed', 
                duration: 2000 
              },
              { 
                id: 'st2-3', 
                name: '等待设置界面加载', 
                description: '屏幕显示切换动画 → 设置界面从右侧滑入 → 顶部显示"设置"标题 → 菜单列表完全显示 → 确认界面加载完成',
                status: 'completed', 
                duration: 3000 
              }
            ]
          },
          {
            id: 'task3-device001',
            taskNumber: 3,
            taskName: '查找电池选项',
            status: 'pending',
            totalDuration: 95000,
            subTasks: [
              { 
                id: 'st3-1', 
                name: '浏览设置菜单', 
                description: '查看设置菜单顶部选项 → 看到"Apple ID"、"飞行模式"、"Wi-Fi"等选项 → 判断电池选项可能在下方 → 决定向下滚动查找',
                status: 'completed', 
                duration: 12000 
              },
              { 
                id: 'st3-2', 
                name: '向下滚动', 
                description: '手指在屏幕中部向上滑动 → 菜单列表向下滚动 → 看到"通知"、"声音与触感"等选项 → 继续向下滚动 → 看到更多系统选项',
                status: 'completed', 
                duration: 8000 
              },
              { 
                id: 'st3-3', 
                name: '识别电池选项', 
                description: '继续浏览菜单列表 → 发现带有电池图标和"电池"文字的选项 → 确认这是要找的目标 → 准备点击',
                status: 'completed', 
                duration: 5000 
              },
              { 
                id: 'st3-4', 
                name: '进入电池设置', 
                description: '点击"电池"选项 → 选项出现高亮效果 → 屏幕开始切换 → 电池设置页面从右侧滑入 → 看到电池使用情况和相关设置',
                status: 'completed', 
                duration: 2000 
              }
            ]
          },
          {
            id: 'task4-device001',
            taskNumber: 4,
            taskName: '开启省电模式',
            status: 'pending',
            totalDuration: 45000,
            subTasks: [
              { 
                id: 'st4-1', 
                name: '寻找低电量模式开关', 
                description: '查看电池设置页面 → 在顶部看到电池电量图表 → 向下浏览 → 发现"低电量模式"选项和开关 → 注意到开关当前处于关闭状态（灰色）',
                status: 'completed', 
                duration: 6000 
              },
              { 
                id: 'st4-2', 
                name: '点击开关', 
                description: '手指移动到"低电量模式"开关位置 → 轻点开关 → 开关开始动画切换 → 颜色从灰色变为绿色',
                status: 'completed', 
                duration: 2000 
              },
              { 
                id: 'st4-3', 
                name: '确认开关状态', 
                description: '观察开关动画完成 → 开关显示为开启状态（绿色） → "低电量模式"文字下方显示"已开启"提示 → 确认设置成功',
                status: 'completed', 
                duration: 3000 
              },
              { 
                id: 'st4-4', 
                name: '验证系统状态', 
                description: '查看屏幕顶部状态栏 → 电池图标变为黄色 → 确认低电量模式已生效 → 任务完成',
                status: 'completed', 
                duration: 4000 
              }
            ]
          }
        ],
        programs: [
          'SpringBoard（桌面启动器）',
          'Preferences.app（系统设置）',
          'BatteryCenter.framework（电池管理）'
        ],
        errorCount: 0,
        warningCount: 1,
        qaDialogues: [
          {
            id: 'qa1-elderly',
            timestamp: '10:05:35',
            interviewer: '您好，请问在完成"开启省电模式"这个任务时，第一步是如何操作的？',
            userResponse: '我点击了桌面上的"设置"图标，但是图标比较小，我试了两次才点中。',
            context: '老年用户完成任务后的流程回顾',
            sentiment: 'neutral'
          },
          {
            id: 'qa2-elderly',
            timestamp: '10:06:15',
            interviewer: '在查找省电模式选项时，您遇到了什么困难吗？',
            userResponse: '有困难。设置里的字比较小，我需要很仔细地看。而且选项太多了，我滚动了好几次才找到"电池"。',
            context: '关于界面可读性的反馈',
            sentiment: 'negative'
          }
        ]
      },
      {
        deviceId: 'device-002',
        deviceModel: 'Samsung Galaxy S23',
        personaId: 'young',
        personaName: '年轻用户',
        personaIcon: '👨',
        status: 'success',
        startTime: '10:00:15',
        endTime: '10:05:20',
        duration: 305000,
        screenshot: '📱',
        taskSteps: [
          {
            id: 'task1-device002',
            taskNumber: 1,
            taskName: '启动与登录',
            status: 'completed',
            totalDuration: 35000,
            subTasks: [
              { id: 'st1-1', name: '滑动解锁屏幕', status: 'completed', duration: 2500 },
              { id: 'st1-2', name: '返回主屏幕', status: 'completed', duration: 1000 }
            ]
          },
          {
            id: 'task2-device002',
            taskNumber: 2,
            taskName: '进入设置应用',
            status: 'running',
            totalDuration: 75000,
            subTasks: [
              { id: 'st2-1', name: '打开应用抽屉', status: 'completed', duration: 2000 },
              { id: 'st2-2', name: '查找"设置"应用', status: 'completed', duration: 3000 },
              { id: 'st2-3', name: '点击"设置"图标', status: 'completed', duration: 1500 },
              { id: 'st2-4', name: '等待界面渲染', status: 'completed', duration: 2500 }
            ]
          },
          {
            id: 'task3-device002',
            taskNumber: 3,
            taskName: '导航至电池设置',
            status: 'pending',
            totalDuration: 125000,
            subTasks: [
              { id: 'st3-1', name: '向下滚动查找', status: 'completed', duration: 10000 },
              { id: 'st3-2', name: '点击"电池和设备维护"', status: 'completed', duration: 2000 },
              { id: 'st3-3', name: '等待子菜单加载', status: 'completed', duration: 2500 },
              { id: 'st3-4', name: '点击"电池"子菜单', status: 'completed', duration: 2000 },
              { id: 'st3-5', name: '向下查找省电选项', status: 'completed', duration: 8000 }
            ]
          },
          {
            id: 'task4-device002',
            taskNumber: 4,
            taskName: '开启省电模式',
            status: 'pending',
            totalDuration: 70000,
            subTasks: [
              { id: 'st4-1', name: '点击"省电模式"开关', status: 'completed', duration: 2000 },
              { id: 'st4-2', name: '阅读确认对话框', status: 'completed', duration: 5000 },
              { id: 'st4-3', name: '点击"开启"按钮', status: 'completed', duration: 1500 },
              { id: 'st4-4', name: '等待设置生效', status: 'completed', duration: 3000 }
            ]
          }
        ],
        programs: [
          'com.android.launcher（启动器）',
          'com.android.settings（系统设置）',
          'com.samsung.android.lool（省电模式）'
        ],
        errorCount: 1,
        warningCount: 2,
        qaDialogues: [
          {
            id: 'qa1-young',
            timestamp: '10:06:40',
            interviewer: '您完成任务的速度很快，请问您是如何快速找到省电模式的？',
            userResponse: '我对这类操作比较熟悉，直接在设置里找"电池"相关的选项。不过三星的菜单层级有点深，需要点两次才能进入。',
            context: '年轻用户的操作习惯',
            sentiment: 'neutral'
          },
          {
            id: 'qa2-young',
            timestamp: '10:07:10',
            interviewer: '您觉得这个流程还有什么可以优化的地方吗？',
            userResponse: '建议可以在下拉快捷菜单里直接加一个省电模式的开关，这样会更方便。每次都要进设置有点麻烦。',
            context: '关于交互优化的建议',
            sentiment: 'positive'
          }
        ]
      },
      {
        deviceId: 'device-003',
        deviceModel: 'Xiaomi 13 Pro',
        personaId: 'child',
        personaName: '儿童用户',
        personaIcon: '👧',
        status: 'warning',
        startTime: '10:00:15',
        endTime: '10:05:30',
        duration: 315000,
        screenshot: '📱',
        taskSteps: [
          {
            id: 'task1-device003',
            taskNumber: 1,
            taskName: '启动与登录',
            status: 'completed',
            totalDuration: 40000,
            subTasks: [
              { id: 'st1-1', name: '滑动解锁（指纹识别）', status: 'completed', duration: 2800 },
              { id: 'st1-2', name: '进入主屏幕', status: 'completed', duration: 1200 }
            ]
          },
          {
            id: 'task2-device003',
            taskNumber: 2,
            taskName: '进入设置应用',
            status: 'running',
            totalDuration: 65000,
            subTasks: [
              { id: 'st2-1', name: '点击"设置"图标', status: 'completed', duration: 2000 },
              { id: 'st2-2', name: '等待页面加载', status: 'completed', duration: 3000 }
            ]
          },
          {
            id: 'task3-device003',
            taskNumber: 3,
            taskName: '搜索电池设置',
            status: 'pending',
            totalDuration: 145000,
            subTasks: [
              { id: 'st3-1', name: '点击搜索图标', status: 'completed', duration: 2000 },
              { id: 'st3-2', name: '输入"电池"关键词', status: 'completed', duration: 8000 },
              { id: 'st3-3', name: '等待搜索结果', status: 'completed', duration: 2500 },
              { id: 'st3-4', name: '浏览搜索结果', status: 'completed', duration: 6000 },
              { id: 'st3-5', name: '点击"省电与电池"', status: 'completed', duration: 2000 },
              { id: 'st3-6', name: '等待页面跳转', status: 'completed', duration: 2500 }
            ]
          },
          {
            id: 'task4-device003',
            taskNumber: 4,
            taskName: '配置省电模式',
            status: 'pending',
            totalDuration: 65000,
            subTasks: [
              { id: 'st4-1', name: '点击"省电模式"', status: 'completed', duration: 2000 },
              { id: 'st4-2', name: '选择"超级省电"选项', status: 'completed', duration: 5000 },
              { id: 'st4-3', name: '阅读提醒弹窗', status: 'completed', duration: 4000 },
              { id: 'st4-4', name: '点击"我知道了"', status: 'completed', duration: 1500 },
              { id: 'st4-5', name: '验证状态栏图标', status: 'completed', duration: 3000 }
            ]
          }
        ],
        programs: [
          'com.miui.home（MIUI桌面）',
          'com.android.settings（系统设置）',
          'com.miui.powerkeeper（电源管理）'
        ],
        errorCount: 0,
        warningCount: 3,
        qaDialogues: [
          {
            id: 'qa1-child',
            timestamp: '10:07:35',
            interviewer: '小朋友你好，刚才找省电模式的时候有没有遇到困难呀？',
            userResponse: '有点难。我不认识"省电"这两个字，是用拼音输入的。还有弹出来的提示框我也不太明白是什么意思。',
            context: '儿童用户的理解困难',
            sentiment: 'negative'
          },
          {
            id: 'qa2-child',
            timestamp: '10:08:00',
            interviewer: '你觉得搜索功能好用吗？',
            userResponse: '还可以，但是我觉得如果能用语音就更好了，因为有些字我不会打。',
            context: '关于交互方式的建议',
            sentiment: 'neutral'
          }
        ]
      },
      {
        deviceId: 'device-004',
        deviceModel: 'OPPO Find X6 Pro',
        personaId: 'professional',
        personaName: '专业用户',
        personaIcon: '👔',
        status: 'success',
        startTime: '10:00:15',
        endTime: '10:04:20',
        duration: 245000,
        screenshot: '📱',
        taskSteps: [
          {
            id: 'task1-device004',
            taskNumber: 1,
            taskName: '启动与登录',
            status: 'completed',
            totalDuration: 35000,
            subTasks: [
              { id: 'st1-1', name: '面部解锁设备', status: 'completed', duration: 1800 },
              { id: 'st1-2', name: '进入主界面', status: 'completed', duration: 1000 }
            ]
          },
          {
            id: 'task2-device004',
            taskNumber: 2,
            taskName: '进入设置应用',
            status: 'running',
            totalDuration: 55000,
            subTasks: [
              { id: 'st2-1', name: '点击"设置"应用', status: 'completed', duration: 1500 },
              { id: 'st2-2', name: '等待设置加载', status: 'completed', duration: 2000 }
            ]
          },
          {
            id: 'task3-device004',
            taskNumber: 3,
            taskName: '快速搜索定位',
            status: 'pending',
            totalDuration: 95000,
            subTasks: [
              { id: 'st3-1', name: '点击顶部搜索框', status: 'completed', duration: 1500 },
              { id: 'st3-2', name: '输入"省电"关键词', status: 'completed', duration: 3000 },
              { id: 'st3-3', name: '等待搜索结果', status: 'completed', duration: 1500 },
              { id: 'st3-4', name: '直接点击"省电模式"', status: 'completed', duration: 1500 },
              { id: 'st3-5', name: '跳转到省电设置页', status: 'completed', duration: 2000 }
            ]
          },
          {
            id: 'task4-device004',
            taskNumber: 4,
            taskName: '配置省电选项',
            status: 'pending',
            totalDuration: 60000,
            subTasks: [
              { id: 'st4-1', name: '开启"省电模式"开关', status: 'completed', duration: 1500 },
              { id: 'st4-2', name: '选择省电级别', status: 'completed', duration: 3000 },
              { id: 'st4-3', name: '选择"智能省电"', status: 'completed', duration: 2000 },
              { id: 'st4-4', name: '确认设置生效', status: 'completed', duration: 2500 }
            ]
          }
        ],
        programs: [
          'com.oppo.launcher（ColorOS启动器）',
          'com.android.settings（系统设置）',
          'com.oppo.powersave（省电助手）'
        ],
        errorCount: 0,
        warningCount: 0,
        qaDialogues: [
          {
            id: 'qa1-professional',
            timestamp: '10:08:25',
            interviewer: '您的操作非常高效，请问您有什么使用技巧吗？',
            userResponse: '我习惯使用搜索功能，这样可以直接定位到目标功能，不用在菜单里层层查找。OPPO的搜索做得不错，响应很快。',
            context: '专业用户的高效操作习惯',
            sentiment: 'positive'
          },
          {
            id: 'qa2-professional',
            timestamp: '10:08:50',
            interviewer: '从专业角度，您对这个功能的设计有什么建议吗？',
            userResponse: '整体设计合理，建议可以增加省电模式的预设方案，让用户能根据不同场景快速切换，比如"工作模式"、"出差模式"等。',
            context: '专业角度的功能建议',
            sentiment: 'positive'
          }
        ]
      }
    ]
  },
  {
    id: 'phase3',
    phaseNumber: 3,
    phaseName: 'AI专家访谈',
    description: '对完成任务的AI用户进行访谈，收集它们在使用过程中的主观感受与反馈',
    status: 'completed',
    startTime: '10:05:30',
    endTime: '10:08:45',
    duration: 195000
  },
  {
    id: 'phase4',
    phaseNumber: 4,
    phaseName: '输出测试报告',
    description: '汇总执行数据与访谈结果，分析测试情况，自动生成可视化的分析报告',
    status: 'completed',
    startTime: '10:08:45',
    endTime: '10:09:20',
    duration: 35000,
    reportSummary: {
      totalTests: 4,
      successRate: 100,
      avgDuration: 283.75,
      issues: 3
    }
  }
];

// --- Components ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active = false, 
  collapsed = false,
  onClick
}: { 
  icon: React.ElementType, 
  label: string, 
  active?: boolean, 
  collapsed?: boolean, 
  onClick?: () => void
}) => (
  <div 
    onClick={onClick}
    className={`
      flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-200
      ${active ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
    `}
  >
    <Icon size={20} />
    {!collapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
  </div>
);

// --- New Views ---

const DashboardView = ({ onChangeTab, personas, scenarios, devices, queuedTasks }: any) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-slate-50">
       <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
             <h2 className="text-3xl font-bold mb-2">欢迎回来, Tester</h2>
             <p className="text-blue-100 mb-6 max-w-lg">准备好开始新一轮的自动化 UX 测试了吗？我们为您准备了最新的设备状态和测试建议。</p>
             <div className="flex gap-4">
                <button onClick={() => onChangeTab('task-management')} className="px-5 py-2.5 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-2">
                   <PlusCircle size={18} /> 创建新任务
                </button>
                <button onClick={() => onChangeTab('task-management')} className="px-5 py-2.5 bg-blue-800/50 text-white font-medium rounded-lg hover:bg-blue-800/70 transition-colors backdrop-blur-sm border border-blue-500/30">
                   查看最近报告
                </button>
             </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-10 translate-y-10">
             <LayoutDashboard size={200} />
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div onClick={() => onChangeTab('task-management')} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
             <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <List size={24} />
             </div>
             <h3 className="text-lg font-bold text-gray-800 mb-1">全部任务</h3>
             <p className="text-sm text-gray-500">共 {queuedTasks.length} 个任务</p>
             <div className="mt-3 flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                   ✓ {queuedTasks.filter((t: any) => t.status === 'completed').length}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                   ⏸ {queuedTasks.filter((t: any) => t.status === 'pending').length}
                </span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                   📝 {queuedTasks.filter((t: any) => t.status === 'draft').length}
                </span>
             </div>
          </div>
          <div onClick={() => onChangeTab('personas')} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
             <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users size={24} />
             </div>
             <h3 className="text-lg font-bold text-gray-800 mb-1">用户画像</h3>
             <p className="text-sm text-gray-500">管理 {personas.length} 个典型用户模型</p>
          </div>
          <div onClick={() => onChangeTab('scenarios')} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
             <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers size={24} />
             </div>
             <h3 className="text-lg font-bold text-gray-800 mb-1">场景库</h3>
             <p className="text-sm text-gray-500">维护 {scenarios.length} 个测试场景</p>
          </div>
          <div onClick={() => onChangeTab('devices')} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
             <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Smartphone size={24} />
             </div>
             <h3 className="text-lg font-bold text-gray-800 mb-1">设备管理</h3>
             <p className="text-sm text-gray-500">{devices.filter((d: any) => d.isOnline).length} 台设备在线可用</p>
          </div>
       </div>
    </div>
  );
};

const PersonaLibraryView = ({ personas, setPersonas }: { personas: Persona[], setPersonas: React.Dispatch<React.SetStateAction<Persona[]>> }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Comprehensive form state
  const [newPersona, setNewPersona] = useState<{
    name: string;
    age: string;
    gender: string;
    occupation: string;
    description: string;
    features: string[];
    featureInput: string;
    // 人口统计学特征
    visionStatus: string;
    // 行为特征
    operationSpeed: string;
    missTouchRate: number;
    gesturePreference: string[];
    gestureInput: string;
    // 心理特征
    patience: number;
    newFeatureAcceptance: string;
  }>({
    name: '',
    age: '',
    gender: '',
    occupation: '',
    description: '',
    features: [],
    featureInput: '',
    // 人口统计学特征
    visionStatus: '',
    // 行为特征
    operationSpeed: '',
    missTouchRate: 50,
    gesturePreference: [],
    gestureInput: '',
    // 心理特征
    patience: 50,
    newFeatureAcceptance: ''
  });

  const handleAdd = () => {
    if (!newPersona.name) return;
    const persona: Persona = {
      id: Date.now().toString(),
      name: newPersona.name,
      icon: '👤',
      description: newPersona.description || '暂无详细描述',
      features: newPersona.features,
      age: newPersona.age,
      gender: newPersona.gender,
      occupation: newPersona.occupation,
      // 人口统计学特征
      visionStatus: newPersona.visionStatus as any,
      // 行为特征
      operationSpeed: newPersona.operationSpeed as any,
      missTouchRate: newPersona.missTouchRate,
      gesturePreference: newPersona.gesturePreference,
      // 心理特征
      patience: newPersona.patience,
      newFeatureAcceptance: newPersona.newFeatureAcceptance as any
    };
    setPersonas([...personas, persona]);
    // Reset
    setNewPersona({
        name: '', age: '', gender: '', occupation: '', description: '', features: [], featureInput: '',
        visionStatus: '', operationSpeed: '', missTouchRate: 50, gesturePreference: [], gestureInput: '',
        patience: 50, newFeatureAcceptance: ''
    });
    setIsModalOpen(false);
  };

  const addFeature = () => {
    if (newPersona.featureInput.trim()) {
        setNewPersona(prev => ({
            ...prev,
            features: [...prev.features, prev.featureInput.trim()],
            featureInput: ''
        }));
    }
  };

  const removeFeature = (index: number) => {
    setNewPersona(prev => ({
        ...prev,
        features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addGesture = () => {
    if (newPersona.gestureInput.trim()) {
        setNewPersona(prev => ({
            ...prev,
            gesturePreference: [...prev.gesturePreference, prev.gestureInput.trim()],
            gestureInput: ''
        }));
    }
  };

  const removeGesture = (index: number) => {
    setNewPersona(prev => ({
        ...prev,
        gesturePreference: prev.gesturePreference.filter((_, i) => i !== index)
    }));
  };

  const handleDelete = (id: string) => {
    setPersonas(personas.filter(p => p.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-slate-50 w-full">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold text-gray-800">用户画像库</h2>
         <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
            <PlusCircle size={20} /> 新增画像
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {personas.map(persona => (
          <div key={persona.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group flex flex-col h-full">
             <div className="flex items-start justify-between mb-4">
               <div className="flex items-center gap-3">
                 <div className="text-4xl w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg">{persona.icon}</div>
                 <div>
                   <h3 className="text-lg font-bold text-gray-900">{persona.name}</h3>
                   <span className="text-xs text-gray-400 font-mono">ID: {persona.id.slice(0,8)}</span>
                 </div>
               </div>
               <button onClick={() => handleDelete(persona.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={16}/>
               </button>
             </div>
             
             <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">{persona.description}</p>
             
             {/* 基础信息 */}
             {(persona.age || persona.occupation || persona.visionStatus) && (
                <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-500">
                    {persona.age && <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">年龄: {persona.age}</span>}
                    {persona.occupation && <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">职业: {persona.occupation}</span>}
                    {persona.visionStatus && (
                        <span className={`px-2 py-0.5 rounded border ${
                            persona.visionStatus === 'normal' ? 'bg-green-50 text-green-700 border-green-200' :
                            persona.visionStatus === 'mild' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            persona.visionStatus === 'moderate' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-red-50 text-red-700 border-red-200'
                        }`}>
                            视力: {persona.visionStatus === 'normal' ? '正常' : persona.visionStatus === 'mild' ? '轻度' : persona.visionStatus === 'moderate' ? '中度' : '重度'}
                        </span>
                    )}
                </div>
             )}
             
             {/* 行为特征 */}
             {(persona.operationSpeed || persona.missTouchRate !== undefined || (persona.gesturePreference && persona.gesturePreference.length > 0)) && (
                <div className="border-t border-gray-100 pt-3 mb-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                    <MousePointer2 size={12} /> 行为特征
                  </h4>
                  <div className="space-y-2">
                    {persona.operationSpeed && (
                        <div className="text-xs flex items-center gap-2">
                            <span className="text-gray-400">速度:</span>
                            <span className={`px-2 py-0.5 rounded ${
                                persona.operationSpeed === 'fast' ? 'bg-green-100 text-green-700' :
                                persona.operationSpeed === 'medium' ? 'bg-blue-100 text-blue-700' :
                                'bg-orange-100 text-orange-700'
                            }`}>
                                {persona.operationSpeed === 'fast' ? '快速' : persona.operationSpeed === 'medium' ? '中速' : '慢速'}
                            </span>
                        </div>
                    )}
                    {persona.missTouchRate !== undefined && (
                        <div className="text-xs flex items-center gap-2">
                            <span className="text-gray-400">误触:</span>
                            <div className="flex-1 max-w-[100px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${persona.missTouchRate > 70 ? 'bg-red-500' : persona.missTouchRate > 40 ? 'bg-orange-500' : 'bg-green-500'}`}
                                    style={{width: `${persona.missTouchRate}%`}}
                                ></div>
                            </div>
                            <span className="font-medium text-gray-700">{persona.missTouchRate}%</span>
                        </div>
                    )}
                    {persona.gesturePreference && persona.gesturePreference.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                            {persona.gesturePreference.map((gesture, idx) => (
                                <span key={idx} className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-200">
                                    {gesture}
                                </span>
                            ))}
                        </div>
                    )}
                  </div>
                </div>
             )}

             {/* 心理特征 */}
             {(persona.patience !== undefined || persona.newFeatureAcceptance) && (
                <div className="border-t border-gray-100 pt-3 mb-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                    <BrainCircuit size={12} /> 心理特征
                  </h4>
                  <div className="space-y-2">
                    {persona.patience !== undefined && (
                        <div className="text-xs flex items-center gap-2">
                            <span className="text-gray-400">耐心:</span>
                            <div className="flex-1 max-w-[100px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${persona.patience > 70 ? 'bg-purple-500' : persona.patience > 40 ? 'bg-blue-500' : 'bg-red-500'}`}
                                    style={{width: `${persona.patience}%`}}
                                ></div>
                            </div>
                            <span className="font-medium text-gray-700">{persona.patience}%</span>
                        </div>
                    )}
                    {persona.newFeatureAcceptance && (
                        <div className="text-xs flex items-center gap-2">
                            <span className="text-gray-400">接受度:</span>
                            <span className={`px-2 py-0.5 rounded ${
                                persona.newFeatureAcceptance === 'high' ? 'bg-green-100 text-green-700' :
                                persona.newFeatureAcceptance === 'medium' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                                {persona.newFeatureAcceptance === 'high' ? '高' : persona.newFeatureAcceptance === 'medium' ? '中' : '低'}
                            </span>
                        </div>
                    )}
                  </div>
                </div>
             )}
             
             {/* 行为习惯标签 */}
             {persona.features.length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                    <Activity size={12} /> 行为标签
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {persona.features.map((feature, idx) => (
                      <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
             )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">创建新用户画像</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24}/>
                </button>
            </div>
            
            <div className="space-y-6">
                {/* Basic Info Section */}
                <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                        <User size={16} className="text-primary"/> 基础信息
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">画像名称 <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={newPersona.name}
                                onChange={(e) => setNewPersona({...newPersona, name: e.target.value})}
                                placeholder="例如：游戏发烧友"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">职业</label>
                            <input 
                                type="text" 
                                value={newPersona.occupation}
                                onChange={(e) => setNewPersona({...newPersona, occupation: e.target.value})}
                                placeholder="例如：在校大学生"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">年龄段</label>
                            <input 
                                type="text" 
                                value={newPersona.age}
                                onChange={(e) => setNewPersona({...newPersona, age: e.target.value})}
                                placeholder="例如：18-25岁"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">性别</label>
                            <div className="relative">
                                <select 
                                    value={newPersona.gender}
                                    onChange={(e) => setNewPersona({...newPersona, gender: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white appearance-none transition-shadow cursor-pointer"
                                >
                                    <option value="">请选择</option>
                                    <option value="male">男</option>
                                    <option value="female">女</option>
                                    <option value="other">其他</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16}/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 my-2"></div>

                {/* Extended Info Section */}
                <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                        <Smartphone size={16} className="text-primary"/> 使用习惯拓展
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">手机使用习惯描述</label>
                            <textarea 
                                rows={3}
                                value={newPersona.description}
                                onChange={(e) => setNewPersona({...newPersona, description: e.target.value})}
                                placeholder="描述该用户群体的典型操作特征，例如：操作速度快，喜欢探索新功能，对卡顿敏感..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none transition-shadow"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">行为标签 (Features)</label>
                            <div className="flex gap-2 mb-3">
                                <input 
                                    type="text" 
                                    value={newPersona.featureInput}
                                    onChange={(e) => setNewPersona({...newPersona, featureInput: e.target.value})}
                                    onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                                    placeholder="输入标签后回车或点击添加"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow"
                                />
                                <button onClick={addFeature} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors">添加</button>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[48px] bg-gray-50 p-3 rounded-lg border border-gray-200 border-dashed">
                                {newPersona.features.length === 0 && <span className="text-xs text-gray-400 self-center">暂无标签，请在上方添加</span>}
                                {newPersona.features.map((feature, idx) => (
                                    <span key={idx} className="flex items-center gap-1 bg-white border border-gray-200 px-2.5 py-1 rounded-md text-xs text-gray-700 shadow-sm animate-in zoom-in duration-200">
                                        {feature}
                                        <button onClick={() => removeFeature(idx)} className="text-gray-400 hover:text-red-500 transition-colors ml-1"><X size={12}/></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 my-4"></div>

                {/* 人口统计学特征 */}
                <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                        <Activity size={16} className="text-indigo-600"/> 人口统计学特征
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">视力状况</label>
                            <div className="relative">
                                <select 
                                    value={newPersona.visionStatus}
                                    onChange={(e) => setNewPersona({...newPersona, visionStatus: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white appearance-none transition-shadow cursor-pointer"
                                >
                                    <option value="">请选择</option>
                                    <option value="normal">正常</option>
                                    <option value="mild">轻度障碍</option>
                                    <option value="moderate">中度障碍</option>
                                    <option value="severe">重度障碍</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16}/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 my-4"></div>

                {/* 行为特征 */}
                <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                        <MousePointer2 size={16} className="text-orange-600"/> 行为特征
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">操作速度</label>
                            <div className="relative">
                                <select 
                                    value={newPersona.operationSpeed}
                                    onChange={(e) => setNewPersona({...newPersona, operationSpeed: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white appearance-none transition-shadow cursor-pointer"
                                >
                                    <option value="">请选择</option>
                                    <option value="slow">慢速 (老年/新手)</option>
                                    <option value="medium">中速 (一般用户)</option>
                                    <option value="fast">快速 (熟练/极客)</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16}/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">
                                误触概率: <span className="text-primary font-bold">{newPersona.missTouchRate}%</span>
                            </label>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={newPersona.missTouchRate}
                                onChange={(e) => setNewPersona({...newPersona, missTouchRate: parseInt(e.target.value)})}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                <span>精准 0%</span>
                                <span>中等 50%</span>
                                <span>频繁 100%</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">手势偏好</label>
                            <div className="flex gap-2 mb-3">
                                <input 
                                    type="text" 
                                    value={newPersona.gestureInput}
                                    onChange={(e) => setNewPersona({...newPersona, gestureInput: e.target.value})}
                                    onKeyDown={(e) => e.key === 'Enter' && addGesture()}
                                    placeholder="例如：单指滑动、双指缩放"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow"
                                />
                                <button onClick={addGesture} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors">添加</button>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[48px] bg-gray-50 p-3 rounded-lg border border-gray-200 border-dashed">
                                {newPersona.gesturePreference.length === 0 && <span className="text-xs text-gray-400 self-center">暂无手势偏好，请在上方添加</span>}
                                {newPersona.gesturePreference.map((gesture, idx) => (
                                    <span key={idx} className="flex items-center gap-1 bg-white border border-orange-200 px-2.5 py-1 rounded-md text-xs text-orange-700 shadow-sm animate-in zoom-in duration-200">
                                        {gesture}
                                        <button onClick={() => removeGesture(idx)} className="text-orange-400 hover:text-red-500 transition-colors ml-1"><X size={12}/></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 my-4"></div>

                {/* 心理特征 */}
                <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                        <BrainCircuit size={16} className="text-purple-600"/> 心理特征
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">
                                耐心值: <span className="text-primary font-bold">{newPersona.patience}%</span>
                            </label>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={newPersona.patience}
                                onChange={(e) => setNewPersona({...newPersona, patience: parseInt(e.target.value)})}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                <span>急躁 0%</span>
                                <span>一般 50%</span>
                                <span>耐心 100%</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">对新功能的接受度</label>
                            <div className="relative">
                                <select 
                                    value={newPersona.newFeatureAcceptance}
                                    onChange={(e) => setNewPersona({...newPersona, newFeatureAcceptance: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white appearance-none transition-shadow cursor-pointer"
                                >
                                    <option value="">请选择</option>
                                    <option value="low">低 (保守型，抗拒变化)</option>
                                    <option value="medium">中 (谨慎尝试)</option>
                                    <option value="high">高 (积极探索新功能)</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">取消</button>
                <button onClick={handleAdd} className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium shadow-sm hover:shadow-md transition-all">确认创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ScenarioLibraryView = ({ scenarios, setScenarios }: { scenarios: Scenario[], setScenarios: React.Dispatch<React.SetStateAction<Scenario[]>> }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newScenario, setNewScenario] = useState({
    name: '',
    description: '',
    complexity: 'Medium' as 'Low' | 'Medium' | 'High',
    category: '' as string,
    estimatedDuration: 60,
    steps: [] as string[],
    stepInput: '',
    preconditions: [] as string[],
    preconditionInput: '',
    expectedResult: '',
    checkpoints: [] as string[],
    checkpointInput: '',
    networkRequirement: '' as string,
    priority: '' as string,
    deviceTypes: [] as string[]
  });

  const handleAdd = () => {
    if (!newScenario.name) return;
    const scenario: Scenario = {
      id: Date.now().toString(),
      name: newScenario.name,
      icon: getCategoryIcon(newScenario.category),
      description: newScenario.description || '新创建的测试场景',
      complexity: newScenario.complexity,
      category: newScenario.category as any,
      estimatedDuration: newScenario.estimatedDuration,
      steps: newScenario.steps.length > 0 ? newScenario.steps : undefined,
      preconditions: newScenario.preconditions.length > 0 ? newScenario.preconditions : undefined,
      expectedResult: newScenario.expectedResult || undefined,
      checkpoints: newScenario.checkpoints.length > 0 ? newScenario.checkpoints : undefined,
      networkRequirement: newScenario.networkRequirement as any || undefined,
      priority: newScenario.priority as any || undefined,
      deviceTypes: newScenario.deviceTypes.length > 0 ? newScenario.deviceTypes : undefined
    };
    setScenarios([...scenarios, scenario]);
    setNewScenario({
      name: '', description: '', complexity: 'Medium', category: '', estimatedDuration: 60,
      steps: [], stepInput: '', preconditions: [], preconditionInput: '',
      expectedResult: '', checkpoints: [], checkpointInput: '',
      networkRequirement: '', priority: '', deviceTypes: []
    });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'system': '⚙️',
      'app': '📱',
      'communication': '💬',
      'entertainment': '🎮',
      'productivity': '💼',
      'other': '📋'
    };
    return icons[category] || '📋';
  };

  const addStep = () => {
    if (newScenario.stepInput.trim()) {
      setNewScenario(prev => ({
        ...prev,
        steps: [...prev.steps, prev.stepInput.trim()],
        stepInput: ''
      }));
    }
  };

  const removeStep = (index: number) => {
    setNewScenario(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const addPrecondition = () => {
    if (newScenario.preconditionInput.trim()) {
      setNewScenario(prev => ({
        ...prev,
        preconditions: [...prev.preconditions, prev.preconditionInput.trim()],
        preconditionInput: ''
      }));
    }
  };

  const removePrecondition = (index: number) => {
    setNewScenario(prev => ({
      ...prev,
      preconditions: prev.preconditions.filter((_, i) => i !== index)
    }));
  };

  const addCheckpoint = () => {
    if (newScenario.checkpointInput.trim()) {
      setNewScenario(prev => ({
        ...prev,
        checkpoints: [...prev.checkpoints, prev.checkpointInput.trim()],
        checkpointInput: ''
      }));
    }
  };

  const removeCheckpoint = (index: number) => {
    setNewScenario(prev => ({
      ...prev,
      checkpoints: prev.checkpoints.filter((_, i) => i !== index)
    }));
  };

  const toggleDeviceType = (type: string) => {
    setNewScenario(prev => ({
      ...prev,
      deviceTypes: prev.deviceTypes.includes(type)
        ? prev.deviceTypes.filter(t => t !== type)
        : [...prev.deviceTypes, type]
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-slate-50 w-full">
       <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold text-gray-800">场景库管理</h2>
         <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
            <PlusCircle size={20} /> 新增场景
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map(scenario => (
           <div key={scenario.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group flex flex-col">
              <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-3 flex-1">
                    <div className="text-3xl w-10 h-10 flex items-center justify-center bg-blue-50 rounded-lg flex-shrink-0">{scenario.icon}</div>
                    <div className="flex-1 min-w-0">
                       <h3 className="font-bold text-gray-900 truncate">{scenario.name}</h3>
                       <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <div className={`text-[10px] px-1.5 py-0.5 rounded font-medium
                            ${scenario.complexity === 'High' ? 'bg-red-100 text-red-600' : scenario.complexity === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}
                          `}>
                             {scenario.complexity === 'High' ? '复杂' : scenario.complexity === 'Medium' ? '中等' : '简单'}
                          </div>
                          {scenario.category && (
                             <div className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-blue-100 text-blue-600">
                                {scenario.category === 'system' ? '系统' : scenario.category === 'app' ? '应用' : 
                                 scenario.category === 'communication' ? '通讯' : scenario.category === 'entertainment' ? '娱乐' : 
                                 scenario.category === 'productivity' ? '效率' : '其他'}
                             </div>
                          )}
                          {scenario.priority && (
                             <div className={`text-[10px] px-1.5 py-0.5 rounded font-medium
                                ${scenario.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                  scenario.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                  scenario.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-600'}
                             `}>
                                {scenario.priority === 'critical' ? '🔥紧急' : scenario.priority === 'high' ? '高优' : 
                                 scenario.priority === 'medium' ? '中优' : '低优'}
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
                 <button onClick={() => handleDelete(scenario.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
                    <Trash2 size={16}/>
                 </button>
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3 line-clamp-3 flex-grow">
                {scenario.description}
              </p>

              {/* Additional Info */}
              <div className="space-y-2 text-xs">
                 {scenario.estimatedDuration && (
                    <div className="flex items-center gap-2 text-gray-500">
                       <Clock size={12} className="text-blue-500" />
                       <span>预计耗时: <span className="font-medium text-gray-700">{Math.floor(scenario.estimatedDuration / 60)}分{scenario.estimatedDuration % 60}秒</span></span>
                    </div>
                 )}
                 {scenario.steps && scenario.steps.length > 0 && (
                    <div className="flex items-center gap-2 text-gray-500">
                       <GitMerge size={12} className="text-indigo-500" />
                       <span>操作步骤: <span className="font-medium text-gray-700">{scenario.steps.length}步</span></span>
                    </div>
                 )}
                 {scenario.networkRequirement && (
                    <div className="flex items-center gap-2 text-gray-500">
                       <Activity size={12} className="text-green-500" />
                       <span>网络: <span className="font-medium text-gray-700">
                          {scenario.networkRequirement === 'none' ? '无需' : 
                           scenario.networkRequirement === 'wifi' ? 'WiFi' : 
                           scenario.networkRequirement === 'mobile' ? '移动' : '任意'}
                       </span></span>
                    </div>
                 )}
                 {scenario.deviceTypes && scenario.deviceTypes.length > 0 && (
                    <div className="flex items-start gap-2 text-gray-500">
                       <Smartphone size={12} className="text-purple-500 mt-0.5" />
                       <div className="flex flex-wrap gap-1">
                          {scenario.deviceTypes.map((type, idx) => (
                             <span key={idx} className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px]">
                                {type}
                             </span>
                          ))}
                       </div>
                    </div>
                 )}
              </div>

              {/* Expandable Details */}
              {(scenario.steps || scenario.preconditions || scenario.checkpoints) && (
                 <details className="mt-3 pt-3 border-t border-gray-100">
                    <summary className="text-xs font-bold text-primary cursor-pointer hover:text-blue-700 transition-colors flex items-center gap-1">
                       <ChevronDown size={12} className="inline" />
                       查看详细配置
                    </summary>
                    <div className="mt-3 space-y-3 text-xs">
                       {scenario.steps && scenario.steps.length > 0 && (
                          <div>
                             <div className="font-bold text-gray-700 mb-1 flex items-center gap-1">
                                <GitMerge size={10} /> 操作步骤:
                             </div>
                             <ol className="list-decimal list-inside space-y-1 text-gray-600 pl-2">
                                {scenario.steps.map((step, idx) => (
                                   <li key={idx}>{step}</li>
                                ))}
                             </ol>
                          </div>
                       )}
                       {scenario.preconditions && scenario.preconditions.length > 0 && (
                          <div>
                             <div className="font-bold text-gray-700 mb-1 flex items-center gap-1">
                                <CheckCircle size={10} /> 前置条件:
                             </div>
                             <ul className="space-y-1 text-gray-600 pl-2">
                                {scenario.preconditions.map((condition, idx) => (
                                   <li key={idx} className="flex items-start gap-1">
                                      <span className="text-green-500 mt-0.5">•</span>
                                      <span>{condition}</span>
                                   </li>
                                ))}
                             </ul>
                          </div>
                       )}
                       {scenario.checkpoints && scenario.checkpoints.length > 0 && (
                          <div>
                             <div className="font-bold text-gray-700 mb-1 flex items-center gap-1">
                                <Activity size={10} /> 检查点:
                             </div>
                             <ul className="space-y-1 text-gray-600 pl-2">
                                {scenario.checkpoints.map((checkpoint, idx) => (
                                   <li key={idx} className="flex items-start gap-1">
                                      <span className="text-orange-500 mt-0.5">•</span>
                                      <span>{checkpoint}</span>
                                   </li>
                                ))}
                             </ul>
                          </div>
                       )}
                       {scenario.expectedResult && (
                          <div>
                             <div className="font-bold text-gray-700 mb-1 flex items-center gap-1">
                                <Check size={10} /> 预期结果:
                             </div>
                             <p className="text-gray-600 pl-2">{scenario.expectedResult}</p>
                          </div>
                       )}
                    </div>
                 </details>
              )}
           </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800">创建新测试场景</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24}/>
                </button>
            </div>
            
            <div className="space-y-6">
                {/* Basic Info Section */}
                <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                        <Layers size={16} className="text-primary"/> 基础信息
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">场景名称 <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={newScenario.name}
                                onChange={(e) => setNewScenario({...newScenario, name: e.target.value})}
                                placeholder="例如：网购下单流程"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">场景分类</label>
                            <div className="relative">
                                <select 
                                    value={newScenario.category}
                                    onChange={(e) => setNewScenario({...newScenario, category: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white appearance-none transition-shadow cursor-pointer"
                                >
                                    <option value="">请选择</option>
                                    <option value="system">⚙️ 系统操作</option>
                                    <option value="app">📱 应用使用</option>
                                    <option value="communication">💬 通讯社交</option>
                                    <option value="entertainment">🎮 娱乐游戏</option>
                                    <option value="productivity">💼 效率工具</option>
                                    <option value="other">📋 其他</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16}/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">复杂度</label>
                            <div className="flex gap-2">
                                {['Low', 'Medium', 'High'].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setNewScenario({...newScenario, complexity: level as any})}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                            newScenario.complexity === level
                                                ? level === 'High' ? 'bg-red-100 text-red-700 border-2 border-red-300'
                                                : level === 'Medium' ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                                                : 'bg-green-100 text-green-700 border-2 border-green-300'
                                                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                                        }`}
                                    >
                                        {level === 'Low' ? '简单' : level === 'Medium' ? '中等' : '复杂'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                预期耗时: <span className="text-primary font-bold">{Math.floor(newScenario.estimatedDuration / 60)}分{newScenario.estimatedDuration % 60}秒</span>
                            </label>
                            <input 
                                type="range" 
                                min="10" 
                                max="600" 
                                step="10"
                                value={newScenario.estimatedDuration}
                                onChange={(e) => setNewScenario({...newScenario, estimatedDuration: parseInt(e.target.value)})}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                <span>10秒</span>
                                <span>5分钟</span>
                                <span>10分钟</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-xs font-medium text-gray-500 mb-1">场景描述</label>
                        <textarea 
                            rows={3}
                            value={newScenario.description}
                            onChange={(e) => setNewScenario({...newScenario, description: e.target.value})}
                            placeholder="详细描述该测试场景的目标、背景和测试范围..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none text-sm transition-shadow"
                        />
                    </div>
                </div>

                <div className="border-t border-gray-100 my-4"></div>

                {/* Steps Section */}
                <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                        <GitMerge size={16} className="text-indigo-600"/> 操作步骤
                    </h4>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={newScenario.stepInput}
                                onChange={(e) => setNewScenario({...newScenario, stepInput: e.target.value})}
                                onKeyDown={(e) => e.key === 'Enter' && addStep()}
                                placeholder="输入操作步骤后回车添加，例如：打开设置应用"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow text-sm"
                            />
                            <button onClick={addStep} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-medium transition-colors">
                                <Plus size={18} />
                            </button>
                        </div>
                        <div className="min-h-[60px] bg-gray-50 p-3 rounded-lg border border-gray-200 border-dashed">
                            {newScenario.steps.length === 0 ? (
                                <span className="text-xs text-gray-400">暂无步骤，请在上方添加</span>
                            ) : (
                                <div className="space-y-2">
                                    {newScenario.steps.map((step, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-white border border-indigo-200 px-3 py-2 rounded-lg text-sm animate-in zoom-in duration-200">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                                                {idx + 1}
                                            </span>
                                            <span className="flex-1 text-gray-700">{step}</span>
                                            <button onClick={() => removeStep(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <X size={16}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 my-4"></div>

                {/* Conditions & Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Preconditions */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-600"/> 前置条件
                        </h4>
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newScenario.preconditionInput}
                                    onChange={(e) => setNewScenario({...newScenario, preconditionInput: e.target.value})}
                                    onKeyDown={(e) => e.key === 'Enter' && addPrecondition()}
                                    placeholder="例如：已登录账号"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow text-sm"
                                />
                                <button onClick={addPrecondition} className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                                    <Plus size={18} />
                                </button>
                            </div>
                            <div className="min-h-[80px] bg-gray-50 p-2 rounded-lg border border-gray-200 border-dashed">
                                {newScenario.preconditions.length === 0 ? (
                                    <span className="text-xs text-gray-400">无前置条件</span>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {newScenario.preconditions.map((condition, idx) => (
                                            <span key={idx} className="flex items-center gap-1 bg-green-50 border border-green-200 px-2 py-1 rounded-md text-xs text-green-700">
                                                {condition}
                                                <button onClick={() => removePrecondition(idx)} className="text-green-400 hover:text-red-500 transition-colors">
                                                    <X size={12}/>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Checkpoints */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                            <Activity size={16} className="text-orange-600"/> 关键检查点
                        </h4>
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newScenario.checkpointInput}
                                    onChange={(e) => setNewScenario({...newScenario, checkpointInput: e.target.value})}
                                    onKeyDown={(e) => e.key === 'Enter' && addCheckpoint()}
                                    placeholder="例如：页面无卡顿"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow text-sm"
                                />
                                <button onClick={addCheckpoint} className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
                                    <Plus size={18} />
                                </button>
                            </div>
                            <div className="min-h-[80px] bg-gray-50 p-2 rounded-lg border border-gray-200 border-dashed">
                                {newScenario.checkpoints.length === 0 ? (
                                    <span className="text-xs text-gray-400">无检查点</span>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {newScenario.checkpoints.map((checkpoint, idx) => (
                                            <span key={idx} className="flex items-center gap-1 bg-orange-50 border border-orange-200 px-2 py-1 rounded-md text-xs text-orange-700">
                                                {checkpoint}
                                                <button onClick={() => removeCheckpoint(idx)} className="text-orange-400 hover:text-red-500 transition-colors">
                                                    <X size={12}/>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expected Result */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Check size={14} className="text-green-600"/> 预期结果
                    </label>
                    <textarea 
                        rows={2}
                        value={newScenario.expectedResult}
                        onChange={(e) => setNewScenario({...newScenario, expectedResult: e.target.value})}
                        placeholder="描述执行该场景后的预期结果和成功标准..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none text-sm transition-shadow"
                    />
                </div>

                <div className="border-t border-gray-100 my-4"></div>

                {/* Environment & Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">网络环境要求</label>
                        <div className="relative">
                            <select 
                                value={newScenario.networkRequirement}
                                onChange={(e) => setNewScenario({...newScenario, networkRequirement: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white appearance-none transition-shadow cursor-pointer"
                            >
                                <option value="">请选择</option>
                                <option value="none">无需网络</option>
                                <option value="wifi">需要WiFi</option>
                                <option value="mobile">需要移动网络</option>
                                <option value="any">任意网络</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16}/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">优先级</label>
                        <div className="relative">
                            <select 
                                value={newScenario.priority}
                                onChange={(e) => setNewScenario({...newScenario, priority: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white appearance-none transition-shadow cursor-pointer"
                            >
                                <option value="">请选择</option>
                                <option value="low">低</option>
                                <option value="medium">中</option>
                                <option value="high">高</option>
                                <option value="critical">紧急</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16}/>
                        </div>
                    </div>
                </div>

                {/* Device Types */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">适用设备类型（可多选）</label>
                    <div className="flex flex-wrap gap-2">
                        {['手机', '平板', '折叠屏', '智能手表'].map(type => (
                            <button
                                key={type}
                                onClick={() => toggleDeviceType(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    newScenario.deviceTypes.includes(type)
                                        ? 'bg-primary text-white border-2 border-primary'
                                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                                }`}
                            >
                                {newScenario.deviceTypes.includes(type) && <Check size={14} className="inline mr-1" />}
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100 sticky bottom-0 bg-white">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                    取消
                </button>
                <button 
                    onClick={handleAdd} 
                    disabled={!newScenario.name}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    确认创建
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DeviceFarmView = () => {
  const [filter, setFilter] = useState('');

  const filteredDevices = DEVICES.filter(d => 
    d.model.toLowerCase().includes(filter.toLowerCase()) || 
    d.id.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-slate-50 w-full">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold text-gray-800">设备管理</h2>
         <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="搜索设备..." 
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm w-64"
                />
             </div>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium">设备 ID</th>
              <th className="px-6 py-3 font-medium">型号</th>
              <th className="px-6 py-3 font-medium">系统版本</th>
              <th className="px-6 py-3 font-medium">状态</th>
              <th className="px-6 py-3 font-medium">电量</th>
              <th className="px-6 py-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredDevices.map(device => (
              <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-gray-500 text-xs">#{device.id.toUpperCase()}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{device.model}</td>
                <td className="px-6 py-4 text-gray-600">{device.version}</td>
                <td className="px-6 py-4">
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      device.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                   }`}>
                      {device.isOnline ? '在线' : '离线'}
                   </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${device.battery < 20 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${device.battery}%`}}></div>
                    </div>
                    <span className="text-xs text-gray-500">{device.battery}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-primary hover:text-blue-700 font-medium text-xs">详情</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ... (keep TaskManagementView imports and initial state)

const TaskManagementView = ({ 
  personas, 
  scenarios,
  queuedTasks,
  setQueuedTasks
}: { 
  personas: Persona[], 
  scenarios: Scenario[],
  queuedTasks: QueuedTask[],
  setQueuedTasks: React.Dispatch<React.SetStateAction<QueuedTask[]>>
}) => {
  const [isCreating, setIsCreating] = useState(false); 
  const [viewingReportTaskId, setViewingReportTaskId] = useState<string | null>(null);
  const [viewingExecutionTaskId, setViewingExecutionTaskId] = useState<string | null>(null);
  const [expandedDevices, setExpandedDevices] = useState<{[key: string]: boolean}>({});
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | undefined>(undefined);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [modelFilter, setModelFilter] = useState('all');
  
  // Execution Settings
  const [concurrency, setConcurrency] = useState(false);
  const [retryCount, setRetryCount] = useState(1);
  const [powerSavingMode, setPowerSavingMode] = useState(false);
  const [monitorPerf, setMonitorPerf] = useState(true);

  // Visual Orchestration State
  const [previewDevice, setPreviewDevice] = useState<Device | null>(null);

  // Report View State
  const [activePersonaTab, setActivePersonaTab] = useState('all');
  const [heatmapOpacity, setHeatmapOpacity] = useState(60);
  const [problemExpanded, setProblemExpanded] = useState(true);
  const [competitorExpanded, setCompetitorExpanded] = useState(false); // 竞品对比默认折叠
  const [showPrintView, setShowPrintView] = useState(false);
  
  // Task List Filter State
  const [taskFilterTab, setTaskFilterTab] = useState<'all' | 'active' | 'completed' | 'draft'>('all');

  // Scroll ref for queue
  const queueEndRef = useRef<HTMLDivElement>(null);

  // Load draft
  useEffect(() => {
    const loadDraft = async () => {
      const draft = await storage.get<TaskDraft>('current_task_draft');
      if (draft) {
        setTaskName(draft.name);
        setTaskDesc(draft.description);
        setSelectedScenarioId(draft.selectedScenarioId);
        setSelectedPersonas(draft.personas);
        setSelectedDevices(draft.devices);
        setAdvancedMode(draft.advancedMode);
        setConcurrency(draft.concurrency);
        setRetryCount(draft.retryCount);
        if (draft.powerSavingMode !== undefined) setPowerSavingMode(draft.powerSavingMode);
        setMonitorPerf(draft.monitorPerformance);
      }
    };
    loadDraft();
  }, []);

  const handleSaveDraft = async () => {
    const draft: TaskDraft = {
      name: taskName,
      description: taskDesc,
      selectedScenarioId,
      personas: selectedPersonas,
      devices: selectedDevices,
      advancedMode,
      concurrency,
      retryCount,
      powerSavingMode,
      monitorPerformance: monitorPerf,
      nodes: [], 
    };
    await storage.set('current_task_draft', draft);
    alert('草稿已保存');
  };

  const handleAddToQueue = () => {
    if (!selectedScenarioId) {
        alert('请选择测试场景');
        return;
    }
    if (selectedDevices.length === 0) {
        alert('请选择至少一台测试设备');
        return;
    }

    const finalTaskName = taskName.trim() || `Task_${new Date().toISOString().slice(2,19).replace(/[-T:]/g,'')}`;

    const newTask: QueuedTask = {
        id: Date.now().toString(),
        name: finalTaskName,
        description: taskDesc || scenarios.find(s => s.id === selectedScenarioId)?.description || '',
        selectedScenarioId,
        personas: selectedPersonas,
        devices: selectedDevices,
        advancedMode,
        concurrency,
        retryCount,
        powerSavingMode,
        monitorPerformance: monitorPerf,
        nodes: [], 
        status: 'pending',
        createdAt: new Date().toLocaleTimeString()
    };

    setQueuedTasks(prev => [...prev, newTask]);
    setTaskName('');
    setIsCreating(false); 
  };

  const handleDeleteTask = (id: string) => {
    setQueuedTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleStartTask = (id: string) => {
    setQueuedTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'running' } : t));
    setTimeout(() => {
         setQueuedTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
    }, 5000);
  };

  const togglePersona = (id: string) => {
    setSelectedPersonas(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleDevice = (id: string) => {
    const targetDevice = DEVICES.find(d => d.id === id);
    if (!targetDevice) return;

    setSelectedDevices(prev => {
      if (prev.length === 0) {
        return [id];
      }
      const firstSelectedDevice = DEVICES.find(d => d.id === prev[0]);
      if (!firstSelectedDevice) return [id]; 

      if (firstSelectedDevice.model !== targetDevice.model) {
        return [id];
      }
      return prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id];
    });
  };
  
  const selectScenario = (id: string) => {
     if (selectedScenarioId === id) {
       setSelectedScenarioId(undefined); 
       setTaskDesc(''); 
     } else {
       setSelectedScenarioId(id);
       const scenario = scenarios.find(s => s.id === id);
       if (scenario && !taskDesc) {
          setTaskDesc(scenario.description);
       }
     }
  }

  // Report Logic Helpers
  const getTaskReportData = (taskId: string) => {
    const staticTask = COMPLETED_TASKS.find(t => t.id === taskId);
    if (staticTask) return staticTask;

    const dynamicTask = queuedTasks.find(t => t.id === taskId);
    if (dynamicTask) {
        return {
        id: dynamicTask.id,
        name: dynamicTask.name,
        time: `${new Date().toISOString().slice(0,10)} ${dynamicTask.createdAt}`,
        deviceCount: dynamicTask.devices.length,
        successCount: Math.max(0, dynamicTask.devices.length - 1), 
        status: 'completed',
        score: 88,
        rating: 'A',
        duration: '1分30秒'
        };
    }
    
    return COMPLETED_TASKS[0]; 
  };

  const filteredStats = activePersonaTab === 'all' 
    ? PERSONA_STATS 
    : PERSONA_STATS.filter(p => p.id === activePersonaTab);

  const activeScenario = scenarios.find(s => s.id === selectedScenarioId);

  // 导出PDF函数
  const handleExportPDF = () => {
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowPrintView(false), 100);
    }, 300);
  };
  const activePersonas = personas.filter(p => selectedPersonas.includes(p.id));
  
  const uniqueModels = Array.from(new Set(DEVICES.map(d => d.model)));
  
  const displayedDevices = DEVICES.filter(d => modelFilter === 'all' || d.model === modelFilter);

  // --- Render Execution Steps View ---
  if (viewingExecutionTaskId) {
    const currentTask = getTaskReportData(viewingExecutionTaskId);
    
    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-slate-50 relative w-full">
            <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <button onClick={() => setViewingExecutionTaskId(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">任务执行详情</h2>
            </div>

            {/* Task Summary Card */}
            <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">{currentTask.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-100">
                            <span className="flex items-center gap-1"><Clock size={14}/> {currentTask.time}</span>
                            <span>|</span>
                            <span className="flex items-center gap-1"><Smartphone size={14}/> {MOCK_EXECUTION_PHASES.find(p => p.phaseNumber === 2)?.deviceLogs?.length || 0}台设备</span>
                            <span>|</span>
                            <span className="flex items-center gap-1"><Activity size={14}/> {MOCK_EXECUTION_PHASES.length}个阶段</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                        <MessageSquare size={24} />
                        <div>
                            <div className="text-xs text-slate-200">访谈轮次</div>
                            <div className="text-2xl font-bold">
                                {(() => {
                                    const phase2 = MOCK_EXECUTION_PHASES.find(p => p.phaseNumber === 2);
                                    return phase2?.deviceLogs?.reduce((sum, d) => sum + (d.qaDialogues?.length || 0), 0) || 0;
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Execution Phases Timeline - 四阶段执行时间轴 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-white">
                        <Activity size={20} />
                    </div>
                    执行步骤时间轴
                </h3>

                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-8 top-8 bottom-8 w-1 bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500 rounded-full opacity-40"></div>

                    <div className="space-y-6">
                        {MOCK_EXECUTION_PHASES.map((phase, index) => (
                            <div key={phase.id} className="relative">
                                {/* Phase Card */}
                                <div className={`ml-20 bg-gradient-to-r rounded-2xl p-6 shadow-lg text-white transition-all hover:shadow-xl
                                    ${phase.phaseNumber === 1 ? 'from-sky-500 to-sky-600' :
                                      phase.phaseNumber === 2 ? 'from-indigo-500 to-indigo-600' :
                                      phase.phaseNumber === 3 ? 'from-violet-500 to-violet-600' :
                                      'from-emerald-500 to-emerald-600'}`}
                                >
                                    {/* Phase Number Badge */}
                                    <div className={`absolute -left-20 top-6 w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold text-white shadow-xl
                                        ${phase.phaseNumber === 1 ? 'bg-gradient-to-br from-sky-400 to-sky-500' :
                                          phase.phaseNumber === 2 ? 'bg-gradient-to-br from-indigo-400 to-indigo-500' :
                                          phase.phaseNumber === 3 ? 'bg-gradient-to-br from-violet-400 to-violet-500' :
                                          'bg-gradient-to-br from-emerald-400 to-emerald-500'}`}
                                    >
                                        <span className="text-xs opacity-80">阶段</span>
                                        <span className="text-2xl">{phase.phaseNumber}</span>
                                    </div>

                                    {/* Phase Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex-1">
                                            <h4 className="text-2xl font-bold mb-2">{phase.phaseName}</h4>
                                            <p className="text-sm opacity-90">{phase.description}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-xs opacity-75">耗时</div>
                                                <div className="text-xl font-bold">{((phase.duration || 0) / 1000).toFixed(1)}s</div>
                                            </div>
                                            <div className={`px-4 py-2 rounded-lg font-bold text-sm
                                                ${phase.status === 'completed' ? 'bg-white/20' :
                                                  phase.status === 'running' ? 'bg-yellow-400 text-yellow-900 animate-pulse' :
                                                  phase.status === 'failed' ? 'bg-red-500' :
                                                  'bg-gray-400'}`}
                                            >
                                                {phase.status === 'completed' ? '✓ 已完成' :
                                                 phase.status === 'running' ? '⟳ 执行中' :
                                                 phase.status === 'failed' ? '✗ 失败' : '等待中'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Phase Specific Content */}
                                    {phase.phaseNumber === 2 && phase.deviceLogs && (
                                        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h5 className="text-lg font-bold flex items-center gap-2">
                                                    <Smartphone size={18} />
                                                    设备执行详情 ({phase.deviceLogs.length}台设备)
                                                </h5>
                                            </div>

                                            {/* Device Grid View */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                {phase.deviceLogs.map((deviceLog) => {
                                                    const isSelected = expandedDevices[deviceLog.deviceId] || false;
                                                    
                                                    return (
                                                        <button
                                                            key={deviceLog.deviceId}
                                                            onClick={() => setExpandedDevices({
                                                                ...expandedDevices,
                                                                [deviceLog.deviceId]: !isSelected
                                                            })}
                                                            className={`bg-white rounded-xl p-4 transition-all hover:shadow-lg border-2 ${
                                                                isSelected ? 'border-indigo-400 shadow-lg' : 'border-transparent'
                                                            }`}
                                                        >
                                                            {/* Device Screenshot/Thumbnail */}
                                                            <div className="w-full aspect-[9/16] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center text-6xl relative overflow-hidden">
                                                                {deviceLog.screenshot}
                                                                {/* Status Badge */}
                                                                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                                                                    deviceLog.status === 'success' ? 'bg-green-500' :
                                                                    deviceLog.status === 'warning' ? 'bg-orange-500' :
                                                                    'bg-red-500'
                                                                }`}></div>
                                                            </div>
                                                            
                                                            {/* User Persona */}
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-2xl">{deviceLog.personaIcon}</span>
                                                                <span className="text-sm font-bold text-gray-800 text-left">{deviceLog.personaName}</span>
                                                            </div>
                                                            
                                                            {/* Device Model */}
                                                            <div className="text-xs text-gray-600 text-left mb-1">{deviceLog.deviceModel}</div>
                                                            
                                                            {/* Duration */}
                                                            <div className="text-xs text-gray-500 text-left flex items-center gap-1">
                                                                <Clock size={12} />
                                                                {(deviceLog.duration / 1000).toFixed(1)}s
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Selected Device Details */}
                                            {phase.deviceLogs.filter(d => expandedDevices[d.deviceId]).map((deviceLog) => (
                                                <div key={`detail-${deviceLog.deviceId}`} className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
                                                    {/* Device Header */}
                                                    <div className="bg-gradient-to-r from-indigo-50 to-violet-50 p-4 border-b border-indigo-100">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-3xl">{deviceLog.personaIcon}</span>
                                                                <div>
                                                                    <div className="font-bold text-gray-800 text-lg">{deviceLog.personaName} - {deviceLog.deviceModel}</div>
                                                                    <div className="text-sm text-gray-600">设备ID: {deviceLog.deviceId}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold
                                                                    ${deviceLog.status === 'success' ? 'bg-green-100 text-green-700' :
                                                                      deviceLog.status === 'warning' ? 'bg-orange-100 text-orange-700' :
                                                                      'bg-red-100 text-red-700'}`}
                                                                >
                                                                    {deviceLog.status === 'success' ? '✓ 成功' :
                                                                     deviceLog.status === 'warning' ? '⚠ 警告' : '✗ 失败'}
                                                                </span>
                                                                <button
                                                                    onClick={() => setExpandedDevices({
                                                                        ...expandedDevices,
                                                                        [deviceLog.deviceId]: false
                                                                    })}
                                                                    className="p-1 hover:bg-white/50 rounded-full transition-colors"
                                                                >
                                                                    <X size={20} className="text-gray-600" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Device Details Content */}
                                                    <div className="p-4 space-y-4">
                                                        {/* Time Range */}
                                                        <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={14} />
                                                                开始: {deviceLog.startTime}
                                                            </span>
                                                            <span>→</span>
                                                            <span>结束: {deviceLog.endTime}</span>
                                                            <span className="ml-auto font-bold text-gray-800">
                                                                总耗时: {(deviceLog.duration / 1000).toFixed(1)}s
                                                            </span>
                                                        </div>

                                                        {/* Task Execution Log - Title & Indented List Format */}
                                                        <div>
                                                            <h6 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                                                <List size={14} />
                                                                任务执行日志 ({deviceLog.taskSteps.length}个主任务)
                                                            </h6>
                                                            <div className="bg-white rounded-lg p-6 border border-gray-200">
                                                                {/* Task List */}
                                                                <div className="space-y-6 font-mono text-sm">
                                                                    {deviceLog.taskSteps.map((taskStep, taskIdx) => (
                                                                        <div key={taskStep.id}>
                                                                            {/* Main Task Title */}
                                                                            <div className="flex items-center gap-3 mb-3 group/task">
                                                                                <div className={`font-bold ${
                                                                                    taskStep.status === 'completed' ? 'text-gray-900' :
                                                                                    taskStep.status === 'running' ? 'text-blue-700' :
                                                                                    'text-gray-400'
                                                                                }`}>
                                                                                    【任务{taskStep.taskNumber}：{taskStep.taskName}】
                                                                                </div>
                                                                                {taskStep.status === 'running' && (
                                                                                    <RefreshCw size={14} className="text-blue-600 animate-spin" />
                                                                                )}
                                                                                {taskStep.status === 'completed' && (
                                                                                    <CheckCircle size={14} className="text-green-600" />
                                                                                )}
                                                                                {taskStep.status === 'pending' && (
                                                                                    <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded">待执行</span>
                                                                                )}
                                                                                {(taskStep.status === 'completed' || taskStep.status === 'running') && (
                                                                                    <div className="flex items-center gap-1 text-gray-600 text-xs">
                                                                                        <Clock size={12} />
                                                                                        <span>{taskStep.totalDuration ? (taskStep.totalDuration / 1000).toFixed(1) : '0.0'}s</span>
                                                                                    </div>
                                                                                )}
                                                                                {/* Replay button for completed main tasks */}
                                                                                {taskStep.status === 'completed' && (
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            console.log(`重新执行整个任务${taskStep.taskNumber}`);
                                                                                            // TODO: 实现重新执行逻辑
                                                                                        }}
                                                                                        className="opacity-0 group-hover/task:opacity-100 transition-opacity ml-auto px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 flex items-center gap-1.5 border border-indigo-200"
                                                                                        title="从此任务重新执行"
                                                                                    >
                                                                                        <RefreshCw size={12} />
                                                                                        从此处重新执行
                                                                                    </button>
                                                                                )}
                                                                            </div>

                                                                            {/* Sub Tasks - Only show for completed or running tasks */}
                                                                            {(taskStep.status === 'completed' || taskStep.status === 'running') && (
                                                                                <div className="ml-6 space-y-3">
                                                                                    {taskStep.subTasks.map((subTask, subIdx) => (
                                                                                        <div key={subTask.id} className="group relative">
                                                                                            <div className="text-gray-800 leading-relaxed">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <span className="text-gray-900 font-medium">
                                                                                                        {subIdx + 1}. {subTask.name}
                                                                                                    </span>
                                                                                                    {subTask.duration && (
                                                                                                        <span className="text-gray-500 text-xs">
                                                                                                            ⏱️ {(subTask.duration / 1000).toFixed(1)}s
                                                                                                        </span>
                                                                                                    )}
                                                                                                    {/* Replay button for completed sub-tasks */}
                                                                                                    {subTask.status === 'completed' && (
                                                                                                        <button
                                                                                                            onClick={() => {
                                                                                                                console.log(`重新执行: 任务${taskStep.taskNumber} - 子任务${subIdx + 1}`);
                                                                                                                // TODO: 实现重新执行逻辑
                                                                                                            }}
                                                                                                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 px-2 py-0.5 text-[10px] bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center gap-1"
                                                                                                            title="从此步骤重新执行"
                                                                                                        >
                                                                                                            <RefreshCw size={10} />
                                                                                                            重新执行
                                                                                                        </button>
                                                                                                    )}
                                                                                                </div>
                                                                                                <div className="mt-1 text-gray-700 text-xs leading-relaxed ml-4">
                                                                                                    {subTask.description}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}

                                                                            {/* Separator */}
                                                                            {taskIdx < deviceLog.taskSteps.length - 1 && (
                                                                                <div className="mt-4 pt-4 border-t border-gray-200"></div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* Statistics Summary */}
                                                                <div className="mt-6 pt-4 border-t border-gray-300">
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <div className="flex items-center gap-6">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-gray-600">总任务数:</span>
                                                                                <span className="font-bold text-gray-800">{deviceLog.taskSteps.length}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-gray-600">总步骤数:</span>
                                                                                <span className="font-bold text-gray-800">
                                                                                    {deviceLog.taskSteps.reduce((sum, task) => sum + task.subTasks.length, 0)}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-gray-600">成功率:</span>
                                                                                <span className="font-bold text-green-600">
                                                                                    {(() => {
                                                                                        const total = deviceLog.taskSteps.reduce((sum, task) => sum + task.subTasks.length, 0);
                                                                                        const completed = deviceLog.taskSteps.reduce((sum, task) => 
                                                                                            sum + task.subTasks.filter(st => st.status === 'completed').length, 0
                                                                                        );
                                                                                        return total > 0 ? ((completed / total) * 100).toFixed(1) : '0';
                                                                                    })()}%
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-indigo-600">
                                                                            <Clock size={16} />
                                                                            <span className="text-gray-600">总耗时:</span>
                                                                            <span className="font-bold text-lg">
                                                                                {(deviceLog.taskSteps.reduce((sum, task) => sum + (task.totalDuration || 0), 0) / 1000).toFixed(1)}s
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Running Programs */}
                                                        <div>
                                                            <h6 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                                                <Layers size={14} />
                                                                运行程序 ({deviceLog.programs.length}个)
                                                            </h6>
                                                            <div className="flex flex-wrap gap-2">
                                                                {deviceLog.programs.map((program, progIdx) => (
                                                                    <span 
                                                                        key={progIdx}
                                                                        className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-mono border border-indigo-100"
                                                                    >
                                                                        {program}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Statistics */}
                                                        {(deviceLog.errorCount || deviceLog.warningCount) && (
                                                            <div className="flex gap-3 pt-3 border-t border-gray-200">
                                                                {deviceLog.errorCount > 0 && (
                                                                    <div className="flex items-center gap-1 text-red-600 text-sm">
                                                                        <XCircle size={16} />
                                                                        <span className="font-bold">{deviceLog.errorCount}</span>
                                                                        <span className="text-xs">错误</span>
                                                                    </div>
                                                                )}
                                                                {deviceLog.warningCount > 0 && (
                                                                    <div className="flex items-center gap-1 text-orange-600 text-sm">
                                                                        <AlertTriangle size={16} />
                                                                        <span className="font-bold">{deviceLog.warningCount}</span>
                                                                        <span className="text-xs">警告</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {phase.phaseNumber === 3 && (
                                        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h5 className="text-lg font-bold flex items-center gap-2">
                                                    <MessageSquare size={18} />
                                                    AI专家访谈记录
                                                </h5>
                                                <span className="text-sm opacity-90">
                                                    {(() => {
                                                        const phase2 = MOCK_EXECUTION_PHASES.find(p => p.phaseNumber === 2);
                                                        const totalQA = phase2?.deviceLogs?.reduce((sum, d) => sum + (d.qaDialogues?.length || 0), 0) || 0;
                                                        return `共${totalQA}轮对话`;
                                                    })()}
                                                </span>
                                            </div>

                                            {/* Interview Sessions by Device/User */}
                                            <div className="space-y-4">
                                                {(() => {
                                                    const phase2 = MOCK_EXECUTION_PHASES.find(p => p.phaseNumber === 2);
                                                    return phase2?.deviceLogs?.filter(d => d.qaDialogues && d.qaDialogues.length > 0).map((deviceLog) => {
                                                        const isExpanded = expandedDevices[`qa-${deviceLog.deviceId}`] || false;
                                                        
                                                        return (
                                                            <div key={`qa-${deviceLog.deviceId}`} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                                                {/* Interview Session Header - Collapsible */}
                                                                <button
                                                                    onClick={() => setExpandedDevices({
                                                                        ...expandedDevices,
                                                                        [`qa-${deviceLog.deviceId}`]: !isExpanded
                                                                    })}
                                                                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-2xl">{deviceLog.personaIcon}</span>
                                                                        <div>
                                                                            <div className="font-bold text-gray-800 flex items-center gap-2">
                                                                                <span>{deviceLog.personaName}</span>
                                                                                <span className="text-xs font-normal text-gray-500">
                                                                                    使用 {deviceLog.deviceModel}
                                                                                </span>
                                                                            </div>
                                                                            <div className="text-xs text-gray-600">
                                                                                AI专家访谈 · {deviceLog.qaDialogues?.length || 0}轮对话
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <ChevronDown 
                                                                        size={20} 
                                                                        className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                                                    />
                                                                </button>

                                                                {/* Interview Dialogues - Expandable */}
                                                                {isExpanded && (
                                                                    <div className="border-t border-gray-200 p-4 bg-gradient-to-br from-violet-50/50 to-purple-50/50 space-y-4">
                                                                        {deviceLog.qaDialogues?.map((qa, qaIdx) => (
                                                                            <div key={qa.id} className="space-y-3">
                                                                                {qaIdx > 0 && <div className="border-t border-violet-200 my-4"></div>}
                                                                                
                                                                                {/* Context Banner */}
                                                                                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                                                                                    <div className="flex items-start gap-2">
                                                                                        <Activity size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                                                                        <div className="flex-1">
                                                                                            <div className="text-xs font-bold text-blue-700 mb-1">访谈场景</div>
                                                                                            <p className="text-xs text-blue-900">{qa.context}</p>
                                                                                        </div>
                                                                                        <span className="text-[10px] text-blue-500 font-mono">{qa.timestamp}</span>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Interviewer Question */}
                                                                                <div className="flex gap-3">
                                                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                                                        访
                                                                                    </div>
                                                                                    <div className="flex-1 bg-white border border-violet-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
                                                                                        <div className="text-xs text-violet-600 font-bold mb-1">AI专家访问员</div>
                                                                                        <p className="text-sm text-gray-800">{qa.interviewer}</p>
                                                                                    </div>
                                                                                </div>

                                                                                {/* User Response */}
                                                                                <div className="flex gap-3 flex-row-reverse">
                                                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-xl flex-shrink-0">
                                                                                        {deviceLog.personaIcon}
                                                                                    </div>
                                                                                    <div className={`flex-1 rounded-2xl rounded-tr-none p-4 shadow-sm border
                                                                                        ${qa.sentiment === 'positive' ? 'bg-green-50 border-green-200' :
                                                                                          qa.sentiment === 'negative' ? 'bg-red-50 border-red-200' :
                                                                                          'bg-gray-50 border-gray-200'}`}
                                                                                    >
                                                                                        <div className="flex items-center justify-between mb-1">
                                                                                            <div className="text-xs text-blue-600 font-bold">{deviceLog.personaName}</div>
                                                                                            {qa.sentiment && (
                                                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                                                                                                    ${qa.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                                                                                      qa.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                                                                                      'bg-gray-100 text-gray-600'}`}
                                                                                                >
                                                                                                    {qa.sentiment === 'positive' ? '😊 积极' : qa.sentiment === 'negative' ? '😟 消极' : '😐 中性'}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                        <p className="text-sm text-gray-800">{qa.userResponse}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    {phase.phaseNumber === 4 && phase.reportSummary && (
                                        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                            <h5 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                <FileText size={18} />
                                                报告摘要
                                            </h5>
                                            <div className="grid grid-cols-4 gap-4">
                                                <div className="bg-white/20 rounded-lg p-3 text-center">
                                                    <div className="text-2xl font-bold">{phase.reportSummary.totalTests}</div>
                                                    <div className="text-xs opacity-80 mt-1">测试设备</div>
                                                </div>
                                                <div className="bg-white/20 rounded-lg p-3 text-center">
                                                    <div className="text-2xl font-bold">{phase.reportSummary.successRate}%</div>
                                                    <div className="text-xs opacity-80 mt-1">成功率</div>
                                                </div>
                                                <div className="bg-white/20 rounded-lg p-3 text-center">
                                                    <div className="text-2xl font-bold">{phase.reportSummary.avgDuration}s</div>
                                                    <div className="text-xs opacity-80 mt-1">平均耗时</div>
                                                </div>
                                                <div className="bg-white/20 rounded-lg p-3 text-center">
                                                    <div className="text-2xl font-bold">{phase.reportSummary.issues}</div>
                                                    <div className="text-xs opacity-80 mt-1">发现问题</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Time Range Footer */}
                                    {phase.startTime && phase.endTime && (
                                        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-xs opacity-75">
                                            <span>开始时间: {phase.startTime}</span>
                                            <span>结束时间: {phase.endTime}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                            <Clock size={24} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">总耗时</div>
                            <div className="text-2xl font-bold text-gray-800">
                                {(MOCK_EXECUTION_PHASES.reduce((acc, phase) => acc + (phase.duration || 0), 0) / 1000).toFixed(1)}秒
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Smartphone size={24} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">测试设备</div>
                            <div className="text-2xl font-bold text-gray-800">
                                {MOCK_EXECUTION_PHASES.find(p => p.phaseNumber === 2)?.deviceLogs?.length || 0}台
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">访谈轮次</div>
                            <div className="text-2xl font-bold text-gray-800">
                                {(() => {
                                    const phase2 = MOCK_EXECUTION_PHASES.find(p => p.phaseNumber === 2);
                                    return phase2?.deviceLogs?.reduce((sum, d) => sum + (d.qaDialogues?.length || 0), 0) || 0;
                                })()}轮
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">成功率</div>
                            <div className="text-2xl font-bold text-gray-800">
                                {MOCK_EXECUTION_PHASES.find(p => p.phaseNumber === 4)?.reportSummary?.successRate || 0}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button 
                    onClick={() => setViewingExecutionTaskId(null)}
                    className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft size={18} /> 返回任务列表
                </button>
                <button 
                    onClick={() => {
                        setViewingExecutionTaskId(null);
                        setViewingReportTaskId(currentTask.id);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium shadow-sm transition-colors"
                >
                    查看完整测试报告 <ArrowRight size={18} />
                </button>
            </div>
            </div>
        </div>
    );
  }

  // --- Render Report View ---
  // ... (keep Report View rendering logic)
  if (viewingReportTaskId) {
    const currentTask = getTaskReportData(viewingReportTaskId);

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-slate-50 relative w-full">
            <div className="max-w-7xl mx-auto">
            {/* 打印专用视图 - 只在打印时显示 */}
            <div className="hidden print:block">
                <div className="print-title">
                    中兴UX智能体 - 测试报告
                </div>
                
                {/* 基本信息 */}
                <div className="avoid-break">
                    <div className="print-section-title">一、测试概况</div>
                    <table>
                        <tbody>
                            <tr>
                                <th style={{width: '30%'}}>任务名称</th>
                                <td>{currentTask.name}</td>
                            </tr>
                            <tr>
                                <th>执行时间</th>
                                <td>{currentTask.time}</td>
                            </tr>
                            <tr>
                                <th>测试设备</th>
                                <td>{currentTask.deviceCount}台设备（成功{currentTask.successCount}台，失败{currentTask.deviceCount - currentTask.successCount}台）</td>
                            </tr>
                            <tr>
                                <th>平均耗时</th>
                                <td>{currentTask.duration}</td>
                            </tr>
                            <tr>
                                <th>综合评分</th>
                                <td><strong>{currentTask.score}分</strong> （等级: {currentTask.rating}）</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 可用性评分 */}
                <div className="avoid-break page-break">
                    <div className="print-section-title">二、可用性评分</div>
                    <table>
                        <thead>
                            <tr>
                                <th>评分维度</th>
                                <th style={{width: '20%'}}>得分</th>
                                <th>说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>综合可用性</strong></td>
                                <td><strong>{MOCK_USABILITY_SCORE.overall}分</strong></td>
                                <td>基于多维度加权计算</td>
                            </tr>
                            <tr>
                                <td>任务成功率</td>
                                <td>{MOCK_USABILITY_SCORE.taskSuccessRate}%</td>
                                <td>成功完成任务的比例</td>
                            </tr>
                            <tr>
                                <td>操作效率</td>
                                <td>{MOCK_USABILITY_SCORE.operationEfficiency}%</td>
                                <td>实际操作与标准流程的效率比</td>
                            </tr>
                            <tr>
                                <td>迷失度</td>
                                <td>{MOCK_USABILITY_SCORE.lostDegree}%</td>
                                <td>用户在操作中迷失的程度（越低越好）</td>
                            </tr>
                            <tr>
                                <td>错误率</td>
                                <td>{MOCK_USABILITY_SCORE.errorRate}%</td>
                                <td>操作中出现错误的比例（越低越好）</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 满意度评分 */}
                <div className="avoid-break">
                    <div className="print-section-title">三、满意度评分</div>
                    <table>
                        <thead>
                            <tr>
                                <th>评分维度</th>
                                <th style={{width: '20%'}}>得分</th>
                                <th>说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>综合满意度</strong></td>
                                <td><strong>{MOCK_SATISFACTION_SCORE.overall}分</strong></td>
                                <td>用户体验综合评价</td>
                            </tr>
                            <tr>
                                <td>NPS预测值</td>
                                <td>{MOCK_SATISFACTION_SCORE.npsScore > 0 ? '+' : ''}{MOCK_SATISFACTION_SCORE.npsScore}</td>
                                <td>净推荐值预测（-100至+100）</td>
                            </tr>
                            <tr>
                                <td>情感愉悦度</td>
                                <td>{MOCK_SATISFACTION_SCORE.emotionalPleasure}%</td>
                                <td>使用过程中的愉悦感受</td>
                            </tr>
                            <tr>
                                <td>认知负荷</td>
                                <td>{MOCK_SATISFACTION_SCORE.cognitiveLoad}%</td>
                                <td>思考和理解的难度（越低越好）</td>
                            </tr>
                            <tr>
                                <td>挫败感</td>
                                <td>{MOCK_SATISFACTION_SCORE.frustrationLevel}%</td>
                                <td>操作受挫程度（越低越好）</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 画像对比分析 */}
                <div className="avoid-break page-break">
                    <div className="print-section-title">四、用户画像对比分析</div>
                    <table>
                        <thead>
                            <tr>
                                <th>用户画像</th>
                                <th>成功率</th>
                                <th>平均耗时</th>
                                <th>操作步骤</th>
                                <th>满意度</th>
                            </tr>
                        </thead>
                        <tbody>
                            {PERSONA_STATS.map(stat => (
                                <tr key={stat.id}>
                                    <td>{stat.name}</td>
                                    <td>{stat.successRate}%</td>
                                    <td>{stat.time}</td>
                                    <td>{stat.steps}步</td>
                                    <td>{stat.sat}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 体验亮点 */}
                <div className="avoid-break">
                    <div className="print-section-title">五、体验亮点发现</div>
                    <table>
                        <thead>
                            <tr>
                                <th style={{width: '5%'}}>序号</th>
                                <th style={{width: '25%'}}>亮点标题</th>
                                <th style={{width: '15%'}}>分类</th>
                                <th>描述</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_HIGHLIGHTS.map((highlight, index) => (
                                <tr key={highlight.id}>
                                    <td style={{textAlign: 'center'}}>{index + 1}</td>
                                    <td><strong>{highlight.title}</strong></td>
                                    <td>
                                        {highlight.category === 'design' ? '视觉设计' :
                                         highlight.category === 'interaction' ? '交互体验' :
                                         highlight.category === 'performance' ? '性能优化' :
                                         highlight.category === 'accessibility' ? '易用性' : '创新功能'}
                                    </td>
                                    <td>{highlight.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{marginTop: '10px', padding: '8px', border: '1px solid #000'}}>
                        <strong>专家点评：</strong>本次测试发现的亮点主要集中在交互体验和视觉设计方面，说明产品团队在用户体验细节上投入了大量精力。
                    </div>
                </div>

                {/* 体验卡点 */}
                <div className="avoid-break page-break">
                    <div className="print-section-title">六、体验卡点分析</div>
                    <table>
                        <thead>
                            <tr>
                                <th style={{width: '5%'}}>序号</th>
                                <th style={{width: '25%'}}>问题标题</th>
                                <th style={{width: '10%'}}>严重度</th>
                                <th>问题描述</th>
                                <th style={{width: '25%'}}>改进建议</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_EXPERIENCE_ISSUES.map((issue, index) => (
                                <tr key={issue.id}>
                                    <td style={{textAlign: 'center'}}>{index + 1}</td>
                                    <td><strong>{issue.title}</strong></td>
                                    <td style={{textAlign: 'center'}}>
                                        {issue.severity === 'critical' || issue.severity === 'high' ? '高' :
                                         issue.severity === 'medium' ? '中' : '低'}
                                    </td>
                                    <td>{issue.description}</td>
                                    <td>{issue.recommendation}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 竞品对比 */}
                <div className="avoid-break">
                    <div className="print-section-title">七、竞品横向对比</div>
                    <table>
                        <thead>
                            <tr>
                                <th>品牌型号</th>
                                <th>完成时间</th>
                                <th>操作步数</th>
                                <th>成功率</th>
                                <th>满意度</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{backgroundColor: '#f0f0f0'}}>
                                <td><strong>ZTE Axon 50 Ultra</strong></td>
                                <td><strong>21秒</strong></td>
                                <td><strong>6步</strong></td>
                                <td><strong>92%</strong></td>
                                <td><strong>82</strong></td>
                            </tr>
                            {MOCK_COMPETITOR_DATA.map(comp => (
                                <tr key={comp.competitorName}>
                                    <td>{comp.competitorName}</td>
                                    <td>{comp.metrics.taskCompletionTime}秒</td>
                                    <td>{comp.metrics.stepCount}步</td>
                                    <td>{comp.metrics.successRate}%</td>
                                    <td>{comp.metrics.userSatisfaction}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{marginTop: '10px', padding: '8px', border: '1px solid #000'}}>
                        <strong>分析总结：</strong>相比华为Mate 60 Pro，我方在操作步骤数上存在明显差距，建议将省电模式提升至一级菜单。
                    </div>
                </div>

                {/* 定性反馈 */}
                <div className="avoid-break page-break">
                    <div className="print-section-title">八、定性反馈问答</div>
                    <table>
                        <thead>
                            <tr>
                                <th style={{width: '5%'}}>序号</th>
                                <th style={{width: '15%'}}>触发场景</th>
                                <th style={{width: '35%'}}>访问员提问</th>
                                <th>用户回答</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(MOCK_EXECUTION_PHASES.find(p => p.phaseNumber === 3)?.qaDialogues || [])
                                .map((qa, index) => (
                                <tr key={qa.id}>
                                    <td style={{textAlign: 'center'}}>{index + 1}</td>
                                    <td>{qa.context}</td>
                                    <td>{qa.interviewer}</td>
                                    <td>{qa.userResponse}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 报告结尾 */}
                <div style={{marginTop: '30px', borderTop: '2px solid #000', paddingTop: '10px', textAlign: 'center'}}>
                    <p><strong>报告生成时间：</strong>{new Date().toLocaleString('zh-CN')}</p>
                    <p><strong>测试平台：</strong>中兴UX智能体管理平台</p>
                </div>
            </div>

            {/* 正常屏幕视图 - 打印时隐藏 */}
            <div className="no-print">
            {/* Header Summary */}
            <div className="flex items-center gap-4 mb-2">
                <button onClick={() => setViewingReportTaskId(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">测试报告详情</h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-10 -mt-10 opacity-50"></div>
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-800">测试任务: {currentTask.name}</h2>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <MessageSquare size={12} /> 包含定性反馈数据
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Activity size={14}/> 执行时间: {currentTask.time}</span>
                    <span>|</span>
                    <span className="flex items-center gap-1"><Smartphone size={14}/> 设备总数: {currentTask.deviceCount}台</span>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                        <CheckCircle size={14}/> 成功: {currentTask.successCount}台
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1">
                        <XCircle size={14}/> 失败: {currentTask.deviceCount - currentTask.successCount}台
                    </span>
                    <span className="text-sm text-gray-600 font-medium">平均耗时: {currentTask.duration}</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - (currentTask.score / 100))} className="text-primary" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-primary">
                        <span className="text-2xl font-bold">{currentTask.score}</span>
                        <span className="text-[10px] uppercase font-semibold text-gray-400">Score</span>
                        </div>
                    </div>
                    <div className="h-16 w-px bg-gray-200 hidden lg:block"></div>
                    <div className="text-right hidden lg:block">
                    <div className="text-sm text-gray-500">UX等级评定</div>
                    <div className={`text-3xl font-bold ${currentTask.rating.startsWith('A') ? 'text-secondary' : currentTask.rating.startsWith('B') ? 'text-primary' : 'text-orange-500'}`}>{currentTask.rating}</div>
                    </div>
                </div>
                </div>
            </div>

            {/* Charts and Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Radar Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-primary" /> 评分维度
                </h3>
                <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="本次测试" dataKey="A" stroke="#3498DB" fill="#3498DB" fillOpacity={0.4} />
                    </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    {RADAR_DATA.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">{item.subject}</span>
                        <span className="font-bold text-gray-800">{item.A}%</span>
                        </div>
                    ))}
                </div>
                </div>

                {/* Persona Comparison Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Users size={20} className="text-primary" /> 画像对比分析
                    </h3>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['all', 'elderly', 'geek', 'child', 'business'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActivePersonaTab(tab)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activePersonaTab === tab ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                        {tab === 'all' ? '全部' : INITIAL_PERSONAS.find(p => p.id === tab)?.name}
                        </button>
                    ))}
                    </div>
                </div>
                
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                        <th className="px-4 py-3 rounded-l-lg">用户画像</th>
                        <th className="px-4 py-3">成功率</th>
                        <th className="px-4 py-3">平均耗时</th>
                        <th className="px-4 py-3">步骤数</th>
                        <th className="px-4 py-3 rounded-r-lg">满意度</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredStats.map((stat) => (
                        <tr key={stat.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 font-medium text-gray-900 flex items-center gap-2">
                            <span className="text-xl">{stat.icon}</span> {stat.name}
                            </td>
                            <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                                <span className={`font-bold ${stat.successRate < 80 ? 'text-orange-500' : 'text-secondary'}`}>
                                {stat.successRate}%
                                </span>
                                {stat.successRate < 70 && <AlertTriangle size={14} className="text-orange-500" />}
                            </div>
                            <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
                                <div 
                                className={`h-full rounded-full ${stat.successRate < 80 ? 'bg-orange-400' : 'bg-secondary'}`} 
                                style={{width: `${stat.successRate}%`}}
                                ></div>
                            </div>
                            </td>
                            <td className="px-4 py-4 text-gray-600">{stat.time}</td>
                            <td className="px-4 py-4 text-gray-600">{stat.steps} 步</td>
                            <td className="px-4 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${stat.sat >= 90 ? 'bg-green-100 text-green-700' : stat.sat < 70 ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                {stat.sat}%
                            </span>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>
            </div>

            {/* Multi-dimensional Scoring System */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Usability Score */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Activity size={20} className="text-blue-600" /> 可用性评分
                    </h3>
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 text-center border border-blue-100">
                            <div className="text-5xl font-bold text-blue-600 mb-1">{MOCK_USABILITY_SCORE.overall}</div>
                            <div className="text-sm text-blue-700 font-medium">综合可用性评分</div>
                            <div className="mt-2 flex justify-center gap-1">
                                {Array.from({length: 5}).map((_, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-full ${i < Math.floor(MOCK_USABILITY_SCORE.overall / 20) ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-600 flex items-center gap-1">
                                        <CheckCircle size={14} className="text-green-500" /> 任务成功率
                                    </span>
                                    <span className="text-sm font-bold text-gray-800">{MOCK_USABILITY_SCORE.taskSuccessRate}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 transition-all" style={{width: `${MOCK_USABILITY_SCORE.taskSuccessRate}%`}}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-600 flex items-center gap-1">
                                        <Zap size={14} className="text-blue-500" /> 操作效率
                                    </span>
                                    <span className="text-sm font-bold text-gray-800">{MOCK_USABILITY_SCORE.operationEfficiency}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all" style={{width: `${MOCK_USABILITY_SCORE.operationEfficiency}%`}}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-600 flex items-center gap-1">
                                        <AlertTriangle size={14} className="text-orange-500" /> 迷失度
                                    </span>
                                    <span className="text-sm font-bold text-gray-800">{MOCK_USABILITY_SCORE.lostDegree}%</span>
                                    <span className="text-xs text-gray-500">(越低越好)</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 transition-all" style={{width: `${MOCK_USABILITY_SCORE.lostDegree}%`}}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-600 flex items-center gap-1">
                                        <XCircle size={14} className="text-red-500" /> 错误率
                                    </span>
                                    <span className="text-sm font-bold text-gray-800">{MOCK_USABILITY_SCORE.errorRate}%</span>
                                    <span className="text-xs text-gray-500">(越低越好)</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 transition-all" style={{width: `${MOCK_USABILITY_SCORE.errorRate}%`}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Satisfaction Score */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BrainCircuit size={20} className="text-purple-600" /> 满意度评分
                    </h3>
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 text-center border border-purple-100">
                            <div className="text-5xl font-bold text-purple-600 mb-1">{MOCK_SATISFACTION_SCORE.overall}</div>
                            <div className="text-sm text-purple-700 font-medium">综合满意度评分</div>
                            <div className="mt-2 text-xs text-purple-600">NPS预测: <span className="font-bold text-lg">{MOCK_SATISFACTION_SCORE.npsScore > 0 ? '+' : ''}{MOCK_SATISFACTION_SCORE.npsScore}</span></div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-600">😊 情感愉悦度</span>
                                    <span className="text-sm font-bold text-gray-800">{MOCK_SATISFACTION_SCORE.emotionalPleasure}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all" style={{width: `${MOCK_SATISFACTION_SCORE.emotionalPleasure}%`}}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-600">🧠 认知负荷</span>
                                    <span className="text-sm font-bold text-gray-800">{MOCK_SATISFACTION_SCORE.cognitiveLoad}%</span>
                                    <span className="text-xs text-gray-500">(越低越好)</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all" style={{width: `${MOCK_SATISFACTION_SCORE.cognitiveLoad}%`}}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-600">😤 挫败感</span>
                                    <span className="text-sm font-bold text-gray-800">{MOCK_SATISFACTION_SCORE.frustrationLevel}%</span>
                                    <span className="text-xs text-gray-500">(越低越好)</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all" style={{width: `${MOCK_SATISFACTION_SCORE.frustrationLevel}%`}}></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 mt-4">
                            <div className="text-xs font-bold text-purple-900 mb-1">📊 用研专家解读</div>
                            <p className="text-xs text-purple-800">
                                整体满意度达到72分，处于中等偏上水平。情感愉悦度较好(68%)，但认知负荷和挫败感仍有优化空间。建议简化操作流程，降低用户心智负担。
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Experience Issues - Deep Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-orange-600" /> 体验卡点深度分析
                    </h3>
                    <div className="flex gap-2">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                            严重 {MOCK_EXPERIENCE_ISSUES.filter(i => i.severity === 'high' || i.severity === 'critical').length}
                        </span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                            中等 {MOCK_EXPERIENCE_ISSUES.filter(i => i.severity === 'medium').length}
                        </span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                            轻微 {MOCK_EXPERIENCE_ISSUES.filter(i => i.severity === 'low').length}
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    {MOCK_EXPERIENCE_ISSUES.map((issue, index) => (
                        <div key={issue.id} className={`border-l-4 rounded-lg p-4 transition-all hover:shadow-md ${
                            issue.severity === 'critical' || issue.severity === 'high' ? 'border-red-500 bg-red-50' :
                            issue.severity === 'medium' ? 'border-orange-500 bg-orange-50' :
                            'border-yellow-500 bg-yellow-50'
                        }`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0 ${
                                        issue.severity === 'critical' || issue.severity === 'high' ? 'bg-red-600' :
                                        issue.severity === 'medium' ? 'bg-orange-600' : 'bg-yellow-600'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 mb-1">{issue.title}</h4>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                issue.severity === 'critical' ? 'bg-red-200 text-red-800' :
                                                issue.severity === 'high' ? 'bg-red-100 text-red-700' :
                                                issue.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {issue.severity === 'critical' ? '🔥严重' : issue.severity === 'high' ? '⚠️高' : issue.severity === 'medium' ? '📍中' : '💡低'}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-medium">
                                                {issue.category === 'entry' ? '🚪入口问题' :
                                                 issue.category === 'wording' ? '✏️文案问题' :
                                                 issue.category === 'visual' ? '👁️视觉问题' :
                                                 issue.category === 'performance' ? '⚡性能问题' :
                                                 issue.category === 'logic' ? '🔄逻辑问题' : '📝其他'}
                                            </span>
                                            {issue.videoClip && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium flex items-center gap-1">
                                                    <Video size={10} /> {issue.videoClip}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="ml-11 space-y-3">
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="text-xs font-bold text-gray-700 mb-1">📍 问题位置</div>
                                    <p className="text-sm text-gray-600 font-mono">{issue.location}</p>
                                </div>

                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="text-xs font-bold text-gray-700 mb-1">📝 详细描述</div>
                                    <p className="text-sm text-gray-600">{issue.description}</p>
                                </div>

                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="text-xs font-bold text-gray-700 mb-1">👥 受影响用户</div>
                                    <div className="flex flex-wrap gap-2">
                                        {issue.impactedUsers.map((user, idx) => (
                                            <span key={idx} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded border border-purple-200">
                                                {user}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                    <div className="text-xs font-bold text-green-800 mb-1 flex items-center gap-1">
                                        <CheckCircle size={12} /> AI改进建议
                                    </div>
                                    <p className="text-sm text-green-800">{issue.recommendation}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Experience Highlights Discovery */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Zap size={20} className="text-yellow-600" /> 体验亮点发现
                </h3>
                <div className="mb-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-100">
                    <div className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <div className="text-sm font-bold text-yellow-900 mb-1">测试过程中发现 {MOCK_HIGHLIGHTS.length} 个体验亮点</div>
                            <p className="text-xs text-yellow-800">基于真实用户行为和AI分析，自动识别出优秀的交互设计和功能实现</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {MOCK_HIGHLIGHTS.map((highlight, index) => (
                        <div key={highlight.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all bg-gradient-to-r from-white to-yellow-50/30">
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0 ${
                                    highlight.impact === 'high' ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                                    highlight.impact === 'medium' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                                    'bg-gradient-to-br from-green-500 to-teal-600'
                                }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-bold text-gray-900 text-base">{highlight.title}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                                            highlight.category === 'design' ? 'bg-purple-100 text-purple-700' :
                                            highlight.category === 'interaction' ? 'bg-blue-100 text-blue-700' :
                                            highlight.category === 'performance' ? 'bg-green-100 text-green-700' :
                                            highlight.category === 'accessibility' ? 'bg-orange-100 text-orange-700' :
                                            'bg-pink-100 text-pink-700'
                                        }`}>
                                            {highlight.category === 'design' ? '🎨 视觉设计' :
                                             highlight.category === 'interaction' ? '👆 交互体验' :
                                             highlight.category === 'performance' ? '⚡ 性能优化' :
                                             highlight.category === 'accessibility' ? '♿ 易用性' :
                                             '💡 创新功能'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                            highlight.impact === 'high' ? 'bg-yellow-100 text-yellow-800' :
                                            highlight.impact === 'medium' ? 'bg-blue-100 text-blue-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {highlight.impact === 'high' ? '⭐ 高价值' :
                                             highlight.impact === 'medium' ? '📊 中等价值' :
                                             '✓ 常规优化'}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Users size={12} />
                                            <span>受益用户: {highlight.userGroups.join(', ')}</span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">{highlight.description}</p>

                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                        <div className="text-xs font-bold text-blue-900 mb-1 flex items-center gap-1">
                                            <Activity size={12} /> 数据支撑
                                        </div>
                                        <p className="text-xs text-blue-800">{highlight.evidence}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <div className="text-sm font-bold text-green-900 mb-2">💡 用研专家点评</div>
                            <p className="text-sm text-green-800">
                                本次测试发现的亮点主要集中在<span className="font-bold">交互体验</span>和<span className="font-bold">视觉设计</span>方面，
                                说明产品团队在用户体验细节上投入了大量精力。特别是针对老年用户群体的优化（如手势流畅度、权限引导），
                                体现了良好的包容性设计理念。建议将这些优秀实践总结为设计规范，在其他功能模块中推广应用。
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Competitor Comparison - Collapsible */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div 
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                    onClick={() => setCompetitorExpanded(!competitorExpanded)}
                >
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Share2 size={20} className="text-cyan-600" /> 竞品横向对比分析
                    </h3>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            对比 {MOCK_COMPETITOR_DATA.length} 个竞品
                        </span>
                        <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                            {competitorExpanded ? <ChevronUp size={20} className="text-gray-600" /> : <ChevronDown size={20} className="text-gray-600" />}
                        </button>
                    </div>
                </div>

                {competitorExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-100 pt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                
                <div className="mb-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-bold text-cyan-900 mb-1">当前测试设备</div>
                            <div className="text-xl font-bold text-cyan-700">ZTE Axon 50 Ultra (Android 14)</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-cyan-700">完成时间</div>
                            <div className="text-2xl font-bold text-cyan-900">21秒</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {MOCK_COMPETITOR_DATA.map((competitor, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-700">
                                        VS
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{competitor.competitorName}</h4>
                                        <p className="text-xs text-gray-500">{competitor.competitorModel}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500">完成时间</div>
                                    <div className={`text-xl font-bold ${competitor.metrics.taskCompletionTime < 21 ? 'text-red-600' : 'text-green-600'}`}>
                                        {competitor.metrics.taskCompletionTime}秒
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4 mb-4">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500 mb-1">操作步数</div>
                                    <div className={`text-lg font-bold ${competitor.metrics.stepCount < 6 ? 'text-red-600' : 'text-green-600'}`}>
                                        {competitor.metrics.stepCount}步
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">我方6步</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500 mb-1">成功率</div>
                                    <div className={`text-lg font-bold ${competitor.metrics.successRate > 92 ? 'text-red-600' : 'text-green-600'}`}>
                                        {competitor.metrics.successRate}%
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">我方92%</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500 mb-1">满意度</div>
                                    <div className={`text-lg font-bold ${competitor.metrics.userSatisfaction > 82 ? 'text-red-600' : 'text-green-600'}`}>
                                        {competitor.metrics.userSatisfaction}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">我方82</div>
                                </div>
                                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                                    <div className="text-xs text-blue-700 mb-1">差距</div>
                                    <div className={`text-lg font-bold ${competitor.metrics.taskCompletionTime < 21 ? 'text-red-600' : 'text-green-600'}`}>
                                        {competitor.metrics.taskCompletionTime < 21 ? '+' : ''}{Math.abs(competitor.metrics.taskCompletionTime - 21)}秒
                                    </div>
                                </div>
                            </div>

                            {competitor.advantage.length > 0 && (
                                <div className="mb-3">
                                    <div className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1">
                                        <CheckCircle size={12} /> 我方优势
                                    </div>
                                    <ul className="space-y-1">
                                        {competitor.advantage.map((adv, idx) => (
                                            <li key={idx} className="text-sm text-green-700 flex items-start gap-2">
                                                <span className="text-green-500 mt-0.5">✓</span>
                                                <span>{adv}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {competitor.disadvantage.length > 0 && (
                                <div>
                                    <div className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1">
                                        <XCircle size={12} /> 待优化项
                                    </div>
                                    <ul className="space-y-1">
                                        {competitor.disadvantage.map((dis, idx) => (
                                            <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                                                <span className="text-red-500 mt-0.5">✗</span>
                                                <span>{dis}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <BrainCircuit size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-blue-900 mb-2">🎯 竞品分析总结</div>
                                    <p className="text-sm text-blue-800 mb-2">
                                        相比华为Mate 60 Pro，我方在操作步骤数上存在明显差距（6步 vs 4步），导致完成时间延长约12秒。主要原因是省电模式入口层级过深。
                                    </p>
                                    <p className="text-sm text-blue-800">
                                        <span className="font-bold">建议：</span>参考竞品设计，将省电模式提升至一级菜单，预计可缩短操作步骤至4步，完成时间压缩至15秒以内，显著提升竞争力。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Qualitative Feedback Analysis */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MessageSquare size={20} className="text-purple-600" /> 定性反馈分析
                </h3>
                <div className="space-y-4">
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-purple-900">双角色问答数据</span>
                            <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-xs font-bold">
                                {MOCK_EXECUTION_PHASES.find(p => p.phaseNumber === 3)?.qaDialogues?.length || 0} 轮对话
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-white rounded-lg p-3 border border-purple-100">
                                <div className="text-2xl font-bold text-green-600">1</div>
                                <div className="text-xs text-gray-500 mt-1">积极反馈</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-purple-100">
                                <div className="text-2xl font-bold text-gray-600">1</div>
                                <div className="text-xs text-gray-500 mt-1">中性反馈</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-purple-100">
                                <div className="text-2xl font-bold text-red-600">1</div>
                                <div className="text-xs text-gray-500 mt-1">消极反馈</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <BrainCircuit size={16} /> 关键发现
                        </h4>
                        <div className="space-y-2">
                            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                                <AlertTriangle size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-orange-900 mb-1">用户在"高级设置"处产生犹豫</div>
                                    <p className="text-xs text-orange-800">用户反馈："高级"字眼让我觉得可能很复杂，不确定是否应该进入</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <MessageSquare size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-blue-900 mb-1">设置项过多导致查找困难</div>
                                    <p className="text-xs text-blue-800">用户反馈："设置项太多了，需要仔细看才能找到电池选项"</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                        <div className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-purple-600 flex-shrink-0" />
                            <div className="flex-1">
                                <div className="text-sm font-bold text-purple-900 mb-2">AI改进建议（基于定性反馈）</div>
                                <ul className="space-y-1.5 text-xs text-purple-800">
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-400 mt-0.5">▸</span>
                                        <span>将"省电模式"快捷入口提升至设置首屏，减少查找步骤</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-400 mt-0.5">▸</span>
                                        <span>将"高级设置"改名为"更多设置"或直接展开，降低心理门槛</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-400 mt-0.5">▸</span>
                                        <span>增加设置项搜索功能，提高常用功能的可发现性</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setViewingExecutionTaskId(currentTask.id)}
                        className="w-full py-2.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                        <MessageSquare size={16} />
                        查看完整问答记录
                    </button>
                </div>
            </div>

            {/* Problem & Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Problem Diagnosis */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-orange-500" /> 问题诊断
                </h3>
                {/* ... (Problem Diagnosis Content) ... */}
                <div className="border border-orange-100 rounded-lg overflow-hidden">
                    <div 
                    className="bg-orange-50 p-4 flex justify-between items-center cursor-pointer hover:bg-orange-100/50 transition-colors"
                    onClick={() => setProblemExpanded(!problemExpanded)}
                    >
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded bg-red-100 text-red-600 text-xs font-bold">1</span>
                        <div>
                        <h4 className="font-bold text-gray-800">省电模式入口过深</h4>
                        <p className="text-xs text-red-500 font-medium mt-0.5">影响用户: 老年用户组 (68%失败)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase">High</span>
                        {problemExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                    </div>
                    </div>
                    {problemExpanded && (
                    <div className="p-4 bg-white border-t border-orange-100 space-y-4">
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">
                        <span className="font-semibold text-gray-700">问题位置:</span> 设置 {'>'} 电池 {'>'} <span className="text-red-500">高级 (折叠项)</span> {'>'} 省电模式 <span className="text-xs text-gray-400">(共6步操作)</span>
                        </div>
                        {/* ... */}
                        <div className="space-y-2">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide">AI 建议方案</h5>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2 text-sm text-gray-700">
                            <div className="mt-0.5 min-w-[16px]"><CheckCircle size={16} className="text-secondary" /></div>
                            <p>将"省电模式"提升至"电池"一级菜单显示</p>
                            </div>
                        </div>
                        </div>
                    </div>
                    )}
                </div>
                </div>

                {/* Heatmap */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <MousePointer2 size={20} className="text-primary" /> 行为热力图
                    </h3>
                    <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">透明度</span>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={heatmapOpacity} 
                        onChange={(e) => setHeatmapOpacity(parseInt(e.target.value))}
                        className="w-20 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    </div>
                </div>
                
                <div className="flex-1 bg-gray-50 rounded-xl flex items-center justify-center p-4 overflow-hidden relative border border-dashed border-gray-200">
                    {/* Phone Frame */}
                    <div className="w-[200px] h-[400px] bg-white border-2 border-gray-800 rounded-[24px] relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 w-full h-6 bg-gray-100 border-b border-gray-200 flex justify-center items-center">
                        <div className="w-16 h-3 bg-black rounded-b-lg"></div>
                        </div>
                        {/* Simulated UI Content */}
                        <div className="mt-8 px-4 space-y-3 opacity-30">
                        <div className="h-4 w-1/3 bg-gray-400 rounded"></div>
                        <div className="h-20 w-full bg-gray-200 rounded-lg"></div>
                        <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
                        <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
                        </div>
                        
                        {/* Heatmap Overlay */}
                        <div 
                        className="absolute inset-0 pointer-events-none mix-blend-multiply" 
                        style={{ opacity: heatmapOpacity / 100 }}
                        >
                        <div className="absolute top-[120px] left-[40px] w-16 h-16 bg-red-500 rounded-full blur-xl opacity-80"></div>
                        <div className="absolute top-[140px] right-[50px] w-12 h-12 bg-orange-500 rounded-full blur-lg opacity-70"></div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
            
            {/* Bottom Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button 
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 text-sm font-medium shadow-sm transition-colors"
                >
                    <FileDown size={16} /> 导出 PDF 报告
                </button>
            </div>
            </div>
            </div>
        </div>
    );
  }

  // Filter tasks based on active tab
  const getFilteredTasks = () => {
    switch (taskFilterTab) {
      case 'active':
        return queuedTasks.filter(t => t.status === 'pending' || t.status === 'running');
      case 'completed':
        return queuedTasks.filter(t => t.status === 'completed');
      case 'draft':
        return queuedTasks.filter(t => t.status === 'draft');
      case 'all':
      default:
        return queuedTasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  // --- Render List View ---
  if (!isCreating) {
    return (
        // ... (keep List View rendering)
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-slate-50 w-full relative">
            <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">任务管理</h2>
                <button 
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                >
                    <PlusCircle size={20} /> 新建任务
                </button>
            </div>

            {/* Task List Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <List size={20} className="text-primary" /> 任务列表
                    </h3>
                    <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto">
                        <button 
                            onClick={() => setTaskFilterTab('all')}
                            className={`px-4 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                                taskFilterTab === 'all' 
                                    ? 'bg-white text-primary shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            全部 ({queuedTasks.length})
                        </button>
                        <button 
                            onClick={() => setTaskFilterTab('active')}
                            className={`px-4 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                                taskFilterTab === 'active' 
                                    ? 'bg-white text-primary shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            进行中/队列 ({queuedTasks.filter(t => t.status === 'pending' || t.status === 'running').length})
                        </button>
                        <button 
                            onClick={() => setTaskFilterTab('completed')}
                            className={`px-4 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                                taskFilterTab === 'completed' 
                                    ? 'bg-white text-primary shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            已完成 ({queuedTasks.filter(t => t.status === 'completed').length})
                        </button>
                        <button 
                            onClick={() => setTaskFilterTab('draft')}
                            className={`px-4 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                                taskFilterTab === 'draft' 
                                    ? 'bg-white text-primary shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            草稿 ({queuedTasks.filter(t => t.status === 'draft').length})
                        </button>
                    </div>
                </div>
                
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <List size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-400 text-sm">
                            {taskFilterTab === 'all' && '暂无任务，点击右上角新建'}
                            {taskFilterTab === 'active' && '暂无进行中或等待的任务'}
                            {taskFilterTab === 'completed' && '暂无已完成的任务'}
                            {taskFilterTab === 'draft' && '暂无草稿任务'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-medium">任务名称</th>
                                    <th className="px-4 py-3 font-medium">场景</th>
                                    <th className="px-4 py-3 font-medium">设备数</th>
                                    <th className="px-4 py-3 font-medium">状态</th>
                                    <th className="px-4 py-3 font-medium">创建时间</th>
                                    <th className="px-4 py-3 font-medium text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTasks.map(task => (
                                    <tr key={task.id} className={`hover:bg-gray-50 ${task.status === 'draft' ? 'bg-yellow-50/30' : ''}`}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">{task.name}</span>
                                                {task.status === 'draft' && (
                                                    <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-medium">
                                                        草稿
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {task.selectedScenarioId 
                                                ? scenarios.find(s => s.id === task.selectedScenarioId)?.name || '-'
                                                : <span className="text-gray-400 italic">未选择</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {task.devices.length > 0 
                                                ? `${task.devices.length} 台` 
                                                : <span className="text-gray-400">-</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                task.status === 'running' ? 'bg-blue-100 text-blue-700 animate-pulse' : 
                                                task.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                task.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {task.status === 'running' ? '⚡ 执行中' : 
                                                 task.status === 'completed' ? '✓ 已完成' : 
                                                 task.status === 'draft' ? '📝 草稿' :
                                                 '⏸ 等待中'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            <div>{task.createdAt}</div>
                                            {task.completedAt && (
                                                <div className="text-green-600 mt-0.5">完成: {task.completedAt}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {task.status === 'draft' && (
                                                    <button 
                                                        onClick={() => {
                                                            // Load draft and switch to create mode
                                                            setIsCreating(true);
                                                        }}
                                                        className="flex items-center gap-1.5 px-2 py-1 bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100 transition-colors text-xs font-medium"
                                                        title="继续编辑"
                                                    >
                                                        <Edit2 size={14} /> 编辑
                                                    </button>
                                                )}
                                                {task.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleStartTask(task.id)}
                                                        className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors text-xs font-medium"
                                                    >
                                                        <Play size={14} /> 开始
                                                    </button>
                                                )}
                                                {task.status === 'completed' && (
                                                    <>
                                                        <button 
                                                            onClick={() => setViewingExecutionTaskId(task.id)}
                                                            className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors text-xs font-medium"
                                                            title="查看执行步骤和问答详情"
                                                        >
                                                            <MessageSquare size={14} /> 执行详情
                                                        </button>
                                                        <button 
                                                            onClick={() => setViewingReportTaskId(task.id)}
                                                            className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors text-xs font-medium"
                                                        >
                                                            <FileText size={14} /> 报告
                                                        </button>
                                                    </>
                                                )}
                                                <button 
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100 transition-colors"
                                                    title="删除"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            </div>
        </div>
    );
  }

  // --- Render Creation View ---
  return (
    <div className="flex flex-col h-full w-full relative bg-slate-50">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 pb-32">
            {/* Title & Mode Switch */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsCreating(false)} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 shadow-sm transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">创建新测试任务</h2>
                </div>
                
                <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                <button 
                    onClick={() => setAdvancedMode(false)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${!advancedMode ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    基础配置
                </button>
                <button 
                    onClick={() => setAdvancedMode(true)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${advancedMode ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    可视化编排
                </button>
                </div>
            </div>

            {/* Basic Mode Content */}
            {!advancedMode ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* ... (keep Basic Mode Content) */}
                    {/* 1. Task Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">任务名称</label>
                            <input 
                            type="text" 
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            placeholder="请输入测试任务名称" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">任务描述 (NLP驱动)</label>
                            <div className="relative">
                            <textarea 
                                rows={3} 
                                value={taskDesc}
                                onChange={(e) => setTaskDesc(e.target.value)}
                                placeholder="请在此输入您希望手机执行的操作指令..." 
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow resize-none"
                            ></textarea>
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* 2. Scenario Selection */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Layers size={20} className="text-primary" /> 场景预设选择
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {scenarios.map(scenario => (
                            <div 
                                key={scenario.id}
                                onClick={() => selectScenario(scenario.id)}
                                className={`
                                flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50
                                ${selectedScenarioId === scenario.id ? 'border-primary bg-primary/5' : 'border-transparent bg-gray-50'}
                                `}
                            >
                                <div className="text-2xl bg-white w-10 h-10 flex items-center justify-center rounded-lg shadow-sm">{scenario.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h4 className="font-bold text-gray-800 text-sm">{scenario.name}</h4>
                                        {selectedScenarioId === scenario.id && <CheckCircle size={16} className="text-primary" />}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate" title={scenario.description}>{scenario.description}</p>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Persona Selection */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Users size={20} className="text-primary" /> 用户画像配置
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {personas.map(persona => (
                            <div 
                                key={persona.id}
                                onClick={() => togglePersona(persona.id)}
                                className={`
                                relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 hover:shadow-md
                                ${selectedPersonas.includes(persona.id) 
                                    ? 'border-primary bg-primary/5' 
                                    : 'border-transparent bg-gray-50 hover:bg-white hover:border-gray-200'
                                }
                                `}
                            >
                                {selectedPersonas.includes(persona.id) && (
                                <div className="absolute top-2 right-2 text-primary">
                                    <CheckCircle size={18} fill="white" className="bg-white rounded-full" />
                                </div>
                                )}
                                <div className="text-3xl mb-3">{persona.icon}</div>
                                <h4 className="font-bold text-gray-800">{persona.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">{persona.description}</p>
                            </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Device Selection */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <Smartphone size={20} className="text-primary" /> 目标设备选择
                                </h3>
                                {selectedDevices.length > 0 && (
                                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">
                                        已选 {selectedDevices.length} 台
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <select 
                                    value={modelFilter}
                                    onChange={(e) => setModelFilter(e.target.value)}
                                    className="appearance-none bg-white border border-gray-300 text-gray-700 py-1.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-shadow cursor-pointer shadow-sm hover:border-gray-400 min-w-[180px]"
                                >
                                    <option value="all">显示全部型号</option>
                                    {uniqueModels.map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg">
                            <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b sticky top-0 z-10">
                                <tr>
                                <th className="px-4 py-3 font-medium">状态</th>
                                <th className="px-4 py-3 font-medium">设备型号</th>
                                <th className="px-4 py-3 font-medium">系统版本</th>
                                <th className="px-4 py-3 font-medium">电量</th>
                                <th className="px-4 py-3 font-medium text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedDevices.map(device => {
                                  const isSelected = selectedDevices.includes(device.id);
                                  const firstSelectedDevice = selectedDevices.length > 0 ? DEVICES.find(d => d.id === selectedDevices[0]) : null;
                                  const isDifferentModel = firstSelectedDevice && firstSelectedDevice.model !== device.model;
                                  
                                  return (
                                <tr 
                                    key={device.id} 
                                    className={`border-b last:border-0 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                                >
                                    <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${device.isOnline ? 'bg-secondary' : 'bg-gray-300'}`}></span>
                                        <span className="text-xs text-gray-500">{device.isOnline ? '在线' : '离线'}</span>
                                    </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{device.model}</td>
                                    <td className="px-4 py-3 text-gray-600">{device.version}</td>
                                    <td className="px-4 py-3 text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <div className="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className={`h-full ${device.battery < 20 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${device.battery}%`}}></div>
                                        </div>
                                        <span className="text-xs">{device.battery}%</span>
                                    </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                    <button 
                                        onClick={() => toggleDevice(device.id)}
                                        disabled={!device.isOnline}
                                        className={`
                                        px-3 py-1 rounded text-xs font-medium transition-colors
                                        ${isSelected 
                                            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                            : isDifferentModel ? 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-primary' : 'bg-blue-50 text-primary hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed'
                                        }
                                        `}
                                    >
                                        {isSelected ? '移除' : '选择'}
                                    </button>
                                    </td>
                                </tr>
                                )})}
                            </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[700px] flex flex-col relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 grid grid-cols-[20px_20px] bg-[size:20px_20px] bg-grid-slate-200/[0.5] mask-image-linear-gradient(to_bottom,transparent,black,transparent) pointer-events-none" />

                    {/* Top: Configuration Node */}
                    <div className="relative z-10 flex flex-col items-center pt-16 pb-0">
                        {/* Horizontal Pill Config Node */}
                        <div className="bg-white rounded-full shadow-lg border border-gray-100 pl-4 pr-8 py-3 relative flex items-center gap-6 animate-in fade-in zoom-in duration-300">
                             
                             {/* Header Icon */}
                             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 text-primary flex items-center justify-center shadow-inner">
                                <Settings size={22} />
                             </div>
                             
                             {/* Main Info */}
                             <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Configuration Source</span>
                                <h3 className="text-lg font-bold text-gray-800">任务配置</h3>
                             </div>

                             <div className="h-8 w-px bg-gray-200 mx-2"></div>

                             {/* Scenario Item */}
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xl border border-gray-100">
                                   {activeScenario?.icon || '📦'}
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-[10px] font-bold text-gray-400 uppercase">Scenario</span>
                                   <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">{activeScenario?.name || '未选择'}</span>
                                </div>
                             </div>

                             <div className="h-8 w-px bg-gray-200 mx-2"></div>
                             
                             {/* Personas Item */}
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100">
                                   <Users size={18} />
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-[10px] font-bold text-gray-400 uppercase">Personas</span>
                                   <div className="flex -space-x-1.5 pt-0.5">
                                      {activePersonas.length > 0 ? activePersonas.map((p, i) => (
                                         <div key={p.id} className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] shadow-sm relative z-10" title={p.name}>
                                            {p.icon}
                                         </div>
                                      )) : <span className="text-sm font-medium text-gray-400">未选择</span>}
                                   </div>
                                </div>
                             </div>

                             {/* Bottom Connector Dot */}
                             <div className="absolute left-1/2 -bottom-1.5 transform -translate-x-1/2 w-3 h-3 bg-white border-2 border-primary rounded-full z-20"></div>
                        </div>

                        {/* Task Flow Visualization */}
                        <div className="relative w-full max-w-3xl mx-auto my-6">
                            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-primary/30 -ml-[1px]"></div>
                            
                            {/* AI Core Processing Node */}
                            <div className="relative z-10 flex justify-center mb-8">
                                <div className="bg-white p-2 rounded-full border-2 border-primary/20 shadow-md animate-pulse">
                                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                                        <BrainCircuit size={24} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-16 gap-y-8 relative z-10 pb-8">
                                {/* Step 1 */}
                                <div className="flex justify-end items-center text-right pr-4 relative group">
                                    <div className="absolute right-[-38px] top-1/2 w-3 h-3 bg-blue-500 rounded-full border-4 border-white shadow-sm z-20"></div>
                                    <div className="absolute right-[-34px] top-1/2 w-8 h-[1px] bg-blue-200"></div>
                                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 group-hover:border-blue-200 group-hover:shadow-md transition-all">
                                        <div className="flex items-center gap-2 justify-end mb-1">
                                            <span className="font-bold text-gray-700 text-sm">1. 处理命令中</span>
                                            <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600">
                                                <MessageSquare size={16} />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-400">解析自然语言指令意图</p>
                                    </div>
                                </div>
                                <div className="col-start-2"></div>

                                {/* Step 2 */}
                                <div></div>
                                <div className="flex justify-start items-center pl-4 relative group">
                                    <div className="absolute left-[-38px] top-1/2 w-3 h-3 bg-purple-500 rounded-full border-4 border-white shadow-sm z-20"></div>
                                    <div className="absolute left-[-34px] top-1/2 w-8 h-[1px] bg-purple-200"></div>
                                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 group-hover:border-purple-200 group-hover:shadow-md transition-all">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="bg-purple-50 p-1.5 rounded-lg text-purple-600">
                                                <GitMerge size={16} />
                                            </div>
                                            <span className="font-bold text-gray-700 text-sm">2. 生成执行路径</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400">构建非线性任务流程图</p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="flex justify-end items-center text-right pr-4 relative group">
                                    <div className="absolute right-[-38px] top-1/2 w-3 h-3 bg-orange-500 rounded-full border-4 border-white shadow-sm z-20"></div>
                                    <div className="absolute right-[-34px] top-1/2 w-8 h-[1px] bg-orange-200"></div>
                                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 group-hover:border-orange-200 group-hover:shadow-md transition-all">
                                        <div className="flex items-center gap-2 justify-end mb-1">
                                            <span className="font-bold text-gray-700 text-sm">3. 模拟真实操作</span>
                                            <div className="bg-orange-50 p-1.5 rounded-lg text-orange-600">
                                                <Fingerprint size={16} />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-400">注入用户画像行为特征</p>
                                    </div>
                                </div>
                                <div className="col-start-2"></div>

                                {/* Step 4 */}
                                <div></div>
                                <div className="flex justify-start items-center pl-4 relative group">
                                    <div className="absolute left-[-38px] top-1/2 w-3 h-3 bg-green-500 rounded-full border-4 border-white shadow-sm z-20"></div>
                                    <div className="absolute left-[-34px] top-1/2 w-8 h-[1px] bg-green-200"></div>
                                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 group-hover:border-green-200 group-hover:shadow-md transition-all">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="bg-green-50 p-1.5 rounded-lg text-green-600">
                                                <Zap size={16} />
                                            </div>
                                            <span className="font-bold text-gray-700 text-sm">4. 下发执行</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400">设备集群并行处理</p>
                                    </div>
                                </div>

                                {/* Step 5 - QA Feedback */}
                                <div className="flex justify-end items-center text-right pr-4 relative group">
                                    <div className="absolute right-[-38px] top-1/2 w-3 h-3 bg-pink-500 rounded-full border-4 border-white shadow-sm z-20"></div>
                                    <div className="absolute right-[-34px] top-1/2 w-8 h-[1px] bg-pink-200"></div>
                                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-3 rounded-xl shadow-sm border border-pink-100 group-hover:border-pink-200 group-hover:shadow-md transition-all">
                                        <div className="flex items-center gap-2 justify-end mb-1">
                                            <span className="font-bold text-gray-700 text-sm">5. 定性反馈问答</span>
                                            <div className="bg-pink-100 p-1.5 rounded-lg text-pink-600">
                                                <MessageSquare size={16} />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-400">虚拟访问员实时追问</p>
                                    </div>
                                </div>
                                <div className="col-start-2"></div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Device Mapping Pool */}
                    <div className="flex-1 bg-slate-50/80 border-t border-dashed border-primary/30 p-8 relative overflow-y-auto max-h-[600px]">
                        {/* ... (keep existing device mapping pool content) */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full z-20"></div>
                        
                        <div className="max-w-7xl mx-auto h-full flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="font-bold text-gray-700 flex items-center gap-2">
                                    <Smartphone size={20} className="text-primary"/> 
                                    映射设备 ({selectedDevices.length})
                                    <span className="text-xs font-normal text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                                        Target
                                    </span>
                                </h4>
                                {selectedDevices.length > 0 && (
                                    <span className="text-xs text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
                                        <CheckCircle size={12}/> Ready to test
                                    </span>
                                )}
                            </div>

                            {selectedDevices.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-white/50 min-h-[200px]">
                                    <Smartphone size={48} className="opacity-20 mb-4"/>
                                    <p>请在基础配置中选择目标设备</p>
                                    <button onClick={() => setAdvancedMode(false)} className="mt-4 text-primary text-sm hover:underline">去选择设备</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                                    {selectedDevices.map((deviceId, index) => {
                                        const device = DEVICES.find(d => d.id === deviceId);
                                        if (!device) return null;
                                        return (
                                            <div 
                                                key={device.id}
                                                onClick={() => setPreviewDevice(device)}
                                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer group hover:shadow-md hover:border-primary/50 transition-all animate-in fade-in zoom-in duration-300"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                {/* Device Screen Thumbnail */}
                                                <div className="h-32 bg-gray-900 relative overflow-hidden flex justify-center items-center">
                                                    {/* Simulated UI */}
                                                    <div className="w-full h-full opacity-80 scale-95 group-hover:scale-100 transition-transform duration-500">
                                                        {/* Simple Abstract UI */}
                                                        <div className="absolute top-4 left-4 right-4 h-4 bg-gray-700 rounded-md mb-2"></div>
                                                        <div className="absolute top-12 left-4 w-1/3 h-20 bg-gray-800 rounded-md"></div>
                                                        <div className="absolute top-12 right-4 w-1/2 h-4 bg-gray-700 rounded-md"></div>
                                                        <div className="absolute top-20 right-4 w-1/2 h-4 bg-gray-700 rounded-md"></div>
                                                        <div className="absolute top-28 right-4 w-1/3 h-4 bg-gray-700 rounded-md"></div>
                                                    </div>
                                                    
                                                    {/* Hover Overlay */}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                                                        <Maximize2 size={24} className="mb-2"/>
                                                        <span className="text-xs font-medium">预览实时画面</span>
                                                    </div>
                                                </div>
                                                
                                                {/* Device Info */}
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div className="font-bold text-gray-800 text-sm truncate pr-2">{device.model}</div>
                                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${device.isOnline ? 'bg-secondary' : 'bg-gray-300'}`}></div>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                                        <span>{device.version}</span>
                                                        <span className={device.battery < 20 ? 'text-red-500 font-bold' : ''}>{device.battery}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Device Preview Modal */}
                    {previewDevice && (
                       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPreviewDevice(null)}>
                          <div className="bg-white rounded-3xl p-3 max-w-sm w-full shadow-2xl transform scale-100 transition-all animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
                             <div className="relative border-8 border-gray-800 rounded-[2rem] overflow-hidden bg-gray-900 aspect-[9/19]">
                                {/* StatusBar */}
                                <div className="h-7 bg-black text-white text-[10px] px-5 flex justify-between items-center select-none">
                                   <span>12:00</span>
                                   <div className="flex gap-1.5">
                                      <Activity size={10} />
                                      <Battery size={10} />
                                   </div>
                                </div>
                                {/* Content */}
                                <div className="bg-white h-full p-4 relative">
                                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full">
                                      <Smartphone size={48} className="mx-auto text-gray-200 mb-4" />
                                      <p className="text-gray-600 font-bold mb-1">{previewDevice.model}</p>
                                      <p className="text-xs text-blue-500 animate-pulse">● 实时画面流接入中...</p>
                                   </div>
                                   {/* Simulated UI elements */}
                                   <div className="absolute top-4 left-4 right-4 space-y-3 opacity-20 pointer-events-none">
                                       <div className="w-full h-12 bg-gray-400 rounded-lg"></div>
                                       <div className="w-2/3 h-4 bg-gray-400 rounded"></div>
                                       <div className="grid grid-cols-4 gap-2 mt-4">
                                         {[1,2,3,4,5,6,7,8].map(i => (
                                             <div key={i} className="aspect-square bg-gray-400 rounded-lg"></div>
                                         ))}
                                       </div>
                                   </div>
                                </div>
                                {/* Home Bar */}
                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1/3 h-1 bg-white/50 rounded-full"></div>
                             </div>
                             <button 
                               onClick={() => setPreviewDevice(null)}
                               className="absolute -top-3 -right-3 bg-white text-gray-800 rounded-full p-1.5 shadow-lg border hover:bg-gray-100 transition-colors"
                             >
                                <X size={18} />
                             </button>
                          </div>
                       </div>
                    )}
                </div>
            )}
        </div>

        {/* Bottom Action Bar */}
        <div className="sticky bottom-0 left-0 w-full bg-white border-t border-gray-200 flex items-center justify-between px-8 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 backdrop-blur-sm bg-white/95"> 
           <div className="flex gap-4">
                 <button 
                    onClick={handleSaveDraft}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                 >
                    <Save size={18} /> 保存草稿
                 </button>
           </div>
           <div className="flex items-center gap-4">
               <button 
                   onClick={handleAddToQueue}
                   className="flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-secondary to-green-600 hover:shadow-lg hover:to-green-500 transform hover:-translate-y-0.5 transition-all"
               >
                   <Plus size={20} /> 添加到任务列表
                </button>
           </div>
        </div>
    </div>
  );
};

const App = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Initial Tasks Data
  const INITIAL_TASKS: QueuedTask[] = [
    // 已完成的任务
    {
      id: 'task_001',
      name: '网购下单流程测试',
      description: '完整测试从商品搜索到支付完成的电商购物流程',
      selectedScenarioId: 'shopping',
      personas: ['elderly', 'geek'],
      devices: ['d1', 'd2', 'd4'],
      advancedMode: false,
      concurrency: true,
      retryCount: 1,
      powerSavingMode: false,
      monitorPerformance: true,
      nodes: [],
      status: 'completed',
      createdAt: '2026-02-04 14:30:15',
      completedAt: '2026-02-04 14:35:48'
    },
    {
      id: 'task_002',
      name: '重度游戏性能测试',
      description: '测试设备在长时间游戏场景下的性能表现',
      selectedScenarioId: 'gaming',
      personas: ['geek', 'child'],
      devices: ['d12', 'd13', 'd14'],
      advancedMode: true,
      concurrency: false,
      retryCount: 2,
      powerSavingMode: false,
      monitorPerformance: true,
      nodes: [],
      status: 'completed',
      createdAt: '2026-02-03 10:20:00',
      completedAt: '2026-02-03 11:05:30'
    },
    {
      id: 'task_003',
      name: '社交分享功能验证',
      description: '验证拍照、编辑、发布动态的完整流程',
      selectedScenarioId: 'social',
      personas: ['business', 'child'],
      devices: ['d16', 'd17'],
      advancedMode: false,
      concurrency: true,
      retryCount: 1,
      powerSavingMode: true,
      monitorPerformance: false,
      nodes: [],
      status: 'completed',
      createdAt: '2026-02-02 16:45:20',
      completedAt: '2026-02-02 16:48:35'
    },
    // 等待中的任务
    {
      id: 'task_004',
      name: '驾车导航功能测试',
      description: '测试地图导航的准确性和语音交互',
      selectedScenarioId: 'nav',
      personas: ['business'],
      devices: ['d19', 'd20', 'd21'],
      advancedMode: false,
      concurrency: true,
      retryCount: 1,
      powerSavingMode: false,
      monitorPerformance: true,
      nodes: [],
      status: 'pending',
      createdAt: '2026-02-05 09:15:30'
    },
    {
      id: 'task_005',
      name: '通话质量压力测试',
      description: '测试长时间通话的稳定性和音质',
      selectedScenarioId: 'call',
      personas: ['elderly', 'business'],
      devices: ['d1', 'd4', 'd9'],
      advancedMode: false,
      concurrency: false,
      retryCount: 3,
      powerSavingMode: false,
      monitorPerformance: true,
      nodes: [],
      status: 'pending',
      createdAt: '2026-02-05 09:30:45'
    },
    // 草稿任务
    {
      id: 'task_006',
      name: '多任务切换测试',
      description: '',
      selectedScenarioId: undefined,
      personas: ['geek'],
      devices: ['d12'],
      advancedMode: false,
      concurrency: true,
      retryCount: 1,
      powerSavingMode: false,
      monitorPerformance: true,
      nodes: [],
      status: 'draft',
      createdAt: '2026-02-05 08:50:12'
    },
    {
      id: 'task_007',
      name: '适老化界面测试',
      description: '验证大字体、高对比度等适老化功能',
      selectedScenarioId: undefined,
      personas: ['elderly'],
      devices: [],
      advancedMode: false,
      concurrency: true,
      retryCount: 1,
      powerSavingMode: false,
      monitorPerformance: true,
      nodes: [],
      status: 'draft',
      createdAt: '2026-02-04 17:20:00'
    }
  ];

  // Shared State
  const [personas, setPersonas] = useState<Persona[]>(INITIAL_PERSONAS);
  const [scenarios, setScenarios] = useState<Scenario[]>(INITIAL_SCENARIOS);
  const [queuedTasks, setQueuedTasks] = useState<QueuedTask[]>(INITIAL_TASKS);

  const navItems = [
    { id: 'dashboard', label: '总览', icon: LayoutDashboard },
    { id: 'task-management', label: '任务管理', icon: List },
    { id: 'personas', label: '用户画像库', icon: Users },
    { id: 'scenarios', label: '场景库', icon: Layers },
    { id: 'devices', label: '设备管理', icon: Smartphone },
  ];

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onChangeTab={setCurrentTab} personas={personas} scenarios={scenarios} devices={DEVICES} queuedTasks={queuedTasks} />;
      case 'personas':
        return <PersonaLibraryView personas={personas} setPersonas={setPersonas} />;
      case 'scenarios':
        return <ScenarioLibraryView scenarios={scenarios} setScenarios={setScenarios} />;
      case 'devices':
        return <DeviceFarmView />;
      case 'task-management':
        return <TaskManagementView personas={personas} scenarios={scenarios} queuedTasks={queuedTasks} setQueuedTasks={setQueuedTasks} />;
      default:
        return <DashboardView onChangeTab={setCurrentTab} personas={personas} scenarios={scenarios} devices={DEVICES} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-gray-900">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-20 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            UX
          </div>
          {!isSidebarCollapsed && <span className="ml-3 font-bold text-lg text-gray-800 tracking-tight">中兴智能体 <span className="text-blue-600">Agent</span></span>}
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <SidebarItem 
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={currentTab === item.id}
              collapsed={isSidebarCollapsed}
              onClick={() => setCurrentTab(item.id)}
            />
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100 space-y-2">
           <SidebarItem icon={Settings} label="系统设置" collapsed={isSidebarCollapsed} />
           <div 
             onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
             className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors"
           >
             {isSidebarCollapsed ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
             {!isSidebarCollapsed && <span className="font-medium">收起侧边栏</span>}
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
           <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-800">{navItems.find(n => n.id === currentTab)?.label}</h1>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 System Online
              </div>
              <button className="relative p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                 <Bell size={20} />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border-2 border-white shadow-sm cursor-pointer"></div>
           </div>
        </header>

        {/* Content View */}
        {renderContent()}
      </div>
    </div>
  );
};

export default App;