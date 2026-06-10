import "server-only";

import { renderToBuffer } from "@react-pdf/renderer";

import { OrderPdfDocument } from "@/features/admin-orders/components/order-pdf-document";
import { prisma } from "@/server/db/prisma";
import type { OrderWithRelations } from "@/server/orders/order.repository";

const DEFAULT_LOGO_URL = "https://pub-cc734373dc1544418e5ba00681e8514f.r2.dev/media/logotipo.jpg";

export async function renderOrderPdfBuffer(order: OrderWithRelations) {
  const paymentMethod = order.paymentMethodId
    ? await prisma.paymentMethod.findUnique({
        where: { id: order.paymentMethodId },
        select: { instructions: true },
      })
    : null;

  return renderToBuffer(
    <OrderPdfDocument
      order={order}
      logoUrl={DEFAULT_LOGO_URL}
      paymentInstructions={paymentMethod?.instructions ?? null}
    />,
  );
}
