import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';
import { LangToggle, useI18n } from '../i18n';

// ---------- Types ----------
type SectionKey =
  | 'registrations'
  | 'schedule'
  | 'taken'
  | 'demo'
  | 'scores'
  | 'partial'
  | 'certs'
  | 'inquiry'
  | 'alerts'
  | 'profile';

interface Profile {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  email?: string | null;
  birthDate?: string | null;
  roles?: string[];
}

// ---------- Design tokens (from mockup) ----------
// Primary blue: #185FA5  Light blue bg: #E6F1FB  Border: #E2E8F0
// Bg primary: #FFF       Bg secondary: #F5F7FA   Text primary: #0B1D3A
// Success: #3B6D11/#EAF3DE  Warning: #854F0B/#FAEEDA
// Danger: #A32D2D/#FCEBEB   Purple: #3C3489/#EEEDFE

// ---------- Primitives ----------
type BadgeTone = 'green' | 'orange' | 'red' | 'blue' | 'gray' | 'purple';
const badgeTone: Record<BadgeTone, string> = {
  green: 'bg-[#EAF3DE] text-[#3B6D11]',
  orange: 'bg-[#FAEEDA] text-[#854F0B]',
  red: 'bg-[#FCEBEB] text-[#A32D2D]',
  blue: 'bg-[#E6F1FB] text-[#185FA5]',
  gray: 'bg-[#F5F7FA] text-[#4B5563]',
  purple: 'bg-[#EEEDFE] text-[#3C3489]',
};

function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-[3px] rounded text-[11px] font-medium ${badgeTone[tone]}`}
    >
      {children}
    </span>
  );
}

type BtnVariant = 'default' | 'primary' | 'danger' | 'green' | 'orange' | 'blue';
function Btn({
  variant = 'default',
  className = '',
  children,
  ...rest
}: {
  variant?: BtnVariant;
  className?: string;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants: Record<BtnVariant, string> = {
    default: 'bg-white border-[#E2E8F0] text-[#0B1D3A] hover:bg-[#F5F7FA]',
    primary: 'bg-[#185FA5] border-[#185FA5] text-[#E6F1FB] hover:bg-[#14528F]',
    danger: 'bg-[#FCEBEB] border-[#F7C1C1] text-[#A32D2D] hover:bg-[#F9DADA]',
    green: 'bg-[#EAF3DE] border-[#C0DD97] text-[#3B6D11] hover:bg-[#DDEBC8]',
    orange: 'bg-[#FAEEDA] border-[#FAC775] text-[#854F0B] hover:bg-[#F5E2BE]',
    blue: 'bg-white border-[#B5D4F4] text-[#185FA5] hover:bg-[#F0F7FE]',
  };
  return (
    <button
      {...rest}
      className={`px-3 py-[5px] rounded text-[11px] border-[0.5px] cursor-pointer transition-colors whitespace-nowrap ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border-[0.5px] border-[#E2E8F0] rounded-lg px-4 py-3.5 mb-2.5 ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  right,
}: {
  title: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <span className="text-[13px] font-medium text-[#0B1D3A]">{title}</span>
      {right}
    </div>
  );
}

function Row({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-2.5 text-xs text-[#4B5563] border-b-[0.5px] border-[#E2E8F0] last:border-b-0">
      {children}
    </div>
  );
}

function RowMain({ children }: { children: ReactNode }) {
  return (
    <span className="flex-1 min-w-[180px] text-[#0B1D3A] break-words">
      {children}
    </span>
  );
}

function DetailRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-3 py-1.5 text-xs border-b-[0.5px] border-[#E2E8F0] last:border-b-0">
      <span className="text-[#4B5563] flex-shrink-0">{label}</span>
      <span className="text-[#0B1D3A] font-medium sm:text-right break-words">{value}</span>
    </div>
  );
}

function StatCard({ label, value, suffix }: { label: string; value: ReactNode; suffix?: string }) {
  return (
    <div className="bg-[#F5F7FA] rounded-md px-3.5 py-2.5">
      <div className="text-[11px] text-[#4B5563] mb-1">{label}</div>
      <div className="text-xl font-medium text-[#0B1D3A]">
        {value}
        {suffix && <span className="text-[11px] font-normal text-[#4B5563] ml-1">{suffix}</span>}
      </div>
    </div>
  );
}

