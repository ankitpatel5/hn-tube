// Keyword + channel rules that sort a video into one category.
// Each rule that matches the HN title, the YouTube title or the channel adds its weight;
// the highest score wins and ties go to the category listed first. No match → "culture".

const CHANNEL = 3; // a known channel counts like one strong keyword; ties go to the earlier category
const STRONG = 3;
const WEAK = 1;

// Words are matched case-insensitively on word boundaries; entries may use regex syntax.
const words = (...list) => new RegExp(`(?<![\\w])(?:${list.join('|')})(?![\\w])`, 'i');

export const CATEGORIES = [
  {
    id: 'security',
    name: 'Security & Privacy',
    channels: ['benn jordan', 'liveoverflow', 'naomi brockwell tv', 'defconconference', 'black hat', 'techlore',
      'mullvad vpn', 'media.ccc.de', 'john hammond', 'seytonic', 'parkrose resistance', 'rtings r&d'],
    strong: words('security', 'surveillance', 'flock', 'deflock', 'spyware', 'spy(ing)?', 'privacy', 'private',
      'backdoor', 'exploits?', 'secure', 'https', 'tls', 'lock ?pick(ing|er)?', 'unpickable', 'vulnerabilit(y|ies)', 'defcon', 'def con', 'black hat', 'malware', 'ransomware',
      'encryption', 'vpn', 'hacked', 'hacking', 'jammer', 'stalk(ers|ing)?', 'wiretapping', 'tracking you',
      'cve', 'zero-day', 'phishing', 'cybersecurity', 'anti-surveillance', 'white hat', 'captchas?',
      'bot-detection', 'jailbreak(ing)?', 'reverse engineering', 'decompil(e|er|ation)'),
    weak: words('signal', 'adblock(er)?', 'camera leak', 'xz', 'password(s)?', 'police', 'cameras'),
  },
  {
    id: 'ai',
    name: 'AI & ML',
    channels: ['two minute papers', 'ai engineer', 'dwarkesh patel', 'andrej karpathy', 'pivot to ai', 'yannic kilcher',
      'machine learning street talk', 'welch labs', 'anthropic', 'openai', 'google deepmind', 'cortical labs'],
    strong: words('ai', 'a\\.i\\.', 'llms?', 'gpt(-\\d)?', 'chatgpt', 'openai', 'anthropic', 'claude( code| cowork)?',
      'gemini', 'deepmind', 'agi', 'machine learning', 'deep learning', 'neural( net(work)?s?)?', 'vibe ?coding',
      'ai agents?', 'coding agents?', 'agentic', 'prompt(ing|s)?', 'waymos?', 'self-driving', 'robotaxis?', 'transformers?', 'midjourney', 'copilot', 'hassabis', 'amodei', 'altman', 'karpathy',
      'genai', 'xai', 'mcp', 'interpretability', 'qwen', 'llama', 'mistral', 'fine-?tun(e|ed|ing)',
      'apple intelligence', 'antigravity', 'deep ?fakes?', 'diffusion model', 'openclaw', 'opus \\d', 'sonnet \\d'),
    weak: words('model(s)?', 'agents?', 'data ?cent(er|re)s?', 'gpus', 'nvidia', 'brain cells', 'autonomous'),
  },
  {
    id: 'retro',
    name: 'Retro Computing',
    channels: ['tech tangents', 'the 8-bit guy', "adrian's digital basement", 'curiousmarc', 'computer history museum',
      'periscopefilm', 'the serial port', 'usagi electric', 'throaty mumbo', 'lgr', 'interface studies',
      'revision demoparty', 'turing awardee clips', 'catherine lathwell', 'sid\'s vids', 'will it work?',
      'chris staecker', 'rndstranger', 'arcade jason', 'wave design', 'nostalgia nerd', 'cathode ray dude'],
    strong: words('retro', 'vintage', 'commodore', 'amiga', 'atari', 'apple (ii|lisa)', 'lisa', 'n64', 'game ?boy',
      'wii u', 'sega', 'nes', 'snes', 'ms-dos', 'dos', 'laserdisc', 'floppy', 'cassette', 'vectrex', 'demoparty',
      'demoscene', 'oral history', 'mother of all demos', 'sketchpad', 'system/360', 'ibm', 'pdp-\\d+', 'vax',
      'mainframe', 'vcf', 'bernoulli', '8-bit', 'ne2000', 'tetris', 'silicon graphics', 'sgi', 'bbc micro',
      'c64', 'commodore 64', 'hypercard', 'gopher', 'bbs', 'usenet', 'video toaster', 'newtek',
      '19[4-9]0s', 'from 19\\d\\d', 'in 19\\d\\d', 'digi-comp', 'iphone 4', 'antennagate'),
    weak: words('history', 'historic(al)?', 'old', 'years old', 'original', 'legend(ary)?', 'restor(e|ed|ing|ation)',
      '\\(19\\d\\d\\)', '19[5-9]\\d', 'interview(s)? alan kay'),
  },
  {
    id: 'programming',
    name: 'Programming',
    channels: ['tsoding', 'acm sigplan', 'recurse center', 'software should work', 'better software conference',
      'molly rocket', 'meeting cpp', 'cppcon', 'clojuretv', 'strange loop conference', 'pganalyze', 'goto conferences',
      'xenodium', 'jane street', 'tigerbeetle', 'gingerbill', 'code sync', 'scala days conferences', 'the primetime',
      'cultrepo', 'kernel recipes', 'oxide computer company', 'matt godbolt', 'software unscripted podcast', 'laracasts', 'freecodecamp.org', 'the pragmatic engineer', 'almighty lisp', 'london clojurians', 'erlang solutions', 'ink & switch',
      'swift community meetups', 'ruby on rails', 'brett codes', 'mo bitar', 'hayyoth', 'arthur gleckler',
      'fireship', "dave's garage", 'theo - t3․gg', 'low level', 'ryan peterman', 'considered helpful', 'yusuke endoh', 'timo bingmann'],
    strong: words('programming', 'programmers?', 'software', 'coding', 'code', 'compilers?', 'c\\+\\+', 'c#', 'rust',
      'zig', 'odin', 'clojure', 'lisp', 'haskell', 'scala', 'swift', 'erlang', 'elixir', 'golang', 'python',
      'java', 'javascript', 'typescript', 'makefiles?', 'goto', 'racket', 'pycon', 'oberon', 'datastar', 'node',
      'cloudflare', 'omarchy', 'freenet', 'decentralized', 'cuda', 'kubernetes', 'docker', 'devops', 'svg', 'full-stack', 'registry', 'ruby', 'rails', 'postgres(ql)?', 'sql', 'database', 'smalltalk', 'apl', 'forth',
      'colorforth', 'emacs', 'vim', 'neovim', 'git', 'github', 'linux', 'kernel', 'unix', 'concurrency',
      'parallel language', 'algorithms?', 'quine', 'open source', 'oss', 'foss', 'developers?', 'webassembly', 'wasm',
      'html', 'css', 'browser', 'operating system', 'os', 'api', 'version control', 'memory safety', 'fil-c',
      'garbage collect(or|ion)', 'type system', 'statically typed', 'functional', 'printf', 'tiddlywiki', 'ladybird',
      'x11', 'wayland', 'desktop ux', 'kde', 'aws', 'cloud', 'server', 'transactions', 'production engineering',
      'bret victor', 'rob pike', 'joe armstrong', 'alan kay', 'knuth', 'hickey', 'odersky', 'hejlsberg'),
    weak: words('engineer(s|ing)?', 'c', 'in c', 'processing', 'windows', 'devs?', 'firefox', 'chrome', 'openstreetmap', 'files? utils', 'tcp', 'documentary', 'keynote', 'conf(erence)?'),
  },
  {
    id: 'hardware',
    name: 'Hardware',
    channels: ['eevblog', 'bitluni', 'ben eater', 'dr.semiconductor', 'laurie wired', 'lauriewired', 'der8auer en',
      'jeff geerling', 'asianometry', 'gamers nexus', 'gnca - gamersnexus consumer advocacy', 'linus tech tips',
      'sylvain munaut', 'wenting channel', 'alexelectronics', 'bo made it', 'made by dennis', 'soiboi soft',
      'new tech studio (bandit)', 'dydt製作所', 'htx studio', 'rootkid', 'mattkc', 'f4mi', 'high yield',
      'techtechpotato', 'branch education', 'great scott!', 'ifixit'],
    strong: words('hardware', 'electronics?', 'chips?', 'cpus?', 'gpus?', 'ram', 'dram', 'memory', 'fpga',
      'semiconductors?', 'transistors?', '555', 'circuit', 'pcb', 'esp32', 'arduino', 'raspberry pi', 'risc-v',
      'oscilloscope', 'solder(ing)?', 'e-?ink', 'e-paper', 'monitors?', 'pci express', 'pcie', 'petabyte', 'nas',
      'sid chip', 'core memory', 'liquid metal', 'rtx \\d+', 'nvidia', 'amd', 'intel', 'tsmc', 'asml', 'lithography',
      'smart tvs?', 'tvs', 'iphone', 'macbook', 'laptop', 'framework', 'battery', 'batteries', 'fast charging',
      'keyboard', 'radio waves', 'vram', 'pebble', 'smartwatch', 'routers?', 'unifi', 'palm pre', 'phones?',
      'calculators?', 'motorola', '680[0-6]0', 'chip design', 'pdks?', 'foundry', 'atsc', 'jensen huang', 'earbuds', 'repairable', 'baremetal', 'computer', 'pc', 'segment display', 'microcontroller'),
    weak: words('built', 'gadget', 'device', 'screen', 'build'),
  },
  {
    id: 'gaming',
    name: 'Games & Graphics',
    channels: ['corridor crew', 'rockstar games', 'godot engine', 'grow now! games', 'mike turitzin', 'james lambert',
      'perfect play', 'mmqd', 'bringus studios', 'hilltop', 'noclip - video game documentaries',
      'digital foundry', 'game maker\'s toolkit', 'sebastian lague', 'acerola'],
    strong: words('games?', 'gaming', 'video ?games?', 'game engine', 'doom', 'skyrim', 'gta', 'grand theft auto',
      'nintendo', 'playstation', 'xbox', 'steam', 'mmos?', 'runescape', 'shaders?', 'ray ?tracing', '3d graphics',
      'graphics', 'rendering', 'vfx', 'green screen', 'sdfs?', 'signed distance', 'pinball', 'chess', 'monopoly',
      'guess who', 'rubik\'?s', 'piracy', 'valve', 'arcade', 'godot', 'unity', 'unreal', 'fov', 'panini projection', 'speedrun',
      'rom', 'game cartridge', 'billiards', 'ascii', 'wolfenstein', 'renderer', 'wipeout', 'lego', 'puzzles?'),
    weak: words('engine', 'player', 'world record', 'animation', 'pixel'),
  },
  {
    id: 'business',
    name: 'Business',
    channels: ['patrick boyle', 'y combinator', 'bloomberg podcasts', 'yahoo finance', 'ben felix', 'federal reserve',
      "lenny's podcast", 'casual finance', 'andrei jikh', 'alex kantrowitz', 'the tech report', 'cnbc',
      'bloomberg television', 'how money works', 'modern mba', 'acquired', 'the invisible game'],
    strong: words('ipo', 'stocks?', 'stock market', 'wall street', 'investors?', 'investing', 'investment', 'economy',
      'economic(s)?', 'recession', 'inflation', 'interest rates', 'federal reserve', 'jerome', 'startups?',
      'founders?', 'ceo', 'revenue', 'profits?', 'debt', 'bubble', 'valuations?', 'shareholders?', 'billions?',
      'trillion', '\\$\\d', '401k', 'finance', 'financial', 'bank(s|ing)?', 'money', 'capitalism', 'monopoly',
      'antitrust', 'layoffs?', 'jobs', 'workers', 'careers?', 'salary', 'prices?', 'pricing', 'business', 'company',
      'companies', 'business(es)?', 'laid off', 'layoff', 'crypto', 'bitcoin', 'bailout', 'prediction markets', 'ad spend',
      'indiehacking', 'economists?', 'shipping', 'tanker', 'management', 'acquisition', 'burry', 'zitron', 'yc', 'grift', 'game theory', 'fraud(ulent)?'),
    weak: words('boom', 'market', 'amazon', 'tesla', 'cheapest', 'wealth', 'rich', 'zuckerberg', 'musk', 'bezos', 'meta'),
  },
  {
    id: 'space',
    name: 'Space & Aviation',
    channels: ['scott manley', 'everyday astronaut', 'nasa', 'spacex', 'isar aerospace', 'vasaviation -', 'mentour pilot', 'rocket lab', 'blue origin',
      'videofromspace', 'ramy rc', 'gearskeptic'],
    strong: words('spacex', 'starship', 'rockets?', 'nasa', 'esa', 'mars', 'lunar', 'moon', 'orbit(al)?',
      'satellites?', 'starlink', 'aerospace', 'into orbit', 'liftoff', 'blue origin', 'new glenn', 'planets?', 'astronauts?', 'telescope', 'jwst', 'aircraft', 'airplanes?',
      'planes?', 'aviation', 'airlines?', 'air canada', 'a380', '747', 'boeing', 'airbus', 'pilots?', 'atc',
      'mid-air', 'flight', 'flew', 'fighter jets?', 'f-35', 'helicopter', 'airport', 'laguardia', 'lax', 'rover'),
    weak: words('space', 'launch', 'flying', 'fly', 'thrusters', 'drone'),
  },
  {
    id: 'science',
    name: 'Science & Math',
    channels: ['3blue1brown', 'veritasium', 'physics girl', '2swap', 'applied science', 'minuteearth', 'big think',
      'numberphile', 'stand-up maths', 'sabine hossenfelder', 'kurzgesagt – in a nutshell', 'pbs space time',
      'the thought emporium', 'joint mathematics meetings', 'prof mihai nica', 'grant sanderson', 'okooptics',
      'dr brian keating', 'labcoatz', 'nilered', 'steve mould', 'smarter every day', 'jellyfish compendium project',
      'mehranshargh', 'atish joygobin', 'primal space', 'styro pyro 2', 'professor dave explains', 'sudgylacmoe', 'mathologer'],
    strong: words('science', 'scientific', 'scientists?', 'math(s|ematics|ematical|ematician)?', 'physics',
      'physicist', 'chemistry', 'chemical', 'biology', 'neutrinos?', 'quantum', 'universe', 'cosmology', 'theorem',
      'proofs?', 'proving', 'formula', 'geometry', 'algebra', 'hyperbolic', 'quintic', 'logarithm', 'equations?',
      'maxwell', 'dirac', 'microscopes?', 'electron microscope', 'x-ray', 'laser', 'optics', 'lensless', 'imaging',
      'electrolysis', 'genetic(ally)?', 'dna', 'cells?', 'brain', 'neuroscience', 'evolution', 'species', 'octopus',
      'jellyfish', 'insects?', 'birds?', 'crows?', 'feathers?', 'volcano', 'erupt(s|ion)?', 'kilauea', 'iceberg',
      'climate', 'asbestos', 'periodic table', 'gyroscopes?', 'cognition', 'analogy', 'terence tao', 'terry tao',
      'sean carroll', 'fermat', 'obesity', 'hibernat(e|ion)', 'parasites?', 'health', 'disease', 'permutations?',
      'determinant', 'stroke', 'neuralink', 'molecul(e|es|ar)', 'nuclear', 'fusion', 'reactors?', 'four dimensions', 'medicine', 'medical', 'vaccine', 'cancer'),
    weak: words('explains?', 'experiment', 'research', 'nature', 'discovered'),
  },
  {
    id: 'making',
    name: 'Engineering & DIY',
    channels: ['tom stanton', 'aaed musa', 'practical engineering', 'technology connections', 'stuff made here',
      'joshua bird', 'nighthawkinlight', 'cncdan', 'chronova engineering', 'jellyfish machine',
      'oliver pett - mechanical creations', 'berm peak', 'hydro vision', 'chris doel', 'the map reading company',
      'matthew lim', 'not programming', 'first class amateur', 'project farm', 'andrei copaci', 'kirsten dirksen',
      'marcin plaza', 'blackwing', 'masters of craft', 'coolest thing', 'this old tony', 'clickspring',
      'breaking taps', 'mark rober', 'raí institute', 'rai institute'],
    strong: words('engineering', 'engineers?', 'diy', '3d print(ed|ing|er)?', 'cnc', 'machining', 'machinist',
      'engines?', 'two stroke', '2-stroke', 'drones?', 'robots?', 'robotics', 'trebuchet', 'automaton', 'mechanical',
      'workshop', 'woodworking', 'compass', 'pencils?', 'sharpener', 'bikes?', 'e-bike', 'drivetrain', 'aircrete',
      'concrete', 'hydropower', 'turbines?', 'electrical outlets?', 'solar panels?', 'renewable', 'hybrid cars?',
      'electric cars?', 'ev', 'dishwasher', 'how .* (are|is) made', 'made from scratch', 'from scratch', 'origami',
      'spinning top', 'manufactur(e|ing)', 'factory', 'fabrication', 'sheet metal', 'replica', 'earth homes',
      'architecture', 'drawstring', 'segway', 'atlas robot', 'bipedal'),
    weak: words('built', 'build(ing)?', 'making', 'made', 'invent(ed|or|ing)?', 'overengineered', 'reinventing',
      'restores?', 'homemade', 'home made', 'at home', 'cars?'),
  },
  {
    id: 'society',
    name: 'Policy & Society',
    channels: ['louis rossmann', 'more perfect union', 'steve lehto', 'not just bikes', 'robert reich', 'the lunduke journal',
      'rob braxman tech', 'c-span', 'forbrukerrådet', 'forbrukerrådet - norwegian consumer council', 'eff', 'legal eagle', 'nyc mayor\'s office',
      'new york times opinion', 'vanessa wingårdh'],
    strong: words('government', 'govt', 'politic(s|al|ian)', 'law', 'laws', 'legal', 'lawsuit', 'sued', 'sues',
      'court', 'judge', 'jail(ed)?', 'prison', 'arrest(ed)?', 'police', 'fcc', 'ftc', 'congress', 'senate',
      'referendum', 'citizens united', 'election', 'vote(s|d)?', 'voting', 'president(s)?', 'trump', 'pentagon',
      'mayor', 'city council', 'visa', 'immigra(nt|tion)', 'censorship', 'free speech', 'copyright', 'right to repair',
      'stop killing games', 'consumer', 'rights', 'education', 'teachers?', 'kids', 'children', 'schools?',
      'housing', 'cities', 'urban', 'trucks', 'regulation', 'ban(ned|s)?', 'terrorist', 'fake news', 'propaganda',
      'corruption', 'settlers', 'eff', 'social media', 'border', 'ice', 'shooting', 'fascism', 'democracy',
      'authoritarian', 'journalis(ts?|m)', 'israel(i)?', 'military', 'war', 'nobel', 'free software', 'scam', 'enshittif(ication|icator)', 'doj', 'testif(y|ies)', 'hearing', 'healthcare', 'high speed rail',
      'transit', 'trains?', 'men in tech', 'china', 'chinese', 'taiwan', 'iran', 'gaza', 'greenland', 'nazis?', 'hitler',
      'stalin', 'pardons?', 'geo-?strategy', 'tiktok', 'instagram', 'facebook', 'internet is', 'personal computing'),
    weak: words('youtube', 'big tech', 'russia(n)?', 'ukrain(e|ian)', 'people', 'society', 'europe', 'american', 'u\\.s\\.', 'canadians'),
  },
  {
    id: 'culture',
    name: 'Culture & More',
    channels: ['tom scott', 'rick beato', 'saturday night live', 'the onion', 'krazam', 'dust', 'jimmy kimmel live',
      'the daily show', 'intermarché', 'ikea ireland', 'real coffee with scott adams', 'kasperanza', 'mattias krantz'],
    strong: words('music', 'musician', 'bach', 'piano', 'orchestra', 'swan lake', 'food', 'recipe', 'song', 'album', 'film', 'movies?', 'short film', 'sci-fi', 'comedy', 'snl',
      'weekend update', 'advert(isement)?', 'commercial', 'ad', 'art', 'artist', 'painting', 'design', 'typography',
      'letters', 'books?', 'novel', 'philosophy', 'foucault', 'language', 'linguistics', 'bouba', 'kiki', 'sports?',
      'football', 'died', 'tribute', 'obituary', 'interview', 'podcast', 'documentary'),
    weak: words('story', 'life', 'world'),
  },
];

export function categorize({ title = '', videoTitle = '', channel = '' }) {
  const text = `${title}\n${videoTitle}`;
  const ch = channel.trim().toLowerCase();
  let best = { id: 'culture', score: 0 };
  for (const cat of CATEGORIES) {
    let score = 0;
    if (cat.channels.includes(ch)) score += CHANNEL;
    // Count each distinct matching keyword once, wherever it appears.
    score += countMatches(cat.strong, text) * STRONG;
    score += countMatches(cat.weak, text) * WEAK;
    if (score > best.score) best = { id: cat.id, score };
  }
  return best.id;
}

function countMatches(re, text) {
  const global = new RegExp(re.source, 'gi');
  return new Set([...text.matchAll(global)].map((m) => m[0].toLowerCase())).size;
}
