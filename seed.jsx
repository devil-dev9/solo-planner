// Seed data — MSP License Tracker 30-day launch plan with goals, habits, and tasks.

const MSP_PLAN = {
  id: "msp-30-day",
  title: "MSP License Tracker — 30-Day Launch",
  subtitle: "Build the outbound engine, book 50–100 demos, close first 10–25 MSPs",
  startDate: "2026-05-26",
  color: "green",

  habits: [
    { id: "h1", text: "Send ≥ 50 cold emails", completedDates: [] },
    { id: "h2", text: "Send 30 LinkedIn connection requests", completedDates: [] },
    { id: "h3", text: "Reply to all inbound messages within 1 hour", completedDates: [] },
    { id: "h4", text: "Post 1 piece of content (LinkedIn / Reddit)", completedDates: [] },
    { id: "h5", text: "Review metrics + log today's numbers", completedDates: [] },
  ],

  goals: [
    {
      id: "g1",
      title: "Get first 10 paying MSP customers",
      description: "Close the first wave in 30 days to validate product-market fit",
      dueDate: "2026-06-25",
      keyResults: [
        { id: "kr1", text: "Book 50+ demo / audit calls", current: 0, target: 50, unit: "calls" },
        { id: "kr2", text: "Start 25+ trials", current: 0, target: 25, unit: "trials" },
        { id: "kr3", text: "Close 10+ paying customers", current: 0, target: 10, unit: "customers" },
      ],
    },
    {
      id: "g2",
      title: "Build the outbound lead machine",
      description: "Generate and work through 3,000–5,000 qualified MSP leads",
      dueDate: "2026-06-25",
      keyResults: [
        { id: "kr4", text: "Collect 3,000+ MSP leads", current: 0, target: 3000, unit: "leads" },
        { id: "kr5", text: "Send 2,000+ cold emails", current: 0, target: 2000, unit: "emails" },
        { id: "kr6", text: "Send 900+ LinkedIn connection requests", current: 0, target: 900, unit: "requests" },
      ],
    },
    {
      id: "g3",
      title: "Hit $5,000 MRR",
      description: "Reach meaningful revenue to fund growth and validate pricing",
      dueDate: "2026-06-25",
      keyResults: [
        { id: "kr7", text: "Reach $5,000 MRR", current: 0, target: 5000, unit: "$" },
        { id: "kr8", text: "List on 2+ MSP marketplaces (Pax8, Microsoft)", current: 0, target: 2, unit: "listings" },
        { id: "kr9", text: "Publish 3+ customer case studies", current: 0, target: 3, unit: "studies" },
      ],
    },
  ],

  metrics: [
    { id: "m1", name: "MSP leads collected", current: 0, targetMin: 3000, targetMax: 5000, unit: "leads" },
    { id: "m2", name: "Cold emails sent", current: 0, targetMin: 2000, targetMax: 3500, unit: "emails" },
    { id: "m3", name: "LinkedIn connection requests", current: 0, targetMin: 600, targetMax: 900, unit: "requests" },
    { id: "m4", name: "Reddit/community contributions", current: 0, targetMin: 30, targetMax: 50, unit: "posts" },
    { id: "m5", name: "Demo / audit calls booked", current: 0, targetMin: 50, targetMax: 100, unit: "calls" },
    { id: "m6", name: "Trials started", current: 0, targetMin: 50, targetMax: 150, unit: "trials" },
    { id: "m7", name: "Paid MSPs", current: 0, targetMin: 10, targetMax: 25, unit: "customers" },
    { id: "m8", name: "MRR", current: 0, targetMin: 5000, targetMax: 20000, unit: "$" },
    { id: "m9", name: "Case studies", current: 0, targetMin: 3, targetMax: 5, unit: "studies" },
  ],

  weeks: [
    {
      week: 1,
      title: "Setup and lead engine",
      days: [
        { day: 1, title: "Email and identity", tasks: [
          "Buy 2 sending domains",
          "Create email accounts (founder@, sales@, support@, partnerships@)",
          "Set SPF, DKIM, DMARC records",
          "Create business phone number (OpenPhone / Dialpad)",
          "Create Calendly booking link",
          "Create HubSpot CRM (free tier)",
        ]},
        { day: 2, title: "Profiles", tasks: [
          "Create LinkedIn company page (logo, tagline, website)",
          "Update founder LinkedIn profile + headline",
          "Create Reddit account",
          "Create YouTube channel",
          "Create Microsoft Partner Center account",
          "Draft G2 / Capterra profile",
        ]},
        { day: 3, title: "Sales assets", tasks: [
          "Create one-page PDF overview",
          "Create sample leakage report",
          "Record 2-minute demo video",
          "Write security / permissions document",
          "Build cold email landing page",
        ]},
        { day: 4, title: "Build first leads", tasks: [
          "Collect 250 leads (Apollo / LinkedIn Sales Nav)",
          "Segment by MSP size",
          "Write personalization notes per lead",
          "Verify emails (Findymail / Prospeo)",
        ]},
        { day: 5, title: "Expand leads + LinkedIn", tasks: [
          "Build next 250 leads",
          "Send 30 LinkedIn connection requests",
          "Comment on 10 MSP posts",
          "Test email deliverability",
        ]},
        { day: 6, title: "Prepare campaign", tasks: [
          "Build next 250 leads",
          "Prepare cold email campaign in Instantly / Smartlead",
          "Add unsubscribe text + physical address (CAN-SPAM)",
          "QA all links and tracking",
          "Submit Pax8 vendor inquiry (draft)",
        ]},
        { day: 7, title: "Soft launch", tasks: [
          "Build next 250 leads (1,000 total)",
          "Launch soft email test to 50–100 prospects",
          "Post first LinkedIn educational post",
        ]},
      ],
    },
    {
      week: 2,
      title: "Launch outbound",
      days: [
        { day: 8, title: "Outbound day 1", tasks: [
          "Send 100–150 cold emails",
          "Send 30 LinkedIn connection requests",
          "Comment on 10 MSP posts",
          "Reply to all responses within 1 hour",
        ]},
        { day: 9, title: "Outbound day 2", tasks: [
          "Send 150 cold emails",
          "Build 250 new leads",
          "Send LinkedIn DMs to accepted connections",
          "Research marketplace applications",
        ]},
        { day: 10, title: "Marketplaces start", tasks: [
          "Send 200 cold emails",
          "Build 250 new leads",
          "Start Microsoft Marketplace (Partner Center) setup",
          "Prepare Pax8 vendor inquiry",
        ]},
        { day: 11, title: "Pax8 submit", tasks: [
          "Send 200 cold emails",
          "Send 40 LinkedIn connection requests",
          "Post LinkedIn content (billing leakage angle)",
          "Submit Pax8 inquiry",
        ]},
        { day: 12, title: "ConnectWise + warm replies", tasks: [
          "Send 200 cold emails",
          "Follow up with warm replies",
          "Submit ConnectWise marketplace / Invent inquiry",
          "Build 250 leads",
        ]},
        { day: 13, title: "Book calls + record objections", tasks: [
          "Send 200 cold emails",
          "Book calls from positive replies",
          "Ask every MSP: 'How many M365 tenants do you manage?'",
          "Record top 5 objections heard",
        ]},
        { day: 14, title: "Week 2 review", tasks: [
          "Review open rate, reply rate, positive reply rate",
          "Review booked calls + bad-fit replies",
          "Rewrite underperforming subject lines",
          "Plan week 3 segments",
        ]},
      ],
    },
    {
      week: 3,
      title: "Scale what works",
      days: [
        { day: 15, title: "New campaign angle", tasks: [
          "Send 250 cold emails",
          "Start second angle: 'inactive licensed users'",
          "Post LinkedIn case-style educational content",
          "Comment on Reddit r/msp threads",
        ]},
        { day: 16, title: "Demos + leakage tracking", tasks: [
          "Build 500 more leads",
          "Send LinkedIn DMs to accepted connections",
          "Run demos / audits",
          "Track leakage $ found per tenant",
        ]},
        { day: 17, title: "Phone follow-up", tasks: [
          "Send 250 cold emails",
          "Start phone follow-up for warm replies",
          "Prepare first anonymized case study",
        ]},
        { day: 18, title: "Reddit research post", tasks: [
          "Send 250 cold emails",
          "Post Reddit research question (M365 reconciliation)",
          "Follow up with marketplace contacts",
        ]},
        { day: 19, title: "Annual + referrals", tasks: [
          "Send 250 cold emails",
          "Push annual plan to serious prospects",
          "Ask prospects for referral to MSP communities",
        ]},
        { day: 20, title: "Data review", tasks: [
          "Which title replies best?",
          "Which country replies best?",
          "Which message angle works best?",
          "Which objection appears most?",
        ]},
        { day: 21, title: "Iterate + scale", tasks: [
          "Create improved campaign based on data",
          "Build another 500 leads",
          "Prepare second sending domain / inbox if needed",
        ]},
      ],
    },
    {
      week: 4,
      title: "Convert and partner",
      days: [
        { day: 22, title: "Finance/ops campaign", tasks: [
          "Send 300 cold emails",
          "Launch campaign to finance / ops managers",
          "Continue LinkedIn DMs",
          "Post LinkedIn: 'billing leakage is an ops problem'",
        ]},
        { day: 23, title: "Push paid conversions", tasks: [
          "Run demos / audits",
          "Push first paid conversions",
          "Offer founder onboarding for new customers",
          "Ask each new customer for a testimonial",
        ]},
        { day: 24, title: "Partner outreach", tasks: [
          "Send 300 cold emails",
          "Start partner outreach to MSP consultants",
          "Message ConnectWise / Autotask billing consultants",
        ]},
        { day: 25, title: "Referral program", tasks: [
          "Create partner / referral offer (25% recurring 12mo OR 15% lifetime)",
          "Reach out to 50 MSP consultants",
        ]},
        { day: 26, title: "Reddit findings post", tasks: [
          "Send 300 cold emails",
          "Post Reddit findings post",
          "Follow up Microsoft / Pax8 / ConnectWise applications",
        ]},
        { day: 27, title: "Founder offer", tasks: [
          "Create 'first 100 MSPs' offer (founder onboarding + discounted annual + priority feature input)",
          "Promote founder offer in outreach",
        ]},
        { day: 28, title: "Funnel review", tasks: [
          "Review full funnel: leads → emails → replies → calls → trials → paid",
          "Kill bad segments",
          "Double down on best segment",
          "Prepare next 30-day plan",
        ]},
        { day: 29, title: "Customer asks", tasks: [
          "Ask happy users for testimonials",
          "Collect anonymized leakage numbers",
          "Ask for referrals to 2 MSP owners each",
          "Get permission to create case study",
        ]},
        { day: 30, title: "Final report", tasks: [
          "Final report: leads, emails, replies, calls, trials, paid, MRR",
          "Document best-performing subject + segment",
          "Document top objections",
          "Write next month growth plan",
        ]},
      ],
    },
  ],
};

function seedPlan() {
  let taskCounter = 0;
  const days = [];
  for (const week of MSP_PLAN.weeks) {
    for (const d of week.days) {
      days.push({
        day: d.day,
        weekNumber: week.week,
        weekTitle: week.title,
        title: d.title,
        tasks: d.tasks.map((t) => ({
          id: `t${++taskCounter}`,
          text: t,
          done: false,
          note: "",
          subitems: [],
          priority: "normal",
          label: "",
          dueDate: "",
        })),
      });
    }
  }
  return {
    id: MSP_PLAN.id,
    title: MSP_PLAN.title,
    subtitle: MSP_PLAN.subtitle,
    startDate: MSP_PLAN.startDate,
    color: MSP_PLAN.color,
    metrics: MSP_PLAN.metrics.map((m) => ({ ...m, history: [] })),
    goals: MSP_PLAN.goals.map((g) => ({ ...g, keyResults: g.keyResults.map((kr) => ({ ...kr })) })),
    habits: MSP_PLAN.habits.map((h) => ({ ...h })),
    notes: "",
    content: [],
    days,
  };
}

window.seedPlan = seedPlan;
