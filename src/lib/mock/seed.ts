import type {
  AboutContent,
  AdminUser,
  AnalyticsSnapshot,
  AppearanceSettings,
  BlockedDate,
  BlogPost,
  ContactSettings,
  Conversation,
  ChatMessage,
  DayAvailability,
  FooterSettings,
  HeroContent,
  Lead,
  Service,
  Stat,
  Task,
  Testimonial,
  TeamMember,
  ValueItem,
} from "@/types";
import { DEFAULT_APPEARANCE } from "@/lib/theme";

export const seedHero: HeroContent = {
  id: "hero_1",
  eyebrow: "Product engineering studio",
  headline: "Software, cloud & AI systems built to hold up.",
  subheadline:
    "Nexlayer designs, builds and scales web platforms, cloud infrastructure and AI-driven systems for growing companies.",
  imageUrl:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
  imageAlt: "Engineers collaborating around a laptop",
  primaryCtaLabel: "Start a project",
  primaryCtaHref: "/contact",
  secondaryCtaLabel: "See our work",
  secondaryCtaHref: "/services",
  updatedAt: new Date().toISOString(),
};

export const seedServices: Service[] = [
  {
    id: "svc_1",
    slug: "product-engineering",
    title: "Product Engineering",
    shortDescription:
      "Full-stack web and mobile products built on frameworks that scale with you.",
    description:
      "We design and ship production-grade web and mobile applications end to end — from architecture and API design through to release and hand-off.",
    icon: "code",
    deliverables: [
      "Architecture & technical discovery",
      "Frontend + backend implementation",
      "API design & third-party integrations",
      "Automated testing & CI/CD pipelines",
    ],
    color: "coral",
    isPublished: true,
    updatedAt: new Date().toISOString(),
    engagementModels: [
      {
        id: "eng_1",
        name: "Embedded pod",
        description: "A dedicated team that plugs into your existing workflow and ceremonies.",
        bestFor: "Ongoing product teams",
        priceRange: "$18k–$40k / mo",
      },
      {
        id: "eng_2",
        name: "Fixed-scope build",
        description: "A defined deliverable, timeline and price agreed up front.",
        bestFor: "MVPs & new products",
        priceRange: "$25k–$120k",
      },
    ],
  },
  {
    id: "svc_2",
    slug: "cloud-infrastructure",
    title: "Cloud Infrastructure",
    shortDescription:
      "Resilient, cost-aware infrastructure on AWS, GCP or Azure — provisioned as code.",
    description:
      "We design cloud environments that survive traffic spikes and audits alike, monitored from day one and documented so your team can operate it without us.",
    icon: "server",
    deliverables: [
      "Infrastructure-as-code (Terraform)",
      "CI/CD pipeline design",
      "Cost & performance audits",
      "Migration & disaster-recovery planning",
    ],
    color: "brand",
    isPublished: true,
    updatedAt: new Date().toISOString(),
    engagementModels: [
      {
        id: "eng_3",
        name: "Infrastructure audit",
        description: "A two-week deep dive into your current setup with a prioritized report.",
        bestFor: "Teams unsure where to start",
        priceRange: "$9k flat",
      },
    ],
  },
  {
    id: "svc_3",
    slug: "ai-automation",
    title: "AI & Automation",
    shortDescription:
      "Practical AI features and internal automations that remove repetitive work.",
    description:
      "We help you find the automations actually worth building, then ship them — from LLM-powered features to internal tools that save hours of manual work.",
    icon: "cpu",
    deliverables: [
      "LLM & RAG feature development",
      "Workflow & internal-tool automation",
      "Model evaluation & guardrails",
      "Data pipeline design",
    ],
    color: "teal",
    isPublished: true,
    updatedAt: new Date().toISOString(),
    engagementModels: [],
  },
];

