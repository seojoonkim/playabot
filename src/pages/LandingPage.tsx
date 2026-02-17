import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export default function LandingPage() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const goToChat = () => navigate('/chat');

  const bg = '#F5F0E8';
  const dark = '#1A1A1A';
  const gold = '#B8963E';
  const muted = 'rgba(26,26,26,0.45)';

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: bg, color: dark, fontFamily: "'Georgia', 'Times New Roman', serif", overflowX: 'hidden' }}>

      {/* ── 헤더 ── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: `1px solid rgba(26,26,26,0.08)`, backdropFilter: 'blur(12px)', background: 'rgba(245,240,232,0.92)' }}>
        <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.45em', color: dark, textTransform: 'uppercase' }}>
          PLAYA
        </span>
        <button
          onClick={goToChat}
          style={{ fontSize: '11px', letterSpacing: '0.15em', color: dark, border: `1px solid rgba(26,26,26,0.35)`, padding: '8px 22px', background: 'transparent', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.25s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = dark; (e.currentTarget as HTMLButtonElement).style.color = bg; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = dark; }}
        >
          상담하기
        </button>
      </header>

      {/* ── 히어로 ── */}
      <section style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 1s ease, transform 1s ease' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.45em', color: gold, textTransform: 'uppercase', marginBottom: '32px', fontFamily: 'system-ui, sans-serif' }}>
          Private Membership Club
        </p>
        <h1 style={{ fontSize: 'clamp(32px, 8vw, 72px)', fontWeight: 400, letterSpacing: '0.04em', lineHeight: 1.15, color: dark, marginBottom: '32px', maxWidth: '800px' }}>
          WELLNESS
          <br />
          <em style={{ color: gold, fontStyle: 'italic' }}>MEETS</em>
          <br />
          CONNECTION
        </h1>
        <p style={{ fontSize: 'clamp(14px, 2vw, 17px)', lineHeight: 1.9, color: muted, marginBottom: '16px', maxWidth: '520px' }}>
          플라야는 바쁜 일상 속에서 균형을 찾고,<br />
          고요함 속에서 진정한 여유를 경험할 수 있는<br />
          프라이빗 멤버십 클럽입니다.
        </p>
        <div style={{ width: '40px', height: '1px', background: gold, margin: '24px auto 40px' }} />
        <button
          onClick={goToChat}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '18px 48px', background: dark, color: bg, fontSize: '12px', letterSpacing: '0.22em', fontFamily: 'system-ui, sans-serif', fontWeight: 600, textTransform: 'uppercase', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = gold; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = dark; }}
        >
          가입 상담 신청하기
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
        <div style={{ marginTop: '40px' }} />
      </section>

      {/* ── 3가지 가치 ── */}
      <section style={{ padding: '100px 24px', borderTop: `1px solid rgba(26,26,26,0.08)` }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '48px' }}>
          {[
            { en: 'PRIVATE', ko: 'Less Distraction. More Vision', desc: '여유로운 고요 속에서 중요한 것에 더욱 가까워집니다.' },
            { en: 'WELLNESS', ko: 'Wellness Meets Connection', desc: '웰니스와 관계가 교차하는 지점에서 진정한 회복을 이야기합니다.' },
            { en: 'COMMUNITY', ko: 'Belong to Something Greater', desc: '가치를 공유하는 연결, 더 큰 의미의 일부가 되세요.' },
          ].map(v => (
            <div key={v.en} style={{ borderTop: `2px solid ${gold}`, paddingTop: '24px' }}>
              <p style={{ fontSize: '10px', letterSpacing: '0.4em', color: gold, textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'system-ui, sans-serif' }}>{v.en}</p>
              <h3 style={{ fontSize: '20px', fontWeight: 400, color: dark, marginBottom: '14px', lineHeight: 1.4 }}>{v.ko}</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.85, color: muted }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── EXCLUSIVE ACCESS ── */}
      <section style={{ padding: '80px 24px 100px', background: dark, color: bg }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.4em', color: gold, textTransform: 'uppercase', marginBottom: '20px', fontFamily: 'system-ui, sans-serif' }}>Exclusive Access</p>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 400, letterSpacing: '0.05em', marginBottom: '24px', maxWidth: '680px', lineHeight: 1.5 }}>
            오직 플라야 멤버만을 위한 공간에서 깊은 호흡을 되찾고, 몸과 마음의 균형을 자연스럽게 회복해 나갑니다.
          </h2>
          <div style={{ width: '40px', height: '1px', background: gold, marginBottom: '56px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2px' }}>
            {[
              { name: 'TENNIS', desc: '도심 한복판, 프리미엄 풀 사이즈 하드 코트에서 테니스에 온전히 몰입하세요.' },
              { name: 'FITNESS', desc: '나를 위한 프리미엄 장비. 중요한 건 무게가 아닌, 나만의 호흡입니다.' },
              { name: 'BADMINTON', desc: '셔틀콕의 리듬 속에서, 베드민턴 경기를 이어가세요.' },
              { name: 'SCREEN GOLF', desc: '정교한 감각과 여유로운 스윙으로, 완벽한 샷의 감각을 다시 느껴보세요.' },
              { name: 'AUDIO LOUNGE', desc: '정제된 음향, 깊이 있는 밀도, 공간에 녹아든 공명. 의식은 소리로부터 깨어납니다.' },
            ].map(f => (
              <div key={f.name} style={{ padding: '32px 24px', background: 'rgba(245,240,232,0.04)', borderTop: `1px solid rgba(245,240,232,0.08)` }}>
                <p style={{ fontSize: '11px', letterSpacing: '0.25em', color: gold, textTransform: 'uppercase', marginBottom: '14px', fontFamily: 'system-ui, sans-serif' }}>{f.name}</p>
                <p style={{ fontSize: '13px', lineHeight: 1.8, color: 'rgba(245,240,232,0.55)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BORNYON + CONCIERGE ── */}
      <section style={{ padding: '100px 24px', borderTop: `1px solid rgba(26,26,26,0.08)` }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2px' }}>
          {[
            { name: 'BORNYON', ko: '본연', desc: '우드파이어의 깊은 온기 속에서 가장 사적인 미식 경험을 누릴 수 있습니다.' },
            { name: 'CONCIERGE', ko: '컨시어지', desc: '예약과 추천부터 맞춤형 케어까지—필요로 하는 순간, 가장 자연스러운 방식으로 응답합니다.' },
          ].map(s => (
            <div key={s.name} style={{ padding: '48px 36px', borderTop: `2px solid rgba(26,26,26,0.08)` }}>
              <p style={{ fontSize: '10px', letterSpacing: '0.4em', color: gold, textTransform: 'uppercase', marginBottom: '8px', fontFamily: 'system-ui, sans-serif' }}>{s.name}</p>
              <h3 style={{ fontSize: '24px', fontWeight: 400, color: dark, marginBottom: '18px' }}>{s.ko}</h3>
              <p style={{ fontSize: '15px', lineHeight: 1.9, color: muted }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUE WELLNESS ── */}
      <section style={{ padding: '100px 24px', background: `rgba(26,26,26,0.03)`, textAlign: 'center' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.4em', color: gold, textTransform: 'uppercase', marginBottom: '20px', fontFamily: 'system-ui, sans-serif' }}>Membership</p>
        <h2 style={{ fontSize: 'clamp(24px, 5vw, 44px)', fontWeight: 400, color: dark, marginBottom: '24px', letterSpacing: '0.04em', lineHeight: 1.3 }}>
          TRUE WELLNESS,<br /><em style={{ fontStyle: 'italic', color: gold }}>UNFILTERED</em>
        </h2>
        <p style={{ fontSize: '16px', lineHeight: 1.9, color: muted, maxWidth: '440px', margin: '0 auto 16px' }}>
          일상의 소음을 벗어던지고, 웰니스의 본질에 집중합니다.<br />
          몰입의 깊은 곳에서 매 순간이 더욱 의미있게 변해갑니다.
        </p>
        <div style={{ width: '40px', height: '1px', background: gold, margin: '32px auto 40px' }} />
        <p style={{ fontSize: '14px', color: muted, marginBottom: '40px', letterSpacing: '0.02em' }}>
          아래 버튼을 눌러서 가입 상담을 신청해보세요.
        </p>
        <button
          onClick={goToChat}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '18px 48px', background: 'transparent', color: dark, fontSize: '12px', letterSpacing: '0.22em', fontFamily: 'system-ui, sans-serif', fontWeight: 600, textTransform: 'uppercase', border: `1px solid rgba(26,26,26,0.4)`, cursor: 'pointer', transition: 'all 0.3s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = dark; (e.currentTarget as HTMLButtonElement).style.color = bg; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = dark; }}
        >
          컨시어지 상담 시작하기
        </button>
      </section>

      {/* ── 푸터 ── */}
      <footer style={{ borderTop: `1px solid rgba(26,26,26,0.1)`, padding: '48px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center' }}>
        <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.45em', color: dark }}>PLAYA</span>
        <p style={{ fontSize: '11px', color: muted, fontFamily: 'system-ui, sans-serif', letterSpacing: '0.05em' }}>
          3F, 742, Nonhyeon-ro, Gangnam-gu, Seoul
        </p>
        <p style={{ fontSize: '11px', color: muted, fontFamily: 'system-ui, sans-serif' }}>info@theplaya.com</p>
        <p style={{ fontSize: '10px', color: 'rgba(26,26,26,0.25)', fontFamily: 'system-ui, sans-serif', marginTop: '8px' }}>
          © 2025 PLAYA. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
