import bcrypt from 'bcrypt';

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