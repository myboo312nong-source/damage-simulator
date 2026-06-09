const oldSetMap = {
  BS: "base1",
  JU: "base2",
  FO: "base3",
  TR: "base5",
  G1: "gym1",
  G2: "gym2",
  N1: "neo1",
  N2: "neo2",
  N3: "neo3",
  N4: "neo4",
  E1: "ecard1",
  E2: "ecard2",
  E3: "ecard3",
  RS: "ex1",
  SS: "ex2",
  DR: "ex3",
  MA: "ex4",
  HL: "ex5",
  RG: "ex6",
  TRR: "ex7",
  DX: "ex8",
  EM: "ex9",
  UF: "ex10",
  DS: "ex11",
  LM: "ex12",
  HP: "ex13",
  CG: "ex14",
  DF: "ex15",
  PK: "ex16",
  DP: "dp1",
  MT: "dp2",
  SW: "dp3",
  GE: "dp4",
  MD: "dp5",
  LA: "dp6",
  SF: "dp7",
  PL: "pl1",
  RR: "pl2",
  SV: "pl3",
  AR: "pl4",
  WP: "basep",
  NP: "np",
  DPP: "dpp",
  BS2: "base4",
  LC: "base6",
  SI: "si1",
  BG: "bp",
  RM: "ru1",
};

const cards = [
  {
    nameCn: "多龙巴鲁托ex",
    nameEn: "Dragapult ex",
    role: "主攻手",
    stage: "2进化",
    count: "3张",
    cnImage: "https://tcg.mik.moe/static/img/CSV8C/159.png",
    enImage: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/tpci/TWM/TWM_130_R_EN.png",
    description: "前场 200 + 后场 60 是卡组的核心压制点。重点不是单次伤害，而是提前规划后排点数。",
  },
  {
    nameCn: "多龙奇",
    nameEn: "Drakloak",
    role: "过牌轴",
    stage: "1进化",
    count: "4张",
    cnImage: "https://tcg.mik.moe/static/img/CSV8C/158.png",
    enImage: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/tpci/TWM/TWM_129_R_EN.png",
    description: "负责把进化线和资源接起来。多龙奇能站住时，卡组的连续输出会稳定很多。",
  },
  {
    nameCn: "多龙梅西亚",
    nameEn: "Dreepy",
    role: "基础位",
    stage: "基础",
    count: "4张",
    cnImage: "https://tcg.mik.moe/static/img/CSV8C/157.png",
    enImage: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/tpci/TWM/TWM_128_R_EN.png",
    description: "前期需要尽量铺开，避免关键进化线断档。起手和第一回合的铺场质量很重要。",
  },
  {
    nameCn: "友好宝芬",
    nameEn: "Buddy-Buddy Poffin",
    role: "展开",
    stage: "物品",
    count: "4张",
    cnImage: "https://tcg.mik.moe/static/img/SVP/196.png",
    enImage: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/tpci/TEF/TEF_144_R_EN.png",
    description: "提高第一回合展开能力，是让多龙梅西亚站满场的关键检索牌。",
  },
  {
    nameCn: "宝可梦联盟总部",
    nameEn: "Pokemon League Headquarters",
    role: "场地",
    stage: "干扰",
    count: "1张",
    cnImage: "https://tcg.mik.moe/static/img/CSV6C/128.png",
    enImage: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/tpci/OBF/OBF_192_R_EN.png",
    description: "用于处理特定对局和场地争夺。不是每局都决定胜负，但在环境里有明确针对价值。",
  },
];

const ratingDefaults = [
  ["强度", 0],
  ["稳定", 0],
  ["难度", 0],
  ["上限", 0],
  ["环境", 0],
];

let activeCard = 0;
let activeLang = "cn";
let limitlessSocket = null;
let limitlessSocketReady = false;
let limitlessPendingSearch = null;
let stampGenerated = false;

const miniCards = document.querySelector("#miniCards");
const ratings = document.querySelector("#ratings");
const stamp = document.querySelector("#stamp");
const stampLabel = stamp.querySelector("span");
const stampText = document.querySelector("#stampText");
const generateStampBtn = document.querySelector("#generateStampBtn");
const avgScore = document.querySelector("#avgScore");
const tierText = document.querySelector("#tierText");
const focusImage = document.querySelector("#focusImage");
const keyCardName = document.querySelector("#keyCardName");
const keyRole = document.querySelector("#keyRole");
const keyCost = document.querySelector("#keyCost");
const keyCount = document.querySelector("#keyCount");
const keyDescription = document.querySelector("#keyDescription");
const searchDialog = document.querySelector("#searchDialog");
const searchCardSelect = document.querySelector("#searchCardSelect");
const cardSearchSource = document.querySelector("#cardSearchSource");
const cardSearchInput = document.querySelector("#cardSearchInput");
const cardSearchStatus = document.querySelector("#cardSearchStatus");
const cardSearchResults = document.querySelector("#cardSearchResults");
const coverStage = document.querySelector("#coverStage");
const deckImageInput = document.querySelector("#deckImageInput");
const deckUploadPreview = document.querySelector("#deckUploadPreview");

