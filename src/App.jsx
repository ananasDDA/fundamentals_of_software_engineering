import React, { useState, useEffect } from 'react';

const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('generator');
  const [competency, setCompetency] = useState('strategic_thinking');
  const [industry, setIndustry] = useState('it');
  const [difficulty, setDifficulty] = useState('senior');
  const [generatedCase, setGeneratedCase] = useState(null);
  const [userSolution, setUserSolution] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock knowledge context
  const COMPETENCY_CONTEXT = {
    strategic_thinking: {
      description: "Способность видеть долгосрочные цели, оценивать риски, принимать решения в условиях неопределённости.",
      examples: [
        "Apple после смерти Джобса: переход к сервисам",
        "Netflix: отказ от DVD ради стриминга"
      ],
      key_questions: [
        "Какие внешние факторы влияют на стратегию?",
        "Какие компетиторы могут стать угрозой?"
      ]
    },
    change_management: {
      description: "Управление организационными изменениями и преодоление сопротивления команды.",
      examples: [
        "Microsoft под руководством Наделлы: переход к культуре обучения",
        "Nokia: провал адаптации к смартфонам"
      ],
      key_questions: [
        "Как мотивировать сотрудников на изменения?",
        "Какие риски связаны с внедрением новой технологии?"
      ]
    },
    leadership: {
      description: "Навыки вдохновлять команду, делегировать полномочия и развивать лидеров.",
      examples: [
        "Satya Nadella в Microsoft: создание культуры роста",
        "Indra Nooyi в PepsiCo: фокус на развитии талантов"
      ],
      key_questions: [
        "Как выявить потенциальных лидеров в команде?",
        "Какие метрики эффективности лидерства?"
      ]
    },
    financial_literacy: {
      description: "Понимание финансовых показателей и принятие решений на основе данных.",
      examples: [
        "Tesla: управление денежными потоками при масштабировании",
        "Amazon: инвестиции в инфраструктуру при низкой марже"
      ],
      key_questions: [
        "Какие KPI наиболее важны для этого бизнеса?",
        "Как оценить рентабельность нового проекта?"
      ]
    }
  };

  const INDUSTRY_CONTEXT = {
    it: {
      characteristics: "Высокая скорость изменений, зависимость от талантов, глобальная конкуренция",
      challenges: ["удержание разработчиков", "выбор между open-source и проприетарным ПО"]
    },
    retail: {
      characteristics: "Жесткая конкуренция, сезонные колебания, высокая чувствительность к ценам",
      challenges: ["онлайн-конкуренция", "управление запасами"]
    },
    healthcare: {
      characteristics: "Регулирование, высокие стандарты качества, долгий цикл инноваций",
      challenges: ["внедрение новых технологий", "обеспечение безопасности пациентов"]
    },
    education: {
      characteristics: "Фокус на качестве контента, цифровизация процессов, персонализация обучения",
      challenges: ["адаптация к онлайн-форматам", "оценка эффективности обучения"]
    }
  };

  const difficulties = [
    { value: 'junior', label: 'Junior (0-2 года опыта)' },
    { value: 'middle', label: 'Middle (3-5 лет опыта)' },
    { value: 'senior', label: 'Senior (5+ лет опыта)' },
    { value: 'executive', label: 'Executive (руководитель высшего звена)' }
  ];

  const competencies = [
    { value: 'strategic_thinking', label: 'Стратегическое мышление' },
    { value: 'change_management', label: 'Управление изменениями' },
    { value: 'leadership', label: 'Лидерство' },
    { value: 'financial_literacy', label: 'Финансовая грамотность' }
  ];

  const industries = [
    { value: 'it', label: 'IT / Технологии' },
    { value: 'retail', label: 'Розничная торговля' },
    { value: 'healthcare', label: 'Здравоохранение' },
    { value: 'education', label: 'Образование' }
  ];

  const buildCasePrompt = (comp, ind, level) => {
    const compCtx = COMPETENCY_CONTEXT[comp];
    const indCtx = INDUSTRY_CONTEXT[ind];

    return `Вы — эксперт по бизнес-образованию. Создайте реалистичный управленческий кейс.

**Тема:** ${comp.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/_/g, ' ')}
**Отрасль:** ${ind.toUpperCase()}
**Уровень:** ${level}

### Контекст компетенции:
${compCtx.description}
Примеры: ${compCtx.examples.slice(0, 2).join(', ')}

### Особенности отрасли:
${indCtx.characteristics}
Типичные вызовы: ${indCtx.challenges.slice(0, 2).join(', ')}

### Требования к кейсу:
1. Опишите компанию (название, размер, рынок)
2. Чётко обозначьте проблему
3. Добавьте 2–3 вопроса для обсуждения
4. Укажите ограничения (время, бюджет, этика)
5. Уровень сложности должен соответствовать "${level}"

Не используйте абстрактные формулировки. Будьте конкретны.`;
  };

  const buildFeedbackPrompt = (caseText, solution, comp) => {
    const compCtx = COMPETENCY_CONTEXT[comp];

    return `Вы — эксперт по бизнес-оценке. Проанализируйте решение студента на основе кейса.

**Кейс:**
${caseText}

**Решение студента:**
${solution}

**Критерии оценки (компетенция: ${comp}):**
- Глубина анализа
- Реалистичность предложений
- Учёт рисков
- Соответствие лучшим практикам из: ${compCtx.examples.slice(0, 2).join(', ')}

### Формат ответа:
- Краткий вывод (1–2 предложения)
- Сильные стороны (список)
- Зоны роста (список)
- Рекомендации (1 абзац)

Будьте конструктивны, но честны.`;
  };

  const generateCase = async () => {
    setLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockCases = {
      it: {
        strategic_thinking: "Компания TechNova, стартап в области AI, достигла отметки в $50M ARR, но сталкивается с фундаментальной дилеммой: сосредоточиться на core product (AI для HR) или диверсифицироваться в смежные рынки (AI для финансов и legal tech).\n\nПроблема: Команда основателей разделилась. Технический директор настаивает на углублении в HR-сегмент, где уже есть 70% рынка, а CEO считает, что нужно использовать текущий импульс для выхода на более крупные рынки.\n\nВопросы для обсуждения:\n1. Какую стратегию выбрать: фокус или диверсификацию?\n2. Какие риски связаны с каждым подходом?\n3. Какие метрики помогут принять решение?\n\nОграничения: Бюджет на R&D ограничен $2M, время на принятие решения — 3 месяца.",

        change_management: "Компания CodeFlow, SaaS-провайдер для разработчиков, решила перевести всю команду (150 человек) с асинхронной модели работы на гибридную (3 дня в офисе). Большинство инженеров выступают против, считая, что это снизит продуктивность.\n\nПроблема: Несмотря на исследования, показывающие пользу очных встреч, команда воспринимает изменения как шаг назад. HR-директор получает петиции и жалобы.\n\nВопросы для обсуждения:\n1. Как эффективно реализовать изменения без массовых увольнений?\n2. Какие коммуникационные стратегии использовать?\n3. Как измерить успех изменений?\n\nОграничения: Изменения должны быть внедрены за 6 месяцев, бюджет на коммуникации — $50K."
      },
      retail: {
        strategic_thinking: "Сеть магазинов электроники 'ЭлектроМир' (50 точек по стране) теряет клиентов из-за роста онлайн-продаж. Конкуренты активно развивают omnichannel-стратегии.\n\nПроблема: У компании есть сильное присутствие в регионах, но слабое digital-присутствие. Совет директоров требует стратегического плана на 3 года.\n\nВопросы для обсуждения:\n1. Какую цифровую стратегию выбрать?\n2. Какие партнерства могут ускорить трансформацию?\n3. Как перераспределить бюджет между offline и online каналами?\n\nОграничения: CAPEX ограничен $10M, срок реализации — 24 месяца."
      }
    };

    const caseText = mockCases[industry]?.[competency] ||
      `${COMPETENCY_CONTEXT[competency].description} Вам нужно решить проблему в компании из отрасли ${INDUSTRY_CONTEXT[industry].characteristics}.`;

    setGeneratedCase({
      id: `case-${Date.now()}`,
      text: caseText,
      parameters: { competency, industry, difficulty },
      createdAt: new Date().toISOString()
    });

    setLoading(false);
  };

  const generateFeedback = async () => {
    if (!userSolution.trim()) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockFeedback = {
      feedback_text: "Хороший акцент на анализе текущей ситуации, но не хватает системного подхода к реализации изменений. Вы правильно выделили ключевые риски, однако не предложили конкретных механизмов их минимизации.",
      strengths: [
        "Четкое понимание корневых причин проблемы",
        "Анализ конкурентной среды",
        "Предложение по приоритезации задач"
      ],
      improvement_areas: [
        "Отсутствие финансового обоснования предложенных мер",
        "Недостаточное внимание к человеческому фактору",
        "Не рассмотрены альтернативные сценарии развития"
      ],
      recommendations: "Рекомендую дополнить ваше решение детальным планом внедрения с указанием ответственных, сроков и KPI. Также важно провести cost-benefit анализ каждого предложения и учесть возможные риски увольнения ключевых сотрудников."
    };

    setFeedback(mockFeedback);
    setLoading(false);
  };

  const resetForm = () => {
    setGeneratedCase(null);
    setUserSolution('');
    setFeedback(null);
  };

  useEffect(() => {
    // Set dark mode by default
    document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      {/* Header */}
      <header className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">CaseGenius Light</h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Генерация управленческих кейсов</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            <div className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
              MVP v1.0
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'generator', label: 'Генератор кейсов', icon: 'ClipboardList' },
              { id: 'knowledge', label: 'Контекст', icon: 'BookOpen' },
              { id: 'architecture', label: 'Архитектура', icon: 'Server' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? darkMode
                      ? 'border-blue-500 text-blue-400'
                      : 'border-blue-500 text-blue-600'
                    : darkMode
                    ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {tab.icon === 'ClipboardList' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}
                  {tab.icon === 'BookOpen' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />}
                  {tab.icon === 'Server' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />}
                </svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'generator' && (
          <div className="space-y-8 animate-fade-in">
            {/* Generator Card */}
            <div className={`rounded-2xl p-8 shadow-xl transition-all hover:shadow-2xl ${
              darkMode
                ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700'
                : 'bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <span className={`p-2 rounded-lg mr-3 ${
                    darkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </span>
                  Генератор управленческих кейсов
                </h2>

                {generatedCase && (
                  <button
                    onClick={resetForm}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      darkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Новый кейс
                  </button>
                )}
              </div>

              {!generatedCase ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Competency Selection */}
                    <div>
                      <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Компетенция
                      </label>
                      <select
                        value={competency}
                        onChange={(e) => setCompetency(e.target.value)}
                        className={`w-full p-3 rounded-xl border transition-colors ${
                          darkMode
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                        } focus:ring-2 focus:ring-blue-500/20 outline-none`}
                      >
                        {competencies.map((comp) => (
                          <option key={comp.value} value={comp.value}>
                            {comp.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Industry Selection */}
                    <div>
                      <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Отрасль
                      </label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className={`w-full p-3 rounded-xl border transition-colors ${
                          darkMode
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                        } focus:ring-2 focus:ring-blue-500/20 outline-none`}
                      >
                        {industries.map((ind) => (
                          <option key={ind.value} value={ind.value}>
                            {ind.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Difficulty Selection */}
                    <div>
                      <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Уровень сложности
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className={`w-full p-3 rounded-xl border transition-colors ${
                          darkMode
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                        } focus:ring-2 focus:ring-blue-500/20 outline-none`}
                      >
                        {difficulties.map((diff) => (
                          <option key={diff.value} value={diff.value}>
                            {diff.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={generateCase}
                      disabled={loading}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                        loading
                          ? 'bg-gradient-to-r from-blue-500/70 to-purple-600/70 text-white cursor-wait'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Генерация кейса...</span>
                        </div>
                      ) : (
                        'Сгенерировать кейс'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Case Display */}
                  <div className={`p-6 rounded-xl border transition-all ${
                    darkMode
                      ? 'border-gray-700 bg-gray-800/50'
                      : 'border-gray-200 bg-gray-50/50'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center">
                        <span className={`p-1 rounded mr-2 ${
                          darkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </span>
                        Сгенерированный кейс
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                      }`}>
                        Готово
                      </span>
                    </div>

                    <div className={`whitespace-pre-line text-sm leading-relaxed ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {generatedCase.text}
                    </div>
                  </div>

                  {/* Solution Input */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Ваше решение
                    </label>
                    <textarea
                      value={userSolution}
                      onChange={(e) => setUserSolution(e.target.value)}
                      placeholder="Введите ваше решение проблемы..."
                      rows={6}
                      className={`w-full p-4 rounded-xl border transition-colors resize-none focus:ring-2 focus:ring-blue-500/20 outline-none ${
                        darkMode
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />

                    <div className="flex justify-end mt-4">
                      <button
                        onClick={generateFeedback}
                        disabled={loading || !userSolution.trim()}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${
                          loading || !userSolution.trim()
                            ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:shadow-lg transform hover:scale-105'
                        }`}
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Анализ решения...</span>
                          </div>
                        ) : (
                          'Получить обратную связь'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Feedback Display */}
                  {feedback && (
                    <div className={`p-6 rounded-xl border transition-all ${
                      darkMode
                        ? 'border-gray-700 bg-gray-800/50'
                        : 'border-gray-200 bg-gray-50/50'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                          <span className={`p-1 rounded mr-2 ${
                            darkMode ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-600'
                          }`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </span>
                          Обратная связь от AI
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'
                        }`}>
                          Анализ завершен
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {feedback.feedback_text}
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className={`text-sm font-semibold mb-2 flex items-center ${
                              darkMode ? 'text-green-400' : 'text-green-600'
                            }`}>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Сильные стороны
                            </h4>
                            <ul className={`space-y-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {feedback.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 mr-2 flex-shrink-0"></span>
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className={`text-sm font-semibold mb-2 flex items-center ${
                              darkMode ? 'text-red-400' : 'text-red-600'
                            }`}>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Зоны роста
                            </h4>
                            <ul className={`space-y-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {feedback.improvement_areas.map((area, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 mr-2 flex-shrink-0"></span>
                                  {area}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className={`p-4 rounded-lg ${
                          darkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                        }`}>
                          <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            Рекомендации
                          </h4>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {feedback.recommendations}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="space-y-6">
            <div className={`rounded-2xl p-8 ${
              darkMode
                ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700'
                : 'bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100'
            }`}>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className={`p-2 rounded-lg mr-3 ${
                  darkMode ? 'bg-orange-900/50 text-orange-400' : 'bg-orange-100 text-orange-600'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
                Контекстные знания
              </h2>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Competencies */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    Управленческие компетенции
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(COMPETENCY_CONTEXT).map(([key, comp]) => (
                      <div key={key} className={`p-4 rounded-lg border transition-all ${
                        darkMode
                          ? 'border-gray-700 bg-gray-800/50 hover:border-blue-500/50'
                          : 'border-gray-200 bg-gray-50/50 hover:border-blue-200'
                      }`}>
                        <h4 className="font-medium mb-2 capitalize">{key.replace('_', ' ')}</h4>
                        <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {comp.description}
                        </p>
                        <div className="space-y-1">
                          <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Примеры:
                          </p>
                          <ul className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {comp.examples.map((example, i) => (
                              <li key={i} className="flex items-start">
                                <span className="w-1 h-1 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                                {example}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Industries */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    Отраслевые особенности
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(INDUSTRY_CONTEXT).map(([key, ind]) => (
                      <div key={key} className={`p-4 rounded-lg border transition-all ${
                        darkMode
                          ? 'border-gray-700 bg-gray-800/50 hover:border-green-500/50'
                          : 'border-gray-200 bg-gray-50/50 hover:border-green-200'
                      }`}>
                        <h4 className="font-medium mb-2 capitalize">{key}</h4>
                        <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {ind.characteristics}
                        </p>
                        <div className="space-y-1">
                          <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Типичные вызовы:
                          </p>
                          <ul className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {ind.challenges.map((challenge, i) => (
                              <li key={i} className="flex items-start">
                                <span className="w-1 h-1 rounded-full bg-green-500 mt-2 mr-2 flex-shrink-0"></span>
                                {challenge}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className={`rounded-2xl p-8 ${
              darkMode
                ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700'
                : 'bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100'
            }`}>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className={`p-2 rounded-lg mr-3 ${
                  darkMode ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-600'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </span>
                Архитектура системы
              </h2>

              <div className="space-y-8">
                <div className={`p-6 rounded-xl ${
                  darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50/50 border border-gray-200'
                }`}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className={`inline-block w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-3 text-sm font-bold`}>1</span>
                    Легковесная архитектура
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className={`font-medium mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>Преимущества ✅</h4>
                      <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li className="flex items-start">
                          <span className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-2 flex-shrink-0"></span>
                          Быстрый запуск MVP (1-2 недели)
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-2 flex-shrink-0"></span>
                          Простота деплоя и поддержки
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-2 flex-shrink-0"></span>
                          Полный контроль над промптами
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-2 flex-shrink-0"></span>
                          Возможность масштабирования до full-RAG
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className={`font-medium mb-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>Ограничения ❌</h4>
                      <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li className="flex items-start">
                          <span className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-2 flex-shrink-0"></span>
                          Нет настоящего RAG-поиска
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-2 flex-shrink-0"></span>
                          Контекст ограничен кодом
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-2 flex-shrink-0"></span>
                          Нельзя добавлять PDF динамически
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-2 flex-shrink-0"></span>
                          Меньше "интеллектуального поиска"
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-xl ${
                  darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50/50 border border-gray-200'
                }`}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className={`inline-block w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mr-3 text-sm font-bold`}>2</span>
                    Технологический стек
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { title: 'Бэкенд', tech: 'FastAPI', desc: 'Python 3.11+', icon: 'Server' },
                      { title: 'Фронтенд', tech: 'React + TypeScript', desc: 'Vite', icon: 'Code' },
                      { title: 'AI', tech: 'GPT-4o', desc: 'Claude 3 Opus (резерв)', icon: 'Brain' }
                    ].map((item, index) => (
                      <div key={index} className={`p-4 rounded-lg ${
                        darkMode ? 'bg-gray-700/50' : 'bg-white/50'
                      }`}>
                        <div className="flex items-center mb-3">
                          <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {item.icon === 'Server' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />}
                            {item.icon === 'Code' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />}
                            {item.icon === 'Brain' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />}
                          </svg>
                          <h4 className="font-medium">{item.title}</h4>
                        </div>
                        <div className={`text-lg font-bold mb-1 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                          {item.tech}
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-6 rounded-xl ${
                  darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50/50 border border-gray-200'
                }`}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className={`inline-block w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mr-3 text-sm font-bold`}>3</span>
                    План разработки
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-medium">Спринт 1: Ядро + API</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Настройка FastAPI, PostgreSQL, реализация генерации кейсов
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-medium">Спринт 2: Фронтенд + фидбек</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Разработка React UI, реализация обратной связи, деплой
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`mt-16 py-8 border-t ${
        darkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">CaseGenius Light</span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Упрощённая система генерации управленческих кейсов • MVP версия 1.0
          </p>
          <div className={`mt-4 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            © 2024 CaseGenius. Все права защищены. Это не "упрощёнка", а умный минимализм.
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default App;