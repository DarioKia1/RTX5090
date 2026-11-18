import { h, render } from 'https://esm.sh/preact@10.24.3';
import { useEffect, useRef, useState } from 'https://esm.sh/preact@10.24.3/hooks';
import htm from 'https://esm.sh/htm@3.1.1';
import { PcScene } from './scene.js';

const html = htm.bind(h);
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const parts = {
  gpu: [
    { id: '5090-fe', name: 'GeForce RTX 5090', sub: 'Founders Edition · dual-flow · 32GB GDDR7', price: 1999, watts: 575, accent: 0x76b900, tier: '5090-fe', fanCount: 2, image: 'https://www.nvidia.com/content/nvidiaGDC/us/en_US/geforce/graphics-cards/50-series/rtx-5090/_jcr_content/root/responsivegrid/nv_modalcontainer_609051001/nv_image.coreimg.100.850.jpeg/1788439977626/geforce-rtx-5090-gallery-shot-1-ari.jpeg' },
    { id: '5090-aib', name: 'RTX 5090 OC', sub: 'Custom triple-fan · 32GB GDDR7', price: 2299, watts: 650, accent: 0x95d600, tier: '5090-aib', fanCount: 3 },
    { id: '5080-fe', name: 'GeForce RTX 5080', sub: 'Founders Edition · dual-flow · 16GB GDDR7', price: 999, watts: 360, accent: 0x75b900, tier: '5080-fe', fanCount: 2, image: 'https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/graphic-cards/50-series/rtx-5080/geforce-rtx-5080-af360-p@2x.jpg' }
  ],
  cpu: [
    { id: '9950x', name: 'AMD Ryzen 9 9950X', sub: '16-core · 4.3GHz · AM5', price: 649, socket: 'AM5', ram: 'DDR5', watts: 170 },
    { id: '285k', name: 'Intel Core Ultra 9 285K', sub: '24-core · 3.7GHz · LGA1851', price: 589, socket: 'LGA1851', ram: 'DDR5', watts: 250 },
    { id: '9800x3d', name: 'AMD Ryzen 7 9800X3D', sub: '8-core · 4.7GHz · AM5', price: 479, socket: 'AM5', ram: 'DDR5', watts: 120 }
  ],
  motherboard: [
    { id: 'x870e', name: 'Creator X870E', sub: 'E-ATX · AM5 · Wi-Fi 7', price: 499, socket: 'AM5', ram: 'DDR5', size: 'E-ATX' },
    { id: 'z890', name: 'Studio Z890', sub: 'ATX · LGA1851 · Wi-Fi 7', price: 429, socket: 'LGA1851', ram: 'DDR5', size: 'ATX' },
    { id: 'b760', name: 'Performance B760', sub: 'ATX · LGA1700 · Wi-Fi 6E', price: 219, socket: 'LGA1700', ram: 'DDR4', size: 'ATX' }
  ],
  ram: [
    { id: 'ddr5-64', name: '64GB DDR5 6000', sub: '2 × 32GB · CL30 · RGB', price: 219, type: 'DDR5', modules: 2 },
    { id: 'ddr5-96', name: '96GB DDR5 6400', sub: '2 × 48GB · CL32 · RGB', price: 329, type: 'DDR5', modules: 2 },
    { id: 'ddr4-32', name: '32GB DDR4 3600', sub: '2 × 16GB · CL18 · Black', price: 89, type: 'DDR4', modules: 2 }
  ],
  storage: [
    { id: 'nvme-2', name: '2TB Gen5 NVMe', sub: '14,000 MB/s · Heatsink', price: 249 },
    { id: 'nvme-4', name: '4TB Gen5 NVMe', sub: '12,000 MB/s · Heatsink', price: 399 },
    { id: 'nvme-2g4', name: '2TB Gen4 NVMe', sub: '7,400 MB/s · Low profile', price: 139 }
  ],
  cooler: [
    { id: 'aio360', name: '360mm Liquid Cooler', sub: 'LCD display · 3 × 120mm', price: 179 },
    { id: 'aio420', name: '420mm Liquid Cooler', sub: 'Low-noise · 3 × 140mm', price: 229 },
    { id: 'air', name: 'Dual-tower Air Cooler', sub: 'Dual 140mm · Quiet profile', price: 99 }
  ],
  psu: [
    { id: 'psu1200', name: '1200W Platinum ATX 3.1', sub: 'Native 12V-2x6 · Fully modular', price: 299, capacity: 1200 },
    { id: 'psu1000', name: '1000W Gold ATX 3.1', sub: 'Native 12V-2x6 · Fully modular', price: 189, capacity: 1000 },
    { id: 'psu850', name: '850W Gold ATX 3.0', sub: '12VHPWR adapter · Modular', price: 129, capacity: 850 }
  ],
  case: [
    { id: 'tower-black', name: 'Panorama Full Tower', sub: 'E-ATX · Panoramic glass · Black', price: 249, finish: 'black', size: 'E-ATX' },
    { id: 'tower-white', name: 'Panorama Full Tower', sub: 'E-ATX · Panoramic glass · White', price: 269, finish: 'white', size: 'E-ATX' },
    { id: 'compact', name: 'North Compact', sub: 'ATX · Mesh front · Black', price: 159, finish: 'black', size: 'ATX' }
  ],
  fans: [
    { id: 'fans3', name: '3 × 140mm PWM', sub: 'Quiet magnetic bearing · ARGB', price: 89, count: 3 },
    { id: 'fans2', name: '2 × 140mm PWM', sub: 'Quiet magnetic bearing · Black', price: 49, count: 2 },
    { id: 'fans5', name: '5 × 120mm PWM', sub: 'High airflow · ARGB', price: 119, count: 5 }
  ]
};

