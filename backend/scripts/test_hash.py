"""
Script de teste para verificar se o hash de senha está funcionando
"""
from passlib.context import CryptContext

# Configuração do contexto
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12
)

def test_password_hash():
    password = "admin123"
    
    print("=== Teste de Hash de Senha ===\n")
    print(f"Senha original: {password}")
    print(f"Tamanho em bytes: {len(password.encode('utf-8'))}")
    
    try:
        # Tentar criar hash
        print("\nGerando hash...")
        hashed = pwd_context.hash(password)
        print(f"✅ Hash gerado com sucesso!")
        print(f"Hash: {hashed[:50]}...")
        
        # Tentar verificar
        print("\nVerificando senha...")
        is_valid = pwd_context.verify(password, hashed)
        print(f"✅ Verificação: {'OK' if is_valid else 'FALHOU'}")
        
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        print(f"Tipo do erro: {type(e).__name__}")
        
        # Tentar com truncamento manual
        print("\n--- Tentando com truncamento manual ---")
        try:
            password_truncated = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
            hashed = pwd_context.hash(password_truncated)
            print(f"✅ Hash gerado com sucesso após truncamento!")
            is_valid = pwd_context.verify(password_truncated, hashed)
            print(f"✅ Verificação: {'OK' if is_valid else 'FALHOU'}")
        except Exception as e2:
            print(f"❌ Ainda com erro: {e2}")

if __name__ == "__main__":
    test_password_hash()