function cardName(card) {
  return activeLang === "cn" ? card.nameCn : card.nameEn;
}

function cardImage(card) {
  return activeLang === "cn" ? card.cnImage : card.enImage;
}

function renderCover() {
  document.querySelector("#coverCardMain").src = cardImage(cards[0]);
  document.querySelector("#coverCardMain").alt = cardName(cards[0]);
  document.querySelector("#coverCardLeft").src = cardImage(cards[2]);
  document.querySelector("#coverCardLeft").alt = cardName(cards[2]);
  document.querySelector("#coverCardRight").src = cardImage(cards[1]);
  document.querySelector("#coverCardRight").alt = cardName(cards[1]);
}

function renderCards() {
  miniCards.innerHTML = cards
    .map(
      (card, index) => `
        <article class="mini-card ${index === activeCard ? "active" : ""}" data-index="${index}" tabindex="0">
          <img src="${escapeAttr(cardImage(card))}" alt="${escapeAttr(cardName(card))}" loading="lazy">
          <div class="mini-name" data-field="name" contenteditable="true" aria-label="核心卡名称">${escapeHtml(cardName(card))}</div>
          <div class="mini-meta" data-field="meta" contenteditable="true" aria-label="核心卡定位和张数">${escapeHtml(`${card.role} · ${card.count}`)}</div>
        </article>
      `,
    )
    .join("");
}

function showCard(index) {
  activeCard = index;
  const card = cards[index];
  focusImage.src = cardImage(card);
  focusImage.alt = cardName(card);
  keyCardName.textContent = cardName(card);
  keyRole.textContent = card.role;
  keyCost.textContent = card.stage;
  keyCount.textContent = card.count;
  keyDescription.value = card.description;
  renderCards();
}

function renderSearchOptions() {
  searchCardSelect.innerHTML = cards
    .map((card, index) => `<option value="${index}">${escapeHtml(card.nameCn)} / ${escapeHtml(card.nameEn)}</option>`)
    .join("");
  searchCardSelect.value = String(activeCard);
}

function renderRatings() {
  ratings.innerHTML = ratingDefaults
    .map(
      ([label, value]) => `
        <div class="rating-row">
          <strong>${label}</strong>
          <input type="range" min="0" max="10" step="0.1" value="${value}" aria-label="${label}">
          <output>${value.toFixed(1)}</output>
        </div>
      `,
    )
    .join("");
}

function scoreToTier(score) {
  if (score >= 8.6) return ["S", "S级推荐"];
  if (score >= 7.2) return ["A", "A级推荐"];
  if (score >= 5.6) return ["B", "B级可用"];
  if (score >= 4.0) return ["C", "C级娱乐"];
  return ["D", "D级待调"];
}

function updateScore() {
  const inputs = [...ratings.querySelectorAll("input")];
  const average = inputs.reduce((sum, input) => sum + Number(input.value), 0) / inputs.length;
  const [tier, label] = scoreToTier(average);

  inputs.forEach((input) => {
    input.nextElementSibling.textContent = Number(input.value).toFixed(1);
  });

  avgScore.textContent = average.toFixed(1);
  tierText.textContent = stampGenerated ? tier : "-";
  if (!stampText.dataset.touched) stampText.value = label;
  if (stampGenerated) {
    stampLabel.textContent = stampText.value;
  }
}

function hideStampUntilGenerated() {
  stampGenerated = false;
  stamp.classList.add("stamp-hidden");
  stamp.classList.remove("stamp-stamping");
  tierText.textContent = "-";
}

function generateStamp() {
  stampGenerated = true;
  updateScore();
  stampLabel.textContent = stampText.value || "已评分";
  stamp.classList.remove("stamp-hidden");
  stamp.classList.remove("stamp-stamping");
  void stamp.offsetWidth;
  stamp.classList.add("stamp-stamping");
}

function applyCardImage(index, payload) {
  const card = cards[index];
  if (payload.source === "cryst") {
    card.nameCn = payload.name || card.nameCn;
    card.cnImage = payload.image;
    activeLang = "cn";
  } else {
    card.nameEn = payload.name || card.nameEn;
    card.enImage = payload.image;
    activeLang = "en";
  }
  updateLanguageButtons();
  renderCover();
  showCard(index);
  renderSearchOptions();
}

