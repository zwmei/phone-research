export interface Persona {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: string[];
  // 人口统计学特征
  age?: string;
  gender?: string;
  occupation?: string;
  visionStatus?: 'normal' | 'mild' | 'moderate' | 'severe'; // 视力状况
  // 行为特征
  operationSpeed?: 'slow' | 'medium' | 'fast'; // 操作速度
  missTouchRate?: number; // 误触概率 (0-100)
  gesturePreference?: string[]; // 手势偏好
  // 心理特征
  patience?: number; // 耐心值 (0-100)
  newFeatureAcceptance?: 'low' | 'medium' | 'high'; // 对新功能的接受度
}

export interface Device {
  id: string;
  model: string;
  version: string;
  isOnline: boolean;
  battery: number;
}

export interface FlowNode {
  id: string;
  type: 'start' | 'action' | 'condition' | 'end';
  label: string;
  x: number;
  y: number;
}

export interface Scenario {
  id: string;
  name: string;
  icon: string;
  description: string;
  complexity: 'Low' | 'Medium' | 'High';
  // 场景分类
  category?: 'system' | 'app' | 'communication' | 'entertainment' | 'productivity' | 'other';
  // 预期耗时（秒）
  estimatedDuration?: number;
  // 操作步骤
  steps?: string[];
  // 前置条件
  preconditions?: string[];
  // 预期结果
  expectedResult?: string;
  // 关键检查点
  checkpoints?: string[];
  // 网络环境要求
  networkRequirement?: 'none' | 'wifi' | 'mobile' | 'any';
  // 优先级
  priority?: 'low' | 'medium' | 'high' | 'critical';
  // 适用设备类型
  deviceTypes?: string[];
}

export interface TaskDraft {
  name: string;
  description: string;
  selectedScenarioId?: string;
  personas: string[];
  devices: string[];
  advancedMode: boolean;
  concurrency: boolean;
  retryCount: number;
  powerSavingMode: boolean;
  monitorPerformance: boolean;
  nodes: FlowNode[];
}

export interface QueuedTask extends TaskDraft {
  id: string;
  status: 'draft' | 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface LogEntry {
  id: number;
  time: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface QADialogue {
  id: string;
  timestamp: string;
  interviewer: string; // 虚拟访问员的问题
  userResponse: string; // 虚拟用户的回答
  context: string; // 触发问答的上下文（如：操作犹豫、长时间停留等）
  sentiment?: 'positive' | 'neutral' | 'negative'; // 情感分析
}

// 子任务
export interface SubTask {
  id: string;
  name: string;
  description: string; // 详细描述：AI用户做了什么 → 系统返回什么 → 下一步决定
  status?: 'completed' | 'failed' | 'skipped';
  duration?: number; // 耗时（毫秒）
}

// 主任务
export interface TaskStep {
  id: string;
  taskNumber: number;
  taskName: string;
  subTasks: SubTask[];
  totalDuration?: number; // 该任务总耗时
  status?: 'pending' | 'running' | 'completed' | 'failed'; // 任务状态
}

// 单个设备的执行记录
export interface DeviceExecutionLog {
  deviceId: string;
  deviceModel: string;
  personaId: string; // 用户画像ID
  personaName: string; // 用户画像名称
  personaIcon: string; // 用户画像图标
  status: 'success' | 'failed' | 'warning';
  startTime: string;
  endTime: string;
  duration: number; // 耗时（毫秒）
  taskSteps: TaskStep[]; // 执行的具体任务和子任务（树状结构）
  programs: string[]; // 运行的程序
  errorCount?: number;
  warningCount?: number;
  screenshot?: string; // 设备截图/缩略图
  qaDialogues?: QADialogue[]; // 该设备对应的访谈记录
}

// 任务执行的四个阶段
export interface TaskExecutionPhase {
  id: string;
  phaseNumber: number;
  phaseName: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  duration?: number; // 耗时（毫秒）
  // 阶段2特有：设备执行日志
  deviceLogs?: DeviceExecutionLog[];
  // 阶段3特有：访谈对话
  qaDialogues?: QADialogue[];
  // 阶段4特有：报告信息
  reportSummary?: {
    totalTests: number;
    successRate: number;
    avgDuration: number;
    issues: number;
  };
}

export interface TaskExecutionStep {
  id: string;
  stepNumber: number;
  stepName: string;
  status: 'pending' | 'running' | 'completed' | 'paused';
  duration?: number; // 耗时（毫秒）
  userAction?: string; // 用户操作描述
  hesitation?: boolean; // 是否有犹豫
  qaDialogues?: QADialogue[]; // 该步骤产生的问答对话
  backCount?: number; // 回退次数
  errorCount?: number; // 错误操作次数
  videoTimestamp?: string; // 录屏时间戳
}

// 多维度评分
export interface UsabilityScore {
  taskSuccessRate: number; // 任务成功率 (0-100)
  operationEfficiency: number; // 操作效率 (0-100)
  lostDegree: number; // 迷失度 (0-100, 越低越好)
  errorRate: number; // 错误率 (0-100, 越低越好)
  overall: number; // 综合评分 (0-100)
}

export interface SatisfactionScore {
  npsScore: number; // NPS预测评分 (-100 to 100)
  emotionalPleasure: number; // 情感愉悦度 (0-100)
  cognitiveLoad: number; // 认知负荷 (0-100, 越低越好)
  frustrationLevel: number; // 挫败感 (0-100, 越低越好)
  overall: number; // 综合满意度 (0-100)
}

// 体验卡点
export interface ExperienceIssue {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'entry' | 'wording' | 'visual' | 'performance' | 'logic' | 'other';
  description: string;
  location: string; // 问题位置
  videoClip?: string; // 录屏片段链接
  screenshot?: string; // 截图
  impactedUsers: string[]; // 受影响的用户画像
  recommendation: string; // 改进建议
}

// 竞品对比数据
export interface CompetitorComparison {
  competitorName: string;
  competitorModel: string;
  metrics: {
    taskCompletionTime: number; // 完成时间
    stepCount: number; // 操作步数
    successRate: number; // 成功率
    userSatisfaction: number; // 用户满意度
  };
  advantage: string[]; // 我方优势
  disadvantage: string[]; // 我方劣势
}

// 体验亮点发现
export interface HighlightDiscovery {
  id: string;
  title: string;
  category: 'design' | 'interaction' | 'performance' | 'accessibility' | 'innovation';
  description: string;
  impact: 'high' | 'medium' | 'low'; // 影响程度
  userGroups: string[]; // 受益用户群体
  evidence: string; // 数据支撑
}