export const mockComponents = [
  {
    id: "1",
    title: "Animated Button",
    description: "Modern hover effekt gradiens háttérrel",
    author: "Peter_Dev",
    tags: ["Button", "Animation", "CSS"],
    code: `<button class="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold text-white transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
  Click Me
</button>`,
    preview: (
      <button className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-semibold text-white transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
        Click Me
      </button>
    ),
    likes: 142,
    views: 1203,
  },
  {
    id: "2",
    title: "Glass Card",
    description: "Glassmorphism stílusú kártya",
    author: "UiMaster",
    tags: ["Card", "Glass", "Modern"],
    code: `<div class="glass-card p-6 rounded-2xl backdrop-blur-xl border border-white/10">
  <h3 class="text-xl font-bold mb-2">Glass Card</h3>
  <p class="text-gray-400">Modern glassmorphism design</p>
</div>`,
    preview: (
      <div className="glass-card p-6 rounded-2xl backdrop-blur-xl border border-white/10">
        <h3 className="text-xl font-bold mb-2">Glass Card</h3>
        <p className="text-muted-foreground">Modern glassmorphism design</p>
      </div>
    ),
    likes: 89,
    views: 756,
  },
  {
    id: "3",
    title: "Neon Border",
    description: "Neon világító border effekt",
    author: "CssWizard",
    tags: ["Border", "Neon", "Animation"],
    code: `<div class="relative p-6 rounded-xl">
  <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 blur-lg opacity-75"></div>
  <div class="relative glass-card p-6 rounded-xl">
    <p>Neon Border Effect</p>
  </div>
</div>`,
    preview: (
      <div className="relative p-6 rounded-xl">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-secondary blur-lg opacity-75"></div>
        <div className="relative glass-card p-6 rounded-xl">
          <p>Neon Border Effect</p>
        </div>
      </div>
    ),
    likes: 234,
    views: 2104,
  },
  {
    id: "4",
    title: "Floating Badge",
    description: "Lebegő animációs badge",
    author: "AnimePro",
    tags: ["Badge", "Animation", "Float"],
    code: `<span class="inline-block px-4 py-2 bg-gradient-to-r from-green-400 to-cyan-500 rounded-full text-sm font-semibold animate-float shadow-lg">
  New Feature
</span>`,
    preview: (
      <span className="inline-block px-4 py-2 bg-gradient-to-r from-accent to-primary rounded-full text-sm font-semibold animate-float shadow-lg">
        New Feature
      </span>
    ),
    likes: 67,
    views: 543,
  },
  {
    id: "5",
    title: "Loading Spinner",
    description: "Színes animált töltés ikon",
    author: "SpinMaster",
    tags: ["Loader", "Animation", "Icon"],
    code: `<div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-cyan-500"></div>`,
    preview: (
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary"></div>
    ),
    likes: 178,
    views: 1432,
  },
  {
    id: "6",
    title: "Gradient Text",
    description: "Színátmenetes szöveg effekt",
    author: "TextStylist",
    tags: ["Text", "Gradient", "CSS"],
    code: `<h1 class="text-4xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-green-400 bg-clip-text text-transparent">
  Gradient Text
</h1>`,
    preview: (
      <h1 className="text-4xl font-bold text-gradient">Gradient Text</h1>
    ),
    likes: 312,
    views: 2876,
  },
  {
    id: "7",
    title: "Glow Button",
    description: "Világító pulzáló gomb",
    author: "GlowKing",
    tags: ["Button", "Glow", "Animation"],
    code: `<button class="px-8 py-4 bg-purple-600 rounded-full font-bold text-white shadow-[0_0_30px_rgba(168,85,247,0.5)] animate-glow hover:shadow-[0_0_50px_rgba(168,85,247,0.8)] transition-all">
  Glow Effect
</button>`,
    preview: (
      <button className="px-8 py-4 bg-secondary rounded-full font-bold text-secondary-foreground shadow-[0_0_30px_rgba(168,85,247,0.5)] animate-glow hover:shadow-[0_0_50px_rgba(168,85,247,0.8)] transition-all">
        Glow Effect
      </button>
    ),
    likes: 201,
    views: 1687,
  },
  {
    id: "8",
    title: "Input Field",
    description: "Modern focus effekttel",
    author: "FormDesigner",
    tags: ["Input", "Form", "Focus"],
    code: `<input type="text" placeholder="Enter text..." class="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all" />`,
    preview: (
      <input
        type="text"
        placeholder="Enter text..."
        className="px-4 py-3 bg-background/50 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
      />
    ),
    likes: 95,
    views: 892,
  },
];
