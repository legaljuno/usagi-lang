import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowRight, BookOpen, Check, ChevronDown, CircleHelp, Clipboard, Code2, CornerDownLeft, Play, RotateCcw, Sparkles, Terminal, Variable } from 'lucide-react';
import { run, UsagiError, type RuntimeState } from '../src/index.js';
import countdown from '../examples/countdown.usa?raw';
import rap from '../examples/rap.usa?raw';
import hello from '../examples/hello.usa?raw';
import rockPaperScissors from '../examples/rock-paper-scissors.usa?raw';
import specUrl from '../docs/SPEC.md?url';
import usagiImage from './assets/usagi.jpg';
import usagiVideo from '../usagi-head-tilt-loop.mp4';
import './style.css';

const examples = [
  { name: '카운트다운', file: 'countdown.usa', code: countdown },
  { name: '우사기 랩', file: 'rap.usa', code: rap },
  { name: '안녕, 세상!', file: 'hello.usa', code: hello },
  { name: '가위바위보', file: 'rock-paper-scissors.usa', code: rockPaperScissors },
];
const hands = [{ name: '가위', emoji: '✌️' }, { name: '바위', emoji: '✊' }, { name: '보', emoji: '🖐️' }];
type Result = { state?: RuntimeState; error?: string; source: string; input: string };
type GameResult = { player: number; computer: number; outcome: number };
const randomInteger = (upperBound: number) => Math.min(upperBound - 1, Math.floor(Math.random() * upperBound));

function UsagiVideo() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePlayback = () => {
      if (preference.matches) video.current?.pause();
      else void video.current?.play().catch(() => {});
    };
    updatePlayback();
    preference.addEventListener('change', updatePlayback);
    return () => preference.removeEventListener('change', updatePlayback);
  }, []);

  return <video ref={video} className="usagi-video" muted loop playsInline preload="metadata" poster={usagiImage}>
    <source src={usagiVideo} type="video/mp4" />
  </video>;
}

function execute(source: string, input = ''): Result {
  const values = input.trim() ? input.split(',') : [];
  try { return { state: run(source, { readInput: () => values.shift(), random: randomInteger }), source, input }; }
  catch (error) {
    return { source, input, state: error instanceof UsagiError ? error.state : undefined, error: error instanceof Error ? error.message : String(error) };
  }
}