const categories = [
  ['gpu', 'Graphics card', '01'], ['cpu', 'Processor', '02'], ['motherboard', 'Motherboard', '03'],
  ['ram', 'Memory', '04'], ['storage', 'Storage', '05'], ['cooler', 'CPU cooling', '06'],
  ['psu', 'Power supply', '07'], ['case', 'PC case', '08'], ['fans', 'Case fans', '09']
];

const initialBuild = Object.fromEntries(categories.map(([key]) => [key, parts[key][0]]));

function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  return html`
    <header class="topbar">
      <a href="#home" class="wordmark" aria-label="GeForce home"><span class="brand-mark">N</span><span>GEFORCE <i>RTX</i></span></a>
      <button class="menu-toggle" aria-label="Toggle navigation" aria-expanded=${menuOpen} onClick=${() => setMenuOpen(!menuOpen)}><span></span><span></span></button>
      <nav class=${menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="Main navigation">
        <a href="#home" onClick=${() => setMenuOpen(false)}>Home</a>
        <a href="#architecture" onClick=${() => setMenuOpen(false)}>Architecture</a>
        <a href="#specifications" onClick=${() => setMenuOpen(false)}>Specifications</a>
        <a href="#performance" onClick=${() => setMenuOpen(false)}>Performance</a>
        <a href="#builder" class="nav-build" onClick=${() => setMenuOpen(false)}>Build your PC <span>↗</span></a>
      </nav>
    </header>`;
}

function Hero() {
  return html`
    <section class="hero" id="home">
      <div class="hero-grid"></div>
      <div class="hero-copy">
        <div class="eyebrow"><span class="live-dot"></span> GEFORCE RTX 5090 <span class="eyebrow-rule"></span> BLACKWELL</div>
        <h1>THE NEXT GENERATION<br />OF <span>PERFORMANCE.</span></h1>
        <p class="hero-intro">21,760 CUDA cores. 32GB of GDDR7. Blackwell architecture for high-end gaming, rendering, and AI workloads.</p>
        <div class="hero-actions"><a class="button button-primary" href="#specifications">View specifications <span>↘</span></a><a class="text-link" href="#builder">Build a PC <span>↗</span></a></div>
        <div class="hero-footnote"><span>FOUNDERS EDITION</span><span>32GB GDDR7</span><span>575W GRAPHICS POWER</span></div>
      </div>
      <div class="hero-visual">
        <div class="hero-light"></div>
        <div class="hero-chip-label"><span>FOUNDERS EDITION</span><span>BLACKWELL · GB202</span></div>
        <img class="hero-product-photo" src="https://www.nvidia.com/content/nvidiaGDC/us/en_US/geforce/graphics-cards/50-series/rtx-5090/_jcr_content/root/responsivegrid/nv_modalcontainer_609051001/nv_image.coreimg.100.850.jpeg/1788439977626/geforce-rtx-5090-gallery-shot-1-ari.jpeg" alt="GeForce RTX 5090 Founders Edition" fetchpriority="high" />
        <div class="hero-product-caption"><span>GEFORCE RTX</span><b>5090</b><span>FOUNDERS EDITION</span></div>
      </div>
      <a class="scroll-cue" href="#architecture"><span class="scroll-line"></span> SCROLL TO DISCOVER</a>
    </section>`;
}