function NoticeBanner({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'orange' }) {
  const cls =
    tone === 'orange'
      ? 'bg-[#FAEEDA] text-[#854F0B]'
      : 'bg-[#E6F1FB] text-[#185FA5]';
  return (
    <div className={`rounded-md px-3.5 py-2.5 text-xs mb-3 flex items-start gap-2 ${cls}`}>
      <span>{children}</span>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: number;
  variant?: 'default' | 'pass' | 'fail';
}) {
  const fill =
    variant === 'pass' ? 'bg-[#639922]' : variant === 'fail' ? 'bg-[#E24B4A]' : 'bg-[#185FA5]';
  return (
    <div className="my-1.5">
      <div className="flex justify-between text-[11px] text-[#4B5563] mb-0.5">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 bg-[#F5F7FA] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-medium text-[#0B1D3A] mb-1">{title}</h2>
      <p className="text-xs text-[#4B5563]">{sub}</p>
    </div>
  );
}

// ---------- Sections ----------

function RegistrationsSection() {
  const { t } = useI18n();
  return (
    <>
      <SectionHeader title={t('sec.registrations.title')} sub={t('sec.registrations.sub')} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-2.5">
        <StatCard label="Total Registered" value="3" suffix="exams" />
        <StatCard label="Awaiting Payment" value="1" suffix="pending" />
        <StatCard label="Confirmed" value="1" suffix="exam" />
        <StatCard label="Cancelled" value="1" suffix="refunded" />
      </div>
      <Card>
        <Row>
          <Badge tone="green">Confirmed</Badge>
          <RowMain>AXIS L3 Starter · Session 1 · 2026.09.05 (Sat) 10:00</RowMain>
          <Btn variant="primary">Print Voucher</Btn>
          <Btn variant="danger">Cancel</Btn>
        </Row>
        <Row>
          <Badge tone="orange">Payment Pending</Badge>
          <RowMain>AXIS L2 Practitioner · Session 1 · 2026.09.06 (Sun) 14:00</RowMain>
          <Btn variant="orange">Pay Now</Btn>
          <Btn variant="danger">Cancel</Btn>
        </Row>
        <Row>
          <Badge tone="red">Cancelled</Badge>
          <RowMain>AXIS-C L3 · Session 2 · 2026.08.10 — Refunded KRW 60,000</RowMain>
          <Btn>Receipt</Btn>
        </Row>
      </Card>
      <Card>
        <CardHeader title="Payment Details — AXIS L2 (Pending)" />
        <DetailRow label="Amount Due" value="KRW 120,000" />
        <DetailRow label="Payment Methods" value="Card · Bank Transfer · KakaoPay · NaverPay · Toss" />
        <DetailRow label="Deadline" value="2026.08.20 23:59 (Registration closes)" />
        <DetailRow label="Refund Policy" value="Full refund before D-10 · 50% before D-5 · None after" />
        <div className="flex gap-2 mt-2.5">
          <Btn variant="primary" className="flex-1">
            Pay Now — KRW 120,000
          </Btn>
          <Btn>View Refund Policy</Btn>
        </div>
      </Card>
      <NoticeBanner>Exam Voucher (admission ticket) can be printed up to 1 day before the exam date.</NoticeBanner>
    </>
  );
}

function ScheduleSection() {
  const { t } = useI18n();
  return (
    <>
      <SectionHeader title={t('sec.schedule.title')} sub={t('sec.schedule.sub')} />
      <Card>
        <CardHeader title="Confirmed Exams" right={<Btn variant="primary">+ Register New Exam</Btn>} />
        <Row>
          <Badge tone="blue">D-40</Badge>
          <RowMain>
            <strong className="text-[#0B1D3A]">AXIS L3</strong> · Session 1 · 2026.09.05 10:00 · Online (Proctored)
          </RowMain>
          <Btn>Voucher</Btn>
          <Btn variant="primary">Enter Exam</Btn>
        </Row>
        <Row>
          <Badge tone="gray">D-41</Badge>
          <RowMain>
            <strong className="text-[#0B1D3A]">AXIS L2</strong> · Session 1 · 2026.09.06 14:00 · Online (Proctored)
          </RowMain>
          <span className="text-[11px] text-[#854F0B]">Pay First</span>
        </Row>
      </Card>
      <Card>
        <CardHeader title="Session Alerts I Set" />
        <Row>
          <Badge tone="purple">Alert ON</Badge>
          <RowMain>AXIS-H L3 · Session 2 (Registration opens 2026.09.15)</RowMain>
          <Btn variant="danger">Cancel Alert</Btn>
        </Row>
        <Row>
          <Badge tone="purple">Alert ON</Badge>
          <RowMain>AXIS-C L2 · Session 1 (Registration opens 2026.10.01)</RowMain>
          <Btn variant="danger">Cancel Alert</Btn>
        </Row>
        <div className="mt-2.5">
          <Btn className="w-full">+ Browse All Sessions & Set Alert</Btn>
        </div>
      </Card>
      <Card>
        <CardHeader title="Exam Environment Checklist" />
        <DetailRow label="Device" value="PC / laptop required (mobile not supported)" />
        <DetailRow label="Browser" value="Chrome 90+ (latest recommended)" />
        <DetailRow label="Camera & Mic" value="Required — AI proctoring system" />
        <DetailRow label="Entry Window" value="Opens 30 min before exam, closes 10 min after start" />
        <div className="mt-2.5">
          <Btn variant="green" className="w-full">
            Full Environment Check Guide
          </Btn>
        </div>
      </Card>
    </>
  );
}

function TakenSection() {
  const { t } = useI18n();
  return (
    <>
      <SectionHeader title={t('sec.taken.title')} sub={t('sec.taken.sub')} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-2.5">
        <StatCard label="Total Attempts" value="4" />
        <StatCard label="Passed" value="2" suffix="/ 4" />
        <StatCard label="Partial" value="1" suffix="active" />
        <StatCard label="Failed" value="1" />
      </div>
      <Card>
        <CardHeader
          title="AXIS L3 Starter · Session 2 · 2026.03.15"
          right={<Badge tone="green">Pass</Badge>}
        />
        <DetailRow label="Total Score" value="82 / 100" />
        <DetailRow label="AI Fundamentals (Subj 1)" value="44/50 · Pass" />
        <DetailRow label="AI Tools & Ethics (Subj 2)" value="38/50 · Pass" />
        <div className="mt-2">
          <ScoreBar label="Total" value={82} variant="pass" />
        </div>
        <div className="flex gap-2 mt-2.5">
          <Btn variant="primary">Download Certificate</Btn>
          <Btn>Confirmation PDF</Btn>
        </div>
      </Card>
      <Card>
        <CardHeader
          title="AXIS L2 Practitioner · Session 1 · 2025.09.10"
          right={<Badge tone="orange">Partial Pass</Badge>}
        />
        <DetailRow label="Written" value="68/100 · Pass" />
        <DetailRow label="Practical" value="52/100 · Fail (min. 60)" />
        <div className="bg-[#FAEEDA] text-[#854F0B] text-xs rounded-md px-3.5 py-2.5 mt-2 mb-2">
          Written section exempted for 1 attempt within 12 months — expires 2026.09.10
        </div>
        <ScoreBar label="Written" value={68} />
        <ScoreBar label="Practical" value={52} variant="fail" />
        <div className="mt-2.5">
          <Btn variant="orange" className="w-full">
            Re-register for Practical Only
          </Btn>
        </div>
      </Card>
    </>
  );
}

function DemoSection() {
  const { t } = useI18n();
  const DemoCard = ({
    bg,
    letter,
    title,
    desc,
    btn,
    tags,
    rows,
  }: {
    bg: string;
    letter: string;
    title: string;
    desc: string;
    btn: ReactNode;
    tags: string[];
    rows: { l: string; r: string }[];
  }) => (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-lg p-4 mb-2.5">
      <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
        <div
          className={`w-10 h-10 rounded-md flex items-center justify-center text-base font-medium flex-shrink-0 ${bg}`}
        >
          {letter}
        </div>
        <div className="flex-1 min-w-[180px]">
          <div className="text-[13px] font-medium text-[#0B1D3A]">{title}</div>
          <div className="text-xs text-[#4B5563]">{desc}</div>
        </div>
        <div className="flex-shrink-0">{btn}</div>
      </div>
      <div className="flex gap-2 flex-wrap mb-2.5">
        {tags.map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-[3px] text-[10px] bg-[#F5F7FA] text-[#4B5563]">
            {t}
          </span>
        ))}
      </div>
      {rows.map((r) => (
        <DetailRow key={r.l} label={r.l} value={r.r} />
      ))}
    </div>
  );

  return (
    <>
      <SectionHeader title={t('sec.demo.title')} sub={t('sec.demo.sub')} />
      <NoticeBanner>Demo exams are not scored. They let you experience the real CBT environment and question formats.</NoticeBanner>
      <DemoCard
        bg="bg-[#E6F1FB] text-[#185FA5]"
        letter="A"
        title="AXIS L3 — Free Demo"
        desc="10 sample MCQ questions · 10 minutes · No login needed"
        btn={<Btn variant="primary">Start Demo</Btn>}
        tags={['MCQ only', '40 min format preview', 'Timer active', 'No proctoring']}
        rows={[
          { l: 'What you see', r: 'Real question layout, answer flagging, timer, submission screen' },
          { l: "What's excluded", r: 'AI proctoring, webcam, actual scoring, certificate' },
        ]}
      />
      <DemoCard
        bg="bg-[#EAF3DE] text-[#3B6D11]"
        letter="C"
        title="AXIS-C L3 — Free Demo"
        desc="Sample questions + code sandbox preview · Login required"
        btn={<Btn variant="green">Start Demo</Btn>}
        tags={['MCQ + code sandbox', 'Login required', 'Python / JS sandbox']}
        rows={[
          { l: 'What you see', r: 'Code editor, AI-assisted auto-complete preview, run & test panel' },
          { l: "What's excluded", r: 'Similarity check, actual grading, proctoring' },
        ]}
      />
      <DemoCard
        bg="bg-[#EEEDFE] text-[#3C3489]"
        letter="H"
        title="AXIS-H L3 — Free Demo"
        desc="Healthcare AI scenario sample · Login required"
        btn={
          <Btn className="!text-[#3C3489] !border-[#AFA9EC]" variant="default">
            Start Demo
          </Btn>
        }
        tags={['Healthcare scenario', 'Login required', 'EMR context']}
        rows={[{ l: 'What you see', r: 'Medical AI use-case questions, patient data scenario prompts' }]}
      />
    </>
  );
}

