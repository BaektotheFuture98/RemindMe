const state = {
  activePanel: "home",
  sidebarOpen: false,
  reminders: [
    { id: "r1", time: "08:10", durationMinutes: 10, questionCount: 5, enabled: true },
    { id: "r2", time: "12:30", durationMinutes: 30, questionCount: 15, enabled: true },
  ],
  memories: [
    {
      id: "m1",
      expression: "call it a day",
      summary: "오늘 할 일을 마무리하다",
      accuracy: 61,
      status: "다시 볼 표현",
    },
    {
      id: "m2",
      expression: "break the ice",
      summary: "어색한 분위기를 풀다",
      accuracy: 78,
      status: "안정권",
    },
    {
      id: "m3",
      expression: "on the same page",
      summary: "같은 이해를 공유하다",
      accuracy: 0,
      status: "오늘 추가",
    },
    {
      id: "m4",
      expression: "be tied up",
      summary: "일정이 꽉 차 있다",
      accuracy: 44,
      status: "다시 볼 표현",
    },
  ],
  quizSession: null,
};

const quizBank = [
  {
    expression: "call it a day",
    choices: ["오늘 일을 마무리하다", "오래 쉬다", "하루 종일 걷다", "일을 새로 시작하다"],
    answerIndex: 0,
    explanation: "오늘 계획한 업무를 끝내고 정리한다는 뜻이에요.",
  },
  {
    expression: "break the ice",
    choices: ["약속을 취소하다", "냉정을 잃다", "어색함을 풀다", "시간을 벌다"],
    answerIndex: 2,
    explanation: "처음 만난 자리에서 긴장을 풀 때 쓰는 표현이에요.",
  },
  {
    expression: "be tied up",
    choices: ["묶여 있다", "일정이 바쁘다", "성공을 확정하다", "숨이 막히다"],
    answerIndex: 1,
    explanation: "일이 많아 시간을 내기 어렵다는 의미로 자주 써요.",
  },
  {
    expression: "on the same page",
    choices: ["같은 책을 읽다", "같은 생각을 공유하다", "메모를 잃어버리다", "다시 검토하다"],
    answerIndex: 1,
    explanation: "같은 맥락을 이해하고 있다는 뜻입니다.",
  },
  {
    expression: "hit the road",
    choices: ["차를 수리하다", "길을 잃다", "출발하다", "목표를 바꾸다"],
    answerIndex: 2,
    explanation: "이동을 시작한다는 의미로 구어체에서 많이 써요.",
  },
  {
    expression: "in hot water",
    choices: ["따뜻한 물에서 쉬다", "곤란한 상황이다", "급히 움직이다", "결과가 좋다"],
    answerIndex: 1,
    explanation: "문제에 휘말려 곤란해진 상태를 말해요.",
  },
  {
    expression: "pull it off",
    choices: ["옷을 벗다", "일을 멋지게 해내다", "관심을 돌리다", "기회를 놓치다"],
    answerIndex: 1,
    explanation: "쉽지 않은 일을 성공적으로 해냈을 때 써요.",
  },
];

const MAX_QUESTIONS_PER_SESSION = 50;

