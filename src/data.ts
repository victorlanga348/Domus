import { FamilyMember, HouseTask, TaskRotation, ExpenseItem, HouseRule, ActivityLog, SystemPreferences, MuralNote, MemberStatus, TaskAuditItem } from './types';

export const INITIAL_MURAL_NOTES: MuralNote[] = [
  {
    id: 'n1',
    content: "Don't forget to walk Cooper before it gets too hot! 🐕",
    color: 'amber',
    dateStr: 'Today, 9:00 AM',
    author: 'Alex Johnson',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC8TYOmIkYXRZide5HArpu-t7fu6HGnjVoYW-fT8kjMkFhmfedQAf43AqakxLaSSxWaHE3OQx1cpw97t-jPZ6bcKS9OshL9ks7FJTYV5g_t4rcu1aca3mxuCSIuYpeoZ4YlglztQm2CayEdq1eBmXIZNvFuS3878_gdkjmSROe2iO_vvdEWifnAA2O-oVoOkBLeksUDLWQ-bUmqrDWfr2WYJPuR9prj3UZJG6gmCDqWGz6Rl6-whI',
    isPinned: true
  },
  {
    id: 'n2',
    title: 'Grocery List',
    content: 'Items to buy for the weekend:',
    items: [
      { id: 'i1', text: 'Oat milk', done: false },
      { id: 'i2', text: 'Avocados', done: true },
      { id: 'i3', text: 'Coffee beans', done: false }
    ],
    color: 'teal',
    dateStr: 'Yesterday',
    author: 'Sarah Johnson',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSRfWa_-6MKjmFp5UY08eDyV4qTAn7mVTxouTxMZWAw4Jyyuiic-WQdHAC1DsG68ZiDmJQk4lQ5t4fTOZWzVwETeEIwx7PeRmFLVJUw-H4uYp-rfwF51tsC7zlssRv64ZxTQXpicdQTO2to-sNTYBoHp_5EerZyQhr7KQzliqM1XqDryqws2d09jEl48HsjWst3N32Votqs-vNF0EcVQAOCrtjVsmhL8B6Hxd9o6e_hTHhfz4iiNU',
    isPinned: true
  },
  {
    id: 'n3',
    content: 'Plumber coming tomorrow at 2PM for the guest bath. 🔧',
    color: 'gray',
    dateStr: 'Yesterday',
    author: 'Alex Johnson',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC8TYOmIkYXRZide5HArpu-t7fu6HGnjVoYW-fT8kjMkFhmfedQAf43AqakxLaSSxWaHE3OQx1cpw97t-jPZ6bcKS9OshL9ks7FJTYV5g_t4rcu1aca3mxuCSIuYpeoZ4YlglztQm2CayEdq1eBmXIZNvFuS3878_gdkjmSROe2iO_vvdEWifnAA2O-oVoOkBLeksUDLWQ-bUmqrDWfr2WYJPuR9prj3UZJG6gmCDqWGz6Rl6-whI',
    isPinned: true
  }
];

export const INITIAL_MEMBER_STATUSES: MemberStatus[] = [
  {
    id: 's1',
    name: 'Alex',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC8TYOmIkYXRZide5HArpu-t7fu6HGnjVoYW-fT8kjMkFhmfedQAf43AqakxLaSSxWaHE3OQx1cpw97t-jPZ6bcKS9OshL9ks7FJTYV5g_t4rcu1aca3mxuCSIuYpeoZ4YlglztQm2CayEdq1eBmXIZNvFuS3878_gdkjmSROe2iO_vvdEWifnAA2O-oVoOkBLeksUDLWQ-bUmqrDWfr2WYJPuR9prj3UZJG6gmCDqWGz6Rl6-whI',
    location: 'In Home Office',
    icon: 'laptop'
  },
  {
    id: 's2',
    name: 'Sarah',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSRfWa_-6MKjmFp5UY08eDyV4qTAn7mVTxouTxMZWAw4Jyyuiic-WQdHAC1DsG68ZiDmJQk4lQ5t4fTOZWzVwETeEIwx7PeRmFLVJUw-H4uYp-rfwF51tsC7zlssRv64ZxTQXpicdQTO2to-sNTYBoHp_5EerZyQhr7KQzliqM1XqDryqws2d09jEl48HsjWst3N32Votqs-vNF0EcVQAOCrtjVsmhL8B6Hxd9o6e_hTHhfz4iiNU',
    location: 'At Work',
    icon: 'directions_car'
  }
];