function ScoresSection() {
  const { t } = useI18n();
  return (
    <>
      <SectionHeader title={t('sec.scores.title')} sub={t('sec.scores.sub')} />
      <Card>
        <CardHeader title="AXIS L3 · Session 2 · 2026.03.15" right={<Badge tone="green">Pass</Badge>} />
        <DetailRow label="Written Total" value="82 / 100 (Pass threshold: 60)" />
        <DetailRow label="Subject 1 — AI Fundamentals" value="44 / 50" />
        <DetailRow label="Subject 2 — AI Tools & Ethics" value="38 / 50" />
        <DetailRow label="Subject Min. Rule" value="Both subjects above 40% — OK" />
        <DetailRow label="Result Published" value="2026.03.20 (immediately after written)" />
      </Card>
      <Card>
        <CardHeader title="AXIS L2 · Session 1 · 2025.09.10" right={<Badge tone="orange">Partial Pass</Badge>} />
        <DetailRow label="Written" value="68/100 · Pass" />
        <DetailRow label="Practical" value="52/100 · Fail" />
        <DetailRow label="Practical Result Date" value="2025.09.24 (within 14 days after exam)" />
        <DetailRow label="Score Objection" value={<Btn>File Score Appeal</Btn>} />
      </Card>
    </>
  );
}