const els = {
  menuTrigger: document.querySelector("#menu-trigger"),
  sidebar: document.querySelector("#sidebar"),
  sidebarBackdrop: document.querySelector("#sidebar-backdrop"),
  navItems: Array.from(document.querySelectorAll(".nav-item")),
  panels: Array.from(document.querySelectorAll(".panel")),
  notice: document.querySelector("#app-notice"),
  manualLink: document.querySelector("#manual-link"),
  manualHome: document.querySelector("#manual-home"),
  askForm: document.querySelector("#ask-form"),
  askInput: document.querySelector("#ask-input"),
  manualForm: document.querySelector("#manual-form"),
  manualInput: document.querySelector("#manual-expression"),
  reminderCount: document.querySelector("#reminder-count"),
  activeReminderCount: document.querySelector("#active-reminder-count"),
  reminderList: document.querySelector("#reminder-list"),
  reminderFormToggle: document.querySelector("#reminder-form-toggle"),
  reminderForm: document.querySelector("#reminder-form"),
  reminderTime: document.querySelector("#reminder-time"),
  reminderPack: document.querySelector("#reminder-pack"),
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

function setNotice(message) {
  const safeMessage = typeof message === "string" ? message : "";
  els.notice.textContent = safeMessage;
  document.body.classList.toggle("has-notice", safeMessage.length > 0);
}

function sortRemindersByTime() {
  state.reminders.sort((a, b) => a.time.localeCompare(b.time));
}

function getCurrentTimeHHMM() {
  const now = new Date();
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

function resolveAutoQuizReminder() {
  const enabledReminders = state.reminders.filter((reminder) => reminder.enabled);
  if (enabledReminders.length === 0) {
    return null;
  }
  const sorted = [...enabledReminders].sort((a, b) => a.time.localeCompare(b.time));
  const current = getCurrentTimeHHMM();
  const upcoming = sorted.find((reminder) => reminder.time >= current);
  return upcoming ?? sorted[0];
}

function resolveAutoQuizQuestionCount() {
  const reminder = resolveAutoQuizReminder();
  if (reminder) {
    return clampQuestionCount(reminder.questionCount);
  }
  return null;
}

function setPanel(panelName) {
  if (panelName === "home") {
    setNotice("");
  }
  state.activePanel = panelName;
  document.body.classList.toggle("is-home", panelName === "home");
  for (const panel of els.panels) {
    panel.classList.toggle("is-active", panel.dataset.panel === panelName);
  }
  for (const nav of els.navItems) {
    const isActive = nav.dataset.nav === panelName;
    nav.classList.toggle("is-active", isActive);
    nav.setAttribute("aria-current", isActive ? "page" : "false");
  }
}

function toggleSidebar(isOpen) {
  state.sidebarOpen = isOpen;
  els.sidebar.classList.toggle("is-open", isOpen);
  els.sidebarBackdrop.classList.toggle("is-open", isOpen);
  els.menuTrigger.setAttribute("aria-expanded", String(isOpen));
  els.menuTrigger.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
  els.sidebar.setAttribute("aria-hidden", String(!isOpen));
  els.sidebar.inert = !isOpen;
  for (const nav of els.navItems) {
    nav.tabIndex = isOpen ? 0 : -1;
  }
  if (isOpen) {
    els.navItems[0]?.focus();
  }
}

function renderRoutineHeader() {
  els.reminderCount.textContent = `${state.reminders.length}개`;
  const enabledCount = state.reminders.filter((reminder) => reminder.enabled).length;
  els.activeReminderCount.textContent = `${enabledCount}개`;
}

function renderReminderList() {
  els.reminderList.innerHTML = "";
  for (const reminder of state.reminders) {
    const card = document.createElement("article");
    card.className = "reminder-card";
    if (!reminder.enabled) {
      card.classList.add("is-disabled");
    }
    card.setAttribute("role", "listitem");
    card.innerHTML = `
      <div>
        <strong>${reminder.time}</strong>
        <p class="reminder-meta">${reminder.durationMinutes}분 · ${reminder.questionCount}문제</p>
      </div>
      <label class="reminder-toggle">
        <input type="checkbox" ${reminder.enabled ? "checked" : ""} aria-label="${reminder.time} 알림 활성화" />
        <span>${reminder.enabled ? "활성" : "비활성"}</span>
      </label>
    `;
    const checkbox = card.querySelector("input[type='checkbox']");
    if (checkbox) {
      checkbox.addEventListener("change", () => {
        reminder.enabled = checkbox.checked;
        setNotice(`${reminder.time} 알림을 ${reminder.enabled ? "활성화" : "비활성화"}했어요.`);
        sortRemindersByTime();
        renderRoutine();
        syncQuizSummary();
      });
    }
    card.addEventListener("click", (event) => {
      if (event.target instanceof HTMLInputElement) {
        return;
      }
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        reminder.enabled = checkbox.checked;
        setNotice(`${reminder.time} 알림을 ${reminder.enabled ? "활성화" : "비활성화"}했어요.`);
        sortRemindersByTime();
        renderRoutine();
        syncQuizSummary();
      }
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== " " && event.key !== "Enter") {
        return;
      }
      event.preventDefault();
      if (!checkbox) {
        return;
      }
      checkbox.checked = !checkbox.checked;
      reminder.enabled = checkbox.checked;
      setNotice(`${reminder.time} 알림을 ${reminder.enabled ? "활성화" : "비활성화"}했어요.`);
      renderRoutine();
      syncQuizSummary();
    });
    card.tabIndex = 0;
    els.reminderList.append(card);
  }
}

function renderRoutine() {
  renderRoutineHeader();
  renderReminderList();
}

function getAccuracyText(value) {
  if (typeof value !== "number" || value <= 0) {
    return "신규";
  }
  return `정답률 ${value}%`;
}