export const INITIAL_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'm1',
    name: 'Alex Johnson',
    email: 'alex.johnson@gmail.com',
    role: 'Admin',
    isPrimary: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC8TYOmIkYXRZide5HArpu-t7fu6HGnjVoYW-fT8kjMkFhmfedQAf43AqakxLaSSxWaHE3OQx1cpw97t-jPZ6bcKS9OshL9ks7FJTYV5g_t4rcu1aca3mxuCSIuYpeoZ4YlglztQm2CayEdq1eBmXIZNvFuS3878_gdkjmSROe2iO_vvdEWifnAA2O-oVoOkBLeksUDLWQ-bUmqrDWfr2WYJPuR9prj3UZJG6gmCDqWGz6Rl6-whI',
    balanceOwed: -75.00 // Owes $75.00
  },
  {
    id: 'm2',
    name: 'Sarah Johnson',
    email: 'sarah.j@gmail.com',
    role: 'Resident',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSRfWa_-6MKjmFp5UY08eDyV4qTAn7mVTxouTxMZWAw4Jyyuiic-WQdHAC1DsG68ZiDmJQk4lQ5t4fTOZWzVwETeEIwx7PeRmFLVJUw-H4uYp-rfwF51tsC7zlssRv64ZxTQXpicdQTO2to-sNTYBoHp_5EerZyQhr7KQzliqM1XqDryqws2d09jEl48HsjWst3N32Votqs-vNF0EcVQAOCrtjVsmhL8B6Hxd9o6e_hTHhfz4iiNU',
    balanceOwed: 120.50 // Gets $120.50
  },
  {
    id: 'm3',
    name: 'Leo Johnson',
    email: 'leo.j@gmail.com',
    role: 'Resident (Restricted)',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADpC8k_C79YOfxtPphhWhwt-CWjWWIx1NUWLD-qwpmP3nEKdrRWMCnnH8083bHzDeafNIkzgIjmIsyO38eZrfRSKN0JHntWBQGlFRaa9f325UG8Yo5NTC4KP4X2XBOg6_fAMG80zWwF2ShpncDZCITTRkLs4rnhkCu79Al1GBpyUcy-RNLFn9w1ThRAEHNPEUkyv4jzsrPys1XEN_je5MZ4vQndh9QPV2GB4rZgLl-9zl6_qn4lss',
    balanceOwed: 0
  },
  {
    id: 'm4',
    name: 'Guest Access',
    email: 'guest@domus.local',
    role: 'Guest Access',
    temporary: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkUJmVd6gx65IBXkdE2yCOXcA2f4x_q162V_CrnCZX9XSxox5EujJlvJ-0Cs9x01Y3kb8b_nsIUba_kNbY7lrWPHP3qBzW01qvyS3H60z5wpCUNEx7ezW83TIdZkO5A2q-uay4NquRHeZXBWTlXp9NR8PP_wkwcIjtBtccjdRghqXLRora0ocFDP0zjt0t7ooHj_T7MLHsBerswUNcYwFGM6kdxNaaeNFX_l6ct8qy4-FcPsyXV54',
    balanceOwed: 0
  }
];

