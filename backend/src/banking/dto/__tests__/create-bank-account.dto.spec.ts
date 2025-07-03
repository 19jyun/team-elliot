import { validate } from 'class-validator';
import { CreateBankAccountDto } from '../create-bank-account.dto';

describe('CreateBankAccountDto', () => {
  it('should be defined', () => {
    expect(new CreateBankAccountDto()).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = new CreateBankAccountDto();
      dto.bankName = '신한은행';
      dto.accountNumber = '123-456-789012';
      dto.accountHolder = '김강사';
      dto.teacherId = 1;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when bankName is empty', async () => {
      const dto = new CreateBankAccountDto();
      dto.bankName = '';
      dto.accountNumber = '123-456-789012';
      dto.accountHolder = '김강사';
      dto.teacherId = 1;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation when accountNumber is empty', async () => {
      const dto = new CreateBankAccountDto();
      dto.bankName = '신한은행';
      dto.accountNumber = '';
      dto.accountHolder = '김강사';
      dto.teacherId = 1;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation when accountHolder is empty', async () => {
      const dto = new CreateBankAccountDto();
      dto.bankName = '신한은행';
      dto.accountNumber = '123-456-789012';
      dto.accountHolder = '';
      dto.teacherId = 1;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation when teacherId is missing', async () => {
      const dto = new CreateBankAccountDto();
      dto.bankName = '신한은행';
      dto.accountNumber = '123-456-789012';
      dto.accountHolder = '김강사';
      // teacherId is not set

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation when bankName is not a string', async () => {
      const dto = new CreateBankAccountDto();
      dto.bankName = 123 as any;
      dto.accountNumber = '123-456-789012';
      dto.accountHolder = '김강사';
      dto.teacherId = 1;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isString).toBeDefined();
    });

    it('should fail validation when accountNumber is not a string', async () => {
      const dto = new CreateBankAccountDto();
      dto.bankName = '신한은행';
      dto.accountNumber = 123 as any;
      dto.accountHolder = '김강사';
      dto.teacherId = 1;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isString).toBeDefined();
    });

    it('should fail validation when accountHolder is not a string', async () => {
      const dto = new CreateBankAccountDto();
      dto.bankName = '신한은행';
      dto.accountNumber = '123-456-789012';
      dto.accountHolder = 123 as any;
      dto.teacherId = 1;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isString).toBeDefined();
    });
  });
});
