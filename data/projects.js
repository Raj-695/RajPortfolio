// All portfolio content lives here. Edit text freely; paths are relative to index.html.
// group: 'long' | 'short' | 'film'   ·   format: 'wide' (16:9) | 'tall' (9:16)
// short: label on the hero timeline clip   ·   tc: where the hover preview was cut from (for the monitor HUD)
window.PORTFOLIO = {
  name: 'Raj Kahar',
  email: 'rraj68711@gmail.com',
  whatsapp: 'https://wa.me/9779762026802',
  timezone: 'Asia/Kathmandu',
  city: 'Nepalgunj',
  socials: [
    { label: 'WhatsApp', handle: '+977 976 202 6802', url: 'https://wa.me/9779762026802' },
    { label: 'Instagram', handle: '@exwhyzed77', url: 'https://www.instagram.com/exwhyzed77/' },
    { label: 'TikTok', handle: '@lowkeeyyy_69', url: 'https://www.tiktok.com/@lowkeeyyy_69' }
  ],
  projects: [
    {
      id: 'no-skip-show', featured: true, group: 'long', format: 'wide', duration: '0:59', short: 'No Skip',
      excerpt: 'First minute of the 10-minute episode',
      client: 'The No Skip Show', title: 'Mud Whale, backstage',
      role: 'Edit · Captions · Lower thirds · Sound',
      summary: 'A ten-minute backstage interview with Cleveland band Mud Whale, cut together with their live set. The job was to keep a loose, crowded conversation moving: tight pacing, word-timed captions, branded lower thirds and performance inserts placed on the beat.'
    },
    {
      id: 'seenmatic-wedding', group: 'short', format: 'tall', duration: '0:40', short: 'Wedding',
      client: 'Seenmatic · Gold jewellery store', title: 'The full wedding set',
      role: 'Edit · Price cards · Nepali captions · Advanced colour',
      summary: 'A bridal-set walkthrough. Every piece gets a glass card with its weight, then a running total adds the whole set up. Finished with a fuller grade that makes the gold glow against the red velvet.'
    },
    {
      id: 'esh-ad', group: 'short', format: 'tall', duration: '0:35', short: 'ESH',
      client: 'Expert Service Hub Nepal', title: 'Dream events in Nepal',
      role: 'Edit · B-roll · Captions · Service cards',
      summary: 'An ad for a destination-event company: presenter to camera, Himalaya and heritage B-roll, a stacked glass list of their services and an end card with every way to reach them.'
    },
    {
      id: 'seenmatic-bill', group: 'short', format: 'tall', duration: '0:38', short: 'Bill',
      client: 'Seenmatic · Gold jewellery store', title: 'The ex-boyfriend’s bill',
      role: 'Edit · Nepali captions · Graphics · Colour',
      summary: 'A shop owner tells a true customer story straight to camera. Calm cuts, keyword captions in Nepali and animated bill cards keep a talking-head reel watchable all the way to the comment prompt.'
    },
    {
      id: 'rodhi-winter', group: 'short', format: 'tall', duration: '0:37', short: 'Winter',
      client: 'Rodhi Sources', title: 'Winter stock from China',
      role: 'Edit · Captions · Glass cards · CTA · 4K',
      summary: 'A brand reel for a China-to-Nepal import agent: on-brand keyword captions, frosted-glass product cards, air and road cargo B-roll and the client’s signature CTA wipe, delivered in 4K.'
    },
    {
      id: 'rodhi-tika', group: 'short', format: 'tall', duration: '1:09', short: 'Tika',
      client: 'Rodhi Sources', title: 'A Dashain tika blessing',
      role: 'Edit · B-roll · Nepali captions · Transitions',
      summary: 'A Vijaya Dashami greeting on the client’s festival template. Sharp B-roll that matches every line of the blessing, clean Devanagari captions and soft diyo-flame transitions between the shots.'
    },
    {
      id: 'seenmatic-dashain', group: 'short', format: 'tall', duration: '0:26', short: 'Dashain',
      client: 'Seenmatic · Gold jewellery store', title: 'Dashain gift ideas',
      role: 'Edit · Product cards · Colour',
      summary: 'A festival gift guide. Each piece gets its own title card (name, use and style tags) placed next to the product, never covering it, so the jewellery stays the hero.'
    },
    {
      id: 'cpa-firm', group: 'short', format: 'tall', duration: '0:37', short: 'CPA',
      client: 'Spec edit', title: 'Everything at one firm',
      role: 'Edit · Motion graphics · Animated captions',
      summary: 'A talking-head ad for an accounting firm, rebuilt with animated service lists, org-chart graphics and word-by-word captions.'
    },
    {
      id: 'clay-startup', group: 'short', format: 'tall', duration: '0:48', short: 'Clay',
      client: 'Spec edit', title: 'Soul of the soil',
      role: 'Edit · Product graphics · Story',
      summary: 'A founder story for a clay-products startup: workshop footage, numbered product cards and an animated fridge breakdown.'
    },
    {
      id: 'supra', group: 'film', format: 'wide', duration: '0:15', short: 'Supra',
      client: 'Personal', title: 'Bare minimum',
      role: 'Edit · Rhythm · Grade',
      summary: 'A short, moody car piece cut to the music, built from slow reveals and light falling across the body.'
    },
    {
      id: 'drift-sfx', group: 'film', format: 'wide', duration: '0:11', sound: true, short: 'Drift-X',
      client: 'Sound design', title: 'Drift-X',
      role: 'Sound design · Mix',
      summary: 'A sound-first piece: engine, tyre and wind layers built to picture. Watch it with headphones.'
    },
    {
      id: 'motion-explainer', group: 'film', format: 'wide', duration: '0:36', short: 'Workout',
      client: 'Personal', title: 'One workout',
      role: 'Motion graphics · Edit',
      summary: 'An illustrated motivational explainer, animated from stills with kinetic type and simple shape graphics.'
    }
  ]
};