export const INITIAL_TASKS: HouseTask[] = [
  {
    id: 't1',
    title: 'Lavar a louça',
    period: 'morning',
    nextMember: '🔄 Sarah Johnson',
    nextMemberAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSRfWa_-6MKjmFp5UY08eDyV4qTAn7mVTxouTxMZWAw4Jyyuiic-WQdHAC1DsG68ZiDmJQk4lQ5t4fTOZWzVwETeEIwx7PeRmFLVJUw-H4uYp-rfwF51tsC7zlssRv64ZxTQXpicdQTO2to-sNTYBoHp_5EerZyQhr7KQzliqM1XqDryqws2d09jEl48HsjWst3N32Votqs-vNF0EcVQAOCrtjVsmhL8B6Hxd9o6e_hTHhfz4iiNU',
    status: 'pending',
    icon: 'countertops',
    frequency: 'Diária',
    days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    isRotation: true,
  },
  {
    id: 't2',
    title: 'Passear com o cão',
    period: 'morning',
    nextMember: 'Alex Johnson',
    nextMemberAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC8TYOmIkYXRZide5HArpu-t7fu6HGnjVoYW-fT8kjMkFhmfedQAf43AqakxLaSSxWaHE3OQx1cpw97t-jPZ6bcKS9OshL9ks7FJTYV5g_t4rcu1aca3mxuCSIuYpeoZ4YlglztQm2CayEdq1eBmXIZNvFuS3878_gdkjmSROe2iO_vvdEWifnAA2O-oVoOkBLeksUDLWQ-bUmqrDWfr2WYJPuR9prj3UZJG6gmCDqWGz6Rl6-whI',
    status: 'pending',
    icon: 'pets',
    frequency: 'Dias Úteis',
    days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
    isRotation: false,
  },
  {
    id: 't3',
    title: 'Regar as plantas da varanda',
    period: 'afternoon',
    nextMember: 'Sarah Johnson',
    nextMemberAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSRfWa_-6MKjmFp5UY08eDyV4qTAn7mVTxouTxMZWAw4Jyyuiic-WQdHAC1DsG68ZiDmJQk4lQ5t4fTOZWzVwETeEIwx7PeRmFLVJUw-H4uYp-rfwF51tsC7zlssRv64ZxTQXpicdQTO2to-sNTYBoHp_5EerZyQhr7KQzliqM1XqDryqws2d09jEl48HsjWst3N32Votqs-vNF0EcVQAOCrtjVsmhL8B6Hxd9o6e_hTHhfz4iiNU',
    status: 'pending',
    icon: 'potted_plant',
    frequency: 'Semanal',
    days: ['Qua', 'Sáb'],
    isRotation: false,
  },
  {
    id: 't4',
    title: 'Retirar o lixo reciclável',
    period: 'night',
    nextMember: '🔄 Leo Johnson',
    nextMemberAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADpC8k_C79YOfxtPphhWhwt-CWjWWIx1NUWLD-qwpmP3nEKdrRWMCnnH8083bHzDeafNIkzgIjmIsyO38eZrfRSKN0JHntWBQGlFRaa9f325UG8Yo5NTC4KP4X2XBOg6_fAMG80zWwF2ShpncDZCITTRkLs4rnhkCu79Al1GBpyUcy-RNLFn9w1ThRAEHNPEUkyv4jzsrPys1XEN_je5MZ4vQndh9QPV2GB4rZgLl-9zl6_qn4lss',
    status: 'pending',
    icon: 'delete',
    frequency: 'Dias Úteis',
    days: ['Seg', 'Qua', 'Sex'],
    isRotation: true,
  }
];