async function searchCrystCards(query) {
  setSearchStatus("正在搜索简中卡库...");
  try {
    const response = await fetch("https://tcg.mik.moe/api/v3/card/card-basic-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchText: query, exact: false, unique: false, page: 1, pageSize: 15 }),
    });
    const payload = await response.json();
    const found = Array.isArray(payload?.data?.list) ? payload.data.list : [];
    renderSearchResults(
      found.map((item) => ({
        source: "cryst",
        name: item.cardName,
        meta: `${item.setCode} ${item.cardIndex} ${item.rarity || ""}`,
        image: crystImageUrl(item),
      })),
    );
  } catch (error) {
    console.error(error);
    setSearchStatus("简中卡库连接失败，可以稍后再试");
  }
}

function searchLimitlessCards(query) {
  setSearchStatus("正在搜索英文卡库...");
  limitlessPendingSearch = { query };
  ensureLimitlessSocket((data) => {
    if (!limitlessPendingSearch || limitlessPendingSearch.query !== query) return;
    const found = Array.isArray(data.cards) ? data.cards.slice(0, 15) : [];
    renderSearchResults(
      found.map((item) => ({
        source: "limitless",
        name: item.name,
        meta: `${item.set} ${item.number}`,
        image: cardImageUrl(item, "sm"),
        fullImage: cardImageUrl(item),
      })),
    );
  });
}

function renderSearchResults(results) {
  if (!results.length) {
    setSearchStatus("没有找到结果");
    cardSearchResults.innerHTML = "";
    return;
  }
  setSearchStatus(`找到 ${results.length} 张，点击即可应用到当前卡位`);
  cardSearchResults.innerHTML = results
    .map(
      (item, index) => `
        <button class="search-card" type="button" data-index="${index}">
          <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.name)}" loading="lazy">
          <span>${escapeHtml(item.name)}</span>
          <small>${escapeHtml(item.meta)}</small>
        </button>
      `,
    )
    .join("");
  cardSearchResults.querySelectorAll(".search-card").forEach((button) => {
    button.addEventListener("click", () => {
      const item = results[Number(button.dataset.index)];
      applyCardImage(Number(searchCardSelect.value), { ...item, image: item.fullImage || item.image });
      searchDialog.close();
    });
  });
}

function ensureLimitlessSocket(onMessage) {
  const onError = () => setSearchStatus("英文卡库连接失败，可以稍后再试");
  if (!limitlessSocket || limitlessSocket.readyState === WebSocket.CLOSED || limitlessSocket.readyState === WebSocket.CLOSING) {
    limitlessSocketReady = false;
    limitlessSocket = new WebSocket("wss://mew.limitlesstcg.com", "search");
    limitlessSocket.addEventListener("open", () => {
      limitlessSocketReady = true;
      sendLimitlessSearch();
    });
    limitlessSocket.addEventListener("message", (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch (error) {
        onError(error);
      }
    });
    limitlessSocket.addEventListener("error", onError);
  } else {
    limitlessSocket.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch (error) {
        onError(error);
      }
    };
  }
  if (limitlessSocketReady) sendLimitlessSearch();
}

function sendLimitlessSearch() {
  if (!limitlessSocketReady || !limitlessPendingSearch) return;
  limitlessSocket.send(JSON.stringify({ category: "cards", input: limitlessPendingSearch.query, lang: "en" }));
}

function runSearch() {
  const query = cardSearchInput.value.trim();
  if (!query) return;
  cardSearchResults.innerHTML = "";
  if (cardSearchSource.value === "cryst") {
    searchCrystCards(query);
    return;
  }
  searchLimitlessCards(query);
}

function setSearchStatus(text) {
  cardSearchStatus.textContent = text;
}

function crystImageUrl(item) {
  return `https://tcg.mik.moe/static/img/${item.setCode}/${item.cardIndex}.png`;
}

function cardImageUrl(item, size = null) {
  if (isOldInternationalSet(item)) return oldCardImageUrl(item, size);
  const isInternational = item.language !== "jp" && !item.translation;
  const owner = isInternational ? "tpci" : "tpc";
  const lang = isInternational ? item.language : "JP";
  const number = isInternational
    ? String(item.number).replace(/^(\d{1,2})(a|b)?$/, (_, digits, suffix) => `${digits.padStart(3, "0")}${suffix || ""}`)
    : item.number;
  const suffix = `R_${lang}${size ? `_${size}` : ""}`.toUpperCase();
  return `https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/${owner}/${item.set}/${item.set}_${number}_${suffix}.png`;
}