export const seedAbout: AboutContent = {
  title: "We build things that outlast the engagement.",
  description:
    "Nexlayer is a product engineering studio that designs, builds and scales web platforms, cloud infrastructure and AI-driven systems for growing companies.",
  missionTitle: "Our mission",
  missionDescription:
    "Give every client a system their own team can run without us in the room.",
};

export const seedValues: ValueItem[] = [
  {
    id: "val_1",
    order: 1,
    title: "Show the work",
    description:
      "Every decision — architecture, vendor, timeline — gets written down with the trade-offs we considered.",
  },
  {
    id: "val_2",
    order: 2,
    title: "Ship in increments",
    description: "You see working software every two weeks, not a big reveal at the end.",
  },
  {
    id: "val_3",
    order: 3,
    title: "Build to hand off",
    description: "We document and structure systems so your team can operate them without us.",
  },
  {
    id: "val_4",
    order: 4,
    title: "Say the hard thing early",
    description: "If a timeline is unrealistic or an approach won't scale, we say so in week one.",
  },
];

export const seedStats: Stat[] = [
  { id: "stat_1", order: 1, value: "120+", label: "Products shipped", percentage: 100 },
  { id: "stat_2", order: 2, value: "98%", label: "Client retention", percentage: 98 },
  { id: "stat_3", order: 3, value: "14", label: "Countries served", percentage: 70 },
  { id: "stat_4", order: 4, value: "9 yrs", label: "Average team tenure", percentage: 60 },
];

export const seedTeam: TeamMember[] = [
  {
    id: "team_1",
    order: 1,
    name: "Maren Okafor",
    role: "Co-founder & CEO",
    bio: "Previously led platform engineering at a Series C fintech.",
    initials: "MO",
    photoUrl: "",
  },
  {
    id: "team_2",
    order: 2,
    name: "Daniel Cho",
    role: "Co-founder & Head of Engineering",
    bio: "Built and sold a dev-tools startup before starting Nexlayer.",
    initials: "DC",
    photoUrl: "",
  },
  {
    id: "team_3",
    order: 3,
    name: "Priya Ramaswamy",
    role: "Head of Design",
    bio: "Ten years designing tools for logistics and healthcare products.",
    initials: "PR",
    photoUrl: "",
  },
];

export const seedTestimonials: Testimonial[] = [
  {
    id: "test_1",
    quote:
      "Nexlayer rebuilt our checkout flow in six weeks and cut cart abandonment by a third.",
    name: "Elena Marsh",
    role: "VP of Product",
    company: "Fielder Logistics",
    avatarUrl: "",
    rating: 5,
    isFeatured: true,
  },
  {
    id: "test_2",
    quote:
      "We came to them with a messy AWS setup and left with infrastructure our own team could operate.",
    name: "Robert Kim",
    role: "CTO",
    company: "Harborline",
    avatarUrl: "",
    rating: 5,
    isFeatured: true,
  },
];

export const seedBlogPosts: BlogPost[] = [
  {
    id: "post_1",
    slug: "picking-a-cloud-provider-in-2026",
    title: "Picking a cloud provider in 2026: what actually matters",
    excerpt:
      "Pricing pages don't tell you the whole story. Here's the checklist we run before recommending AWS, GCP or Azure.",
    content:
      "<p>Pricing pages don't tell you the whole story. Here's the checklist we run before recommending a cloud provider to a client.</p>",
    coverImageUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
    category: "Cloud",
    author: "Tomas Varga",
    status: "published",
    date: "2026-07-02",
    readTime: "7 min read",
  },
  {
    id: "post_2",
    slug: "shipping-llm-features-without-the-hype",
    title: "Shipping LLM features without the hype",
    excerpt: "Most AI features fail from scope, not the model.",
    content: "<p>Most AI features fail from scope, not the model.</p>",
    coverImageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
    category: "AI",
    author: "Aisha Bello",
    status: "draft",
    date: "2026-06-18",
    readTime: "9 min read",
  },
];

