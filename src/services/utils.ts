import { jwtDecode } from "jwt-decode";
import type { DecodeToken } from "../models/token"; 

export async function decodeToken(token: string): Promise<DecodeToken | null> {
  try {
    const decoded = jwtDecode<DecodeToken>(token);
    return decoded;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
}