function isOldInternationalSet(item) {
  return (item.region || (item.language === "jp" || item.translation ? "tpc" : "int")) === "int" && item.set in oldSetMap;
}

function oldCardImageUrl(item, size) {
  let number = item.number;
  if (item.set === "DPP") number = `DP${String(number).padStart(2, "0")}`;
  if (number === "?") number = "question";
  if (size !== "xs" && size !== "sm") number += "_hires";
  return `https://images.pokemontcg.io/${oldSetMap[item.set]}/${number}.png`;
}

function updateLanguageButtons() {
  document.querySelectorAll(".lang-toggle button").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === activeLang);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}

function applyDeckImage(file) {
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    deckUploadPreview.src = reader.result;
    coverStage.classList.add("has-upload");
  });
  reader.readAsDataURL(file);
}

miniCards.addEventListener("click", (event) => {
  const cardButton = event.target.closest(".mini-card");
  if (!cardButton) return;
  if (event.target.matches("[contenteditable='true']")) return;
  showCard(Number(cardButton.dataset.index));
});

miniCards.addEventListener("input", (event) => {
  const editable = event.target;
  const cardItem = editable.closest(".mini-card");
  if (!cardItem || !editable.matches("[contenteditable='true']")) return;

  const index = Number(cardItem.dataset.index);
  const card = cards[index];
  const value = editable.textContent.trim();
  if (editable.dataset.field === "name") {
    if (activeLang === "cn") {
      card.nameCn = value;
    } else {
      card.nameEn = value;
    }
  } else {
    const [role, count] = value.split("·").map((part) => part.trim());
    card.role = role || card.role;
    card.count = count || "";
  }

  if (index === activeCard) {
    keyCardName.textContent = cardName(card);
    keyRole.textContent = card.role;
    keyCount.textContent = card.count;
  }
});

document.querySelector(".focus-card").addEventListener("input", (event) => {
  const card = cards[activeCard];
  if (event.target === keyCardName) {
    if (activeLang === "cn") {
      card.nameCn = keyCardName.textContent.trim();
    } else {
      card.nameEn = keyCardName.textContent.trim();
    }
  }
  if (event.target === keyRole) card.role = keyRole.textContent.trim();
  if (event.target === keyCost) card.stage = keyCost.textContent.trim();
  if (event.target === keyCount) card.count = keyCount.textContent.trim();
  renderCards();
});

miniCards.addEventListener("focusin", (event) => {
  const cardItem = event.target.closest(".mini-card");
  if (!cardItem) return;
  document.querySelectorAll(".mini-card").forEach((item) => item.classList.remove("active"));
  cardItem.classList.add("active");
  activeCard = Number(cardItem.dataset.index);
});

ratings.addEventListener("input", () => {
  hideStampUntilGenerated();
  updateScore();
});

stampText.addEventListener("input", () => {
  stampText.dataset.touched = "true";
  if (stampGenerated) {
    stampLabel.textContent = stampText.value || "已评分";
  }
});

generateStampBtn.addEventListener("click", generateStamp);

document.querySelectorAll(".lang-toggle button").forEach((button) => {
  button.addEventListener("click", () => {
    activeLang = button.dataset.lang;
    updateLanguageButtons();
    renderCover();
    showCard(activeCard);
  });
});

document.querySelector("#openSearchBtn").addEventListener("click", () => {
  renderSearchOptions();
  cardSearchInput.value = activeLang === "cn" ? cards[activeCard].nameCn : cards[activeCard].nameEn;
  cardSearchSource.value = activeLang === "cn" ? "cryst" : "limitless";
  setSearchStatus("选择来源后搜索，点击结果即可替换卡图。");
  cardSearchResults.innerHTML = "";
  searchDialog.showModal();
});

cardSearchSource.addEventListener("change", () => {
  cardSearchInput.placeholder = cardSearchSource.value === "cryst" ? "例如 多龙巴鲁托 / 皮卡丘" : "例如 Dragapult / Pikachu";
});

cardSearchBtn.addEventListener("click", runSearch);

cardSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") runSearch();
});

coverStage.addEventListener("click", () => {
  deckImageInput.click();
});

coverStage.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  deckImageInput.click();
});

deckImageInput.addEventListener("change", () => {
  applyDeckImage(deckImageInput.files?.[0]);
});

renderRatings();
renderCover();
renderCards();
renderSearchOptions();
showCard(0);
updateScore();

if (window.lucide) window.lucide.createIcons();