export const seedAvailability: DayAvailability[] = [
  { day: "Mon", isAvailable: true, startTime: "09:00", endTime: "17:00" },
  { day: "Tue", isAvailable: true, startTime: "09:00", endTime: "17:00" },
  { day: "Wed", isAvailable: true, startTime: "09:00", endTime: "17:00" },
  { day: "Thu", isAvailable: true, startTime: "09:00", endTime: "17:00" },
  { day: "Fri", isAvailable: true, startTime: "09:00", endTime: "15:00" },
  { day: "Sat", isAvailable: false, startTime: "10:00", endTime: "13:00" },
  { day: "Sun", isAvailable: false, startTime: "10:00", endTime: "13:00" },
];

export const seedBlockedDates: BlockedDate[] = [
  { id: "blk_1", date: "2026-12-25", reason: "Holiday" },
];

export const seedConversations: Conversation[] = [
  {
    id: "conv_1",
    customerName: "Grace Adeyemi",
    customerEmail: "grace@portsidehealth.com",
    lastMessage: "Could we get a rough estimate this week?",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
    unreadCount: 2,
    status: "open",
  },
  {
    id: "conv_2",
    customerName: "Robert Kim",
    customerEmail: "robert@harborline.com",
    lastMessage: "Thanks for the infra audit doc!",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    unreadCount: 0,
    status: "closed",
  },
];

export const seedMessages: ChatMessage[] = [
  {
    id: "msg_1",
    conversationId: "conv_1",
    sender: "customer",
    body: "Hi! We're exploring a rebuild of our internal ops dashboard.",
    sentAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: "msg_2",
    conversationId: "conv_1",
    sender: "admin",
    body: "Happy to help — can you tell me a bit about the current stack?",
    sentAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "msg_3",
    conversationId: "conv_1",
    sender: "customer",
    body: "Could we get a rough estimate this week?",
    sentAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
  },
];

export const seedContact: ContactSettings = {
  responseTime: "We usually reply within 1 business day.",
  channels: [
    { id: "ch_1", type: "email", label: "General enquiries", value: "hello@nexlayer.example" },
    { id: "ch_2", type: "email", label: "Support", value: "support@nexlayer.example" },
    { id: "ch_3", type: "phone", label: "Office", value: "+1 (555) 019-2044" },
    {
      id: "ch_4",
      type: "address",
      label: "Headquarters",
      value: "148 Harbourview Lane, Suite 4B, Austin, TX 78701",
    },
  ],
};

