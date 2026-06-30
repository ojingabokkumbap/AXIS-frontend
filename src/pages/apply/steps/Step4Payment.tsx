import { isApplyKcpDemo } from '@/pages/apply/lib/applyKcpDemo';
import { Step4KcpPayment } from './Step4KcpPayment';
import Step4PortOneVirtualAccount from './Step4PortOneVirtualAccount';

export default function Step4Payment() {
  if (isApplyKcpDemo()) {
    return <Step4KcpPayment />;
  }
  return <Step4PortOneVirtualAccount />;
}
