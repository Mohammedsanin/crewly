import { Priority, TaskStatus } from '../types';

export interface ParsedTaskResult {
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  clientName?: string;
  dueDate: string;
  tags: string[];
  assignedTo?: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actions?: { label: string; actionType: string; payload?: any }[];
}

export interface AIResponse {
  text: string;
  actions?: { label: string; actionType: string; payload?: any }[];
}

/**
 * Natural-Language Task Creator Parser (Dynamic Context-Aware Parser)
 */
export const parseNaturalLanguageTask = async (
  prompt: string,
  contextData: { employees: any[]; clients: any[] }
): Promise<ParsedTaskResult> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const lower = prompt.toLowerCase();
  const { employees, clients } = contextData;

  // 1. Extract Assignee from actual employee roster
  let assignedTo: string | undefined = undefined;
  for (const emp of employees) {
    const fullName = emp.name.toLowerCase();
    const firstName = emp.name.split(' ')[0].toLowerCase();
    
    // Match full name or first name if distinct
    if (lower.includes(fullName) || (firstName.length > 2 && lower.includes(`to ${firstName}`) || lower.includes(`for ${firstName}`))) {
      assignedTo = emp.name;
      break;
    }
  }

  // 2. Extract Client Company from actual clients list
  let clientName: string | undefined = undefined;
  for (const client of clients) {
    const compName = client.companyName.toLowerCase();
    const shortComp = client.companyName.split(' ')[0].toLowerCase();

    if (lower.includes(compName) || (shortComp.length > 2 && lower.includes(shortComp))) {
      clientName = client.companyName;
      break;
    }
  }

  // 3. Extract Priority
  let priority: Priority = 'medium';
  if (lower.includes('urgent') || lower.includes('asap') || lower.includes('critical') || lower.includes('immediate')) {
    priority = 'urgent';
  } else if (lower.includes('high') || lower.includes('important')) {
    priority = 'high';
  } else if (lower.includes('low') || lower.includes('minor') || lower.includes('whenever')) {
    priority = 'low';
  }

  // 4. Advanced Due Date Parsing
  const today = new Date();
  let dueDateObj = new Date(today);

  // Handle "in X days" pattern
  const inDaysMatch = lower.match(/in (\d+) days/);
  if (inDaysMatch && inDaysMatch[1]) {
    const days = parseInt(inDaysMatch[1], 10);
    dueDateObj.setDate(today.getDate() + days);
  } else if (
    lower.includes('tomorrow') ||
    lower.includes('tomorow') ||
    lower.includes('tomoroow') ||
    lower.includes('tommorrow') ||
    lower.includes('tmr') ||
    lower.includes('tmrw')
  ) {
    dueDateObj.setDate(today.getDate() + 1);
  } else if (lower.includes('today') || lower.includes('todday') || lower.includes('tdy')) {
    // Keep today
  } else {
    // Handle days of the week matching (monday, tuesday...)
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    let targetDayIndex = -1;
    for (let i = 0; i < daysOfWeek.length; i++) {
      if (lower.includes(daysOfWeek[i])) {
        targetDayIndex = i;
        break;
      }
    }

    if (targetDayIndex !== -1) {
      const currentDayIndex = today.getDay();
      let daysToAdd = targetDayIndex - currentDayIndex;
      if (daysToAdd <= 0) {
        daysToAdd += 7; // Next week's day
      }
      dueDateObj.setDate(today.getDate() + daysToAdd);
    } else if (lower.includes('next week')) {
      dueDateObj.setDate(today.getDate() + 7);
    } else {
      // Default to 4 days from now if unspecified
      dueDateObj.setDate(today.getDate() + 4);
    }
  }
  const dueDate = dueDateObj.toISOString().split('T')[0];

  // 5. Intelligent Title Extraction (Remove noise & clean command words)
  let cleanTitle = prompt;

  // Remove filler prefixes
  const fillers = [
    /create( a)? task( to| for)?/i,
    /schedule( a)?/i,
    /assign( to)? [a-zA-Z\s]+/i,
    /urgent/i,
    /asap/i,
    /critical/i,
    /before [a-zA-Z]+/i,
    /due [a-zA-Z\s0-9]+/i,
    /tomor(r)?o(o)?w/i,
    /tmr(w)?/i,
    /next week/i,
    /in \d+ days/i,
    /for [a-zA-Z\s]+/i,
  ];

  fillers.forEach((regex) => {
    cleanTitle = cleanTitle.replace(regex, '');
  });

  // Clean company names from title
  clients.forEach((c) => {
    const nameRegex = new RegExp(`for ${c.companyName}|with ${c.companyName}|${c.companyName}`, 'gi');
    cleanTitle = cleanTitle.replace(nameRegex, '');
  });

  // Clean employee names from title
  employees.forEach((e) => {
    const nameRegex = new RegExp(`to ${e.name}|for ${e.name}|${e.name}`, 'gi');
    cleanTitle = cleanTitle.replace(nameRegex, '');
  });

  // Clean up punctuation, spaces, connectives
  cleanTitle = cleanTitle
    .replace(/^(to|for|with|about|on|check|do|make)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Fallback to original prompt if stripped empty
  if (cleanTitle.length < 5) {
    cleanTitle = prompt.trim();
  }

  // Capitalize first letter
  cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  if (cleanTitle.length > 60) {
    cleanTitle = cleanTitle.substring(0, 57) + '...';
  }

  // 6. Extract Tags
  const tags: string[] = ['AI-Generated'];
  const textForTags = lower + ' ' + cleanTitle.toLowerCase();
  if (textForTags.includes('invoice') || textForTags.includes('billing') || textForTags.includes('finance') || textForTags.includes('pay')) {
    tags.push('Finance');
  }
  if (textForTags.includes('ui') || textForTags.includes('design') || textForTags.includes('frontend') || textForTags.includes('styles')) {
    tags.push('Design');
  }
  if (textForTags.includes('api') || textForTags.includes('database') || textForTags.includes('backend') || textForTags.includes('server')) {
    tags.push('Engineering');
  }
  if (textForTags.includes('client') || textForTags.includes('onboarding') || textForTags.includes('meeting')) {
    tags.push('CRM');
  }

  return {
    title: cleanTitle,
    description: `Auto-extracted from prompt: "${prompt}"\n\n### Deliverables\n- [ ] Complete scope: "${cleanTitle}"\n- [ ] Verify execution with team representative`,
    priority,
    status: 'todo',
    clientName,
    dueDate,
    tags,
    assignedTo,
  };
};

