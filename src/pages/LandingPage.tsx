import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export default function LandingPage() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const goToChat = () => navigate('/chat');

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#0A0A0A',
        color: '#F5F0E8',
        fontFamily: "'Georgia', 'Times New Roman', serif",
        overflowX: 'hidden',
      }}
    >
      {/* ── 헤더 ── */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 32px',
          borderBottom: '1px solid rgba(201,169,110,0.15)',
          backdropFilter: 'blur(12px)',
          background: 'rgba(10,10,10,0.85)',
        }}
      >
        <span
          style={{
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '0.35em',
            color: '#C9A96E',
            textTransform: 'uppercase',
          }}
        >
          PLAYA
        </span>
        <button
          onClick={goToChat}
          style={{
            fontSize: '11px',
            letterSpacing: '0.15em',
            color: '#F5F0E8',
            border: '1px solid rgba(245,240,232,0.4)',
            padding: '8px 20px',
            borderRadius: '2px',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            textTransform: 'uppercase',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = '#C9A96E';
            (e.target as HTMLButtonElement).style.borderColor = '#C9A96E';
            (e.target as HTMLButtonElement).style.color = '#0A0A0A';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = 'transparent';
            (e.target as HTMLButtonElement).style.borderColor = 'rgba(245,240,232,0.4)';
            (e.target as HTMLButtonElement).style.color = '#F5F0E8';
          }}
        >
          상담하기
        </button>
      </header>

      {/* ── 히어로 섹션 ── */}
      <section
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '120px 24px 80px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.9s ease, transform 0.9s ease',
        }}
      >
        {/* 금박 구분선 */}
        <div
          style={{
            width: '40px',
            height: '1px',
            background: '#C9A96E',
            margin: '0 auto 32px',
          }}
        />

        {/* 태그라인 */}
        <p
          style={{
            fontSize: '11px',
            letterSpacing: '0.4em',
            color: '#C9A96E',
            textTransform: 'uppercase',
            marginBottom: '28px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Private Membership Club
        </p>

        {/* 메인 카피 */}
        <h1
          style={{
            fontSize: 'clamp(28px, 7vw, 64px)',
            fontWeight: 400,
            letterSpacing: '0.04em',
            lineHeight: 1.2,
            color: '#F5F0E8',
            marginBottom: '24px',
            maxWidth: '760px',
          }}
        >
          WELLNESS
          <br />
          <span style={{ color: '#C9A96E' }}>MEETS</span>
          <br />
          CONNECTION
        </h1>

        {/* 서브 카피 */}
        <p
          style={{
            fontSize: 'clamp(15px, 2.5vw, 18px)',
            lineHeight: 1.8,
            color: 'rgba(245,240,232,0.65)',
            marginBottom: '52px',
            maxWidth: '480px',
            fontFamily: "'Noto Serif KR', 'Georgia', serif",
          }}
        >
          바쁜 일상 속,<br />진정한 여유를 경험하다
        </p>

        {/* CTA 버튼 */}
        <button
          onClick={goToChat}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '18px 44px',
            background: '#C9A96E',
            color: '#0A0A0A',
            fontSize: '13px',
            letterSpacing: '0.2em',
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 600,
            textTransform: 'uppercase',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#b8924f';
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#C9A96E';
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          }}
        >
          상담 시작하기
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        {/* 하단 스크롤 힌트 */}
        <div
          style={{
            marginTop: '72px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            opacity: 0.4,
          }}
        >
          <span style={{ fontSize: '10px', letterSpacing: '0.2em', fontFamily: 'system-ui, sans-serif' }}>SCROLL</span>
          <div style={{ width: '1px', height: '40px', background: 'rgba(245,240,232,0.5)' }} />
        </div>
      </section>

      {/* ── 소개 섹션 ── */}
      <section
        style={{
          padding: '100px 24px',
          maxWidth: '1080px',
          margin: '0 auto',
        }}
      >
        {/* 섹션 헤딩 */}
        <div style={{ textAlign: 'center', marginBottom: '72px' }}>
          <p
            style={{
              fontSize: '10px',
              letterSpacing: '0.4em',
              color: '#C9A96E',
              textTransform: 'uppercase',
              marginBottom: '16px',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Experience
          </p>
          <h2
            style={{
              fontSize: 'clamp(22px, 4vw, 36px)',
              fontWeight: 400,
              letterSpacing: '0.06em',
              color: '#F5F0E8',
            }}
          >
            세 가지 공간, 하나의 라이프스타일
          </h2>
          <div style={{ width: '40px', height: '1px', background: '#C9A96E', margin: '24px auto 0' }} />
        </div>

        {/* 카드 3개 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2px',
          }}
        >
          {[
            {
              emoji: '🎾',
              name: 'PLAYA',
              desc: '테니스 · 피트니스 · 스크린 골프',
              detail: '최상급 시설에서 즐기는 액티브 라이프. 회원만을 위한 프라이빗 코트와 퍼스널 트레이닝.',
            },
            {
              emoji: '🛋️',
              name: 'LOUNGE',
              desc: '커피 · 라운지 공간',
              detail: '아늑하고 조용한 프리미엄 라운지. 업무와 휴식의 경계를 허물다.',
            },
            {
              emoji: '🍷',
              name: '본연',
              desc: '레스토랑 · 와인바',
              detail: '셰프의 계절 메뉴와 엄선된 와인. 격조 있는 다이닝 경험.',
            },
          ].map((item) => (
            <div
              key={item.name}
              style={{
                background: 'rgba(245,240,232,0.03)',
                border: '1px solid rgba(201,169,110,0.12)',
                padding: '52px 36px',
                transition: 'all 0.3s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(201,169,110,0.07)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,169,110,0.35)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(245,240,232,0.03)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,169,110,0.12)';
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '24px' }}>{item.emoji}</div>
              <h3
                style={{
                  fontSize: '18px',
                  letterSpacing: '0.2em',
                  color: '#C9A96E',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                }}
              >
                {item.name}
              </h3>
              <p
                style={{
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  color: 'rgba(245,240,232,0.5)',
                  marginBottom: '20px',
                  fontFamily: 'system-ui, sans-serif',
                }}
              >
                {item.desc}
              </p>
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: 1.8,
                  color: 'rgba(245,240,232,0.65)',
                  fontFamily: "'Noto Serif KR', 'Georgia', serif",
                }}
              >
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 구분선 ── */}
      <div style={{ width: '1px', height: '80px', background: 'rgba(201,169,110,0.25)', margin: '0 auto' }} />

      {/* ── 하단 CTA 섹션 ── */}
      <section
        style={{
          padding: '100px 24px 80px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '10px',
            letterSpacing: '0.4em',
            color: '#C9A96E',
            textTransform: 'uppercase',
            marginBottom: '24px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Exclusive Membership
        </p>
        <h2
          style={{
            fontSize: 'clamp(20px, 4vw, 32px)',
            fontWeight: 400,
            letterSpacing: '0.06em',
            color: '#F5F0E8',
            marginBottom: '20px',
            lineHeight: 1.5,
          }}
        >
          회원 추천으로만<br />가입 가능합니다
        </h2>
        <p
          style={{
            fontSize: '14px',
            lineHeight: 1.9,
            color: 'rgba(245,240,232,0.55)',
            marginBottom: '48px',
            maxWidth: '400px',
            margin: '0 auto 48px',
            fontFamily: "'Noto Serif KR', 'Georgia', serif",
          }}
        >
          PLAYA는 소수의 회원을 위한 공간입니다.<br />
          가입 절차 및 혜택에 대해 컨시어지와<br />직접 상담하세요.
        </p>

        <button
          onClick={goToChat}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '18px 44px',
            background: 'transparent',
            color: '#C9A96E',
            fontSize: '13px',
            letterSpacing: '0.2em',
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 600,
            textTransform: 'uppercase',
            border: '1px solid #C9A96E',
            borderRadius: '2px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#C9A96E';
            (e.currentTarget as HTMLButtonElement).style.color = '#0A0A0A';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = '#C9A96E';
          }}
        >
          컨시어지 상담 시작하기
        </button>
      </section>

      {/* ── 푸터 ── */}
      <footer
        style={{
          borderTop: '1px solid rgba(201,169,110,0.1)',
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '0.35em',
            color: '#C9A96E',
          }}
        >
          PLAYA
        </span>
        <p
          style={{
            fontSize: '11px',
            letterSpacing: '0.1em',
            color: 'rgba(245,240,232,0.3)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Private Membership Club · Seoul
        </p>
        <p
          style={{
            fontSize: '11px',
            color: 'rgba(245,240,232,0.2)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          © 2025 PLAYA. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