function IntroStrip() {
  return html`<div class="intro-strip"><div><span class="strip-dot"></span> GEFORCE RTX 5090 FOUNDERS EDITION</div><div>STARTING AT $1,999 <span class="strip-arrow">↘</span></div></div>`;
}

function Architecture() {
  return html`
    <section class="architecture section-pad" id="architecture">
      <div class="section-kicker"><span>01 / THE ARCHITECTURE</span><span>BLACKWELL. UNLEASHED.</span></div>
      <div class="architecture-heading"><h2>BLACKWELL,<br /><em>INSIDE.</em></h2><p>Fifth-generation Tensor Cores, fourth-generation RT Cores, and 32GB of GDDR7 memory power the GeForce RTX 5090.</p></div>
      <div class="feature-grid">
        <article class="feature feature-main"><div class="feature-art"><img src="https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/graphic-cards/50-series/rtx-5080/geforce-dlss4-multi-frame-generation-cybperpunk-2077-1920x1080-video-renew.png" alt="DLSS 4 game scene" loading="lazy" /></div><div class="feature-meta"><span>01 — DLSS 4</span><span class="feature-symbol">↗</span></div><h3>Multi Frame Generation</h3><p>DLSS 4 can generate up to three additional frames per traditionally rendered frame in supported games.</p></article>
        <article class="feature"><div class="feature-art"><img src="https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/graphic-cards/50-series/rtx-5080/geforce-ray-tracing-half-life-2-rtx-on-640@2x.jpg" alt="Ray-traced game environment" loading="lazy" /></div><div class="feature-meta"><span>02 — RAY TRACING</span><span class="feature-symbol">↗</span></div><h3>Fourth-generation RT Cores</h3><p>Dedicated hardware accelerates real-time ray tracing and path tracing in supported applications.</p></article>
        <article class="feature"><div class="feature-art"><img src="https://www.nvidia.com/content/nvidiaGDC/us/en_US/geforce/graphics-cards/50-series/rtx-5090/_jcr_content/root/responsivegrid/nv_modalcontainer_1683966542/nv_image.coreimg.100.850.jpeg/1788439977643/geforce-rtx-5090-gallery-shot-2-ari.jpeg" alt="GeForce RTX 5090 Founders Edition product detail" loading="lazy" /></div><div class="feature-meta"><span>03 — MEMORY</span><span class="feature-symbol">↗</span></div><h3>32GB GDDR7</h3><p>High-capacity, high-bandwidth memory for large scenes, render jobs, and local AI models.</p></article>
      </div>
    </section>`;
}

function Specifications() {
  const specs = [
    ['32', 'GB', 'GDDR7 memory', 'NEXT-GEN MEMORY'],
    ['21,760', '', 'CUDA® cores', 'PARALLEL PROCESSING'],
    ['1.79', 'TB/s', 'memory bandwidth', '512-BIT INTERFACE'],
    ['5th', 'GEN', 'Tensor Cores', 'AI ACCELERATION']
  ];
  return html`
    <section class="specs section-pad" id="specifications">
      <div class="section-kicker"><span>02 / ENGINEERED TO LEAD</span><span>TECHNICAL SPECIFICATIONS</span></div>
      <div class="specs-top"><h2>RTX 5090<br /><em>SPECIFICATIONS.</em></h2><p>Founders Edition specifications, alongside the Blackwell technologies behind the card.</p></div>
      <div class="spec-grid">${specs.map(([value, unit, label, note], i) => html`
        <article class="spec-cell" style=${`--delay:${i * 90}ms`}><div class="spec-number">${value}<small>${unit}</small></div><div class="spec-label">${label}</div><div class="spec-note">${note}</div></article>`)}
      </div>
      <div class="spec-detail-grid"><div><span>GPU ARCHITECTURE</span><b>Blackwell</b></div><div><span>RAY TRACING CORES</span><b>4th generation</b></div><div><span>BOOST CLOCK</span><b>2.41 GHz</b></div><div><span>GRAPHICS POWER</span><b>575 W</b></div><div><span>POWER CONNECTOR</span><b>1 × 16-pin</b></div><div><span>MAX DIGITAL RESOLUTION</span><b>4K · 480Hz / 8K · 165Hz</b></div></div>
      <p class="fine-print">Specifications shown for GeForce RTX 5090 Founders Edition. Clocks and power vary by manufacturer and workload.</p>
    </section>`;
}