/**
 * Smart Task Description Enhancer
 */
export const enhanceTaskDescription = async (rawDescription: string): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 350));

  // Clean duplicate headers first
  let cleanDesc = rawDescription
    .replace(/###\s*Executive\s*Overview\n?/gi, '')
    .replace(/###\s*Key\s*Acceptance\s*Criteria\n?/gi, '')
    .replace(/###\s*Structured\s*Acceptance\s*Criteria\n?/gi, '')
    .trim();

  if (!cleanDesc) {
    return `### Executive Overview\nExecute assigned sprint deliverable with high engineering precision.\n\n### Key Acceptance Criteria\n- [ ] Implement core functional architecture\n- [ ] Conduct unit & integration test coverage\n- [ ] Perform peer review and document API changes`;
  }

  return `### Executive Overview\n${cleanDesc}\n\n### Structured Acceptance Criteria\n- [ ] Core Logic Implementation & Error Boundary verification\n- [ ] Cross-browser & responsive layout audit\n- [ ] Final sign-off and status update in SYNCWAVE ERP`;
};

/**
 * AI Executive Assistant Q&A Engine (Fully Relatable and Context-Aware)
 */
export const queryAIAssistant = async (
  query: string,
  contextData: { tasks: any[]; clients: any[]; employees: any[] },
  rolePerspective: 'admin' | 'employee' = 'admin'
): Promise<AIResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const lower = query.toLowerCase().trim();
  const { tasks, clients, employees } = contextData;

  // 1. Friendly Conversational greetings ("hi", "hello", "hey", etc.)
  if (
    lower === 'hi' ||
    lower === 'hello' ||
    lower === 'hey' ||
    lower === 'greetings' ||
    lower.startsWith('hi ') ||
    lower.startsWith('hello ') ||
    lower.startsWith('hey ')
  ) {
    return {
      text: "Hello! I am your SYNCWAVE AI assistant.\n\nI can help you monitor staff workloads, look up active client portfolios, track critical overdue deliverables, or navigate the ERP workspace.\n\nHow can I help you today?",
      actions: [
        { label: '📋 Task Matrix', actionType: 'navigate', payload: { tab: 'tasks' } },
        { label: '👥 Team Backlog', actionType: 'navigate', payload: { tab: 'employees' } },
      ],
    };
  }

  // 2. Handle "overdue" or "delayed" queries
  if (lower.includes('overdue') || lower.includes('delay') || lower.includes('late')) {
    const overdueTasks = tasks.filter(t => t.isOverdue || t.priority === 'urgent');
    if (overdueTasks.length === 0) {
      return {
        text: "Outstanding! There are currently no overdue or urgent tasks flagged in the workspace status checklist. Team delivery is completely on schedule.",
      };
    }

    const taskListText = overdueTasks
      .slice(0, 3)
      .map(t => `- **${t.title}** (Assigned to: ${t.assignedTo || 'Unassigned'}, Due: ${t.dueDate})`)
      .join('\n');

    return {
      text: `There are currently **${overdueTasks.length} urgent or overdue tasks** requiring immediate attention:\n\n${taskListText}\n\nWould you like to examine these tasks or reassign them?`,
      actions: overdueTasks.slice(0, 3).map(t => ({
        label: `View "${t.title.substring(0, 20)}..."`,
        actionType: 'view_task',
        payload: { id: t.id },
      })),
    };
  }

  // 3. Handle "team", "workload", "employee" or "member" queries
  if (lower.includes('team') || lower.includes('workload') || lower.includes('employee') || lower.includes('capacity')) {
    const activeStaff = employees.filter(e => e.status === 'active');
    const taskLoad = tasks.filter(t => t.status !== 'done').length;
    const avgLoad = activeStaff.length > 0 ? (taskLoad / activeStaff.length).toFixed(1) : '0';

    return {
      text: `You have **${employees.length} team members** registered, with **${activeStaff.length} active** on rotation. There are currently **${taskLoad} active deliverables** in the backlog, averaging **${avgLoad} tasks per active engineer**.\n\nWould you like to review the team roster or rebalance task distributions?`,
      actions: [
        { label: 'Manage Employees', actionType: 'navigate', payload: { tab: 'employees' } },
        { label: 'View Tasks Board', actionType: 'navigate', payload: { tab: 'tasks' } },
      ],
    };
  }

  // 4. Handle "client", "customer" or "account" queries
  if (lower.includes('client') || lower.includes('customer') || lower.includes('account')) {
    const onboardingClients = clients.filter(c => c.status === 'onboarding');
    const activeClients = clients.filter(c => c.status === 'active');
    
    let clientDetails = '';
    if (clients.length > 0) {
      clientDetails = `Top partners in scope include:\n` + clients
        .slice(0, 3)
        .map(c => `- **${c.companyName}** (${c.status.toUpperCase()} • Contact: ${c.contactName})`)
        .join('\n');
    }

    return {
      text: `Your company manages **${clients.length} total client accounts** (${activeClients.length} active, ${onboardingClients.length} onboarding).\n\n${clientDetails}\n\nWould you like to open the CRM directory to log notes or view contract values?`,
      actions: [
        { label: 'Open Clients CRM', actionType: 'navigate', payload: { tab: 'clients' } },
      ],
    };
  }

  // 5. Default Summary workspace status response
  const activeTasks = tasks.filter(t => t.status !== 'done');
  const criticalTasks = tasks.filter(t => t.isOverdue || t.priority === 'urgent');

  return {
    text: `Here is a real-time summary of the company workspace:\n\n` +
      `- **Active Deliverables**: ${activeTasks.length} pending items\n` +
      `- **Attention Required**: ${criticalTasks.length} urgent/overdue tasks\n` +
      `- **Operational Capacity**: ${employees.filter(e => e.status === 'active').length} active personnel\n` +
      `- **Registered Clients**: ${clients.length} organization accounts\n\n` +
      `How can I assist your operations workflow today?`,
    actions: [
      { label: 'Open Tasks Workspace', actionType: 'navigate', payload: { tab: 'tasks' } },
      { label: 'View Client Portfolio', actionType: 'navigate', payload: { tab: 'clients' } },
    ],
  };
};
