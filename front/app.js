const LANGUAGE_SAMPLES = [
  {
    expression: "break the ice",
    type: "영어 숙어",
    meaning: "어색한 분위기를 풀거나 처음 만난 사람들 사이의 긴장을 누그러뜨리다.",
    breakdown: "break(깨다) + the ice(얼음): 딱딱하게 얼어붙은 분위기를 깨는 이미지",
    example: "A quick joke helped break the ice at the meeting.",
    memoryPoint: "실제 얼음이 아니라 어색한 침묵이나 긴장을 깬다는 비유로 기억하세요.",
    accuracy: 61,
    status: "다시 볼 표현",
  },
  {
    expression: "눈치가 빠르다",
    type: "한국어 관용 표현",
    meaning: "상황이나 사람의 마음을 말하지 않아도 빨리 알아차리다.",
    breakdown: "눈치(상황을 읽는 감각) + 빠르다(반응이 빠름)",
    example: "그는 눈치가 빨라서 분위기가 어색해지기 전에 화제를 바꿨어요.",
    memoryPoint: "단순히 시력이 좋다는 뜻이 아니라 분위기와 의도를 빨리 읽는다는 뜻이에요.",
    accuracy: 78,
    status: "안정권",
  },
  {
    expression: "take it for granted",
    type: "영어 숙어",
    meaning: "무언가를 당연하게 여기거나 고마움을 잊다.",
    breakdown: "take A for granted: A를 이미 주어진 것처럼 받아들이다",
    example: "Don't take your friends' support for granted.",
    memoryPoint: "감사해야 할 것을 당연한 권리처럼 여기는 뉘앙스를 함께 기억하세요.",
    accuracy: 0,
    status: "오늘 추가",
  },
  {
    expression: "가는 말이 고와야 오는 말이 곱다",
    type: "한국어 속담",
    meaning: "내가 먼저 좋게 말해야 상대도 좋게 대한다는 뜻.",
    breakdown: "가는 말(내가 하는 말) + 오는 말(상대가 돌려주는 말)",
    example: "회의에서 가는 말이 고와야 오는 말이 곱다는 생각으로 부드럽게 말했어요.",
    memoryPoint: "말투는 되돌아온다는 상호성의 이미지로 기억하세요.",
    accuracy: 44,
    status: "다시 볼 표현",
  },
  {
    expression: "spill the beans",
    type: "영어 숙어",
    meaning: "비밀을 실수로 말하거나 폭로하다.",
    breakdown: "spill(쏟다) + beans(콩): 숨겨둔 것을 쏟아 버리는 이미지",
    example: "Please don't spill the beans about the surprise party.",
    memoryPoint: "콩을 쏟듯이 비밀이 밖으로 새어 나온다는 장면을 떠올리세요.",
    accuracy: 0,
    status: "추천 표현",
  },
  {
    expression: "손이 크다",
    type: "한국어 관용 표현",
    meaning: "음식이나 물건을 넉넉하게 준비하거나 돈을 아끼지 않고 쓰다.",
    breakdown: "손(베푸는 규모) + 크다(크고 넉넉함)",
    example: "할머니는 손이 커서 늘 음식을 많이 준비하세요.",
    memoryPoint: "실제 손 크기가 아니라 베푸는 양과 씀씀이가 크다는 뜻이에요.",
    accuracy: 0,
    status: "추천 표현",
  },
];

const state = {
  activePanel: "home",
  pendingLookup: null,
  pendingReminderTimes: [],
  selectedVocabularyKeys: new Set(),
  isSearching: false,
  activeLookupRequestId: 0,
  reminders: [],
  memories: LANGUAGE_SAMPLES.slice(0, 4).map((sample, index) =>
    createLanguageMemory(sample, { id: `m${index + 1}` }),
  ),
  quizSession: null,
};

const reminderTimers = new Map();
const DEFAULT_QUIZ_COUNT = 5;
const MAX_QUESTIONS_PER_SESSION = 50;
const MOCK_LEARNING_LATENCY_MS = 650;
const SEARCH_LOADING_TEXT = "확인 중";
const SEARCH_IDLE_TEXT = "묻기";
const SEARCH_HOME_PLACEHOLDER = "예) irritating은 어떤 느낌이야?";
const SEARCH_THREAD_PLACEHOLDER = "이어서 궁금한 점을 물어보세요";
const LOOKUP_LOADING_COPY = "답변을 차분히 확인하고 있어요.";
const LOOKUP_RETRY_MESSAGE = "뜻을 확인하는 중에 잠깐 문제가 있었어요. 질문은 위에 남겨뒀으니 다시 보내거나 조금 바꿔서 시도해 주세요.";

const els = {
  navItems: Array.from(document.querySelectorAll(".nav-item")),
  bottomNav: document.querySelector(".bottom-nav"),
  panels: Array.from(document.querySelectorAll(".panel")),
  notice: document.querySelector("#app-notice"),
  manualLink: document.querySelector("#manual-link"),
  manualHome: document.querySelector("#manual-home"),
  askForm: document.querySelector("#ask-form"),
  askInput: document.querySelector("#ask-input"),
  askSubmit: document.querySelector("#ask-submit"),
  askSubmitLabel: document.querySelector("#ask-submit-label"),
  askStatus: document.querySelector("#ask-status"),
  promptChips: Array.from(document.querySelectorAll(".prompt-chip")),
  lookupResult: document.querySelector("#lookup-result"),
  lookupLoading: document.querySelector("#lookup-loading"),
  loadingCopy: document.querySelector("#loading-copy"),
  lookupTerm: document.querySelector("#lookup-term"),
  lookupType: document.querySelector("#lookup-type"),
  lookupMeaning: document.querySelector("#lookup-meaning"),
  lookupBreakdown: document.querySelector("#lookup-breakdown"),
  lookupExample: document.querySelector("#lookup-example"),
  lookupConversation: document.querySelector("#lookup-conversation"),
  lookupUserBubble: document.querySelector("#lookup-user-bubble"),
  lookupUserMessage: document.querySelector("#lookup-user-message"),
  lookupAssistantBubble: document.querySelector("#lookup-assistant-bubble"),
  lookupAnswer: document.querySelector("#lookup-answer"),
  vocabularySection: document.querySelector("#vocabulary-section"),
  vocabularyList: document.querySelector("#vocabulary-list"),
  vocabularyHelper: document.querySelector("#vocabulary-helper"),
  memoryPoint: document.querySelector("#memory-point"),
  saveLookup: document.querySelector("#save-lookup"),
  manualForm: document.querySelector("#manual-form"),
  manualInput: document.querySelector("#manual-expression"),
  reminderList: document.querySelector("#reminder-list"),
  reminderFormToggle: document.querySelector("#reminder-form-toggle"),
  reminderForm: document.querySelector("#reminder-form"),
  reminderTime: document.querySelector("#reminder-time"),
  reminderTimeAdd: document.querySelector("#reminder-time-add"),
  reminderPack: document.querySelector("#reminder-pack"),
  reminderSubmit: document.querySelector("#reminder-submit"),
  notificationPermissionCard: document.querySelector("#notification-permission-card"),
  notificationPermissionCopy: document.querySelector("#notification-permission-copy"),
  notificationPermission: document.querySelector("#notification-permission"),
  pendingTimeList: document.querySelector("#pending-time-list"),
  selectedTimeCount: document.querySelector("#selected-time-count"),
  memoryList: document.querySelector("#memory-list"),
  startQuiz: document.querySelector("#start-quiz"),
  quizIntro: document.querySelector("#quiz-intro"),
  quizCard: document.querySelector("#quiz-card"),
  quizDone: document.querySelector("#quiz-done"),
  quizProgress: document.querySelector("#quiz-progress"),
  quizQuestion: document.querySelector("#quiz-question"),
  quizChoices: document.querySelector("#quiz-choices"),
  quizFeedback: document.querySelector("#quiz-feedback"),
  quizNext: document.querySelector("#quiz-next"),
  quizResultCopy: document.querySelector("#quiz-result-copy"),
  quizRestart: document.querySelector("#quiz-restart"),
};

function normalizeExpression(expression) {
  return String(expression || "").trim().replace(/\s+/g, " ");
}

function normalizeKey(expression) {
  return normalizeExpression(expression).toLowerCase();
}

function containsKorean(expression) {
  return /[가-힣]/.test(expression);
}

function containsEnglish(expression) {
  return /[a-z]/i.test(expression);
}

function findLanguageSample(expression) {
  const key = normalizeKey(expression);
  return LANGUAGE_SAMPLES.find((sample) => normalizeKey(sample.expression) === key);
}

