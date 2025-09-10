import {
  formatTime,
  formatDate,
  formatTimeRange,
  formatDateDisplay,
} from "@/utils/dateTime";

describe("dateTime utils", () => {
  describe("formatTime", () => {
    it("should format time in 24-hour format by default", () => {
      const date = new Date("2024-01-15T14:30:00+09:00");
      const result = formatTime(date);
      expect(result).toBe("14:30");
    });

    it("should format time in 12-hour format when hour12 is true", () => {
      const date = new Date("2024-01-15T14:30:00+09:00");
      const result = formatTime(date, { hour12: true });
      expect(result).toBe("오후 02:30");
    });

    it("should include seconds when showSeconds is true", () => {
      const date = new Date("2024-01-15T14:30:45+09:00");
      const result = formatTime(date, { showSeconds: true });
      expect(result).toBe("14:30:45");
    });

    it("should handle string input", () => {
      const result = formatTime("2024-01-15T14:30:00+09:00");
      expect(result).toBe("14:30");
    });

    it("should handle midnight correctly", () => {
      // 한국 시간대를 명시적으로 설정하여 테스트
      const date = new Date("2024-01-15T00:00:00+09:00");
      const result = formatTime(date);
      expect(result).toBe("00:00");
    });
  });

  describe("formatDate", () => {
    it("should format date in short format by default", () => {
      const date = new Date("2024-01-15");
      const result = formatDate(date);
      expect(result).toBe("1월 15일");
    });

    it("should include year when includeYear is true", () => {
      const date = new Date("2024-01-15");
      const result = formatDate(date, { includeYear: true });
      expect(result).toBe("2024년 1월 15일");
    });

    it("should include weekday when includeWeekday is true", () => {
      const date = new Date("2024-01-15"); // Monday
      const result = formatDate(date, { includeWeekday: true });
      expect(result).toBe("1월 15일 (월)");
    });

    it("should format in numeric format", () => {
      const date = new Date("2024-01-15");
      const result = formatDate(date, { format: "numeric" });
      expect(result).toBe("1. 15.");
    });

    it("should format in long format", () => {
      const date = new Date("2024-01-15");
      const result = formatDate(date, { format: "long" });
      expect(result).toBe("1월 15일");
    });

    it("should handle string input", () => {
      const result = formatDate("2024-01-15");
      expect(result).toBe("1월 15일");
    });
  });

  describe("formatTimeRange", () => {
    it("should format time range correctly", () => {
      const startTime = new Date("2024-01-15T14:30:00+09:00");
      const endTime = new Date("2024-01-15T16:00:00+09:00");
      const result = formatTimeRange(startTime, endTime);
      expect(result).toBe("14:30-16:00");
    });

    it("should format time range with 12-hour format", () => {
      const startTime = new Date("2024-01-15T14:30:00+09:00");
      const endTime = new Date("2024-01-15T16:00:00+09:00");
      const result = formatTimeRange(startTime, endTime, { hour12: true });
      expect(result).toBe("오후 02:30-오후 04:00");
    });
  });

  describe("formatDateDisplay", () => {
    it("should format date display correctly", () => {
      const result = formatDateDisplay("2024-01-15");
      expect(result).toBe("1월 15일");
    });

    it("should handle different months", () => {
      const result = formatDateDisplay("2024-12-25");
      expect(result).toBe("12월 25일");
    });
  });
});
