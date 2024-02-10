export enum OrderStatus {
  MUST_BE_PAID = "รอการชำระเงิน",
  MUST_BE_SHIPPED = "รอการจัดส่ง",
  MUST_BE_RECEIVED = "รอการรับสินค้า",
  COMPLETED = "สำเร็จ",
  CANCELLED = "ยกเลิก",
  REFUNDED = "คืนเงิน",
}

export function OrderStatusTH(status: string) {
  if (status === "MUST_BE_PAID") {
    return OrderStatus.MUST_BE_PAID;
  }
  if (status === "MUST_BE_SHIPPED") {
    return OrderStatus.MUST_BE_SHIPPED;
  }
  if (status === "MUST_BE_RECEIVED") {
    return OrderStatus.MUST_BE_RECEIVED;
  }
  if (status === "COMPLETED") {
    return OrderStatus.COMPLETED;
  }
  if (status === "CANCELLED") {
    return OrderStatus.CANCELLED;
  }
  if (status === "REFUNDED") {
    return OrderStatus.REFUNDED;
  }
}

export function chipStatusColor(status: string) {
  if (status === "MUST_BE_PAID") {
    return "default";
  }
  if (status === "MUST_BE_SHIPPED") {
    return "primary";
  }
  if (status === "MUST_BE_RECEIVED") {
    return "secondary";
  }
  if (status === "COMPLETED") {
    return "success";
  }
  if (status === "CANCELLED") {
    return "danger";
  }
  if (status === "REFUNDED") {
    return "danger";
  }
}