export const INITIAL_ROTATIONS: TaskRotation[] = [
  {
    id: 'r1',
    title: 'Lixo Orgânico',
    schedule: 'Diária • 20:00',
    nextMember: 'Leo Johnson',
    nextMemberAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADpC8k_C79YOfxtPphhWhwt-CWjWWIx1NUWLD-qwpmP3nEKdrRWMCnnH8083bHzDeafNIkzgIjmIsyO38eZrfRSKN0JHntWBQGlFRaa9f325UG8Yo5NTC4KP4X2XBOg6_fAMG80zWwF2ShpncDZCITTRkLs4rnhkCu79Al1GBpyUcy-RNLFn9w1ThRAEHNPEUkyv4jzsrPys1XEN_je5MZ4vQndh9QPV2GB4rZgLl-9zl6_qn4lss',
    frequency: 'Diária',
    poolSelection: 'All Family (4)',
    icon: 'delete',
    days: ['MON', 'WED', 'FRI'],
    queue: [
      {
        name: 'Leo',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADpC8k_C79YOfxtPphhWhwt-CWjWWIx1NUWLD-qwpmP3nEKdrRWMCnnH8083bHzDeafNIkzgIjmIsyO38eZrfRSKN0JHntWBQGlFRaa9f325UG8Yo5NTC4KP4X2XBOg6_fAMG80zWwF2ShpncDZCITTRkLs4rnhkCu79Al1GBpyUcy-RNLFn9w1ThRAEHNPEUkyv4jzsrPys1XEN_je5MZ4vQndh9QPV2GB4rZgLl-9zl6_qn4lss',
        isNext: true
      },
      {
        name: 'Mia',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSRfWa_-6MKjmFp5UY08eDyV4qTAn7mVTxouTxMZWAw4Jyyuiic-WQdHAC1DsG68ZiDmJQk4lQ5t4fTOZWzVwETeEIwx7PeRmFLVJUw-H4uYp-rfwF51tsC7zlssRv64ZxTQXpicdQTO2to-sNTYBoHp_5EerZyQhr7KQzliqM1XqDryqws2d09jEl48HsjWst3N32Votqs-vNF0EcVQAOCrtjVsmhL8B6Hxd9o6e_hTHhfz4iiNU'
      },
      {
        name: 'Alex',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC8TYOmIkYXRZide5HArpu-t7fu6HGnjVoYW-fT8kjMkFhmfedQAf43AqakxLaSSxWaHE3OQx1cpw97t-jPZ6bcKS9OshL9ks7FJTYV5g_t4rcu1aca3mxuCSIuYpeoZ4YlglztQm2CayEdq1eBmXIZNvFuS3878_gdkjmSROe2iO_vvdEWifnAA2O-oVoOkBLeksUDLWQ-bUmqrDWfr2WYJPuR9prj3UZJG6gmCDqWGz6Rl6-whI'
      }
    ]
  },
  {
    id: 'r2',
    title: 'Lava-Louças',
    schedule: 'Daily • After Meals',
    nextMember: 'Mia',
    nextMemberAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSRfWa_-6MKjmFp5UY08eDyV4qTAn7mVTxouTxMZWAw4Jyyuiic-WQdHAC1DsG68ZiDmJQk4lQ5t4fTOZWzVwETeEIwx7PeRmFLVJUw-H4uYp-rfwF51tsC7zlssRv64ZxTQXpicdQTO2to-sNTYBoHp_5EerZyQhr7KQzliqM1XqDryqws2d09jEl48HsjWst3N32Votqs-vNF0EcVQAOCrtjVsmhL8B6Hxd9o6e_hTHhfz4iiNU',
    frequency: 'Daily',
    poolSelection: 'Adults Only (2)',
    icon: 'countertops',
    days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    queue: [
      {
        name: 'Mia',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSRfWa_-6MKjmFp5UY08eDyV4qTAn7mVTxouTxMZWAw4Jyyuiic-WQdHAC1DsG68ZiDmJQk4lQ5t4fTOZWzVwETeEIwx7PeRmFLVJUw-H4uYp-rfwF51tsC7zlssRv64ZxTQXpicdQTO2to-sNTYBoHp_5EerZyQhr7KQzliqM1XqDryqws2d09jEl48HsjWst3N32Votqs-vNF0EcVQAOCrtjVsmhL8B6Hxd9o6e_hTHhfz4iiNU',
        isNext: true
      },
      {
        name: 'Alex',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC8TYOmIkYXRZide5HArpu-t7fu6HGnjVoYW-fT8kjMkFhmfedQAf43AqakxLaSSxWaHE3OQx1cpw97t-jPZ6bcKS9OshL9ks7FJTYV5g_t4rcu1aca3mxuCSIuYpeoZ4YlglztQm2CayEdq1eBmXIZNvFuS3878_gdkjmSROe2iO_vvdEWifnAA2O-oVoOkBLeksUDLWQ-bUmqrDWfr2WYJPuR9prj3UZJG6gmCDqWGz6Rl6-whI'
      }
    ]
  },
  {
    id: 'r3',
    title: 'Passear com Cachorro',
    schedule: 'Daily • Morning',
    nextMember: 'Alex',
    nextMemberAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC8TYOmIkYXRZide5HArpu-t7fu6HGnjVoYW-fT8kjMkFhmfedQAf43AqakxLaSSxWaHE3OQx1cpw97t-jPZ6bcKS9OshL9ks7FJTYV5g_t4rcu1aca3mxuCSIuYpeoZ4YlglztQm2CayEdq1eBmXIZNvFuS3878_gdkjmSROe2iO_vvdEWifnAA2O-oVoOkBLeksUDLWQ-bUmqrDWfr2WYJPuR9prj3UZJG6gmCDqWGz6Rl6-whI',
    frequency: 'Daily',
    poolSelection: 'All Family (4)',
    icon: 'pets',
    days: ['MON', 'WED', 'SAT'],
    queue: [
      {
        name: 'Alex',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC8TYOmIkYXRZide5HArpu-t7fu6HGnjVoYW-fT8kjMkFhmfedQAf43AqakxLaSSxWaHE3OQx1cpw97t-jPZ6bcKS9OshL9ks7FJTYV5g_t4rcu1aca3mxuCSIuYpeoZ4YlglztQm2CayEdq1eBmXIZNvFuS3878_gdkjmSROe2iO_vvdEWifnAA2O-oVoOkBLeksUDLWQ-bUmqrDWfr2WYJPuR9prj3UZJG6gmCDqWGz6Rl6-whI',
        isNext: true
      },
      {
        name: 'Leo',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADpC8k_C79YOfxtPphhWhwt-CWjWWIx1NUWLD-qwpmP3nEKdrRWMCnnH8083bHzDeafNIkzgIjmIsyO38eZrfRSKN0JHntWBQGlFRaa9f325UG8Yo5NTC4KP4X2XBOg6_fAMG80zWwF2ShpncDZCITTRkLs4rnhkCu79Al1GBpyUcy-RNLFn9w1ThRAEHNPEUkyv4jzsrPys1XEN_je5MZ4vQndh9QPV2GB4rZgLl-9zl6_qn4lss'
      }
    ]
  }
];

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'e1',
    title: 'Plumber - Kitchen Sink',
    amount: 150.00,
    dateStr: 'Today, 14:30',
    paidBy: 'Alex',
    categoryIcon: 'plumbing',
    status: 'Unsettled'
  },
  {
    id: 'e2',
    title: 'Weekly Groceries & Cleaning',
    amount: 324.50,
    dateStr: 'Yesterday, 09:15',
    paidBy: 'Sarah',
    categoryIcon: 'shopping_cart',
    status: 'Settled'
  },
  {
    id: 'e3',
    title: 'Electricity Bill - July',
    amount: 180.20,
    dateStr: '28 Jul, Auto-pay',
    paidBy: 'Home Fund',
    categoryIcon: 'bolt',
    status: 'Settled',
    autoPay: true
  },
  {
    id: 'e4',
    title: 'Internet Fiber 1Gbps',
    amount: 65.00,
    dateStr: '25 Jul, Auto-pay',
    paidBy: 'Alex',
    categoryIcon: 'wifi',
    status: 'Settled',
    autoPay: true
  }
];

