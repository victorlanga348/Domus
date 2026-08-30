export interface CreateUserDTO {
  name: string;
  email: string;
  password_hash: string;
  pin_hash: string;
  house_id: string;
  vacation_mode?: boolean;
}

export interface ToggleVacationDTO {
  vacation_mode: boolean;
}
