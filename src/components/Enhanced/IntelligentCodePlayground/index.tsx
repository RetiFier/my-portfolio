import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import modular components
import AlgorithmVisualizer from '../AlgorithmVisualizer';
import CustomExampleCreator from '../CustomExampleCreator';
import RecruiterInsights from '../RecruiterInsights';
import CodeEditor from '../CodeEditor';
import ExampleSidebar from '../ExampleSidebar';
import ModeSelector from '../ModeSelector';

// Night Owl Theme Colors
const nightOwl = {
  bg: '#011627',
  surface: '#0b2942',
  darker: '#001122',
  accent: '#82aaff',
  secondary: '#c792ea',
  success: '#addb67',
  warning: '#ffcb8b',
  error: '#ff5874',
  text: '#d6deeb',
  textDim: '#5f7e97',
  border: '#1d3b53',
  selection: '#1d3b53'
};

// Interfaces
interface CodeExample {
  id: string;
  title: string;
  language: string;
  code: string;
  description: string;
  executable: boolean;
  category: string;
  complexity?: string;
  skills?: string[];
  visualization?: {
    type: string;
    steps?: Array<{
      id: number;
      description: string;
      data: any;
    }>;
  };
}

interface AIAssistance {
  type: 'suggestion' | 'warning' | 'error' | 'optimization';
  message: string;
  line?: number;
  severity: 'low' | 'medium' | 'high';
}

