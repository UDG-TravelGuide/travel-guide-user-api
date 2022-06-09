export interface UserCreate {
    userName: string;
    email: string;
    password: string;
    birthDate: string;
}

export interface UserEdit {
    userName: string;
    password?: string;
    birthDate?: string;
    profilePhoto?: string;
}

export interface UserLogin {
    email: string;
    password: string;
}