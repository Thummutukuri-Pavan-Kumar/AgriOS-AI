# from pydantic import BaseModel, EmailStr
# from typing import Optional
# from app.models.user import UserRole

# class UserRegister(BaseModel):
#     full_name: str
#     email: EmailStr
#     phone: Optional[str] = None
#     password: str
#     role: UserRole = UserRole.farmer

# class UserLogin(BaseModel):
#     email: EmailStr
#     password: str

# class TokenResponse(BaseModel):
#     access_token: str
#     refresh_token: str
#     token_type: str = "bearer"

# class UserOut(BaseModel):
#     id: int
#     full_name: str
#     email: str
#     role: UserRole
#     is_active: bool

#     class Config:
#         from_attributes = True

from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.user import UserRole

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    role: UserRole = UserRole.farmer

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True