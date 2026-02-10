"""
Adiciona a coluna estoque_minimo na tabela produtos (regra de estoque baixo).

Execute uma vez a partir da raiz do backend:
  python scripts/migrate_estoque_minimo.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database import engine


def run():
    with engine.connect() as conn:
        if engine.dialect.name == "postgresql":
            r = conn.execute(text("""
                SELECT column_name FROM information_schema.columns
                WHERE table_name = 'produtos' AND column_name = 'estoque_minimo'
            """))
            if r.fetchone():
                print("Coluna estoque_minimo já existe.")
                return
            conn.execute(text("ALTER TABLE produtos ADD COLUMN estoque_minimo INTEGER"))
            conn.commit()
            print("Coluna estoque_minimo adicionada.")
        else:
            try:
                conn.execute(text("ALTER TABLE produtos ADD COLUMN estoque_minimo INTEGER"))
                conn.commit()
                print("Coluna estoque_minimo adicionada.")
            except Exception as e:
                if "duplicate" in str(e).lower() or "already exists" in str(e).lower():
                    print("Coluna estoque_minimo já existe.")
                else:
                    raise


if __name__ == "__main__":
    run()
