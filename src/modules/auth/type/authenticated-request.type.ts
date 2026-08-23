import { AuthenticatedUser } from "./authenticated-user.type";

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}