export const INITIAL_HOUSE_RULES: HouseRule[] = [
  {
    id: 'hr1',
    number: 1,
    title: 'Quiet Hours',
    description: 'Media volumes are automatically capped at 40% between 10:00 PM and 7:00 AM.'
  },
  {
    id: 'hr2',
    number: 2,
    title: 'Energy Conservation',
    description: 'HVAC systems revert to eco-mode when rooms are unoccupied for more than 2 hours.'
  },
  {
    id: 'hr3',
    number: 3,
    title: 'Recycling Separation',
    description: 'Ensure organic waste is bagged separately from glass and plastics before 8:00 PM.'
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'a1',
    title: 'Lixo retirado',
    timeAgo: 'Há 10 min por Maria',
    author: 'Maria',
    likes: 1,
    type: 'task'
  },
  {
    id: 'a2',
    title: 'Porta da frente trancada',
    timeAgo: 'Há 45 min (Auto)',
    author: 'Auto',
    type: 'security'
  },
  {
    id: 'a3',
    title: 'Termostato ajustado para 22°C',
    timeAgo: 'Há 2 hrs por Alex',
    author: 'Alex',
    type: 'climate'
  },
  {
    id: 'a4',
    title: 'Nível de água do purificador OK',
    timeAgo: 'Há 5 hrs por Sistema',
    author: 'Domus',
    type: 'system'
  }
];

