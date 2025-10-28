export interface SignInDto {
    email: string;
    password: string;
}

export interface InitialSetupDto {
    userId: number; 
    nickname: string;
    intro: string; 
}