import { BookOpen, ShieldAlert, Clock, Scale, Lock, MessageSquareWarning } from 'lucide-react';
import { Card, PageHeader, SectionHeader } from '@expert/components/shared/ui-kit';

export default function RulesPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="채점위원 규정"
        subtitle="AXIS 운영규정 및 채점 가이드라인 — 채점 시작 전 반드시 숙지해 주세요."
      />

      <Card className="p-5 mb-4">
        <SectionHeader
          title={
            <span className="inline-flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> 1. 역할과 책임
            </span>
          }
          subtitle="채점위원은 AXIS 자격검정의 실기 채점 권한을 위임받은 평가자입니다."
        />
        <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-[var(--gray-700)] leading-relaxed">
          <li>자신의 담당 분야(AXIS / AXIS-C / AXIS-H)에 한해 응시자 답안을 채점합니다.</li>
          <li>AI 1차 채점은 참고 자료이며, 최종 점수는 채점위원의 판단에 따릅니다.</li>
          <li>채점위원의 결정은 응시자의 자격 발급 여부에 직접 영향을 미칩니다.</li>
        </ul>
      </Card>

      <Card className="p-5 mb-4">
        <SectionHeader
          title={
            <span className="inline-flex items-center gap-2">
              <Clock className="w-4 h-4" /> 2. 채점 SLA (마감 규정)
            </span>
          }
          subtitle="응시 종료 시점으로부터 14일 이내에 모든 실기 채점을 확정해야 합니다."
        />
        <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-[var(--gray-700)] leading-relaxed">
          <li>D-3 이내: 마감 임박. 우선 처리해 주세요.</li>
          <li>D-Day 초과: 지연(Overdue) 처리되며, 운영팀에 자동 통보됩니다.</li>
          <li>부득이한 지연 시 운영팀(EXAM_ADMIN)에게 사전에 사유를 공유해 주세요.</li>
        </ul>
      </Card>

      <Card className="p-5 mb-4">
        <SectionHeader
          title={
            <span className="inline-flex items-center gap-2">
              <Scale className="w-4 h-4" /> 3. 합격 기준 (운영규정 발췌)
            </span>
          }
          subtitle="레벨별 합격 컷오프 — 채점 시 반드시 확인하세요."
        />
        <div className="space-y-2 text-[14px] text-[var(--gray-700)]">
          <p><b className="text-[var(--gray-900)]">L3 (Starter)</b> — 필기 100점 만점 중 60점 이상. 과목별 40% 미만 시 과락.</p>
          <p><b className="text-[var(--gray-900)]">L2 (Practitioner)</b> — 필기 60점 이상 + 실기 60점 이상. 과목별 40% 미만 시 과락.</p>
          <p><b className="text-[var(--gray-900)]">L1 (Leader)</b> — 필기 60점 이상 + 실기 60점 이상. 과목별 40% 미만 시 과락.</p>
          <p className="text-[12px] text-[var(--gray-500)] mt-2">
            ※ 한쪽만 합격한 경우 12개월 부분합격(면제) 적용. 시스템이 자동 계산하므로 별도 처리는 불필요합니다.
          </p>
        </div>
      </Card>

      <Card className="p-5 mb-4">
        <SectionHeader
          title={
            <span className="inline-flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[var(--red)]" /> 4. 부정행위 처리 (운영규정 제28·29조)
            </span>
          }
          subtitle="채점 중 부정행위가 의심되는 경우 즉시 운영팀에 통보합니다."
        />
        <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-[var(--gray-700)] leading-relaxed">
          <li>제28조 — 부정행위 유형 5종 (대리시험, 부정자료 반입, 통신, AI 도구 무단 사용, 화면 조작 등).</li>
          <li>제29조 — 부정행위 확정 시 시험 무효 처리 및 <b className="text-[var(--red)]">2년간 응시 자격 정지</b>.</li>
          <li>채점위원이 부정행위를 직접 결정할 수는 없습니다. 의심 사례는 검수 메모에 명확히 기록 후 운영팀이 최종 판단합니다.</li>
        </ul>
      </Card>

      <Card className="p-5 mb-4">
        <SectionHeader
          title={
            <span className="inline-flex items-center gap-2">
              <Lock className="w-4 h-4" /> 5. 기밀 유지 의무
            </span>
          }
          subtitle="응시자 답안과 채점 데이터는 모두 개인정보보호법(PIPA) 적용 대상입니다."
        />
        <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-[var(--gray-700)] leading-relaxed">
          <li>응시자 답안의 스크린샷·복사·외부 저장 금지.</li>
          <li>외부 LLM(ChatGPT, Claude 웹, Gemini 등)에 응시자 답안 붙여넣기 금지.</li>
          <li>채점 데이터는 채점위원 포털 내에서만 열람·처리합니다.</li>
          <li>위반 시 채점위원 자격이 즉시 해지되며, 민·형사상 책임을 질 수 있습니다.</li>
        </ul>
      </Card>

      <Card className="p-5 mb-4">
        <SectionHeader
          title={
            <span className="inline-flex items-center gap-2">
              <MessageSquareWarning className="w-4 h-4" /> 6. 이의제기 및 분쟁 처리
            </span>
          }
          subtitle="채점 결과에 대해 응시자가 이의를 제기할 수 있습니다."
        />
        <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-[var(--gray-700)] leading-relaxed">
          <li>응시자가 이의를 제기하면 해당 세션의 실기 상태가 <span className="text-[var(--red)]">이의제기(expert_disputed)</span>로 전환됩니다.</li>
          <li>이의제기 건은 운영팀과 협의하여 재검토 후 점수를 정정할 수 있습니다.</li>
          <li>이의제기와 관련된 모든 답안·증빙은 분쟁 종료 시까지 자동 보관됩니다 (최대 2년).</li>
        </ul>
      </Card>

      <p className="text-[12px] text-[var(--gray-500)] mt-6">
        본 규정은 AXIS 자격검정 운영규정 및 KRIVET PQI 등록 기준에 따릅니다. 최신 정식 규정은 운영팀에 문의해 주세요.
      </p>
    </div>
  );
}