export const INITIAL_TASK_AUDIT_LOGS: TaskAuditItem[] = [
  {
    id: 'aud_1',
    title: 'Lavar a Louça',
    member: 'Marina',
    memberAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    timestamp: 'Hoje às 14:30',
    dateStr: '06 Ago 2026',
    status: 'completed',
    category: 'Cozinha',
    comment: 'Louça limpa e organizada. Os pratos maiores foram colocados no escorredor superior.',
    audited: true,
    auditedBy: 'Alex (Gestor)',
    auditedAt: 'Hoje às 15:00',
    auditNotes: 'Conferido no local. Tudo impecável.'
  },
  {
    id: 'aud_2',
    title: 'Manutenção do Jardim',
    member: 'Carlos',
    memberAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    timestamp: 'Ontem, 16:45',
    dateStr: '05 Ago 2026',
    status: 'justified',
    category: 'Jardim',
    photoUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&q=80',
    comment: 'Não foi possível concluir devido à forte chuva na região sul do jardim.',
    audited: false
  },
  {
    id: 'aud_3',
    title: 'Atualização do Sistema de Segurança',
    member: 'Sistema',
    memberAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    timestamp: 'Ontem, 02:00',
    dateStr: '05 Ago 2026',
    status: 'failed',
    category: 'Manutenção',
    errorMessage: 'ERR_CONNECTION_TIMEOUT: Falha de comunicação com o servidor principal de atualizações.',
    audited: false
  },
  {
    id: 'aud_4',
    title: 'Passear com o Pet (Cooper)',
    member: 'Alex Johnson',
    memberAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC8TYOmIkYXRZide5HArpu-t7fu6HGnjVoYW-fT8kjMkFhmfedQAf43AqakxLaSSxWaHE3OQx1cpw97t-jPZ6bcKS9OshL9ks7FJTYV5g_t4rcu1aca3mxuCSIuYpeoZ4YlglztQm2CayEdq1eBmXIZNvFuS3878_gdkjmSROe2iO_vvdEWifnAA2O-oVoOkBLeksUDLWQ-bUmqrDWfr2WYJPuR9prj3UZJG6gmCDqWGz6Rl6-whI',
    timestamp: 'Há 2 dias',
    dateStr: '04 Ago 2026',
    status: 'completed',
    category: 'Pets',
    comment: 'Passeio de 30 min realizado no parque da vizinhança. Cooper tomou água e descansou.',
    audited: true,
    auditedBy: 'Sarah'
  },
  {
    id: 'aud_5',
    title: 'Troca de Filtro do Purificador',
    member: 'Leo Johnson',
    memberAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADpC8k_C79YOfxtPphhWhwt-CWjWWIx1NUWLD-qwpmP3nEKdrRWMCnnH8083bHzDeafNIkzgIjmIsyO38eZrfRSKN0JHntWBQGlFRaa9f325UG8Yo5NTC4KP4X2XBOg6_fAMG80zWwF2ShpncDZCITTRkLs4rnhkCu79Al1GBpyUcy-RNLFn9w1ThRAEHNPEUkyv4jzsrPys1XEN_je5MZ4vQndh9QPV2GB4rZgLl-9zl6_qn4lss',
    timestamp: 'Há 3 dias',
    dateStr: '03 Ago 2026',
    status: 'justified',
    category: 'Cozinha',
    photoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80',
    comment: 'Refil novo encomendado. Chega na próxima sexta-feira.',
    audited: false
  },
  {
    id: 'aud_6',
    title: 'Organizar Sacos de Reciclagem',
    member: 'Sarah Johnson',
    memberAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSRfWa_-6MKjmFp5UY08eDyV4qTAn7mVTxouTxMZWAw4Jyyuiic-WQdHAC1DsG68ZiDmJQk4lQ5t4fTOZWzVwETeEIwx7PeRmFLVJUw-H4uYp-rfwF51tsC7zlssRv64ZxTQXpicdQTO2to-sNTYBoHp_5EerZyQhr7KQzliqM1XqDryqws2d09jEl48HsjWst3N32Votqs-vNF0EcVQAOCrtjVsmhL8B6Hxd9o6e_hTHhfz4iiNU',
    timestamp: 'Há 4 dias',
    dateStr: '02 Ago 2026',
    status: 'completed',
    category: 'Geral',
    comment: 'Recicláveis separados em plástico e papelão colocados na lixeira externa.',
    audited: true
  }
];

export const INITIAL_PREFERENCES: SystemPreferences = {
  nightMode: {
    enabled: true,
    startTime: '22:00',
    endTime: '06:30'
  },
  vacationTriggers: {
    enabled: false,
    randomizeLivingRoomLights: true,
    suspendWaterHeater: true
  }
};
