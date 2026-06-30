// AXIS Admin — Shell: Sidebar + Topbar
const { useState } = React;

const NAV = [
  { group: null, items: [
    { id: "dashboard", label: "대시보드", icon: "dashboard" },
  ]},
  { group: "시험 관리", items: [
    { id: "schedule", label: "시험일정 관리", icon: "calendar" },
    { id: "questions", label: "문제은행 관리", icon: "bank" },
  ]},
  { group: "접수 관리", items: [
    { id: "registrations", label: "접수·결제 관리", icon: "card" },
  ]},
  { group: "응시 관리", items: [
    { id: "examinees", label: "응시자 관리", icon: "users" },
    { id: "monitor", label: "응시자 모니터링", icon: "monitor", live: true },
  ]},
  { group: "채점 관리", items: [
    { id: "grading", label: "채점 관리", icon: "grading", badge: "38" },
    { id: "results", label: "성적·합격 관리", icon: "trophy" },
  ]},
  { group: "콘텐츠", items: [
    { id: "notices", label: "공지·FAQ", icon: "megaphone" },
    { id: "qna", label: "1:1 문의", icon: "mail", badge: "12" },
  ]},
  { group: "분석", items: [
    { id: "stats", label: "통계·리포트", icon: "chart" },
  ]},
];

const PAGE_TITLES = {
  dashboard: { title: "대시보드", sub: "오늘의 운영 현황을 한눈에 확인하세요" },
  schedule: { title: "시험일정 관리", sub: "회차 등록 · 정원 · 접수 기간을 관리합니다" },
  questions: { title: "문제은행 관리", sub: "필기 문항 및 실기 과제 템플릿을 운영합니다" },
  registrations: { title: "접수·결제 관리", sub: "응시자 접수 내역과 결제·환불을 처리합니다" },
  examinees: { title: "응시자 관리", sub: "응시자 프로필, 이력, 자격증, 제재를 관리합니다" },
  monitor: { title: "응시자 모니터링", sub: "진행 중인 시험을 실시간으로 감독합니다", dark: true },
  evidence: { title: "부정행위 증거", sub: "위반 케이스의 웹캠·화면 증거와 처분 이력" },
  grading: { title: "채점 관리", sub: "AI 채점 결과 검수 및 전문가 배정" },
  results: { title: "성적·합격 관리", sub: "최종 성적 검토와 합격 발표" },
  notices: { title: "커뮤니티", sub: "공지사항, FAQ, 1:1 문의를 운영합니다" },
  qna: { title: "1:1 문의", sub: "응시자 문의에 답변합니다" },
  stats: { title: "통계·리포트", sub: "응시 현황과 합격률을 분석합니다" },
};

function Sidebar({ active, onSelect, examInProgress }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">A</div>
        <div>
          <div className="brand-text">AXIS Admin</div>
          <div className="brand-sub">axisexam.com</div>
        </div>
      </div>
      <div className="role-chip">
        <span className="role-dot"></span>
        <strong>super_admin</strong>
        <span className="role-user">홍관리자</span>
      </div>
      <nav className="nav-groups">
        {NAV.map((grp, i) => (
          <div key={i}>
            {grp.group && <div className="nav-group-label">{grp.group}</div>}
            {grp.items.map(it => (
              <div
                key={it.id}
                className={"nav-item" + (active === it.id ? " active" : "")}
                onClick={() => onSelect(it.id)}
              >
                <span className="nav-icon"><Icon name={it.icon} size={16}/></span>
                <span>{it.label}</span>
                {it.live && examInProgress && <span className="live-dot" title="시험 진행중"/>}
                {it.badge && !it.live && <span className="nav-badge">{it.badge}</span>}
              </div>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span>v1.2.0</span>
        <span>2026.05</span>
      </div>
    </aside>
  );
}

function TopBar({ active, examInProgress, onJumpMonitor }) {
  const p = PAGE_TITLES[active] || {};
  return (
    <div className="topbar">
      <div className="crumb">
        <span>AXIS Admin</span>
        <span className="crumb-sep">/</span>
        <strong>{p.title}</strong>
      </div>
      {examInProgress && active !== "monitor" && (
        <div className="live-banner">
          <span className="live-pip"/>
          <span className="live-label">LIVE</span>
          <span>AXIS L3 제5회 · 183명 응시 중</span>
          <span className="live-jump" onClick={onJumpMonitor}>모니터링 →</span>
        </div>
      )}
      <button className="icon-btn" style={{ marginLeft: examInProgress ? 0 : "auto" }} title="알림">
        <Icon name="bell" size={16}/>
        <span className="dot"></span>
      </button>
      <div className="user-chip">
        <div className="avatar">홍</div>
        <div className="user-meta">
          <span className="user-name">홍관리자</span>
          <span className="user-role">super_admin</span>
        </div>
      </div>
      <button className="icon-btn" title="로그아웃"><Icon name="logout" size={16}/></button>
    </div>
  );
}

window.Sidebar = Sidebar;
window.TopBar = TopBar;
window.PAGE_TITLES = PAGE_TITLES;