export const seedLeads: Lead[] = [
  {
    id: "lead_1",
    name: "Sarah Whitfield",
    email: "sarah@brightpath.io",
    company: "Brightpath",
    estimatedBudget: "$40,000 – $80,000",
    projectDetails: "Rebuilding our customer portal with better reporting and SSO.",
    status: "new",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "lead_2",
    name: "Michael Osei",
    email: "michael@fieldwire.co",
    company: "Fieldwire Logistics",
    estimatedBudget: "$100,000+",
    projectDetails: "Full platform migration to AWS with a new event pipeline.",
    status: "contacted",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: "lead_3",
    name: "Lena Fischer",
    email: "lena@northwind.co",
    company: "Northwind Retail",
    estimatedBudget: "$15,000 – $30,000",
    projectDetails: "A small AI feature to auto-tag support tickets by urgency.",
    status: "qualified",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

export const seedTasks: Task[] = [
  {
    id: "task_1",
    companyName: "Brightpath Financial",
    sector: "Fintech",
    companyAddress: "220 Congress Ave, Austin, TX 78701",
    contact: "sarah@brightpath.io · +1 (555) 201-8890",
    remark: "Interested in a full customer portal rebuild. Waiting on their budget sign-off.",
    status: "pending",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "task_2",
    companyName: "Fieldwire Logistics",
    sector: "Logistics",
    companyAddress: "88 Harbor Rd, Newark, NJ 07102",
    contact: "michael@fieldwire.co · +1 (555) 340-1120",
    remark: "Signed for the AWS migration project — kickoff scheduled for next sprint.",
    status: "deal",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: "task_3",
    companyName: "Northwind Retail",
    sector: "Retail",
    companyAddress: "14 Market St, Portland, OR 97201",
    contact: "lena@northwind.co · +1 (555) 552-0031",
    remark: "Small AI ticket-tagging feature. Low priority, revisit next quarter.",
    status: "pending",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: "task_4",
    companyName: "Ashcombe Realty Group",
    sector: "Real estate",
    companyAddress: "9 Ashcombe Lane, London, UK",
    contact: "info@ashcomberealty.example",
    remark: "Missed two scheduled calls and stopped responding to follow-ups.",
    status: "blacklist",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 200).toISOString(),
  },
];

export const seedFooter: FooterSettings = {
  logoUrl: "",
  description:
    "Nexlayer is a product engineering studio that designs, builds and scales software for growing companies.",
  copyrightYear: new Date().getFullYear(),
  socialLinks: [
    { id: "soc_1", platform: "Twitter", icon: "twitter", url: "https://twitter.com/nexlayer" },
    { id: "soc_2", platform: "LinkedIn", icon: "linkedin", url: "https://linkedin.com/company/nexlayer" },
    { id: "soc_3", platform: "GitHub", icon: "github", url: "https://github.com/nexlayer" },
  ],
  companyLinks: [
    { id: "co_1", label: "About", href: "/about" },
    { id: "co_2", label: "Careers", href: "/careers" },
    { id: "co_3", label: "Blog", href: "/blog" },
  ],
  serviceLinks: [
    { id: "sv_1", label: "Product Engineering", href: "/services/product-engineering" },
    { id: "sv_2", label: "Cloud Infrastructure", href: "/services/cloud-infrastructure" },
    { id: "sv_3", label: "AI & Automation", href: "/services/ai-automation" },
  ],
  contactLinks: [
    { id: "ct_1", label: "hello@nexlayer.example", href: "mailto:hello@nexlayer.example" },
    { id: "ct_2", label: "+1 (555) 019-2044", href: "tel:+15550192044" },
  ],
};

export const seedAppearance: AppearanceSettings = { ...DEFAULT_APPEARANCE };

export const seedUser: AdminUser = {
  id: "user_1",
  name: "Maren Okafor",
  email: "admin@nexlayer.example",
  role: "owner",
};

export const seedAnalytics: AnalyticsSnapshot = {
  totalVisitors: 18240,
  totalPageViews: 52110,
  bounceRate: 38.4,
  avgSessionDuration: "3m 12s",
  traffic: Array.from({ length: 14 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    const base = 900 + Math.round(Math.sin(i / 2) * 200);
    return {
      date: date.toISOString().slice(0, 10),
      visitors: base + Math.round(Math.random() * 150),
      pageViews: base * 3 + Math.round(Math.random() * 300),
    };
  }),
  topClicks: [
    { id: "clk_1", label: "Start a project (hero CTA)", page: "/", clicks: 1284 },
    { id: "clk_2", label: "View services", page: "/", clicks: 972 },
    { id: "clk_3", label: "Contact form submit", page: "/contact", clicks: 511 },
    { id: "clk_4", label: "Read more (blog card)", page: "/blog", clicks: 344 },
    { id: "clk_5", label: "Book a call", page: "/contact", clicks: 298 },
  ],
  topPages: [
    { path: "/", views: 21400, avgTimeOnPage: "1m 48s" },
    { path: "/services", views: 9800, avgTimeOnPage: "2m 05s" },
    { path: "/about", views: 6200, avgTimeOnPage: "1m 20s" },
    { path: "/blog", views: 5400, avgTimeOnPage: "2m 40s" },
    { path: "/contact", views: 4100, avgTimeOnPage: "1m 02s" },
  ],
  cookieConsent: { accepted: 12680, declined: 2140, dismissed: 3420 },
};