function PartialSection() {
  const { t } = useI18n();
  return (
    <>
      <SectionHeader title={t('sec.partial.title')} sub={t('sec.partial.sub')} />
      <NoticeBanner tone="orange">
        <strong>Active Exemption:</strong> AXIS L2 — Written section passed. You may take Practical only on your next attempt. Expires 2026.09.10.
      </NoticeBanner>
      <Card>
        <CardHeader
          title="AXIS L2 — Practical Exemption"
          right={<Badge tone="orange">Active · Expires 2026.09.10</Badge>}
        />
        <DetailRow label="Passed Section" value="Written (68/100)" />
        <DetailRow label="Remaining Exemptions" value="1 attempt left" />
        <DetailRow label="Next Attempt Scope" value="Practical section only (Written exempt)" />
        <DetailRow label="Validity" value="12 months from 2025.09.10 — expires 2026.09.10" />
        <div className="mt-2.5">
          <Btn variant="orange" className="w-full">
            Register for Partial Re-exam (Practical Only)
          </Btn>
        </div>
      </Card>
      <NoticeBanner>Partial pass applies to L2 and L1 only. L3 has no partial pass — written result is final.</NoticeBanner>
    </>
  );
}

function CertsSection() {
  const { t } = useI18n();
  return (
    <>
      <SectionHeader title={t('sec.certs.title')} sub={t('sec.certs.sub')} />
      <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-md p-3.5 flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-md bg-[#E6F1FB] text-[#185FA5] flex items-center justify-center text-lg font-medium flex-shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-[#0B1D3A]">AXIS L3 Starter</div>
            <div className="text-[11px] text-[#4B5563] break-words">
              Cert No: AXIS-2026-L3-002-0114 · Issued 2026.03.22 · Valid until 2029.03.22
            </div>
            <div className="text-[11px] text-[#4B5563] mt-0.5 break-words">
              Issuing org: AiNex Inc. · Renewal via exam or continuing education
            </div>
          </div>
        </div>
        <div className="flex flex-row sm:flex-col gap-1.5 sm:items-end flex-shrink-0 flex-wrap">
          <Btn variant="primary">PDF Download</Btn>
          <Btn variant="blue">Digital Badge</Btn>
          <Btn>Physical Copy</Btn>
        </div>
      </div>
      <Card>
        <CardHeader title="Certificate Contents" />
        <DetailRow label="Holder name" value="Kim Jiyeon" />
        <DetailRow label="Date of birth" value="1993.05.14" />
        <DetailRow label="Certification" value="AXIS L3 Starter (AI Practical Competency)" />
        <DetailRow label="Certificate number" value="AXIS-2026-L3-002-0114" />
        <DetailRow label="Issue date" value="2026.03.22" />
        <DetailRow label="Validity" value="3 years (until 2029.03.22)" />
      </Card>
      <NoticeBanner>Physical copy ships with separate shipping fee (TBD). Digital PDF and badge are free.</NoticeBanner>
    </>
  );
}

function InquirySection() {
  const { t } = useI18n();
  const Item = ({
    tone,
    status,
    title,
    date,
    body,
    reply,
    extra,
  }: {
    tone: BadgeTone;
    status: string;
    title: string;
    date: string;
    body: string;
    reply?: string;
    extra?: string;
  }) => (
    <div className="border-[0.5px] border-[#E2E8F0] rounded-md px-3.5 py-2.5 mb-2 bg-white">
      <div className="flex flex-wrap items-center gap-2 mb-1.5">
        <Badge tone={tone}>{status}</Badge>
        <span className="flex-1 min-w-[180px] text-[13px] font-medium text-[#0B1D3A] break-words">{title}</span>
        <span className="text-[11px] text-[#4B5563] flex-shrink-0">{date}</span>
      </div>
      <div className="text-xs text-[#4B5563] mb-1.5">{body}</div>
      {reply && (
        <div className="bg-[#F5F7FA] rounded p-2 text-xs text-[#4B5563] border-l-2 border-[#185FA5]">{reply}</div>
      )}
      {extra && <div className="text-[11px] text-[#4B5563] mt-1">{extra}</div>}
    </div>
  );

  return (
    <>
      <SectionHeader title={t('sec.inquiry.title')} sub={t('sec.inquiry.sub')} />
      <div className="flex justify-end mb-2.5">
        <Btn variant="primary">+ New Inquiry</Btn>
      </div>
      <Item
        tone="green"
        status="Replied"
        title="Can I cancel my L2 registration for a full refund?"
        date="2026.07.14"
        body="Category: Registration / Payment · My exam is on 2026.09.06. I registered on 07.10. Is a full refund available?"
        reply="Admin reply (2026.07.15): Refunds before D-10 of the exam date receive a full refund. Your exam is 09.06, so the full-refund deadline is 08.27. You are eligible for a full refund if cancelled before then."
      />
      <Item
        tone="orange"
        status="Awaiting Reply"
        title="Score objection — AXIS L2 Practical (Session 1)"
        date="2026.07.20"
        body="Category: Score / Results · I believe my practical deliverable score (52pts) is lower than expected based on the rubric. Requesting review with attached PDF."
        extra="Attachment: practical_submission_proof.pdf"
      />
      <Item
        tone="green"
        status="Replied"
        title="L1 eligibility — can I use AiNexEdu course completion?"
        date="2026.06.05"
        body="Category: Certification Guide · I completed the AiNex Edu L2 course. Does this qualify as an L1 eligibility document?"
        reply="Admin reply (2026.06.06): Yes — an AiNexEdu designated course completion certificate is an accepted L1 eligibility document. Please upload it during Step 3 of the registration flow."
      />
      <NoticeBanner>Inquiry categories: Registration · Payment · Score/Results · Certification · System/Technical · Other</NoticeBanner>
    </>
  );
}

function AlertsSection() {
  const { t } = useI18n();
  return (
    <>
      <SectionHeader title={t('sec.alerts.title')} sub={t('sec.alerts.sub')} />
      <Card>
        <CardHeader title="My Session Alerts" right={<Btn>+ Add Alert</Btn>} />
        <Row>
          <Badge tone="purple">On</Badge>
          <RowMain>AXIS-H L3 · Session 2 opens 2026.09.15</RowMain>
          <Btn variant="danger">Remove</Btn>
        </Row>
        <Row>
          <Badge tone="purple">On</Badge>
          <RowMain>AXIS-C L2 · Session 1 opens 2026.10.01</RowMain>
          <Btn variant="danger">Remove</Btn>
        </Row>
      </Card>
      <Card>
        <CardHeader title="System Notifications" />
        <Row>
          <Badge tone="green">New</Badge>
          <RowMain>AXIS L2 Session 1 results published — check Score Lookup</RowMain>
          <span className="text-[11px] text-[#4B5563] flex-shrink-0">07.20</span>
        </Row>
        <Row>
          <Badge tone="blue">Info</Badge>
          <RowMain>Your AXIS L3 exam voucher is ready to print (exam: 09.05)</RowMain>
          <span className="text-[11px] text-[#4B5563] flex-shrink-0">07.18</span>
        </Row>
        <Row>
          <Badge tone="gray">Read</Badge>
          <RowMain>Payment confirmed — AXIS L3 Session 1 registration complete</RowMain>
          <span className="text-[11px] text-[#4B5563] flex-shrink-0">07.01</span>
        </Row>
      </Card>
      <Card>
        <CardHeader title="Notification Settings" />
        <DetailRow label="Email alerts" value={<Btn variant="green">On</Btn>} />
        <DetailRow label="SMS alerts" value={<Btn>Off</Btn>} />
        <DetailRow label="Result announcements" value={<Btn variant="green">On</Btn>} />
        <DetailRow label="Marketing / promotions" value={<Btn>Off</Btn>} />
      </Card>
    </>
  );
}

function ProfileSection({ profile }: { profile: Profile | null }) {
  const { t } = useI18n();
  return (
    <>
      <SectionHeader title={t('sec.profile.title')} sub={t('sec.profile.sub')} />
      <Card>
        <CardHeader title="Personal Info" />
        <DetailRow
          label="Name"
          value={
            <>
              {profile?.name ?? '—'}{' '}
              <span className="text-[11px] text-[#4B5563] font-normal">(contact Support to change)</span>
            </>
          }
        />
        <DetailRow
          label="Date of birth"
          value={
            <>
              {profile?.birthDate ?? '1993.05.14'}{' '}
              <span className="text-[11px] text-[#4B5563] font-normal">(contact Support to change)</span>
            </>
          }
        />
        <DetailRow
          label="Email (ID)"
          value={
            <>
              {profile?.email ?? '—'} <Btn className="ml-2">Change</Btn>
            </>
          }
        />
        <DetailRow
          label="Phone"
          value={
            <>
              {profile?.phone ?? '010-****-5678'} <Btn className="ml-2">Change</Btn>
            </>
          }
        />
        <DetailRow label="Password" value={<Btn>Change Password</Btn>} />
      </Card>
      <Card>
        <CardHeader title="Linked Accounts" />
        <DetailRow
          label="Kakao"
          value={
            <>
              <Badge tone="gray">Not linked</Badge> <Btn className="ml-2">Link</Btn>
            </>
          }
        />
        <DetailRow
          label="Naver"
          value={
            <>
              <Badge tone="green">Linked</Badge> <Btn variant="danger" className="ml-2">Unlink</Btn>
            </>
          }
        />
        <DetailRow
          label="Google"
          value={
            <>
              <Badge tone="gray">Not linked</Badge> <Btn className="ml-2">Link</Btn>
            </>
          }
        />
      </Card>
      <Card>
        <CardHeader title="Danger Zone" />
        <p className="text-xs text-[#4B5563] py-1.5">
          All exam history, scores, and certificates will be permanently deleted. This action cannot be undone.
        </p>
        <div className="mt-2.5">
          <Btn variant="danger">Delete My Account</Btn>
        </div>
      </Card>
    </>
  );
}

// ---------- Sidebar ----------
type MenuGroup = {
  groupKey: 'sb.group.exam' | 'sb.group.results' | 'sb.group.support' | 'sb.group.account';
  items: { key: SectionKey; labelKey: 'sb.registrations' | 'sb.schedule' | 'sb.taken' | 'sb.demo' | 'sb.scores' | 'sb.partial' | 'sb.certs' | 'sb.inquiry' | 'sb.alerts' | 'sb.profile'; dot?: boolean }[];
};

const MENU: MenuGroup[] = [
  {
    groupKey: 'sb.group.exam',
    items: [
      { key: 'registrations', labelKey: 'sb.registrations' },
      { key: 'schedule', labelKey: 'sb.schedule' },
      { key: 'taken', labelKey: 'sb.taken' },
      { key: 'demo', labelKey: 'sb.demo' },
    ],
  },
  {
    groupKey: 'sb.group.results',
    items: [
      { key: 'scores', labelKey: 'sb.scores' },
      { key: 'partial', labelKey: 'sb.partial' },
      { key: 'certs', labelKey: 'sb.certs' },
    ],
  },
  {
    groupKey: 'sb.group.support',
    items: [
      { key: 'inquiry', labelKey: 'sb.inquiry', dot: true },
      { key: 'alerts', labelKey: 'sb.alerts' },
    ],
  },
  {
    groupKey: 'sb.group.account',
    items: [{ key: 'profile', labelKey: 'sb.profile' }],
  },
];

// ---------- Main Component ----------
export default function MyPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [section, setSection] = useState<SectionKey>('registrations');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on ESC, lock body scroll while open
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const currentLabel = (() => {
    for (const g of MENU) {
      const found = g.items.find((i) => i.key === section);
      if (found) return t(found.labelKey);
    }
    return '';
  })();

  const selectSection = (k: SectionKey) => {
    setSection(k);
    setDrawerOpen(false);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await userApi.getProfile();
        if (!cancelled) setProfile(res.data);
      } catch (err: any) {
        if (cancelled) return;
        if (err.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login', { replace: true });
          return;
        }
        setError(err.response?.data?.message || t('home.profileError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, t]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login', { replace: true });
  };

  const initials = profile?.name
    ? profile.name
        .replace(/\s+/g, '')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <div className="h-screen w-screen bg-[#F5F7FA] flex flex-col overflow-hidden">
      <header className="bg-primary text-white flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="md:hidden -ml-1 p-2 rounded hover:bg-white/10 transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <button onClick={() => navigate('/')} className="text-lg sm:text-xl font-extrabold tracking-tight flex-shrink-0">
              AXIS
            </button>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4 text-sm">
            <LangToggle />
            <span className="hidden sm:inline text-white font-semibold">{t('gnb.mypage')}</span>
            <button onClick={handleLogout} className="text-white/80 hover:text-white transition-colors">
              {t('gnb.logout')}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile breadcrumb bar — shows current section + hint */}
      <div className="md:hidden flex-shrink-0 bg-white border-b-[0.5px] border-[#E2E8F0] px-4 py-2.5 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-[10px] text-[#6B7280] tracking-wider">{t('gnb.mypage')}</div>
          <div className="text-[14px] font-medium text-[#0B1D3A] truncate">{currentLabel}</div>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="px-3 py-1.5 rounded text-[12px] bg-[#E6F1FB] text-[#185FA5] font-medium flex items-center gap-1.5 flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          Menu
        </button>
      </div>

      <main className="flex-1 min-h-0 w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-5 flex flex-col">
        {error && (
          <div role="alert" className="mb-3 p-3 rounded-lg bg-[#FCEBEB] border border-[#F7C1C1] text-[#A32D2D] text-sm flex-shrink-0">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row flex-1 min-h-0 border-[0.5px] border-[#E2E8F0] rounded-lg overflow-hidden bg-white">
          {/* Sidebar — desktop */}
          <aside className="w-[180px] lg:w-[220px] xl:w-[260px] 2xl:w-[280px] flex-shrink-0 bg-[#F5F7FA] border-r-[0.5px] border-[#E2E8F0] py-4 hidden md:block overflow-y-auto">
            <div className="px-4 pb-4 mb-2 border-b-[0.5px] border-[#E2E8F0]">
              <div className="w-9 h-9 rounded-full bg-[#185FA5] text-[#E6F1FB] flex items-center justify-center text-[13px] font-medium mb-2">
                {initials}
              </div>
              <div className="text-[13px] font-medium text-[#0B1D3A] truncate">
                {profile?.name ?? (loading ? '...' : 'Guest')}
              </div>
              <div className="text-[11px] text-[#4B5563] truncate">{profile?.email ?? '—'}</div>
            </div>

            {MENU.map((group) => (
              <div key={group.groupKey}>
                <div className="text-[10px] text-[#6B7280] px-4 pt-3 pb-1 tracking-wider">
                  {t(group.groupKey)}
                </div>
                {group.items.map((item) => {
                  const active = section === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => selectSection(item.key)}
                      className={`w-full text-left px-4 py-2.5 text-[13px] flex items-center gap-2 border-l-2 transition-colors ${
                        active
                          ? 'bg-white text-[#185FA5] border-[#185FA5] font-medium'
                          : 'text-[#4B5563] border-transparent hover:bg-white hover:text-[#0B1D3A]'
                      }`}
                    >
                      <span className="flex-1 truncate">{t(item.labelKey)}</span>
                      {item.dot && <span className="w-1.5 h-1.5 rounded-full bg-[#E24B4A]" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 min-h-0 p-4 sm:p-5 lg:p-6 xl:p-8 overflow-y-auto">
            {loading ? (
              <div className="text-sm text-[#4B5563]">{t('home.loading')}</div>
            ) : (
              <>
                {section === 'registrations' && <RegistrationsSection />}
                {section === 'schedule' && <ScheduleSection />}
                {section === 'taken' && <TakenSection />}
                {section === 'demo' && <DemoSection />}
                {section === 'scores' && <ScoresSection />}
                {section === 'partial' && <PartialSection />}
                {section === 'certs' && <CertsSection />}
                {section === 'inquiry' && <InquirySection />}
                {section === 'alerts' && <AlertsSection />}
                {section === 'profile' && <ProfileSection profile={profile} />}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-200 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!drawerOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setDrawerOpen(false)}
        />
        {/* Panel */}
        <aside
          role="dialog"
          aria-modal="true"
          className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-white shadow-xl flex flex-col transform transition-transform duration-250 ease-out ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between bg-primary text-white px-4 h-14 flex-shrink-0">
            <span className="font-extrabold tracking-tight">AXIS</span>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="p-2 -mr-2 rounded hover:bg-white/10 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="px-4 py-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#185FA5] text-[#E6F1FB] flex items-center justify-center text-[13px] font-medium flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-[#0B1D3A] truncate">
                {profile?.name ?? (loading ? '...' : 'Guest')}
              </div>
              <div className="text-[11px] text-[#4B5563] truncate">{profile?.email ?? '—'}</div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-2">
            {MENU.map((group) => (
              <div key={group.groupKey}>
                <div className="text-[10px] text-[#6B7280] px-4 pt-3 pb-1 tracking-wider">
                  {t(group.groupKey)}
                </div>
                {group.items.map((item) => {
                  const active = section === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => selectSection(item.key)}
                      className={`w-full text-left px-4 py-3 text-[14px] flex items-center gap-2 border-l-2 transition-colors ${
                        active
                          ? 'bg-[#E6F1FB] text-[#185FA5] border-[#185FA5] font-medium'
                          : 'text-[#4B5563] border-transparent active:bg-[#F5F7FA]'
                      }`}
                    >
                      <span className="flex-1 truncate">{t(item.labelKey)}</span>
                      {item.dot && <span className="w-1.5 h-1.5 rounded-full bg-[#E24B4A]" />}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9CA3AF]" aria-hidden>
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="border-t-[0.5px] border-[#E2E8F0] p-3 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 rounded text-[13px] bg-[#F5F7FA] text-[#4B5563] hover:bg-[#E2E8F0] transition-colors"
            >
              {t('gnb.logout')}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
