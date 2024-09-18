import bcrypt from "bcrypt";

const hashPassword = (password: string): string => {
    return bcrypt.hashSync(password, 10);
};

const comparePassword = (password: string, hash: string): boolean => {
    return bcrypt.compareSync(password, hash);
};

export const hashing = {
    hashPassword,
    comparePassword,
};
