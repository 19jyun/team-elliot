import { validate } from 'class-validator';
import { UpdateBankAccountDto } from '../update-bank-account.dto';

describe('UpdateBankAccountDto', () => {
  it('should be defined', () => {
    expect(new UpdateBankAccountDto()).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = new UpdateBankAccountDto();
      dto.bankName = '신한은행';
      dto.accountNumber = '123-456-789012';
      dto.accountHolder = '김강사';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with partial data (only bankName)', async () => {
      const dto = new UpdateBankAccountDto();
      dto.bankName = '국민은행';
      // accountNumber and accountHolder are not set (optional)

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with partial data (only accountNumber)', async () => {
      const dto = new UpdateBankAccountDto();
      dto.accountNumber = '987-654-321098';
      // bankName and accountHolder are not set (optional)

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with partial data (only accountHolder)', async () => {
      const dto = new UpdateBankAccountDto();
      dto.accountHolder = '박강사';
      // bankName and accountNumber are not set (optional)

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with empty object (all fields optional)', async () => {
      const dto = new UpdateBankAccountDto();
      // No fields are set

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when bankName is not a string', async () => {
      const dto = new UpdateBankAccountDto();
      dto.bankName = 123 as any;
      dto.accountNumber = '123-456-789012';
      dto.accountHolder = '김강사';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isString).toBeDefined();
    });

    it('should fail validation when accountNumber is not a string', async () => {
      const dto = new UpdateBankAccountDto();
      dto.bankName = '신한은행';
      dto.accountNumber = 123 as any;
      dto.accountHolder = '김강사';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isString).toBeDefined();
    });

    it('should fail validation when accountHolder is not a string', async () => {
      const dto = new UpdateBankAccountDto();
      dto.bankName = '신한은행';
      dto.accountNumber = '123-456-789012';
      dto.accountHolder = 123 as any;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isString).toBeDefined();
    });

    it('should pass validation with empty string values (optional fields)', async () => {
      const dto = new UpdateBankAccountDto();
      dto.bankName = '';
      dto.accountNumber = '';
      dto.accountHolder = '';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle mixed valid and invalid data', async () => {
      const dto = new UpdateBankAccountDto();
      dto.bankName = '신한은행'; // valid
      dto.accountNumber = 123 as any; // invalid
      dto.accountHolder = '김강사'; // valid

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isString).toBeDefined();
    });
  });
});
