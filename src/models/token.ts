
export interface LoginResponse {
  access_token: string
  token_type: string
  role: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role?: string
}

export interface RegisterResponse {
  message: string
  user_id: string
}

export interface DecodeToken {
  sub: string
  role: string
  exp: number
}