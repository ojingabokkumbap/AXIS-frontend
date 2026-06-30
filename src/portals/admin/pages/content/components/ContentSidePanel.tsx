import { Drawer } from '@admin/components/shared/ui-kit';

export function ContentSidePanel({
  open,
  onClose,
  title,
  footer,
  children,
  width = 520,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  width?: number;
}) {
  return (
    <Drawer open={open} onClose={onClose} title={title} width={width} footer={footer}>
      <div className="space-y-4">{children}</div>
    </Drawer>
  );
}
