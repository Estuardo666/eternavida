import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { OrderWithRelations } from "@/server/orders/order.repository";

const STATUS_LABELS = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  processing: "En proceso",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
} as const;

const PAYMENT_STATUS_LABELS = {
  pending: "Pendiente",
  paid: "Pagado",
  failed: "Fallido",
  refunded: "Reembolsado",
  partially_refunded: "Reembolso parcial",
} as const;

const STATUS_COLORS = {
  pending: "#7a6830",
  confirmed: "#2f6d44",
  processing: "#8b5a1e",
  shipped: "#2d5fa7",
  delivered: "#1f6a4d",
  cancelled: "#c0392b",
  refunded: "#6f46b6",
} as const;

const currencyFormatter = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-EC", {
  dateStyle: "medium",
  timeStyle: "short",
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 34,
    paddingHorizontal: 30,
    fontSize: 10,
    color: "#2D2D2D",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#D9D2C5",
    paddingBottom: 16,
    marginBottom: 18,
  },
  logo: {
    width: 108,
    height: 32,
    objectFit: "contain",
  },
  companyBlock: {
    width: 220,
    alignItems: "flex-end",
    gap: 2,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#2D2D2D",
  },
  muted: {
    color: "#6B6B6B",
  },
  sectionGrid: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
  },
  panel: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#D9D2C5",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#FAF8F3",
  },
  panelTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
    color: "#2D2D2D",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 6,
  },
  rowLabel: {
    color: "#6B6B6B",
    width: "42%",
  },
  rowValue: {
    flexGrow: 1,
    textAlign: "right",
    color: "#2D2D2D",
  },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 9,
    fontWeight: 700,
    marginTop: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: "#D9D2C5",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 14,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E8F2EA",
    borderBottomWidth: 1,
    borderBottomColor: "#D9D2C5",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#D9D2C5",
  },
  tableRowAlt: {
    backgroundColor: "#FAF8F3",
  },
  colProduct: {
    width: "34%",
  },
  colBrand: {
    width: "18%",
  },
  colPrice: {
    width: "16%",
    textAlign: "right",
  },
  colQty: {
    width: "12%",
    textAlign: "right",
  },
  colSubtotal: {
    width: "20%",
    textAlign: "right",
  },
  totalsCard: {
    marginLeft: "auto",
    width: 220,
    borderWidth: 1,
    borderColor: "#D9D2C5",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#FAF8F3",
    marginBottom: 14,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  totalStrong: {
    fontWeight: 700,
    color: "#2D2D2D",
  },
  footer: {
    position: "absolute",
    left: 30,
    right: 30,
    bottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#D9D2C5",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    color: "#6B6B6B",
    fontSize: 9,
  },
});

function formatCurrency(value: string | number) {
  return currencyFormatter.format(Number(value));
}

function buildStatusPill(order: OrderWithRelations) {
  return {
    label: STATUS_LABELS[order.status],
    color: STATUS_COLORS[order.status],
  };
}

export interface OrderPdfDocumentProps {
  order: OrderWithRelations;
  logoUrl: string;
  paymentInstructions?: string | null;
}

export function OrderPdfDocument(props: OrderPdfDocumentProps) {
  const { order, logoUrl, paymentInstructions } = props;
  const statusPill = buildStatusPill(order);

  return (
    <Document title={`Pedido ${order.orderNumber}`} author="Eterna Vida">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Image src={logoUrl} style={styles.logo} />
          </View>
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>Eterna Vida</Text>
            <Text style={styles.muted}>Dermocosmetica y cuidado especializado</Text>
            <Text style={styles.muted}>Quito, Ecuador</Text>
            <Text style={styles.muted}>+593 0 000 0000</Text>
            <Text style={styles.muted}>eternavida.com.ec</Text>
          </View>
        </View>

        <View style={styles.sectionGrid}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Cliente</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Nombre</Text>
              <Text style={styles.rowValue}>{`${order.firstName} ${order.lastName}`}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Email</Text>
              <Text style={styles.rowValue}>{order.guestEmail ?? "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Telefono</Text>
              <Text style={styles.rowValue}>{order.phone}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Cedula / RUC</Text>
              <Text style={styles.rowValue}>{order.idNumber ?? "-"}</Text>
            </View>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Pedido</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Numero</Text>
              <Text style={styles.rowValue}>{order.orderNumber}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Fecha</Text>
              <Text style={styles.rowValue}>{dateFormatter.format(order.createdAt)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Estado</Text>
              <Text style={styles.rowValue}>{STATUS_LABELS[order.status]}</Text>
            </View>
            <Text
              style={{
                ...styles.statusPill,
                color: statusPill.color,
                backgroundColor: `${statusPill.color}1A`,
              }}
            >
              {statusPill.label}
            </Text>
            <View style={{ ...styles.row, marginTop: 8, marginBottom: 0 }}>
              <Text style={styles.rowLabel}>Pago</Text>
              <Text style={styles.rowValue}>{PAYMENT_STATUS_LABELS[order.paymentStatus]}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colProduct}>Producto</Text>
            <Text style={styles.colBrand}>Marca</Text>
            <Text style={styles.colPrice}>Precio unit.</Text>
            <Text style={styles.colQty}>Cant.</Text>
            <Text style={styles.colSubtotal}>Subtotal</Text>
          </View>
          {order.items.map((item, index) => {
            const unitPrice = item.discountPrice ?? item.price;
            const subtotal = Number(unitPrice) * item.quantity;

            return (
              <View
                key={item.id}
                style={[
                  styles.tableRow,
                  ...(index % 2 === 1 ? [styles.tableRowAlt] : []),
                ]}
              >
                <Text style={styles.colProduct}>{item.name}</Text>
                <Text style={styles.colBrand}>{item.brand}</Text>
                <Text style={styles.colPrice}>{formatCurrency(String(unitPrice))}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colSubtotal}>{formatCurrency(subtotal)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(order.subtotal.toString())}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Envio</Text>
            <Text>{formatCurrency(order.shippingCost.toString())}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Descuento</Text>
            <Text>{formatCurrency(order.discountAmount.toString())}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Impuestos</Text>
            <Text>{formatCurrency(order.taxAmount.toString())}</Text>
          </View>
          <View style={{ ...styles.totalRow, paddingTop: 6, borderTopWidth: 1, borderTopColor: "#D9D2C5" }}>
            <Text style={styles.totalStrong}>Total</Text>
            <Text style={styles.totalStrong}>{formatCurrency(order.total.toString())}</Text>
          </View>
        </View>

        <View style={styles.sectionGrid}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Envio</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Metodo</Text>
              <Text style={styles.rowValue}>{order.shippingMethodName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Direccion</Text>
              <Text style={styles.rowValue}>
                {[order.address, order.apartment, order.city, order.province].filter(Boolean).join(", ")}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Tracking</Text>
              <Text style={styles.rowValue}>{order.trackingNumber ?? "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>URL tracking</Text>
              <Text style={styles.rowValue}>{order.trackingUrl ?? "-"}</Text>
            </View>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Pago</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Metodo</Text>
              <Text style={styles.rowValue}>{order.paymentMethodName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Estado</Text>
              <Text style={styles.rowValue}>{PAYMENT_STATUS_LABELS[order.paymentStatus]}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Instrucciones</Text>
              <Text style={styles.rowValue}>{paymentInstructions ?? "-"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Gracias por tu compra - Eterna Vida</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
