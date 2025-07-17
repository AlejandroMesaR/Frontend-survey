
export interface LoginResponse {
  access_token: string
  token_type: string
  role: string
}

export interface DecodeToken {
  sub: string
  role: string
  exp: number
}