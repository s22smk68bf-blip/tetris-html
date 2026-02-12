const avgRateEl = document.getElementById('avgRate');
const maxShockCard = document.getElementById('maxShockCard');
const latestList = document.getElementById('latestList');
const rankingList = document.getElementById('rankingList');
const tsukkomiOutput = document.getElementById('tsukkomiOutput');
const tsukkomiButtons = [
  document.getElementById('tsukkomiBtn'),
  document.getElementById('tsukkomiBtn2')
].filter(Boolean);

const tsukkomiPhrases = [
  'それは高すぎィィ！！',
  '遠足、崩壊。',
  'もう高級品やん',
  '財布が泣いてる',
  '庶民のライフ、ハードモード突入！',
  '値札がバグって見える…',
  '買い物か、修行か。',
  'カートよりため息が重い！'
];

const yenFormatter = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0
});

function calcRate(item) {
  const rate = ((item.newPrice - item.oldPrice) / item.oldPrice) * 100;
  return Number(rate.toFixed(1));
}

function getShockClass(rate) {
  if (rate >= 100) return 'shock-epic';
  if (rate >= 50) return 'shock-high';
  if (rate >= 20) return 'shock-mid';
  return 'shock-low';
}

function createInfoParagraph(label, value) {
  const p = document.createElement('p');
  p.className = 'meta';
  p.textContent = `${label}${value}`;
  return p;
}

function renderCard(item) {
  const card = document.createElement('article');
  const rate = calcRate(item);
  card.className = `shock-card ${getShockClass(rate)}`;

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = `${item.name}（${item.category}）`;

  const priceLine = createInfoParagraph('前: ', `${yenFormatter.format(item.oldPrice)} → 今: ${yenFormatter.format(item.newPrice)}`);

  const rateTag = document.createElement('p');
  rateTag.className = 'rate';
  rateTag.textContent = `値上げ率: +${rate.toFixed(1)}%`;

  const dateLine = createInfoParagraph('改定日: ', item.date);

  const comment = document.createElement('p');
  comment.className = 'comment';
  comment.textContent = `💬 ${item.comment}`;

  card.append(title, priceLine, rateTag, dateLine, comment);

  return card;
}

function renderHero(item) {
  if (!item) return;

  const rate = calcRate(item);
  maxShockCard.className = `shock-card hero-card ${getShockClass(rate)}`;
  maxShockCard.innerHTML = '';

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = `${item.name}（${item.category}）`;

  const price = createInfoParagraph('前: ', `${yenFormatter.format(item.oldPrice)} → 今: ${yenFormatter.format(item.newPrice)}`);

  const rateTag = document.createElement('p');
  rateTag.className = 'rate';
  rateTag.textContent = `値上げ率: +${rate.toFixed(1)}%`;

  const comment = document.createElement('p');
  comment.className = 'comment';
  comment.textContent = `🎙️ ${item.comment}`;

  maxShockCard.append(title, price, rateTag, comment);

  if (rate > 100) {
    const badge = document.createElement('p');
    badge.className = 'alert-badge';
    badge.textContent = '🚨インフレ警報発令中';
    maxShockCard.appendChild(badge);
  }
}

function renderLatest(items) {
  latestList.innerHTML = '';
  items.forEach((item) => {
    latestList.appendChild(renderCard(item));
  });
}

function renderRanking(items) {
  rankingList.innerHTML = '';
  items.forEach((item, index) => {
    const li = document.createElement('li');
    const rate = calcRate(item);
    li.className = `rank-item ${getShockClass(rate)}`;

    if (index < 3) {
      li.classList.add('top3');
    }

    const no = document.createElement('span');
    no.className = 'rank-no';
    no.textContent = String(index + 1);

    const content = document.createElement('div');

    const title = document.createElement('p');
    title.className = 'rank-main';
    title.textContent = `${item.name}（${item.category}）`;

    const price = createInfoParagraph('前: ', `${yenFormatter.format(item.oldPrice)} → 今: ${yenFormatter.format(item.newPrice)}`);
    const rateTag = document.createElement('p');
    rateTag.className = 'rate';
    rateTag.textContent = `+${rate.toFixed(1)}%`;

    content.append(title, price, rateTag);
    li.append(no, content);
    rankingList.appendChild(li);
  });
}

function renderAverage(items) {
  const total = items.reduce((sum, item) => sum + calcRate(item), 0);
  const avg = items.length ? total / items.length : 0;
  avgRateEl.textContent = `今月の平均値上げ率：+${avg.toFixed(1)}%`;
}

function attachTsukkomi() {
  tsukkomiButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const random = tsukkomiPhrases[Math.floor(Math.random() * tsukkomiPhrases.length)];
      tsukkomiOutput.textContent = random;
    });
  });
}

async function init() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error(`データ取得失敗: ${response.status}`);
    }

    const data = await response.json();
    const withRate = data.map((item) => ({ ...item, rate: calcRate(item) }));

    renderAverage(withRate);

    const maxShock = [...withRate].sort((a, b) => b.rate - a.rate)[0];
    renderHero(maxShock);

    const latest = [...withRate].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    renderLatest(latest);

    const ranking = [...withRate].sort((a, b) => b.rate - a.rate);
    renderRanking(ranking);
  } catch (error) {
    avgRateEl.textContent = '今月の平均値上げ率：表示エラー';
    maxShockCard.textContent = 'データを読み込めませんでした。時間をおいて再アクセスしてください。';
    console.error(error);
  }

  attachTsukkomi();
}

init();