function App() {
  const [selected, setSelected] = useState(0);
  const [source, setSource] = useState(examples[0].code);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<Result | null>(() => execute(examples[0].code));
  const [game, setGame] = useState<GameResult | null>(null);
  const [gameError, setGameError] = useState('');
  const [copied, setCopied] = useState(false);
  const gutter = useRef<HTMLDivElement>(null);
  const stale = result !== null && (result.source !== source || result.input !== input);
  const current = stale ? null : result;
  const variables = current?.state ? [...current.state.variables.entries()].sort((a, b) => a[0] - b[0]) : [];
  const lines = source.split('\n').length;
  const chooseExample = (index: number) => { setSelected(index); setSource(examples[index].code); setInput(index === 3 ? '0' : ''); setResult(null); };
  const reset = () => { setSource(examples[selected].code); setInput(selected === 3 ? '0' : ''); setResult(null); };
  const playGame = (player: number) => {
    try {
      const output = run(rockPaperScissors, { readInput: () => player, random: randomInteger }).output.trim().split('\n').map(Number);
      const [computer, outcome] = output;
      if (output.length !== 2 || !Number.isInteger(computer) || computer < 0 || computer > 2 || ![-1, 0, 1].includes(outcome)) {
        throw new Error('게임 결과를 읽지 못했어요.');
      }
      setGame({ player, computer, outcome });
      setGameError('');
    } catch (error) {
      setGame(null);
      setGameError(error instanceof Error ? error.message : '게임을 실행하지 못했어요.');
    }
  };
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch { setCopied(false); }
  };
  return <>
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#top" aria-label="우사기랩 처음으로"><span className="brand-mark"><img src={usagiImage} alt="" /></span><span>usagi<span className="brand-dot">.</span>lab</span></a>
        <nav aria-label="주 메뉴"><a className="active" href="#playground">플레이그라운드</a><a href="#guide">언어 가이드</a></nav>
        <span className="version"><span /> USAGI LANG v0.2</span>
      </div>
    </header>
    <main id="top">
      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14} /> 코딩이 조금 더 즐거워지는 곳</div>
          <h1>우사기의 소리로<br/><span>코딩해 볼까요?</span></h1>
          <p>야하! 이히히! 우라라!<br className="mobile-break"/> 알 수 없는 소리들이 모여<br className="desktop-break"/> 하나의 프로그램이 되는 작은 실험실.</p>
          <a className="hero-link" href="#game">우사기랑 대결하기 <ArrowDown size={16}/></a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/>
          <span className="speech speech-one">야하!</span><span className="speech speech-two">이히히 ♪</span>
          <span className="art-star art-star-one">✳</span><span className="art-star art-star-two">✦</span>
          <div className="bunny-circle"><UsagiVideo /></div>
          <span className="art-caption">LET'S MAKE SOME NOISE!</span>
        </div>
      </section>
      <section id="game" className="game-section wrap">
        <div className="section-heading"><div><div className="section-kicker"><span>01</span> PLAY WITH USAGI</div><h2>우사기랑 한 판! <span>✳</span></h2><p>가위, 바위, 보 중 하나를 골라 보세요.</p></div><button className="game-code-link" onClick={() => { chooseExample(3); document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' }); }}><Code2 size={15}/> 우사기랭 코드 보기 <ArrowRight size={15}/></button></div>
        <div className="game-card">
          <div className="game-choices"><span className="game-eyebrow">YOUR TURN</span><h3>무엇을 낼까요?</h3><p>우사기도 함께 낼 거예요. 준비, 가위바위보!</p><div className="hand-buttons">{hands.map((hand, index) => <button key={hand.name} className={game?.player === index ? 'hand-button selected' : 'hand-button'} onClick={() => playGame(index)} aria-pressed={game?.player === index}><span aria-hidden="true">{hand.emoji}</span><strong>{hand.name}</strong></button>)}</div></div>
          <div className="game-result" aria-live="polite"><div className="duel"><div><small>나</small><span>{game ? hands[game.player].emoji : '?'}</span><strong>{game ? hands[game.player].name : '선택 전'}</strong></div><b>VS</b><div><small>우사기</small><span>{game ? hands[game.computer].emoji : '?'}</span><strong>{game ? hands[game.computer].name : '비밀!'}</strong></div></div><div className={gameError ? 'game-message error' : 'game-message'}>{gameError || (game ? game.outcome === 1 ? '야하! 이겼어요!' : game.outcome === 0 ? '비겼어요! 한 번 더?' : '우사기가 이겼어요! 다시 도전?' : '손을 고르면 결과가 여기에 나타나요')}</div></div>
        </div>
        <button className="game-code-mobile" onClick={() => { chooseExample(3); document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' }); }}><Code2 size={15}/> 우사기랭 코드 보기 <ArrowRight size={15}/></button>
      </section>
      <section id="playground" className="playground-section wrap">
        <div className="section-heading"><div><div className="section-kicker"><span>02</span> PLAYGROUND</div><h2>마음껏 소리쳐 봐요 <span>✳</span></h2><p>예제를 고르거나 직접 코드를 작성하고 실행해 보세요.</p></div><div className="shortcut"><CornerDownLeft size={14}/> Ctrl / ⌘ + Enter 로 실행</div></div>
        <div className="workspace">
          <div className="editor-card">
            <div className="card-heading"><div className="card-title"><span className="icon-box green"><Code2 size={17}/></span><div><strong>코드 에디터</strong><small>우사기에게 할 말을 적어주세요</small></div></div><span className="file-type">.usa</span></div>
            <div className="example-bar"><span className="example-label">예제 불러오기 <ChevronDown size={13}/></span><div className="example-buttons">{examples.map((example, index) => <button className={selected === index ? 'example active' : 'example'} onClick={() => chooseExample(index)} key={example.file}>{example.name}</button>)}</div></div>
            <div className="editor-window">
              <div className="editor-top"><div><span className="window-dots"><i/><i/><i/></span><span className="filename">{examples[selected].file}{source !== examples[selected].code ? ' •' : ''}</span></div><button className="icon-button copy-button" onClick={copyCode} aria-label="코드 복사" title="코드 복사">{copied ? <Check size={16}/> : <Clipboard size={15}/>}<span>{copied ? '복사됨' : '복사'}</span></button></div>
              <div className="code-area"><div className="line-numbers" ref={gutter} aria-hidden="true">{Array.from({ length: lines }, (_, i) => <div key={i}>{String(i + 1).padStart(2, '0')}</div>)}</div><textarea aria-label="우사기랭 코드" value={source} spellCheck={false} onChange={e => setSource(e.target.value)} onScroll={e => { if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop; }} onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); setResult(execute(source, input)); } }} /></div>
              <div className="editor-footer"><span><span className="status-dot"/> UTF-8 <span className="separator">/</span> USAGI LANG</span><span>{lines} LINES</span></div>
            </div>
            <div className="program-input"><label htmlFor="program-input">프로그램 입력 <small>여러 값은 쉼표로 구분해요</small></label><input id="program-input" value={input} onChange={e => setInput(e.target.value)} placeholder="예: 0, 2" autoComplete="off" /></div>
            <div className="editor-actions"><button className="reset-button" onClick={reset}><RotateCcw size={15}/> 초기화</button><button className="run-button" onClick={() => setResult(execute(source, input))}><Play size={16} fill="currentColor"/> 코드 실행하기 <ArrowRight size={16}/></button></div>
          </div>
          <div className="results-column">
            <div className="result-card">
              <div className="card-heading"><div className="card-title"><span className="icon-box peach"><Terminal size={17}/></span><div><strong>실행 결과</strong><small>우사기의 대답을 확인해요</small></div></div><span className={'result-status ' + (current?.error ? 'error' : current?.state ? 'success' : '')}>{current?.error ? '오류' : current?.state ? '실행 완료' : stale ? '변경됨' : '실행 대기'}</span></div>
              <div className="console" aria-live="polite"><div className="console-label"><span>OUTPUT</span><span>● ● ●</span></div>{current?.state?.output ? <pre>{current.state.output}</pre> : <p className="console-empty">{current?.error ? '출력이 없습니다.' : stale ? '코드가 변경되었어요. 다시 실행해 주세요.' : current?.state ? '출력이 없습니다.' : '실행 버튼을 누르면 결과가 나타나요.'}</p>}{current?.error && <p className="error-message">{current.error}</p>}</div>
              <div className="result-meta"><span><span className="status-dot"/> {current?.error ? '오류가 발생했어요' : current?.state ? '프로그램이 종료되었어요' : '우사기가 기다리고 있어요'}</span><span>{current?.state ? `${current.state.stepCount.toLocaleString()} steps` : '— steps'}</span></div>
            </div>
            <div className="variables-card"><div className="variable-header"><div className="card-title"><span className="icon-box lavender"><Variable size={17}/></span><div><strong>변수 보관함</strong><small>실행 후 저장된 값을 보여줘요</small></div></div><span className="variable-count">{variables.length}</span></div>{variables.length ? <div className="variable-list">{variables.map(([index, value]) => <div className="variable-row" key={index}><span><span className="variable-symbol">{index <= 12 ? '우'.repeat(index) : `우 × ${index}`}</span> <small>{index}번 변수</small></span><strong>{value}</strong></div>)}</div> : <div className="empty-variables"><span>✧</span> 아직 저장된 변수가 없어요</div>}</div>
            <div className="little-note"><span>💡</span><p><strong>처음이라도 괜찮아요!</strong><br/>아래 가이드를 보며 천천히 시작해요.</p><a href="#guide" aria-label="언어 가이드로 이동"><ArrowRight size={17}/></a></div>
          </div>
        </div>
      </section>
      <section id="guide" className="guide-section wrap"><div className="section-heading guide-heading"><div><div className="section-kicker"><span>03</span> QUICK GUIDE</div><h2>우사기어, 어렵지 않아요 <span>✳</span></h2><p>몇 가지 소리만 알면 나만의 코드를 만들 수 있어요.</p></div><a className="spec-link" href={specUrl} target="_blank" rel="noreferrer"><BookOpen size={15}/> 전체 문법 보기 <ArrowRight size={15}/></a></div>
        <div className="guide-grid"><article className="guide-card"><div className="guide-icon mint-icon">01</div><h3>시작과 끝</h3><p>모든 이야기는 시작과 끝이 있어요.</p><div className="syntax-row"><code>야하!</code><span>프로그램 시작</span></div><div className="syntax-row"><code>우라라!</code><span>프로그램 종료</span></div></article><article className="guide-card"><div className="guide-icon orange-icon">02</div><h3>숫자와 변수</h3><p>소리를 더하고, 변수에 담아 보세요.</p><div className="syntax-row"><code>야 / 하</code><span>+1 / −1</span></div><div className="syntax-row"><code>우 / 라</code><span>변수에 저장 / 읽기</span></div><div className="syntax-row"><code>뿌릿</code><span>양쪽 합 곱하기</span></div><div className="syntax-row"><code>우? / 우야하?</code><span>정수 입력 / 난수 저장</span></div></article><article className="guide-card"><div className="guide-icon purple-icon">03</div><h3>결과 출력</h3><p>우사기가 계산한 값을 말해줘요.</p><div className="syntax-row"><code>우라!</code><span>숫자 출력</span></div><div className="syntax-row"><code>푸루루!</code><span>문자 출력</span></div></article></div>
        <div className="guide-tip"><CircleHelp size={16}/><span><strong>잠깐!</strong> <code>야하</code>는 +1이지만, 띄어 쓴 <code>야 하</code>는 0이에요. 소리 사이의 공백도 중요해요.</span></div><div className="guide-tip"><CircleHelp size={16}/><span><strong>뿌릿!</strong> 각 구간을 먼저 더한 뒤 곱해요. <code>야야야 뿌릿 이이히</code>는 (1 + 1 + 1) × 2 = 6이에요.</span></div>
      </section>
    </main>
    <footer><div className="wrap footer-inner"><a className="footer-brand" href="#top">usagi<span>.</span>lab</a><p>작은 소리에서 시작되는 재미있는 코딩. <span>야하!</span></p><span className="footer-version">MADE FOR CURIOUS MINDS · v0.2</span></div></footer>
  </>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
