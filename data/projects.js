// All portfolio content lives here. Edit text freely; paths are relative to index.html.
// group: 'long' | 'reel' | 'film'   ·   format: 'wide' (16:9) | 'tall' (9:16)
// cat: filter on the work section ('brand' | 'creator' | 'interview' | 'personal')
// Each id needs assets/posters/<id>.jpg, assets/previews/<id>.mp4 and assets/video/<id>.mp4
window.PORTFOLIO = {
  name: 'Raj Kahar',
  email: 'rraj68711@gmail.com',
  timezone: 'Asia/Kathmandu',
  city: 'Nepalgunj',
  socials: [
    { label: 'Instagram', handle: '@exwhyzed77', url: 'https://www.instagram.com/exwhyzed77/' },
    { label: 'WhatsApp', handle: '+977 976 202 6802', url: 'https://wa.me/9779762026802' },
    { label: 'TikTok', handle: '@lowkeeyyy_69', url: 'https://www.tiktok.com/@lowkeeyyy_69' }
  ],
  stats: [
    { n: '200', suffix: 'K', plus: true, label: 'TikTok views on one All Star Jewellery reel' },
    { n: '25', plus: true, label: 'videos delivered' },
    { n: '9', label: 'clients in Nepal and the USA' },
    { n: '1', plus: true, label: 'year editing full time' }
  ],
  clients: [
    { name: 'Seenmatic', note: 'Agency · Nepal' },
    { name: 'All Star Jewellery', note: 'Gold & jewellery' },
    { name: 'The No Skip Show', note: 'Music interviews · USA' },
    { name: 'Rodhi Sources', note: 'Import agent · Kathmandu' },
    { name: 'Expert Service Hub', note: 'Destination events' },
    { name: 'XSIS Media', note: 'Political marketing' },
    { name: 'Vibes Advisory', note: 'Language institute · Butwal' },
    { name: 'President Group', note: 'Hospitality' },
    { name: 'Yuwaz', note: 'Business content' }
  ],
  // the work section shows the featured interview (+ its short), then the top 3 per niche, in this order.
  // Projects not listed here (and not featured) stay in the data but are not shown.
  featuredShort: 'mudwhale-short',
  categories: [
    { title: 'Jewellery & retail', note: 'Product-first reels for a gold shop: price cards, running totals and a grade that makes the gold glow. The series I edit for them has a reel past 200K views on TikTok.', ids: ['asj-part3', 'asj-tihar', 'seenmatic-wedding'] },
    { title: 'Brand ads', note: 'Ads for services and institutes, with on-brand cards, B-roll and a clear call to action.', ids: ['vibes', 'esh-ad', 'rodhi-winter'] },
    { title: 'Explainers & talking heads', note: 'One person, one idea: graphics and captions that make a talk easy to follow with the sound off.', ids: ['yuwaz', 'asj-part1', 'asj-part2'] },
    { title: 'Festival greetings', note: 'Tihar and Dashain greetings that feel warm, not like a template.', ids: ['president-tihar', 'rodhi-tika', 'seenmatic-dashain'] },
    { title: 'Film, sound & motion', note: 'Personal pieces where I push rhythm, sound design and animation.', ids: ['supra', 'drift-sfx', 'motion-explainer'], wide: true }
  ],
  // motion-graphics moments cut from delivered videos (assets/mg/<id>.mp4 + .jpg, silent loops)
  motion: [
    { id: 'tiktok-profile', title: 'TikTok profile screen', from: 'All Star Jewellery' },
    { id: 'comments', title: 'Viewer comment pop-ups', from: 'All Star Jewellery' },
    { id: 'price-breakdown', title: 'Price breakdown to 198%', from: 'All Star Jewellery' },
    { id: 'profit-bars', title: 'Profit comparison bars', from: 'All Star Jewellery' },
    { id: 'checklist', title: 'Animated checklist', from: 'All Star Jewellery' },
    { id: 'elec-social', title: 'Social platforms build', from: 'XSIS Media election ad' },
    { id: 'elec-wall', title: 'Social post wall', from: 'XSIS Media election ad' },
    { id: 'elec-work', title: '“Your work” photo cards', from: 'XSIS Media election ad' },
    { id: 'elec-platforms', title: 'Platform list', from: 'XSIS Media election ad' },
    { id: 'supply-chain', title: 'Supply-chain cards', from: 'Yuwaz' },
    { id: 'seat-counter', title: 'Limited-seats counter', from: 'Vibes Advisory' },
    { id: 'running-total', title: 'Running total card', from: 'All Star Jewellery' },
    { id: 'budget-tags', title: 'Budget price tags', from: 'All Star Jewellery' },
    { id: 'service-list', title: 'Stacked service list', from: 'Expert Service Hub' },
    { id: 'winter-cards', title: 'Glass category cards', from: 'Rodhi Sources' }
  ],
  // illustrated scenes animated for the All Star Jewellery series (assets/anim/<id>.mp4 + .jpg, silent loops)
  animations: [
    { id: 'honest-shop', title: 'The honest shop', explains: 'A clear bill: gold, making charge and tax each on their own line. The customer reads it, smiles, and the hearts follow.' },
    { id: 'scam-shop', title: 'The scam shop', explains: 'The other side: hidden charges. The owner counts the cash while the customers are left with question marks.' },
    { id: 'sarkar', title: 'Who gets the blame', explains: 'The system, not the shop: an official enjoys his grapes while the complaints pile up beside him.' },
    { id: 'tiktok-pov', title: 'The viewer’s side', explains: 'The owner’s clip played back inside a phone feed with the likes coming in, to show how viewers saw the first video.' }
  ],
  projects: [
    {
      id: 'no-skip-show', featured: true, group: 'long', cat: 'interview', format: 'wide', duration: '0:59',
      excerpt: 'First minute of the 10-minute episode',
      client: 'The No Skip Show · USA', title: 'Mud Whale, backstage',
      role: 'Edit · Captions · Lower thirds · Sound',
      summary: 'A ten-minute backstage interview with Cleveland band Mud Whale, cut together with their live set. Tight pacing for a loose, crowded conversation, word-timed captions, branded lower thirds and performance inserts placed on the beat.'
    },
    {
      id: 'asj-part3', group: 'reel', cat: 'brand', format: 'tall', duration: '1:12',
      client: 'All Star Jewellery · Seenmatic', title: 'Is your jeweller cheating you?',
      role: 'Edit · Motion graphics · Captions · Sound design',
      summary: 'Part 3 of a myth-busting series. The hook plays in black and white with typed verdicts, colour returns with a light leak, and price and checklist cards explain every claim.'
    },
    {
      id: 'asj-tihar', group: 'reel', cat: 'brand', format: 'tall', duration: '1:02',
      client: 'All Star Jewellery · Seenmatic', title: 'Tihar gifts for every budget',
      role: 'Edit · Budget cards · Captions · Colour',
      summary: 'A festival gift guide split into three budgets. Price tags drop in as each range starts and product B-roll matches every piece she names.'
    },
    {
      id: 'yuwaz', group: 'reel', cat: 'creator', format: 'tall', duration: '0:53',
      client: 'Yuwaz', title: 'Three problems every business in Nepal hits',
      role: 'Edit · Explainer graphics · Captions',
      summary: 'A fast talking-head explainer. Supplier chains, warning icons and stock cards build on screen as he speaks, so the idea lands even with the sound off.'
    },
    {
      id: 'vibes', group: 'reel', cat: 'brand', format: 'tall', duration: '0:45',
      client: 'Vibes Advisory Solution', title: 'Three languages, limited seats',
      role: 'Edit · Info cards · Captions · B-roll',
      summary: 'An admissions ad for a language institute in Butwal: two presenters, on-brand navy and orange cards, flag B-roll for each language and a clear call-to-book ending.'
    },
    {
      id: 'asj-part1', group: 'reel', cat: 'brand', format: 'tall', duration: '0:43',
      client: 'All Star Jewellery · Seenmatic', title: '“Are jewellery shops thieves?”',
      role: 'Edit · Captions · Comment graphics · End card',
      summary: 'Part 1 of the series. Real viewer comments pop up around the owner as he answers them, then a profile card sends people to the rest of the series.'
    },
    {
      id: 'mudwhale-short', group: 'reel', cat: 'interview', format: 'tall', duration: '1:03',
      client: 'The No Skip Show · USA', title: 'Music that makes your ears bleed',
      role: 'Short from long-form · Reframe · Captions',
      summary: 'A vertical short cut from the Mud Whale episode: hook in the first three seconds, reframed for every speaker, and a song outro with the band card.'
    },
    {
      id: 'seenmatic-wedding', group: 'reel', cat: 'brand', format: 'tall', duration: '0:40',
      client: 'All Star Jewellery · Seenmatic', title: 'The full wedding set',
      role: 'Edit · Price cards · Captions · Advanced colour',
      summary: 'A bridal-set walkthrough. Every piece gets a glass card with its weight and a running total adds up the set. A fuller grade makes the gold glow against the red velvet.'
    },
    {
      id: 'president-tihar', group: 'reel', cat: 'brand', format: 'tall', duration: '0:27',
      client: 'President Group', title: 'A Tihar greeting',
      role: 'Edit · B-roll · Captions',
      summary: 'A warm festival greeting from the restaurant: diyo and firework B-roll between the lines, the venue lit up for Tihar, captions timed to her voice.'
    },
    {
      id: 'esh-ad', group: 'reel', cat: 'brand', format: 'tall', duration: '0:35',
      client: 'Expert Service Hub · Nepal', title: 'Dream events in Nepal',
      role: 'Edit · B-roll · Captions · Service cards',
      summary: 'An ad for a destination-event company: presenter to camera, Himalaya and heritage B-roll, a stacked list of their services and an end card with every way to reach them.'
    },
    {
      id: 'rodhi-winter', group: 'reel', cat: 'brand', format: 'tall', duration: '0:37',
      client: 'Rodhi Sources', title: 'Winter stock from China',
      role: 'Edit · Captions · Glass cards · CTA · 4K',
      summary: 'A brand reel for a China-to-Nepal import agent: on-brand keyword captions, frosted product cards, cargo B-roll and the client’s signature CTA wipe, delivered in 4K.'
    },
    {
      id: 'asj-part2', group: 'reel', cat: 'brand', format: 'tall', duration: '1:07',
      client: 'All Star Jewellery · Seenmatic', title: 'Why gold costs more in Nepal',
      role: 'Edit · Captions · Graphics',
      summary: 'Part 2 of the series compares buying gold in Nepal and abroad, with a balance graphic and stacked keyword captions that keep a long explanation easy to follow.'
    },
    {
      id: 'seenmatic-bill', group: 'reel', cat: 'brand', format: 'tall', duration: '0:38',
      client: 'All Star Jewellery · Seenmatic', title: 'The ex-boyfriend’s bill',
      role: 'Edit · Captions · Graphics · Colour',
      summary: 'The owner tells a true customer story straight to camera. Calm cuts, keyword captions and animated bill cards keep it watchable all the way to the comment prompt.'
    },
    {
      id: 'rodhi-tika', group: 'reel', cat: 'brand', format: 'tall', duration: '1:09',
      client: 'Rodhi Sources', title: 'A Dashain tika blessing',
      role: 'Edit · B-roll · Captions · Transitions',
      summary: 'A Vijaya Dashami greeting on the client’s festival template, with B-roll matched to every line of the blessing and soft diyo-flame transitions.'
    },
    {
      id: 'seenmatic-dashain', group: 'reel', cat: 'brand', format: 'tall', duration: '0:26',
      client: 'All Star Jewellery · Seenmatic', title: 'Dashain gift ideas',
      role: 'Edit · Product cards · Colour',
      summary: 'Each piece gets its own title card placed next to the product, never on it, so the jewellery stays the hero.'
    },
    {
      id: 'cpa-firm', group: 'reel', cat: 'personal', format: 'tall', duration: '0:37',
      client: 'Spec edit', title: 'Everything at one firm',
      role: 'Edit · Motion graphics · Animated captions',
      summary: 'A talking-head ad for an accounting firm, rebuilt with animated service lists, org-chart graphics and word-by-word captions.'
    },
    {
      id: 'clay-startup', group: 'reel', cat: 'personal', format: 'tall', duration: '0:48',
      client: 'Spec edit', title: 'Soul of the soil',
      role: 'Edit · Product graphics · Story',
      summary: 'A founder story for a clay-products startup: workshop footage, numbered product cards and an animated breakdown.'
    },
    {
      id: 'supra', group: 'film', cat: 'personal', format: 'wide', duration: '0:15',
      client: 'Personal', title: 'Bare minimum',
      role: 'Edit · Rhythm · Grade',
      summary: 'A short, moody car piece cut to the music, built from slow reveals and light falling across the body.'
    },
    {
      id: 'drift-sfx', group: 'film', cat: 'personal', format: 'wide', duration: '0:11', sound: true,
      client: 'Sound design', title: 'Drift-X',
      role: 'Sound design · Mix',
      summary: 'A sound-first piece: engine, tyre and wind layers built to picture. Best with headphones.'
    },
    {
      id: 'motion-explainer', group: 'film', cat: 'personal', format: 'wide', duration: '0:36',
      client: 'Personal', title: 'One workout',
      role: 'Motion graphics · Edit',
      summary: 'An illustrated motivational explainer, animated from stills with kinetic type and simple shape graphics.'
    }
  ]
};