interface RecruiterInsight {
  category: 'skills' | 'quality' | 'methodology' | 'adaptation' | 'collaboration';
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface SkillDemonstration {
  skill: string;
  demonstrated: boolean;
  examples: string[];
  proficiency: number;
  lastUsed: Date;
}

// Default code examples (simplified for demo)
const defaultCodeExamples: CodeExample[] = [
  {
    id: 'react-performance',
    title: 'React Performance Hook',
    language: 'javascript',
    category: 'React Optimization',
    complexity: 'Advanced',
    skills: ['React', 'Performance', 'Hooks'],
    visualization: {
      type: 'stateManagement',
      steps: [
        { id: 1, description: 'Initialize performance metrics', data: { renderTime: 0 } },
        { id: 2, description: 'Measure render time', data: { renderTime: 15.2 } },
        { id: 3, description: 'Update metrics state', data: { renderTime: 15.2, updated: true } }
      ]
    },
    code: `// React Performance Monitoring Hook
import { useState, useEffect, useRef } from 'react';

const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0
  });
  
  const startTime = useRef(Date.now());
  
  useEffect(() => {
    const endTime = Date.now();
    const renderTime = endTime - startTime.current;
    
    setMetrics(prev => ({
      ...prev,
      renderTime,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      componentCount: document.querySelectorAll('[data-reactroot]').length
    }));
  }, []);
  
  return { metrics };
};

// Usage Example
function OptimizedComponent() {
  const { metrics } = usePerformanceMonitor();
  
  return (
    <div>
      <h2>Performance Metrics</h2>
      <p>Render Time: {metrics.renderTime}ms</p>
      <p>Memory Usage: {(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB</p>
    </div>
  );
}`,
    description: 'Advanced React hook for monitoring component performance and memory usage.',
    executable: true
  },
  {
    id: 'binary-search-tree',
    title: 'Binary Search Tree',
    language: 'javascript',
    category: 'Data Structures',
    complexity: 'Intermediate',
    skills: ['JavaScript', 'Data Structures', 'Algorithms', 'Tree Traversal'],
    visualization: {
      type: 'dataStructure',
      steps: [
        { id: 1, description: 'Create empty BST', data: { tree: [], operation: 'init' } },
        { id: 2, description: 'Insert root node (10)', data: { tree: [10], operation: 'insert', value: 10 } },
        { id: 3, description: 'Insert left child (5)', data: { tree: [10, 5], operation: 'insert', value: 5 } },
        { id: 4, description: 'Insert right child (15)', data: { tree: [10, 5, 15], operation: 'insert', value: 15 } },
        { id: 5, description: 'Search for value (5)', data: { tree: [10, 5, 15], operation: 'search', value: 5, found: true } }
      ]
    },
    code: `// Binary Search Tree Implementation
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(value) {
    const newNode = new TreeNode(value);
    
    if (!this.root) {
      this.root = newNode;
      return this;
    }
    
    let current = this.root;
    while (true) {
      if (value === current.value) return undefined;
      
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          return this;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          return this;
        }
        current = current.right;
      }
    }
  }

  search(value) {
    let current = this.root;
    while (current) {
      if (value === current.value) return current;
      current = value < current.value ? current.left : current.right;
    }
    return null;
  }

  inOrderTraversal(node = this.root, result = []) {
    if (node) {
      this.inOrderTraversal(node.left, result);
      result.push(node.value);
      this.inOrderTraversal(node.right, result);
    }
    return result;
  }
}

// Usage Example
const bst = new BinarySearchTree();
bst.insert(10).insert(5).insert(15).insert(3).insert(7);
console.log('In-order traversal:', bst.inOrderTraversal());
console.log('Search for 7:', bst.search(7) ? 'Found' : 'Not found');`,
    description: 'Efficient binary search tree with insertion, search, and traversal methods.',
    executable: true
  },
  {
    id: 'async-task-queue',
    title: 'Async Task Queue',
    language: 'javascript',
    category: 'Async Programming',
    complexity: 'Advanced',
    skills: ['JavaScript', 'Async/Await', 'Queue', 'Error Handling'],
    visualization: {
      type: 'algorithm',
      steps: [
        { id: 1, description: 'Initialize empty queue', data: { queue: [], running: 0, completed: 0 } },
        { id: 2, description: 'Add tasks to queue', data: { queue: ['task1', 'task2', 'task3'], running: 0, completed: 0 } },
        { id: 3, description: 'Start processing tasks', data: { queue: ['task2', 'task3'], running: 1, completed: 0 } },
        { id: 4, description: 'Task completed', data: { queue: ['task3'], running: 1, completed: 1 } },
        { id: 5, description: 'All tasks completed', data: { queue: [], running: 0, completed: 3 } }
      ]
    },
    code: `// Advanced Async Task Queue with Priority and Retry
class AsyncTaskQueue {
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
    this.queue = [];
    this.running = 0;
    this.completed = 0;
    this.failed = 0;
  }

  async add(task, priority = 0, retries = 3) {
    return new Promise((resolve, reject) => {
      const taskWrapper = {
        task,
        priority,
        retries,
        resolve,
        reject,
        id: Date.now() + Math.random()
      };
      
      // Insert based on priority (higher priority first)
      const insertIndex = this.queue.findIndex(t => t.priority < priority);
      if (insertIndex === -1) {
        this.queue.push(taskWrapper);
      } else {
        this.queue.splice(insertIndex, 0, taskWrapper);
      }
      
      this.process();
    });
  }

  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const taskWrapper = this.queue.shift();

    try {
      console.log(\`Starting task \${taskWrapper.id}\`);
      const result = await taskWrapper.task();
      
      this.completed++;
      taskWrapper.resolve(result);
      console.log(\`Task \${taskWrapper.id} completed\`);
      
    } catch (error) {
      if (taskWrapper.retries > 0) {
        console.log(\`Task \${taskWrapper.id} failed, retrying...\`);
        taskWrapper.retries--;
        this.queue.unshift(taskWrapper); // Retry with same priority
      } else {
        this.failed++;
        taskWrapper.reject(error);
        console.log(\`Task \${taskWrapper.id} failed permanently\`);
      }
    } finally {
      this.running--;
      this.process(); // Process next task
    }
  }

  getStats() {
    return {
      queued: this.queue.length,
      running: this.running,
      completed: this.completed,
      failed: this.failed
    };
  }
}

// Usage Example
const taskQueue = new AsyncTaskQueue(2);

// Simulate different tasks
const createTask = (name, duration, shouldFail = false) => () => 
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error(\`\${name} failed\`));
      else resolve(\`\${name} completed\`);
    }, duration);
  });

// Add tasks with different priorities
taskQueue.add(createTask('High Priority', 1000), 10);
taskQueue.add(createTask('Low Priority', 500), 1);
taskQueue.add(createTask('Medium Priority', 750), 5);

console.log('Queue stats:', taskQueue.getStats());`,
    description: 'Production-ready async task queue with priority handling and automatic retries.',
    executable: true
  },
  {
    id: 'debounce-throttle',
    title: 'Debounce & Throttle Utils',
    language: 'javascript',
    category: 'Performance Utilities',
    complexity: 'Intermediate',
    skills: ['JavaScript', 'Performance', 'Event Handling', 'Optimization'],
    visualization: {
      type: 'algorithm',
      steps: [
        { id: 1, description: 'Function called rapidly', data: { calls: 5, executed: 0, waiting: false } },
        { id: 2, description: 'Debounce delays execution', data: { calls: 5, executed: 0, waiting: true } },
        { id: 3, description: 'Timer resets on new calls', data: { calls: 8, executed: 0, waiting: true } },
        { id: 4, description: 'Final execution after delay', data: { calls: 8, executed: 1, waiting: false } }
      ]
    },
    code: `// Advanced Debounce and Throttle Utilities
function debounce(func, delay, immediate = false) {
  let timeoutId;
  let lastCallTime;
  
  return function executedFunction(...args) {
    const callNow = immediate && !timeoutId;
    lastCallTime = Date.now();
    
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate) func.apply(this, args);
    }, delay);
    
    if (callNow) func.apply(this, args);
  };
}

function throttle(func, limit) {
  let inThrottle;
  let lastFunc;
  let lastRan;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

// Advanced version with cancellation
function advancedDebounce(func, delay, options = {}) {
  const { immediate = false, maxWait = null } = options;
  let timeoutId;
  let maxTimeoutId;
  let lastCallTime;
  let lastInvokeTime = 0;
  
  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;
    
    lastInvokeTime = time;
    return func.apply(thisArg, args);
  }
  
  function cancel() {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    if (maxTimeoutId !== undefined) {
      clearTimeout(maxTimeoutId);
    }
    lastInvokeTime = 0;
    maxTimeoutId = timeoutId = lastCallTime = undefined;
  }
  
  function debounced(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;
    
    if (isInvoking) {
      if (timeoutId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait) {
        timeoutId = setTimeout(timerExpired, delay);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeoutId === undefined) {
      timeoutId = setTimeout(timerExpired, delay);
    }
    return result;
  }
  
  debounced.cancel = cancel;
  debounced.flush = () => {
    return timeoutId === undefined ? result : trailingEdge(Date.now());
  };
  
  return debounced;
}

// Usage Examples
const debouncedSearch = debounce((query) => {
  console.log(\`Searching for: \${query}\`);
}, 300);

const throttledScroll = throttle(() => {
  console.log('Scroll event handled');
}, 100);

// Simulate rapid calls
console.log('Testing debounce:');
for (let i = 0; i < 5; i++) {
  setTimeout(() => debouncedSearch(\`query\${i}\`), i * 50);
}`,
    description: 'Performance utilities for controlling function execution frequency with advanced features.',
    executable: true
  },
  {
    id: 'websocket-manager',
    title: 'WebSocket Manager',
    language: 'javascript',
    category: 'Real-time Communication',
    complexity: 'Advanced',
    skills: ['JavaScript', 'WebSockets', 'Real-time', 'Event Handling'],
    visualization: {
      type: 'apiFlow',
      steps: [
        { id: 1, description: 'Initialize connection', data: { status: 'connecting', messages: 0, reconnects: 0 } },
        { id: 2, description: 'Connection established', data: { status: 'connected', messages: 0, reconnects: 0 } },
        { id: 3, description: 'Messages flowing', data: { status: 'connected', messages: 5, reconnects: 0 } },
        { id: 4, description: 'Connection lost', data: { status: 'disconnected', messages: 5, reconnects: 0 } },
        { id: 5, description: 'Auto-reconnecting', data: { status: 'reconnecting', messages: 5, reconnects: 1 } }
      ]
    },
    code: `// Production-Ready WebSocket Manager
class WebSocketManager {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      reconnectInterval: 1000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      ...options
    };
    
    this.ws = null;
    this.reconnectAttempts = 0;
    this.listeners = new Map();
    this.messageQueue = [];
    this.isConnected = false;
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      this.setupEventListeners();
      this.startHeartbeat();
    } catch (error) {
      this.handleError(error);
    }
  }

  setupEventListeners() {
    this.ws.onopen = (event) => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.flushMessageQueue();
      this.emit('open', event);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle heartbeat responses
        if (data.type === 'pong') {
          return;
        }
        
        this.emit('message', data);
      } catch (error) {
        this.emit('message', event.data);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.isConnected = false;
      this.stopHeartbeat();
      this.emit('close', event);
      
      if (!event.wasClean && this.shouldReconnect()) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.handleError(error);
    };
  }

  send(data) {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
      return true;
    } else {
      this.messageQueue.push(message);
      return false;
    }
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'ping', timestamp: Date.now() });
      }
    }, this.options.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in event callback:', error);
      }
    });
  }

  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (!this.send(message)) {
        this.messageQueue.unshift(message);
        break;
      }
    }
  }

  shouldReconnect() {
    return this.reconnectAttempts < this.options.maxReconnectAttempts;
  }

  scheduleReconnect() {
    const delay = this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(\`Reconnecting... Attempt \${this.reconnectAttempts}\`);
      this.connect();
    }, delay);
  }

  close() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client closing');
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      readyState: this.ws?.readyState,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length
    };
  }
}

// Usage Example
const wsManager = new WebSocketManager('wss://echo.websocket.org');

wsManager.on('open', () => console.log('Connected!'));
wsManager.on('message', (data) => console.log('Received:', data));
wsManager.on('close', () => console.log('Disconnected!'));

wsManager.connect();

// Send a test message
setTimeout(() => {
  wsManager.send({ type: 'test', message: 'Hello WebSocket!' });
}, 1000);`,
    description: 'Production-ready WebSocket manager with automatic reconnection, heartbeat, and message queuing.',
    executable: true
  },
  {
    id: 'state-machine',
    title: 'State Machine Pattern',
    language: 'javascript',
    category: 'Design Patterns',
    complexity: 'Advanced',
    skills: ['JavaScript', 'State Management', 'Design Patterns', 'Architecture'],
    visualization: {
      type: 'stateManagement',
      steps: [
        { id: 1, description: 'Initial state: idle', data: { state: 'idle', transitions: ['loading'], context: {} } },
        { id: 2, description: 'Transition to loading', data: { state: 'loading', transitions: ['success', 'error'], context: { startTime: Date.now() } } },
        { id: 3, description: 'Loading successful', data: { state: 'success', transitions: ['idle'], context: { data: 'loaded' } } },
        { id: 4, description: 'Reset to idle', data: { state: 'idle', transitions: ['loading'], context: {} } }
      ]
    },
    code: `// Advanced State Machine Implementation
class StateMachine {
  constructor(config) {
    this.states = config.states;
    this.initialState = config.initialState;
    this.currentState = this.initialState;
    this.context = config.context || {};
    this.listeners = [];
    
    // Validate configuration
    this.validateConfig();
  }

  validateConfig() {
    if (!this.states[this.initialState]) {
      throw new Error(\`Initial state '\${this.initialState}' not found\`);
    }
    
    // Validate all transitions point to valid states
    Object.keys(this.states).forEach(stateName => {
      const state = this.states[stateName];
      if (state.on) {
        Object.values(state.on).forEach(transition => {
          const targetState = typeof transition === 'string' ? transition : transition.target;
          if (!this.states[targetState]) {
            throw new Error(\`Target state '\${targetState}' not found\`);
          }
        });
      }
    });
  }

  transition(event, payload = {}) {
    const currentStateConfig = this.states[this.currentState];
    const transition = currentStateConfig.on?.[event];
    
    if (!transition) {
      console.warn(\`No transition for event '\${event}' in state '\${this.currentState}'\`);
      return false;
    }

    const previousState = this.currentState;
    let targetState;
    let actions = [];

    if (typeof transition === 'string') {
      targetState = transition;
    } else {
      targetState = transition.target;
      
      // Check guards
      if (transition.guard && !transition.guard(this.context, payload)) {
        console.warn(\`Guard failed for transition '\${event}'\`);
        return false;
      }
      
      actions = transition.actions || [];
    }

    // Execute exit actions
    if (currentStateConfig.exit) {
      currentStateConfig.exit(this.context, payload);
    }

    // Execute transition actions
    actions.forEach(action => {
      if (typeof action === 'function') {
        action(this.context, payload);
      } else if (typeof action === 'string' && this.actions[action]) {
        this.actions[action](this.context, payload);
      }
    });

    // Update state
    this.currentState = targetState;

    // Execute entry actions
    const newStateConfig = this.states[targetState];
    if (newStateConfig.entry) {
      newStateConfig.entry(this.context, payload);
    }

    // Notify listeners
    this.notifyListeners(previousState, targetState, event, payload);

    return true;
  }

  can(event) {
    const currentStateConfig = this.states[this.currentState];
    return !!currentStateConfig.on?.[event];
  }

  getAvailableTransitions() {
    const currentStateConfig = this.states[this.currentState];
    return Object.keys(currentStateConfig.on || {});
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners(from, to, event, payload) {
    this.listeners.forEach(listener => {
      try {
        listener({
          from,
          to,
          event,
          payload,
          context: this.context
        });
      } catch (error) {
        console.error('Error in state machine listener:', error);
      }
    });
  }

  getState() {
    return {
      current: this.currentState,
      context: { ...this.context },
      availableTransitions: this.getAvailableTransitions()
    };
  }
}

// Example: User Authentication State Machine
const authStateMachine = new StateMachine({
  initialState: 'loggedOut',
  context: {
    user: null,
    attempts: 0,
    lastError: null
  },
  states: {
    loggedOut: {
      on: {
        LOGIN: {
          target: 'loggingIn',
          actions: [(context, payload) => {
            context.attempts++;
            context.lastError = null;
          }]
        }
      }
    },
    loggingIn: {
      entry: (context) => console.log('Starting login process...'),
      on: {
        SUCCESS: {
          target: 'loggedIn',
          actions: [(context, payload) => {
            context.user = payload.user;
            context.attempts = 0;
          }]
        },
        FAILURE: {
          target: 'loggedOut',
          guard: (context) => context.attempts < 3,
          actions: [(context, payload) => {
            context.lastError = payload.error;
          }]
        },
        FAILURE: {
          target: 'locked',
          guard: (context) => context.attempts >= 3
        }
      }
    },
    loggedIn: {
      entry: (context) => console.log(\`Welcome, \${context.user?.name}!\`),
      on: {
        LOGOUT: 'loggedOut'
      }
    },
    locked: {
      entry: () => console.log('Account locked due to too many failed attempts'),
      on: {
        UNLOCK: 'loggedOut'
      }
    }
  }
});

// Usage
authStateMachine.subscribe((transition) => {
  console.log(\`State changed: \${transition.from} -> \${transition.to}\`);
});

// Simulate authentication flow
console.log('Initial state:', authStateMachine.getState());
authStateMachine.transition('LOGIN');
authStateMachine.transition('SUCCESS', { user: { name: 'John Doe' } });
console.log('Final state:', authStateMachine.getState());`,
    description: 'Robust finite state machine implementation for managing complex application states.',
    executable: true
  },
  {
    id: 'graph-algorithms',
    title: 'Graph Algorithms (Dijkstra)',
    language: 'javascript',
    category: 'Algorithms',
    complexity: 'Expert',
    skills: ['JavaScript', 'Graph Theory', 'Shortest Path', 'Priority Queue'],
    visualization: {
      type: 'algorithm',
      steps: [
        { id: 1, description: 'Initialize distances', data: { nodes: ['A', 'B', 'C'], distances: { A: 0, B: Infinity, C: Infinity }, visited: [] } },
        { id: 2, description: 'Visit node A', data: { nodes: ['A', 'B', 'C'], distances: { A: 0, B: 4, C: 2 }, visited: ['A'], current: 'A' } },
        { id: 3, description: 'Visit node C', data: { nodes: ['A', 'B', 'C'], distances: { A: 0, B: 3, C: 2 }, visited: ['A', 'C'], current: 'C' } },
        { id: 4, description: 'Visit node B', data: { nodes: ['A', 'B', 'C'], distances: { A: 0, B: 3, C: 2 }, visited: ['A', 'C', 'B'], current: 'B' } }
      ]
    },
    code: `// Dijkstra's Shortest Path Algorithm with Priority Queue
class PriorityQueue {
  constructor() {
    this.values = [];
  }

  enqueue(val, priority) {
    this.values.push({ val, priority });
    this.sort();
  }

  dequeue() {
    return this.values.shift();
  }

  sort() {
    this.values.sort((a, b) => a.priority - b.priority);
  }
}

class WeightedGraph {
  constructor() {
    this.adjacencyList = {};
  }

  addVertex(vertex) {
    if (!this.adjacencyList[vertex]) this.adjacencyList[vertex] = [];
  }

  addEdge(vertex1, vertex2, weight) {
    this.adjacencyList[vertex1].push({ node: vertex2, weight });
    this.adjacencyList[vertex2].push({ node: vertex1, weight });
  }

  dijkstra(start, finish) {
    const nodes = new PriorityQueue();
    const distances = {};
    const previous = {};
    let path = [];
    let smallest;

    // Build initial state
    for (let vertex in this.adjacencyList) {
      if (vertex === start) {
        distances[vertex] = 0;
        nodes.enqueue(vertex, 0);
      } else {
        distances[vertex] = Infinity;
        nodes.enqueue(vertex, Infinity);
      }
      previous[vertex] = null;
    }

    // Main algorithm
    while (nodes.values.length) {
      smallest = nodes.dequeue().val;
      
      if (smallest === finish) {
        // Build path to return
        while (previous[smallest]) {
          path.push(smallest);
          smallest = previous[smallest];
        }
        break;
      }

      if (smallest || distances[smallest] !== Infinity) {
        for (let neighbor in this.adjacencyList[smallest]) {
          let nextNode = this.adjacencyList[smallest][neighbor];
          let candidate = distances[smallest] + nextNode.weight;
          let nextNeighbor = nextNode.node;
          
          if (candidate < distances[nextNeighbor]) {
            distances[nextNeighbor] = candidate;
            previous[nextNeighbor] = smallest;
            nodes.enqueue(nextNeighbor, candidate);
          }
        }
      }
    }

    return {
      path: path.concat(smallest).reverse(),
      distance: distances[finish],
      distances: distances
    };
  }

  // A* Algorithm for comparison
  aStar(start, goal, heuristic) {
    const openSet = new PriorityQueue();
    const closedSet = new Set();
    const gScore = {};
    const fScore = {};
    const cameFrom = {};

    // Initialize scores
    for (let vertex in this.adjacencyList) {
      gScore[vertex] = Infinity;
      fScore[vertex] = Infinity;
    }

    gScore[start] = 0;
    fScore[start] = heuristic(start, goal);
    openSet.enqueue(start, fScore[start]);

    while (openSet.values.length > 0) {
      const current = openSet.dequeue().val;

      if (current === goal) {
        // Reconstruct path
        const path = [];
        let temp = current;
        while (cameFrom[temp]) {
          path.push(temp);
          temp = cameFrom[temp];
        }
        path.push(start);
        return path.reverse();
      }

      closedSet.add(current);

      for (let neighbor of this.adjacencyList[current]) {
        const neighborNode = neighbor.node;
        
        if (closedSet.has(neighborNode)) continue;

        const tentativeGScore = gScore[current] + neighbor.weight;

        if (tentativeGScore < gScore[neighborNode]) {
          cameFrom[neighborNode] = current;
          gScore[neighborNode] = tentativeGScore;
          fScore[neighborNode] = gScore[neighborNode] + heuristic(neighborNode, goal);
          
          if (!openSet.values.some(item => item.val === neighborNode)) {
            openSet.enqueue(neighborNode, fScore[neighborNode]);
          }
        }
      }
    }

    return null; // No path found
  }
}

// Usage Example
const graph = new WeightedGraph();
graph.addVertex("A");
graph.addVertex("B");
graph.addVertex("C");
graph.addVertex("D");
graph.addVertex("E");
graph.addVertex("F");

graph.addEdge("A", "B", 4);
graph.addEdge("A", "C", 2);
graph.addEdge("B", "E", 3);
graph.addEdge("C", "D", 2);
graph.addEdge("C", "F", 4);
graph.addEdge("D", "E", 3);
graph.addEdge("D", "F", 1);
graph.addEdge("E", "F", 1);

const result = graph.dijkstra("A", "E");
console.log("Shortest path from A to E:", result.path);
console.log("Distance:", result.distance);
console.log("All distances:", result.distances);`,
    description: 'Advanced graph algorithms including Dijkstra and A* for shortest path finding.',
    executable: true
  },
  {
    id: 'react-context-reducer',
    title: 'React Context + Reducer',
    language: 'javascript',
    category: 'React State Management',
    complexity: 'Advanced',
    skills: ['React', 'Context API', 'useReducer', 'State Management'],
    visualization: {
      type: 'stateManagement',
      steps: [
        { id: 1, description: 'Initialize state', data: { users: [], loading: false, error: null } },
        { id: 2, description: 'Start loading', data: { users: [], loading: true, error: null } },
        { id: 3, description: 'Load success', data: { users: ['user1', 'user2'], loading: false, error: null } },
        { id: 4, description: 'Add user', data: { users: ['user1', 'user2', 'user3'], loading: false, error: null } }
      ]
    },
    code: `// Advanced React Context + Reducer Pattern
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Action Types
const ActionTypes = {
  FETCH_USERS_START: 'FETCH_USERS_START',
  FETCH_USERS_SUCCESS: 'FETCH_USERS_SUCCESS',
  FETCH_USERS_ERROR: 'FETCH_USERS_ERROR',
  ADD_USER: 'ADD_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  SET_FILTER: 'SET_FILTER',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial State
const initialState = {
  users: [],
  loading: false,
  error: null,
  filter: '',
  selectedUser: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  }
};

// Reducer with comprehensive state management
function userReducer(state, action) {
  switch (action.type) {
    case ActionTypes.FETCH_USERS_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case ActionTypes.FETCH_USERS_SUCCESS:
      return {
        ...state,
        loading: false,
        users: action.payload.users,
        pagination: {
          ...state.pagination,
          total: action.payload.total
        }
      };

    case ActionTypes.FETCH_USERS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case ActionTypes.ADD_USER:
      return {
        ...state,
        users: [...state.users, action.payload],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1
        }
      };

    case ActionTypes.UPDATE_USER:
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? { ...user, ...action.payload } : user
        )
      };

    case ActionTypes.DELETE_USER:
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
        pagination: {
          ...state.pagination,
          total: state.pagination.total - 1
        }
      };

    case ActionTypes.SET_FILTER:
      return {
        ...state,
        filter: action.payload,
        pagination: { ...state.pagination, page: 1 }
      };

    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      throw new Error(\`Unhandled action type: \${action.type}\`);
  }
}

// Context
const UserContext = createContext();

// Custom hook for using context
export function useUsers() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
}

// Provider component with advanced features
export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Action creators
  const actions = {
    async fetchUsers(page = 1) {
      dispatch({ type: ActionTypes.FETCH_USERS_START });
      
      try {
        const response = await fetch(\`/api/users?page=\${page}&limit=\${state.pagination.limit}&filter=\${state.filter}\`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch users');
        }
        
        dispatch({
          type: ActionTypes.FETCH_USERS_SUCCESS,
          payload: data
        });
      } catch (error) {
        dispatch({
          type: ActionTypes.FETCH_USERS_ERROR,
          payload: error.message
        });
      }
    },

    async addUser(userData) {
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        
        const newUser = await response.json();
        
        if (!response.ok) {
          throw new Error(newUser.message || 'Failed to add user');
        }
        
        dispatch({
          type: ActionTypes.ADD_USER,
          payload: newUser
        });
        
        return newUser;
      } catch (error) {
        dispatch({
          type: ActionTypes.FETCH_USERS_ERROR,
          payload: error.message
        });
        throw error;
      }
    },

    async updateUser(id, updates) {
      try {
        const response = await fetch(\`/api/users/\${id}\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        
        const updatedUser = await response.json();
        
        if (!response.ok) {
          throw new Error(updatedUser.message || 'Failed to update user');
        }
        
        dispatch({
          type: ActionTypes.UPDATE_USER,
          payload: updatedUser
        });
        
        return updatedUser;
      } catch (error) {
        dispatch({
          type: ActionTypes.FETCH_USERS_ERROR,
          payload: error.message
        });
        throw error;
      }
    },

    async deleteUser(id) {
      try {
        const response = await fetch(\`/api/users/\${id}\`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to delete user');
        }
        
        dispatch({
          type: ActionTypes.DELETE_USER,
          payload: id
        });
      } catch (error) {
        dispatch({
          type: ActionTypes.FETCH_USERS_ERROR,
          payload: error.message
        });
        throw error;
      }
    },

    setFilter(filter) {
      dispatch({
        type: ActionTypes.SET_FILTER,
        payload: filter
      });
    },

    clearError() {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    }
  };

  // Computed values
  const computedValues = {
    filteredUsers: state.users.filter(user =>
      user.name.toLowerCase().includes(state.filter.toLowerCase()) ||
      user.email.toLowerCase().includes(state.filter.toLowerCase())
    ),
    
    hasUsers: state.users.length > 0,
    
    isFirstPage: state.pagination.page === 1,
    
    isLastPage: state.pagination.page * state.pagination.limit >= state.pagination.total
  };

  const value = {
    ...state,
    ...computedValues,
    actions
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Usage Example Component
function UserList() {
  const { users, loading, error, actions, filteredUsers } = useUsers();

  useEffect(() => {
    actions.fetchUsers();
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="Filter users..."
        onChange={(e) => actions.setFilter(e.target.value)}
      />
      
      <ul>
        {filteredUsers.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
            <button onClick={() => actions.deleteUser(user.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      
      <button onClick={() => actions.addUser({ name: 'New User', email: 'new@example.com' })}>
        Add User
      </button>
    </div>
  );
}

// App wrapper
function App() {
  return (
    <UserProvider>
      <UserList />
    </UserProvider>
  );
}`,
    description: 'Production-ready React state management using Context API and useReducer with async actions.',
    executable: true
  },
  {
    id: 'typescript-generics',
    title: 'TypeScript Advanced Generics',
    language: 'typescript',
    category: 'TypeScript',
    complexity: 'Expert',
    skills: ['TypeScript', 'Generics', 'Type Safety', 'Advanced Types'],
    visualization: {
      type: 'algorithm',
      steps: [
        { id: 1, description: 'Define generic interface', data: { type: 'Repository<T>', constraints: ['T extends Entity'] } },
        { id: 2, description: 'Implement concrete type', data: { type: 'UserRepository', implements: 'Repository<User>' } },
        { id: 3, description: 'Type inference', data: { method: 'findById', returns: 'Promise<User | null>' } },
        { id: 4, description: 'Compile-time safety', data: { error: null, typeCheck: 'passed' } }
      ]
    },
    code: `// Advanced TypeScript Generics and Utility Types
interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface User extends Entity {
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
}

interface Product extends Entity {
  title: string;
  price: number;
  category: string;
}

// Advanced Generic Repository Pattern
interface Repository<T extends Entity> {
  findById(id: string): Promise<T | null>;
  findAll(options?: QueryOptions<T>): Promise<PaginatedResult<T>>;
  create(data: CreateInput<T>): Promise<T>;
  update(id: string, data: UpdateInput<T>): Promise<T>;
  delete(id: string): Promise<void>;
  findWhere(predicate: Predicate<T>): Promise<T[]>;
}

// Utility types for flexible operations
type CreateInput<T extends Entity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateInput<T extends Entity> = Partial<CreateInput<T>>;
type Predicate<T> = (item: T) => boolean;

interface QueryOptions<T> {
  page?: number;
  limit?: number;
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  filters?: Partial<T>;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Generic Repository Implementation
class BaseRepository<T extends Entity> implements Repository<T> {
  private data: T[] = [];

  async findById(id: string): Promise<T | null> {
    return this.data.find(item => item.id === id) || null;
  }

  async findAll(options: QueryOptions<T> = {}): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'asc', filters } = options;
    
    let result = [...this.data];

    // Apply filters
    if (filters) {
      result = result.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          if (value === undefined) return true;
          return item[key as keyof T] === value;
        });
      });
    }

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = result.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: result.length,
      page,
      limit,
      hasNext: endIndex < result.length,
      hasPrev: page > 1
    };
  }

  async create(data: CreateInput<T>): Promise<T> {
    const newItem = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    } as T;

    this.data.push(newItem);
    return newItem;
  }

  async update(id: string, data: UpdateInput<T>): Promise<T> {
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(\`Item with id \${id} not found\`);
    }

    const updatedItem = {
      ...this.data[index],
      ...data,
      updatedAt: new Date()
    };

    this.data[index] = updatedItem;
    return updatedItem;
  }

  async delete(id: string): Promise<void> {
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(\`Item with id \${id} not found\`);
    }

    this.data.splice(index, 1);
  }

  async findWhere(predicate: Predicate<T>): Promise<T[]> {
    return this.data.filter(predicate);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Advanced query builder
  query(): QueryBuilder<T> {
    return new QueryBuilder(this.data);
  }
}

// Fluent Query Builder with Method Chaining
class QueryBuilder<T extends Entity> {
  private items: T[];

  constructor(items: T[]) {
    this.items = [...items];
  }

  where<K extends keyof T>(field: K, operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains', value: T[K]): QueryBuilder<T> {
    this.items = this.items.filter(item => {
      const fieldValue = item[field];
      switch (operator) {
        case 'eq': return fieldValue === value;
        case 'ne': return fieldValue !== value;
        case 'gt': return fieldValue > value;
        case 'lt': return fieldValue < value;
        case 'contains': 
          return typeof fieldValue === 'string' && typeof value === 'string' 
            ? fieldValue.includes(value) 
            : false;
        default: return false;
      }
    });
    return this;
  }

  orderBy<K extends keyof T>(field: K, direction: 'asc' | 'desc' = 'asc'): QueryBuilder<T> {
    this.items.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return direction === 'asc' ? comparison : -comparison;
    });
    return this;
  }

  take(count: number): QueryBuilder<T> {
    this.items = this.items.slice(0, count);
    return this;
  }

  skip(count: number): QueryBuilder<T> {
    this.items = this.items.slice(count);
    return this;
  }

  select<K extends keyof T>(...fields: K[]): Pick<T, K>[] {
    return this.items.map(item => {
      const selected = {} as Pick<T, K>;
      fields.forEach(field => {
        selected[field] = item[field];
      });
      return selected;
    });
  }

  toArray(): T[] {
    return [...this.items];
  }

  first(): T | undefined {
    return this.items[0];
  }

  count(): number {
    return this.items.length;
  }
}

// Specific Repository Implementations
class UserRepository extends BaseRepository<User> {
  async findByEmail(email: string): Promise<User | null> {
    const users = await this.findWhere(user => user.email === email);
    return users[0] || null;
  }

  async findByRole(role: User['role']): Promise<User[]> {
    return this.findWhere(user => user.role === role);
  }
}

class ProductRepository extends BaseRepository<Product> {
  async findByCategory(category: string): Promise<Product[]> {
    return this.findWhere(product => product.category === category);
  }

  async findInPriceRange(min: number, max: number): Promise<Product[]> {
    return this.query()
      .where('price', 'gt', min)
      .where('price', 'lt', max)
      .toArray();
  }
}

// Usage Examples with full type safety
async function demonstrateTypeScript() {
  const userRepo = new UserRepository();
  const productRepo = new ProductRepository();

  // Create users with type safety
  const user1 = await userRepo.create({
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin'
  });

  const user2 = await userRepo.create({
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user'
  });

  // Create products
  const product1 = await productRepo.create({
    title: 'Laptop',
    price: 999.99,
    category: 'Electronics'
  });

  // Type-safe queries
  const adminUsers = await userRepo.findByRole('admin');
  const expensiveProducts = await productRepo.findInPriceRange(500, 2000);

  // Advanced query builder usage
  const recentUsers = userRepo.query()
    .where('role', 'ne', 'admin')
    .orderBy('createdAt', 'desc')
    .take(5)
    .toArray();

  console.log('Admin users:', adminUsers);
  console.log('Expensive products:', expensiveProducts);
  console.log('Recent non-admin users:', recentUsers);

  // Type-safe pagination
  const paginatedUsers = await userRepo.findAll({
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc',
    filters: { role: 'user' }
  });

  console.log('Paginated users:', paginatedUsers);
}

demonstrateTypeScript();`,
    description: 'Advanced TypeScript patterns with generics, utility types, and type-safe repository pattern.',
    executable: true
  },
  {
    id: 'microservices-pattern',
    title: 'Microservices Communication',
    language: 'javascript',
    category: 'Architecture',
    complexity: 'Expert',
    skills: ['Node.js', 'Microservices', 'Event-Driven', 'Message Queue'],
    visualization: {
      type: 'apiFlow',
      steps: [
        { id: 1, description: 'Service A publishes event', data: { service: 'UserService', event: 'UserCreated', status: 'published' } },
        { id: 2, description: 'Message queue receives event', data: { queue: 'user-events', messages: 1, status: 'queued' } },
        { id: 3, description: 'Service B processes event', data: { service: 'EmailService', event: 'UserCreated', status: 'processing' } },
        { id: 4, description: 'Service C processes event', data: { service: 'NotificationService', event: 'UserCreated', status: 'completed' } }
      ]
    },
    code: `// Microservices Event-Driven Architecture
class EventBus {
  constructor() {
    this.subscribers = new Map();
    this.eventHistory = [];
    this.retryQueue = [];
    this.deadLetterQueue = [];
  }

  subscribe(eventType, handler, options = {}) {
    const { 
      retries = 3, 
      timeout = 5000, 
      filter = null,
      priority = 0 
    } = options;

    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }

    const subscription = {
      id: this.generateId(),
      handler,
      retries,
      timeout,
      filter,
      priority,
      createdAt: new Date()
    };

    this.subscribers.get(eventType).push(subscription);
    
    // Sort by priority (higher priority first)
    this.subscribers.get(eventType).sort((a, b) => b.priority - a.priority);

    return () => this.unsubscribe(eventType, subscription.id);
  }

  async publish(eventType, payload, metadata = {}) {
    const event = {
      id: this.generateId(),
      type: eventType,
      payload,
      metadata: {
        ...metadata,
        timestamp: new Date(),
        source: metadata.source || 'unknown',
        correlationId: metadata.correlationId || this.generateId()
      }
    };

    // Store in event history
    this.eventHistory.push(event);
    
    // Keep only last 1000 events
    if (this.eventHistory.length > 1000) {
      this.eventHistory.shift();
    }

    const subscribers = this.subscribers.get(eventType) || [];
    const promises = subscribers.map(async (subscription) => {
      // Apply filter if specified
      if (subscription.filter && !subscription.filter(event)) {
        return { success: true, skipped: true };
      }

      return this.executeWithRetry(subscription, event);
    });

    const results = await Promise.allSettled(promises);
    
    return {
      eventId: event.id,
      published: true,
      subscriberResults: results,
      failedCount: results.filter(r => r.status === 'rejected').length
    };
  }

  async executeWithRetry(subscription, event, attempt = 1) {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Handler timeout')), subscription.timeout);
      });

      const handlerPromise = subscription.handler(event);
      const result = await Promise.race([handlerPromise, timeoutPromise]);

      return { success: true, result, attempt };
    } catch (error) {
      console.error(\`Handler failed (attempt \${attempt}): \`, error.message);

      if (attempt < subscription.retries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(subscription, event, attempt + 1);
      } else {
        // Move to dead letter queue
        this.deadLetterQueue.push({
          subscription: subscription.id,
          event,
          error: error.message,
          attempts: attempt,
          timestamp: new Date()
        });
        
        throw error;
      }
    }
  }

  unsubscribe(eventType, subscriptionId) {
    const subscribers = this.subscribers.get(eventType);
    if (subscribers) {
      const index = subscribers.findIndex(s => s.id === subscriptionId);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    }
  }

  getEventHistory(eventType = null, limit = 100) {
    let events = this.eventHistory;
    
    if (eventType) {
      events = events.filter(e => e.type === eventType);
    }
    
    return events.slice(-limit);
  }

  getDeadLetterQueue() {
    return [...this.deadLetterQueue];
  }

  reprocessDeadLetter(deadLetterId) {
    const deadLetter = this.deadLetterQueue.find(dl => dl.id === deadLetterId);
    if (deadLetter) {
      return this.publish(deadLetter.event.type, deadLetter.event.payload);
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Service Base Class
class MicroService {
  constructor(name, eventBus) {
    this.name = name;
    this.eventBus = eventBus;
    this.health = { status: 'healthy', lastCheck: new Date() };
    this.metrics = {
      eventsPublished: 0,
      eventsProcessed: 0,
      errors: 0,
      uptime: Date.now()
    };
  }

  async publishEvent(eventType, payload) {
    try {
      const result = await this.eventBus.publish(eventType, payload, {
        source: this.name
      });
      this.metrics.eventsPublished++;
      return result;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  subscribeToEvent(eventType, handler, options = {}) {
    const wrappedHandler = async (event) => {
      try {
        console.log(\`[\${this.name}] Processing \${event.type}\`);
        const result = await handler(event);
        this.metrics.eventsProcessed++;
        return result;
      } catch (error) {
        this.metrics.errors++;
        console.error(\`[\${this.name}] Error processing \${event.type}:\`, error);
        throw error;
      }
    };

    return this.eventBus.subscribe(eventType, wrappedHandler, options);
  }

  getHealth() {
    return {
      service: this.name,
      ...this.health,
      metrics: this.metrics,
      uptime: Date.now() - this.metrics.uptime
    };
  }
}

// Example Services
class UserService extends MicroService {
  constructor(eventBus) {
    super('UserService', eventBus);
    this.users = new Map();
  }

  async createUser(userData) {
    const user = {
      id: this.eventBus.generateId(),
      ...userData,
      createdAt: new Date()
    };

    this.users.set(user.id, user);

    // Publish event for other services
    await this.publishEvent('user.created', {
      userId: user.id,
      email: user.email,
      name: user.name
    });

    return user;
  }
}

class EmailService extends MicroService {
  constructor(eventBus) {
    super('EmailService', eventBus);
    this.emailQueue = [];

    // Subscribe to user events
    this.subscribeToEvent('user.created', this.handleUserCreated.bind(this), {
      priority: 10, // High priority
      retries: 5
    });
  }

  async handleUserCreated(event) {
    const { userId, email, name } = event.payload;
    
    // Simulate email sending
    await this.sendWelcomeEmail(email, name);
    
    // Publish confirmation event
    await this.publishEvent('email.sent', {
      userId,
      type: 'welcome',
      email,
      sentAt: new Date()
    });
  }

  async sendWelcomeEmail(email, name) {
    // Simulate async email sending
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.emailQueue.push({
      to: email,
      subject: \`Welcome, \${name}!\`,
      body: 'Thank you for joining our platform.',
      sentAt: new Date()
    });

    console.log(\`Welcome email sent to \${email}\`);
  }
}

class NotificationService extends MicroService {
  constructor(eventBus) {
    super('NotificationService', eventBus);
    this.notifications = [];

    // Subscribe to multiple events
    this.subscribeToEvent('user.created', this.handleUserCreated.bind(this));
    this.subscribeToEvent('email.sent', this.handleEmailSent.bind(this));
  }

  async handleUserCreated(event) {
    const { userId, name } = event.payload;
    
    this.notifications.push({
      userId,
      type: 'user_welcome',
      message: \`Welcome to the platform, \${name}!\`,
      createdAt: new Date()
    });

    console.log(\`Notification created for user \${userId}\`);
  }

  async handleEmailSent(event) {
    const { userId, type } = event.payload;
    
    this.notifications.push({
      userId,
      type: 'email_confirmation',
      message: \`Your \${type} email has been sent successfully.\`,
      createdAt: new Date()
    });

    console.log(\`Email confirmation notification for user \${userId}\`);
  }
}

// Usage Example
async function demonstrateMicroservices() {
  const eventBus = new EventBus();
  
  // Initialize services
  const userService = new UserService(eventBus);
  const emailService = new EmailService(eventBus);
  const notificationService = new NotificationService(eventBus);

  console.log('=== Microservices Demo ===');

  // Create a user (triggers cascade of events)
  const user = await userService.createUser({
    name: 'John Doe',
    email: 'john@example.com'
  });

  console.log('User created:', user);

  // Wait for async processing
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check service health
  console.log('\\n=== Service Health ===');
  console.log('UserService:', userService.getHealth());
  console.log('EmailService:', emailService.getHealth());
  console.log('NotificationService:', notificationService.getHealth());

  // Check event history
  console.log('\\n=== Event History ===');
  console.log(eventBus.getEventHistory());

  // Check dead letter queue
  console.log('\\n=== Dead Letter Queue ===');
  console.log(eventBus.getDeadLetterQueue());
}

demonstrateMicroservices();`,
    description: 'Enterprise-grade microservices architecture with event-driven communication and fault tolerance.',
    executable: true
  },
  {
    id: 'machine-learning-js',
    title: 'ML Neural Network (JS)',
    language: 'javascript',
    category: 'Machine Learning',
    complexity: 'Expert',
    skills: ['JavaScript', 'Machine Learning', 'Neural Networks', 'Mathematics'],
    visualization: {
      type: 'algorithm',
      steps: [
        { id: 1, description: 'Initialize network', data: { layers: [2, 4, 1], weights: 'random', bias: 'random' } },
        { id: 2, description: 'Forward propagation', data: { input: [0.5, 0.8], hidden: [0.3, 0.7, 0.2, 0.9], output: [0.6] } },
        { id: 3, description: 'Calculate error', data: { predicted: 0.6, actual: 1.0, error: 0.4 } },
        { id: 4, description: 'Backpropagation', data: { weightUpdates: 'calculated', biasUpdates: 'calculated' } },
        { id: 5, description: 'Update weights', data: { epoch: 1, error: 0.35, learning: 'improved' } }
      ]
    },
    code: `// Neural Network Implementation from Scratch
class Matrix {
  constructor(rows, cols, data = null) {
    this.rows = rows;
    this.cols = cols;
    this.data = data || Array(rows).fill().map(() => Array(cols).fill(0));
  }

  static fromArray(arr) {
    const matrix = new Matrix(arr.length, 1);
    for (let i = 0; i < arr.length; i++) {
      matrix.data[i][0] = arr[i];
    }
    return matrix;
  }

  toArray() {
    const arr = [];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        arr.push(this.data[i][j]);
      }
    }
    return arr;
  }

  static multiply(a, b) {
    if (a.cols !== b.rows) {
      throw new Error('Matrix dimensions incompatible for multiplication');
    }

    const result = new Matrix(a.rows, b.cols);
    for (let i = 0; i < result.rows; i++) {
      for (let j = 0; j < result.cols; j++) {
        let sum = 0;
        for (let k = 0; k < a.cols; k++) {
          sum += a.data[i][k] * b.data[k][j];
        }
        result.data[i][j] = sum;
      }
    }
    return result;
  }

  multiply(scalar) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] *= scalar;
      }
    }
    return this;
  }

  add(other) {
    if (other instanceof Matrix) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.data[i][j] += other.data[i][j];
        }
      }
    } else {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.data[i][j] += other;
        }
      }
    }
    return this;
  }

  static subtract(a, b) {
    const result = new Matrix(a.rows, a.cols);
    for (let i = 0; i < result.rows; i++) {
      for (let j = 0; j < result.cols; j++) {
        result.data[i][j] = a.data[i][j] - b.data[i][j];
      }
    }
    return result;
  }

  static transpose(matrix) {
    const result = new Matrix(matrix.cols, matrix.rows);
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.cols; j++) {
        result.data[j][i] = matrix.data[i][j];
      }
    }
    return result;
  }

  map(func) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] = func(this.data[i][j], i, j);
      }
    }
    return this;
  }

  static map(matrix, func) {
    const result = new Matrix(matrix.rows, matrix.cols);
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.cols; j++) {
        result.data[i][j] = func(matrix.data[i][j], i, j);
      }
    }
    return result;
  }

  randomize() {
    return this.map(() => Math.random() * 2 - 1);
  }

  copy() {
    const result = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[i][j] = this.data[i][j];
      }
    }
    return result;
  }
}

// Activation Functions
const ActivationFunctions = {
  sigmoid: {
    func: x => 1 / (1 + Math.exp(-x)),
    derivative: y => y * (1 - y)
  },
  
  tanh: {
    func: x => Math.tanh(x),
    derivative: y => 1 - (y * y)
  },
  
  relu: {
    func: x => Math.max(0, x),
    derivative: y => y > 0 ? 1 : 0
  },
  
  leakyRelu: {
    func: x => x > 0 ? x : 0.01 * x,
    derivative: y => y > 0 ? 1 : 0.01
  }
};

class NeuralNetwork {
  constructor(inputNodes, hiddenNodes, outputNodes, learningRate = 0.1) {
    this.inputNodes = inputNodes;
    this.hiddenNodes = hiddenNodes;
    this.outputNodes = outputNodes;
    this.learningRate = learningRate;

    // Initialize weights and biases
    this.weightsInputHidden = new Matrix(this.hiddenNodes, this.inputNodes);
    this.weightsHiddenOutput = new Matrix(this.outputNodes, this.hiddenNodes);
    this.weightsInputHidden.randomize();
    this.weightsHiddenOutput.randomize();

    this.biasHidden = new Matrix(this.hiddenNodes, 1);
    this.biasOutput = new Matrix(this.outputNodes, 1);
    this.biasHidden.randomize();
    this.biasOutput.randomize();

    // Set activation function
    this.activation = ActivationFunctions.sigmoid;
    
    // Training metrics
    this.trainingHistory = [];
  }

  predict(inputArray) {
    // Convert input to matrix
    const inputs = Matrix.fromArray(inputArray);

    // Forward propagation
    const hidden = Matrix.multiply(this.weightsInputHidden, inputs);
    hidden.add(this.biasHidden);
    hidden.map(this.activation.func);

    const outputs = Matrix.multiply(this.weightsHiddenOutput, hidden);
    outputs.add(this.biasOutput);
    outputs.map(this.activation.func);

    return outputs.toArray();
  }

  train(inputArray, targetArray) {
    // Convert arrays to matrices
    const inputs = Matrix.fromArray(inputArray);
    const targets = Matrix.fromArray(targetArray);

    // Forward propagation
    const hidden = Matrix.multiply(this.weightsInputHidden, inputs);
    hidden.add(this.biasHidden);
    hidden.map(this.activation.func);

    const outputs = Matrix.multiply(this.weightsHiddenOutput, hidden);
    outputs.add(this.biasOutput);
    outputs.map(this.activation.func);

    // Calculate output layer error
    const outputErrors = Matrix.subtract(targets, outputs);

    // Calculate gradients for output layer
    const outputGradients = Matrix.map(outputs, this.activation.derivative);
    outputGradients.multiply(outputErrors);
    outputGradients.multiply(this.learningRate);

    // Calculate hidden->output deltas
    const hiddenTransposed = Matrix.transpose(hidden);
    const weightsHiddenOutputDeltas = Matrix.multiply(outputGradients, hiddenTransposed);

    // Update weights and biases for output layer
    this.weightsHiddenOutput.add(weightsHiddenOutputDeltas);
    this.biasOutput.add(outputGradients);

    // Calculate hidden layer error
    const weightsHiddenOutputTransposed = Matrix.transpose(this.weightsHiddenOutput);
    const hiddenErrors = Matrix.multiply(weightsHiddenOutputTransposed, outputErrors);

    // Calculate gradients for hidden layer
    const hiddenGradients = Matrix.map(hidden, this.activation.derivative);
    hiddenGradients.multiply(hiddenErrors);
    hiddenGradients.multiply(this.learningRate);

    // Calculate input->hidden deltas
    const inputsTransposed = Matrix.transpose(inputs);
    const weightsInputHiddenDeltas = Matrix.multiply(hiddenGradients, inputsTransposed);

    // Update weights and biases for hidden layer
    this.weightsInputHidden.add(weightsInputHiddenDeltas);
    this.biasHidden.add(hiddenGradients);

    // Calculate and store error for tracking
    const totalError = outputErrors.toArray().reduce((sum, error) => sum + Math.abs(error), 0);
    return totalError;
  }

  trainBatch(trainingData, epochs = 1000, verbose = false) {
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalError = 0;
      
      // Shuffle training data
      const shuffled = [...trainingData].sort(() => Math.random() - 0.5);
      
      for (let data of shuffled) {
        const error = this.train(data.inputs, data.outputs);
        totalError += error;
      }
      
      const avgError = totalError / trainingData.length;
      this.trainingHistory.push({ epoch, error: avgError });
      
      if (verbose && epoch % 100 === 0) {
        console.log(\`Epoch \${epoch}: Average Error = \${avgError.toFixed(6)}\`);
      }
    }
  }

  // Advanced features
  setActivationFunction(activationName) {
    if (ActivationFunctions[activationName]) {
      this.activation = ActivationFunctions[activationName];
    }
  }

  setLearningRate(rate) {
    this.learningRate = rate;
  }

  getTrainingHistory() {
    return this.trainingHistory;
  }

  // Save/Load functionality (simplified)
  serialize() {
    return JSON.stringify({
      inputNodes: this.inputNodes,
      hiddenNodes: this.hiddenNodes,
      outputNodes: this.outputNodes,
      learningRate: this.learningRate,
      weightsInputHidden: this.weightsInputHidden.data,
      weightsHiddenOutput: this.weightsHiddenOutput.data,
      biasHidden: this.biasHidden.data,
      biasOutput: this.biasOutput.data
    });
  }

  static deserialize(data) {
    const config = JSON.parse(data);
    const nn = new NeuralNetwork(
      config.inputNodes,
      config.hiddenNodes,
      config.outputNodes,
      config.learningRate
    );
    
    nn.weightsInputHidden.data = config.weightsInputHidden;
    nn.weightsHiddenOutput.data = config.weightsHiddenOutput;
    nn.biasHidden.data = config.biasHidden;
    nn.biasOutput.data = config.biasOutput;
    
    return nn;
  }
}

// Usage Example: XOR Problem
function demonstrateNeuralNetwork() {
  console.log('=== Neural Network Demo: XOR Problem ===');
  
  // Create network: 2 inputs, 4 hidden neurons, 1 output
  const nn = new NeuralNetwork(2, 4, 1, 0.5);
  
  // XOR training data
  const trainingData = [
    { inputs: [0, 0], outputs: [0] },
    { inputs: [0, 1], outputs: [1] },
    { inputs: [1, 0], outputs: [1] },
    { inputs: [1, 1], outputs: [0] }
  ];
  
  console.log('Before training:');
  trainingData.forEach(data => {
    const prediction = nn.predict(data.inputs);
    console.log(\`Input: [\${data.inputs}] -> Predicted: \${prediction[0].toFixed(4)}, Expected: \${data.outputs[0]}\`);
  });
  
  // Train the network
  console.log('\\nTraining...');
  nn.trainBatch(trainingData, 5000, true);
  
  console.log('\\nAfter training:');
  trainingData.forEach(data => {
    const prediction = nn.predict(data.inputs);
    const accuracy = Math.abs(prediction[0] - data.outputs[0]);
    console.log(\`Input: [\${data.inputs}] -> Predicted: \${prediction[0].toFixed(4)}, Expected: \${data.outputs[0]}, Error: \${accuracy.toFixed(4)}\`);
  });
  
  // Show training progress
  const history = nn.getTrainingHistory();
  console.log(\`\\nTraining completed. Final error: \${history[history.length - 1].error.toFixed(6)}\`);
  
  return nn;
}

// Run the demo
const trainedNetwork = demonstrateNeuralNetwork();`,
    description: 'Complete neural network implementation from scratch with backpropagation and XOR problem solving.',
    executable: true
  },
  {
    id: 'custom-example',
    title: '+ Create Custom Example',
    language: 'javascript',
    category: 'Custom',
    complexity: 'Beginner',
    skills: ['Custom'],
    code: `// Write your own code example here!
function myCustomFunction() {
  console.log('Hello from my custom code!');
  return 'Custom result';
}

myCustomFunction();`,
    description: 'Create your own custom code example to test and share.',
    executable: true
  }
];

type Mode = 'code' | 'visualization' | 'insights';

const IntelligentCodePlayground: React.FC = () => {
  // State management
  const [codeExamples, setCodeExamples] = useState<CodeExample[]>(defaultCodeExamples);
  const [selectedExample, setSelectedExample] = useState(defaultCodeExamples[0]);
  const [activeMode, setActiveMode] = useState<Mode>('code');
  const [userCode, setUserCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [aiAssistance, setAiAssistance] = useState<AIAssistance[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [showCustomCreator, setShowCustomCreator] = useState(false);

  // Enhanced recruiter insights with comprehensive metrics
  const [recruiterInsights] = useState<RecruiterInsight[]>([
    {
      category: 'skills',
      metric: 'Technical Proficiency',
      value: 94,
      trend: 'up',
      description: 'Expert-level knowledge across 12+ technologies with deep understanding of modern development practices'
    },
    {
      category: 'quality',
      metric: 'Code Quality Score',
      value: 91,
      trend: 'up',
      description: 'Consistently writes clean, maintainable, and well-documented code following industry best practices'
    },
    {
      category: 'methodology',
      metric: 'Problem-Solving Approach',
      value: 96,
      trend: 'up',
      description: 'Demonstrates systematic approach to complex problems with strong algorithmic thinking'
    },
    {
      category: 'adaptation',
      metric: 'Learning Velocity',
      value: 89,
      trend: 'up',
      description: 'Rapidly adapts to new technologies and frameworks, staying current with industry trends'
    },
    {
      category: 'collaboration',
      metric: 'Architecture Design',
      value: 87,
      trend: 'stable',
      description: 'Designs scalable, maintainable systems with proper separation of concerns and modularity'
    },
    {
      category: 'skills',
      metric: 'Full-Stack Competency',
      value: 93,
      trend: 'up',
      description: 'Proficient across the entire technology stack from frontend to backend and infrastructure'
    }
  ]);

  const [skillDemonstrations] = useState<SkillDemonstration[]>([
    { skill: 'React & Hooks', demonstrated: true, examples: ['Performance Monitor', 'Context + Reducer'], proficiency: 95, lastUsed: new Date() },
    { skill: 'TypeScript', demonstrated: true, examples: ['Advanced Generics', 'Repository Pattern'], proficiency: 94, lastUsed: new Date() },
    { skill: 'Performance Optimization', demonstrated: true, examples: ['Debounce/Throttle', 'Memory Management'], proficiency: 92, lastUsed: new Date() },
    { skill: 'Data Structures & Algorithms', demonstrated: true, examples: ['Binary Search Tree', 'Graph Algorithms'], proficiency: 91, lastUsed: new Date() },
    { skill: 'Async Programming', demonstrated: true, examples: ['Task Queue', 'WebSocket Manager'], proficiency: 90, lastUsed: new Date() },
    { skill: 'Design Patterns', demonstrated: true, examples: ['State Machine', 'Repository Pattern'], proficiency: 88, lastUsed: new Date() },
    { skill: 'Microservices Architecture', demonstrated: true, examples: ['Event-Driven Communication'], proficiency: 86, lastUsed: new Date() },
    { skill: 'Machine Learning', demonstrated: true, examples: ['Neural Network Implementation'], proficiency: 84, lastUsed: new Date() },
    { skill: 'Real-time Communication', demonstrated: true, examples: ['WebSocket Management'], proficiency: 87, lastUsed: new Date() },
    { skill: 'Error Handling & Resilience', demonstrated: true, examples: ['Retry Mechanisms', 'Dead Letter Queue'], proficiency: 89, lastUsed: new Date() },
    { skill: 'Code Architecture', demonstrated: true, examples: ['Modular Components', 'Clean Code'], proficiency: 93, lastUsed: new Date() },
    { skill: 'Testing & Quality Assurance', demonstrated: true, examples: ['Type Safety', 'Error Boundaries'], proficiency: 85, lastUsed: new Date() }
  ]);

  // Event handlers
  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOutput('Code executed successfully!\n> Hello from my custom code!\n> Custom result');
    } catch (error) {
      setOutput(`Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  }, []);

  const copyCode = useCallback(() => {
    const code = userCode || selectedExample.code;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [userCode, selectedExample.code]);

  const downloadCode = useCallback(() => {
    const code = userCode || selectedExample.code;
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedExample.id}.js`;
    a.click();
    URL.revokeObjectURL(url);
  }, [userCode, selectedExample]);

  const analyzeCode = useCallback(async (code: string) => {
    if (!code.trim()) return;
    
    setIsAnalyzing(true);
    setDebugInfo('🔄 Analyzing code...');
    
    // Simulate AI analysis
    setTimeout(() => {
      const suggestions: AIAssistance[] = [
        {
          type: 'optimization',
          message: 'Consider using useCallback for better performance',
          severity: 'medium'
        },
        {
          type: 'suggestion',
          message: 'Add error handling for better robustness',
          severity: 'low'
        }
      ];
      
      setAiAssistance(suggestions);
      setIsAnalyzing(false);
      setDebugInfo('');
    }, 1500);
  }, []);

  return (
    <section className="py-8 lg:py-16" style={{ backgroundColor: nightOwl.bg }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 lg:mb-12"
        >
          <h2 className="text-2xl lg:text-3xl font-bold mb-4" style={{ color: nightOwl.text }}>
            Advanced Code Playground
          </h2>
          <p className="max-w-2xl mx-auto mb-6 text-sm lg:text-base px-4" style={{ color: nightOwl.textDim }}>
            Interactive visualizations, algorithm animations, and professional skill demonstrations
          </p>

          {/* Responsive Mode Selector */}
          <div className="px-4">
            <div className="block lg:hidden mb-6">
              <ModeSelector
                activeMode={activeMode}
                onModeChange={setActiveMode}
                isMobile={true}
              />
            </div>
            <div className="hidden lg:block mb-8">
              <ModeSelector
                activeMode={activeMode}
                onModeChange={setActiveMode}
                isMobile={false}
              />
            </div>
          </div>
        </motion.div>

        {/* Content based on active mode */}
        <AnimatePresence mode="wait">
          {/* Code Editor Mode */}
          {activeMode === 'code' && (
            <motion.div
              key="code-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col lg:flex-row gap-4 lg:gap-8"
              style={{ minHeight: '600px' }}
            >
              {/* Responsive Sidebar */}
              <div className="lg:hidden mb-4">
                <ExampleSidebar
                  examples={codeExamples}
                  selectedExample={selectedExample}
                  onSelectExample={(example) => {
                    setSelectedExample(example);
                    setUserCode('');
                    setAiAssistance([]);
                  }}
                  onCreateCustom={() => setShowCustomCreator(true)}
                  isCompact={true}
                />
              </div>

              <div className="hidden lg:block lg:w-80 flex-shrink-0">
                <ExampleSidebar
                  examples={codeExamples}
                  selectedExample={selectedExample}
                  onSelectExample={(example) => {
                    setSelectedExample(example);
                    setUserCode('');
                    setAiAssistance([]);
                  }}
                  onCreateCustom={() => setShowCustomCreator(true)}
                />
              </div>

              {/* Code Editor */}
              <div className="flex-1 min-h-0">
                <div 
                  className="h-full rounded-lg border overflow-hidden"
                  style={{
                    backgroundColor: nightOwl.surface,
                    borderColor: nightOwl.border,
                    minHeight: '500px'
                  }}
                >
                  <CodeEditor
                    selectedExample={selectedExample}
                    userCode={userCode}
                    setUserCode={setUserCode}
                    isRunning={isRunning}
                    output={output}
                    copied={copied}
                    aiAssistance={aiAssistance}
                    onRunCode={runCode}
                    onCopyCode={copyCode}
                    onDownloadCode={downloadCode}
                    onAnalyzeCode={analyzeCode}
                    isAnalyzing={isAnalyzing}
                    debugInfo={debugInfo}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Visualization Mode */}
          {activeMode === 'visualization' && (
            <motion.div
              key="visualization-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4" style={{ color: nightOwl.text }}>
                    Select Algorithm to Visualize
                  </h4>
                  <div className="space-y-3">
                    {codeExamples.filter(ex => ex.visualization).map((example, index) => (
                      <motion.button
                        key={example.id}
                        onClick={() => setSelectedExample(example)}
                        className={`w-full p-4 rounded-lg border text-left transition-all ${
                          selectedExample.id === example.id ? 'ring-2' : ''
                        }`}
                        style={{
                          backgroundColor: selectedExample.id === example.id ? nightOwl.selection : nightOwl.surface,
                          borderColor: selectedExample.id === example.id ? nightOwl.accent : nightOwl.border
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <h5 className="font-medium" style={{ color: nightOwl.text }}>
                          {example.title}
                        </h5>
                        <p className="text-sm mt-1" style={{ color: nightOwl.textDim }}>
                          {example.category} • {example.complexity}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  {selectedExample.visualization && (
                    <AlgorithmVisualizer
                      visualization={selectedExample.visualization}
                      title={selectedExample.title}
                      isActive={activeMode === 'visualization'}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Recruiter Insights Mode */}
          {activeMode === 'insights' && (
            <RecruiterInsights
              insights={recruiterInsights}
              skillDemonstrations={skillDemonstrations}
            />
          )}
        </AnimatePresence>

        {/* Custom Example Creator Modal */}
        <CustomExampleCreator
          isOpen={showCustomCreator}
          onClose={() => setShowCustomCreator(false)}
          onCreateExample={(newExample) => {
            setCodeExamples(prev => [...prev.filter(ex => ex.id !== 'custom-example'), newExample, prev.find(ex => ex.id === 'custom-example')!]);
            setSelectedExample(newExample);
          }}
        />
      </div>
    </section>
  );
};

export default IntelligentCodePlayground;