function inferLanguageType(expression) {
  const normalized = normalizeExpression(expression);
  const wordCount = normalized.split(" ").filter(Boolean).length;
  if (containsKorean(normalized)) {
    return normalized.length >= 14 || /[.!?]$/.test(normalized) ? "한국어 문장" : "한국어 표현";
  }
  if (containsEnglish(normalized)) {
    return wordCount >= 2 ? "영어 숙어/문장" : "영어 단어";
  }
  return "언어 표현";
}

function buildMemoryMeaning(expression) {
  const sample = findLanguageSample(expression);
  if (sample) {
    return sample.meaning;
  }
  return `"${normalizeExpression(expression)}"의 뜻과 쓰임을 복습할 표현으로 저장했어요.`;
}

function buildMemoryBreakdown(expression) {
  const sample = findLanguageSample(expression);
  if (sample) {
    return sample.breakdown;
  }
  const normalized = normalizeExpression(expression);
  if (containsEnglish(normalized)) {
    return "단어 조합, 전치사, 함께 쓰이는 상황을 나눠서 확인해 보세요.";
  }
  if (containsKorean(normalized)) {
    return "직역보다 말하는 상황, 뉘앙스, 함께 쓰는 표현을 묶어 보세요.";
  }
  return "표현의 뜻, 쓰임, 예문을 한 카드에 묶어 복습해 보세요.";
}

function buildMemoryExample(expression) {
  const sample = findLanguageSample(expression);
  if (sample) {
    return sample.example;
  }
  const normalized = normalizeExpression(expression);
  if (containsEnglish(normalized)) {
    return `Try using "${normalized}" in one short sentence today.`;
  }
  return `오늘 배운 표현 "${normalized}"을 상황에 맞게 한 문장으로 말해 보세요.`;
}

function buildMemoryPoint(expression) {
  const sample = findLanguageSample(expression);
  if (sample) {
    return sample.memoryPoint;
  }
  const normalized = normalizeExpression(expression);
  if (containsEnglish(normalized)) {
    return "뜻만 외우지 말고 같이 붙는 단어와 실제로 쓰는 상황을 함께 기억하세요.";
  }
  if (containsKorean(normalized)) {
    return "직역보다 어떤 분위기와 관계에서 쓰는 말인지 먼저 떠올리세요.";
  }
  return "뜻, 예문, 헷갈리는 포인트를 한 줄로 묶어 기억하세요.";
}

