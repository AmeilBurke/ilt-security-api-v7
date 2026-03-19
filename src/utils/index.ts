import { BadRequestException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { Request } from 'express';

export const hashPassword = async (
  unencryptedPassword: string,
): Promise<string> => {
  return await bcrypt.hash(unencryptedPassword, 10);
};

export const checkPassword = async (
  unencryptedPassword: string,
  hashedString: string,
): Promise<boolean> => {
  return await bcrypt.compare(unencryptedPassword, hashedString);
};

export const getBaseUrl = (req: Request) => {
  return `${req.protocol}://${req.get('host')}`;
};

export const imageFileValidator = (file: { fieldname?: string; originalname?: string; encoding?: string; mimetype: any; size?: number; destination?: string; filename?: string; path?: string; buffer?: Buffer<ArrayBufferLike>; }, callback: { (error: Error | null, acceptFile: boolean): void; (arg0: BadRequestException | null, arg1: boolean): void; }) => {
  if (
    file &&
    (file.mimetype === 'image/png' ||
      file.mimetype === 'image/webp' ||
      file.mimetype === 'image/jpeg')
  ) {
    callback(null, true);
  } else {
    callback(
      new BadRequestException('File given is not a png, webp or jpeg'),
      false,
    );
  }
}