const chartData = {
  '1440p': { native: [112, 88, 73], rt: [89, 61, 48], dlss: [286, 202, 159] },
  '4K': { native: [76, 58, 46], rt: [54, 37, 29], dlss: [205, 143, 111] },
  '8K': { native: [34, 25, 19], rt: [21, 14, 10], dlss: [112, 77, 58] }
};
const chartSeries = [
  ['RTX 5090', 'geforce'], ['RTX 4090', 'previous'], ['RTX 5080', 'mid']
];

function Performance() {
  const [resolution, setResolution] = useState('4K');
  const [mode, setMode] = useState('native');
  const values = chartData[resolution][mode];
  const max = Math.max(...values) * 1.16;
  const modeName = { native: 'Rasterized · Native', rt: 'Ray tracing · Native', dlss: 'DLSS 4 · Multi Frame Generation' }[mode];
  return html`
    <section class="performance section-pad" id="performance">
      <div class="section-kicker"><span>03 / PERFORMANCE</span><span>BUILT TO MOVE THE BAR</span></div>
      <div class="performance-header"><div><h2>PERFORMANCE,<br /><em>IN CONTEXT.</em></h2><p>Explore a clearly labeled, illustrative frame-rate comparison by resolution and render mode.</p></div><div class="performance-tag"><span class="tag-dot"></span> ILLUSTRATIVE ESTIMATES</div></div>
      <div class="chart-wrap">
        <div class="chart-controls"><div class="control-group"><span>RESOLUTION</span><div class="segmented">${['1440p', '4K', '8K'].map((value) => html`<button class=${resolution === value ? 'selected' : ''} onClick=${() => setResolution(value)}>${value}</button>`)}</div></div><div class="control-group"><span>RENDER MODE</span><div class="segmented">${[['native', 'Native'], ['rt', 'Ray tracing'], ['dlss', 'DLSS 4']].map(([value, label]) => html`<button class=${mode === value ? 'selected' : ''} onClick=${() => setMode(value)}>${label}</button>`)}</div></div></div>
        <div class="chart-heading"><div><span class="chart-overline">ESTIMATED AVERAGE FRAME RATE</span><h3>${resolution} <i>/</i> ${modeName}</h3></div><span class="chart-unit">FPS</span></div>
        <div class="bar-chart">${chartSeries.map(([name, style], i) => html`<div class="bar-row"><span class="bar-name ${style}">${name}</span><div class="bar-track"><div class="bar-fill ${style}" style=${`--bar-width:${Math.max(4, values[i] / max * 100)}%`}></div></div><b>${values[i]}</b></div>`)}</div>
        <div class="chart-legend"><span><i class="legend-green"></i>GeForce RTX 5090</span><span><i class="legend-gray"></i>Previous generation / RTX 5080</span><span class="chart-disclaimer">Not official benchmark data</span></div>
      </div>
      <p class="performance-disclaimer">Illustrative estimates only. Values are not official NVIDIA benchmarks and are not tied to a specific game, test system, or graphics preset. Actual performance varies significantly by title, settings, CPU, and DLSS implementation. DLSS 4 results use Multi Frame Generation where supported.</p>
    </section>`;
}

