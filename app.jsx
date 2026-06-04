const { useState, useEffect, useCallback } = React;

// ── API ───────────────────────────────────────────────────────────────────────
const API_URL = window.API_URL || 'http://localhost:8000';
const getToken   = ()  => localStorage.getItem('sb_token');
const setToken   = (t) => localStorage.setItem('sb_token', t);
const clearToken = ()  => localStorage.removeItem('sb_token');

const apiFetch = async (path, opts = {}) => {
  const token = getToken();
  const res = await fetch(API_URL + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Ошибка ${res.status}`);
  }
  return res.json();
};

// ── ICONS ─────────────────────────────────────────────────────────────────────
const Icon = ({ name, cls = "w-5 h-5" }) => {
  const icons = {
    sun:    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeWidth="2" strokeLinecap="round"/></svg>,
    moon:   <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    star:   <svg className={cls} fill="currentColor" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
    check:  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    arrow:  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round"/><polyline points="12,5 19,12 12,19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    x:      <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round"/></svg>,
    brain:  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z" strokeWidth="1.5"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z" strokeWidth="1.5"/></svg>,
    zap:    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10" strokeWidth="2" strokeLinejoin="round"/></svg>,
    target: <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"/><circle cx="12" cy="12" r="6" strokeWidth="2"/><circle cx="12" cy="12" r="2" strokeWidth="2"/></svg>,
    chart:  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    users:  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2"/><circle cx="9" cy="7" r="4" strokeWidth="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2"/><path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2"/></svg>,
    book:   <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth="2"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeWidth="2"/></svg>,
    fire:   <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" strokeWidth="2"/></svg>,
    trophy: <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" strokeWidth="2"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" strokeWidth="2"/><path d="M4 22h16" strokeWidth="2" strokeLinecap="round"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" strokeWidth="2"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" strokeWidth="2"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z" strokeWidth="2"/></svg>,
    map:    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2" strokeWidth="2" strokeLinejoin="round"/><line x1="8" y1="2" x2="8" y2="18" strokeWidth="2"/><line x1="16" y1="6" x2="16" y2="22" strokeWidth="2"/></svg>,
    msg:    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2"/></svg>,
    credit: <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeWidth="2"/><line x1="1" y1="10" x2="23" y2="10" strokeWidth="2"/></svg>,
    home:   <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2"/><polyline points="9,22 9,12 15,12 15,22" strokeWidth="2"/></svg>,
    lock:   <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2"/></svg>,
    menu:   <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round"/></svg>,
    play:   <svg className={cls} fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>,
    plus:   <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round"/></svg>,
    logout: <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2"/><polyline points="16,17 21,12 16,7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" strokeLinecap="round"/></svg>,
    trash:  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6" strokeWidth="2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeWidth="2"/><path d="M10 11v6M14 11v6" strokeWidth="2" strokeLinecap="round"/></svg>,
  };
  return icons[name] || null;
};

const Spinner = ({ cls = "w-5 h-5" }) => (
  <svg className={`${cls} animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
);

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium animate-slide-up ${type === 'error' ? 'bg-red-600' : 'bg-green-600'} text-white`}>
      <Icon name={type === 'error' ? 'x' : 'check'} cls="w-4 h-4" /> {msg}
    </div>
  );
};

// ── NAVBAR ────────────────────────────────────────────────────────────────────
const Navbar = ({ dark, setDark, setPage, setModal, user, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'shadow-lg' : ''} ${dark ? 'bg-gray-950/90' : 'bg-white/90'} backdrop-blur-md border-b ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => setPage('home')} className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center shadow-md"><span className="text-white font-black text-sm">SB</span></div>
            <span className={`font-bold text-xl ${dark ? 'text-white' : 'text-gray-900'}`}>StudyBridge</span>
          </button>
          <div className="hidden md:flex items-center gap-8">
            {[['О платформе','#about'],['Как работает','#how'],['Цены','#pricing'],['Отзывы','#reviews']].map(([l,h]) => (
              <a key={h} href={h} className={`text-sm font-medium transition-colors ${dark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDark(!dark)} className={`p-2 rounded-lg transition-colors ${dark ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
              <Icon name={dark ? 'sun' : 'moon'} cls="w-4 h-4" />
            </button>
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => setPage('dashboard')} className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg ${dark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center text-white text-xs font-bold">{user.name[0]}</div>
                  {user.name.split(' ')[0]}
                </button>
                <button onClick={onLogout} className={`p-2 rounded-lg ${dark ? 'text-gray-500 hover:text-red-400 hover:bg-gray-800' : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'}`}><Icon name="logout" cls="w-4 h-4" /></button>
              </div>
            ) : (
              <>
                <button onClick={() => setModal('login')} className={`hidden md:block text-sm font-medium px-4 py-2 rounded-lg ${dark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}>Войти</button>
                <button onClick={() => setModal('signup')} className="btn-primary text-white text-sm font-semibold px-4 py-2 rounded-lg">Начать бесплатно</button>
              </>
            )}
            <button className="md:hidden p-2" onClick={() => setOpen(!open)}><Icon name="menu" cls="w-5 h-5" /></button>
          </div>
        </div>
      </div>
      {open && (
        <div className={`md:hidden border-t px-4 py-4 flex flex-col gap-3 ${dark ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100'}`}>
          {user && <button onClick={() => { setPage('dashboard'); setOpen(false); }} className="text-sm font-semibold py-2 text-left gradient-text">Мой дашборд</button>}
          {[['О платформе','#about'],['Как работает','#how'],['Цены','#pricing']].map(([l,h]) => (
            <a key={h} href={h} onClick={() => setOpen(false)} className={`text-sm py-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{l}</a>
          ))}
          {user
            ? <button onClick={() => { onLogout(); setOpen(false); }} className="text-sm text-red-500 py-2 text-left">Выйти</button>
            : <button onClick={() => { setModal('login'); setOpen(false); }} className={`text-sm py-2 text-left ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Войти</button>}
        </div>
      )}
    </nav>
  );
};

// ── HERO ──────────────────────────────────────────────────────────────────────
const Hero = ({ dark, setModal, setPage }) => {
  const [pct, setPct] = useState(0);
  useEffect(() => { const t = setTimeout(() => setPct(72), 500); return () => clearTimeout(t); }, []);
  return (
    <section className={`min-h-screen pt-16 flex items-center relative overflow-hidden ${dark ? 'bg-gray-950' : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/40'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay:'1.5s'}} />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-slide-up">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${dark ? 'bg-indigo-900/50 text-indigo-300 border-indigo-800' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Более 3 000 учеников уже поступили
            </div>
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] ${dark ? 'text-white' : 'text-gray-900'}`}>
              Перейди от бесплатных вебинаров к{' '}<span className="gradient-text">реальному результату</span>
            </h1>
            <p className={`text-lg sm:text-xl leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
              StudyBridge помогает школьникам поступать в топовые университеты и выигрывать олимпиады с персональным обучением.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => setModal('signup')} className="btn-primary text-white font-semibold px-8 py-4 rounded-xl text-base flex items-center justify-center gap-2 shadow-lg">
                Попробовать бесплатно <Icon name="arrow" cls="w-4 h-4" />
              </button>
              <button onClick={() => setPage('dashboard')} className={`font-semibold px-8 py-4 rounded-xl text-base flex items-center justify-center gap-2 border-2 transition-all ${dark ? 'border-gray-700 text-gray-300 hover:border-indigo-500' : 'border-gray-200 text-gray-700 hover:border-indigo-400'}`}>
                <Icon name="play" cls="w-4 h-4" /> Посмотреть демо
              </button>
            </div>
            <div className={`flex gap-8 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              {[['3 000+','учеников'],['87%','поступают'],['4.9★','рейтинг']].map(([n,l]) => (
                <div key={l} className="text-center"><div className="text-2xl font-bold gradient-text">{n}</div><div className="text-xs">{l}</div></div>
              ))}
            </div>
          </div>
          {/* Mockup */}
          <div className="relative animate-float hidden lg:block">
            <div className={`rounded-2xl shadow-2xl border overflow-hidden ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className={`flex items-center gap-2 px-4 py-3 border-b ${dark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50'}`}>
                <div className="w-3 h-3 rounded-full bg-red-400"/><div className="w-3 h-3 rounded-full bg-yellow-400"/><div className="w-3 h-3 rounded-full bg-green-400"/>
                <span className={`ml-4 text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>studybridge.io/dashboard</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm">АМ</div>
                    <div><div className={`font-semibold text-sm ${dark?'text-white':'text-gray-900'}`}>Алина Морозова</div><div className="text-xs text-gray-500">ЕГЭ Математика · Pro</div></div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${dark?'bg-orange-900/40 text-orange-400':'bg-orange-50 text-orange-600'}`}><Icon name="fire" cls="w-3.5 h-3.5"/> 14 дней</div>
                </div>
                <div className={`rounded-xl p-4 ${dark?'bg-gray-800':'bg-gray-50'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-medium ${dark?'text-gray-400':'text-gray-600'}`}>Прогресс подготовки</span>
                    <span className="text-xs font-bold text-indigo-600">{pct}%</span>
                  </div>
                  <div className={`h-2.5 rounded-full ${dark?'bg-gray-700':'bg-gray-200'}`}><div className="h-full rounded-full gradient-bg transition-all duration-1000" style={{width:`${pct}%`}}/></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[['🎯','Цель','90 б.'],['✅','Задач','147'],['🏆','Рейтинг','#12']].map(([e,l,v])=>(
                    <div key={l} className={`rounded-xl p-3 text-center ${dark?'bg-gray-800':'bg-blue-50'}`}><div className="text-lg">{e}</div><div className={`text-xs ${dark?'text-gray-500':'text-gray-500'}`}>{l}</div><div className={`text-sm font-bold ${dark?'text-white':'text-gray-800'}`}>{v}</div></div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[['Тригонометрия: тест',true],['Разбор пробника',false],['Теорвер: урок',false]].map(([t,d])=>(
                    <div key={t} className={`flex items-center gap-2 text-xs ${d?'opacity-60':''}`}>
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 ${d?'gradient-bg':dark?'border border-gray-600':'border border-gray-300'}`}>{d&&<Icon name="check" cls="w-2 h-2 text-white"/>}</div>
                      <span className={`${d?'line-through':''} ${dark?'text-gray-400':'text-gray-600'}`}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={`absolute -top-4 -right-4 rounded-xl px-3 py-2 shadow-lg text-xs font-semibold flex items-center gap-2 ${dark?'bg-gray-800 text-green-400':'bg-white text-green-600'}`}><span className="w-2 h-2 bg-green-400 rounded-full"/> ЕГЭ: 94 балла!</div>
            <div className={`absolute -bottom-4 -left-4 rounded-xl px-3 py-2 shadow-lg text-xs font-semibold ${dark?'bg-gray-800 text-indigo-400':'bg-white text-indigo-600'}`}>🎓 Поступила в МГУ</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── WHY FREE ──────────────────────────────────────────────────────────────────
const WhyFree = ({ dark }) => {
  const items = [
    { icon:'target', col:'red',    title:'Нет системы',              desc:'Разрозненные видео без чёткого плана — непонятно, с чего начать.', stat:'73% теряются без структуры' },
    { icon:'msg',    col:'orange', title:'Нет персонального фидбека', desc:'Бесплатные курсы не объясняют твои конкретные ошибки.',            stat:'2× медленнее без разбора' },
    { icon:'fire',   col:'yellow', title:'Сложно держать мотивацию', desc:'Без дедлайнов и поддержки большинство бросают за 2–3 недели.',     stat:'89% не доходят до конца' },
    { icon:'book',   col:'blue',   title:'Только база без практики', desc:'Бесплатные материалы дают теорию, но нужна отточенная практика.',  stat:'Разница — 15–20 пунктов' },
  ];
  const colors = {
    red:    { bg: dark ? 'bg-red-900/20'    : 'bg-red-50',    tx: 'text-red-500'    },
    orange: { bg: dark ? 'bg-orange-900/20' : 'bg-orange-50', tx: 'text-orange-500' },
    yellow: { bg: dark ? 'bg-yellow-900/20' : 'bg-yellow-50', tx: 'text-yellow-500' },
    blue:   { bg: dark ? 'bg-blue-900/20'   : 'bg-blue-50',   tx: 'text-blue-500'   },
  };
  return (
    <section id="about" className={`py-24 ${dark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${dark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'}`}>Почему бесплатного недостаточно?</div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>Вот почему 9 из 10 не достигают цели</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(p => {
            const c = colors[p.col];
            return (
              <div key={p.title} className={`card-hover rounded-2xl p-6 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-4`}><Icon name={p.icon} cls={`w-6 h-6 ${c.tx}`}/></div>
                <h3 className={`font-bold text-lg mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>{p.title}</h3>
                <p className={`text-sm leading-relaxed mb-4 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{p.desc}</p>
                <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${c.bg} ${c.tx}`}>{p.stat}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ── SMART PATH ────────────────────────────────────────────────────────────────
const SmartPath = ({ dark, setPage }) => (
  <section id="how" className={`py-24 ${dark ? 'bg-gray-950' : 'bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-slate-50'}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16 space-y-4">
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${dark ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-50 text-indigo-700'}`}>Smart Learning Path</div>
        <h2 className={`text-3xl sm:text-4xl font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>Всё что нужно для <span className="gradient-text">реального результата</span></h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {[
          { icon:'brain',  title:'AI-план подготовки',    desc:'Персональный план с учётом уровня, цели и времени до экзамена.' },
          { icon:'users',  title:'Личный ментор',         desc:'Куратор разбирает твои ошибки и поддерживает мотивацию.' },
          { icon:'chart',  title:'Еженедельный прогресс', desc:'Отчёты: что освоил, слабые места, сколько баллов до цели.' },
          { icon:'zap',    title:'Мини-тесты',            desc:'Ежедневные тренировки по 15 минут — максимальный эффект.' },
          { icon:'map',    title:'Роадмап до экзамена',   desc:'Пошаговый маршрут от текущего уровня до целевого балла.' },
          { icon:'trophy', title:'Streak и геймификация', desc:'Очки, бейджи и рейтинг — обучение становится игрой.' },
        ].map(f => (
          <div key={f.title} className={`card-hover rounded-2xl p-6 border ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-4 shadow-md"><Icon name={f.icon} cls="w-6 h-6 text-white"/></div>
            <h3 className={`font-bold text-lg mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>{f.title}</h3>
            <p className={`text-sm leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{f.desc}</p>
          </div>
        ))}
      </div>
      <div className="text-center">
        <button onClick={() => setPage('dashboard')} className="btn-primary text-white font-semibold px-8 py-4 rounded-xl shadow-lg inline-flex items-center gap-2">
          Открыть демо дашборд <Icon name="arrow" cls="w-4 h-4"/>
        </button>
      </div>
    </div>
  </section>
);

// ── SOCIAL PROOF ──────────────────────────────────────────────────────────────
const SocialProof = ({ dark }) => (
  <section id="reviews" className={`py-24 ${dark ? 'bg-gray-900' : 'bg-white'}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className={`text-3xl sm:text-4xl font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>Тысячи учеников уже <span className="gradient-text">достигли цели</span></h2>
      </div>
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 rounded-3xl p-8 ${dark ? 'bg-gray-800' : 'bg-gradient-to-br from-indigo-50 to-purple-50'}`}>
        {[['3 200+','поступили'],['87%','на бюджет'],['94','средний балл'],['420+','призёров']].map(([n,l]) => (
          <div key={l} className="text-center"><div className="text-3xl sm:text-4xl font-extrabold gradient-text mb-1">{n}</div><div className={`text-sm ${dark?'text-gray-400':'text-gray-600'}`}>{l}</div></div>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {[
          { name:'Алина Морозова', role:'МГУ, 94 балла ЕГЭ', av:'АМ', text:'За 4 месяца поднялась с 67 до 94 баллов. Ментор разбирал каждую ошибку — без этого не поступила бы!' },
          { name:'Дмитрий Казаков', role:'Призёр ВсОШ по физике', av:'ДК', text:'AI-план показал именно те темы, где были пробелы. Результат — диплом III степени ВсОШ.' },
          { name:'Карина Юсупова', role:'ВШЭ на бюджет', av:'КЮ', text:'Стрик-система не давала бросить — 7 месяцев и 88 баллов по обществознанию!' },
        ].map(r => (
          <div key={r.name} className={`card-hover rounded-2xl p-6 border ${dark?'bg-gray-800 border-gray-700':'bg-white border-gray-100 shadow-sm'}`}>
            <div className="flex gap-1 mb-4">{[1,2,3,4,5].map(i=><Icon key={i} name="star" cls="w-4 h-4 text-yellow-400"/>)}</div>
            <p className={`text-sm leading-relaxed mb-5 ${dark?'text-gray-300':'text-gray-700'}`}>"{r.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-xs">{r.av}</div>
              <div><div className={`font-semibold text-sm ${dark?'text-white':'text-gray-900'}`}>{r.name}</div><div className="text-xs text-gray-500">{r.role}</div></div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid sm:grid-cols-3 gap-6">
        {[['Иван П.','58 б.','91 б.','Математика'],['Мария С.','62 б.','88 б.','Русский язык'],['Артём Л.','71 б.','97 б.','Физика']].map(([n,b,a,s])=>(
          <div key={n} className={`rounded-2xl p-5 border ${dark?'bg-gray-800 border-gray-700':'bg-white border-gray-100 shadow-sm'}`}>
            <div className={`text-xs font-semibold mb-4 ${dark?'text-gray-500':'text-gray-500'}`}>{n} · {s}</div>
            <div className="flex items-center gap-4">
              <div className="flex-1 text-center"><div className="text-xs mb-1 text-gray-500">ДО</div><div className="text-2xl font-extrabold text-red-500">{b}</div></div>
              <Icon name="arrow" cls="w-6 h-6 text-gray-400"/>
              <div className="flex-1 text-center"><div className="text-xs mb-1 text-gray-500">ПОСЛЕ</div><div className="text-2xl font-extrabold text-green-500">{a}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── FREEMIUM FLOW ─────────────────────────────────────────────────────────────
const FreemiumFlow = ({ dark, setModal }) => (
  <section className={`py-24 ${dark ? 'bg-gray-950' : 'bg-gradient-to-br from-slate-50 to-blue-50/40'}`}>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16 space-y-4">
        <h2 className={`text-3xl sm:text-4xl font-extrabold ${dark?'text-white':'text-gray-900'}`}>От бесплатного к <span className="gradient-text">результату</span></h2>
        <p className={`text-lg ${dark?'text-gray-400':'text-gray-600'}`}>Начинаешь бесплатно и платишь только когда видишь результат.</p>
      </div>
      <div className="space-y-6">
        {[
          { icon:'play',   title:'Бесплатный вебинар',       desc:'Посети живое занятие, узнай о пробелах.',              badge:'Бесплатно',   grad:'from-blue-500 to-cyan-500' },
          { icon:'target', title:'Персональная диагностика', desc:'AI-тест строит индивидуальный план за 10 минут.',       badge:'Бесплатно',   grad:'from-purple-500 to-pink-500' },
          { icon:'zap',    title:'Пробная неделя',           desc:'Полный доступ: ментор, AI-план, прогресс-трекер.',     badge:'7 дней Free', grad:'from-orange-500 to-yellow-500' },
          { icon:'trophy', title:'Premium подписка',         desc:'Полный доступ и поддержка до самого экзамена.',        badge:'Premium',     grad:'from-indigo-500 to-purple-600' },
        ].map(s => (
          <div key={s.title} className="flex gap-5 items-start">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.grad} flex items-center justify-center flex-shrink-0 shadow-lg`}><Icon name={s.icon} cls="w-6 h-6 text-white"/></div>
            <div className={`flex-1 rounded-2xl border p-5 card-hover ${dark?'bg-gray-900 border-gray-800':'bg-white border-gray-100 shadow-sm'}`}>
              <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold mb-2 bg-gradient-to-r ${s.grad} text-white`}>{s.badge}</div>
              <h3 className={`font-bold text-lg ${dark?'text-white':'text-gray-900'}`}>{s.title}</h3>
              <p className={`text-sm mt-1 ${dark?'text-gray-400':'text-gray-600'}`}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <button onClick={() => setModal('signup')} className="btn-primary text-white font-semibold px-10 py-4 rounded-xl text-base shadow-lg inline-flex items-center gap-2">
          Начать бесплатно <Icon name="arrow" cls="w-4 h-4"/>
        </button>
      </div>
    </div>
  </section>
);

// ── PRICING ───────────────────────────────────────────────────────────────────
const Pricing = ({ dark, setModal, setPage }) => {
  const plans = [
    { name:'Free',    price:'0',     hl:false, desc:'Попробуй без риска',            features:['1 вебинар/мес','AI-диагностика','Базовый план','20 уроков'], missing:['Личный ментор','Прогресс-отчёты','Все тесты'], cta:'Начать бесплатно', fn:() => setModal('signup') },
    { name:'Pro',     price:'2 990', hl:true,  desc:'Всё для серьёзной подготовки', badge:'Популярный', features:['Всё из Free','AI-план','Прогресс-отчёты','Все тесты','Роадмап','Streak + геймификация','Все уроки'], missing:[], cta:'Начать Pro', fn:() => setPage('payment') },
    { name:'Mentor+', price:'5 990', hl:false, desc:'Максимальный результат',        features:['Всё из Pro','8 сессий с ментором/мес','Разбор ошибок','Пробные экзамены','Гарантия*'], missing:[], cta:'Выбрать ментора', fn:() => setPage('mentor') },
  ];
  return (
    <section id="pricing" className={`py-24 ${dark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16"><h2 className={`text-3xl sm:text-4xl font-extrabold ${dark?'text-white':'text-gray-900'}`}>Прозрачные цены без скрытых платежей</h2></div>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map(p => (
            <div key={p.name} className={`relative rounded-3xl p-7 border transition-all ${p.hl ? 'gradient-bg text-white shadow-2xl scale-105 border-transparent' : dark ? 'bg-gray-800 border-gray-700 hover:border-indigo-700' : 'bg-white border-gray-200 hover:border-indigo-300 shadow-sm hover:shadow-lg'}`}>
              {p.badge && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full">{p.badge}</div>}
              <div className="mb-6">
                <div className={`text-sm font-semibold mb-1 ${p.hl ? 'text-white/80' : dark?'text-gray-400':'text-gray-500'}`}>{p.name}</div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold ${p.hl ? 'text-white' : dark?'text-white':'text-gray-900'}`}>{p.price==='0'?'Free':`₽${p.price}`}</span>
                  {p.price!=='0' && <span className={`text-sm ${p.hl?'text-white/70':'text-gray-500'}`}>/мес</span>}
                </div>
              </div>
              <button onClick={p.fn} className={`w-full py-3 rounded-xl font-semibold text-sm transition-all mb-6 ${p.hl ? 'bg-white text-indigo-700 hover:bg-gray-100' : 'btn-primary text-white'}`}>{p.cta}</button>
              <div className="space-y-2.5">
                {p.features.map(f => (
                  <div key={f} className="flex items-start gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${p.hl?'bg-white/20':'bg-green-100'}`}><Icon name="check" cls={`w-2.5 h-2.5 ${p.hl?'text-white':'text-green-600'}`}/></div>
                    <span className={`text-sm ${p.hl?'text-white/90':dark?'text-gray-300':'text-gray-700'}`}>{f}</span>
                  </div>
                ))}
                {p.missing.map(f => (
                  <div key={f} className="flex items-start gap-2.5 opacity-40">
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${dark?'bg-gray-700':'bg-gray-100'}`}><Icon name="x" cls="w-2.5 h-2.5 text-gray-400"/></div>
                    <span className={`text-sm ${dark?'text-gray-500':'text-gray-400'}`}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── FINAL CTA ─────────────────────────────────────────────────────────────────
const FinalCTA = ({ setModal }) => (
  <section className="py-24 gradient-bg relative overflow-hidden">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative">
      <div className="text-5xl">🎓</div>
      <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">Начни свой путь к поступлению уже сегодня</h2>
      <p className="text-lg text-white/75 max-w-2xl mx-auto">Присоединяйся к 3 200 ученикам, которые уже готовятся с StudyBridge.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button onClick={() => setModal('quiz')} className="bg-white text-indigo-700 font-bold px-10 py-4 rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:-translate-y-1 inline-flex items-center justify-center gap-2">
          Получить персональный план <Icon name="arrow" cls="w-4 h-4"/>
        </button>
        <button onClick={() => setModal('signup')} className="bg-white/10 border border-white/30 text-white font-semibold px-10 py-4 rounded-xl hover:bg-white/20 transition-all">
          Попробовать бесплатно
        </button>
      </div>
    </div>
  </section>
);

// ── FOOTER ────────────────────────────────────────────────────────────────────
const Footer = ({ dark, setPage }) => (
  <footer className={`py-12 border-t ${dark?'bg-gray-950 border-gray-800':'bg-gray-50 border-gray-200'}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        <div className="space-y-3">
          <button onClick={() => setPage('home')} className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center"><span className="text-white font-black text-xs">SB</span></div>
            <span className={`font-bold text-lg ${dark?'text-white':'text-gray-900'}`}>StudyBridge</span>
          </button>
          <p className={`text-sm ${dark?'text-gray-400':'text-gray-600'}`}>Умная подготовка к экзаменам и поступлению в университет</p>
        </div>
        {[{t:'Продукт',l:['О платформе','Как работает','Тарифы']},{t:'Ученикам',l:['ЕГЭ','Олимпиады','Менторы']},{t:'Компания',l:['О нас','Блог','Контакты']}].map(col=>(
          <div key={col.t}>
            <div className={`font-semibold text-sm mb-4 ${dark?'text-white':'text-gray-900'}`}>{col.t}</div>
            <div className="space-y-2.5">{col.l.map(l=><a key={l} href="#" className={`block text-sm ${dark?'text-gray-400 hover:text-white':'text-gray-600 hover:text-gray-900'} transition-colors`}>{l}</a>)}</div>
          </div>
        ))}
      </div>
      <div className={`border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 ${dark?'border-gray-800 text-gray-600':'border-gray-200 text-gray-400'}`}>
        <div className="text-xs">© 2024 StudyBridge. Все права защищены.</div>
        <div className="flex gap-6">{['Политика','Условия'].map(l=><a key={l} href="#" className="text-xs hover:opacity-80">{l}</a>)}</div>
      </div>
    </div>
  </footer>
);

// ── AUTH MODAL ────────────────────────────────────────────────────────────────
const AuthModal = ({ type, dark, onClose, onSuccess }) => {
  const [tab, setTab]       = useState(type === 'signup' ? 'signup' : 'login');
  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      const body = tab === 'signup' ? { name, email, password: pass } : { email, password: pass };
      const data = await apiFetch(`/api/auth/${tab === 'signup' ? 'register' : 'login'}`, {
        method: 'POST', body: JSON.stringify(body),
      });
      setToken(data.token);
      onSuccess(data.user);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className={`w-full max-w-md rounded-3xl shadow-2xl relative ${dark?'bg-gray-900 border border-gray-800':'bg-white'}`} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} className={`absolute top-4 right-4 p-2 rounded-lg ${dark?'hover:bg-gray-800 text-gray-400':'hover:bg-gray-100 text-gray-500'}`}><Icon name="x" cls="w-4 h-4"/></button>
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"><span className="text-white font-black text-sm">SB</span></div>
            <h2 className={`text-xl font-bold ${dark?'text-white':'text-gray-900'}`}>{tab==='login'?'Добро пожаловать!':'Начни бесплатно'}</h2>
          </div>
          <div className={`flex rounded-xl p-1 mb-6 ${dark?'bg-gray-800':'bg-gray-100'}`}>
            {['login','signup'].map(t=>(
              <button key={t} onClick={()=>setTab(t)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab===t?`${dark?'bg-gray-700 text-white':'bg-white text-gray-900'} shadow`:'text-gray-500'}`}>
                {t==='login'?'Войти':'Регистрация'}
              </button>
            ))}
          </div>
          {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>}
          <div className="space-y-4">
            {tab==='signup' && (
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${dark?'text-gray-400':'text-gray-600'}`}>Имя</label>
                <input value={name} onChange={e=>setName(e.target.value)} type="text" placeholder="Алина Морозова" className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${dark?'bg-gray-800 border-gray-700 text-white placeholder-gray-500':'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}/>
              </div>
            )}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${dark?'text-gray-400':'text-gray-600'}`}>Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="alina@example.com" className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${dark?'bg-gray-800 border-gray-700 text-white placeholder-gray-500':'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}/>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${dark?'text-gray-400':'text-gray-600'}`}>Пароль</label>
              <input value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} type="password" placeholder="••••••••" className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${dark?'bg-gray-800 border-gray-700 text-white placeholder-gray-500':'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}/>
            </div>
            <button onClick={submit} disabled={loading} className="btn-primary w-full text-white font-semibold py-3.5 rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
              {loading&&<Spinner cls="w-4 h-4"/>}{tab==='login'?'Войти':'Создать аккаунт'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── QUIZ MODAL ────────────────────────────────────────────────────────────────
const QuizModal = ({ dark, onClose, onSuccess }) => {
  const [step, setStep]     = useState(0);
  const [answers, setAnswers] = useState({});
  const questions = [
    { q:'Что ты готовишь?',         opts:['ЕГЭ','ОГЭ','Олимпиады','Поступление за рубеж'] },
    { q:'Главный предмет?',         opts:['Математика','Физика','Химия','Биология','Русский язык','Обществознание','История','Информатика'] },
    { q:'Когда экзамен?',           opts:['Менее 3 мес.','3–6 месяцев','6–12 месяцев','Больше года'] },
    { q:'Время в день?',            opts:['30–60 минут','1–2 часа','2–4 часа','Более 4 часов'] },
    { q:'Текущий уровень?',         opts:['Только начинаю','Базовый','Средний','Продвинутый'] },
  ];
  const handleAnswer = async (opt) => {
    const newA = { ...answers, [step]: opt };
    setAnswers(newA);
    if (step < questions.length - 1) { setStep(step + 1); return; }
    try { if (getToken()) await apiFetch('/api/onboarding', { method:'POST', body: JSON.stringify({ answers: newA }) }); } catch {}
    setStep(questions.length);
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`w-full max-w-md rounded-3xl shadow-2xl relative ${dark?'bg-gray-900 border border-gray-800':'bg-white'}`} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} className={`absolute top-4 right-4 p-2 rounded-lg ${dark?'hover:bg-gray-800 text-gray-400':'hover:bg-gray-100 text-gray-500'}`}><Icon name="x" cls="w-4 h-4"/></button>
        <div className="p-8">
          {step < questions.length ? (
            <>
              <div className="mb-6">
                <div className={`text-xs font-semibold mb-2 ${dark?'text-gray-500':'text-gray-500'}`}>Вопрос {step+1} из {questions.length}</div>
                <div className={`h-1.5 rounded-full ${dark?'bg-gray-800':'bg-gray-200'}`}><div className="h-full rounded-full gradient-bg transition-all duration-500" style={{width:`${((step+1)/questions.length)*100}%`}}/></div>
              </div>
              <h3 className={`text-xl font-bold mb-5 ${dark?'text-white':'text-gray-900'}`}>{questions[step].q}</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {questions[step].opts.map(opt=>(
                  <button key={opt} onClick={()=>handleAnswer(opt)} className={`py-3 px-3 rounded-xl border text-sm font-medium text-left transition-all ${dark?'border-gray-700 text-gray-300 hover:border-indigo-600 hover:bg-indigo-900/20':'border-gray-200 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50'}`}>{opt}</button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center space-y-5 py-4">
              <div className="text-5xl">🎉</div>
              <h3 className={`text-2xl font-extrabold ${dark?'text-white':'text-gray-900'}`}>Твой план готов!</h3>
              <p className={`text-sm ${dark?'text-gray-400':'text-gray-600'}`}>Зарегистрируйся, чтобы получить персональный план.</p>
              <button onClick={onSuccess} className="btn-primary w-full text-white font-semibold py-4 rounded-xl shadow-lg">Получить мой план →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── DASHBOARD PAGE ────────────────────────────────────────────────────────────
const DEMO_DATA = {
  user: { name:'Гость', plan:'free', streak:1, goal_score:90, exam_subject:'Математика' },
  stats: { progress:72, goal_score:90, completed_tasks:1, total_tasks:4, rating:42 },
  tasks: [
    { id:1, title:'Тригонометрия: тест 12 задач', emoji:'📐', completed:true },
    { id:2, title:'Разбор пробника с ментором',   emoji:'📋', completed:false },
    { id:3, title:'Теория вероятностей: урок',     emoji:'📖', completed:false },
    { id:4, title:'Повторение: производные',       emoji:'🔄', completed:false },
  ],
  progress: [
    { topic:'Алгебра', percentage:95 }, { topic:'Геометрия', percentage:72 },
    { topic:'Тригонометрия', percentage:48 }, { topic:'Стереометрия', percentage:25 },
    { topic:'Теория вероятностей', percentage:15 },
  ],
  next_session: null,
};

const DashboardPage = ({ dark, setPage, user, showToast }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    if (!getToken()) { setData({ ...DEMO_DATA, user: { ...DEMO_DATA.user, name: user?.name || 'Гость' } }); setLoading(false); return; }
    apiFetch('/api/dashboard')
      .then(setData)
      .catch(() => setData(DEMO_DATA))
      .finally(() => setLoading(false));
    apiFetch('/api/streak', { method:'POST' }).catch(() => {});
  }, []);

  const toggleTask = async (id) => {
    setData(d => ({ ...d, tasks: d.tasks.map(t => t.id===id ? {...t, completed:!t.completed} : t) }));
    if (getToken()) apiFetch(`/api/tasks/${id}/complete`, { method:'PUT' }).catch(() => {});
  };

  const deleteTask = async (id) => {
    setData(d => ({ ...d, tasks: d.tasks.filter(t => t.id!==id) }));
    if (getToken()) apiFetch(`/api/tasks/${id}`, { method:'DELETE' }).catch(() => {});
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    const tmp = { id: Date.now(), title: newTask, emoji:'📋', completed:false };
    setData(d => ({ ...d, tasks: [...d.tasks, tmp] }));
    const taskTitle = newTask;
    setNewTask('');
    if (getToken()) {
      try {
        const created = await apiFetch('/api/tasks', { method:'POST', body: JSON.stringify({ title: taskTitle }) });
        setData(d => ({ ...d, tasks: d.tasks.map(t => t.id===tmp.id ? created : t) }));
        showToast('Задача добавлена ✓');
      } catch (e) { showToast(e.message, 'error'); }
    }
  };

  const getBarColor = (p) => p>=80?'bg-green-500':p>=50?'bg-indigo-500':p>=30?'bg-orange-500':'bg-red-500';

  if (loading) return (
    <div className={`min-h-screen pt-16 flex items-center justify-center ${dark?'bg-gray-950':'bg-gray-50'}`}>
      <div className="text-center space-y-4"><Spinner cls="w-10 h-10 text-indigo-500 mx-auto"/><p className={`text-sm ${dark?'text-gray-500':'text-gray-400'}`}>Загружаем данные...</p></div>
    </div>
  );
  if (!data) return null;
  const { stats, tasks, progress, next_session } = data;

  return (
    <div className={`min-h-screen ${dark?'bg-gray-950':'bg-gray-50'}`}>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 border-r hidden lg:flex flex-col z-40 ${dark?'bg-gray-900 border-gray-800':'bg-white border-gray-200'}`}>
        <div className={`p-5 border-b ${dark?'border-gray-800':'border-gray-100'}`}>
          <button onClick={() => setPage('home')} className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center"><span className="text-white font-black text-xs">SB</span></div>
            <span className={`font-bold ${dark?'text-white':'text-gray-900'}`}>StudyBridge</span>
          </button>
        </div>
        <div className="p-4 flex-1 space-y-1">
          {[{icon:'home',label:'Обзор'},{icon:'check',label:'Задачи'},{icon:'chart',label:'Прогресс'},{icon:'users',label:'Ментор'}].map((t,i) => (
            <button key={t.label} onClick={() => i===3&&setPage('mentor')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${i===0?'gradient-bg text-white shadow-md':dark?'text-gray-400 hover:bg-gray-800 hover:text-white':'text-gray-600 hover:bg-gray-100'}`}>
              <Icon name={t.icon} cls="w-4 h-4"/> {t.label}
            </button>
          ))}
        </div>
        <div className={`p-4 border-t ${dark?'border-gray-800':'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-xs">{data.user.name[0]}</div>
            <div><div className={`text-sm font-semibold ${dark?'text-white':'text-gray-900'}`}>{data.user.name.split(' ')[0]}</div><div className="text-xs text-gray-500 capitalize">{data.user.plan}</div></div>
          </div>
        </div>
      </div>

      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className={`sticky top-0 z-30 px-6 py-4 border-b flex items-center justify-between ${dark?'bg-gray-950 border-gray-800':'bg-white border-gray-200'}`}>
          <div>
            <h1 className={`text-xl font-bold ${dark?'text-white':'text-gray-900'}`}>Привет, {data.user.name.split(' ')[0]}! 👋</h1>
            <p className={`text-sm ${dark?'text-gray-500':'text-gray-500'}`}>{data.user.exam_subject} · цель {data.user.goal_score} баллов</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold ${dark?'bg-orange-900/30 text-orange-400':'bg-orange-50 text-orange-600'}`}>
            <Icon name="fire" cls="w-4 h-4"/> {data.user.streak} {data.user.streak===1?'день':'дней'}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {!getToken() && (
            <div className={`rounded-2xl border p-4 flex items-center justify-between gap-4 ${dark?'bg-indigo-900/20 border-indigo-800':'bg-indigo-50 border-indigo-200'}`}>
              <div><div className={`font-semibold text-sm ${dark?'text-white':'text-gray-900'}`}>Это демо-режим</div><div className={`text-xs ${dark?'text-indigo-400':'text-indigo-700'}`}>Войди или зарегистрируйся — данные сохранятся в базе</div></div>
              <button onClick={() => setPage('home')} className="btn-primary text-white text-xs font-semibold px-4 py-2 rounded-lg flex-shrink-0">Войти →</button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon:'chart',  label:'Прогресс', value:`${stats.progress}%`,           sub:'+8% за неделю',     color:'text-indigo-600', bg:dark?'bg-indigo-900/20':'bg-indigo-50' },
              { icon:'target', label:'Цель',      value:`${stats.goal_score} б.`,       sub:data.user.exam_subject, color:'text-purple-600', bg:dark?'bg-purple-900/20':'bg-purple-50' },
              { icon:'check',  label:'Выполнено', value:`${stats.completed_tasks}/${stats.total_tasks}`, sub:'задач', color:'text-green-600', bg:dark?'bg-green-900/20':'bg-green-50' },
              { icon:'trophy', label:'Рейтинг',   value:`#${stats.rating}`,            sub:'из 420 учеников',   color:'text-orange-500', bg:dark?'bg-orange-900/20':'bg-orange-50' },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl p-5 border ${dark?'bg-gray-900 border-gray-800':'bg-white border-gray-100 shadow-sm'}`}>
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><Icon name={s.icon} cls={`w-4 h-4 ${s.color}`}/></div>
                <div className={`text-xs ${dark?'text-gray-500':'text-gray-500'} mb-1`}>{s.label}</div>
                <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                <div className={`text-xs mt-1 ${dark?'text-gray-600':'text-gray-400'}`}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Progress bars */}
            <div className={`lg:col-span-2 rounded-2xl border p-6 ${dark?'bg-gray-900 border-gray-800':'bg-white border-gray-100 shadow-sm'}`}>
              <h3 className={`font-bold mb-5 ${dark?'text-white':'text-gray-900'}`}>Прогресс по темам</h3>
              <div className="space-y-4">
                {progress.map(({ topic, percentage }) => (
                  <div key={topic}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className={dark?'text-gray-300':'text-gray-700'}>{topic}</span>
                      <span className={`font-semibold ${dark?'text-gray-400':'text-gray-600'}`}>{percentage}%</span>
                    </div>
                    <div className={`h-2 rounded-full ${dark?'bg-gray-800':'bg-gray-100'}`}>
                      <div className={`h-full rounded-full ${getBarColor(percentage)} transition-all duration-1000`} style={{width:`${percentage}%`}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div className={`rounded-2xl border p-6 ${dark?'bg-gray-900 border-gray-800':'bg-white border-gray-100 shadow-sm'}`}>
              <h3 className={`font-bold mb-4 ${dark?'text-white':'text-gray-900'}`}>Задачи</h3>
              <div className="space-y-2 mb-4">
                {tasks.map(t => (
                  <div key={t.id} className={`flex items-center gap-2.5 p-2.5 rounded-xl group transition-colors ${t.completed?dark?'bg-green-900/10':'bg-green-50':dark?'hover:bg-gray-800':'hover:bg-gray-50'}`}>
                    <button onClick={()=>toggleTask(t.id)} className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all ${t.completed?'gradient-bg':dark?'border-2 border-gray-600 hover:border-indigo-500':'border-2 border-gray-300 hover:border-indigo-400'}`}>
                      {t.completed&&<Icon name="check" cls="w-3 h-3 text-white"/>}
                    </button>
                    <span className="text-sm mr-1">{t.emoji}</span>
                    <span className={`text-sm flex-1 ${t.completed?'line-through text-gray-400':dark?'text-gray-300':'text-gray-700'}`}>{t.title}</span>
                    <button onClick={()=>deleteTask(t.id)} className={`opacity-0 group-hover:opacity-100 p-1 rounded ${dark?'hover:bg-gray-700 text-gray-500':'hover:bg-gray-200 text-gray-400'}`}><Icon name="trash" cls="w-3.5 h-3.5"/></button>
                  </div>
                ))}
              </div>
              <div className={`flex gap-2 pt-3 border-t ${dark?'border-gray-800':'border-gray-100'}`}>
                <input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTask()} placeholder="Новая задача..." className={`flex-1 text-sm px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500 ${dark?'bg-gray-800 border-gray-700 text-white placeholder-gray-500':'bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400'}`}/>
                <button onClick={addTask} className="btn-primary text-white p-2 rounded-lg"><Icon name="plus" cls="w-4 h-4"/></button>
              </div>
            </div>
          </div>

          {/* Mentor / session */}
          {next_session ? (
            <div className={`rounded-2xl border p-5 flex items-center justify-between flex-wrap gap-4 ${dark?'bg-indigo-900/20 border-indigo-800':'bg-indigo-50 border-indigo-200'}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold">{next_session.mentor_avatar}</div>
                <div><div className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>{next_session.mentor_name}</div><div className={`text-sm ${dark?'text-indigo-400':'text-indigo-700'} capitalize`}>Статус: {next_session.status}</div></div>
              </div>
              <button onClick={()=>setPage('mentor')} className="btn-primary text-white font-semibold px-5 py-2.5 rounded-xl text-sm">Управление</button>
            </div>
          ) : (
            <div className={`rounded-2xl border p-5 flex items-center justify-between flex-wrap gap-4 ${dark?'bg-gray-900 border-gray-800':'bg-white border-gray-200 shadow-sm'}`}>
              <div><div className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>Нет активного ментора</div><div className={`text-sm ${dark?'text-gray-500':'text-gray-500'}`}>Забронируй сессию и ускорь подготовку в 2 раза</div></div>
              <button onClick={()=>setPage('mentor')} className="btn-primary text-white font-semibold px-5 py-2.5 rounded-xl text-sm">Найти ментора</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── MENTOR PAGE ───────────────────────────────────────────────────────────────
const MentorPage = ({ dark, setPage, showToast }) => {
  const [mentors, setMentors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [booking, setBooking]   = useState(false);
  const [booked, setBooked]     = useState(null);

  useEffect(() => {
    apiFetch('/api/mentors')
      .catch(() => ([
        { id:1, name:'Михаил Андреев',   subjects:'Математика, Физика',       rating:4.9, reviews:128, experience:'8 лет', price:'2 500 ₽/сессия', avatar:'МА', tag:'Топ-ментор',   students:240, university:'МФТИ' },
        { id:2, name:'Екатерина Волкова', subjects:'Русский язык, Литература', rating:4.8, reviews:94,  experience:'6 лет', price:'2 000 ₽/сессия', avatar:'ЕВ', tag:'Эксперт ЕГЭ', students:180, university:'МГУ' },
        { id:3, name:'Артём Смирнов',    subjects:'Химия, Биология',          rating:4.9, reviews:76,  experience:'5 лет', price:'2 200 ₽/сессия', avatar:'АС', tag:'Олимпиадник',  students:130, university:'Сеченовский' },
        { id:4, name:'Анна Козлова',     subjects:'Обществознание, История',  rating:4.7, reviews:112, experience:'7 лет', price:'1 800 ₽/сессия', avatar:'АК', tag:'',             students:200, university:'ВШЭ' },
      ]))
      .then(setMentors)
      .finally(() => setLoading(false));
  }, []);

  const handleBook = async () => {
    if (!selected) return;
    setBooking(true);
    try {
      if (getToken()) await apiFetch(`/api/mentors/${selected}/book`, { method:'POST', body:'{}' });
      setBooked(mentors.find(m => m.id === selected));
      showToast('Сессия забронирована! 🎉');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setBooking(false); }
  };

  if (booked) return (
    <div className={`min-h-screen pt-16 flex items-center justify-center ${dark?'bg-gray-950':'bg-gray-50'}`}>
      <div className={`max-w-md w-full rounded-3xl p-12 text-center border ${dark?'bg-gray-900 border-gray-800':'bg-white border-gray-200 shadow-sm'}`}>
        <div className="text-6xl mb-4">🎉</div>
        <h2 className={`text-2xl font-extrabold mb-3 ${dark?'text-white':'text-gray-900'}`}>Забронировано!</h2>
        <p className={`mb-6 ${dark?'text-gray-400':'text-gray-600'}`}>{booked.name} свяжется в течение 30 минут.</p>
        <button onClick={()=>setPage('dashboard')} className="btn-primary text-white font-semibold px-8 py-3.5 rounded-xl">В дашборд</button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen pt-16 ${dark?'bg-gray-950':'bg-gray-50'}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={()=>setPage('home')} className={`flex items-center gap-2 text-sm mb-6 ${dark?'text-gray-400 hover:text-white':'text-gray-600 hover:text-gray-900'}`}>← Назад</button>
        <h1 className={`text-3xl font-extrabold mb-2 ${dark?'text-white':'text-gray-900'}`}>Выбери ментора</h1>
        <p className={`mb-8 ${dark?'text-gray-400':'text-gray-600'}`}>Все менторы — преподаватели ведущих вузов с опытом ЕГЭ и олимпиад</p>
        {loading ? <div className="flex justify-center py-20"><Spinner cls="w-8 h-8 text-indigo-500"/></div> : (
          <div className="grid md:grid-cols-2 gap-5">
            {mentors.map(m => (
              <div key={m.id} onClick={()=>setSelected(m.id)} className={`card-hover rounded-2xl border p-5 cursor-pointer transition-all ring-offset-2 ${selected===m.id?'border-indigo-500 ring-2 ring-indigo-500':dark?'bg-gray-900 border-gray-800':'bg-white border-gray-200 shadow-sm'} ${dark&&selected===m.id?'ring-offset-gray-950':''}`}>
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white font-bold text-lg">{m.avatar}</div>
                    {m.tag && <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">{m.tag}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold ${dark?'text-white':'text-gray-900'}`}>{m.name}</div>
                    <div className={`text-xs mt-0.5 ${dark?'text-gray-500':'text-gray-500'}`}>{m.university} · {m.experience}</div>
                    <div className={`text-xs mt-1 ${dark?'text-gray-400':'text-gray-600'}`}>{m.subjects}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-yellow-500 font-semibold"><Icon name="star" cls="w-3 h-3"/>{m.rating}</span>
                      <span className={`text-xs ${dark?'text-gray-500':'text-gray-400'}`}>{m.reviews} отзывов</span>
                    </div>
                  </div>
                  <div className="gradient-text font-bold text-sm flex-shrink-0">{m.price}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {selected && (
          <div className="mt-6 text-center">
            <button onClick={handleBook} disabled={booking} className="btn-primary text-white font-bold px-10 py-4 rounded-xl text-base shadow-xl inline-flex items-center gap-2 disabled:opacity-60">
              {booking?<Spinner cls="w-4 h-4"/>:null}
              Забронировать с {mentors.find(m=>m.id===selected)?.name.split(' ')[0]}
              <Icon name="arrow" cls="w-4 h-4"/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── PAYMENT PAGE ──────────────────────────────────────────────────────────────
const PaymentPage = ({ dark, setPage, showToast }) => {
  const [plan, setPlan]     = useState('pro');
  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [num, setNum]       = useState('');
  const [exp, setExp]       = useState('');
  const [cvv, setCvv]       = useState('');

  const pay = async () => {
    if (!num || !exp || !cvv) { showToast('Заполни все поля', 'error'); return; }
    setLoading(true);
    try {
      if (getToken()) await apiFetch('/api/payment', { method:'POST', body: JSON.stringify({ plan }) });
      showToast('Подписка активирована! 🎉');
      setTimeout(() => setPage('dashboard'), 1200);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className={`min-h-screen pt-16 ${dark?'bg-gray-950':'bg-gray-50'}`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <button onClick={()=>setPage('home')} className={`flex items-center gap-2 text-sm mb-6 ${dark?'text-gray-400 hover:text-white':'text-gray-600 hover:text-gray-900'}`}>← Назад</button>
        <h1 className={`text-3xl font-extrabold mb-6 ${dark?'text-white':'text-gray-900'}`}>Оформление подписки</h1>
        {step===1 ? (
          <>
            <div className="space-y-4 mb-6">
              {[{id:'pro',name:'Pro',price:'2 990 ₽/мес',desc:'AI-план, прогресс-трекер, все уроки'},{id:'mentor+',name:'Mentor+',price:'5 990 ₽/мес',desc:'Всё из Pro + личный ментор'}].map(p=>(
                <div key={p.id} onClick={()=>setPlan(p.id)} className={`rounded-2xl border p-5 cursor-pointer transition-all ring-offset-2 ${plan===p.id?'border-indigo-500 ring-2 ring-indigo-500':dark?'border-gray-800 bg-gray-900':'border-gray-200 bg-white'} ${dark&&plan===p.id?'ring-offset-gray-950':''}`}>
                  <div className="flex items-center justify-between">
                    <div><div className={`font-bold ${dark?'text-white':'text-gray-900'}`}>{p.name}</div><div className={`text-sm ${dark?'text-gray-400':'text-gray-600'}`}>{p.desc}</div></div>
                    <div className="font-bold gradient-text">{p.price}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={()=>setStep(2)} className="btn-primary w-full text-white font-bold py-4 rounded-xl text-base shadow-lg">Продолжить → Оплата</button>
          </>
        ) : (
          <div className={`rounded-3xl border p-6 ${dark?'bg-gray-900 border-gray-800':'bg-white border-gray-200 shadow-sm'}`}>
            <div className={`rounded-xl p-4 mb-6 flex items-center justify-between ${dark?'bg-gray-800':'bg-indigo-50'}`}>
              <div><div className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>{plan==='pro'?'Pro план':'Mentor+ план'}</div><div className="text-xs text-gray-500">Отмена в любой момент</div></div>
              <div className="gradient-text font-extrabold text-lg">{plan==='pro'?'2 990 ₽':'5 990 ₽'}/мес</div>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${dark?'text-gray-400':'text-gray-600'}`}>Номер карты</label>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${dark?'bg-gray-800 border-gray-700':'bg-gray-50 border-gray-200'}`}>
                  <Icon name="credit" cls={`w-4 h-4 ${dark?'text-gray-500':'text-gray-400'}`}/>
                  <input value={num} onChange={e=>setNum(e.target.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim())} placeholder="1234 5678 9012 3456" maxLength={19} className={`flex-1 text-sm outline-none bg-transparent ${dark?'text-white placeholder-gray-500':'text-gray-900 placeholder-gray-400'}`}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${dark?'text-gray-400':'text-gray-600'}`}>Срок</label>
                  <input value={exp} onChange={e=>setExp(e.target.value)} placeholder="MM/YY" maxLength={5} className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${dark?'bg-gray-800 border-gray-700 text-white placeholder-gray-500':'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}/>
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${dark?'text-gray-400':'text-gray-600'}`}>CVV</label>
                  <input value={cvv} onChange={e=>setCvv(e.target.value.replace(/\D/g,'').slice(0,3))} placeholder="•••" type="password" maxLength={3} className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${dark?'bg-gray-800 border-gray-700 text-white placeholder-gray-500':'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}/>
                </div>
              </div>
              <button onClick={pay} disabled={loading} className="btn-primary w-full text-white font-bold py-4 rounded-xl text-base shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
                {loading?<Spinner cls="w-4 h-4"/>:<Icon name="lock" cls="w-4 h-4"/>}
                Оплатить {plan==='pro'?'2 990 ₽':'5 990 ₽'}
              </button>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400"><Icon name="lock" cls="w-3 h-3"/> Защищено SSL · Отмена в любое время</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── APP ───────────────────────────────────────────────────────────────────────
const App = () => {
  const [dark, setDark]   = useState(false);
  const [page, setPage]   = useState('home');
  const [modal, setModal] = useState(null);
  const [user, setUser]   = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);

  useEffect(() => {
    if (getToken()) apiFetch('/api/auth/me').then(setUser).catch(clearToken);
  }, []);

  const showToast = useCallback((msg, type='success') => setToast({ msg, type, id: Date.now() }), []);

  const nav = useCallback((p) => { setPage(p); window.scrollTo(0,0); }, []);

  const onAuthSuccess = (u) => {
    setUser(u); setModal(null); nav('dashboard');
    showToast(`Добро пожаловать, ${u.name.split(' ')[0]}! 👋`);
  };

  const onLogout = () => {
    clearToken(); setUser(null); nav('home');
    showToast('Вы вышли из аккаунта');
  };

  return (
    <div className={dark ? 'dark' : ''}>
      <div className={dark ? 'bg-gray-950' : 'bg-white'}>
        <Navbar dark={dark} setDark={setDark} setPage={nav} setModal={setModal} user={user} onLogout={onLogout}/>

        {page==='home' && <>
          <Hero dark={dark} setModal={setModal} setPage={nav}/>
          <WhyFree dark={dark}/>
          <SmartPath dark={dark} setPage={nav}/>
          <SocialProof dark={dark}/>
          <FreemiumFlow dark={dark} setModal={setModal}/>
          <Pricing dark={dark} setModal={setModal} setPage={nav}/>
          <FinalCTA setModal={setModal}/>
          <Footer dark={dark} setPage={nav}/>
        </>}
        {page==='dashboard' && <DashboardPage dark={dark} setPage={nav} user={user} showToast={showToast}/>}
        {page==='mentor'    && <MentorPage    dark={dark} setPage={nav} showToast={showToast}/>}
        {page==='payment'   && <PaymentPage   dark={dark} setPage={nav} showToast={showToast}/>}

        {(modal==='login'||modal==='signup') && <AuthModal type={modal} dark={dark} onClose={()=>setModal(null)} onSuccess={onAuthSuccess}/>}
        {modal==='quiz' && <QuizModal dark={dark} onClose={()=>setModal(null)} onSuccess={()=>setModal('signup')}/>}

        {toast && <Toast key={toast.id} msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
