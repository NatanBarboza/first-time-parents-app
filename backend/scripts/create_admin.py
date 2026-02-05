"""
Script para criar o primeiro usuário administrador
Execute: python scripts/create_admin.py
"""
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, User
from app.auth.auth import get_password_hash
import traceback
import sys
import os

# Adicionar o diretório pai ao path para imports funcionarem
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


def create_admin():
    # Criar tabelas se não existirem
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Verificar se já existe um admin
        existing_admin = db.query(User).filter(User.username == "admin").first()
        
        if existing_admin:
            print("❌ Usuário admin já existe!")
            print(f"   Email: {existing_admin.email}")
            print(f"   Username: {existing_admin.username}")
            return
        
        print("Gerando hash da senha...")
        password = "admin123"
        
        try:
            hashed_password = get_password_hash(password)
            print("✅ Hash gerado com sucesso!")
        except Exception as hash_error:
            print(f"❌ Erro ao gerar hash: {hash_error}")
            print("\nTentando método alternativo...")
            # Método alternativo direto
            from passlib.context import CryptContext
            pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
            password_bytes = password.encode('utf-8')[:72]
            password_truncated = password_bytes.decode('utf-8', errors='ignore')
            hashed_password = pwd_ctx.hash(password_truncated)
            print("✅ Hash gerado com método alternativo!")
        
        # Criar usuário admin
        print("\nCriando usuário no banco de dados...")
        admin = User(
            email="admin@exemplo.com",
            username="admin",
            full_name="Administrador",
            hashed_password=hashed_password,
            is_active=True,
            is_superuser=True
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print("\n✅ Usuário admin criado com sucesso!")
        print(f"   Email: {admin.email}")
        print(f"   Username: {admin.username}")
        print(f"   Senha: {password}")
        print("\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!")
        
    except Exception as e:
        print(f"\n❌ Erro ao criar admin: {e}")
        print("\nDetalhes do erro:")
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=== Criando Usuário Administrador ===\n")
    create_admin()