function getCompatibility(build) {
  const issues = [];
  if (build.cpu.socket !== build.motherboard.socket) issues.push({ type: 'error', text: `CPU socket mismatch: ${build.cpu.socket} processor and ${build.motherboard.socket} motherboard.` });
  if (build.ram.type !== build.motherboard.ram) issues.push({ type: 'error', text: `${build.ram.type} memory is not supported by this ${build.motherboard.ram} motherboard.` });
  const needed = build.gpu.watts + build.cpu.watts + 150;
  if (build.psu.capacity < needed) issues.push({ type: 'warning', text: `Power headroom is low: estimated ${needed}W system demand exceeds your ${build.psu.capacity}W PSU.` });
  else if (build.psu.capacity < needed * 1.2) issues.push({ type: 'warning', text: `Limited power headroom: consider a ${Math.ceil(needed * 1.2 / 50) * 50}W or higher PSU for overclocking.` });
  if (build.case.size === 'ATX' && build.motherboard.size === 'E-ATX') issues.push({ type: 'error', text: 'E-ATX motherboard is too large for the selected ATX case.' });
  return { issues, needed };
}

function Builder() {
  const mount = useRef(null);
  const scene = useRef(null);
  const previousBuild = useRef(initialBuild);
  const [build, setBuild] = useState(initialBuild);
  const [active, setActive] = useState('gpu');
  const [toast, setToast] = useState('');
  useEffect(() => {
    if (!mount.current) return;
    scene.current = new PcScene(mount.current);
    scene.current.updateBuild(build);
    scene.current.playBuildSequence();
    return () => { scene.current?.destroy(); scene.current = null; };
  }, []);
  useEffect(() => {
    scene.current?.updateBuild(build);
    const changed = categories.find(([key]) => previousBuild.current[key].id !== build[key].id);
    if (changed) scene.current?.playComponentEntry(changed[0]);
    previousBuild.current = build;
  }, [build]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(timer);
  }, [toast]);
  const total = categories.reduce((sum, [key]) => sum + build[key].price, 0);
  const { issues, needed } = getCompatibility(build);
  const choose = (key, part) => setBuild((current) => ({ ...current, [key]: part }));
  const reset = () => { setBuild(initialBuild); setActive('gpu'); setToast('Build reset to the RTX 5090 reference configuration.'); };
  const exportBuild = () => {
    const output = {
      title: 'GeForce RTX 5090 build',
      estimatedTotalUSD: total,
      estimatedPowerDemandW: needed,
      components: Object.fromEntries(categories.map(([key, label]) => [label, { name: build[key].name, configuration: build[key].sub, estimatedPriceUSD: build[key].price }])),
      compatibility: issues.length ? issues.map((issue) => issue.text) : ['No compatibility issues detected by this configurator.'],
      note: 'Prices are illustrative estimates and availability varies by region.'
    };
    const file = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = 'geforce-rtx-5090-build.json';
    link.click();
    URL.revokeObjectURL(link.href);
    setToast('Build exported as JSON.');
  };
  return html`
    <section class="builder section-pad" id="builder">
      <div class="section-kicker"><span>04 / THE CONFIGURATOR</span><span>YOUR NEXT BUILD STARTS HERE</span></div>
      <div class="builder-heading"><div><h2>BUILD A PC<br /><em>AROUND THE 5090.</em></h2><p>Choose compatible parts, check power headroom, and export your component list.</p></div><span class="build-edition">RTX 5090 <b>Founders Edition</b></span></div>
      <div class="builder-shell">
        <div class="builder-stage">
          <div class="stage-topline"><span><i class="live-dot"></i> LIVE CONFIGURATION</span><span>DRAG TO ROTATE <b>·</b> SCROLL TO ZOOM</span></div>
          <div class="pc-canvas" ref=${mount} aria-label="Interactive 3D desktop PC model. Drag to rotate and scroll to zoom."></div>
          <div class="stage-readout"><div><span>GRAPHICS</span><b>${build.gpu.name}</b></div><div><span>EST. SYSTEM POWER</span><b>${needed} W</b></div><div><span>COMPATIBILITY</span><b class=${issues.some((item) => item.type === 'error') ? 'state-error' : issues.length ? 'state-warning' : 'state-ok'}>${issues.some((item) => item.type === 'error') ? 'ACTION NEEDED' : issues.length ? 'CHECK BUILD' : 'ALL CLEAR'}</b></div></div>
        </div>
        <div class="builder-panel">
          <div class="builder-panel-head"><div><span class="panel-kicker">CONFIGURE SYSTEM</span><h3>Components <small>09</small></h3></div><button class="reset-button" onClick=${reset}><span>↺</span> Reset</button></div>
          <div class="component-layout">
            <div class="component-nav" role="tablist" aria-label="Component categories">${categories.map(([key, label, number]) => html`<button class=${active === key ? 'component-tab active' : 'component-tab'} role="tab" aria-selected=${active === key} onClick=${() => setActive(key)}><span>${number}</span><b>${label}</b><i>${build[key].name}</i><strong>${money.format(build[key].price)}</strong></button>`)}</div>
            <div class="component-options"><div class="options-heading"><div><span>SELECT ${active.toUpperCase()}</span><h4>${categories.find(([key]) => key === active)?.[1]}</h4></div><span>${parts[active].length} OPTIONS</span></div>${parts[active].map((part, index) => html`
              <button class=${build[active].id === part.id ? 'option-card chosen' : 'option-card'} onClick=${() => choose(active, part)}><span class=${`option-visual visual-${active} visual-${index}`}>${part.image ? html`<img src=${part.image} alt="" loading="lazy" />` : html`<i></i><i></i><i></i>`}</span><span class="option-copy"><b>${part.name}</b><small>${part.sub}</small></span><span class="option-price">${money.format(part.price)}</span><span class="option-check">${build[active].id === part.id ? '✓' : '+'}</span></button>`)}
              <div class="option-footnote"><span class="green-square"></span> Estimated retail pricing · USD</div></div>
          </div>
          <div class="compatibility ${issues.some((item) => item.type === 'error') ? 'has-error' : issues.length ? 'has-warning' : ''}"><div class="compatibility-head"><span class="compat-icon">${issues.some((item) => item.type === 'error') ? '!' : issues.length ? '△' : '✓'}</span><b>${issues.some((item) => item.type === 'error') ? 'Compatibility issue' : issues.length ? 'Review recommended' : 'Compatibility check'}</b><span>${issues.length ? `${issues.length} ${issues.length === 1 ? 'note' : 'notes'}` : 'Passed'}</span></div>${issues.length ? issues.map((issue) => html`<p class=${issue.type}>${issue.text}</p>`) : html`<p>CPU socket, memory type, case fit, and estimated PSU capacity checked.</p>`}</div>
          <div class="builder-total"><div><span>ESTIMATED BUILD TOTAL</span><strong>${money.format(total)}</strong><small>Component pricing varies by retailer and region.</small></div><button class="button button-primary export-button" onClick=${exportBuild}>Export build <span>↓</span></button></div>
        </div>
      </div>
      ${toast && html`<div class="toast" role="status">${toast}</div>`}
    </section>`;
}

