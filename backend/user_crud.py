from sqlalchemy.orm import Session
from typing import Optional
from models import User
from auth_schemas import UserCreate, UserUpdate
from auth import get_password_hash

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Busca usuário por email"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Busca usuário por username"""
    return db.query(User).filter(User.username == username).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Busca usuário por ID"""
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user: UserCreate) -> User:
    """Cria um novo usuário"""
    # Verificar se email já existe
    if get_user_by_email(db, user.email):
        raise ValueError("Email já cadastrado")
    
    # Verificar se username já existe
    if get_user_by_username(db, user.username):
        raise ValueError("Nome de usuário já cadastrado")
    
    # Criar usuário
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
    """Atualiza um usuário"""
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Se está atualizando a senha, fazer hash
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    # Verificar se email já existe (se estiver mudando)
    if "email" in update_data and update_data["email"] != db_user.email:
        if get_user_by_email(db, update_data["email"]):
            raise ValueError("Email já cadastrado")
    
    # Verificar se username já existe (se estiver mudando)
    if "username" in update_data and update_data["username"] != db_user.username:
        if get_user_by_username(db, update_data["username"]):
            raise ValueError("Nome de usuário já cadastrado")
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> bool:
    """Deleta um usuário"""
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return False
    
    db.delete(db_user)
    db.commit()
    return True
