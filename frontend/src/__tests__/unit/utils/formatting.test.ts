import {
  formatCurrency,
  getDayOfWeekText,
  getLevelText,
  getLevelColor,
  getStatusText,
  getStatusColor,
} from "@/utils/formatting";

describe("formatting utils", () => {
  describe("formatCurrency", () => {
    it("should format positive numbers correctly", () => {
      expect(formatCurrency(1000)).toBe("1,000원");
      expect(formatCurrency(1000000)).toBe("1,000,000원");
      expect(formatCurrency(1234567)).toBe("1,234,567원");
    });

    it("should format zero correctly", () => {
      expect(formatCurrency(0)).toBe("0원");
    });

    it("should format negative numbers correctly", () => {
      expect(formatCurrency(-1000)).toBe("-1,000원");
      expect(formatCurrency(-1000000)).toBe("-1,000,000원");
    });

    it("should handle decimal numbers", () => {
      expect(formatCurrency(1000.5)).toBe("1,000.5원");
    });
  });

  describe("getDayOfWeekText", () => {
    it("should convert English day names to Korean", () => {
      expect(getDayOfWeekText("MONDAY")).toBe("월");
      expect(getDayOfWeekText("TUESDAY")).toBe("화");
      expect(getDayOfWeekText("WEDNESDAY")).toBe("수");
      expect(getDayOfWeekText("THURSDAY")).toBe("목");
      expect(getDayOfWeekText("FRIDAY")).toBe("금");
      expect(getDayOfWeekText("SATURDAY")).toBe("토");
      expect(getDayOfWeekText("SUNDAY")).toBe("일");
    });

    it("should return original string for unknown day names", () => {
      expect(getDayOfWeekText("UNKNOWN")).toBe("UNKNOWN");
      expect(getDayOfWeekText("")).toBe("");
    });

    it("should handle case sensitivity", () => {
      expect(getDayOfWeekText("monday")).toBe("monday");
      expect(getDayOfWeekText("Monday")).toBe("Monday");
    });
  });

  describe("getLevelText", () => {
    it("should convert English level names to Korean", () => {
      expect(getLevelText("BEGINNER")).toBe("초급");
      expect(getLevelText("INTERMEDIATE")).toBe("중급");
      expect(getLevelText("ADVANCED")).toBe("고급");
    });

    it("should return original string for unknown level names", () => {
      expect(getLevelText("UNKNOWN")).toBe("UNKNOWN");
      expect(getLevelText("")).toBe("");
    });

    it("should handle case sensitivity", () => {
      expect(getLevelText("beginner")).toBe("beginner");
      expect(getLevelText("Beginner")).toBe("Beginner");
    });
  });

  describe("getLevelColor", () => {
    it("should return correct colors for known levels", () => {
      expect(getLevelColor("BEGINNER")).toBe("#F4E7E7");
      expect(getLevelColor("INTERMEDIATE")).toBe("#FBF4D8");
      expect(getLevelColor("ADVANCED")).toBe("#CBDFE3");
    });

    it("should return default color for unknown levels", () => {
      expect(getLevelColor("UNKNOWN")).toBe("#F8F5E9");
      expect(getLevelColor("")).toBe("#F8F5E9");
    });
  });

  describe("getStatusText", () => {
    it("should convert English status names to Korean", () => {
      expect(getStatusText("PENDING")).toBe("대기");
      expect(getStatusText("CONFIRMED")).toBe("확정");
      expect(getStatusText("CANCELLED")).toBe("취소");
      expect(getStatusText("ATTENDED")).toBe("출석");
      expect(getStatusText("ABSENT")).toBe("결석");
      expect(getStatusText("COMPLETED")).toBe("완료");
    });

    it("should return original string for unknown status names", () => {
      expect(getStatusText("UNKNOWN")).toBe("UNKNOWN");
      expect(getStatusText("")).toBe("");
    });
  });

  describe("getStatusColor", () => {
    it("should return correct colors for known statuses", () => {
      expect(getStatusColor("PENDING")).toBe("text-yellow-600 bg-yellow-100");
      expect(getStatusColor("CONFIRMED")).toBe("text-green-600 bg-green-100");
      expect(getStatusColor("CANCELLED")).toBe("text-red-600 bg-red-100");
      expect(getStatusColor("ATTENDED")).toBe("text-blue-600 bg-blue-100");
      expect(getStatusColor("ABSENT")).toBe("text-gray-600 bg-gray-100");
      expect(getStatusColor("COMPLETED")).toBe("text-purple-600 bg-purple-100");
    });

    it("should return default color for unknown statuses", () => {
      expect(getStatusColor("UNKNOWN")).toBe("text-gray-600 bg-gray-100");
      expect(getStatusColor("")).toBe("text-gray-600 bg-gray-100");
    });
  });
});