function Closing() {
  return html`<section class="closing"><div class="closing-grid"></div><div class="closing-copy"><span class="section-kicker">GEFORCE RTX 5090 · BLACKWELL</span><h2>THE FUTURE<br />IS <em>RENDERED.</em></h2><a class="button button-primary" href="#builder">Build around the 5090 <span>↗</span></a></div><div class="closing-serial">GB202 / 21,760 CUDA CORES<br />32GB GDDR7 / 1.79 TB/S</div></section>
    <footer class="footer"><a href="#home" class="wordmark"><span class="brand-mark">N</span><span>GEFORCE <i>RTX</i></span></a><span>CONCEPT EXPERIENCE · PRODUCT IMAGES: NVIDIA · PC CONFIGURATOR: THREE.JS · NOT AN OFFICIAL NVIDIA WEBSITE</span><a href="#home">BACK TO TOP ↑</a></footer>`;
}

function App() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12 });
    document.querySelectorAll('.section-kicker, .feature, .spec-cell, .spec-detail-grid, .chart-wrap').forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
  return html`<${Navigation} /><main><${Hero} /><${IntroStrip} /><${Architecture} /><${Specifications} /><${Performance} /><${Builder} /><${Closing} /></main>`;
}

render(html`<${App} />`, document.getElementById('app'));