function createLanguageMemory(source, overrides = {}) {
  const expression = normalizeExpression(source.expression);
  const meaning = source.meaning || buildMemoryMeaning(expression);
  const memoryPoint = source.memoryPoint || buildMemoryPoint(expression);
  return {
    id: overrides.id || `m${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    expression,
    type: source.type || inferLanguageType(expression),
    meaning,
    summary: source.summary || meaning,
    breakdown: source.breakdown || buildMemoryBreakdown(expression),
    example: source.example || buildMemoryExample(expression),
    memoryPoint,
    accuracy: overrides.accuracy ?? source.accuracy ?? 0,
    reviewCount:
      overrides.reviewCount
      ?? source.reviewCount
      ?? (typeof source.accuracy === "number" && source.accuracy > 0 ? 1 : 0),
    status: overrides.status || source.status || "오늘 추가",
  };
}

const MOCK_LEARNING_RESPONSES = new Map([
  [
    normalizeKey("We all find him irritating 이게 무슨뜻이야"),
    `1. 핵심 의미와 뉘앙스 (The Core)

의역 중심의 해석: "우리 모두 걔가 좀 거슬린다고 생각해." / "우리 다들 걔 때문에 피곤해해."

숨은 의도: 이 표현은 단순히 그 사람이 나쁘다는 뜻이 아니라, 그의 행동이나 말투가 반복적으로 신경을 긁는다는 공통된 불만을 드러낼 때
씁니다. "나만 그렇게 느끼는 게 아니었어"라는 동질감을 형성하거나, 특정 인물의 평판을 객관적으로 전달하려는 뉘앙스가 강합니다.

2. 문장 구조와 문법 포인트 (The Grammar)

공식화: Subject (We all) + find (동사) + object (him) + adjective (irritating)

  - Find의 용법: '찾다'라는 물리적 행위가 아니라, **'~라고 생각하다/여기다'**라는 주관적 의견을 나타냅니다.
  - -ing vs -ed: 'Irritating'은 그 사람이 짜증을 유발하는 존재임을 뜻합니다. 만약 'We are irritated'라고
    하면 우리가 짜증을 느끼는 상태가 됩니다.

Grammar Audit: 'We all find' 뒤에 목적어(him)가 빠지지 않도록 주의하세요. 또한 'all'의 위치는 주어 뒤 혹은
일반동사 앞이 가장 자연스럽습니다.

3. 실전 응용 및 교정 (Refining & Practice)

  - Before: We all think he is bad. (너무 단순하고 모호함)
  - After: "We all find him irritating." (훨씬 세련된 표현)
  - Alternative Suggestions:
      - 비즈니스 환경: "His behavior is a bit distracting to the team." (그의 행동이 팀에 방해가
        됩니다.)
      - 더 강한 표현: "He really gets on everyone's nerves." (그는 정말 모두의 신경을 건드려요.)

{
  "vocabulary_list": [
    {
      "word": "find",
      "meaning": "~라고 생각하다, 여기다 (의견 형성)",
      "example": "I find this task challenging."
    },
    {
      "word": "irritating",
      "meaning": "짜증 나게 하는, 거슬리는",
      "example": "The noise is very irritating."
    }
  ],
  "quizzes": [
    {
      "type": "multiple_choice",
      "question": "다음 중 'I find this movie boring'의 올바른 해석은?",
      "options": [
        "1. 나는 이 영화가 지루하다는 것을 알아냈다.",
        "2. 나는 이 영화가 지루하다고 생각한다.",
        "3. 나는 지루한 영화를 찾고 있다."
      ],
      "answer": 2,
      "explanation": "이 문맥에서 find는 '찾다'가 아니라 목적어의 상태에 대한 '주관적인 의견'을 나타내므로 2번이 정답입니다. 1번은 discover에 가깝고, 3번은 look for의 의미입니다."
    },
    {
      "type": "ox",
      "question": "그가 나를 짜증나게 할 때, 'He is irritated'라고 표현하는 것이 문법적으로 옳다.",
      "answer": "X",
      "explanation": "그가 짜증을 '유발하는' 주체일 때는 현재분사인 'irritating'을 써야 합니다. 'He is irritated'는 그 사람이 누군가에 의해 짜증이 난 상태임을 의미합니다."
    }
  ]
}`,
  ],
]);

function hasVocabularyListKey(text) {
  return /"vocabulary_list"\s*:/.test(text);
}

function findMatchingJsonBrace(text, openIndex) {
  let depth = 0;
  let isInString = false;
  let isEscaped = false;

  for (let index = openIndex; index < text.length; index += 1) {
    const char = text[index];

    if (isInString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === "\\") {
        isEscaped = true;
      } else if (char === "\"") {
        isInString = false;
      }
      continue;
    }

    if (char === "\"") {
      isInString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function findFencedJsonCandidate(text) {
  const fencePattern = /```(?:json)?\s*([\s\S]*?)```/gi;
  let match = fencePattern.exec(text);

  while (match) {
    const jsonText = match[1].trim();
    if (hasVocabularyListKey(jsonText)) {
      return {
        jsonText,
        start: match.index,
        end: match.index + match[0].length,
      };
    }
    match = fencePattern.exec(text);
  }

  return null;
}

function findRawJsonCandidate(text) {
  let start = text.indexOf("{");

  while (start >= 0) {
    const matchingBrace = findMatchingJsonBrace(text, start);

    if (matchingBrace >= 0) {
      const jsonText = text.slice(start, matchingBrace + 1);
      if (hasVocabularyListKey(jsonText)) {
        return {
          jsonText,
          start,
          end: matchingBrace + 1,
        };
      }
    }

    start = text.indexOf("{", start + 1);
  }

  return null;
}

function getAnswerTextWithoutJson(text, candidate) {
  const before = text.slice(0, candidate.start).trim();
  const after = text.slice(candidate.end).trim();
  const answerText = [before, after].filter(Boolean).join("\n\n").trim();
  return answerText || text.trim();
}

function normalizeVocabularyItem(item, index) {
  const source = item && typeof item === "object" ? item : { word: item };
  const word = normalizeExpression(
    source.word
      || source.expression
      || source.term
      || source.phrase
      || source.vocabulary
      || "",
  );

  if (!word) {
    return null;
  }

  const meaning = String(
    source.meaning
      || source.definition
      || source.explanation
      || source.translation
      || "",
  ).trim();
  const memoryPoint = String(
    source.memoryPoint
      || source.memory_point
      || source.tip
      || source.note
      || meaning
      || "",
  ).trim();
  const example = String(
    source.example
      || source.example_sentence
      || source.sentence
      || "",
  ).trim();
  const key = `vocab-${index}-${normalizeKey(word) || "item"}`;

  return {
    ...source,
    key,
    word,
    expression: word,
    type: source.type || inferLanguageType(word),
    meaning,
    memoryPoint,
    example,
    breakdown: source.breakdown || source.structure || memoryPoint,
  };
}

function normalizeVocabularyList(vocabularyList) {
  if (!Array.isArray(vocabularyList)) {
    return [];
  }
  return vocabularyList
    .map((item, index) => normalizeVocabularyItem(item, index))
    .filter(Boolean);
}

function parseLearningResponse(rawText) {
  const raw = String(rawText || "").trim();

  if (!raw) {
    return {
      answerText: "",
      vocabularyList: [],
      quizzes: [],
      parseError: null,
    };
  }

  const candidates = [findFencedJsonCandidate(raw), findRawJsonCandidate(raw)].filter(Boolean);

  if (candidates.length === 0) {
    return {
      answerText: raw,
      vocabularyList: [],
      quizzes: [],
      parseError: null,
    };
  }

  let firstError = null;
  let firstCandidate = candidates[0];

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate.jsonText);
      return {
        answerText: getAnswerTextWithoutJson(raw, candidate),
        vocabularyList: normalizeVocabularyList(parsed.vocabulary_list),
        quizzes: Array.isArray(parsed.quizzes) ? parsed.quizzes : [],
        parseError: null,
      };
    } catch (error) {
      firstError = firstError || error;
      firstCandidate = firstCandidate || candidate;
    }
  }

  return {
    answerText: getAnswerTextWithoutJson(raw, firstCandidate),
    vocabularyList: [],
    quizzes: [],
    parseError: firstError ? firstError.message : "JSON을 읽을 수 없어요.",
  };
}

function getMockLearningResponse(expression) {
  return MOCK_LEARNING_RESPONSES.get(normalizeKey(expression)) || "";
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function createFallbackLookupMemory(expression) {
  const normalized = normalizeExpression(expression);
  const sample = findLanguageSample(normalized);
  return sample
    ? createLanguageMemory(sample, { id: `lookup-${Date.now()}` })
    : createLanguageMemory(
      {
        expression: normalized,
        type: inferLanguageType(normalized),
        meaning: buildMemoryMeaning(normalized),
        breakdown: buildMemoryBreakdown(normalized),
        example: buildMemoryExample(normalized),
        memoryPoint: buildMemoryPoint(normalized),
      },
      { id: `lookup-${Date.now()}` },
    );
}

function buildFallbackAnswerText(result) {
  return `${result.expression}은(는) ${result.meaning}

1. 표현 포인트
- ${result.breakdown}

2. 예문
- ${result.example}

3. 헷갈리기 쉬운 부분
- ${result.memoryPoint}`;
}

async function requestLearningResponse(expression) {
  const normalized = normalizeExpression(expression);
  await wait(MOCK_LEARNING_LATENCY_MS);

  const mockLearningResponse = getMockLearningResponse(normalized);
  if (mockLearningResponse) {
    return mockLearningResponse;
  }

  return buildFallbackAnswerText(createFallbackLookupMemory(normalized));
}

function createLookupResult(expression, rawLearningResponse = null) {
  const normalized = normalizeExpression(expression);
  const fallbackResult = createFallbackLookupMemory(normalized);
  const responseText = rawLearningResponse
    ?? (getMockLearningResponse(normalized) || buildFallbackAnswerText(fallbackResult));
  const parsedResponse = parseLearningResponse(responseText);
  const primaryVocabulary = parsedResponse.vocabularyList[0];

  return {
    ...fallbackResult,
    query: normalized,
    expression: normalized,
    meaning: primaryVocabulary?.meaning || fallbackResult.meaning,
    breakdown: primaryVocabulary?.breakdown || fallbackResult.breakdown,
    example: primaryVocabulary?.example || fallbackResult.example,
    memoryPoint: primaryVocabulary?.memoryPoint || fallbackResult.memoryPoint,
    answerText: parsedResponse.answerText || buildFallbackAnswerText(fallbackResult),
    vocabularyList: parsedResponse.vocabularyList,
    quizzes: parsedResponse.quizzes,
    parseError: parsedResponse.parseError,
  };
}

function setElementText(element, value) {
  if (!element) {
    return;
  }
  element.textContent = value || "";
}

function setFieldValue(element, value) {
  if (!element) {
    return;
  }
  if ("value" in element) {
    element.value = value || "";
    return;
  }
  element.textContent = value || "";
}

function readFieldValue(element) {
  if (!element) {
    return "";
  }
  if ("value" in element) {
    return element.value.trim();
  }
  return element.textContent.trim();
}

function getSearchSubmitTextTarget() {
  refreshLookupDomReferences();
  return els.askSubmitLabel || els.askSubmit || null;
}

function setSearchSubmitText(isSearching) {
  const target = getSearchSubmitTextTarget();
  if (!target) {
    return;
  }
  target.textContent = isSearching ? SEARCH_LOADING_TEXT : SEARCH_IDLE_TEXT;
}

function setOptionalElementVisible(element, isVisible) {
  if (!element) {
    return;
  }
  element.hidden = !isVisible;
  element.classList.toggle("is-hidden", !isVisible);
}

function setLookupLoadingVisible(isVisible) {
  refreshLookupDomReferences();

  if (els.lookupLoading) {
    els.lookupLoading.setAttribute("aria-live", "polite");
    els.lookupLoading.setAttribute("aria-busy", String(isVisible));
    setOptionalElementVisible(els.lookupLoading, isVisible);

    if (
      isVisible
      && els.lookupAssistantBubble
      && els.lookupAssistantBubble.contains(els.lookupLoading)
    ) {
      els.lookupAssistantBubble.hidden = false;
      els.lookupAssistantBubble.classList.remove("is-hidden");
    }
  }

  if (els.loadingCopy && isVisible) {
    els.loadingCopy.textContent = LOOKUP_LOADING_COPY;
  }
}

function setSearchStatus(message) {
  refreshLookupDomReferences();
  if (!els.askStatus) {
    return;
  }
  els.askStatus.setAttribute("role", "status");
  els.askStatus.setAttribute("aria-live", "polite");
  els.askStatus.textContent = message || "";
}

function resizeAskComposer() {
  if (!els.askInput || els.askInput.tagName !== "TEXTAREA") {
    return;
  }

  els.askInput.style.height = "auto";
  els.askInput.style.height = `${Math.min(els.askInput.scrollHeight, 128)}px`;
}

function setSearchLoadingState(isSearching) {
  state.isSearching = isSearching;
  refreshLookupDomReferences();

  document.body.classList.toggle("is-searching", isSearching);
  els.askForm?.classList.toggle("is-searching", isSearching);
  els.lookupResult?.classList.toggle("is-searching", isSearching);

  if (els.askInput) {
    els.askInput.disabled = isSearching;
    els.askInput.setAttribute("aria-busy", String(isSearching));
  }
  if (els.askSubmit) {
    els.askSubmit.disabled = isSearching;
    els.askSubmit.setAttribute("aria-busy", String(isSearching));
  }
  if (els.memoryPoint) {
    els.memoryPoint.disabled = isSearching || !state.pendingLookup;
  }

  setSearchSubmitText(isSearching);
  setLookupLoadingVisible(isSearching);
  if (isSearching) {
    setSearchStatus(LOOKUP_LOADING_COPY);
  } else if (els.askStatus?.textContent === LOOKUP_LOADING_COPY) {
    setSearchStatus("");
  }
  updateSaveLookupButton();
}

function setLookupVisible(isVisible) {
  refreshLookupDomReferences();
  document.body.classList.toggle("has-lookup-thread", isVisible);
  els.askForm?.classList.toggle("has-lookup-thread", isVisible);
  if (els.askInput) {
    els.askInput.placeholder = isVisible ? SEARCH_THREAD_PLACEHOLDER : SEARCH_HOME_PLACEHOLDER;
  }

  if (!els.lookupResult) {
    return;
  }
  els.lookupResult.hidden = !isVisible;
  els.lookupResult.classList.toggle("is-hidden", !isVisible);
  if (els.lookupConversation) {
    els.lookupConversation.hidden = !isVisible;
    els.lookupConversation.classList.toggle("is-hidden", !isVisible);
  }
}

function refreshLookupDomReferences() {
  els.askSubmit ||= document.querySelector("#ask-submit")
    || els.askForm?.querySelector("button[type='submit']");
  els.askSubmitLabel ||= document.querySelector("#ask-submit-label");
  els.askStatus ||= document.querySelector("#ask-status");
  els.lookupConversation ||= document.querySelector("#lookup-conversation");
  els.lookupLoading ||= document.querySelector("#lookup-loading")
    || document.querySelector("[data-lookup-loading]")
    || document.querySelector(".lookup-loading");
  els.loadingCopy ||= document.querySelector("#loading-copy")
    || document.querySelector("[data-loading-copy]");
  els.lookupUserBubble ||= document.querySelector("#lookup-user-bubble");
  els.lookupUserMessage ||= document.querySelector("#lookup-user-message");
  els.lookupAssistantBubble ||= document.querySelector("#lookup-assistant-bubble");
  els.lookupAnswer ||= document.querySelector("#lookup-answer");
  els.vocabularySection ||= document.querySelector("#vocabulary-section");
  els.vocabularyList ||= document.querySelector("#vocabulary-list");
  els.vocabularyHelper ||= document.querySelector("#vocabulary-helper");
}

function getLookupCard() {
  if (!els.lookupResult) {
    return null;
  }
  return els.lookupResult.querySelector(".lookup-card") || els.lookupResult;
}

function getLookupAnswerContainer() {
  refreshLookupDomReferences();
  if (els.lookupAssistantBubble) {
    if (els.lookupAnswer && els.lookupAssistantBubble.contains(els.lookupAnswer)) {
      return els.lookupAnswer;
    }
    return els.lookupAssistantBubble;
  }
  return els.lookupAnswer || null;
}

function ensureLookupAnswerContainer() {
  refreshLookupDomReferences();
  const existingContainer = getLookupAnswerContainer();
  if (existingContainer) {
    return existingContainer;
  }

  const card = getLookupCard();
  if (!card) {
    return null;
  }
  const container = document.createElement("div");
  container.id = "lookup-answer";
  container.className = "lookup-answer";

  if (els.lookupTerm && els.lookupTerm.parentElement === card) {
    card.insertBefore(container, els.lookupTerm.nextSibling);
  } else {
    card.prepend(container);
  }

  els.lookupAnswer = container;
  return container;
}

function setLookupPresentationClasses(result) {
  refreshLookupDomReferences();
  const vocabularyItems = getVocabularyItems(result);
  const hasAnswer = Boolean(String(result?.answerText || "").trim());
  const hasVocabulary = vocabularyItems.length > 0;
  const hasConversation = Boolean(
    els.lookupConversation
      || els.lookupUserBubble
      || els.lookupUserMessage
      || els.lookupAssistantBubble,
  );
  const targets = new Set([els.lookupResult, getLookupCard()].filter(Boolean));

  for (const target of targets) {
    target.classList.toggle("has-answer", hasAnswer);
    target.classList.toggle("has-vocabulary", hasVocabulary);
    target.classList.toggle("has-conversation", hasConversation);
  }
}

function renderLookupQuery(query) {
  refreshLookupDomReferences();
  const safeQuery = normalizeExpression(query);
  setElementText(els.lookupTerm, safeQuery);

  const userMessageTarget = els.lookupUserMessage
    || (els.lookupUserBubble && !els.lookupUserBubble.contains(els.lookupTerm)
      ? els.lookupUserBubble
      : null);

  if (userMessageTarget && userMessageTarget !== els.lookupTerm) {
    userMessageTarget.textContent = safeQuery;
  }

  if (els.lookupUserBubble) {
    els.lookupUserBubble.hidden = !safeQuery;
    els.lookupUserBubble.classList.toggle("is-hidden", !safeQuery);
  }
}

function clearLookupQuery() {
  refreshLookupDomReferences();
  setElementText(els.lookupTerm, "");

  if (els.lookupUserMessage && els.lookupUserMessage !== els.lookupTerm) {
    els.lookupUserMessage.textContent = "";
  }

  if (
    els.lookupUserBubble
    && els.lookupUserBubble !== els.lookupTerm
    && !els.lookupUserBubble.contains(els.lookupTerm)
  ) {
    els.lookupUserBubble.textContent = "";
  }

  if (els.lookupUserBubble) {
    els.lookupUserBubble.hidden = true;
    els.lookupUserBubble.classList.add("is-hidden");
  }
}

function ensureVocabularyContainers() {
  refreshLookupDomReferences();
  if (els.vocabularyList && !els.vocabularySection) {
    els.vocabularySection = els.vocabularyList.closest("#vocabulary-section")
      || els.vocabularyList.parentElement;
  }
  if (els.vocabularySection && els.vocabularyList && els.vocabularyHelper) {
    return els.vocabularySection;
  }
  if (!els.lookupResult) {
    return null;
  }

  const card = getLookupCard();
  if (!card) {
    return null;
  }

  if (!els.vocabularySection) {
    const section = document.createElement("section");
    section.id = "vocabulary-section";
    section.className = "vocabulary-section";

    const label = document.createElement("p");
    label.className = "lookup-label";
    label.textContent = "저장할 표현";
    section.append(label);

    els.vocabularySection = section;
  }

  if (!els.vocabularyHelper) {
    const helper = document.createElement("p");
    helper.id = "vocabulary-helper";
    helper.className = "vocabulary-helper";
    els.vocabularySection.append(helper);
    els.vocabularyHelper = helper;
  }

  if (!els.vocabularyList) {
    const list = document.createElement("div");
    list.id = "vocabulary-list";
    list.className = "vocabulary-list";
    els.vocabularySection.append(list);
    els.vocabularyList = list;
  }

  if (!els.vocabularySection.parentElement) {
    const memoryPointLabel = card.querySelector("label[for='memory-point']");
    card.insertBefore(els.vocabularySection, memoryPointLabel || els.memoryPoint || null);
  }

  return els.vocabularySection;
}

function clearRenderedAnswer() {
  const answerContainer = getLookupAnswerContainer();
  if (!answerContainer) {
    return;
  }
  answerContainer.replaceChildren();
  answerContainer.hidden = true;
  answerContainer.classList.add("is-hidden");

  if (els.lookupAssistantBubble && els.lookupAssistantBubble !== answerContainer) {
    els.lookupAssistantBubble.hidden = true;
    els.lookupAssistantBubble.classList.add("is-hidden");
  }
}

function appendFormattedText(parent, text) {
  const source = String(text || "");
  const boldPattern = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match = boldPattern.exec(source);

  while (match) {
    if (match.index > lastIndex) {
      parent.append(document.createTextNode(source.slice(lastIndex, match.index)));
    }

    const strong = document.createElement("strong");
    strong.textContent = match[1];
    parent.append(strong);
    lastIndex = boldPattern.lastIndex;
    match = boldPattern.exec(source);
  }

  if (lastIndex < source.length) {
    parent.append(document.createTextNode(source.slice(lastIndex)));
  }
}

function renderLookupAnswer(answerText) {
  const answerContainer = ensureLookupAnswerContainer();
  if (!answerContainer) {
    return;
  }

  const normalizedAnswer = String(answerText || "").trim();
  answerContainer.replaceChildren();
  answerContainer.hidden = !normalizedAnswer;
  answerContainer.classList.toggle("is-hidden", !normalizedAnswer);
  if (els.lookupAssistantBubble && els.lookupAssistantBubble !== answerContainer) {
    els.lookupAssistantBubble.hidden = !normalizedAnswer;
    els.lookupAssistantBubble.classList.toggle("is-hidden", !normalizedAnswer);
  }

  if (!normalizedAnswer) {
    return;
  }

  const lines = normalizedAnswer.split(/\r?\n/);
  let lastWasGap = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      if (answerContainer.childElementCount > 0 && !lastWasGap) {
        const gap = document.createElement("div");
        gap.className = "lookup-answer-gap";
        gap.setAttribute("aria-hidden", "true");
        answerContainer.append(gap);
        lastWasGap = true;
      }
      continue;
    }

    const isHeading = /^\d+[.)]\s+\S/.test(trimmedLine);
    const isBullet = /^[-*•]\s+\S/.test(trimmedLine);

    if (isHeading) {
      const heading = document.createElement("div");
      heading.className = "lookup-answer-section-title";
      appendFormattedText(heading, trimmedLine);
      answerContainer.append(heading);
      lastWasGap = false;
      continue;
    }

    if (isBullet) {
      const bullet = document.createElement("div");
      bullet.className = "lookup-answer-bullet-row";

      const marker = document.createElement("span");
      marker.className = "lookup-answer-bullet-marker";
      marker.setAttribute("aria-hidden", "true");
      marker.textContent = "•";

      const copy = document.createElement("span");
      copy.className = "lookup-answer-bullet-copy";
      appendFormattedText(copy, trimmedLine.replace(/^[-*•]\s+/, ""));

      bullet.append(marker, copy);
      answerContainer.append(bullet);
      lastWasGap = false;
      continue;
    }

    const element = document.createElement("p");
    element.className = "lookup-answer-paragraph";
    appendFormattedText(element, trimmedLine);
    answerContainer.append(element);
    lastWasGap = false;
  }
}

function getVocabularyItems(result = state.pendingLookup) {
  if (!result || !Array.isArray(result.vocabularyList)) {
    return [];
  }
  return result.vocabularyList;
}

function getSelectedVocabularyItems(result = state.pendingLookup) {
  const vocabularyItems = getVocabularyItems(result);
  if (vocabularyItems.length === 0) {
    return [];
  }

  const selectedItems = vocabularyItems.filter((item) =>
    state.selectedVocabularyKeys.has(item.key),
  );
  return selectedItems.length > 0 ? selectedItems : vocabularyItems;
}

function updateSaveLookupButton() {
  if (!els.saveLookup) {
    return;
  }

  if (state.isSearching) {
    els.saveLookup.disabled = true;
    return;
  }

  if (!state.pendingLookup) {
    els.saveLookup.disabled = true;
    els.saveLookup.textContent = "이 표현 저장";
    return;
  }

  const vocabularyItems = getVocabularyItems();
  const selectedCount = vocabularyItems.filter((item) =>
    state.selectedVocabularyKeys.has(item.key),
  ).length;

  els.saveLookup.disabled = false;
  if (vocabularyItems.length === 0) {
    els.saveLookup.textContent = "이 표현 저장";
  } else if (selectedCount === 0) {
    els.saveLookup.textContent = `전체 ${vocabularyItems.length}개 저장`;
  } else {
    els.saveLookup.textContent = `${selectedCount}개 저장`;
  }
}

function updateVocabularySelectionUi() {
  if (!els.vocabularyList) {
    updateSaveLookupButton();
    return;
  }

  const cards = Array.from(els.vocabularyList.querySelectorAll("[data-vocabulary-key]"));
  for (const card of cards) {
    const isSelected = state.selectedVocabularyKeys.has(card.dataset.vocabularyKey);
    const vocabularyLabel = card.dataset.vocabularyLabel || "표현";
    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
    card.setAttribute(
      "aria-label",
      isSelected
        ? `${vocabularyLabel} 저장 후보 선택됨`
        : `${vocabularyLabel} 저장 후보 선택`,
    );

    const status = card.querySelector(".vocabulary-card-status");
    if (status) {
      status.textContent = isSelected ? "선택됨" : "저장 후보 선택";
    }
  }

  updateSaveLookupButton();
}

function toggleVocabularySelection(key) {
  if (!key) {
    return;
  }
  if (state.selectedVocabularyKeys.has(key)) {
    state.selectedVocabularyKeys.delete(key);
  } else {
    state.selectedVocabularyKeys.add(key);
  }
  updateVocabularySelectionUi();
}

function clearRenderedVocabulary() {
  if (els.vocabularyList) {
    els.vocabularyList.replaceChildren();
  }
  if (els.vocabularyHelper) {
    els.vocabularyHelper.textContent = "";
  }
  if (els.vocabularySection) {
    els.vocabularySection.hidden = true;
    els.vocabularySection.classList.add("is-hidden");
  }
  setLookupPresentationClasses(state.pendingLookup);
}

function renderVocabularyList(result) {
  const vocabularyItems = getVocabularyItems(result);

  if (vocabularyItems.length === 0) {
    clearRenderedVocabulary();
    updateSaveLookupButton();
    return;
  }

  const vocabularySection = ensureVocabularyContainers();
  if (!vocabularySection || !els.vocabularyList) {
    updateSaveLookupButton();
    return;
  }

  vocabularySection.hidden = false;
  vocabularySection.classList.remove("is-hidden");
  els.vocabularyList.replaceChildren();

  if (els.vocabularyHelper) {
    els.vocabularyHelper.textContent = "선택하지 않으면 전체가 저장돼요.";
  }

  for (const item of vocabularyItems) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "vocabulary-card";
    card.dataset.vocabularyKey = item.key;
    card.dataset.vocabularyLabel = item.expression;
    card.setAttribute("aria-pressed", String(state.selectedVocabularyKeys.has(item.key)));
    card.setAttribute("aria-label", `${item.expression} 저장 후보 선택`);

    const word = document.createElement("strong");
    word.className = "vocabulary-word";
    word.textContent = item.expression;
    card.append(word);

    if (item.meaning) {
      const meaning = document.createElement("p");
      meaning.className = "vocabulary-meaning";
      meaning.textContent = item.meaning;
      card.append(meaning);
    }

    if (item.example) {
      const example = document.createElement("p");
      example.className = "vocabulary-example";
      example.textContent = item.example;
      card.append(example);
    }

    const status = document.createElement("span");
    status.className = "vocabulary-card-status";
    status.textContent = "저장 후보 선택";
    card.append(status);

    card.addEventListener("click", () => toggleVocabularySelection(item.key));
    els.vocabularyList.append(card);
  }

  updateVocabularySelectionUi();
}

function clearLookupDetailFields() {
  setElementText(els.lookupType, "");
  setElementText(els.lookupMeaning, "");
  setElementText(els.lookupBreakdown, "");
  setElementText(els.lookupExample, "");
  setFieldValue(els.memoryPoint, "");
}

function renderLookupLoading(query) {
  state.pendingLookup = null;
  state.selectedVocabularyKeys.clear();
  setLookupVisible(true);
  renderLookupQuery(query);
  clearRenderedAnswer();
  clearRenderedVocabulary();
  clearLookupDetailFields();
  setElementText(els.lookupType, SEARCH_LOADING_TEXT);
  if (els.memoryPoint) {
    els.memoryPoint.disabled = true;
  }
  setLookupPresentationClasses({ answerText: "", vocabularyList: [] });
  updateSaveLookupButton();
}

function renderLookupFailure(query) {
  state.pendingLookup = null;
  state.selectedVocabularyKeys.clear();
  setLookupVisible(true);
  renderLookupQuery(query);
  clearRenderedAnswer();
  clearRenderedVocabulary();
  clearLookupDetailFields();
  setElementText(els.lookupType, "다시 시도");
  if (els.memoryPoint) {
    els.memoryPoint.disabled = true;
  }
  renderLookupAnswer(LOOKUP_RETRY_MESSAGE);
  setLookupPresentationClasses({ answerText: LOOKUP_RETRY_MESSAGE, vocabularyList: [] });
  updateSaveLookupButton();
}

function renderLookupResult(result) {
  state.pendingLookup = result;
  state.selectedVocabularyKeys.clear();
  clearRenderedAnswer();
  clearRenderedVocabulary();
  renderLookupQuery(result.query || result.expression);
  setElementText(els.lookupType, result.type);
  setElementText(els.lookupMeaning, result.meaning);
  setElementText(els.lookupBreakdown, result.breakdown);
  setElementText(els.lookupExample, result.example);
  setFieldValue(els.memoryPoint, result.memoryPoint);
  if (els.memoryPoint) {
    els.memoryPoint.disabled = false;
  }
  renderLookupAnswer(result.answerText);
  renderVocabularyList(result);
  setLookupPresentationClasses(result);
  updateSaveLookupButton();
  setLookupVisible(true);
}

function clearLookupResult() {
  state.pendingLookup = null;
  state.selectedVocabularyKeys.clear();
  clearLookupQuery();
  clearRenderedAnswer();
  clearRenderedVocabulary();
  clearLookupDetailFields();
  setLookupLoadingVisible(false);
  setSearchStatus("");
  if (els.memoryPoint) {
    els.memoryPoint.disabled = true;
  }
  setLookupPresentationClasses(null);
  updateSaveLookupButton();
  setLookupVisible(false);
}

function setNotice(message) {
  const safeMessage = typeof message === "string" ? message : "";
  els.notice.textContent = safeMessage;
  document.body.classList.toggle("has-notice", safeMessage.length > 0);
}

function supportsSystemNotification() {
  return typeof window !== "undefined" && "Notification" in window;
}

function getNotificationPermission() {
  if (!supportsSystemNotification()) {
    return "unsupported";
  }
  return Notification.permission;
}

function renderNotificationPermission() {
  if (!els.notificationPermissionCard) {
    return;
  }

  const permission = getNotificationPermission();
  const isGranted = permission === "granted";
  els.notificationPermissionCard.hidden = isGranted;
  els.notificationPermissionCard.classList.toggle("is-hidden", isGranted);

  if (isGranted) {
    return;
  }

  if (permission === "unsupported") {
    setElementText(
      els.notificationPermissionCopy,
      "이 브라우저는 시스템 알림을 지원하지 않아요. 앱을 열어두면 화면 안에서 복습 시간을 알려드릴게요.",
    );
    if (els.notificationPermission) {
      els.notificationPermission.disabled = true;
      els.notificationPermission.textContent = "지원 안 됨";
    }
    return;
  }

  if (els.notificationPermission) {
    els.notificationPermission.disabled = false;
    els.notificationPermission.textContent = permission === "denied" ? "설정에서 허용" : "알림 허용";
  }
  setElementText(
    els.notificationPermissionCopy,
    permission === "denied"
      ? "알림이 차단되어 있어요. 브라우저 설정에서 허용하면 지정한 시간에 알려드릴 수 있어요."
      : "알림을 허용하면 정해진 시간에 복습 퀴즈를 알려드릴게요.",
  );
}

async function requestNotificationPermission() {
  if (!supportsSystemNotification()) {
    renderNotificationPermission();
    return;
  }

  const permission = await Notification.requestPermission();
  renderNotificationPermission();
  setNotice(
    permission === "granted"
      ? "브라우저 알림을 켰어요. 정해진 시간에 복습 퀴즈를 알려드릴게요."
      : "브라우저 알림이 꺼져 있어요. 앱을 열어두면 화면 안에서 알려드릴게요.",
  );
}

function clearReminderTimer(reminderId) {
  const timerId = reminderTimers.get(reminderId);
  if (!timerId) {
    return;
  }
  clearTimeout(timerId);
  reminderTimers.delete(reminderId);
}

function getNextReminderDelay(time) {
  const [hoursRaw, minutesRaw] = time.split(":");
  const hours = Number.parseInt(hoursRaw, 10);
  const minutes = Number.parseInt(minutesRaw, 10);
  const now = new Date();
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime() - now.getTime();
}

function showSystemNotification(reminder) {
  if (!supportsSystemNotification() || Notification.permission !== "granted") {
    return;
  }

  const notification = new Notification("Witness Me 복습 시간", {
    body: `${reminder.questionCount}문제를 짧게 풀어볼 시간이에요.`,
  });
  notification.onclick = () => {
    window.focus();
    setPanel("quiz");
    state.quizSession = null;
    startQuiz(reminder.questionCount);
  };
}

function triggerReminder(reminderId) {
  const reminder = state.reminders.find((item) => item.id === reminderId);
  if (!reminder || !reminder.enabled) {
    return;
  }
  setPanel("quiz");
  state.quizSession = null;
  startQuiz(reminder.questionCount);
  setNotice(`${reminder.time} 복습 퀴즈 시간이에요. ${reminder.questionCount}문제를 풀어볼게요.`);
  showSystemNotification(reminder);
  scheduleReminder(reminder);
}

function scheduleReminder(reminder) {
  clearReminderTimer(reminder.id);
  if (!reminder.enabled || !isValidTime(reminder.time)) {
    return;
  }
  const delay = getNextReminderDelay(reminder.time);
  reminder.nextAt = new Date(Date.now() + delay).toISOString();
  const timerId = setTimeout(() => triggerReminder(reminder.id), delay);
  reminderTimers.set(reminder.id, timerId);
}

function scheduleAllReminders() {
  for (const reminder of state.reminders) {
    scheduleReminder(reminder);
  }
}

function sortRemindersByTime() {
  state.reminders.sort((a, b) => a.time.localeCompare(b.time));
}

function sortPendingReminderTimes() {
  state.pendingReminderTimes.sort((a, b) => a.localeCompare(b));
}

function isValidTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function setPendingReminderTime(time, isSelected) {
  if (!time) {
    setNotice("시간을 선택해 주세요.");
    els.reminderTime.focus();
    return;
  }

  if (!isValidTime(time)) {
    setNotice("시간을 다시 확인해 주세요.");
    return;
  }

  const nextTimes = state.pendingReminderTimes.filter((item) => item !== time);
  if (isSelected) {
    nextTimes.push(time);
  }
  state.pendingReminderTimes = nextTimes;
  sortPendingReminderTimes();
  renderTimeSelector();
}

function clearPendingReminderTimes() {
  state.pendingReminderTimes = [];
  renderTimeSelector();
}

function applyReminderStateChange() {
  sortRemindersByTime();
  renderRoutine();
  syncQuizSummary();
}

function setPanel(panelName) {
  setNotice("");
  state.activePanel = panelName;
  document.body.classList.toggle("is-home", panelName === "home");
  let activeNavName = "none";
  for (const panel of els.panels) {
    panel.classList.toggle("is-active", panel.dataset.panel === panelName);
  }
  for (const nav of els.navItems) {
    const isActive = nav.dataset.nav === panelName;
    nav.classList.toggle("is-active", isActive);
    nav.setAttribute("aria-current", isActive ? "page" : "false");
    if (isActive && nav.dataset.nav) {
      activeNavName = nav.dataset.nav;
    }
  }
  if (els.bottomNav) {
    els.bottomNav.dataset.active = activeNavName;
  }
}

function renderPendingTimeState() {
  const selectedCount = state.pendingReminderTimes.length;
  if (selectedCount === 0) {
    els.selectedTimeCount.textContent = "추가할 시간을 입력하세요";
    els.reminderSubmit.textContent = "시간을 추가해 주세요";
    els.reminderSubmit.disabled = true;
    return;
  }
  els.selectedTimeCount.textContent = `${selectedCount}개 선택됨`;
  els.reminderSubmit.textContent = `${selectedCount}개 시간에 적용`;
  els.reminderSubmit.disabled = false;
}

function renderPendingTimeList() {
  els.pendingTimeList.innerHTML = "";
  if (state.pendingReminderTimes.length === 0) {
    const empty = document.createElement("p");
    empty.className = "pending-time-empty";
    empty.textContent = "아직 추가한 시간이 없어요.";
    els.pendingTimeList.append(empty);
    return;
  }

  for (const time of state.pendingReminderTimes) {
    const button = document.createElement("button");
    const isExisting = state.reminders.some((reminder) => reminder.time === time);
    button.type = "button";
    button.className = "pending-time-pill";
    button.setAttribute("aria-label", `${time} 시간 제거`);
    button.innerHTML = `
      <strong>${time}</strong>
      <span>${isExisting ? "기존 알림 업데이트" : "새 알림"} · 삭제</span>
    `;
    button.addEventListener("click", () => setPendingReminderTime(time, false));
    els.pendingTimeList.append(button);
  }
}

function renderTimeSelector() {
  renderPendingTimeList();
  renderPendingTimeState();
}

function renderReminderList() {
  els.reminderList.innerHTML = "";
  if (state.reminders.length === 0) {
    const empty = document.createElement("article");
    empty.className = "empty-card";
    empty.setAttribute("role", "listitem");
    empty.textContent = "등록된 알림이 없어요. 복습할 시간을 직접 추가해 주세요.";
    els.reminderList.append(empty);
    return;
  }

  for (const reminder of state.reminders) {
    const card = document.createElement("article");
    card.className = "reminder-card";
    if (!reminder.enabled) {
      card.classList.add("is-disabled");
    }
    card.setAttribute("role", "listitem");
    card.innerHTML = `
      <div class="reminder-main">
        <div class="reminder-time-row">
          <span class="reminder-dot" aria-hidden="true"></span>
          <strong class="reminder-time">${reminder.time}</strong>
        </div>
        <div class="reminder-detail">
          <span>${reminder.durationMinutes}분 집중</span>
          <span>${reminder.questionCount}문제</span>
        </div>
      </div>
      <div class="reminder-actions">
        <label class="reminder-switch">
          <input type="checkbox" ${reminder.enabled ? "checked" : ""} aria-label="${reminder.time} 알림 활성화" />
          <span class="switch-track" aria-hidden="true">
            <span class="switch-thumb"></span>
          </span>
          <span class="toggle-text">${reminder.enabled ? "켜짐" : "꺼짐"}</span>
        </label>
        <button class="reminder-delete" type="button" aria-label="${reminder.time} 알림 삭제">삭제</button>
      </div>
    `;
    const actions = card.querySelector(".reminder-actions");
    const checkbox = card.querySelector("input[type='checkbox']");
    const deleteButton = card.querySelector(".reminder-delete");
    if (actions) {
      actions.addEventListener("click", (event) => {
        event.stopPropagation();
      });
    }
    if (checkbox) {
      checkbox.addEventListener("change", () => {
        reminder.enabled = checkbox.checked;
        setNotice("");
        if (reminder.enabled) {
          scheduleReminder(reminder);
        } else {
          clearReminderTimer(reminder.id);
        }
        applyReminderStateChange();
      });
    }
    if (deleteButton) {
      deleteButton.addEventListener("click", () => {
        clearReminderTimer(reminder.id);
        state.reminders = state.reminders.filter((item) => item.id !== reminder.id);
        setNotice("알림을 삭제했어요.");
        applyReminderStateChange();
      });
    }
    els.reminderList.append(card);
  }
}

function renderRoutine() {
  renderNotificationPermission();
  renderTimeSelector();
  renderReminderList();
}

function getAccuracyText(value, reviewCount = 0) {
  if (!reviewCount || typeof value !== "number") {
    return "신규";
  }
  return `정답률 ${value}%`;
}

function renderMemory() {
  els.memoryList.innerHTML = "";
  if (state.memories.length === 0) {
    const empty = document.createElement("article");
    empty.className = "empty-card";
    empty.textContent = "저장된 표현이 없어요. 검색하거나 직접 추가해 보세요.";
    els.memoryList.append(empty);
    return;
  }

  for (const memory of state.memories) {
    const card = document.createElement("article");
    card.className = "memory-card";
    const expression = document.createElement("p");
    expression.className = "memory-expression";
    expression.textContent = memory.expression;
    const summary = document.createElement("p");
    summary.className = "memory-summary";
    summary.textContent = memory.meaning || memory.summary || memory.memoryPoint;
    const meta = document.createElement("div");
    meta.className = "memory-meta";
    const type = document.createElement("span");
    type.className = "badge";
    type.textContent = memory.type || "언어 표현";
    const status = document.createElement("span");
    status.className = "badge";
    status.textContent = memory.status;
    const accuracy = document.createElement("span");
    accuracy.className = "badge";
    accuracy.textContent = getAccuracyText(memory.accuracy, memory.reviewCount);
    meta.append(type, status, accuracy);
    card.append(expression, summary, meta);
    els.memoryList.append(card);
  }
}

function syncQuizSummary() {
  // Quiz intro has no summary chips by design.
}

function shuffleQuestions(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function clampQuestionCount(rawCount) {
  const parsed = Number.parseInt(String(rawCount), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }
  return Math.min(parsed, MAX_QUESTIONS_PER_SESSION);
}

function getUniqueChoices(items) {
  return items.filter((item, index) => item && items.indexOf(item) === index);
}

function getMemoryMeaning(memory) {
  return memory.meaning || memory.summary || buildMemoryMeaning(memory.expression);
}

function getMemoryPoint(memory) {
  return memory.memoryPoint || buildMemoryPoint(memory.expression);
}

function buildChoiceSet(correctChoice, distractors) {
  const fallbackDistractors = [
    "문맥에 따라 뜻이 달라질 수 있으니 예문과 함께 기억한다.",
    "단어 하나보다 함께 쓰이는 상황을 떠올린다.",
    "직역보다 실제 대화에서의 뉘앙스를 먼저 확인한다.",
    "비슷한 표현과 헷갈리지 않게 핵심 이미지를 잡는다.",
  ];
  const uniqueDistractors = getUniqueChoices([...distractors, ...fallbackDistractors])
    .filter((choice) => choice !== correctChoice);
  const selectedDistractors = shuffleQuestions(uniqueDistractors).slice(0, 3);
  const choices = shuffleQuestions([correctChoice, ...selectedDistractors]);
  return {
    choices,
    answerIndex: choices.indexOf(correctChoice),
  };
}

function buildQuizQuestionFromMemory(memory, mode) {
  const isPointQuestion = mode === "memoryPoint";
  const correctChoice = isPointQuestion ? getMemoryPoint(memory) : getMemoryMeaning(memory);
  const memoryDistractors = state.memories.map((item) =>
    isPointQuestion ? getMemoryPoint(item) : getMemoryMeaning(item),
  );
  const sampleDistractors = LANGUAGE_SAMPLES.map((sample) =>
    isPointQuestion ? sample.memoryPoint : sample.meaning,
  );
  const { choices, answerIndex } = buildChoiceSet(correctChoice, [
    ...memoryDistractors,
    ...sampleDistractors,
  ]);

  return {
    memoryId: memory.id,
    expression: memory.expression,
    prompt: isPointQuestion
      ? `“${memory.expression}”을 복습할 때 같이 떠올릴 설명은?`
      : `“${memory.expression}”의 뜻으로 가장 가까운 것은?`,
    choices,
    answerIndex,
    explanation: isPointQuestion
      ? `뜻: ${getMemoryMeaning(memory)}`
      : `힌트: ${getMemoryPoint(memory)}`,
  };
}

function buildQuizQuestionsFromMemory(memory) {
  if (!memory.expression) {
    return [];
  }
  return [
    buildQuizQuestionFromMemory(memory, "meaning"),
    buildQuizQuestionFromMemory(memory, "memoryPoint"),
  ];
}

function getQuizSource() {
  return state.memories.flatMap(buildQuizQuestionsFromMemory);
}

function pickQuestions(count) {
  const quizSource = getQuizSource();
  if (quizSource.length === 0) {
    return [];
  }

  const targetCount = clampQuestionCount(count);
  const selected = [];
  while (selected.length < targetCount) {
    const cycle = shuffleQuestions(quizSource);
    for (const question of cycle) {
      selected.push(question);
      if (selected.length === targetCount) {
        break;
      }
    }
  }
  return selected;
}

function showQuizIntro() {
  els.quizIntro.classList.remove("is-hidden");
  els.quizCard.classList.add("is-hidden");
  els.quizDone.classList.add("is-hidden");
}

function startQuiz(questionCount = DEFAULT_QUIZ_COUNT) {
  const questions = pickQuestions(questionCount);
  if (questions.length === 0) {
    setNotice("저장소에 복습할 기억이 아직 없어요.");
    return;
  }
  state.quizSession = {
    index: 0,
    score: 0,
    questions,
    results: [],
    answered: false,
  };
  els.quizIntro.classList.add("is-hidden");
  els.quizDone.classList.add("is-hidden");
  els.quizCard.classList.remove("is-hidden");
  renderCurrentQuestion();
}

function markChoiceButtons(correctIndex, selectedIndex) {
  const buttons = Array.from(els.quizChoices.querySelectorAll("button"));
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === correctIndex) {
      button.classList.add("is-correct");
      button.textContent = `정답 · ${button.textContent}`;
      return;
    }
    if (index === selectedIndex) {
      button.classList.add("is-wrong");
      button.textContent = `내 선택 · ${button.textContent}`;
    }
  });
}

function renderCurrentQuestion() {
  if (!state.quizSession) {
    return;
  }
  const { index, questions } = state.quizSession;
  const current = questions[index];
  els.quizProgress.textContent = `${index + 1} / ${questions.length}`;
  els.quizQuestion.textContent = current.prompt || `“${current.expression}”에 가장 가까운 설명은?`;
  els.quizChoices.innerHTML = "";
  els.quizFeedback.textContent = "";
  els.quizNext.classList.add("is-hidden");
  state.quizSession.answered = false;

  current.choices.forEach((choice, choiceIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-btn";
    button.textContent = choice;
    button.addEventListener("click", () => {
      if (!state.quizSession || state.quizSession.answered) {
        return;
      }
      state.quizSession.answered = true;
      const isCorrect = choiceIndex === current.answerIndex;
      if (isCorrect) {
        state.quizSession.score += 1;
      }
      if (current.memoryId) {
        state.quizSession.results.push({
          memoryId: current.memoryId,
          isCorrect,
        });
      }
      markChoiceButtons(current.answerIndex, choiceIndex);
      els.quizFeedback.textContent = isCorrect
        ? `정답이에요. ${current.explanation}`
        : `정답은 "${current.choices[current.answerIndex]}"입니다. ${current.explanation}`;
      els.quizNext.textContent = index + 1 === questions.length ? "결과 보기" : "다음 문제";
      els.quizNext.classList.remove("is-hidden");
    });
    els.quizChoices.append(button);
  });
}

function finishQuiz() {
  if (!state.quizSession) {
    return;
  }
  const { score, questions, results } = state.quizSession;
  updateMemoryReviewStats(results);
  els.quizCard.classList.add("is-hidden");
  els.quizDone.classList.remove("is-hidden");
  els.quizResultCopy.textContent = `${questions.length}문제 중 ${score}문제 정답이에요.`;
}

function getReviewStatus(accuracy) {
  if (accuracy >= 85) {
    return "안정권";
  }
  if (accuracy >= 60) {
    return "복습 중";
  }
  return "다시 볼 표현";
}

function updateMemoryReviewStats(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return;
  }

  const grouped = results.reduce((acc, result) => {
    if (!result.memoryId) {
      return acc;
    }
    const current = acc.get(result.memoryId) || { total: 0, correct: 0 };
    current.total += 1;
    if (result.isCorrect) {
      current.correct += 1;
    }
    acc.set(result.memoryId, current);
    return acc;
  }, new Map());

  for (const [memoryId, result] of grouped) {
    const memory = state.memories.find((item) => item.id === memoryId);
    if (!memory || result.total === 0) {
      continue;
    }
    const sessionAccuracy = Math.round((result.correct / result.total) * 100);
    const previousReviewCount = memory.reviewCount || 0;
    const previousAccuracy = previousReviewCount > 0 && typeof memory.accuracy === "number"
      ? memory.accuracy
      : sessionAccuracy;
    memory.accuracy = previousReviewCount > 0
      ? Math.round(((previousAccuracy * previousReviewCount) + sessionAccuracy) / (previousReviewCount + 1))
      : sessionAccuracy;
    memory.reviewCount = previousReviewCount + 1;
    memory.status = getReviewStatus(memory.accuracy);
  }
  renderMemory();
}

function nextQuestion() {
  if (!state.quizSession) {
    return;
  }
  const isLast = state.quizSession.index >= state.quizSession.questions.length - 1;
  if (isLast) {
    finishQuiz();
    return;
  }
  state.quizSession.index += 1;
  renderCurrentQuestion();
}

function buildMemorySummary(expression) {
  return buildMemoryMeaning(expression);
}

function addMemory(expression, status, details = {}) {
  const normalized = normalizeExpression(expression);
  const newMemory = createLanguageMemory(
    {
      ...details,
      expression: normalized,
      summary: details.summary || buildMemorySummary(normalized),
    },
    { status, accuracy: 0 },
  );
  const existingIndex = state.memories.findIndex((memory) =>
    normalizeKey(memory.expression) === normalizeKey(normalized),
  );
  if (existingIndex >= 0) {
    const [existing] = state.memories.splice(existingIndex, 1);
    const updatedMemory = {
      ...existing,
      ...newMemory,
      id: existing.id,
      accuracy: existing.accuracy,
      reviewCount: existing.reviewCount || 0,
      status,
    };
    state.memories.unshift(updatedMemory);
    renderMemory();
    return updatedMemory;
  }
  state.memories.unshift(newMemory);
  renderMemory();
  return newMemory;
}

function buildVocabularyMemoryDetails(item) {
  const expression = normalizeExpression(item.expression || item.word);
  const meaning = item.meaning || item.memoryPoint || buildMemoryMeaning(expression);
  const memoryPoint = item.memoryPoint || meaning || buildMemoryPoint(expression);

  return {
    expression,
    type: item.type || inferLanguageType(expression),
    meaning,
    summary: meaning,
    breakdown: item.breakdown || memoryPoint || buildMemoryBreakdown(expression),
    example: item.example || buildMemoryExample(expression),
    memoryPoint,
  };
}

function saveCurrentLookup() {
  if (!state.pendingLookup) {
    setNotice("먼저 검색 결과를 확인해 주세요.");
    els.askInput.focus();
    return;
  }

  const vocabularyItems = getVocabularyItems();
  if (vocabularyItems.length > 0) {
    const itemsToSave = getSelectedVocabularyItems();
    for (const item of itemsToSave) {
      const details = buildVocabularyMemoryDetails(item);
      addMemory(details.expression, "오늘 추가", details);
    }
    els.askInput.value = "";
    clearLookupResult();
    setPanel("memory");
    setNotice(`저장소에 ${itemsToSave.length}개 표현을 추가했어요.`);
    return;
  }

  const memoryPoint = readFieldValue(els.memoryPoint) || state.pendingLookup.memoryPoint;
  addMemory(state.pendingLookup.expression, "오늘 추가", {
    ...state.pendingLookup,
    memoryPoint,
  });
  els.askInput.value = "";
  clearLookupResult();
  setPanel("memory");
  setNotice("저장소에 복습 표현을 추가했어요.");
}

function beginLookupSearch(query) {
  state.activeLookupRequestId += 1;
  const requestId = state.activeLookupRequestId;
  renderLookupLoading(query);
  setSearchLoadingState(true);
  setNotice("");
  return requestId;
}

function isActiveLookupRequest(requestId) {
  return requestId === state.activeLookupRequestId;
}

async function handleLookupSubmit(expression) {
  const normalized = normalizeExpression(expression);
  const requestId = beginLookupSearch(normalized);

  try {
    const learningResponse = await requestLearningResponse(normalized);
    if (!isActiveLookupRequest(requestId)) {
      return;
    }

    const lookupResult = createLookupResult(normalized, learningResponse);
    if (lookupResult.parseError) {
      throw new Error("learning-response-parse-error");
    }

    renderLookupResult(lookupResult);
    setNotice("");
    setSearchStatus("");
  } catch {
    if (!isActiveLookupRequest(requestId)) {
      return;
    }
    renderLookupFailure(normalized);
    setNotice(LOOKUP_RETRY_MESSAGE);
    setSearchStatus(LOOKUP_RETRY_MESSAGE);
  } finally {
    if (isActiveLookupRequest(requestId)) {
      setSearchLoadingState(false);
    }
  }
}

function bindEvents() {
  els.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const target = item.dataset.nav;
      if (!target) {
        return;
      }
      setPanel(target);
      if (target === "quiz" && !state.quizSession) {
        showQuizIntro();
      }
    });
  });

  els.manualLink.addEventListener("click", () => setPanel("manual"));
  els.manualHome.addEventListener("click", () => {
    setPanel("home");
    els.manualInput.value = "";
  });

  if (els.askInput) {
    els.askInput.addEventListener("input", () => {
      resizeAskComposer();
      if (els.askInput.value.trim()) {
        setSearchStatus("");
      }
    });

    els.askInput.addEventListener("keydown", (event) => {
      if (
        event.key === "Enter"
        && !event.shiftKey
        && !event.isComposing
        && els.askInput.tagName === "TEXTAREA"
      ) {
        event.preventDefault();
        els.askForm.requestSubmit();
      }
    });
  }

  els.promptChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      if (state.isSearching) {
        return;
      }
      els.askInput.value = chip.dataset.prompt || "";
      resizeAskComposer();
      setSearchStatus("");
      els.askInput.focus();
    });
  });

  els.askForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.isSearching) {
      return;
    }
    const expression = els.askInput.value.trim();
    if (!expression) {
      const emptyMessage = "궁금한 단어, 숙어, 문장을 하나 보내주세요.";
      setNotice(emptyMessage);
      setSearchStatus(emptyMessage);
      els.askInput.focus();
      return;
    }
    els.askInput.value = "";
    resizeAskComposer();
    handleLookupSubmit(expression);
  });

  if (els.saveLookup) {
    els.saveLookup.addEventListener("click", (event) => {
      event.preventDefault();
      saveCurrentLookup();
    });
  }

  els.manualForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const expression = els.manualInput.value.trim();
    if (!expression) {
      setNotice("직접 추가할 표현이나 문장을 입력해 주세요.");
      return;
    }
    addMemory(expression, "직접 추가");
    els.manualInput.value = "";
    setPanel("memory");
    setNotice("저장소에 직접 입력한 표현을 추가했어요.");
  });

  els.reminderFormToggle.addEventListener("click", () => {
    const willExpand = els.reminderForm.classList.contains("is-hidden");
    els.reminderForm.classList.toggle("is-hidden");
    els.reminderFormToggle.setAttribute("aria-expanded", String(willExpand));
    if (willExpand) {
      els.reminderTime.focus();
    }
  });

  els.reminderTimeAdd.addEventListener("click", () => {
    const time = els.reminderTime.value;
    setPendingReminderTime(time, true);
  });

  if (els.notificationPermission) {
    els.notificationPermission.addEventListener("click", () => {
      requestNotificationPermission();
    });
  }

  els.reminderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const [durationRaw, countRaw] = els.reminderPack.value.split("|");
    const durationMinutes = Number.parseInt(durationRaw, 10);
    const questionCount = Number.parseInt(countRaw, 10);
    if (state.pendingReminderTimes.length === 0) {
      setNotice("추가할 알림 시간을 하나 이상 선택해 주세요.");
      els.reminderTime.focus();
      return;
    }
    if (!durationMinutes || !questionCount) {
      setNotice("알림 정보를 다시 확인해 주세요.");
      return;
    }
    for (const time of state.pendingReminderTimes) {
      const existing = state.reminders.find((reminder) => reminder.time === time);
      if (existing) {
        existing.durationMinutes = durationMinutes;
        existing.questionCount = questionCount;
        existing.enabled = true;
        scheduleReminder(existing);
        continue;
      }
      const reminder = {
        id: `r${Date.now()}-${time.replace(":", "")}`,
        time,
        durationMinutes,
        questionCount,
        enabled: true,
      };
      state.reminders.push(reminder);
      scheduleReminder(reminder);
    }
    clearPendingReminderTimes();
    applyReminderStateChange();
    els.reminderForm.classList.add("is-hidden");
    els.reminderFormToggle.setAttribute("aria-expanded", "false");
    setNotice("알림을 저장했어요. 정해진 시간에 복습 퀴즈를 준비할게요.");
  });

  els.startQuiz.addEventListener("click", () => startQuiz());
  els.quizNext.addEventListener("click", nextQuestion);
  els.quizRestart.addEventListener("click", () => {
    state.quizSession = null;
    showQuizIntro();
  });
}

function init() {
  bindEvents();
  sortRemindersByTime();
  renderRoutine();
  renderMemory();
  syncQuizSummary();
  showQuizIntro();
  clearLookupResult();
  scheduleAllReminders();
  setPanel("home");
  resizeAskComposer();
}

init();
