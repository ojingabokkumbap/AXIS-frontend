import axisGuideL3Pdf from '../../new design/uploads/examguide/AXIS_L3_수험가이드.pdf?url';
import axisGuideL2Pdf from '../../new design/uploads/examguide/AXIS_L2_수험가이드.pdf?url';
import axisGuideL1Pdf from '../../new design/uploads/examguide/AXIS_L1_수험가이드.pdf?url';
import axisCGuideL3Pdf from '../../new design/uploads/examguide/AXIS-C_L3_수험가이드.pdf?url';
import axisCGuideL2Pdf from '../../new design/uploads/examguide/AXIS-C_L2_수험가이드.pdf?url';
import axisCGuideL1Pdf from '../../new design/uploads/examguide/AXIS-C_L1_수험가이드.pdf?url';
import axisHGuideL3Pdf from '../../new design/uploads/examguide/AXIS-H_L3_수험가이드.pdf?url';
import axisHGuideL2Pdf from '../../new design/uploads/examguide/AXIS-H_L2_수험가이드.pdf?url';
import axisHGuideL1Pdf from '../../new design/uploads/examguide/AXIS-H_L1_수험가이드.pdf?url';
import axisExamInfoB2CPdf from '../../new design/uploads/brochure/AXIS_AI_실무역량검정_응시_안내_B2C.pdf?url';
import axisIntroB2BPdf from '../../new design/uploads/brochure/AXIS_실무역량검정_도입_제안_B2B.pdf?url';

export const INFO_PDF_MAP = {
  'axis-l3': { title: 'AXIS L3 수험 가이드', url: axisGuideL3Pdf, downloadName: 'AXIS_L3_수험가이드.pdf' },
  'axis-l2': { title: 'AXIS L2 수험 가이드', url: axisGuideL2Pdf, downloadName: 'AXIS_L2_수험가이드.pdf' },
  'axis-l1': { title: 'AXIS L1 수험 가이드', url: axisGuideL1Pdf, downloadName: 'AXIS_L1_수험가이드.pdf' },
  'axis-c-l3': { title: 'AXIS-C L3 수험 가이드', url: axisCGuideL3Pdf, downloadName: 'AXIS-C_L3_수험가이드.pdf' },
  'axis-c-l2': { title: 'AXIS-C L2 수험 가이드', url: axisCGuideL2Pdf, downloadName: 'AXIS-C_L2_수험가이드.pdf' },
  'axis-c-l1': { title: 'AXIS-C L1 수험 가이드', url: axisCGuideL1Pdf, downloadName: 'AXIS-C_L1_수험가이드.pdf' },
  'axis-h-l3': { title: 'AXIS-H L3 수험 가이드', url: axisHGuideL3Pdf, downloadName: 'AXIS-H_L3_수험가이드.pdf' },
  'axis-h-l2': { title: 'AXIS-H L2 수험 가이드', url: axisHGuideL2Pdf, downloadName: 'AXIS-H_L2_수험가이드.pdf' },
  'axis-h-l1': { title: 'AXIS-H L1 수험 가이드', url: axisHGuideL1Pdf, downloadName: 'AXIS-H_L1_수험가이드.pdf' },
  'axis-exam-info-b2c': {
    title: 'AXIS 응시안내',
    url: axisExamInfoB2CPdf,
    downloadName: 'AXIS_AI_실무역량검정_응시_안내_B2C.pdf',
  },
  'axis-intro-b2b': {
    title: 'AXIS 도입 제안서',
    url: axisIntroB2BPdf,
    downloadName: 'AXIS_실무역량검정_도입_제안_B2B.pdf',
  },
} as const;

export type InfoPdfId = keyof typeof INFO_PDF_MAP;