function renderMemory() {
  els.memoryList.innerHTML = "";
  for (const memory of state.memories) {
    const card = document.createElement("article");
    card.className = "memory-card";
    const expression = document.createElement("p");
    expression.className = "memory-expression";
    expression.textContent = memory.expression;
    const summary = document.createElement("p");
    summary.className = "memory-summary";
    summary.textContent = memory.summary;
    const meta = document.createElement("div");
    meta.className = "memory-meta";
    const status = document.createElement("span");
    status.className = "badge";
    status.textContent = memory.status;
    const accuracy = document.createElement("span");
    accuracy.className = "badge";
    accuracy.textContent = getAccuracyText(memory.accuracy);
    meta.append(status, accuracy);
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

function pickQuestions(count) {
  if (quizBank.length === 0) {
    return [];
  }

  const targetCount = clampQuestionCount(count);
  const selected = [];
  while (selected.length < targetCount) {
    const cycle = shuffleQuestions(quizBank);
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

function startQuiz() {
  if (quizBank.length === 0) {
    setNotice("퀴즈 문항이 아직 없어요.");
    return;
  }
  const questionCount = resolveAutoQuizQuestionCount();
  if (questionCount === null) {
    setNotice("활성화된 알림이 없어요. 시간 설정에서 체크해 주세요.");
    setPanel("routine");
    return;
  }
  state.quizSession = {
    index: 0,
    score: 0,
    questions: pickQuestions(questionCount),
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
      return;
    }
    if (index === selectedIndex) {
      button.classList.add("is-wrong");
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
  els.quizQuestion.textContent = `“${current.expression}”의 뜻으로 가장 가까운 것은?`;
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
  const { score, questions } = state.quizSession;
  els.quizCard.classList.add("is-hidden");
  els.quizDone.classList.remove("is-hidden");
  els.quizResultCopy.textContent = `${questions.length}문제 중 ${score}문제 정답이에요.`;
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
  return `${expression} 관련 뜻/예문 생성 대기`;
}

function addMemory(expression, status) {
  const newMemory = {
    id: `m${Date.now()}`,
    expression,
    summary: buildMemorySummary(expression),
    accuracy: 0,
    status,
  };
  state.memories.unshift(newMemory);
  renderMemory();
}

function bindEvents() {
  els.menuTrigger.addEventListener("click", () => {
    toggleSidebar(!state.sidebarOpen);
  });
  els.sidebarBackdrop.addEventListener("click", () => toggleSidebar(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.sidebarOpen) {
      toggleSidebar(false);
      els.menuTrigger.focus();
    }
  });

  els.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const target = item.dataset.nav;
      if (!target) {
        return;
      }
      setPanel(target);
      toggleSidebar(false);
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

  els.askForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const expression = els.askInput.value.trim();
    if (!expression) {
      setNotice("표현을 입력해 주세요.");
      els.askInput.focus();
      return;
    }
    addMemory(expression, "오늘 추가");
    els.askInput.value = "";
    setNotice(`"${expression}"을(를) 기억 저장소에 추가했어요.`);
    setPanel("memory");
  });

  els.manualForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const expression = els.manualInput.value.trim();
    if (!expression) {
      setNotice("직접 추가할 표현을 입력해 주세요.");
      return;
    }
    addMemory(expression, "직접 추가");
    els.manualInput.value = "";
    setNotice(`"${expression}"을(를) 직접 추가했어요.`);
    setPanel("memory");
  });

  els.reminderFormToggle.addEventListener("click", () => {
    const willExpand = els.reminderForm.classList.contains("is-hidden");
    els.reminderForm.classList.toggle("is-hidden");
    els.reminderFormToggle.setAttribute("aria-expanded", String(willExpand));
  });

  els.reminderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const time = els.reminderTime.value;
    const [durationRaw, countRaw] = els.reminderPack.value.split("|");
    const durationMinutes = Number.parseInt(durationRaw, 10);
    const questionCount = Number.parseInt(countRaw, 10);
    if (!time || !durationMinutes || !questionCount) {
      setNotice("알림 정보를 다시 확인해 주세요.");
      return;
    }
    const newReminder = {
      id: `r${Date.now()}`,
      time,
      durationMinutes,
      questionCount,
      enabled: true,
    };
    state.reminders.push(newReminder);
    sortRemindersByTime();
    renderRoutine();
    syncQuizSummary();
    els.reminderForm.classList.add("is-hidden");
    els.reminderFormToggle.setAttribute("aria-expanded", "false");
    setNotice(`${time} 알림이 추가됐어요.`);
  });

  els.startQuiz.addEventListener("click", startQuiz);
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
  setPanel("home");
  toggleSidebar(false);
}

init();
